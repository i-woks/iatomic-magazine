interface Env {
  XENO_KV: KVNamespace;
  XENO_ADMIN_PASSWORD?: string;
  XENO_BRAND?: string;
  XENO_DEFAULT_HOST?: string;
}

type Protocol = 'vless' | 'vmess' | 'trojan' | 'shadowsocks';
type Transport = 'ws' | 'grpc' | 'tcp';
type Security = 'tls' | 'reality' | 'none';

interface XenoConfig {
  id: string;
  name: string;
  protocol: Protocol;
  server: string;
  port: number;
  uuid: string;
  password: string;
  method: string;
  security: Security;
  transport: Transport;
  path: string;
  host: string;
  sni: string;
  flow: string;
  serviceName: string;
  publicKey: string;
  shortId: string;
  fingerprint: string;
  alpn: string;
  allowInsecure: boolean;
  enabled: boolean;
  expiresAt: string | null;
  dataLimitGb: number | null;
  createdAt: string;
  updatedAt: string;
}

const CONFIGS_KEY = 'xeno:configs';
const SETTINGS_KEY = 'xeno:settings';
const SESS_PREFIX = 'xeno:sess:';
const SESSION_COOKIE = 'xeno_session';
const SESSION_TTL = 60 * 60 * 24 * 7;
const SUB_TOKEN_KEY = 'xeno:subtoken';

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
  });
}
function html(body: string, init: ResponseInit = {}) {
  return new Response(body, { ...init, headers: { 'content-type': 'text/html; charset=utf-8', ...(init.headers || {}) } });
}
function text(body: string, init: ResponseInit = {}) {
  return new Response(body, { ...init, headers: { 'content-type': 'text/plain; charset=utf-8', ...(init.headers || {}) } });
}
function b64(s: string) { return btoa(unescape(encodeURIComponent(s))); }
function ub64(s: string) { return btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
function uuid() { return crypto.randomUUID(); }
async function sha256(s: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function getCookie(req: Request, name: string) {
  const raw = req.headers.get('cookie') || '';
  return raw.split(';').map(x => x.trim()).find(x => x.startsWith(name + '='))?.split('=').slice(1).join('=') || '';
}
async function readConfigs(env: Env): Promise<XenoConfig[]> {
  return (await env.XENO_KV.get<XenoConfig[]>(CONFIGS_KEY, 'json')) || [];
}
async function writeConfigs(env: Env, configs: XenoConfig[]) {
  await env.XENO_KV.put(CONFIGS_KEY, JSON.stringify(configs));
}
async function ensureSubToken(env: Env) {
  let t = await env.XENO_KV.get(SUB_TOKEN_KEY);
  if (!t) { t = ub64(crypto.randomUUID() + crypto.randomUUID()).slice(0, 36); await env.XENO_KV.put(SUB_TOKEN_KEY, t); }
  return t;
}
async function authed(req: Request, env: Env) {
  const token = getCookie(req, SESSION_COOKIE);
  if (!token) return false;
  const hash = await sha256(token);
  return !!(await env.XENO_KV.get(SESS_PREFIX + hash));
}
async function requireAuth(req: Request, env: Env) {
  if (!(await authed(req, env))) return json({ error: 'Unauthorized' }, { status: 401 });
  return null;
}
function now() { return new Date().toISOString(); }
function defaultConfig(env: Env): XenoConfig {
  const u = uuid();
  return {
    id: uuid(), name: 'XENO-' + Math.random().toString(36).slice(2, 7).toUpperCase(), protocol: 'vless',
    server: env.XENO_DEFAULT_HOST || 'example.com', port: 443, uuid: u, password: u, method: 'chacha20-ietf-poly1305',
    security: 'tls', transport: 'ws', path: '/xeno-' + u.slice(0, 8), host: env.XENO_DEFAULT_HOST || 'example.com', sni: env.XENO_DEFAULT_HOST || 'example.com',
    flow: '', serviceName: 'xeno', publicKey: '', shortId: '', fingerprint: 'chrome', alpn: 'h2,http/1.1', allowInsecure: false,
    enabled: true, expiresAt: null, dataLimitGb: null, createdAt: now(), updatedAt: now()
  };
}
function q(v: Record<string, string | number | boolean | null | undefined>) {
  const p = new URLSearchParams();
  for (const [k, val] of Object.entries(v)) if (val !== undefined && val !== null && val !== '') p.set(k, String(val));
  return p.toString();
}
function configLink(c: XenoConfig) {
  const tag = encodeURIComponent(c.name);
  if (c.protocol === 'vless') {
    const params = q({ encryption: 'none', security: c.security, type: c.transport, host: c.host, path: c.transport === 'ws' ? c.path : '', serviceName: c.transport === 'grpc' ? c.serviceName : '', sni: c.sni, flow: c.flow, fp: c.fingerprint, alpn: c.alpn, pbk: c.publicKey, sid: c.shortId, allowInsecure: c.allowInsecure ? 1 : undefined });
    return `vless://${c.uuid}@${c.server}:${c.port}?${params}#${tag}`;
  }
  if (c.protocol === 'vmess') {
    return 'vmess://' + b64(JSON.stringify({ v: '2', ps: c.name, add: c.server, port: String(c.port), id: c.uuid, aid: '0', scy: 'auto', net: c.transport, type: 'none', host: c.host, path: c.path, tls: c.security === 'tls' ? 'tls' : '', sni: c.sni }));
  }
  if (c.protocol === 'trojan') {
    const params = q({ security: c.security, type: c.transport, host: c.host, path: c.path, sni: c.sni, serviceName: c.serviceName, fp: c.fingerprint, allowInsecure: c.allowInsecure ? 1 : undefined });
    return `trojan://${encodeURIComponent(c.password)}@${c.server}:${c.port}?${params}#${tag}`;
  }
  const user = b64(`${c.method}:${c.password}`);
  return `ss://${user}@${c.server}:${c.port}#${tag}`;
}
function clashYaml(configs: XenoConfig[]) {
  const proxies = configs.filter(c => c.enabled).map(c => {
    const common = `  - name: "${c.name}"
    server: ${c.server}
    port: ${c.port}`;
    if (c.protocol === 'vless') return `${common}
    type: vless
    uuid: ${c.uuid}
    tls: ${c.security !== 'none'}
    servername: ${c.sni || c.host || c.server}
    network: ${c.transport}
    ws-opts:
      path: ${c.path || '/'}
      headers:
        Host: ${c.host || c.server}`;
    if (c.protocol === 'trojan') return `${common}
    type: trojan
    password: ${c.password}
    sni: ${c.sni || c.server}
    network: ${c.transport}`;
    if (c.protocol === 'shadowsocks') return `${common}
    type: ss
    cipher: ${c.method}
    password: ${c.password}`;
    return `${common}
    type: vmess
    uuid: ${c.uuid}
    alterId: 0
    cipher: auto
    tls: ${c.security === 'tls'}
    network: ${c.transport}`;
  }).join('\n');
  const names = configs.filter(c => c.enabled).map(c => `      - "${c.name}"`).join('\n');
  return `mixed-port: 7890
allow-lan: false
mode: rule
log-level: info
proxies:
${proxies}
proxy-groups:
  - name: XENO
    type: select
    proxies:
${names || '      - DIRECT'}
rules:
  - MATCH,XENO
`;
}
function singbox(configs: XenoConfig[]) {
  const outbounds = configs.filter(c => c.enabled).map(c => {
    const base: any = { type: c.protocol === 'shadowsocks' ? 'shadowsocks' : c.protocol, tag: c.name, server: c.server, server_port: c.port };
    if (c.protocol === 'vless' || c.protocol === 'vmess') base.uuid = c.uuid;
    if (c.protocol === 'trojan') base.password = c.password;
    if (c.protocol === 'shadowsocks') { base.method = c.method; base.password = c.password; }
    if (c.security !== 'none' && c.protocol !== 'shadowsocks') base.tls = { enabled: true, server_name: c.sni || c.server, insecure: c.allowInsecure };
    if (c.transport === 'ws') base.transport = { type: 'ws', path: c.path || '/', headers: { Host: c.host || c.server } };
    if (c.transport === 'grpc') base.transport = { type: 'grpc', service_name: c.serviceName || 'xeno' };
    return base;
  });
  return JSON.stringify({ log: { level: 'info' }, outbounds: [...outbounds, { type: 'direct', tag: 'direct' }], route: { final: outbounds[0]?.tag || 'direct' } }, null, 2);
}

const panel = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>XENO Panel</title><style>
@font-face{font-family:Karixby;src:url('https://iatomic-magazine.pages.dev/fonts/Karixby.otf')}@font-face{font-family:IRANSansX;src:url('https://iatomic-magazine.pages.dev/fonts/iransansx/IRANSansX-Regular.woff2')}*{box-sizing:border-box}body{margin:0;font-family:IRANSansX,system-ui;background:radial-gradient(circle at 20% 0,#112446 0,transparent 34%),radial-gradient(circle at 80% 20%,#0b684022 0,transparent 28%),#070b10;color:#eaf2ff}button,input,select{font:inherit}.wrap{min-height:100vh;display:grid;grid-template-columns:280px 1fr}.side{border-left:1px solid #ffffff16;background:#0b111bcc;padding:24px;position:sticky;top:0;height:100vh}.brand{font-family:Karixby,IRANSansX;font-size:34px;letter-spacing:.22em;color:#00a8ff;text-shadow:0 0 32px #00a8ff55}.sub{color:#90a4b8;font-size:12px}.nav{margin-top:28px;display:grid;gap:10px}.nav button{border:1px solid #ffffff14;background:#ffffff08;color:#cfe8ff;border-radius:16px;padding:12px;text-align:right;cursor:pointer}.nav button.active{border-color:#00a8ff66;background:#00a8ff18;color:#fff}.main{padding:26px;max-width:1320px;width:100%;margin:auto}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-bottom:22px}.title h1{margin:0;font-size:28px}.title p{margin:4px 0 0;color:#8fa3b9}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.card{border:1px solid #ffffff14;background:linear-gradient(180deg,#101927ee,#0b111bee);border-radius:22px;padding:18px;box-shadow:0 20px 60px #0005}.metric{display:flex;align-items:center;gap:12px}.ico{width:42px;height:42px;border-radius:15px;display:grid;place-items:center;background:#00a8ff18;color:#00a8ff}.metric b{font-size:24px}.metric span{display:block;color:#8fa3b9;font-size:12px}.panel{margin-top:16px}.toolbar{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}.btn{border:0;background:#00a8ff;color:#00111f;border-radius:14px;padding:10px 14px;font-weight:800;cursor:pointer}.btn.secondary{background:#ffffff10;color:#eaf2ff;border:1px solid #ffffff18}.btn.danger{background:#e71c1c;color:#fff}.list{display:grid;gap:12px}.item{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;border:1px solid #ffffff12;background:#ffffff08;border-radius:18px;padding:14px}.item h3{margin:0 0 5px}.chips{display:flex;gap:6px;flex-wrap:wrap}.chip{font-size:11px;border:1px solid #ffffff16;background:#ffffff0c;border-radius:999px;padding:4px 8px;color:#b9c7d8}.actions{display:flex;gap:8px;flex-wrap:wrap}.form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.field{display:grid;gap:6px}.field label{font-size:12px;color:#9fb1c8}.field input,.field select{border:1px solid #ffffff18;background:#06101c;color:#fff;border-radius:14px;padding:10px}.field.full{grid-column:1/-1}.output{direction:ltr;text-align:left;white-space:pre-wrap;word-break:break-all;background:#02070d;border:1px solid #ffffff16;border-radius:16px;padding:14px;color:#b5f7df;max-height:360px;overflow:auto}.hide{display:none}.login{min-height:100vh;display:grid;place-items:center;padding:20px}.login .box{width:min(420px,100%)}.hint{font-size:12px;color:#8fa3b9;line-height:1.8}.qr{width:140px;height:140px;border-radius:14px;background:#fff;padding:8px}@media(max-width:900px){.wrap{grid-template-columns:1fr}.side{position:static;height:auto}.grid,.form{grid-template-columns:1fr}.item{grid-template-columns:1fr}.top{display:block}}
</style></head><body><div id="app"></div><script>
const app=document.getElementById('app');const $=s=>document.querySelector(s);const api=(p,o={})=>fetch(p,{credentials:'include',headers:{'content-type':'application/json'},...o}).then(async r=>{if(!r.ok)throw new Error((await r.json().catch(()=>({error:r.statusText}))).error);return r.json()});let configs=[],subToken='';
function loginView(){app.innerHTML='<div class="login"><div class="box card"><div class="brand">XENO</div><p class="sub">Atomic-grade Cloudflare Worker config panel</p><div class="field" style="margin-top:22px"><label>رمز عبور ادمین</label><input id="pass" type="password" placeholder="••••••••"></div><button class="btn" style="width:100%;margin-top:14px" onclick="login()">ورود به پنل</button><p class="hint">این پنل فقط برای مدیریت زیرساخت‌های مجاز خودتان طراحی شده است.</p></div></div>'}
async function login(){await api('/api/login',{method:'POST',body:JSON.stringify({password:$('#pass').value})});load()}
function shell(){app.innerHTML='<div class="wrap"><aside class="side"><div class="brand">XENO</div><p class="sub">config forge / subscription studio</p><div class="nav"><button class="active" onclick="dash()">داشبورد</button><button onclick="newCfg()">ساخت کانفیگ</button><button onclick="subs()">سابسکریپشن</button><button onclick="settings()">تنظیمات</button><button onclick="logout()">خروج</button></div></aside><main class="main"><div id="view"></div></main></div>'}
async function load(){try{await api('/api/me');shell();await refresh();dash()}catch(e){loginView()}}
async function refresh(){let r=await api('/api/configs');configs=r.data;subToken=r.subToken}
function dash(){view.innerHTML='<div class="top"><div class="title"><h1>داشبورد XENO</h1><p>مدیریت کانفیگ، خروجی‌ها و اشتراک‌ها</p></div><button class="btn" onclick="newCfg()">+ کانفیگ جدید</button></div><div class="grid"><div class="card metric"><div class="ico">Σ</div><div><b>'+configs.length+'</b><span>کل کانفیگ‌ها</span></div></div><div class="card metric"><div class="ico">✓</div><div><b>'+configs.filter(x=>x.enabled).length+'</b><span>فعال</span></div></div><div class="card metric"><div class="ico">WS</div><div><b>'+configs.filter(x=>x.transport==='ws').length+'</b><span>WebSocket</span></div></div><div class="card metric"><div class="ico">TLS</div><div><b>'+configs.filter(x=>x.security!=='none').length+'</b><span>امنیت</span></div></div></div><section class="card panel"><div class="toolbar"><button class="btn secondary" onclick="copyAll()">کپی همه لینک‌ها</button><button class="btn secondary" onclick="exportClash()">Clash</button><button class="btn secondary" onclick="exportSingbox()">Sing-box</button></div><div class="list">'+configs.map(item).join('')+'</div></section>'}
function item(c){return '<div class="item"><div><h3>'+c.name+'</h3><div class="chips"><span class="chip">'+c.protocol.toUpperCase()+'</span><span class="chip">'+c.server+':'+c.port+'</span><span class="chip">'+c.transport+'</span><span class="chip">'+c.security+'</span><span class="chip">'+(c.enabled?'فعال':'غیرفعال')+'</span></div></div><div class="actions"><button class="btn secondary" onclick="showLink(&quot;'+c.id+'&quot;)">لینک</button><button class="btn secondary" onclick="editCfg(&quot;'+c.id+'&quot;)">ویرایش</button><button class="btn danger" onclick="delCfg(&quot;'+c.id+'&quot;)">حذف</button></div></div>'}
function form(c={}){view.innerHTML='<div class="top"><div class="title"><h1>'+(c.id?'ویرایش':'ساخت')+' کانفیگ</h1><p>VLESS / VMess / Trojan / Shadowsocks</p></div></div><section class="card"><div class="form">'+field('name','نام',c.name||'')+sel('protocol','پروتکل',c.protocol||'vless',['vless','vmess','trojan','shadowsocks'])+field('server','سرور/دامنه',c.server||'')+field('port','پورت',c.port||443,'number')+field('uuid','UUID',c.uuid||crypto.randomUUID())+field('password','Password',c.password||crypto.randomUUID())+field('method','SS Method',c.method||'chacha20-ietf-poly1305')+sel('security','Security',c.security||'tls',['tls','reality','none'])+sel('transport','Transport',c.transport||'ws',['ws','grpc','tcp'])+field('path','WS Path',c.path||'/xeno')+field('host','Host Header',c.host||'')+field('sni','SNI',c.sni||'')+field('serviceName','gRPC service',c.serviceName||'xeno')+field('publicKey','Reality public key',c.publicKey||'')+field('shortId','Reality short id',c.shortId||'')+field('fingerprint','Fingerprint',c.fingerprint||'chrome')+field('alpn','ALPN',c.alpn||'h2,http/1.1')+field('expiresAt','انقضا',c.expiresAt||'','datetime-local')+field('dataLimitGb','حجم GB',c.dataLimitGb||'','number')+'<div class="field"><label>وضعیت</label><select id="enabled"><option value="true">فعال</option><option value="false">غیرفعال</option></select></div></div><div class="toolbar" style="margin-top:16px"><button class="btn" onclick="saveCfg(&quot;'+(c.id||'')+'&quot;)">ذخیره</button><button class="btn secondary" onclick="dash()">بازگشت</button></div></section>'; if(c.enabled===false) $('#enabled').value='false'}
function field(id,l,v,t='text'){return '<div class="field"><label>'+l+'</label><input id="'+id+'" type="'+t+'" value="'+String(v||'').replaceAll('"','&quot;')+'"></div>'}function sel(id,l,v,a){return '<div class="field"><label>'+l+'</label><select id="'+id+'">'+a.map(x=>'<option '+(x===v?'selected':'')+'>'+x+'</option>').join('')+'</select></div>'}
function newCfg(){form({server:'example.com',host:'example.com',sni:'example.com'})}function editCfg(id){form(configs.find(x=>x.id===id))}
async function saveCfg(id){const ids=['name','protocol','server','port','uuid','password','method','security','transport','path','host','sni','serviceName','publicKey','shortId','fingerprint','alpn','expiresAt','dataLimitGb','enabled'];let o={};ids.forEach(k=>o[k]=$('#'+k).value);o.port=+o.port;o.dataLimitGb=o.dataLimitGb?+o.dataLimitGb:null;o.expiresAt=o.expiresAt||null;o.enabled=o.enabled==='true';await api('/api/configs'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(o)});await refresh();dash()}
async function delCfg(id){if(confirm('حذف شود؟')){await api('/api/configs/'+id,{method:'DELETE'});await refresh();dash()}}
async function showLink(id){let r=await api('/api/configs/'+id+'/link');view.innerHTML='<section class="card"><h2>لینک کانفیگ</h2><div class="output" id="out">'+r.link+'</div><div class="toolbar"><button class="btn" onclick="navigator.clipboard.writeText(out.textContent)">کپی</button><img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data='+encodeURIComponent(r.link)+'"><button class="btn secondary" onclick="dash()">بازگشت</button></div></section>'}
async function copyAll(){let r=await api('/api/export?format=links');navigator.clipboard.writeText(r.text);alert('کپی شد')}async function exportClash(){let r=await api('/api/export?format=clash');view.innerHTML='<section class="card"><h2>Clash Meta</h2><pre class="output">'+r.text+'</pre><button id="copyOut" class="btn">کپی</button></section>';document.getElementById('copyOut').onclick=()=>navigator.clipboard.writeText(document.querySelector('.output').textContent)}async function exportSingbox(){let r=await api('/api/export?format=singbox');view.innerHTML='<section class="card"><h2>Sing-box</h2><pre class="output">'+r.text+'</pre><button id="copyOut" class="btn">کپی</button></section>';document.getElementById('copyOut').onclick=()=>navigator.clipboard.writeText(document.querySelector('.output').textContent)}
function subs(){let u=location.origin+'/sub/'+subToken;view.innerHTML='<section class="card"><h2>لینک سابسکریپشن</h2><p class="hint">این لینک فقط کانفیگ‌های فعال را خروجی می‌دهد.</p><div class="output">'+u+'</div><div class="toolbar"><button class="btn" onclick="navigator.clipboard.writeText(&quot;'+u+'&quot;)">کپی لینک</button><a class="btn secondary" href="'+u+'" target="_blank">باز کردن</a></div></section>'}
function settings(){view.innerHTML='<section class="card"><h2>تنظیمات</h2><p class="hint">نسخه MVP روی KV ذخیره می‌شود. برای تغییر رمز، Secret با نام XENO_ADMIN_PASSWORD را در Worker تغییر بده.</p></section>'}
async function logout(){await api('/api/logout',{method:'POST'});loginView()}load();
</script></body></html>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS', 'access-control-allow-headers': 'content-type' } });
    try {
      if (url.pathname === '/health') return json({ ok: true, name: 'XENO', time: now() });
      if (url.pathname === '/' || url.pathname === '/panel') return html(panel);
      if (url.pathname === '/api/me') return (await authed(req, env)) ? json({ ok: true }) : json({ error: 'Unauthorized' }, { status: 401 });
      if (url.pathname === '/api/login' && req.method === 'POST') {
        const { password } = await req.json<any>().catch(() => ({}));
        if (!env.XENO_ADMIN_PASSWORD || password !== env.XENO_ADMIN_PASSWORD) return json({ error: 'Invalid password' }, { status: 401 });
        const token = ub64(crypto.randomUUID() + crypto.randomUUID());
        await env.XENO_KV.put(SESS_PREFIX + await sha256(token), '1', { expirationTtl: SESSION_TTL });
        return json({ ok: true }, { headers: { 'set-cookie': `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL}` } });
      }
      if (url.pathname === '/api/logout') {
        const token = getCookie(req, SESSION_COOKIE); if (token) await env.XENO_KV.delete(SESS_PREFIX + await sha256(token));
        return json({ ok: true }, { headers: { 'set-cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
      }
      const subMatch = url.pathname.match(/^\/sub\/([^/]+)$/);
      if (subMatch) {
        const expected = await ensureSubToken(env);
        if (subMatch[1] !== expected) return text('not found', { status: 404 });
        const links = (await readConfigs(env)).filter(c => c.enabled).map(configLink).join('\n');
        return text(btoa(links), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
      }
      if (url.pathname.startsWith('/api/')) {
        const no = await requireAuth(req, env); if (no) return no;
        if (url.pathname === '/api/configs' && req.method === 'GET') return json({ data: await readConfigs(env), subToken: await ensureSubToken(env) });
        if (url.pathname === '/api/configs' && req.method === 'POST') {
          const body = await req.json<any>(); const configs = await readConfigs(env);
          const c = { ...defaultConfig(env), ...body, id: uuid(), createdAt: now(), updatedAt: now() } as XenoConfig;
          configs.unshift(c); await writeConfigs(env, configs); return json({ data: c }, { status: 201 });
        }
        const m = url.pathname.match(/^\/api\/configs\/([^/]+)(?:\/(link))?$/);
        if (m) {
          const configs = await readConfigs(env); const idx = configs.findIndex(c => c.id === m[1]);
          if (idx < 0) return json({ error: 'Not found' }, { status: 404 });
          if (m[2] === 'link') return json({ link: configLink(configs[idx]) });
          if (req.method === 'PUT') { configs[idx] = { ...configs[idx], ...(await req.json<any>()), id: configs[idx].id, updatedAt: now() }; await writeConfigs(env, configs); return json({ data: configs[idx] }); }
          if (req.method === 'DELETE') { const [removed] = configs.splice(idx, 1); await writeConfigs(env, configs); return json({ data: removed }); }
        }
        if (url.pathname === '/api/export') {
          const configs = await readConfigs(env); const f = url.searchParams.get('format') || 'links';
          if (f === 'clash') return json({ text: clashYaml(configs) });
          if (f === 'singbox') return json({ text: singbox(configs) });
          return json({ text: configs.filter(c => c.enabled).map(configLink).join('\n') });
        }
      }
      return json({ error: 'Not found' }, { status: 404 });
    } catch (e: any) {
      return json({ error: e?.message || 'Internal error' }, { status: 500 });
    }
  }
};
