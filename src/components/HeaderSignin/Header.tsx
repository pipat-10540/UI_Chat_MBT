// components/HeaderSignin/Header.tsx
"use client";
import Image from "next/image";
import LanguageSelector from "./LanguageSelector";
import MenuDropdown from "./MenuDropdown";
import UserProfile from "./UserProfile";
import Link from "next/link";

const HeaderSignin = () => {
  return (
    <header className="w-full bg-[#221e4c] shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* ✅ LOGO */}
        <Link
          href="/dashboard"
          className="flex items-center text-2x1 font-bold"
        >
          <Image
            src="/images/logo/2.png"
            alt="MBT Soft Max Logo"
            width={300}
            height={40}
            className="object-contain"
          />
        </Link>

        {/* ✅ เมนูด้านขวา */}
        <div className="flex items-center gap-4">
          <MenuDropdown />
          <LanguageSelector />
          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default HeaderSignin;
