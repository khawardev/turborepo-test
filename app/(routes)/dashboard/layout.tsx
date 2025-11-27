import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Book, CircleHelp, Plus, Settings, } from "lucide-react"

import { LeftSidebar } from "@/components/shared/sidebar/left-sidebar"
import TeamDropdown from "@/components/shared/TeamDropdown"
import { getCurrentUser } from "@/server/actions/authActions"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();
    console.log(user, `<-> user <->`);

    return (
        <SidebarProvider>
            <LeftSidebar user={user} />
            <SidebarInset>
                <header className="flex w-full h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear  bg-accent/30">
                    <div className="flex items-center gap-2 mr-auto">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="h-7" />
                        <TeamDropdown />
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
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
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}