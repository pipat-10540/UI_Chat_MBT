"use client";

import React, { useEffect, useRef, useState } from "react";
import SigninService from "@/service/signin_service";
import { FiSearch, FiSend, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  time?: string;
};

type Friend = {
  id: string;
  name: string;
  lastMessage?: string;
  unread?: number;
  messages: Message[];
};

export default function ChatPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [text, setText] = useState("");
  const [user, setUser] = useState<{
    fullname?: string;
    username?: string;
  } | null>(null);

  useEffect(() => {
    async function fetchMe() {
      const res = await SigninService.me();
      if (res.success && res.user) {
        setUser(res.user);
        setFriends([
          {
            id: res.user.id || "me",
            name: res.user.fullname || res.user.username || "ไม่ระบุ",
            messages: [],
          },
        ]);
        setSelectedId(res.user.id || "me");
      } else {
        setUser(null);
        setFriends([]);
        setSelectedId("");
        // ถ้าไม่ได้ user ให้ redirect ไปหน้า login
        router.replace("/signin");
      }
    }
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ensure selectedId exists after friends update
    if (!friends.find((f) => f.id === selectedId) && friends.length > 0) {
      setSelectedId(friends[0].id);
    }
  }, [friends, selectedId]);

  const selected = friends.find((f) => f.id === selectedId) || friends[0];

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedId, friends]);

  function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setFriends((prev) =>
      prev.map((f) =>
        f.id === selectedId
          ? {
              ...f,
              lastMessage: trimmed,
              messages: [
                ...f.messages,
                {
                  id: Date.now().toString(),
                  from: "me",
                  text: trimmed,
                  time: new Date().toLocaleTimeString(),
                },
              ],
            }
          : f,
      ),
    );
    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold">หน้าแชท</h1>
        <div className="flex h-[70vh] overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          {/* Left: Friends list */}
          <aside className="flex w-80 flex-shrink-0 flex-col border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="text-lg font-medium">โปรไฟล์ผู้ใช้</div>
            </div>
            <div className="space-y-1 overflow-auto px-2">
              {user && (
                <div
                  className={`flex w-full items-center gap-3 rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-700`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-600 dark:text-indigo-100">
                    <FiUser />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.fullname || user.username || "ไม่ระบุ"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right: Chat area */}
          <main className="flex flex-1 flex-col">
            <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-600 dark:text-indigo-100">
                <FiUser />
              </div>
              <div>
                <div className="font-medium">
                  {/* แสดงชื่อ user ที่ล็อกอิน ถ้ามี */}
                  {user?.fullname || user?.username || "ไม่ระบุ"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  ออนไลน์เมื่อสักครู่
                </div>
              </div>
            </header>

            <section
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-auto bg-gray-50 p-4 dark:bg-gray-900"
            >
              {selected?.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[70%] ${m.from === "me" ? "ml-auto text-right" : ""}`}
                >
                  <div
                    className={`inline-block rounded-lg px-4 py-2 ${
                      m.from === "me"
                        ? "bg-indigo-600 text-white"
                        : "border bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {m.text}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">{m.time}</div>
                </div>
              ))}
            </section>

            <footer className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`ส่งข้อความถึง ${selected?.name || "เพื่อน"}`}
                  className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm focus:outline-none dark:bg-gray-700"
                />
                <button
                  onClick={sendMessage}
                  className="flex items-center justify-center rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-700"
                  aria-label="ส่ง"
                >
                  <FiSend />
                </button>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
