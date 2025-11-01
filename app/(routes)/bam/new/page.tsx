import { ContainerMd } from "@/components/shared/containers";
import StaticBanner from "@/components/shared/staticBanner";
import { BlurDelay, BlurDelay2 } from "@/components/shared/MagicBlur";
import NewBamForm from "@/components/bam/NewBamForm";

export default function AddBamPage() {
  return (
    <ContainerMd className="pb-32">
      <StaticBanner title="Create New BAM" badge={'New BAM Page'} />
      <BlurDelay>
        <h3 className="text-lg font-medium">BAM Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure your Brands Action Model.
        </p>
      </BlurDelay>
      <BlurDelay2>
        <NewBamForm />
      </BlurDelay2>
    </ContainerMd>
  );
}
