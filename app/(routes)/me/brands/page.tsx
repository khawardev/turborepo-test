import { getBrands } from "@/server/actions/brandActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brand } from "@/types";
import BrandItem from "@/components/brands/BrandItem";
import { ContainerXs } from "@/components/shared/containers";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default async function BrandsPage() {
  const brands: Brand[] = await getBrands();

  return (
    <ContainerXs >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg  font-medium">Brands</h3>
          <p className="text-sm text-muted-foreground">
            View and manage your brands and competitors.
          </p>
        </div>
        <Button asChild>
          <Link href="/me/brands/new"><Plus /> Brand</Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <Card className="flex items-center justify-center h-64 border rounded-md">
          <p className="text-muted-foreground">No brands found.</p>
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