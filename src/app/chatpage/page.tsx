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
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
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
      const msgRes = await SigninService.getMessages(
        Number(selectedConversationId),
      );
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
          const resp = await fetch("http://localhost:8080/users", {
            credentials: "include",
          });
          const data = await resp.json();
          if (data.ok) {
            // ดึง conversations ทั้งหมดของ user
            const convRes = await SigninService.getConversations();
            const conversations =
              convRes.success && convRes.conversations
                ? convRes.conversations
                : [];
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
                      c.members.some((m: any) => m.id === res.user.id),
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
                }),
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
    const res = await SigninService.sendMessage(
      Number(selectedConversationId),
      trimmed,
    );
    if (res.success) {
      // ดึงข้อความล่าสุดจาก backend
      const msgRes = await SigninService.getMessages(
        Number(selectedConversationId),
      );
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
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-100 via-orange-100 to-yellow-200">
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <h1 className="mb-6 text-4xl font-bold text-orange-600 drop-shadow-lg">
          💬 หน้าแชท
        </h1>
        <div className="flex h-[85vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-orange-200 bg-white/90 shadow-2xl backdrop-blur">
          {/* Left: Friends list */}
          <aside className="flex w-80 flex-shrink-0 flex-col border-r border-orange-200 bg-gradient-to-b from-yellow-50 to-orange-100">
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-200 to-yellow-200 px-6 py-4">
              <div className="text-xl font-bold text-orange-700">
                👤 โปรไฟล์ผู้ใช้
              </div>
            </div>
            <div className="space-y-2 overflow-auto px-4 py-2">
              {user && (
                <div className="flex w-full items-center gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-3 shadow-sm">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-white shadow-lg">
                    <FiUser size={24} />
                    <span className="absolute right-0 bottom-0 block h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-orange-800">
                      {user.fullname || user.username || "ไม่ระบุ"}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mb-3 px-6 text-base font-bold text-orange-600">
              🌟 เพื่อน
            </div>
            <div className="space-y-2 px-4 pb-4">
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
                        const msgRes = await SigninService.getMessages(
                          res.conversationId,
                        );
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
                                          from:
                                            m.sender_id === user?.id
                                              ? "me"
                                              : "them",
                                          text: m.text,
                                          time: m.created_at,
                                        }))
                                      : [],
                                }
                              : ff,
                          ),
                        );
                        setSelectedUserId(f.id);
                        setSelectedConversationId(res.conversationId);
                      }
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-left transition-all duration-200 ${
                    selectedUserId === f.id
                      ? "scale-105 transform border-orange-400 bg-gradient-to-r from-orange-200 to-yellow-200 shadow-lg"
                      : "hover:border-orange-300 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100 hover:shadow-md"
                  }`}
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 text-orange-900 shadow-md">
                    <FiUser size={20} />
                    <span
                      className={`absolute right-0 bottom-0 block h-3 w-3 rounded-full border-2 border-white ${
                        f.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                      title={f.online ? "ออนไลน์" : "ออฟไลน์"}
                    ></span>
                  </div>
                  <span className="flex-1 truncate font-semibold text-orange-800">
                    {f.name}
                  </span>
                  {f.unread ? (
                    <span className="ml-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                      {f.unread}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </aside>

          {/* Right: Chat area */}
          <main className="flex flex-1 flex-col bg-gradient-to-br from-yellow-50 to-orange-50">
            <header className="flex items-center gap-4 border-b border-orange-200 bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-white shadow-lg">
                <FiUser size={24} />
                <span
                  className={`absolute right-0 bottom-0 block h-4 w-4 rounded-full border-2 border-white ${selected?.online ? "bg-green-500" : "bg-gray-400"}`}
                ></span>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-700">
                  {selected?.name || "ไม่ระบุ"}
                </div>
                <div className="text-sm font-medium text-orange-500">
                  {selected?.online ? "🟢 ออนไลน์" : "⚫ ออฟไลน์"}
                </div>
              </div>
            </header>

            <section
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-auto bg-gradient-to-br from-yellow-50 to-orange-50 p-6"
            >
              {selected?.messages && selected.messages.length > 0 ? (
                selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] ${m.from === "me" ? "ml-auto text-right" : ""}`}
                  >
                    <div
                      className={`inline-block rounded-3xl px-6 py-3 text-base font-medium shadow-lg transition-all duration-200 ${
                        m.from === "me"
                          ? "bg-gradient-to-r from-orange-400 to-yellow-300 text-white shadow-orange-200"
                          : "border border-orange-200 bg-white text-orange-900 shadow-yellow-100"
                      }`}
                    >
                      {m.text}
                    </div>
                    <div className="mt-2 text-xs font-medium text-orange-400">
                      {m.time}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-lg font-medium text-orange-300">
                  💭 ยังไม่มีข้อความ
                </div>
              )}
            </section>

            <footer className="border-t border-orange-200 bg-gradient-to-r from-yellow-100 to-orange-100 px-6 py-4">
              <div className="flex items-center gap-4">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`💬 ส่งข้อความถึง ${selected?.name || "เพื่อน"}...`}
                  className="flex-1 rounded-full border-2 border-orange-200 bg-white/80 px-6 py-3 text-base text-orange-900 placeholder-orange-400 shadow-md focus:border-orange-400 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                  disabled={!selected}
                />
                <button
                  onClick={sendMessage}
                  className="flex items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-yellow-300 p-4 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl disabled:opacity-50"
                  aria-label="ส่ง"
                  disabled={!selected}
                >
                  <FiSend size={24} />
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
