import { getBrands } from "@/server/actions/brandActions";
import { getBvoHistory, getBvoAgentResults } from "@/server/actions/bvo/agenticActions";
import BvoItem from "./BvoItem";
import { Card } from "@/components/ui/card";

export default async function BvoList() {
  const brands = await getBrands();

  if (!brands || brands.length === 0) {
    return (
      <Card className="flex flex-col gap-3 items-center justify-center text-center h-64 border-dashed border-2">
        <p className="text-sm text-muted-foreground mb-2">
          No brands found. Please add a brand first.
        </p>
      </Card>
    );
  }

  const brandsWithHistory = await Promise.all(
    brands.map(async (brand) => {
      const historyRes = await getBvoHistory(brand.brand_id)

      if (!historyRes.success || historyRes.data.history.length === 0) return null

      const items = await Promise.all(
        historyRes.data.history.map(async (bvo:any) => {
          const results = await getBvoAgentResults(bvo.session_id, brand.brand_id)
          return { bvo, brand, results }
        })
      )

      return { brand, items }
    })
  )
  return (
    <div className="space-y-4">
      {brandsWithHistory.map((entry) => {
        if (!entry) return null

        return entry.items.map((item) => (
          <BvoItem
            key={item.bvo.session_id}
            bvo={item.bvo}
            brand={item.brand}
            results={item.results}
          />
        ))
      })}
    </div>
  );
}
