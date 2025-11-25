"use client";

import { logout } from "@/server/actions/authActions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Button
      variant={'destructive'}
      onClick={handleLogout}
    >
      Sign out
    </Button>
  );
}
