import { getCurrentUser } from "@/server/actions/authActions";
import { redirect } from "next/navigation";

export async function checkAuth() {
  const user = await getCurrentUser();

  console.log("User:::", user);

  if (!user) {
    redirect("/login");
  }

  return user;
}
