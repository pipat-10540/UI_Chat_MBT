"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import { User } from "lucide-react";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); //state สำหรับเช็คว่า login แล้วหรือยัง
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    const checkToken = () => {
      // ตรวจสอบทั้ง localStorage และ cookie
      const localToken = localStorage.getItem("token");
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      setIsLoggedIn(!!(localToken || cookieToken));
    };

    // เรียกทันทีเมื่อโหลด
    checkToken();

    // ฟังการเปลี่ยนแปลงของ localStorage จาก event อื่น
    window.addEventListener("storage", checkToken);

    return () => {
      window.removeEventListener("storage", checkToken);
    };
  }, []);

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();

  return (
    <>
      <header
        className={`top-4 left-0 z-50 flex h-20 w-full items-center ${
          sticky
            ? "dark:bg-gray-dark dark:shadow-sticky-dark shadow-sticky fixed z-9999 bg-white/80 backdrop-blur-xs transition"
            : "absolute bg-transparent"
        }`}
        style={{ minHeight: "100px" }}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-[240px] px-4 xl:mr-12">
              <Link href="/" className="header-logo block">
                <Image
                  src="/images/logo/2.png"
                  alt="logo"
                  width={300}
                  height={100}
                  unoptimized
                  className="h-auto w-auto max-w-[290px] dark:hidden"
                />
                <Image
                  src="/images/logo/2.png"
                  alt="logo"
                  width={300}
                  height={100}
                  unoptimized
                  className="hidden h-auto w-auto max-w-[290px] dark:block"
                />
              </Link>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              <div>
                <button
                  onClick={navbarToggleHandler}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="ring-primary absolute top-1/2 right-4 block translate-y-[-50%] rounded-lg px-3 py-[6px] focus:ring-2 lg:hidden"
                >
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "top-[7px] rotate-45" : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "opacity-0" : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "top-[-8px] -rotate-45" : " "
                    }`}
                  />
                </button>
                <nav
                  id="navbarCollapse"
                  className={`navbar border-body-color/50 dark:border-body-color/20 dark:bg-dark absolute right-0 z-30 w-[250px] rounded border-[.5px] bg-white px-6 py-4 duration-300 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className="block lg:flex lg:space-x-12">
                    {menuData.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            className={`flex py-1 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-2 ${
                              usePathName === menuItem.path
                                ? "text-primary dark:text-white"
                                : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                            }`}
                          >
                            {menuItem.title}
                          </Link>
                        ) : (
                          <>
                            <p
                              onClick={() => handleSubmenu(index)}
                              className="text-dark group-hover:text-primary flex cursor-pointer items-center justify-between py-1 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-2 dark:text-white/70 dark:group-hover:text-white"
                            >
                              {menuItem.title}
                              {menuItem.submenu &&
                                menuItem.submenu.length > 0 && (
                                  <span className="pl-2">▼</span>
                                )}
                            </p>
                            <div
                              className={`submenu dark:bg-dark relative top-full left-0 rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                                openIndex === index ? "block" : "hidden"
                              }`}
                            >
                              {menuItem.submenu.map((submenuItem, index) => (
                                <Link
                                  href={submenuItem.path}
                                  key={index}
                                  className="text-dark hover:text-primary block rounded-sm py-2.5 text-sm lg:px-3 dark:text-white/70 dark:hover:text-white"
                                >
                                  {submenuItem.title}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="flex items-center justify-end pr-16 lg:pr-0">
                {!isLoggedIn && (
                  <Link
                    href="/signin"
                    className="text-dark hidden items-center gap-2 px-7 py-1 text-base font-medium hover:opacity-70 md:flex dark:text-white"
                  >
                    <User className="h-5 w-5" />
                    เข้าสู่ระบบ
                  </Link>
                )}

                <div className="flex items-center space-x-4">
                  <ThemeToggler />
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        // ลบ cookie ด้วย (ถ้ามี)
                        document.cookie =
                          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        window.location.href = "/signin";
                      }}
                      className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-white shadow-md transition hover:bg-red-600 hover:shadow-lg"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"
                        />
                      </svg>
                      ออกจากระบบ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
