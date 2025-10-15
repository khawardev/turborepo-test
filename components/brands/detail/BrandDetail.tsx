import { VercelStyleTabs } from "@/components/shared/CustomTabs";
import { RiAiGenerate, RiChatSmileAiLine, RiImageCircleAiFill, RiUserSmileLine } from "react-icons/ri";
import BrandProfile from "./profile/BrandProfile";
import { Spinner } from "@/components/shared/spinner";
import { ContainerMd } from "@/components/shared/containers";
import { FaBitbucket, FaGoogle } from "react-icons/fa6";
import { Github } from "lucide-react";
import { AnimatedTabs } from "@/components/AnimatedTabs";


export default function BrandDetail({
    brand,
    isScrapped,
}: {
    brand: any;
    isScrapped: boolean;
}) {
    const tabs = [
        { label: "Brand Profile", value: "brand_profile", content: <BrandProfile brand={brand} isScrapped={isScrapped} /> },
        { label: "About", value: "about", content: <BrandProfile brand={brand} isScrapped={isScrapped} /> },
        { label: "Contact", value: "contact", content: <BrandProfile brand={brand} isScrapped={isScrapped} /> },
        { label: "Danger Zone", value: "danger-zone", content: <BrandProfile brand={brand} isScrapped={isScrapped} /> }
    ];
    return (
        <ContainerMd>

            {/* <CustomTabs
                defaultValue="brand_profile"
                triggerMaxWidthClass="max-w-30"
                tabs={[
                    {
                        label: "Profile",
                        value: "brand_profile",
                        icon: <RiAiGenerate />,
                        content: (
                            <BrandProfile brand={brand} isScrapped={isScrapped} />
                        ),
                    },
                    {
                        label: "Image",
                        value: "image_generate",
                        icon: <RiImageCircleAiFill />,
                        content: (
                            <BrandProfile brand={brand} isScrapped={isScrapped} />
                        ),
                    },
                    {
                        label: "Chat",
                        value: "chat",
                        icon: <RiChatSmileAiLine />,
                        content: (
                            <BrandProfile brand={brand} isScrapped={isScrapped} />
                        ),
                    },
                    {
                        label: "Persona",
                        value: "persona",
                        icon: true ? <Spinner /> : <RiUserSmileLine />,
                        content: (
                            <BrandProfile brand={brand} isScrapped={isScrapped} />
                        ),
                    },
                ]}
            /> */}

            <AnimatedTabs tabs={tabs} />
        </ContainerMd>
    );
}
