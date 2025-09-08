"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SigninService from "@/service/signin_service";
const Hero = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", ticket: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  console.log("handleChange", handleChange);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleLogin submit payload:", form);
    try {
      const result = await SigninService.login(form);
      console.log("result", result);
      if (result && result.success) {
        // route for app dir: src/app/chatpage/page.tsx -> /chatpage
        router.push("/chatpage");
      } else {
        setForm((prev) => ({ ...prev, ticket: "" }));
      }
    } catch (err) {
      console.log("Login failed in page", err);
    }
  };
  console.log("handleLogin", handleLogin);
  return (
    <>
      {/* 🔽 พื้นหลัง */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/blog/G1.jpg"
          alt="background"
          className="h-full w-full object-cover opacity-20"
        />
      </div>

      {/* 🔽 เนื้อหาแบ่ง 2 ฝั่ง */}
      <div className="relative z-10 flex min-h-screen items-center justify-center text-center">
        <div className="mt-30 items-center">
          {/* ✅ เพิ่ม mt-10 ให้ขยับลงมา */}
          <h1 className="mb-5 text-3xl leading-tight font-bold text-black sm:text-4xl md:text-5xl dark:text-white">
            Tissue
          </h1>
          <p className="text-body-color dark:text-body-color-dark mb-8 text-base leading-relaxed sm:text-lg md:text-xl">
            เชื่อมต่อตัวเรากับ family World
          </p>
          <form onSubmit={handleLogin}>
            <div className="mb-8">
              <label className="text-dark mb-3 block text-sm dark:text-white">
                อีเมล_email
              </label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="กรอกเบอร์มือถือ/อีเมล"
                className="border-stroke text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base dark:border-transparent dark:bg-[#2C303B] dark:text-white"
                required
              />
            </div>
            <div className="mb-8">
              <label className="text-dark mb-3 block text-sm dark:text-white">
                รหัสผ่าน_ticket
              </label>
              <input
                type="password"
                name="ticket"
                value={form.ticket}
                onChange={handleChange}
                placeholder="รหัสผ่าน"
                className="border-stroke text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base dark:border-transparent dark:bg-[#2C303B] dark:text-white"
                required
              />
            </div>

            <div className="mb-6">
              <button className="bg-primary hover:bg-primary/90 w-full rounded-xs px-9 py-4 text-base font-medium text-white duration-300">
                เข้าสู่ระบบ
              </button>
            </div>

            <div className="text-body-color text-center text-sm">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                ลืมรหัสผ่าน
              </Link>
              <br />
              ยังไม่มีบัญชีผู้ใช้?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                สมัครสมาชิก
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Hero;
