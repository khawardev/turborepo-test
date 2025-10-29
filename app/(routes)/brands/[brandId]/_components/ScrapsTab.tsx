import ScrapDataViewer from "@/components/brands/detail/scraps/ScrapDataViewer";
import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { Suspense } from "react";
import WebsiteScrapsServer from "@/components/brands/detail/scraps/website/WebsiteScrapsServer";
import SocialScrapsServer from "@/components/brands/detail/scraps/social/SocialScrapsServer";
import ScrapDataViewerSkeleton from "./_skeleton/ScrapDataViewerSkeleton";

export default async function ScrapsTab({ brandId }: { brandId: string }) {
  const brandData = await getBrandbyIdWithCompetitors(brandId);

  return (
    <ScrapDataViewer
      websiteScrapsContent={
        <Suspense fallback={<ScrapDataViewerSkeleton />}>
          <WebsiteScrapsServer brand_id={brandId} brandName={brandData.name} />
        </Suspense>
      }
      socialScrapsContent={
        <Suspense fallback={<ScrapDataViewerSkeleton />}>
          <SocialScrapsServer brand_id={brandId} brandName={brandData.name} />
        </Suspense>
      }
    />
  );
}
