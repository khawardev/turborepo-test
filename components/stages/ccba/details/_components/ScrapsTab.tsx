import ScrapDataViewer from "@/components/stages/ccba/details/scraps-tab/ScrapDataViewer";
import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { Suspense } from "react";
import WebsiteScrapsServer from "@/components/stages/ccba/details/scraps-tab/website/WebsiteScrapsServer";
import SocialScrapsServer from "@/components/stages/ccba/details/scraps-tab/social/SocialScrapsServer";
import ScrapDataViewerSkeleton from "./_skeleton/ScrapDataViewerSkeleton";
import { toast } from "sonner";

export default async function ScrapsTab({ brandId }: { brandId: string }) {
  const brandResponse = await getBrandbyIdWithCompetitors(brandId);
  if (!brandResponse.success || !brandResponse.data) {
    toast.error(brandResponse.toast);
    return <div>Error loading brand data.</div>;
  }
  const brandData = brandResponse.data;

  return (
    <ScrapDataViewer websiteScrapsComponent={
        <Suspense fallback={<ScrapDataViewerSkeleton />}>
          <WebsiteScrapsServer brand_id={brandId} brandName={brandData.name} />
        </Suspense>
      }
      socialScrapsComponent={
        <Suspense fallback={<ScrapDataViewerSkeleton />}>
          <SocialScrapsServer brand_id={brandId} brandName={brandData.name} />
        </Suspense>
      }
    />
  );
}
