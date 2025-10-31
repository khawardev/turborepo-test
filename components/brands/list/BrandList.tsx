import { getBrandbyIdWithCompetitors, getBrands, getCompetitors } from "@/server/actions/brandActions";
import { Brand } from "@/types";
import BrandItem from "@/components/brands/list/BrandItem";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/server/actions/authActions";
import { getWebsiteBatchId } from "@/server/actions/website/websiteScrapeActions";

async function BrandList() {
  const brands: Brand[] = await getBrands();
  const user = await getCurrentUser()

  if (brands.length === 0) {
    return (
      <Card className="flex flex-col gap-3 items-center justify-center text-center h-64 border-dashed border-2">
        <p className="text-sm text-muted-foreground mb-2">
          Get started by adding your first brand.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {brands.map(async (brand, index) => {
        const brandData = await getBrandbyIdWithCompetitors(brand?.brand_id);
        const batch_id = await getWebsiteBatchId(user.client_id, brandData?.brand_id);
        return (
          <BrandItem
            key={brand.brand_id}
            index={index}
            isScrapped={batch_id ? true : false}
            brand={brandData}
          />
        );
      })}
    </div>
  );
}

export default BrandList;