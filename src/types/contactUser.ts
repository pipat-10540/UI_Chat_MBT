export type contactGetUser = {
  last_update: string;
  create_date: string;
  phone: string;
  email: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  group_name: string;
  user_id: number;
  id: number;
  group_id?: number; // ID ของกลุ่มที่จะเพิ่มเข้าไป
  group_ids?: number[]; // Array ของ group IDs สำหรับ multi-select
  status?: boolean; // true = ใช้งานได้, false = บล็อก
};
export type contactFromData = Omit<contactGetUser, "contact_id">;
