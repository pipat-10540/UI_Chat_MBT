"use client";
import { useState } from "react";

const MenuDropdown = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="relative flex items-center gap-2">
      {/* ใช้ hover แทนคลิก */}
      {["buy", "send", "balance"].map((menuKey) => (
        <div
          key={menuKey}
          onMouseEnter={() => setActiveMenu(menuKey)}
          onMouseLeave={() => setActiveMenu(null)}
          className="relative"
        >
          <button
            className={`rounded px-4 py-1 transition ${
              menuKey === "balance"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {menuKey === "buy"
              ? "สั่งซื้อเครดิต ▼"
              : menuKey === "send"
                ? "ส่งข้อความ ▼"
                : "เครดิตคงเหลือ ▼"}
          </button>

          {activeMenu === menuKey && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded bg-white p-2 shadow-lg">
              {menuKey === "buy" && (
                <>
                  <p className="cursor-pointer px-2 py-1 text-gray-700">
                    เครดิต SMS
                  </p>
                  <p className="cursor-pointer px-2 py-1 text-gray-700">
                    เครดิต Email
                  </p>
                </>
              )}
              {menuKey === "send" && (
                <>
                  <p className="cursor-pointer px-2 py-1 text-gray-700">
                    ส่ง SMS
                  </p>
                  <p className="cursor-pointer px-2 py-1 text-gray-700">
                    ส่ง Email
                  </p>
                </>
              )}
              {menuKey === "balance" && (
                <div className="relative z-50 w-60 overflow-hidden rounded border border-gray-200 bg-white p-2 text-sm shadow-lg">
                  <div className="mb-4">
                    <p className="font-bold text-gray-700">
                      เครดิต <span className="text-blue-500">SMS</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      เครดิตหมดอายุ{" "}
                      <span className="text-orange-500">05 Sep 25</span>
                    </p>
                    <div className="mt-2 max-w-[150px] rounded bg-blue-50 p-2 text-center">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Standard</span>
                        <span className="font-semibold text-blue-600">9</span>
                      </div>
                      <div className="mt-1 flex justify-between text-sm text-gray-700">
                        <span>Corporate</span>
                        <span className="font-semibold text-blue-600">10</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <p className="font-bold text-gray-700">
                      เครดิต <span className="text-blue-500">Email</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      เครดิตหมดอายุ{" "}
                      <span className="text-orange-500">30 Jun 25</span>
                    </p>
                    <div className="mt-2 w-full max-w-[150px] truncate rounded bg-blue-50 p-2 text-center font-semibold text-blue-600">
                      คงเหลือ 1,000
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuDropdown;
