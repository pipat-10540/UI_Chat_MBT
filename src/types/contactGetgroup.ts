export type contactGetgroup = {
  group_name: string;
  create_date: string;
  last_update: string;
  contact_id: number;
  id: number;
  contact_count?: number; // จำนวนสมาชิกทั้งหมดในกลุ่ม
  phone_count?: number; // จำนวนเบอร์โทร
  email_count?: number; // จำนวนอีเมล
  user_id: number;
};
export type contactFromDatagroup = Omit<contactGetgroup, "contact_groups_id">;
