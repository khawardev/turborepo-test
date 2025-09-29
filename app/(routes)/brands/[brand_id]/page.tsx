import { notFound } from "next/navigation";
import { getBrandById, getCompetitors } from "@/server/actions/brandActions";
import { getBulkWebsiteCrawlContent } from "@/server/actions/scrapeActions";
import BrandDetailClient from "@/components/brands/Brand-Detail-Client";
import {  ContainerMd } from "@/components/shared/containers";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface BrandDetailPageProps {
  params: {
    brand_id: string;
  };
}

export default async function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { brand_id } = await params; 

  const [brand, competitorsResponse, crawlDataResult] = await Promise.all([
    getBrandById(brand_id),
    getCompetitors(brand_id),
    getBulkWebsiteCrawlContent(brand_id),
  ]);

  if (!brand || !crawlDataResult.success) {
    notFound();
  }

  return (
    <ContainerMd>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/brands">Brands</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>{brand.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <BrandDetailClient
        brand={brand}
        competitors={competitorsResponse.competitors}
        crawlData={crawlDataResult.data}
      />
    </ContainerMd>
  );
}