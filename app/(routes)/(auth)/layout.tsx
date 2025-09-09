import { ContainerSm } from "@/components/shared/containers";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContainerSm className="flex flex-row container mx-auto justify-between h-[90vh]">
      
      <div className=" flex flex-col  w-full justify-center">
        {children}
      </div>
      <div className="bg-muted hidden lg:block rounded-3xl ">
        <Image
          src="https://img.freepik.com/free-vector/pale-green-gradient-tones-background_23-2148381991.jpg?semt=ais_hybrid&w=740&q=80"
          alt="Image"
          width="2920"
          height="2920"
          className="h-full w-full rounded-3xl"
        />
      </div>
    </ContainerSm>
  );
}
