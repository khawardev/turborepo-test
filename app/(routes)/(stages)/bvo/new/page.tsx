import { ContainerMd } from "@/components/static/shared/Containers";
import StaticBanner from "@/components/static/shared/StaticBanner";
import { BlurDelay, BlurDelay2 } from "@/components/static/shared/MagicBlur";
import NewBvoForm from "@/components/stages/bvo/NewBvoForm";
import { getBrands } from "@/server/actions/brandActions";
import { getAuthUser } from "@/lib/static/getAuthUser";

export default async function AddBvoPage() {
  const brands = await getBrands();
  const user = await getAuthUser()
 
  return (
    <ContainerMd className="pb-32">
      <StaticBanner title="New BVO Audit" badge={'BVO Audits'} />
      <BlurDelay>
        <div>
          <h3 className="text-lg font-medium">BVO Details</h3>
          <p className="text-sm text-muted-foreground">
            Configure the core details of your Brand Validation & Optimization audit.
          </p>
        </div>
      </BlurDelay>
      <BlurDelay2>
        <NewBvoForm client_id={user.client_id} brands={brands} />
      </BlurDelay2>
    </ContainerMd>
  );
}