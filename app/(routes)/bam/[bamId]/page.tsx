import { ContainerMd } from "@/components/shared/containers";
import StaticBanner from "@/components/shared/staticBanner";
import { BlurDelay3 } from "@/components/shared/MagicBlur";
import BamExecution from "@/components/bam/BamExecution";

export default function BamDetailPage({
  params,
  searchParams,
}: {
  params: { bamId: string };
  searchParams: { mode?: string };
}) {
  const bamId = params.bamId;
  // In a real app, you would fetch BAM data here based on bamId
  const bamData = {
    id: bamId,
    name: "Q4 Competitive Analysis",
    executionMode: searchParams.mode || "interactive", // Default to interactive
  };

  return (
    <ContainerMd>
      <StaticBanner title={bamData.name} badge={`BAM Execution`} />
      <BlurDelay3>
        <BamExecution bam={bamData} />
      </BlurDelay3>
    </ContainerMd>
  );
}
