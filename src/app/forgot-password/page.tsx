"use client";

import { useState } from "react";
import SigninService from "@/service/signin_service";
import Link from "next/link";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("⚠️ กรุณากรอกอีเมล");
      return;
    }
    const res = await SigninService.forgotPassword({ email });
    console.log(res);
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage: "url('/images/blog/G1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md rounded-md bg-[#05173300] p-8 shadow-lg">
        <div className="w-full px-4">
          <h3 className="mb-3 text-center text-6xl font-semibold text-black sm:text-lg ">
            ลืมรหัสผ่าน
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label
                htmlFor="username"
                className="text-dark mb-3 block text-2xl font-semibold"
              >
                Email <span className="text-red-500 ">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="กรอก Email ผู้ใช้งาน"
                className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                required
              />
            </div>
            <div className="mb-6">
              <button
                type="submit"
                className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300"
              >
                ดำเนินการ
              </button>
              <p className="mt-6 text-center text-sm text-gray-800">
                มีบัญชีอยู่แล้ว?{" "}
                <Link href="/signin" className="text-blue-600 hover:underline">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
