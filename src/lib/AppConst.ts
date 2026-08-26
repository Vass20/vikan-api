export const AppConst = {
  // Set to true to force localhost during local development
  useLocalhost: true,

  LOCAL_API_URL: "http://localhost:5176",
  DEPLOYED_API_URL: "https://vikan-api.onrender.com", // Replace with your production API URL when ready

  getApiUrl(): string {
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      return this.DEPLOYED_API_URL;
    }
    return this.useLocalhost ? this.LOCAL_API_URL : this.DEPLOYED_API_URL;
  },

  getPhotoUrl(url: string | undefined): string {
    if (!url) return "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150";
    if (url.startsWith("http://localhost") || url.startsWith("https://localhost")) {
      return url;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const apiUrl = this.getApiUrl();
      if (url.includes("/uploads/")) {
        const fileName = url.substring(url.indexOf("/uploads/") + 9);
        return `${apiUrl}/uploads/${fileName}`;
      }
      return url;
    }
    if (url.startsWith("/uploads/") || url.startsWith("uploads/")) {
      const cleanPath = url.startsWith("/") ? url : `/${url}`;
      return `${this.getApiUrl()}${cleanPath}`;
    }
    return url;
  }
};
