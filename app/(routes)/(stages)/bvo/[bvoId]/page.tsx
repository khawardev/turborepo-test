import { ContainerMd } from "@/components/static/shared/Containers";
import StaticBanner from "@/components/static/shared/StaticBanner";
import { BlurDelay3 } from "@/components/static/shared/MagicBlur";
import BvoExecution from "@/components/stages/bvo/BvoExecution";

export default function BvoDetailPage({
  params,
  searchParams,
}: {
  params: { bvoId: string };
  searchParams: { mode?: string };
}) {
  const bvoId = params.bvoId;
  // In a real app, you would fetch BVO data here based on bvoId
  const bvoData = {
    id: bvoId,
    name: "Q4 Competitive Analysis",
    executionMode: searchParams.mode || "interactive", // Default to interactive
  };

  return (
    <ContainerMd>
      <StaticBanner title={bvoData.name} badge={`BVO Execution`} />
      <BlurDelay3>
        <BvoExecution bvo={bvoData} />
      </BlurDelay3>
    </ContainerMd>
  );
}
