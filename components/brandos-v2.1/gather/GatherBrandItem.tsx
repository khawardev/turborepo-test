"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link as LinkIcon, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { setGatherCookies } from "@/server/actions/cookieActions";

interface GatherBrandItemProps {
    brand: any;
    isScrapped: boolean;
    index: number;
}

export default function GatherBrandItem({ brand, isScrapped, index }: GatherBrandItemProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSelectBrand = () => {
        startTransition(async () => {
            try {
                // Determine default parameters
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 30);
                
                const sDate = format(startDate, 'yyyy-MM-dd');
                const eDate = format(endDate, 'yyyy-MM-dd');
                const webLimit = "10";

                // Save to cookies for persistence
                await setGatherCookies({
                    brandId: brand.brand_id,
                    startDate: sDate,
                    endDate: eDate,
                    webLimit
                });

                // Navigate
                router.push(`/dashboard/brandos-v2.1/gather?brandId=${brand.brand_id}&startDate=${sDate}&endDate=${eDate}&webLimit=${webLimit}`);
                toast.success(`Selected brand: ${brand.name}`);
            } catch (e) {
                console.error(e);
                toast.error("Failed to select brand");
            }
        });
    };

    return (
        <Card 
            onClick={handleSelectBrand}
            className="cursor-pointer hover:bg-muted/50 transition-all hover:border-primary/50 group relative"
        >
             <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium line-clamp-1">
                        {brand.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                         <Link
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary z-10"
                            href={brand.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()} 
                         >
                            {new URL(brand.url).hostname}
                            <LinkIcon className="h-3 w-3" />
                         </Link>
                    </CardDescription>
                </div>
                {/* Status Indicator */}
                <div className="flex h-2 w-2">
                     <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75 ${isScrapped ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                     <span className={`relative inline-flex rounded-full h-2 w-2 ${isScrapped ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[10px] font-normal">
                        Competitors: {brand.competitors?.length || 0}
                    </Badge>
                     {isScrapped && <Badge variant="secondary" className="text-[10px] font-normal text-green-600 bg-green-500/10 hover:bg-green-500/20">Data Captured</Badge>}
                </div>
            </CardContent>
             <span className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-4 h-4 text-primary" />
             </span>
        </Card>
    )
}
