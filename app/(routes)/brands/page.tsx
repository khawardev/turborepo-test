import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContainerMd } from "@/components/shared/containers";
import { Plus } from "lucide-react";
import BrandList from "@/components/brands/list/BrandList";
import StaticBanner from "@/components/shared/staticBanner";
import { BlurDelay, BlurDelay3 } from "@/components/shared/MagicBlur";

export default function page() {
  return (
    <ContainerMd>
      <StaticBanner title="Coherence & Competitor Baseline Audit" badge={'CCBA Audits'} />
      <BlurDelay className="flex justify-between items-center ">
        <div>
          <h3 className="text-lg font-medium ">Brands</h3>
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
      </BlurDelay>
      <BlurDelay3>
        <BrandList />
      </BlurDelay3>
    </ContainerMd>
  );
}