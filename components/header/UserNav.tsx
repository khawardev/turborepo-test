"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/server/actions/authActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { CiUser } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa6";
import { TiUserOutline } from "react-icons/ti";

type UserNavProps = {
  user: User;
};

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully 🎉");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon'} >
          <Avatar >
            <AvatarImage
              src={`https://avatar.vercel.sh/${user.email}.png`}
              alt={user.name || ""}
            />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
