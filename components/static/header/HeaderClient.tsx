'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserNav } from "./UserNav"
import { UserNavSkeleton } from "./UserNavSkeleton"
import { FullLogo } from "../shared/Logo"
import { ThemeSwitcher } from "../../ui/theme-switcher"
import { usePathname } from "next/navigation"
import { BrandOSConfig } from "@/config/brandos-config"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function HeaderClient({user}:any) {
  const pathname = usePathname()
  if (pathname.startsWith("/ccba/dashboard")) return null

  return (
    <header className="z-30 fixed top-5 w-full">
      <div className="flex flex-row h-11 px-2 items-center mx-auto max-w-6xl justify-between gap-3    ">
        <Link href="/">
          <FullLogo />
        </Link>
        <ul className={`flex px-2 h-11  items-center justify-end gap-2 rounded-full backdrop-blur-2xl`}>
          {user &&
            BrandOSConfig.mainNav.map((item: any, index: number) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className=" rounded-full"
                      variant={pathname === item.href ? "outline" : "ghost"}
                      size="sm"
                    >
                      <Link href={item.href}>
                        <span>{item.title}</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={15} side="bottom">
                    <p>{item.desc}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          <div className={`${user && 'md:border-l pl-4'}  flex items-center gap-2`}>
            {!user ? (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            ) : (
              <UserNav user={user} />
            )}
            <ThemeSwitcher />
          </div>
        </ul>
      </div>
    </header>
  )
}