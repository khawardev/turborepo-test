'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function SidebarBrands({ brands }: { brands: any[] }) {
    const pathname = usePathname()

    if (!brands?.length) return null

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Brands</SidebarGroupLabel>
            <SidebarMenu>
                {brands.map(brand => (
                    <BrandItem key={brand.brand_id} brand={brand} pathname={pathname} />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

function BrandItem({ brand, pathname }: { brand: any; pathname: string }) {
    const brandUrl = `/dashboard/ccba/dashboard/brand/${brand.brand_id}`
    const isBrand = pathname.includes(brand.brand_id)

    const isCompetitor = brand.competitors?.some((c: any) =>
        pathname.includes(c.competitor_id)
    )

    const open = isBrand || isCompetitor
    const [isOpen, setIsOpen] = React.useState(open)

    React.useEffect(() => {
        if (open) setIsOpen(true)
    }, [open])

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton asChild isActive={isBrand}>
                        <Link href={brandUrl}>{brand.name}</Link>
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarGroupLabel>Competitors</SidebarGroupLabel>
                    <SidebarMenuSub>
                        {brand.competitors?.map((comp: any) => {
                            const url = `/dashboard/ccba/dashboard/brand/${brand.brand_id}/competitor/${comp.competitor_id}`
                            const active = pathname === url

                            return (
                                <SidebarMenuSubItem key={comp.competitor_id}>
                                    <SidebarMenuSubButton asChild isActive={active}>
                                        <Link href={url}>{comp.name}</Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            )
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}