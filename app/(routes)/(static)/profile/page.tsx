import { ContainerMd } from "@/components/static/shared/Containers";
import { getCurrentUser } from "@/server/actions/authActions";
import ProfileComp from "@/components/static/profile/ProfileSection";
import { getAuthUser } from "@/lib/static/getAuthUser";
import StaticBanner from "@/components/static/shared/StaticBanner";
import { BlurDelay } from "@/components/static/shared/MagicBlur";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getAuthUser();
 
  return (
    <ContainerMd>
      <StaticBanner title="Your Profile" badge={'Profile Page'} />
      <BlurDelay>
        <ProfileComp user={user} />
      </BlurDelay>
    </ContainerMd>
  );
}