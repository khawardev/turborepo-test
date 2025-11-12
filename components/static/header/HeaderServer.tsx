import { HeaderClient } from "./HeaderClient";
import { getAuthUser } from "@/lib/static/getAuthUser";

export default async function HeaderServer() {
  const user = await getAuthUser();
  return <HeaderClient user={user} />;
}
