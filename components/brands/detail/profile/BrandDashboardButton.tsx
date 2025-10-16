import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

export function BrandDashboardButton({ brand_id, isScrapped }: { brand_id: any; isScrapped: boolean }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {isScrapped ? (
                        <Button variant="outline" asChild>
                            <Link href={`/dashboard/brand/${brand_id}`}>Dashboard</Link>
                        </Button>
                    ) : (
                        <span>
                            <Button variant="outline" disabled className="pointer-events-none">
                                Dashboard
                            </Button>
                        </span>
                    )}
                </TooltipTrigger>
                <TooltipContent>
                    {isScrapped ? "Go to Brand Dashboard" : "Please Genrate Reports First"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}