import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchTags, createTag, updateTag, deleteTag } from "@/lib/api";
import type { Tag } from "@/types";

export function AdminSecondaryTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); fetchTags().then((r) => setTags(r.data.filter((tag) => tag.kind !== "system"))).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const reset = () => { setEditing(null); setName(""); setSlug(""); };
  const edit = (tag: Tag) => { setEditing(tag); setName(tag.name); setSlug(tag.slug); };
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setError(null); setSaving(true); try { const body = { name, slug, kind: "secondary" as const }; if (editing) await updateTag(editing.id, body); else await createTag(body); reset(); load(); } catch (err: any) { setError(err.message); } finally { setSaving(false); } };
  const del = async (id: number) => { if (!confirm("آیا از حذف این تگ فرعی اطمینان دارید؟")) return; try { await deleteTag(id); load(); } catch (err: any) { setError(err.message); } };

  return (
    <div><h1 className="mb-6 text-2xl font-bold text-label-primary">مدیریت تگ‌های فرعی</h1>
      {error && <div className="mb-4 flex items-center gap-2 rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"><AlertCircle className="h-4 w-4" />{error}</div>}
      <form onSubmit={submit} className="mb-8 rounded-ios border border-separator/30 bg-bg-secondary/60 p-5"><div className="grid gap-4 md:grid-cols-2"><div className="space-y-1.5"><Label>نام تگ</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div><div className="space-y-1.5"><Label>اسلاگ</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" /></div></div><div className="mt-4 flex items-center gap-2"><Button type="submit" disabled={saving} className="gap-2"><Plus className="h-4 w-4" />{editing ? "ذخیره تغییرات" : "ایجاد تگ"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>انصراف</Button>}</div></form>
      {loading ? <Skeleton className="h-64" /> : <div className="overflow-hidden rounded-ios border border-separator/30 bg-bg-secondary/60"><table className="w-full text-right text-sm"><thead className="bg-fill-quaternary text-label-secondary"><tr><th className="px-4 py-3">تگ</th><th className="px-4 py-3">اسلاگ</th><th className="px-4 py-3 text-left">عملیات</th></tr></thead><tbody>{tags.map(tag => <tr key={tag.id} className="border-t border-separator/20"><td className="px-4 py-3 font-medium text-label-primary">{tag.name}</td><td className="px-4 py-3 text-label-secondary">{tag.slug}</td><td className="px-4 py-3"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => edit(tag)} aria-label="edit"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => del(tag.id)} aria-label="delete"><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}</tbody></table></div>}
    </div>
  );
}
