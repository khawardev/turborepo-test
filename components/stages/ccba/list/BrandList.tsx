import { getBrandbyIdWithCompetitors, getBrands } from "@/server/actions/brandActions";
import BrandItem from "@/components/stages/ccba/list/BrandItem";
import { Card } from "@/components/ui/card";
import { getWebsiteBatchId } from "@/server/actions/ccba/website/websiteScrapeActions";
import { getCurrentUser } from "@/server/actions/authActions";
import { toast } from "sonner";

async function BrandList() {
  const user = await getCurrentUser();
  const brands = await getBrands();

  if (!brands || brands.length === 0) {
    return (
      <Card className="flex flex-col gap-3 items-center justify-center text-center h-64 border-dashed border-2">
        <p className="text-sm text-muted-foreground mb-2">
          Get started by adding your first brand.
        </p>
      </Card>
    );
  }

  const brandItemsData = await Promise.all(
    brands.map(async (brand: any) => {
      const brandData = await getBrandbyIdWithCompetitors(brand?.brand_id);
      if (!brandData) {
        toast.error("Failed to fetch brand details.");
        return null;
      }
      const batch_id = await getWebsiteBatchId(brandData?.brand_id);
      return {
        brand: brandData,
        isScrapped: batch_id ? true : false,
      };
    })
  );

  const filteredBrandItemsData = brandItemsData.filter(Boolean);

  return (
    <div className="px-1 mb-2">
      {filteredBrandItemsData.map((item: any, index: any) => (
        <BrandItem
          key={item.brand.brand_id}
          index={index}
          isScrapped={item.isScrapped}
          brand={item.brand}
        />
      ))}
    </div>
  );
}

export default BrandList;