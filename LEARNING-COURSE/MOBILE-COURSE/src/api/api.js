const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
 
export const get = (path, params = {}) => {
  const url = new URL(`${API}${path}`);
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && url.searchParams.set(k, v));
  return fetch(url).then(r => r.json());
};
 
export const getPosts = (params) => get("/api/v1/posts", params);
export const getPost = (slug) => get(`/api/v1/posts/${slug}`);
export const getCategories = () => get("/api/v1/categories");