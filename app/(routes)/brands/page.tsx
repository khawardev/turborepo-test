import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContainerMd } from "@/components/shared/containers";
import { Plus } from "lucide-react";
import BrandList from "@/components/brands/list_brand/BrandList";

export default function BrandsPage() {
  return (
    <ContainerMd>
      <div className="flex justify-between items-center ">
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
      <BrandList />
    </ContainerMd>
  );
}


