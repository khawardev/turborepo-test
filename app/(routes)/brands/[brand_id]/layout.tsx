import { getBrandById, getCompetitors } from "@/server/actions/brandActions";
import { getCurrentUser } from "@/server/actions/userActions";
import BrandNav from "@/components/brands/BrandNav";
import { notFound } from "next/navigation";
import { ContainerXs } from "@/components/shared/containers";

export default async function BrandDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { brand_id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return notFound();
  }

  const brand = await getBrandById(params.brand_id, user.client_id);
  if (!brand) {
    return notFound();
  }

  const competitors = await getCompetitors(params.brand_id);
  const brandWithCompetitors = { ...brand, competitors };

  return (
    <ContainerXs className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
      <aside className="border-r pr-4">
        <BrandNav brand={brandWithCompetitors} />
      </aside>
      <main>{children}</main>
    </ContainerXs>
  );
}