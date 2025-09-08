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
          alert(resp.message || "เข้าสู่ระบบสำเร็จ");
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
          alert("เข้าสู่ระบบสำเร็จ");
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

  //#region register
  async register(body: any): Promise<{ success: Boolean; message: string }> {
    console.log("register body", body);
    try {
      console.log("SigninService.register -> url:", ApiPath.register);
      console.log("SigninService.register -> payload:", body);
      const response = await api.post(ApiPath.register, body);
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
        return { success: true, message: resp.message || "OK", user: resp.user };
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
}

export default SigninService.instance;
