import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, changePassword } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function AdminProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const saveProfile = async () => {
    await updateProfile({ name, email });
    setMessage("اطلاعات پروفایل ذخیره شد.");
  };

  const savePassword = async () => {
    await changePassword({ currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setMessage("رمز عبور با موفقیت تغییر کرد.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-label-primary">پروفایل ادمین</h1>
        <p className="mt-2 text-sm text-label-secondary">مشاهده و مدیریت اطلاعات حساب، امنیت و آخرین ورود</p>
      </div>
      {message && <div className="rounded-ios bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">{message}</div>}
      <div className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-5 space-y-4"><h2 className="font-semibold text-label-primary">اطلاعات پروفایل</h2><div className="grid gap-4 md:grid-cols-2"><div className="space-y-1.5"><Label>نام نمایشی</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div><div className="space-y-1.5"><Label>ایمیل</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" /></div></div><div className="text-sm text-label-secondary">آخرین ورود: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("fa-IR") : "نامشخص"}</div><Button onClick={saveProfile}>ذخیره پروفایل</Button></div>
      <div className="rounded-ios border border-separator/30 bg-bg-secondary/60 p-5 space-y-4"><h2 className="font-semibold text-label-primary">تغییر رمز عبور</h2><div className="grid gap-4 md:grid-cols-2"><div className="space-y-1.5"><Label>رمز عبور فعلی</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div><div className="space-y-1.5"><Label>رمز عبور جدید</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div></div><Button onClick={savePassword}>ذخیره رمز جدید</Button></div>
    </div>
  );
}
