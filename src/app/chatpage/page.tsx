"use client";

import React, { useEffect, useRef, useState } from "react";
import SigninService from "@/service/signin_service";
import { FiSend, FiUser } from "react-icons/fi";
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
  conversationId?: number;
  messages: Message[];
  online?: boolean;
};
function ChatPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | number>("");
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState<{
    id?: string;
    fullname?: string;
    username?: string;
  } | null>(null);

  // Poll ข้อความใหม่ทุก 1 วินาที
  useEffect(() => {
    if (!selectedConversationId || !user) return;
    const interval = setInterval(async () => {
      const msgRes = await SigninService.getMessages(Number(selectedConversationId));
      if (msgRes.success && msgRes.messages) {
        setFriends((prev) =>
          prev.map((f) =>
            f.conversationId === selectedConversationId
              ? {
                  ...f,
                  messages: msgRes.messages.map((m: any) => ({
                    id: m.id,
                    from: m.sender_id === user?.id ? "me" : "them",
                    text: m.text,
                    time: m.created_at,
                  })),
                }
              : f,
          ),
        );
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedConversationId, user]);

  useEffect(() => {
    async function fetchMeAndFriends() {
      const res = await SigninService.me();
      if (res.success && res.user) {
        setUser(res.user);
        try {
          // ดึง users ทั้งหมด (เพื่อนทุกคน)
          const resp = await fetch("http://localhost:8080/users", { credentials: "include" });
          const data = await resp.json();
          if (data.ok) {
            // ดึง conversations ทั้งหมดของ user
            const convRes = await SigninService.getConversations();
            const conversations = convRes.success && convRes.conversations ? convRes.conversations : [];
            // map รายชื่อเพื่อน
            const friendsList = await Promise.all(
              data.users
                .filter((u: any) => u.id !== res.user.id)
                .map(async (u: any) => {
                  // หา conversation 1:1 ที่มี user กับเพื่อนคนนี้
                  let conv = conversations.find(
                    (c: any) =>
                      !c.is_group &&
                      c.members &&
                      c.members.some((m: any) => m.id === u.id) &&
                      c.members.some((m: any) => m.id === res.user.id)
                  );
                  let messages: Message[] = [];
                  if (conv) {
                    const msgRes = await SigninService.getMessages(conv.id);
                    if (msgRes.success && msgRes.messages) {
                      messages = msgRes.messages.map((m: any) => ({
                        id: m.id,
                        from: m.sender_id === res.user.id ? "me" : "them",
                        text: m.text,
                        time: m.created_at,
                      }));
                    }
                  }
                  return {
                    id: u.id,
                    name: u.fullname || u.username,
                    conversationId: conv ? conv.id : undefined,
                    messages,
                    online: true,
                  };
                })
            );
            setFriends(friendsList);
            if (friendsList.length > 0) {
              setSelectedUserId(friendsList[0].id);
              setSelectedConversationId(friendsList[0].conversationId || null);
            }
          } else {
            setFriends([]);
            setSelectedUserId("");
          }
        } catch (e) {
          setFriends([]);
          setSelectedUserId("");
        }
      } else {
        setUser(null);
        setFriends([]);
  setSelectedUserId("");
        router.replace("/signin");
      }
    }
    fetchMeAndFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ensure selectedId exists after friends update
    if (!friends.find((f) => f.id === selectedUserId) && friends.length > 0) {
      setSelectedUserId(friends[0].id);
      setSelectedConversationId(friends[0].conversationId || null);
    }
  }, [friends, selectedUserId]);

  // เลือกเพื่อนที่กำลังแชท
  const selected = friends.find((f) => f.id === selectedUserId);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedUserId, friends]);

  async function sendMessage() {
    const trimmed = text.trim();
    if (!trimmed || !selectedConversationId) return;
    // ส่งข้อความไป backend
    const res = await SigninService.sendMessage(Number(selectedConversationId), trimmed);
    if (res.success) {
      // ดึงข้อความล่าสุดจาก backend
      const msgRes = await SigninService.getMessages(Number(selectedConversationId));
      if (msgRes.success && msgRes.messages) {
        setFriends((prev) =>
          prev.map((f) =>
            f.conversationId === selectedConversationId
              ? {
                  ...f,
                  lastMessage: trimmed,
                  messages: msgRes.messages.map((m: any) => ({
                    id: m.id,
                    from: m.sender_id === user?.id ? "me" : "them",
                    text: m.text,
                    time: m.created_at,
                  })),
                }
              : f,
          ),
        );
      }
      setText("");
    } else {
      alert(res.message || "ส่งข้อความไม่สำเร็จ");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  // ...existing code...
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
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-600 dark:text-indigo-100">
                    <FiUser />
                    <span className="absolute right-0 bottom-0 block h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.fullname || user.username || "ไม่ระบุ"}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
              เพื่อน
            </div>
            <div className="space-y-1">
              {friends.map((f) => (
                <button
                  key={f.id}
                  onClick={async () => {
                    if (f.conversationId) {
                      setSelectedUserId(f.id);
                      setSelectedConversationId(f.conversationId);
                    } else {
                      const res = await SigninService.createConversation({
                        is_group: false,
                        memberIds: [Number(f.id)],
                      });
                      if (res.success && res.conversationId) {
                        const msgRes = await SigninService.getMessages(res.conversationId);
                        setFriends((prev) =>
                          prev.map((ff) =>
                            ff.id === f.id
                              ? {
                                  ...ff,
                                  conversationId: res.conversationId,
                                  messages:
                                    msgRes.success && msgRes.messages
                                      ? msgRes.messages.map((m: any) => ({
                                          id: m.id,
                                          from: m.sender_id === user?.id ? "me" : "them",
                                          text: m.text,
                                          time: m.created_at,
                                        }))
                                      : [],
                                }
                              : ff
                          )
                        );
                        setSelectedUserId(f.id);
                        setSelectedConversationId(res.conversationId);
                      }
                    }
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left ${
                    selectedUserId === f.id
                      ? "bg-indigo-100 dark:bg-indigo-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-100">
                    <FiUser />
                    <span
                      className={`absolute right-0 bottom-0 block h-2.5 w-2.5 rounded-full border-2 border-white ${
                        f.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                      title={f.online ? "ออนไลน์" : "ออฟไลน์"}
                    ></span>
                  </div>
                  <span className="flex-1 truncate">{f.name}</span>
                  {f.unread ? (
                    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                      {f.unread}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </aside>

          {/* Right: Chat area */}
          <main className="flex flex-1 flex-col">
            <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-200 text-indigo-800 dark:bg-indigo-600 dark:text-indigo-100">
                <FiUser />
                <span
                  className={`absolute right-0 bottom-0 block h-3 w-3 rounded-full border-2 border-white ${selected?.online ? "bg-green-500" : "bg-gray-400"}`}
                ></span>
              </div>
              <div>
                <div className="font-medium">{selected?.name || "ไม่ระบุ"}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {selected?.online ? "ออนไลน์" : "ออฟไลน์"}
                </div>
              </div>
            </header>

            <section
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-auto bg-gray-50 p-4 dark:bg-gray-900"
            >
              {selected?.messages && selected.messages.length > 0 ? (
                selected.messages.map((m) => (
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
                ))
              ) : (
                <div className="text-center text-gray-400">ยังไม่มีข้อความ</div>
              )}
            </section>

            <footer className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`ส่งข้อความถึง ${selected?.name || "เพื่อน"}`}
                  className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm focus:outline-none dark:bg-gray-700"
                  disabled={!selected}
                />
                <button
                  onClick={sendMessage}
                  className="flex items-center justify-center rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-700"
                  aria-label="ส่ง"
                  disabled={!selected}
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

export default ChatPage;
