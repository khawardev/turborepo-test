import { redirect } from "next/navigation";
import { ContainerMd } from "@/components/shared/containers";
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
          <ProfileComp user={user} />
      </ContainerMd>
  );
}