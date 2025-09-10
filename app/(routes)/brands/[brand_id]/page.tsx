import { getBrandById } from "@/server/actions/brandActions";
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

export default async function BrandDashboardPage({
  params,
}: {
  params: { brand_id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    return notFound();
  }

  const brand = await getBrandById(params.brand_id, user.client_id);
  if (!brand) {
    return notFound();
  }

  const crawledContent = await getWebsiteCrawlContent(
    params.brand_id,
    user.client_id,
  );

  const websiteUrls: any[] =
    crawledContent.status === "success"
      ? [...new Set(crawledContent.data.map((item: any) => String(item.url)))]
      : [];

  return (
    <div>
      <h1 className="text-2xl font-bold">{brand.name}</h1>
      <Tabs defaultValue="website">
        <TabsList>
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="social-media">Social Media</TabsTrigger>
        </TabsList>
        <TabsContent value="website">
          {websiteUrls.length > 0 ? (
            <Tabs defaultValue={websiteUrls[0]}>
              <TabsList>
                {websiteUrls.map((url) => (
                  <TabsTrigger key={url} value={url}>
                    {url}
                  </TabsTrigger>
                ))}
              </TabsList>
              {websiteUrls.map((url) => (
                <TabsContent key={url} value={url}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Scraped Content for {url}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {crawledContent.data
                        .filter((item: any) => item.url === url)
                        .map((item: any, index: number) => (
                          <ReactMarkdown
                            key={index}
                            components={{
                              img: ({ node, ...props }) => (
                                <MarkdownImage
                                  src={props.src as string}
                                  alt={props.alt}
                                />
                              ),
                            }}
                          >
                            {item.content}
                          </ReactMarkdown>
                        ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Scraped Website Content</CardTitle>
                </CardHeader>
              <CardContent>
                <p>No website content scraped yet.</p>
              </CardContent>
            </Card>
          )}
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