import { getBrands, getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import GatherBrandItem from "./GatherBrandItem";
import { getCurrentUser } from "@/server/actions/authActions";
import { getWebsiteBatchId } from "@/server/actions/ccba/website/websiteScrapeActions";
import { EmptyStateCard } from "@/components/shared/CardsUI";

export default async function GatherBrandList() {
  const user = await getCurrentUser();
  const brands = await getBrands();

  if (!brands || brands.length === 0) {
    return (
      <EmptyStateCard message="Get started by adding your first brand in Setup."/>
    );
  }

  // Pre-fetch some data if needed, similar to BrandList
  const brandItemsData = await Promise.all(
    brands.map(async (brand: any) => {
      // Fetch details including competitors
      const brandData = await getBrandbyIdWithCompetitors(brand?.brand_id);
      
      // Check if partially scraped? 
      // For Gather list, we might just want to show them all. 
      // Reuse logic if meaningful:
      const batch_id = await getWebsiteBatchId(brandData?.brand_id);
      
      return {
        brand: brandData,
        isScrapped: !!batch_id,
      };
    })
  );

  const filteredBrandItemsData = brandItemsData.filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredBrandItemsData.map((item: any, index: number) => (
        <GatherBrandItem
          key={item.brand.brand_id}
          index={index}
          isScrapped={item.isScrapped}
          brand={item.brand}
        />
      ))}
      </div>
    </div>
  );
}
