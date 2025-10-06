import { getBrands, getCompetitors } from "@/server/actions/brandActions";
import { Brand, Competitor } from "@/types";
import BrandItem from "@/components/brands/list_brand/BrandItem";
import { Card } from "@/components/ui/card";
import { getBatchId } from "@/server/actions/scrapeActions";
import { getCurrentUser } from "@/server/actions/authActions";

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

  const competitorsPromises = brands.map((brand) => getCompetitors(brand.brand_id));
  const competitorsResults = await Promise.all(competitorsPromises);

  const competitorsMap = competitorsResults.reduce((acc, result) => {
    acc[result.brand_id] = result.competitors;
    return acc;
  }, {} as Record<string, Competitor[]>);


  const brandsWithBatch = await Promise.all(
    brands.map(async (brand, index) => {
      const competitors = competitorsMap[brand.brand_id] || [];
      const batch_id = await getBatchId(user.client_id, brand.brand_id);
      return (
        <BrandItem
          key={brand.brand_id}
          index={index}
          isScrapped={batch_id ? true : false}
          brand={brand}
          competitors={competitors}
        />
      );
    })
  );
  return (
    <div className="space-y-4">
      {brandsWithBatch}
    </div>
  );
}

export default BrandList;