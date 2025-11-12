import { getCurrentUser } from "@/server/actions/authActions";

export async function getAuthUser() {
  const user = await getCurrentUser();
  return user;
}
