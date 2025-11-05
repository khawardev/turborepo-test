import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sampleBvos = [
  {
    id: "bvo-1",
    name: "Brand",
    brand: "Acme Inc.",
    competitors: ["Vercel", "Netlify"],
    agents: ["Brand Perception", "Social Media Audit"],
    status: "Completed",
    executionMode: "interactive",
  },
  {
    id: "bvo-2",
    name: "Brand",
    brand: "Innovate Co.",
    competitors: ["StartupX", "FutureTech"],
    agents: ["Website Audit", "Brand Perception", "Social Media Audit", "Earned Media Analysis", "Synthesized Report"],
    status: "In Progress",
    executionMode: "interactive",
  },
];

export default function BvoList() {
  return (
    <div className="space-y-4">
      {sampleBvos.map((bvo) => (
        <Card key={bvo.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{bvo.name}</CardTitle>
                <CardDescription>{bvo.brand}</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href={`/bvo/${bvo.id}`}>View</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-medium">Competitors:</h4>
              <p className="text-sm text-muted-foreground">{bvo.competitors.join(", ")}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium">Agents:</h4>
              <p className="text-sm text-muted-foreground">{bvo.agents.join(", ")}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium">Status:</h4>
              <p className="text-sm text-muted-foreground">{bvo.status}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
