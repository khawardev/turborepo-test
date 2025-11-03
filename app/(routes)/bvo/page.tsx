import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContainerMd } from "@/components/shared/containers";
import { Plus } from "lucide-react";
import StaticBanner from "@/components/shared/staticBanner";
import { BlurDelay, BlurDelay3 } from "@/components/shared/MagicBlur";
import BamList from "@/components/bam/BamList";

export default function page() {
  return (
    <ContainerMd>
      <StaticBanner title="Brand Validation & Optimization" badge={'BVO Audits'} />
      <BlurDelay className="flex justify-between items-center ">
        <div>
          <h3 className="text-lg font-medium ">Brands Action Models</h3>
          <p className="text-sm text-muted-foreground">
            View and manage your BAMs.
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
        <BamList />
      </BlurDelay3>
    </ContainerMd>
  );
}
