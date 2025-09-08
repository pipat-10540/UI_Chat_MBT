import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

class APIProvider {
  private static _instance: APIProvider;
  private _axios: AxiosInstance;

  private constructor() {
    this._axios = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
      timeout: 20000,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "*/*",
      },
      withCredentials: true, // สำคัญมากสำหรับ session/cookie auth
    });

    // 🛡️ Interceptor: Logging + Error Handling
    this._axios.interceptors.request.use((config) => {
      (config as any).metadata = { startTime: new Date() };
      return config;
    });

    this._axios.interceptors.response.use(
      (response: AxiosResponse) => {
        const { startTime } = (response.config as any).metadata;
        const duration = new Date().getTime() - new Date(startTime).getTime();
        console.debug(
          ` [${response.config.method?.toUpperCase()}] ${response.config.url} took ${duration} ms`,
        );
        return response;
      },
      (error: AxiosError) => {
        const { startTime } = (error.config as any).metadata || {};
        const duration = startTime
          ? new Date().getTime() - new Date(startTime).getTime()
          : 0;
        // console.error(
        //   ` [${error.config?.method?.toUpperCase()}] ${error.config?.url} failed after ${duration} ms`,
        // );
        // console.error("Error:", error.message);
        return Promise.reject(error.response || error);
      },
    );
  }

  public static get instance(): APIProvider {
    if (!APIProvider._instance) {
      APIProvider._instance = new APIProvider();
    }
    return APIProvider._instance;
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this._axios.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    try {
      const response = await this._axios.post<T>(url, data, config);
      return response;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        // console.error("Axios error:", error.message);
        // console.error("Error code:", error.code);
        // console.error("Error response:", error.response?.data);
        throw {
          type: "AxiosError",
          message: error.message,
          code: error.code,
          response: error.response?.data,
        };
      } else {
        // console.error("Unexpected error:", error);
        throw error;
      }
    }
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this._axios.put<T>(url, data, config);
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this._axios.delete<T>(url, config);
  }
}

export default APIProvider.instance;
