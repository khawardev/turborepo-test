export function generateSidebarHrefTree(brandData: any) {
    if (!brandData) return { navMain: [] }

    const brandItem = {
        title: "Brand",
        items: [
            {
                title: brandData.name,
                url: `/dashboard/brand/${brandData.brand_id}`,
            },
        ],
    }

    const competitorItems =
        brandData.competitors?.map((comp: any) => ({
            title: comp.name,
            url: `/dashboard/brand/${brandData.brand_id}/competitor/${comp.competitor_id}`,
        })) || []

    const competitorsSection = {
        title: "Competitors",
        items: competitorItems,
    }

    return {
        navMain: [brandItem, competitorsSection],
    }
}