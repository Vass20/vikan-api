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
  }
};
