
import PrismaticBurst from "@/components/ui/react-bits/PrismaticBurst";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="h-screen relative flex items-center justify-center">
        <PrismaticBurst
          animationType="rotate3d"
          intensity={3}
          speed={0.5}
          distort={1.0}
          paused={false}
          offset={{ x: 0, y: 0 }}
          hoverDampness={0.25}
          rayCount={14}
          mixBlendMode="lighten"
          colors={['#71EA01', '#000000', '#71EA01']}
        />
        <div className="z-10 absolute  w-full flex items-center justify-center">
          {children}
      </div>
    </div>
  );
}
