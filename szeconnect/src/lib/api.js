// src/lib/api.js
const BASE_URL = process.env.REACT_APP_API_URL || "https://szeconnect.onrender.com";

async function request(path, { method = "GET", body, token, formData = false } = {}) {
  const headers = {};
  
  // Only set Content-Type for JSON, not for FormData (browser sets boundary automatically)
  if (!formData) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    // If formData is true, send body as-is. Otherwise, JSON.stringify it.
    body: formData ? body : (body ? JSON.stringify(body) : undefined),
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // ✅ UPDATED: Automatically detects if payload is FormData (has image) or JSON
  register: (payload) => request("/register", { 
    method: "POST", 
    body: payload,
    formData: payload instanceof FormData 
  }),

  login: (neptun, password) => request("/login", { method: "POST", body: { neptun, password } }),
  profile: (token) => request("/profile", { token }),
  listUsers: () => request("/users"),
  listGroups: () => request("/groups"),
  listPosts: () => request("/posts"),
  getComments: (postId) => request(`/posts/${postId}/comments`),
  addComment: (postId, commentData, token) => request(`/posts/${postId}/comments`, { 
    method: "POST", 
    body: commentData,
    token 
  }),

  // Handle both FormData (with images) and regular JSON for posts
  createPost: (postData, images, token) => {
    if (images && images.length > 0) {
      // Use FormData for image uploads
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content || '');
      formData.append('groupId', postData.groupId);
      
      // Append each image file
      images.forEach((image) => {
        formData.append('images', image.file);
      });

      return request("/posts", { 
        method: "POST", 
        body: formData,
        token,
        formData: true
      });
    } else {
      // Use regular JSON for text-only posts
      return request("/posts", { 
        method: "POST", 
        body: postData,
        token 
      });
    }
  },

  joinGroup: (groupId, token) => request(`/groups/${groupId}/join`, { 
    method: "POST",
    token 
  }),
  leaveGroup: (groupId, token) => request(`/groups/${groupId}/leave`, { 
    method: "POST",
    token 
  }),

  checkFollowing: (groupId, token) => request(`/groups/${groupId}/following`, { token }),

  // Like functions
  getLikes: (postId) => request(`/posts/${postId}/likes`),
  
  likePost: (postId, likeType, token) => request(`/posts/${postId}/like`, { 
    method: "POST", 
    body: { likeType },
    token 
  }),
  searchGroups: (query) => request(`/search/groups?q=${encodeURIComponent(query)}`),
  searchUsers: (query) => request(`/search/users?q=${encodeURIComponent(query)}`),
  
  ggetUserProfile: (userId, token) => {
  console.log("🔧 getUserProfile called with:", { userId, hasToken: !!token });
  return request(`/users/${userId}`, { token });
},
};