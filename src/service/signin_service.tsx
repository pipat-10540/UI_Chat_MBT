import ApiPath from "@/util/path";
import api from "@/util/api_providers";

class SigninService {
  private static _instance: SigninService;

  private constructor() {}

  public static get instance(): SigninService {
    if (!SigninService._instance) {
      SigninService._instance = new SigninService();
    }
    return SigninService._instance;
  }

  // #region chat
  // ดึงห้องแชทที่ user เป็นสมาชิก
  async getConversations(): Promise<{
    success: boolean;
    conversations?: any[];
    message?: string;
  }> {
    try {
      const response = await api.get(ApiPath.conversations, {
        withCredentials: true,
      });
      const resp = response.data || {};
      if (response.status === 200 && resp.ok) {
        return { success: true, conversations: resp.conversations };
      }
      return { success: false, message: resp.message || "ไม่พบห้องแชท" };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message || error?.message || "เกิดข้อผิดพลาด",
      };
    }
  }
  // #endregion

  //#region createConversation
  // สร้างห้องแชทใหม่ (1:1 หรือกลุ่ม)
  async createConversation({
    name,
    is_group,
    memberIds,
  }: {
    name?: string;
    is_group?: boolean;
    memberIds: number[];
  }): Promise<{ success: boolean; conversationId?: number; message?: string }> {
    try {
      const response = await api.post(
        ApiPath.conversations,
        { name, is_group, memberIds },
        { withCredentials: true },
      );
      const resp = response.data || {};
      if (response.status === 200 && resp.ok) {
        return { success: true, conversationId: resp.conversationId };
      }
      return {
        success: false,
        message: resp.message || "สร้างห้องแชทไม่สำเร็จ",
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message || error?.message || "เกิดข้อผิดพลาด",
      };
    }
  }
  // #endregion

  //#region getMessages
  // ดึงข้อความในห้องแชท
  async getMessages(
    conversationId: number,
  ): Promise<{ success: boolean; messages?: any[]; message?: string }> {
    try {
      const response = await api.get(
        ApiPath.messages + `?conversationId=${conversationId}`,
        { withCredentials: true },
      );
      const resp = response.data || {};
      if (response.status === 200 && resp.ok) {
        return { success: true, messages: resp.messages };
      }
      return { success: false, message: resp.message || "ไม่พบข้อความ" };
    } catch (error: any) {
      return {
        success: false,
        message:
          error?.response?.data?.message || error?.message || "เกิดข้อผิดพลาด",
      };
    }
  }
  //#endregion

  //#region sendMessage
  // ส่งข้อความ
  async sendMessage(
    conversationId: number,
    text: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post(
        ApiPath.messages,
        { conversationId, text },
        { withCredentials: true },
      );
      const resp = response.data || {};
      if (response.status === 200 && resp.ok) {
        return { success: true };
      }
      return { success: false, message: resp.message || "ส่งข้อความไม่สำเร็จ" };
    } catch (error: any) {
      console.error("SendMessage Error:", error); // Debug log
      console.error("Error details:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        config: error?.config,
      });
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || error?.message || "เกิดข้อผิดพลาด";

      return {
        success: false,
        message: `[${status}] ${message}`,
      };
    }
  }
  // #endregion

  //#region login
  async login(body: any): Promise<{ success: Boolean; message: string }> {
    console.log("login body", body);
    try {
      console.log("SigninService.login -> url:", ApiPath.login);
      console.log("SigninService.login -> payload:", body);
      const response = await api.post(ApiPath.login, body);
      console.log("login response", response);
      console.log("login response.data", response.data);
      // Handle two possible backend shapes:
      // 1) { success, message, data: { users_id, token, ... } }
      // 2) { ok: true, user: { id, email, username, fullname, ... } }
      const resp = response.data || {};
      if (response.status === 200 && (resp.success || resp.ok)) {
        if (resp.success) {
          const usersData = resp.data;
          try {
            if (usersData?.token)
              localStorage.setItem("token", usersData.token);
            if (usersData?.users_id)
              localStorage.setItem("users_id", String(usersData.users_id));
            if (usersData?.firstname)
              localStorage.setItem("user", JSON.stringify(usersData.firstname));
          } catch (e) {
            console.warn("localStorage unavailable:", e);
          }
          return { success: true, message: resp.message || "OK" };
        }

        // resp.ok path
        if (resp.ok && resp.user) {
          // map user -> store token if available (not provided here)
          try {
            localStorage.setItem("users_id", String(resp.user.id));
            localStorage.setItem("user", JSON.stringify(resp.user.fullname));
          } catch (e) {
            console.warn("localStorage unavailable:", e);
          }
          return { success: true, message: "เข้าสู่ระบบสำเร็จ" };
        }
      }

      alert(resp.message || "เข้าสู่ระบบไม่สำเร็จ");
      return {
        success: false,
        message: resp.message || "เข้าสู่ระบบไม่สำเร็จ",
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "เกิดข้อผิดพลาดขณะเข้าสู่ระบบ";
      alert(message);
      return { success: false, message };
    }
  }
  //#endregion

  //#region forgot password
  async forgotPassword(
    body: any,
  ): Promise<{ success: Boolean; message: string }> {
    const response = await api.post(ApiPath.forgot_password, body);
    if (response.status == 200) {
      alert(response.data.message);
      return {
        success: response.data.success,
        message: response.data.message,
      };
    } else {
      alert(response.data.message);
      return {
        success: response.data.success,
        message: response.data.message,
      };
    }
  }
  //#endregion

  //#region reset password
  async resetPassword(
    body: any,
  ): Promise<{ success: Boolean; message: string }> {
    const response = await api.post(ApiPath.resetPassword, body);
    if (response.status == 200) {
      alert(response.data.message);
      return {
        success: response.data.success,
        message: response.data.message,
      };
    } else {
      alert(response.data.message);
      return {
        success: response.data.success,
        message: response.data.message,
      };
    }
  }
  //#endregion

  //#region logout
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(
        ApiPath.logout,
        {},
        {
          withCredentials: true,
        },
      );
      const resp = response.data || {};
      if (response.status === 200 && (resp.ok || resp.success)) {
        // ลบข้อมูลใน localStorage
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("users_id");
          localStorage.removeItem("user");
        } catch (e) {
          console.warn("localStorage unavailable:", e);
        }
        return {
          success: true,
          message: resp.message || "ออกจากระบบสำเร็จ",
        };
      }
      return {
        success: false,
        message: resp.message || "ออกจากระบบไม่สำเร็จ",
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "เกิดข้อผิดพลาดขณะออกจากระบบ";
      return { success: false, message };
    }
  }
  //#endregion

  //#region register
  async register(body: any): Promise<{ success: Boolean; message: string }> {
    console.log("register body", body);
    try {
      console.log("SigninService.register -> url:", ApiPath.register);
      console.log("SigninService.register -> payload:", body);

      let response;
      if (body instanceof FormData) {
        // ส่ง FormData โดยไม่ตั้ง Content-Type ให้ browser/axios จัดการเอง
        response = await api.post(ApiPath.register, body, {
          headers: {
            "Content-Type": undefined, // ลบ Content-Type ออก
          },
        });
      } else {
        response = await api.post(ApiPath.register, body);
      }

      console.log("register response", response);
      console.log("register response.data", response.data);

      const resp = response.data || {};
      if (response.status === 200 && (resp.ok || resp.success)) {
        alert(resp.message || "สมัครสมาชิกสำเร็จ");
        return { success: true, message: resp.message || "OK" };
      }

      alert(resp.message || "สมัครสมาชิกไม่สำเร็จ");
      return {
        success: false,
        message: resp.message || "สมัครสมาชิกไม่สำเร็จ",
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "เกิดข้อผิดพลาดขณะสมัครสมาชิก";
      alert(message);
      return { success: false, message };
    }
  }
  //#endregion

  //#region me
  async me(): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const response = await api.get(ApiPath.me, { withCredentials: true });
      const resp = response.data || {};
      if (response.status === 200 && (resp.ok || resp.success)) {
        return {
          success: true,
          message: resp.message || "OK",
          user: resp.user,
        };
      }
      return {
        success: false,
        message: resp.message || "ดึงข้อมูลผู้ใช้ไม่สำเร็จ",
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "เกิดข้อผิดพลาดขณะดึงข้อมูลผู้ใช้";
      return { success: false, message };
    }
  }
  //#endregion

  //#region pusher
  async pusher(): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const response = await api.get(ApiPath.pusher.auth, {
        withCredentials: true,
      });
      const resp = response.data || {};
      if (response.status === 200 && (resp.ok || resp.success)) {
        return {
          success: true,
          message: resp.message || "OK",
          user: resp.user,
        };
      }
      return {
        success: false,
        message: resp.message || "ดึงข้อมูลผู้ใช้ไม่สำเร็จ",
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "เกิดข้อผิดพลาดขณะดึงข้อมูลผู้ใช้";
      return { success: false, message };
    }
  }
  //#endregion

  //#region users
  async users(): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const response = await api.get(ApiPath.users, {
        withCredentials: true,
      });
      const resp = response.data || {};
      if (response.status === 200 && (resp.ok || resp.success)) {
        return {
          success: true,
          message: resp.message || "OK",
          user: resp.user,
        };
      }
      return {
        success: false,
        message: resp.message || "ดึงข้อมูลผู้อื่นไม่สำเร็จ",
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "เกิดข้อผิดพลาดขณะดึงข้อมูลผู้ใช้";
      return { success: false, message };
    }
  }
  //#endregion
}

export default SigninService.instance;
