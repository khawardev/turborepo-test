'use client'

import { BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarBrands } from "./sidebar-brands"
import { Separator } from "@/components/ui/separator"

export const SidebarList = ({ data, brands }: any) => {
    const pathname = usePathname()

    return (
        <SidebarGroup>
            <SidebarMenu>
                {data.mainNav.map((item: any) => {
                    const link = item.href || item.url || "#"
                    const isActive = pathname === link
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={isActive}
                            >
                                <Link href={link} className="flex items-center gap-2">
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {pathname === item.url && <p><BreadcrumbSeparator /></p>}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
       
                {data.secondaryNav.map((item: any) => {
                    const link = item.href || item.url || "#"
                    const isActive = pathname === link
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={isActive}
                            >
                                <Link href={link} className="flex items-center gap-2">
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {pathname === item.url && <p><BreadcrumbSeparator /></p>}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                })}
            </SidebarMenu>
            <Separator className="my-3" />
           <SidebarBrands brands={brands} />
        </SidebarGroup>
    )
}