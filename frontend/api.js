// src/lib/api.js - FRONTEND ONLY - No backend code here!
const BASE_URL = process.env.REACT_APP_API_URL || "https://szeconnect.onrender.com";

async function request(path, { method = "GET", body, token, isFormData = false } = {}) {
  const headers = {};
  let requestBody = body;

  // IMPORTANT: For FormData, let the browser set the Content-Type with boundary
  // For JSON, set Content-Type and stringify
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
    if (body && typeof body !== 'string') {
      requestBody = JSON.stringify(body);
    }
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log(`📤 API Request: ${method} ${path}`, {
    isFormData,
    hasToken: !!token,
    bodyType: body?.constructor?.name,
    headers
  });

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: requestBody
    });

    // Handle non-JSON responses
    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    
    let data;
    if (isJson) {
      data = await res.json();
    } else if (res.status === 204) { // No content
      data = null;
    } else {
      const text = await res.text();
      data = { message: text };
    }

    console.log(`📥 API Response: ${path}`, {
      status: res.status,
      ok: res.ok,
      contentType,
      data
    });

    if (!res.ok) {
      const msg = data?.message || data?.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  } catch (error) {
    console.error(`❌ API Request Failed: ${method} ${path}`, error);
    throw error;
  }
}

export const api = {
  // Auth & User
  register: (payload) => {
    // Handle both FormData and JSON
    const isFormData = payload instanceof FormData;
    return request("/register", { 
      method: "POST", 
      body: payload,
      isFormData
    });
  },
  
  login: (neptun, password) => request("/login", { 
    method: "POST", 
    body: { neptun, password }
  }),

  forgotPassword: (email) => request("/forgot-password", {
    method: "POST",
    body: { email }
  }),
  
  profile: (token) => request("/profile", { token }),
  
  updateProfile: (formData, token) => {
    console.log("🟡 API.updateProfile called!");
    console.log("FormData is FormData?", formData instanceof FormData);
    console.log("Token length:", token?.length);
    
    // Log all FormData entries
    if (formData instanceof FormData) {
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        if (key === 'profileImage') {
          console.log(`  ${key}:`, value.name, `(${value.size} bytes)`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }
    }
    
    return request("/profile", {
      method: "PUT",
      body: formData,
      token,
      isFormData: true
    });
  },
  
  // Test endpoint for debugging
  testUpdate: (data, token) => request("/test-profile", {
    method: "PUT",
    body: data,
    token
  }),
  
  // Users
  listUsers: () => request("/users"),
  getUserProfile: (userId, token) => request(`/users/${userId}`, { token }),
  getUserPosts: (userId, token) => request(`/users/${userId}/posts`, { token }),

  // Groups
  listGroups: (token) => request("/groups", { token }),
  joinGroup: (groupId, token) => request(`/groups/${groupId}/join`, { 
    method: "POST", 
    token 
  }),
  leaveGroup: (groupId, token) => request(`/groups/${groupId}/leave`, { 
    method: "POST", 
    token 
  }),
  checkFollowing: (groupId, token) => request(`/groups/${groupId}/following`, { token }),
  searchGroups: (query) => request(`/search/groups?q=${encodeURIComponent(query)}`),
 
  createGroup: (groupData, token) => {
    const isFormData = groupData instanceof FormData;
    return request("/groups", { 
      method: "POST", 
      body: groupData, 
      token,
      isFormData
    });
  },

  // Posts & Search
  listPosts: (token) => request("/posts", { token }),
  searchUsers: (query) => request(`/search/users?q=${encodeURIComponent(query)}`),

  // Create Post
  createPost: (postData, images, token) => {
    if (images && images.length > 0) {
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content || '');
      if (postData.groupId) {
        formData.append('groupId', postData.groupId);
      }
      
      images.forEach((image) => {
        formData.append('images', image.file);
      });

      return request("/posts", { 
        method: "POST", 
        body: formData, 
        token, 
        isFormData: true
      });
    } else {
      return request("/posts", { 
        method: "POST", 
        body: postData, 
        token 
      });
    }
  },

  // Interactions
  getComments: (postId) => request(`/posts/${postId}/comments`),
  addComment: (postId, commentData, token) => request(`/posts/${postId}/comments`, { 
    method: "POST", 
    body: commentData, 
    token 
  }),
  getLikes: (postId) => request(`/posts/${postId}/likes`),
  likePost: (postId, likeType, token) => request(`/posts/${postId}/like`, { 
    method: "POST", 
    body: { likeType }, 
    token 
  }),

  // REPORTING FUNCTIONS
  reportPost: (postId, reason, token) => request(`/posts/${postId}/report`, {
    method: "POST",
    body: { reason },
    token
  }),

  reportComment: (commentId, reason, token) => request(`/comments/${commentId}/report`, {
    method: "POST",
    body: { reason },
    token
  }),

  checkBanStatus: (userId, token) => request(`/check-ban/${userId}`, { token }),
  
  getUserWarnings: (userId, token) => request(`/users/${userId}/warnings`, { token }),
};

// THAT'S IT! NO BACKEND CODE BELOW THIS LINE
