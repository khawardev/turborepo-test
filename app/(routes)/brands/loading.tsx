import { ContainerMd } from "@/components/shared/containers";
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

export default function BrandsLoading() {
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
      <div className="flex justify-between items-center ">
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <div >
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-6 w-full">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            <Skeleton className="h-5 w-24" />
                          </TableHead>
                          <TableHead>
                            <Skeleton className="h-5 w-32" />
                          </TableHead>
                          <TableHead>
                            <Skeleton className="h-5 w-28" />
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(1)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </ContainerMd>
  );
}