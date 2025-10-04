import { authRequest } from "../server/api/authRequest";


export const authApi = {
    login: async (credentials: any) => {
        const data = await authRequest("/login", "POST", {body: JSON.stringify(credentials)});
        return data;
    },

    register: async (userData: any) => {
        const  data = await authRequest("/register", "POST", {body: JSON.stringify(userData)});
        return data;
    },

    logout: async (refreshToken: string) => {
        const  data = await authRequest("/logout", "POST", {body: JSON.stringify({ refresh_token: refreshToken })});
        return data;
    },

    fetchMe: async (token: string) => {
        const data = await authRequest("/users/me/", "GET", {headers: { Authorization: `Bearer ${token}` }});
        return data;
    },

  
};