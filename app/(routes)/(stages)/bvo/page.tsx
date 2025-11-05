import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContainerMd } from "@/components/static/shared/Containers";
import { Plus } from "lucide-react";
import StaticBanner from "@/components/static/shared/StaticBanner";
import { BlurDelay, BlurDelay3 } from "@/components/static/shared/MagicBlur";
import BvoList from "@/components/stages/bvo/BvoList";

export default function page() {
  return (
    <ContainerMd>
      <StaticBanner title="Brand Validation & Optimization" badge={'BVO Audits'} />
      <BlurDelay className="flex justify-between items-center ">
        <div>
          <h3 className="text-lg font-medium ">Brands</h3>
          <p className="text-sm text-muted-foreground">
            View and manage your brands and competitors BVO Audits
          </p>
        </div>
        <Button asChild>
          <Link href="/bvo/new">
            <Plus />
            Brand
          </Link>
        </Button>
      </BlurDelay>
      <BlurDelay3>
        <BvoList />
      </BlurDelay3>
    </ContainerMd>
  );
}
