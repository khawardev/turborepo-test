import { getBrands, getCompetitors } from "@/server/actions/brandActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brand } from "@/types";
import { ContainerMd } from "@/components/shared/containers";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import BrandItem from "@/components/brands/BrandItem";
import { getBulkWebsiteCrawlContent } from "@/server/actions/scrapeActions";
import { TiWarning, TiWarningOutline } from "react-icons/ti";

export default async function BrandsPage() {
  const brands: Brand[] = await getBrands();
  return (
    <ContainerMd >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Brands</h3>
          <p className="text-sm text-muted-foreground">
            View and manage your brands and competitors.
          </p>
        </div>
        <Button asChild>
          <Link href="/brands/new">
            <Plus />
            Brand
          </Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <Card className="flex flex-col gap-3 items-center justify-center text-center h-64 border-dashed border-2">
          <h3 className=" text-5xl opacity-15"><TiWarningOutline/></h3>
          <p className="text-sm text-muted-foreground mb-2">
            Get started by adding your first brand.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {brands.map(async (brand, index) => {
            const competitor = await getCompetitors(brand.brand_id);
            const crawlData = await getBulkWebsiteCrawlContent(brand.brand_id);
            
            return (
              <BrandItem key={brand.brand_id} index={index} crawlData={crawlData.data.contents.length > 0 ? true : false} brand={brand} competitors={competitor.competitors} />
            );
          })}
        </div>
      )}
    </ContainerMd>
  );
}