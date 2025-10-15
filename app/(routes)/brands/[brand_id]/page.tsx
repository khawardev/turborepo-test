import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getCurrentUser } from "@/server/actions/authActions";
import { getBatchId } from "@/server/actions/scrapeActions";
import { notFound } from "next/navigation";
import BrandDetail from "@/components/brands/detail/BrandDetail";

export default async function BrandDetailPage({ params }: { params: Promise<{ brand_id: string }> }) {
  
  const { brand_id } = await params;
  const brand = await getBrandbyIdWithCompetitors(brand_id);

  if (!brand) {
    notFound();
  }
  const user = await getCurrentUser();
  const batch_id = await getBatchId(user.client_id, brand.brand_id);

  return <BrandDetail brand={brand} isScrapped={batch_id} />;
}
