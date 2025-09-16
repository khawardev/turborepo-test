import { getBrands } from "@/server/actions/brandActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brand } from "@/types";
import { ContainerXs } from "@/components/shared/containers";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import BrandItem from "@/components/brands/BrandItem";

export default async function BrandsPage() {
  const brands: Brand[] = await getBrands();

  return (
    <ContainerXs >
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
        <Card className="flex flex-col items-center justify-center text-center h-64 border-dashed border-2">
          <h3 className="text-lg font-medium mb-2">No Brands Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started by adding your first brand.
          </p>
          <Button asChild>
            <Link href="/brands/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Brand
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {brands.map((brand) => (
            <BrandItem key={brand.brand_id} brand={brand} />
          ))}
        </div>
      )}
    </ContainerXs>
  );
}