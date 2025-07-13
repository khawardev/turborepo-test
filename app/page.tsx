import { getCurrentUser } from "@/actions/userActions";
import HeroSection from "@/components/home/HeroSection";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className=" container mx-auto max-w-4xl px-4 flex flex-col justify-center text-center  h-screen">
      <h1 className="font-heading z-50 text-4xl font-bold tracking-tight sm:text-6xl text-lime-green">
        Get Clarity.  Start your free <span className=" text-primary"> Website </span> Health Audit.
      </h1>
      <div className="mt-10">
        <HeroSection user={user} />
      </div>
    </div>
  );
}