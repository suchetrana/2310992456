export const runtimeConfig = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    "http://20.207.122.201/evaluation-service",
  token: import.meta.env.VITE_ACCESS_TOKEN ?? ""
};
