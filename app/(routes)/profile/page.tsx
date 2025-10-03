import { redirect } from "next/navigation";
import { ContainerMd } from "@/components/shared/containers";
import LightRaysWrapper from "@/components/LightRaysWrapper";
import { getCurrentUser } from "@/server/actions/authActions";
import ProfileLoading from "./loading";
import { Suspense } from "react";
import ProfileComp from "@/components/profile/ProfileComp";

export default async function MePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
      <ContainerMd>
        <Suspense fallback={<ProfileLoading />}>
          <ProfileComp user={user} />
        </Suspense>
      </ContainerMd>
  );
}