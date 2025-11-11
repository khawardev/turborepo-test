import { getCurrentUser } from "@/server/actions/authActions";
import { redirect } from "next/navigation";

export async function checkAuth() {
  const user = await getCurrentUser();

  console.log("User:::", user);

  if (!user) {
    console.log("No user found");
    redirect("/login");
  }

  return user;
}
