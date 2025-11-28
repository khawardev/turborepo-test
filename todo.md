# Google SSO Integration for Next.js

A streamlined guide for frontend developers to integrate Google Single Sign-On (SSO).

## 1. Environment Setup

Add to your `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=https://api.brandos.humanbrand.ai
```

## 2. API Client (token management)

Create `lib/api.ts`:

```typescript
// lib/api.ts
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface User {
  user_id: string;
  email: string;
  name: string;
  is_admin: boolean;
}

class APIClient {
  private accessToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  getAuthHeader() {
    return this.accessToken
      ? { Authorization: `Bearer ${this.accessToken}` }
      : {};
  }

  async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    });

    if (response.status === 401) {
      this.clearTokens();
      window.location.href = "/login";
    }

    return response;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.fetch("/users/me/");
      return response.ok ? await response.json() : null;
    } catch {
      return null;
    }
  }
}

export const apiClient = new APIClient();
```

## 3. Google Login Button

Create `components/GoogleLoginButton.tsx`:

```tsx
// components/GoogleLoginButton.tsx
"use client";

import { useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${BACKEND_URL}/login/google`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {isLoading ? "Connecting..." : "Continue with Google"}
    </button>
  );
}
```

### Auth Context/Provider

Create `contexts/AuthContext.tsx`:

```tsx
// contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiClient, User } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = () => {
    // This will redirect to Google OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/login/google`;
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API logout fails, clear local state
      setUser(null);
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for access token to determine if user should be loaded
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (accessToken) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Check URL parameters for tokens after OAuth callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);

      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");

      if (accessToken && refreshToken) {
        // Store tokens from URL parameters (if backend redirects with tokens)
        apiClient.setTokens({
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: "bearer",
        });

        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // Load user data
        refreshUser();
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

### Backend Configuration for Frontend Redirect

For the SSO flow to work properly, the backend must redirect back to your frontend after authentication instead of returning JSON. The backend code should look like this (already implemented):

```python
# In api/auth_api.py, auth_via_google endpoint
@router.get("/auth/google")
async def auth_via_google(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")
    if user_info:
        email = user_info.get("email")
        db_user = get_user_by_email(email=email)
        if not db_user:
            # Create a new client for the user
            client_data = {
                "company_name": f"{user_info.get('name')}'s Company",
                "contact_email": email,
            }
            created_client = create_db_client(client_data)
            client_id = created_client["client_id"]

            user_data_for_db = {
                "email": email,
                "name": user_info.get("name"),
                "client_id": client_id,
                "is_admin": False,
                "provider": "google",
                "provider_id": user_info.get("sub"),
            }
            create_db_user(user_data=user_data_for_db, client_id=client_id)

        access_token = auth.create_access_token(data={"sub": email})
        refresh_token = auth.create_refresh_token(data={"sub": email})

        # Redirect to frontend with tokens as URL parameters
        frontend_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
        redirect_url = f"{frontend_url}/auth/callback?access_token={access_token}&refresh_token={refresh_token}&token_type=bearer"
        return RedirectResponse(url=redirect_url)

    # Error case - redirect to frontend login page
    frontend_url = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
    return RedirectResponse(url=f"{frontend_url}/login?error=auth_failed")
```

### Alternative: Popup/Modal Flow

If you prefer not to redirect the entire page, you can use a popup window:

```tsx
// components/GoogleLoginButton.tsx - Popup version
const handleGoogleLogin = () => {
  // Open OAuth in popup
  const popup = window.open(
    `${BACKEND_URL}/login/google`,
    "google-oauth",
    "width=500,height=600"
  );

  // Listen for message from popup
  const handleMessage = (event: MessageEvent) => {
    if (
      event.origin !==
      new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000")
        .origin
    ) {
      return;
    }

    if (event.data.type === "OAUTH_SUCCESS") {
      apiClient.setTokens(event.data.tokens);
      // Handle success (close popup, update UI, etc.)
      popup?.close();
      router.push("/dashboard");
    }

    window.removeEventListener("message", handleMessage);
  };

  window.addEventListener("message", handleMessage);
};
```

### Login Page Component

Create `pages/login.tsx` or `app/login/page.tsx`:

```tsx
// app/login/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import GoogleLoginButton from "@/components/GoogleLoginButton";

export default function LoginPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-extrabold">
          Sign in to your account
        </h2>
        <div className="flex justify-center">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
```

### Protected Route Component

Create `components/ProtectedRoute.tsx`:

```tsx
// components/ProtectedRoute.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
```

### Environment Setup (Backend)

Make sure your backend `.env` file has:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend redirect URL
FRONTEND_BASE_URL=http://localhost:3000
```

### Usage in Pages

```tsx
// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Welcome, {user?.name}!</h1>
        <p>Email: {user?.email}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </ProtectedRoute>
  );
}
```

### Token Refreshing

For automatic token refresh, you can set up a timer or intercept API calls:

```tsx
// In API client, add automatic refresh
private async fetchWithRefresh(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let response = await this.fetch(endpoint, options);

  if (response.status === 401) {
    // Try refreshing token
    const newTokens = await this.refreshToken();
    if (newTokens) {
      // Retry the original request with new token
      response = await this.fetch(endpoint, options);
    }
  }

  return response;
}
```

This implementation provides a complete SSO integration with automatic user creation, JWT token management, and proper error handling.