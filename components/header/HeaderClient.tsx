'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "./UserNav"
import { FullLogo } from "../shared/logo"
import { ThemeSwitcher } from "../ui/theme-switcher"
import { usePathname } from "next/navigation"
import { BrandOSConfig } from "@/config/brandos-config"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function HeaderClient({ user }: any) {
  const pathname = usePathname()
  if (pathname.startsWith("/dashboard")) return null

  return (
    <header className="z-30 fixed top-5 w-full">
      <div className="flex  h-14 xl:px-0 px-4 items-center mx-auto max-w-6xl justify-between gap-3  rounded-xl  ">
        <Link href="/">
          <FullLogo />
        </Link>
        <ul className="flex flex-1 items-center justify-end gap-2">
          {user &&
            BrandOSConfig.mainNav.map((item: any, index: number) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={pathname === item.href ? "outline" : "ghost"}
                      size="sm"
                    >
                      <Link href={item.href}>
                        <span>{item.title}</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12} side="bottom">
                    <p>{item.desc}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          <div className="md:border-l pl-4 flex items-center gap-2">
            {!user && (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
            {user && <UserNav user={user} />}
            <ThemeSwitcher />
          </div>
        </ul>
      </div>
    </header>
  )
}