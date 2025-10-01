
import LightRaysWrapper from "@/components/LightRaysWrapper";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <LightRaysWrapper className="h-screen">
      <div className="z-10 flex items-center justify-center h-screen">
        {children}
      </div>
    </LightRaysWrapper>
  );
}
