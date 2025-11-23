import { getBrands } from "@/server/actions/brandActions";
import { getCamSessions } from "@/server/actions/cge/sessionActions";
import { ContainerMd } from "@/components/static/shared/Containers";
import StaticBanner from "@/components/static/shared/StaticBanner";
import CreateCgeSessionForm from "@/components/stages/cge/CreateCgeSessionForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function CgeSessionsList({ brands }: { brands: any[] }) {
    return (
        <div className="space-y-4">
            {brands.map(async (brand) => {
                const camSessionsResponse = await getCamSessions(brand.brand_id);
                if (camSessionsResponse.success && camSessionsResponse.data.sessions.length > 0) {
                    return (
                        <Card key={brand.brand_id}>
                            <CardHeader>
                                <CardTitle>{brand.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {camSessionsResponse.data.sessions.map((session: any) => (
                                    <div key={session.cam_session_id} className="flex justify-between items-center p-2 border rounded-md">
                                        <div>
                                            <p className="font-medium">{session.cam_session_id}</p>
                                            <p className="text-sm text-muted-foreground">
                                                BVO Session: {session.bam_session_id}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Created: {new Date(session.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <Button asChild variant="outline">
                                            <Link href={`/cge/${session.cam_session_id}?brand_id=${brand.brand_id}`}>
                                                Open
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    );
                }
                return null;
            })}
        </div>
    );
}


export default async function CgePage() {
  const brands = await getBrands();

  return (
    <ContainerMd>
      <StaticBanner title="Content Generation Engine" badge="CGE" />
      <div className="space-y-8">
        <CreateCgeSessionForm brands={brands} />
        <div>
            <h2 className="text-2xl  mb-4">Existing CGE Sessions</h2>
            <CgeSessionsList brands={brands} />
        </div>
      </div>
    </ContainerMd>
  );
}
