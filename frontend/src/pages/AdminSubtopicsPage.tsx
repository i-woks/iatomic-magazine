import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchSubtopics, createSubtopic, updateSubtopic, deleteSubtopic, fetchCategories } from "@/lib/api";
import type { Subtopic, Category } from "@/types";

export function AdminSubtopicsPage() {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Subtopic | null>(null);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🔹");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); Promise.all([fetchSubtopics(), fetchCategories()]).then(([s, c]) => { setSubtopics(s.data); setCategories(c.data); }).catch((err) => setError(err.message)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const reset = () => { setEditing(null); setCategoryId(""); setName(""); setSlug(""); setDescription(""); setIcon("🔹"); setSortOrder(0); };
  const edit = (item: Subtopic) => { setEditing(item); setCategoryId(item.categoryId); setName(item.name); setSlug(item.slug); setDescription(item.description || ""); setIcon(item.icon || "🔹"); setSortOrder(item.sortOrder); };
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setError(null); setSaving(true); try { const body = { categoryId: Number(categoryId), name, slug, description, icon, sortOrder }; if (editing) await updateSubtopic(editing.id, body); else await createSubtopic(body); reset(); load(); } catch (err: any) { setError(err.message); } finally { setSaving(false); } };
  const del = async (id: number) => { if (!confirm("آیا از حذف این زیرشاخه اطمینان دارید؟")) return; try { await deleteSubtopic(id); load(); } catch (err: any) { setError(err.message); } };
  const categoryMap = useMemo(() => new Map(categories.map((item) => [item.id, item.name])), [categories]);

  return (
    <div><h1 className="mb-6 text-2xl font-bold text-label-primary">مدیریت زیرشاخه‌ها</h1>
      {error && <div className="mb-4 flex items-center gap-2 rounded-ios bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300"><AlertCircle className="h-4 w-4" />{error}</div>}
      <form onSubmit={submit} className="mb-8 rounded-ios border border-separator/30 bg-bg-secondary/60 p-5">
        <div className="grid gap-4 md:grid-cols-2"><div className="space-y-1.5"><Label>تاپیک مادر</Label><Select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}><option value="">انتخاب کنید</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></div><div className="space-y-1.5"><Label>نام زیرشاخه</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div><div className="space-y-1.5"><Label>اسلاگ</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} dir="ltr" /></div><div className="space-y-1.5"><Label>آیکن</Label><Input value={icon} onChange={(e) => setIcon(e.target.value)} /></div><div className="space-y-1.5 md:col-span-2"><Label>توضیحات</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-20" /></div><div className="space-y-1.5"><Label>ترتیب</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div></div>
        <div className="mt-4 flex items-center gap-2"><Button type="submit" disabled={saving} className="gap-2"><Plus className="h-4 w-4" />{editing ? "ذخیره تغییرات" : "ایجاد زیرشاخه"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>انصراف</Button>}</div>
      </form>
      {loading ? <Skeleton className="h-64" /> : <div className="overflow-hidden rounded-ios border border-separator/30 bg-bg-secondary/60"><table className="w-full text-right text-sm"><thead className="bg-fill-quaternary text-label-secondary"><tr><th className="px-4 py-3">زیرشاخه</th><th className="px-4 py-3">تاپیک مادر</th><th className="px-4 py-3">مقالات</th><th className="px-4 py-3 text-left">عملیات</th></tr></thead><tbody>{subtopics.map(item => <tr key={item.id} className="border-t border-separator/20"><td className="px-4 py-3 font-medium text-label-primary"><span className="ml-2">{item.icon || "🔹"}</span>{item.name}</td><td className="px-4 py-3 text-label-secondary">{categoryMap.get(item.categoryId) || "—"}</td><td className="px-4 py-3 text-label-tertiary">{item.articleCount || 0}</td><td className="px-4 py-3"><div className="flex items-center justify-end gap-2"><Button variant="ghost" size="icon" className="rounded-full" onClick={() => edit(item)} aria-label="edit"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => del(item.id)} aria-label="delete"><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}</tbody></table></div>}
    </div>
  );
}
