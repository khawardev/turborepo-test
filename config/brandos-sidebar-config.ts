import { PiHandshakeDuotone } from "react-icons/pi";
import { MdOutlineBrandingWatermark } from "react-icons/md";
import { RiLoopRightLine } from "react-icons/ri";
import { LuBrain } from "react-icons/lu";
import { AiOutlineSetting } from "react-icons/ai";
import { AiOutlinePieChart } from "react-icons/ai";
import { AiOutlineKey } from "react-icons/ai";

export const BrandOSConfig: any = {
    mainNav: [
        {
            title: "Perception Intelligence",
            href: "/dashboard/ccba",
            desc: 'See how the brand and competitors truly show up.',
            icon: LuBrain
        },
        {
            title: "Intention Intelligence",
            href: "/dashboard/bvo",
            desc: 'Define the brand you intend to express and scale.',
            icon: PiHandshakeDuotone
        },
        {
            title: "Ground Truth & Content Studio",
            href: "/dashboard/cge",
            desc: ' Reconcile perception and intention activate system logic and creation.',
            icon: MdOutlineBrandingWatermark
        },
        {
            title: "Evolution Loop",
            href: "/dashboard/cbc",
            desc: 'Monitor, learn, refine with human-approved improvements.',
            icon: RiLoopRightLine
        },
    ],
    secondaryNav: [
        // {
        //     title: "Usage",
        //     url: "/dashboard/usage",
        //     icon: AiOutlinePieChart
        // },
        // {
        //     title: "API Keys",
        //     url: "/dashboard/keys",
        //     icon: AiOutlineKey
        // },
        // {
        //     title: "Settings",
        //     url: "/dashboard/settings",
        //     icon: AiOutlineSetting,
        //     isActive: true
        // },
    ],
};

export const siteConfig = {
    name: "Brand OS | Humanbrand AI",
    url: "http://localhost:3000",
    description: "Get Brand Clarity & Visibility by Brand OS",
};