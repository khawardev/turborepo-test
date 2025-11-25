import BrandList from "@/components/stages/ccba/list/BrandList";
import { DashboardHeaderBlock, DashboardLayoutHeading } from "@/components/stages/ccba/dashboard/shared/DashboardComponents";
import { BrandOSConfig } from "@/config/brandos-sidebar-config";
import { BlurDelay3 } from "@/components/shared/MagicBlur";

export default async function page() {
  return (
    <>
      <DashboardLayoutHeading
        title={BrandOSConfig.mainNav[0].title}
        subtitle={BrandOSConfig.mainNav[0].desc}
      />
      <DashboardHeaderBlock
        title="Brands"
        subtitle="View and manage your brands and competitors."
        buttonLabel="Brand"
        buttonHref="/dashboard/ccba/new"
      />
      <BlurDelay3>
        <BrandList />
      </BlurDelay3>
    </>
  );
}
