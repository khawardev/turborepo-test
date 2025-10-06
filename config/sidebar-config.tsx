import { BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export const SidebarHrefTree = {
    navMain: [
        {
            title: "Brand ",
            items: [
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Magna",
                    url: "/dashboard/magna",
                },
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Brand Perception Audit",
                    url: "/dashboard",
                },
            ],
        },
        {
            title: "Competitors",
            items: [
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Aptiv",
                    url: "/dashboard/aptiv",
                },
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Bosch Mobility",
                    url: "/dashboard/boschmobility",
                },
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Continental",
                    url: "/dashboard/continental",
                },
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Denso",
                    url: "/dashboard/denso",
                },
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Forvia",
                    url: "/dashboard/forvia",
                },
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Gentex",
                    url: "/dashboard/gentex",
                },
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Lear",
                    url: "/dashboard/lear",
                },
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "Valeo",
                    url: "/dashboard/valeo",
                },
                {
                    seprator: <BreadcrumbSeparator />,
                    title: "ZF",
                    url: "/dashboard/zf",
                },
            ],
        }
    ],
}