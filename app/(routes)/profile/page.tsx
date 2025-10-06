import { ContainerMd } from "@/components/shared/containers";
import { getCurrentUser } from "@/server/actions/authActions";
import ProfileComp from "@/components/profile/ProfileComp";
import { checkAuth } from "@/lib/checkAuth";

export default async function MePage() {
  await checkAuth();
  const user = await getCurrentUser();

  return (
      <ContainerMd>
          <ProfileComp user={user} />
      </ContainerMd>
  );
}