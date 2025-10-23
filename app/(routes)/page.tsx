import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ContainerMd } from "@/components/shared/containers";
import { Plus } from "lucide-react";
import BrandList from "@/components/brands/list/BrandList";
import StaticBanner from "@/components/shared/staticBanner";
import LaserFlow from "@/components/ui/react-bits/LaserFLow/LaserFlow";
import HeroSection from "@/components/hero-section/hero-sction";

// export default function Home() {
//   return (
//     <ContainerMd>
//       <StaticBanner title="Your Brands" badge={'Brands Page'} />
//       <div className="flex justify-between items-center ">
//         <div>
//           <h3 className="text-lg font-medium ">Brands</h3>
//           <p className="text-sm text-muted-foreground">
//             View and manage your brands and competitors.
//           </p>
//         </div>
//         <Button asChild>
//           <Link href="/brands/new">
//             <Plus />
//             Brand
//           </Link>
//         </Button>
//       </div>
//       <LaserFlowBoxExample/>
//         {/* <LaserFlow
//           horizontalBeamOffset={0.1}
//           verticalBeamOffset={0.0}
//         /> */}
//         <BrandList />
//     </ContainerMd>
//   );
// }


export default function Home() {
  return (
      <HeroSection/>
  );
}