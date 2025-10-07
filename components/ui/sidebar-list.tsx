'use client'
import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FullLogo } from "@/components/shared/logo"
import { SidebarHrefTree } from "@/config/sidebar-config"

interface NavItem {
    title: string
    url?: string
    items?: NavItem[]
    isExpandable?: boolean
    isRoot?: boolean
}

export function SidebarList({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    return (
        <Sidebar {...props} variant='inset'>
            <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton className="hover:bg-none focus:bg-none" asChild>
                                <FullLogo />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {SidebarHrefTree.navMain.map((item) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton variant={pathname !== item.url ? "default" : "primary"} asChild >
                                            <Link href={item.url} className="flex justify-between w-full">
                                                <span className="flex items-center gap-2">{item.title}</span>
                                                {pathname === item.url && <p>{item.seprator}</p>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    )
}
