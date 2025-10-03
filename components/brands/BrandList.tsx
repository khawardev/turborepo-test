import { getBrands, getCompetitors } from "@/server/actions/brandActions";
import { Brand, Competitor } from "@/types";
import BrandItem from "@/components/brands/BrandItem";
import { Card } from "@/components/ui/card";

async function BrandList() {
  const brands: Brand[] = await getBrands();

  if (brands.length === 0) {
    return (
      <Card className="flex flex-col gap-3 items-center justify-center text-center h-64 border-dashed border-2">
        <p className="text-sm text-muted-foreground mb-2">
          Get started by adding your first brand.
        </p>
      </Card>
    );
  }

  const competitorsPromises = brands.map((brand) =>
    getCompetitors(brand.brand_id)
  );
  const competitorsResults = await Promise.all(competitorsPromises);

  const competitorsMap = competitorsResults.reduce((acc, result) => {
    acc[result.brand_id] = result.competitors;
    return acc;
  }, {} as Record<string, Competitor[]>);

  return (
    <div className="space-y-4">
      {brands.map((brand, index) => {
        const competitors = competitorsMap[brand.brand_id] || [];
        return (
          <BrandItem
            key={brand.brand_id}
            index={index}
            crawlData={false}
            brand={brand}
            competitors={competitors}
          />
        );
      })}
    </div>
  );
}

export default BrandList;