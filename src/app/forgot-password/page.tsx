"use client";

import { useState } from "react";
import SigninService from "@/service/signin_service";

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
    <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three dark:bg-dark mx-auto max-w-[500px] rounded-sm bg-white px-6 py-10 sm:p-[60px]">
              <h3 className="mb-3 text-center text-base font-semibold text-black sm:text-lg dark:text-white">
                ลืมรหัสผ่าน
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <label
                    htmlFor="username"
                    className="text-dark mb-3 block text-sm dark:text-white"
                  >
                    ชื่อผู้ใช้งาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="กรอกชื่อผู้ใช้งาน"
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
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;
