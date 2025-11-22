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
import { FullLogo } from "@/components/static/shared/Logo"
import { BreadcrumbSeparator } from "../../../ui/breadcrumb"
import { SidebarUser } from "./sidebar-user"

export function LeftSidebar({
    SidebarHrefTree,
    ...props
}: React.ComponentProps<typeof Sidebar> & { SidebarHrefTree: any }) {
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
                {/* <SidebarList /> */}
                {SidebarHrefTree.navMain.map((item:any) => (
                    <SidebarGroup key={item.title}>
                        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {item.items.map((item: any) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton variant={pathname !== item.url ? "ghost" : "primary"} asChild >
                                            <Link href={item.url} className="flex justify-between w-full">
                                                <span className="flex items-center gap-2">{item.title.charAt(0).toUpperCase() + item.title.slice(1)}</span>
                                                {pathname === item.url && <p><BreadcrumbSeparator /></p>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))} 
            </SidebarContent>
            <SidebarFooter>
                <SidebarUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
