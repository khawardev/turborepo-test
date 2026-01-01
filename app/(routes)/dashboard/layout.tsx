import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, CircleHelp, Plus, } from "lucide-react"

import { LeftSidebar } from "@/components/shared/sidebar/left-sidebar"
import TeamDropdown from "@/components/shared/TeamDropdown"
import { getCurrentUser } from "@/server/actions/authActions"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { getBrandbyIdWithCompetitors, getBrands } from "@/server/actions/brandActions"
import { getBatchSocialReports } from "@/server/actions/ccba/social/socialReportActions";
import { DashboardInnerLayout } from "@/components/stages/ccba/dashboard/shared/DashboardComponents"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();
    const brandsData = await getBrands();

    let brandsWithCompetitors = [];
    if (brandsData && brandsData.length > 0) {
        brandsWithCompetitors = await Promise.all(
            brandsData.map(async (brand: any) => {
                const brandDetails = await getBrandbyIdWithCompetitors(brand.brand_id);
                if (!brandDetails) return null;

                const socialReportData = await getBatchSocialReports(brand.brand_id);
                return {
                    ...brandDetails,
                    isScrapped: socialReportData && socialReportData.length > 0
                };
            })
        );
    }
    const filteredBrands = brandsWithCompetitors.filter(Boolean);


    return (
        <SidebarProvider>
            <LeftSidebar user={user} brands={filteredBrands} />
            <SidebarInset>
                <header className="flex w-full h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear  bg-accent/30 rounded-tl-xl rounded-tr-xl  ">
                    <div className="flex items-center gap-2 mr-auto">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="h-7" />
                        {/* <TeamDropdown /> */}
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
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