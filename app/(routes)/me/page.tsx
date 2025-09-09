import { getCurrentUser } from "@/server/actions/userActions";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { Separator } from "@/components/ui/separator";
import { ContainerLg, ContainerSm, ContainerXs } from "@/components/shared/containers";

export default async function MePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ContainerXs className=" flex items-center justify-center md:min-h-[80vh]">
      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-2 ">
          <h1 className="text-xl tracking-tight font-bold">Your Profile</h1>
          <p className="text-muted-foreground">
            Here is the information associated with your account.
          </p>
        </div>
        <div className="space-y-4 rounded-lg border p-6">
          <div className="flex justify-between">
            <p className="text-muted-foreground">Name</p>
            <p>{user.name}</p>
          </div>
          <Separator />
          <div className="flex justify-between">
            <p className="text-muted-foreground">Email</p>
            <p>{user.email}</p>
          </div>
          <Separator />
          <div className="flex justify-between">
            <p className="text-muted-foreground">User ID</p>
            <p>{user.user_id}</p>
          </div>
          <Separator />
          <div className="flex justify-between">
            <p className="text-muted-foreground">Client ID</p>
            <p>{user.client_id}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <LogoutButton />
        </div>
      </div>
    </ContainerXs>
  );
}