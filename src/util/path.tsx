const api_path =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const ApiPath = {
  // Auth
  login: `${api_path}/login`,
  register: `${api_path}/register`,
  me: `${api_path}/me`,
  pusher: {
    auth: `${api_path}/pusher/auth`,
  },
  users: `${api_path}/users`,
  conversations: `${api_path}/api/conversations`,
  messages: `${api_path}/api/messages`,
};

export default ApiPath;
