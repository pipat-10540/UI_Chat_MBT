"use client";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // useEffect(() => {
  //   // ตรวจสอบว่าผู้ใช้ login แล้วหรือยัง
  //   const checkAuth = () => {
  //     const localToken = localStorage.getItem("token");
  //     const cookieToken = document.cookie
  //       .split("; ")
  //       .find((row) => row.startsWith("token="))
  //       ?.split("=")[1];

  //     // ถ้ามี token ให้ redirect ไป dashboard
  //     if (localToken || cookieToken) {
  //       router.push("/dashboard");
  //     }
  //   };

  //   checkAuth();
  // }, [router]);

  return (
    <>
      <ScrollUp />
      {/* <Header /> */}
      <Hero />
    </>
  );
}
