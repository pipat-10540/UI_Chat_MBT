"use client";

import { useState, useEffect, useRef } from "react";
// import ThemeToggler from "../Header/ThemeToggler";
import Link from "next/link";

const UserProfile = () => {
  const [userName, setUserName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const userString = localStorage.getItem("user");

    if (userString) {
      try {
        const userObj = JSON.parse(userString);

        setUserName(userObj || "");
      } catch (err) {
        console.error("แปลง user ไม่สำเร็จ:", err);
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ปุ่มชื่อผู้ใช้ */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-800"
      >
        <span>{userName || "ผู้ใช้งาน"}</span>
        <span className="text-xs">▼</span>
      </div>

      {/* เมนู dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 space-y-2 rounded-lg bg-white px-4 py-2 shadow-lg">
          {/* <ThemeToggler /> */}

          {isLoggedIn && (
            <>
              <Link
                href="/account-settings"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-100"
              >
                ⚙️ ตั้งค่าบัญชี
              </Link>

              <Link
                href="/login-history"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-800 transition hover:bg-gray-100"
              >
                🕘 ประวัติการเข้าสู่ระบบ
              </Link>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/signin";
                }}
                className="flex w-full items-center gap-2 rounded-md bg-red-500 px-3 py-2 text-sm text-white transition hover:bg-red-600"
              >
                🔓 ออกจากระบบ
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
