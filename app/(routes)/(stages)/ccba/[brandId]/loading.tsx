import { ContainerMd } from "@/components/static/shared/Containers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { BrandProfileSkeleton } from "../../../../../components/stages/ccba/details/_components/_skeleton/BrandProfileSkeleton";

export default function BrandsDetailsLoading() {
    return (
        <ContainerMd>
            <div className="relative select-none py-14">
                <section className="text-center flex-col space-y-4">
                    <div className="flex justify-center">
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <div className="flex justify-center">
                        <Skeleton className="h-10 w-2/4 rounded-md" />
                    </div>
                </section>
            </div>
            <div className="flex flex-wrap gap-4">
                <Skeleton className="h-10 w-20 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-20 rounded-md" />
            </div>
            <hr />
            <BrandProfileSkeleton/>
        </ContainerMd>
    );
}