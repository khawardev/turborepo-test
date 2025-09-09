import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/actions/userActions";
import { UserNav } from "../header/UserNav";
import { ContainerNoPy } from "./containers";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b">
      <ContainerNoPy className="h-16 flex items-center justify-between">
        <h1 className="text-xl tracking-tight font-bold">
          <Link href={"/"}>BrandOS</Link>
        </h1>
        <div className="flex items-center gap-4">
          {user ? (
            <UserNav user={user} />
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </ContainerNoPy>
    </header>
  );
}