'use client'

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarHref } from "@/config/repurai-sidebar-config"
export const SidebarList = () => {
    const pathname = usePathname();

    const activeIndex = SidebarHref.feedNav.findIndex(section =>
        section.items.some(item => pathname === item.url)
    ); 

  return (
      <>
          <SidebarGroup>
              <SidebarGroupLabel >{SidebarHref.mainTitle}</SidebarGroupLabel>
          </SidebarGroup>
          <SidebarMenu >
              {SidebarHref.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                          variant={pathname === item.url ? "primary" : "ghost"}
                          asChild
                          isActive={pathname === item.url}
                      >
                          <Link href={item.url} className="flex-between">
                              <span className="flex items-center">{item.title}</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              ))}
          </SidebarMenu>
          <SidebarGroup>
              <SidebarGroupLabel >{SidebarHref.feedTitle}</SidebarGroupLabel>
          </SidebarGroup>
          <Accordion
              type="single"
              collapsible
              defaultValue={activeIndex !== -1 ? `item-${activeIndex}` : undefined}
              className="w-full"
          >
              {SidebarHref.feedNav.map((section, index) => (
                  <AccordionItem key={section.title} value={`item-${index}`}>
                      <AccordionTrigger>{section.title}</AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-1 mt-1">
                          {section.items.map((subItem) => (
                              <SidebarMenuItem key={subItem.title}>
                                  <SidebarMenuButton
                                      variant={pathname === subItem.url ? 'outline' : 'default'}
                                      asChild
                                      isActive={pathname === subItem.url}
                                  >
                                      <Link href={subItem.url} className="flex-between">
                                          <span className="flex items-center gap-2">{subItem.title}</span>
                                      </Link>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                          ))}
                      </AccordionContent>
                  </AccordionItem>
              ))}
          </Accordion>
      </>
  )
}

export default SidebarMenu