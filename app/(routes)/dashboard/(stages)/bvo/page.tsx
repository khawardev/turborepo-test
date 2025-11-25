import { BlurDelay3 } from "@/components/shared/MagicBlur";
import BvoList from "@/components/stages/bvo/BvoList";
import { DashboardHeaderBlock, DashboardLayoutHeading } from "@/components/stages/ccba/dashboard/shared/DashboardComponents";
import { BrandOSConfig } from "@/config/brandos-sidebar-config";

export default function page() {
  return (
    <>
      <DashboardLayoutHeading
        title={BrandOSConfig.mainNav[1].title}
        subtitle={BrandOSConfig.mainNav[1].desc}
      />
      <DashboardHeaderBlock
        title="Brands"
        subtitle="View and manage your brands and competitors"
        buttonLabel="Brand"
        buttonHref="/dashboard/bvo/new"
      />
       <BlurDelay3>
        <BvoList />
      </BlurDelay3> 
    </>
  );
}
