import { useEffect, useState } from "react";
import { fetchContactMessages, updateContactMessage } from "@/lib/api";
import type { ContactMessage } from "@/types";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => fetchContactMessages().then((res) => setMessages(res.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: ContactMessage["status"]) => {
    const res = await updateContactMessage(id, status);
    setMessages((prev) => prev.map((item) => item.id === id ? res.data : item));
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-label-primary">پیام‌های کاربران</h1>
      {loading ? <Skeleton className="h-48" /> : <div className="space-y-4">{messages.map((item) => <div key={item.id} className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-sm text-label-secondary">#{item.id} • {item.category} • {new Date(item.createdAt).toLocaleString("fa-IR")}</div><p className="mt-2 whitespace-pre-wrap text-label-primary">{item.message}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => updateStatus(item.id, "reviewed")}>بررسی شد</Button><Button variant="outline" onClick={() => updateStatus(item.id, "answered")}>پاسخ داده شد</Button><Button variant="outline" onClick={() => updateStatus(item.id, "archived")}>بایگانی</Button></div></div></div>)}{messages.length === 0 && <p className="text-sm text-label-secondary">فعلاً پیامی ثبت نشده است.</p>}</div>}
    </div>
  );
}
