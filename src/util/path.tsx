const api_path =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const ApiPath = {
  // Auth
  login: `${api_path}/login`,
  register: `${api_path}/register`,
  me: `${api_path}/me`,
};

export default ApiPath;
