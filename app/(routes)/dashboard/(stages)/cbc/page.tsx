import { DashboardInnerLayout, DashboardLayoutHeading } from "@/components/stages/ccba/dashboard/shared/DashboardComponents"
import { BrandOSConfig } from "@/config/brandos-sidebar-config"

const page = () => {
  return (
    <>
      <DashboardLayoutHeading
        title={BrandOSConfig.mainNav[3].title}
        subtitle={BrandOSConfig.mainNav[3].desc}
      />
      <DashboardInnerLayout>
        <div className="flex justify-center  h-[60vh] items-center">
        </div>
      </DashboardInnerLayout >
    </>
  )
}

export default page