import { ContainerMd } from "@/components/shared/containers";
import { getCurrentUser } from "@/server/actions/authActions";
import ProfileComp from "@/components/profile/ProfileComp";
import { checkAuth } from "@/lib/checkAuth";
import StaticBanner from "@/components/shared/staticBanner";
import { BlurDelay } from "@/components/shared/blur";

export default async function MePage() {
  await checkAuth();
  const user = await getCurrentUser();

  return (
    <ContainerMd>
      <StaticBanner title="Your Profile" badge={'Profile Page'} />
      <BlurDelay>
        <ProfileComp user={user} />
      </BlurDelay>
    </ContainerMd>
  );
}