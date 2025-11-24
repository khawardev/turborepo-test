import * as React from "react"
import {
    FileText,
    Home,
    Key,
    PieChart,
    Settings,
    SquareTerminal,
    Command,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/Firecrawl/sidebar"
import { FullLogo, HalfLogo } from "../Logo"
import SidebarUserV2 from "./sidebar-user-v2"
import { SidebarListV2 } from "./sidebar-list-v2"
import WhatsNew from "./whats-new"
import SidebarCollapsable from "./sidebar-collpasable"

const data = {
    user: {
        name: "Khawar Sultan",
        email: "khawarsultan.developer@gmail.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Overview",
            url: "#",
            icon: Home,
            isActive: false,
        },
        {
            title: "Playground",
            url: "/dashboard/playground",
            icon: SquareTerminal,
            isActive: false,
        },
    ],
    navExtract: [
        {
            title: "Extract",
            url: "#",
            icon: FileText,
            isActive: true,
            items: [
                {
                    title: "Overview",
                    url: "#",
                },
                {
                    title: "Playground",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Activity Logs",
            url: "#",
            icon: FileText,
        },
        {
            title: "Usage",
            url: "#",
            icon: PieChart,
        },
        {
            title: "API Keys",
            url: "#",
            icon: Key,
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings,
            isActive: true,
        },
    ],
}

export function LeftSidebarV2({ ...props }: React.ComponentProps<typeof Sidebar>) {

    return (
        <Sidebar collapsible="icon" variant='inset' {...props}>
            <SidebarHeader>
                <div className="mt-2">
                    <div className="hidden group-data-[collapsible=icon]:block">
                        <HalfLogo />
                    </div>
                    <div className="block group-data-[collapsible=icon]:hidden">
                        <FullLogo />
                    </div>
                </div>
                <div className="px-1 mt-2 relative group-data-[collapsible=icon]:hidden text-base">
                    <div className="relative">
                        <Command className="absolute left-2 top-2.5 size-3.5 text-muted-foreground" />
                        <SidebarInput placeholder="Search" className="pl-8 bg-background border-input" />
                        <div className="absolute right-2 top-2 hidden items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </div>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarListV2 data={data} />
            </SidebarContent>
            <SidebarFooter>
                <WhatsNew/>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarUserV2 />
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarCollapsable/>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}