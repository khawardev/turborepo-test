"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function BvoResults({ results }: { results: any }) {
  if (!results.success || !results.data || results.data.results.length === 0) {
    return <p className="text-sm text-muted-foreground">No results found for this session.</p>;
  }

  return (
    <div className="space-y-4">
      {results.data.results.map((result: any) => (
        <div key={result.agent_number}>
          <h4 className="font-medium">Agent: {result.agent_number}</h4>
          <p className="text-sm text-muted-foreground truncate">{result.agent_output}</p>
        </div>
      ))}
    </div>
  );
}

export default function BvoItem({ bvo, brand, results }: { bvo: any; brand: any; results: any }) {
  console.log(bvo, 'bvo bvo')
  console.log(results, 'results results')
  
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>BVO Execution</CardTitle>
            <CardDescription>Brand: {brand.name}</CardDescription>
            <CardDescription>Session ID: {bvo.session_id}</CardDescription>
            <CardDescription>Date: {new Date(bvo.date).toLocaleString()}</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link href={`/bvo/${bvo.session_id}?brand_id=${brand.brand_id}`}>View</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <BvoResults results={results} />
      </CardContent>
    </Card>
  );
}
