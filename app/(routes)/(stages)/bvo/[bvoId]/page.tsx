import { getBvoAgentResults } from "@/server/actions/bvo/agenticActions";
import { ContainerMd } from "@/components/static/shared/Containers";
import StaticBanner from "@/components/static/shared/StaticBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Markdown from 'react-markdown';
import { Separator } from "@/components/ui/separator";


export default async function BvoDetailPage({ params, searchParams }: any) {
  const { bvoId } = await params
  const sessionId = bvoId
  const { brand_id: brandId } = await searchParams
  if (!brandId) {
    return (
      <ContainerMd>
        <StaticBanner title="Error" badge="BVO Execution" />
        <Card>
          <CardContent className="pt-6">
            <p>Brand ID is missing from the URL. Please go back and try again.</p>
          </CardContent>
        </Card>
      </ContainerMd>
    );
  }

  const resultsResponse = await getBvoAgentResults(sessionId, brandId);

  if (!resultsResponse.success || !resultsResponse.data) {
    return (
      <ContainerMd>
        <StaticBanner title={`BVO Session: ${sessionId}`} badge="BVO Execution" />
        <Card>
          <CardContent className="pt-6">
            <p>No results found for this BVO session.</p>
          </CardContent>
        </Card>
      </ContainerMd>
    );
  }

  const { results, brand_id, client_id, task_id } = resultsResponse.data;

  return (
    <ContainerMd>
      <StaticBanner title="BVO Session Details" badge="Execution Report" />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <p><strong>Session ID:</strong> <span className="font-mono text-muted-foreground">{sessionId}</span></p>
          <p><strong>Task ID:</strong> <span className="font-mono text-muted-foreground">{task_id}</span></p>
          <p><strong>Brand ID:</strong> <span className="font-mono text-muted-foreground">{brand_id}</span></p>
          <p><strong>Client ID:</strong> <span className="font-mono text-muted-foreground">{client_id}</span></p>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mt-8 mb-4">Agent Results</h2>
      <div className="space-y-6">
        {results.map((result: any) => (
          <Card key={result.agent_number}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Agent: {result.agent_number}</CardTitle>
                <Badge variant="secondary">{result.model_used}</Badge>
              </div>
              <CardDescription>
                Timestamp: {new Date(result.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Agent Output</h3>
              <div className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-muted/20">
                <Markdown>{result.agent_output}</Markdown>
              </div>
              <Separator className="my-6" />
              <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <p><strong>Entity Type:</strong> {result.entity_type}</p>
                <p><strong>Session ID:</strong> <span className="font-mono">{result.session_id}</span></p>
                <p><strong>PK:</strong> <span className="font-mono">{result.PK}</span></p>
                <p><strong>SK:</strong> <span className="font-mono">{result.SK}</span></p>
                <p><strong>Custom Instructions:</strong> {result.custom_instructions || "None"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ContainerMd>
  );
}
