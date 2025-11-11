import { getCurrentUser } from "@/server/actions/authActions";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="z-10 flex items-center justify-center h-screen">
      {children}
    </div>
  );
}
