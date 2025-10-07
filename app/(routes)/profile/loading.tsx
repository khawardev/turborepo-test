import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ContainerMd } from "@/components/shared/containers";

export default function ProfileLoading() {
  return (
      <ContainerMd>
        <div className="w-full space-y-6">
          <div>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Card className="p-5 space-y-1 ">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Separator />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-40" />
            </div>
          </Card>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </ContainerMd>
  );
}