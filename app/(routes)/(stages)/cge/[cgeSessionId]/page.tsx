import { ContainerMd } from "@/components/static/shared/Containers";
import StaticBanner from "@/components/static/shared/StaticBanner";
import CgeSessionClient from "@/components/stages/cge/CgeSessionClient";

export default async function BvoDetailPage({ params, searchParams }: any) {
  const { cgeSessionId } = await params
  const { brand_id: brandId } = await searchParams

  if (!brandId) {
    return (
      <ContainerMd>
        <StaticBanner title="Error" badge="CGE Session" />
        <p>Brand ID is missing. Please return to the CGE home page and select a session.</p>
      </ContainerMd>
    );
  }

  return (
    <ContainerMd>
      <StaticBanner title="CGE Session" badge={cgeSessionId} />
      <CgeSessionClient cgeSessionId={cgeSessionId} brandId={brandId} />
    </ContainerMd>
  );
}
