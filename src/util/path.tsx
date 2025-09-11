const api_path =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const ApiPath = {
  // Auth
  login: `${api_path}/api/login`,
  register: `${api_path}/api/register`,
  me: `${api_path}/api/me`,
  users: `${api_path}/api/users`,
  conversations: `${api_path}/api/conversations`,
  messages: `${api_path}/api/messages`,
  logout: `${api_path}/api/logout`,
  pusher: {
    auth: `${api_path}/pusher/auth`,
  },
};

export default ApiPath;
