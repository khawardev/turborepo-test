import { getCurrentUser } from "@/server/actions/authActions";
import { HeaderClient } from "./HeaderClient";

export default async function HeaderServer() {
  let user = null;

  try {
    user = await getCurrentUser();
  } catch (error) {
    // If authentication fails, user remains null
    // Header will render in logged-out state
  }

  return <HeaderClient user={user} />;
}
