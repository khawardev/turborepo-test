'use client'
import { Separator } from "@/components/ui/separator"
import {
    SidebarHeader,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/Firecrawl/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Book, ChevronsUpDown, CircleHelp, Plus, Settings, Smile, Users, X } from "lucide-react"
import { AppSidebar } from "@/components/Firecrawl/app-sidebar"
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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"
import { RiUserSmileLine } from "react-icons/ri"
import { LeftSidebarV2 } from "@/components/static/shared/sidebarV2/left-sidebar-v2"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(false)

    return (
        <SidebarProvider>
            <LeftSidebarV2 />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear  bg-accent/30">
                    <div className="flex items-center gap-2 mr-auto">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div className="flex items-center gap-2">
                            <DropdownMenu open={open} onOpenChange={setOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' >
                                        <span className="size-4 rounded bg-primary text-background flex items-center justify-center text-[10px] font-bold">P</span>
                                        Personal Team
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64" align="start" side="bottom" sideOffset={4}>
                                    <DropdownMenuLabel
                                        label="Teams"
                                        rootOpenSetter={setOpen}
                                    />
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        className="bg-accent "
                                    >
                                        <div className="flex items-center justify-center size-6 rounded-md bg-primary text-background text-xs font-bold">P</div>
                                        <span className="font-medium">Personal</span>
                                        <div className="ml-auto size-2 rounded-full bg-primary" />
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem>
                                        <Plus />
                                        <span>New Team</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Settings />
                                        <span>Team Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <RiUserSmileLine />
                                        <span>Invite Members</span>
                                    </DropdownMenuItem>

                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="size-4" />
                            <span className="absolute top-2 right-2 size-2 rounded-full bg-primary  border"></span>
                        </Button>
                        <Button variant="ghost" >
                            <CircleHelp className="size-4" />
                            Help
                        </Button>
                        <Button variant="ghost" >
                            <Book className="size-4" />
                            Docs
                        </Button>
                        <Button  >
                            <Plus />
                            Upgrade
                        </Button>
                    </div>
                </header>
                <div>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}