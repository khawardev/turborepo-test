import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sampleBams = [
  {
    id: "bam-1",
    name: "Brand",
    brand: "Acme Inc.",
    competitors: ["Vercel", "Netlify"],
    agents: ["Brand Perception", "Social Media Audit"],
    status: "Completed",
    executionMode: "interactive",
  },
  {
    id: "bam-2",
    name: "Brand",
    brand: "Innovate Co.",
    competitors: ["StartupX", "FutureTech"],
    agents: ["Website Audit", "Brand Perception", "Social Media Audit", "Earned Media Analysis", "Synthesized Report"],
    status: "In Progress",
    executionMode: "interactive",
  },
];

export default function BamList() {
  return (
    <div className="space-y-4">
      {sampleBams.map((bam) => (
        <Card key={bam.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{bam.name}</CardTitle>
                <CardDescription>{bam.brand}</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href={`/bvo/${bam.id}`}>View</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-medium">Competitors:</h4>
              <p className="text-sm text-muted-foreground">{bam.competitors.join(", ")}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium">Agents:</h4>
              <p className="text-sm text-muted-foreground">{bam.agents.join(", ")}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium">Status:</h4>
              <p className="text-sm text-muted-foreground">{bam.status}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
