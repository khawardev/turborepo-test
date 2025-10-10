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
import { SidebarList } from '@/components/ui/sidebar-list';
import { getCurrentUser } from '@/server/actions/authActions';
import { UserNav } from '@/components/header/UserNav';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { checkAuth } from '@/lib/checkAuth';
import { generateSidebarHrefTree } from '@/lib/generateSidebarHrefTree';

const DashboardLayout = async ({ children, brandData }: any) => {
    await checkAuth();
    const user: any = await getCurrentUser();
    const SidebarHrefTree: any = generateSidebarHrefTree(brandData);
    

    return (
        <SidebarProvider>
            <SidebarList SidebarHrefTree={SidebarHrefTree} />
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
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
export default DashboardLayout;