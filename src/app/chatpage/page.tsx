"use client";

import React, { useEffect, useRef, useState } from "react";
import SigninService from "@/service/signin_service";
import { FiSend, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Pusher from "pusher-js";

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
  profileImageUrl?: string;
};

// Setup Pusher
const pusher = new Pusher("062ac7b9ef54f385bf5d", {
  cluster: "ap1",
  authEndpoint: "http://localhost:8080/pusher/auth",
  auth: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});

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
    profileImageUrl?: string;
  } | null>(null);

  // 🚀 Pusher real-time messaging
  useEffect(() => {
    if (!selectedConversationId || !user) return;

    const channelName = `conversation-${selectedConversationId}`;
    const channel = pusher.subscribe(channelName);

    // ฟัง event ข้อความใหม่
    channel.bind("new-message", (messageData: any) => {
      console.log("Received Pusher message:", messageData);

      const newMessage: Message = {
        id: messageData.id,
        from:
          messageData.sender_id.toString() === user?.id?.toString()
            ? "me"
            : "them",
        text: messageData.text,
        time: messageData.created_at,
      };

      setFriends((prev) =>
        prev.map((f) =>
          f.conversationId === selectedConversationId
            ? {
                ...f,
                messages: [...f.messages, newMessage],
                lastMessage: messageData.text,
              }
            : f,
        ),
      );
    });

    // Cleanup: unsubscribe เมื่อออกจากห้อง
    return () => {
      channel.unbind("new-message");
      pusher.unsubscribe(channelName);
    };
  }, [selectedConversationId, user]);

  useEffect(() => {
    async function fetchMeAndFriends() {
      const res = await SigninService.me();
      if (res.success && res.user) {
        setUser(res.user);
        try {
          // ดึง users ทั้งหมด (เพื่อนทุกคน)
          const resp = await fetch("http://localhost:8080/api/users", {
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
                    name: u.username,
                    conversationId: conv ? conv.id : undefined,
                    messages,
                    online: true,
                    profileImageUrl: u.profileImageUrl, // เพิ่ม URL รูปโปรไฟล์
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

  // 🚀 ฟัง user notifications (ห้องใหม่)
  useEffect(() => {
    if (!user?.id) return;

    const userChannelName = `user-${user.id}`;
    const userChannel = pusher.subscribe(userChannelName);

    // ฟัง event ห้องใหม่
    userChannel.bind("new-conversation", async (conversationData: any) => {
      // รีเฟรช friends list เมื่อมีห้องใหม่
      const convRes = await SigninService.getConversations();
      if (convRes.success && convRes.conversations) {
        // อัปเดต friends ที่มี conversation ใหม่
        setFriends((prev) =>
          prev.map((f) => {
            const conv = convRes.conversations.find(
              (c: any) =>
                !c.is_group &&
                c.members &&
                c.members.some((m: any) => m.id === f.id) &&
                c.members.some((m: any) => m.id === user.id),
            );
            return conv ? { ...f, conversationId: conv.id } : f;
          }),
        );
      }
    });

    // Cleanup
    return () => {
      userChannel.unbind("new-conversation");
      pusher.unsubscribe(userChannelName);
    };
  }, [user?.id]);

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

    setText(""); // ล้าง input ทันที

    // ส่งข้อความไป backend
    const res = await SigninService.sendMessage(
      Number(selectedConversationId),
      trimmed,
    );

    if (!res.success) {
      alert(res.message || "ส่งข้อความไม่สำเร็จ");
      setText(trimmed); // คืนค่า text กลับไป
    }
    // 🚀 ไม่ต้องเพิ่มข้อความ local เพราะ Pusher จะส่งกลับมา
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  const handleLogout = async () => {
    const result = await SigninService.logout();
    if (result.success) {
      alert("ออกจากระบบสำเร็จ");
      window.location.href = "/signin"; // redirect ไปหน้า signin
    } else {
      alert(result.message);
    }
  };

  // ...existing code...
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-100 via-orange-100 to-yellow-200">
      <div className="flex h-screen w-full flex-col items-center justify-center p-4">
        <h1 className="mb-6 text-4xl font-bold text-orange-600 drop-shadow-lg">
          💬 Tissue
        </h1>
        <div className="flex h-[85vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-orange-200 bg-white/90 shadow-2xl backdrop-blur">
          {/* Left: Friends list */}
          <aside className="flex w-80 flex-shrink-0 flex-col border-r border-orange-200 bg-gradient-to-b from-yellow-50 to-orange-100">
            <div className="flex items-center gap-3 bg-gradient-to-r from-orange-200 to-yellow-200 px-6 py-4">
              <div className="text-xl font-bold text-orange-700">
                👤 โปรไฟล์ผู้ใช้
              </div>
            </div>
            {/* User profile always visible at top */}
            {user && (
              <div className="sticky top-0 z-10 flex w-full items-center gap-3 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-3 shadow-sm">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-white shadow-lg">
                  {user.profileImageUrl ? (
                    <img
                      src={`http://localhost:8080${user.profileImageUrl}`}
                      alt={user.username || "ผู้ใช้"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser size={24} />
                  )}
                  <span className="absolute right-0 bottom-0 block h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-orange-800">
                    {user.username || "ไม่ระบุ"}
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleLogout}>
              <div className="mb-6">
                <button className="bg-primary hover:bg-primary/90 w-full rounded-xs px-9 py-4 text-base font-medium text-white duration-300">
                  ออกจากระบบ
                </button>
              </div>
            </form>
            <div className="mb-3 px-6 text-base font-bold text-orange-600">
              🌟 เพื่อน
            </div>
            <div
              className="space-y-2 overflow-auto px-4 pb-4"
              style={{ maxHeight: "calc(85vh - 250px)" }}
            >
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
                  <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-yellow-200 to-orange-300 text-orange-900 shadow-md">
                    {f.profileImageUrl ? (
                      <img
                        src={`http://localhost:8080${f.profileImageUrl}`}
                        alt={f.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiUser size={20} />
                    )}
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
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 text-white shadow-lg">
                {selected?.profileImageUrl ? (
                  <img
                    src={`http://localhost:8080${selected.profileImageUrl}`}
                    alt={selected.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FiUser size={24} />
                )}
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
