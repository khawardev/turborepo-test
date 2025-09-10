import { getCompetitors, getBrandById } from "@/server/actions/brandActions";
import { getWebsiteCrawlContent } from "@/server/actions/scrapeActions";
import { getCurrentUser } from "@/server/actions/userActions";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

const MarkdownImage = ({ src, alt }: { src?: string; alt?: string }) => {
  if (!src) {
    return null;
  }
  return (
    <Image
      src={src}
      alt={alt || "Markdown Image"}
      width={500}
      height={300}
      className="rounded-md"
    />
  );
};

export default async function CompetitorDashboardPage({
  params,
}: {
  params: { brand_id: string; competitor_name: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return notFound();
  }

  const brand = await getBrandById(params.brand_id, user.client_id);
  if (!brand) {
    return notFound();
  }

  const competitors = await getCompetitors(params.brand_id);
  const competitor = competitors.find(
    (c) => c.name === decodeURIComponent(params.competitor_name),
  );

  if (!competitor) {
    return notFound();
  }

  const crawledContent = await getWebsiteCrawlContent(
    params.brand_id,
    user.client_id,
    // @ts-ignore
    competitor.competitor_id,
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{competitor.name}</h1>
      <Tabs defaultValue="website">
        <TabsList>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="social-media">Social Media</TabsTrigger>
        </TabsList>
        <TabsContent value="website">
          <Card>
            <CardHeader>
              <CardTitle>Scraped Website Content</CardTitle>
            </CardHeader>
            <CardContent>
              {crawledContent.status === "success" &&
              crawledContent.data.length > 0 ? (
                <Tabs defaultValue={crawledContent.data[0].url}>
                  <TabsList>
                    {crawledContent.data.map((item: any) => (
                      <TabsTrigger key={item.url} value={item.url}>
                        {item.url}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {crawledContent.data.map((item: any) => (
                    <TabsContent key={item.url} value={item.url}>
                      <ReactMarkdown
                        components={{
                          img: ({ node, ...props }) => (
                            <MarkdownImage src={props.src as string} alt={props.alt} />
                          ),
                        }}
                      >
                        {item.content}
                      </ReactMarkdown>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <p>No website content scraped yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="social-media">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Social media content will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}