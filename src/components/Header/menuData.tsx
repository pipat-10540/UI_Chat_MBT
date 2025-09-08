import { Menu } from "@/types/menu";
const menuData: Menu[] = [
  {
    id: 2,
    title: "ผลิตภัณฑ์" /*"About"*/,
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "Sms",
        path: "/",
        newTab: false,
      },
      {
        id: 42,
        title: "Email",
        path: "/",
        newTab: false,
      },
      {
        id: 43,
        title: "LINE LON",
        path: "/",
        newTab: false,
      },
    ],
  },
  {
    id: 89,
    title: "ราคา" /*"Blog"*/,
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "ราคา แพ๊คเก็จ Sms",
        path: "/",
        newTab: false,
      },
      {
        id: 42,
        title: "ราคา แพ๊คเก็จ Email",
        path: "/",
        newTab: false,
      },
      {
        id: 43,
        title: "ราคา แพ๊คเก็จ LINE LON",
        path: "/",
        newTab: false,
      },
    ],
  },
  {
    id: 34,
    title: "โปรโมชัน" /*"สร้างใหม่"*/,
    path: "/blog",
    newTab: false,
  },
  {
    id: 3,
    title: "ศูยน์ช่วยเหลือ" /*"Support"*/,
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "การขอ Sms whltellst ",
        path: "/",
        newTab: false,
      },
      {
        id: 42,
        title: "คำถามที่พบบ่อย",
        path: "/",
        newTab: false,
      },
      {
        id: 43,
        title: "แจ้งปัญหาและเรื่องร้องเรียน",
        path: "/",
        newTab: false,
      },
      {
        id: 43,
        title: "แจ้งไม่รับข้อความ",
        path: "/",
        newTab: false,
      },
      {
        id: 43,
        title: "วิธีการสั่งซื้อผลิตภัณฑ์",
        path: "/",
        newTab: false,
      },
      {
        id: 43,
        title: "วิธีการคำนวณเครดิต",
        path: "/",
        newTab: false,
      },
      {
        id: 43,
        title: "คู่มือการใช้งาน",
        path: "/",
        newTab: false,
      },
    ],
  },
  {
    id: 1,
    title: "เกี่ยวกลับเรา" /*"Home"*/,
    path: "/",
    newTab: false,
  },
  {
    id: 1,
    title: "สำหรับนักพัฒนา" /*"Home"*/,
    path: "/",
    newTab: false,
  },
];
export default menuData;
