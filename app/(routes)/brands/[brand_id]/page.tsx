import { getBrandbyIdWithCompetitors } from "@/server/actions/brandActions";
import { getCurrentUser } from "@/server/actions/authActions";
import { getBatchId } from "@/server/actions/scrapeActions";
import { notFound } from "next/navigation";
import BrandDetailClient from "@/components/brands/view_brand/Brand-Detail-Client";

export default async function BrandDetailPage({params}: { params: { brand_id: string }}) {
  const brand = await getBrandbyIdWithCompetitors(params.brand_id);

  if (!brand) {
    notFound();
  }
  const user = await getCurrentUser();
  const batch_id = await getBatchId(user.client_id, brand.brand_id);

  return <BrandDetailClient brand={brand} isScrapped={batch_id} />;
}
