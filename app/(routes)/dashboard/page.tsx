import * as React from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardInnerLayout } from '@/components/shared/DashboardLayout';
import BrandPerceptionDashboard from '@/components/dashboard/brand-perception/BrandPerceptionDashboard';
import { TreeSidebar } from '@/components/ui/sidebar-list';
import { getCurrentUser } from '@/server/actions/authActions';
import { UserNav } from '@/components/header/UserNav';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import LightRaysWrapper from '@/components/ui/react-bits/LightRaysWrapper';
import { checkAuth } from '@/lib/checkAuth';

const DashboardLayout = async ({ children }: any) => {
    await checkAuth();
    const user: any = await getCurrentUser();



    return (
            <SidebarProvider>
                <TreeSidebar />
                {/* <SidebarInset className='bg-linear-to-t to-background from-muted dark:from-muted/50 dark:border-border border border-zinc-300'  > */}
                <SidebarInset  >
                    <header className="flex h-16 relative justify-between items-center gap-2 border-b px-4 ">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation='vertical' />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <div className='flex gap-2 items-center'>
                            {user && <UserNav user={user} />}
                            <ThemeSwitcher />
                        </div>
                    </header>
                    <div className='relative'>
                        {/* <div aria-hidden className="pointer-events-none absolute inset-0 z-1 isolate hidden opacity-65 contain-strict lg:block" >
                        <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                        <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                        <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                    </div>  */}
                        {children ? children :
                            <DashboardInnerLayout>
                                <BrandPerceptionDashboard />
                            </DashboardInnerLayout>
                        }
                    </div>
                </SidebarInset>
            </SidebarProvider>
    )
}
export default DashboardLayout;