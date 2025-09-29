import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/actions/userActions";
import { UserNav } from "./UserNav";
import { ContainerNoPy } from "../shared/containers";
import { FullLogo } from "../shared/logo";
import { ThemeSwitcher } from "../ui/theme-switcher";
import { BrandOSConfig } from "@/config/routes";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="z-30 absolute top-5 w-full ">
      <div className="flex h-14 items-center mx-auto max-w-6xl justify-between gap-3  px-3">
        <Link href={'/'}><FullLogo /></Link>
        <ul className="flex flex-1 items-center justify-end gap-2">
          <li className="lg:pr-4 md:not-sr-only sr-only">
            {user &&
              BrandOSConfig.mainNav.map((item: any, index: any) => (
                <Button variant={'ghost'} size={'sm'} key={index}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                    <span>{item.title}</span>
                  </Link>
                </Button>
              ))
            }
          </li>
          <div className="md:border-l pl-4 flex items-center gap-2">
            {!user &&
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            }
            {user && <UserNav user={user} />}
            <ThemeSwitcher />
          </div>

        </ul>
      </div>
    </header>
  );
}