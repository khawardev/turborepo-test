"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EmptyStateCard } from "@/components/shared/CardsUI";

function BvoResults({ results }: { results: any }) {
  if (!results) {
    return <EmptyStateCard message="No results found for this session." />;
  }

  return (
    <div className="space-y-4">
      {results.results.map((result: any) => (
        <div key={result.agent_number}>
          <h4 className="font-medium">Agent: {result.agent_number}</h4>
          <div className=" w-full line-clamp-1">

          {/* <p className="text-sm text-muted-foreground truncate">{result.agent_output}</p> */}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BvoItem({ bvo, brand, results }: { bvo: any; brand: any; results: any }) {
  
  return (
    <Card className="w-full border-none shadow-none rounded-none border-x-0  relative transition-all mt-1" >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>BVO Execution</CardTitle>
            <CardDescription>Brand: {brand.name}</CardDescription>
            <CardDescription>Session ID: {bvo.session_id}</CardDescription>
            <CardDescription>Date: {new Date(bvo.date).toLocaleString()}</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link href={`/dashboard/bvo/${bvo.session_id}?brand_id=${brand.brand_id}`}>View</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <BvoResults results={results} />
      </CardContent>
    </Card>
  );
}
