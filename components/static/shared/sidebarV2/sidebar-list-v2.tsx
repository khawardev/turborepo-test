'use client'

import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/Firecrawl/sidebar"
import { usePathname } from "next/navigation"
import { SidebarHref } from "@/config/repurai-sidebar-config"
export const SidebarListV2 = ({data}:any) => {
    const pathname = usePathname();

    const activeIndex = SidebarHref.feedNav.findIndex(section =>
        section.items.some(item => pathname === item.url)
    ); 

  return (
      <>
          <SidebarGroup>
              <SidebarMenu>
                  {data.navMain.map((item:any) => (
                      <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                              <a href={item.url}>
                                  <item.icon />
                                  <span>{item.title}</span>
                              </a>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}

                  {data.navSecondary.map((item: any) => (
                      <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive} className={item.isActive ? "text-orange-600 hover:text-orange-600 bg-orange-50 hover:bg-orange-100" : ""}>
                              <a href={item.url}>
                                  <item.icon className={item.isActive ? "text-orange-600" : ""} />
                                  <span>{item.title}</span>
                              </a>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
              </SidebarMenu>
          </SidebarGroup>
      </>
  )
}

export default SidebarMenu