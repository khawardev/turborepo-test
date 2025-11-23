"use client"

import * as React from "react"
import {
    Book,
    ChevronRight,
    FileText,
    Home,
    Key,
    PieChart,
    Settings,
    SquareTerminal,
    ChevronsUpDown,
    LogOut,
    Sparkles,
    Command,
    PanelLeftClose,
    PanelLeft,
    Globe,
    CreditCard,
    Users,
    X,
    Plus,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    SidebarTrigger,
    useSidebar,
} from "@/components/Firecrawl/sidebar"
import { cn } from "@/lib/utils"
import { HoverTracker } from "../ui/hover-tracker"
import { FullLogo, HalfLogo } from "../static/shared/Logo"
import { RiUserSmileLine } from "react-icons/ri"

// Mock Data
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { toggleSidebar, state } = useSidebar()
    const [open, setOpen] = React.useState(false)
    // Mock Team State

    return (
        <Sidebar collapsible="icon" {...props}>
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
                <SidebarGroup>
                    <SidebarMenu>
                        {data.navMain.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                                    <a href={item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                  
                        {data.navSecondary.map((item) => (
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
            </SidebarContent>

            <SidebarFooter>
                {/* <div className="p-1 group-data-[collapsible=icon]:hidden">
                    <div className="bg-accent border  rounded-lg p-3 text-xs space-y-2">
                        <div className="flex items-center gap-2  font-medium">
                            <Sparkles className="size-3.5 " />
                            <span>What's New</span>
                            <span className="ml-auto text-[10px] bg-border px-1 rounded-sm ">11</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2">View our latest update</p>
                    </div>
                </div> */}

                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu open={open} onOpenChange={setOpen}>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 font-bold border border-orange-200">
                                        KS
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{data.user.name}</span>
                                        <span className="truncate text-xs text-muted-foreground">{data.user.email}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-60"
                                side="top"
                                align="start"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel
                                    label="Account"
                                    rootOpenSetter={setOpen} 
                                />
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem><Book />Blog</DropdownMenuItem>
                                    <DropdownMenuItem><FileText />Documentation</DropdownMenuItem>
                                    <DropdownMenuItem><RiUserSmileLine />Join Discord community</DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem><Globe />Domain checker</DropdownMenuItem>
                                    <DropdownMenuItem><Settings />Account Settings</DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem><Settings />Team Settings</DropdownMenuItem>
                                    <DropdownMenuItem><CreditCard />Manage Subscriptions</DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive"> <LogOut />Sign out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={toggleSidebar} className="justify-center text-muted-foreground hover:text-foreground">
                            {state === "expanded" ? (
                                <>
                                    <PanelLeftClose className="mr-2 size-4" />
                                    <span>Collapse</span>
                                </>
                            ) : (
                                <PanelLeft className="size-4" />
                            )}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}