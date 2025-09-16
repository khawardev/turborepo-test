const API_URL = process.env.API_URL;

async function authRequest(endpoint: string, method: "GET" | "POST", options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        body: options.body,
        cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
        throw { status: res.status, detail: data.detail || "API request failed" };
    }
    return { data, headers: res.headers };
}

export const authApi = {
    login: async (credentials: any) => {
        const { data } = await authRequest("/login", "POST", {
            body: JSON.stringify(credentials),
        });
        return data;
    },

    register: async (userData: any) => {
        const { data } = await authRequest("/register", "POST", {
            body: JSON.stringify(userData),
        });
        return data;
    },

    logout: async (refreshToken: string) => {
        const { data } = await authRequest("/logout", "POST", {
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        return data;
    },

    fetchMe: async (token: string) => {
        const { data } = await authRequest("/users/me/", "GET", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    },

    refreshToken: async (refreshToken: string) => {
        const { data } = await authRequest(`/refresh-token?refresh_token=${refreshToken}`, "POST", {});
        return data;
    },
};