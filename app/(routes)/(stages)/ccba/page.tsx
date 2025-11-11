import BrandList from "@/components/stages/ccba/list/BrandList";
import { ContainerMd } from "@/components/static/shared/Containers";
import { BlurDelay, BlurDelay3 } from "@/components/static/shared/MagicBlur";
import StaticBanner from "@/components/static/shared/StaticBanner";
import { Button } from "@/components/ui/button";
import { checkAuth } from "@/lib/static/checkAuth";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function page() {
  await checkAuth();
  return (
    <ContainerMd>
      <StaticBanner
        title="Perception & Competitor Baseline Audit"
        badge={"CCBA Audits"}
      />
      <BlurDelay className="flex justify-between items-center ">
        <div>
          <h3 className="text-lg font-medium ">Brands</h3>
          <p className="text-sm text-muted-foreground">
            View and manage your brands and competitors.
          </p>
        </div>
        <Button asChild>
          <Link href="/ccba/new">
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
