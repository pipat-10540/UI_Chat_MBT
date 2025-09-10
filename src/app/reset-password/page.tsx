"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import SigninService from "@/service/signin_service";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("user");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      alert("⚠️ กรุณากรอกรหัสผ่านใหม่");
      return;
    }

    if (!confirmPassword) {
      alert("⚠️ กรุณายืนยันรหัสผ่านใหม่");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("⚠️ รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    const res = await SigninService.resetPassword({ userId, newPassword });
    if (!res.success) alert("✅ รีเซ็ตรหัสผ่านสำเร็จ");
    router.push("/signin"); // ✅ ไปหน้า login
  };

  return (
    <section className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three dark:bg-dark mx-auto max-w-[500px] rounded-sm bg-white px-6 pt-0 pb-0 sm:px-[40px] sm:pt-[1px] sm:pb-[1px]">
              {/* Logo */}
              <div className="-mb-36 flex justify-center">
                <Image
                  src="/images/logo/2.png"
                  alt="logo"
                  width={350}
                  height={140}
                  unoptimized
                  className="h-auto w-auto max-w-[350px]"
                />
              </div>

              <h3 className="-mb-6 text-center text-base font-semibold text-black sm:text-lg dark:text-white">
                ตั้งรหัสผ่านใหม่
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <label
                    htmlFor="newPassword"
                    className="text-dark mb-3 block text-sm dark:text-white"
                  >
                    รหัสผ่านใหม่ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่"
                    className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                    required
                  />
                </div>

                <div className="mb-8">
                  <label
                    htmlFor="confirmPassword"
                    className="text-dark mb-3 block text-sm dark:text-white"
                  >
                    ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                    required
                  />
                </div>

                <div className="mb-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "กำลังดำเนินการ..." : "ยืนยันรีเซ็ตรหัสผ่าน"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordPage;
