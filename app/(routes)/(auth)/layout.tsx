import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="bg-background flex flex-col items-center justify-center p-8">
        {children}
      </div>
      <div className="bg-muted hidden lg:block">
        <Image
          src="https://img.freepik.com/free-vector/pale-green-gradient-tones-background_23-2148381991.jpg?semt=ais_hybrid&w=740&q=80"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
