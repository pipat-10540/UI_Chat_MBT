"use client";
import { Register } from "@/interface/register";
import { useState } from "react";
import Link from "next/link";
import SigninService from "@/service/signin_service";
import { useRouter } from "next/navigation";
import Hero from "@/app/signin/page";

const SignupPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    email: "",
    ticket: "",
    confirmTicket: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.ticket !== form.confirmTicket) {
      alert("❌ รหัสผ่านไม่ตรงกัน");
      return;
    }
    const payload = {
      username: form.username,
      fullname: form.fullname,
      email: form.email,
      ticket: form.ticket,
    };
    const res = await SigninService.register(payload);
    if (res.success) {
      router.push("/signin");
    }
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
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          สมัครสมาชิก
        </h2>
        <p className="text-1x2 mb-6 text-center text-2xl font-bold text-gray-800">
          Tissue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="ชื่อผู้ใช้"
            className="w-full rounded-md border border-gray-600 bg-[#0f172a4d] p-2 text-white placeholder-gray-100"
            required
          />
          <input
            type="text"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            placeholder="ชื่อ-นามสกุล"
            className="w-full rounded-md border border-gray-600 bg-[#0F172A] p-2 text-white placeholder-gray-400"
            required
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="อีเมล"
            className="w-full rounded-md border border-gray-600 bg-[#0F172A] p-2 text-white placeholder-gray-400"
            required
          />
          <input
            type="password"
            name="ticket"
            value={form.ticket}
            onChange={handleChange}
            placeholder="รหัสผ่าน"
            className="w-full rounded-md border border-gray-600 bg-[#0F172A] p-2 text-white placeholder-gray-400"
            required
          />
          <input
            type="password"
            name="confirmTicket"
            value={form.confirmTicket}
            onChange={handleChange}
            placeholder="ยืนยันรหัสผ่าน"
            className="w-full rounded-md border border-gray-600 bg-[#0F172A] p-2 text-white placeholder-gray-400"
            required
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
          >
            สมัครสมาชิก
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-800">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/signin" className="text-blue-600 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
