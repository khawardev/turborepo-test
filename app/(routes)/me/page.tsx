import { getCurrentUser } from "@/server/actions/userActions";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { Separator } from "@/components/ui/separator";
import {ContainerMd} from "@/components/shared/containers";

export default async function MePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <ContainerMd>
      <div className="w-full space-y-6">
        <div>
          <h3 className="text-lg  font-medium">Your Profile</h3>
          <p className="text-sm text-muted-foreground">
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
    </ContainerMd>
  );
}