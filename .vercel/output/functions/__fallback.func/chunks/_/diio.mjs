import { a as useRuntimeConfig } from './nitro.mjs';

const config = useRuntimeConfig();
let cachedToken = null;
let tokenExpiry = 0;
async function getDiioAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now + 5 * 60 * 1e3) {
    return cachedToken;
  }
  const clientId = config.diioClientId;
  const clientSecret = config.diioClientSecret;
  const refreshToken = config.diioRefreshToken;
  const subdomain = config.diioSubdomain || "getontop";
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("DIIO credentials not configured");
  }
  const baseUrl = `https://${subdomain}.diio.com/api/external`;
  try {
    const response = await $fetch(`${baseUrl}/refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken
      }
    });
    cachedToken = response.access_token;
    tokenExpiry = Date.now() + 60 * 60 * 1e3;
    return cachedToken;
  } catch (error) {
    console.error("Failed to get DIIO access token:", error);
    throw new Error(`DIIO authentication failed: ${error.message}`);
  }
}
async function diioRequest(endpoint, options = {}) {
  const token = await getDiioAccessToken();
  const subdomain = config.diioSubdomain || "getontop";
  const baseUrl = `https://${subdomain}.diio.com/api/external`;
  const url = `${baseUrl}${endpoint}`;
  try {
    return await $fetch(url, {
      method: options.method || "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: options.body,
      params: options.params
    });
  } catch (error) {
    console.error(`DIIO API request failed: ${endpoint}`, error);
    throw error;
  }
}

export { diioRequest as d, getDiioAccessToken as g };
//# sourceMappingURL=diio.mjs.map
