"use client";

import { useState } from "react";
import { Brand, Competitor } from "@/types";
import { getCompetitors } from "@/server/actions/brandActions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface BrandItemProps {
  brand: Brand;
}

function BrandItemSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-5 w-1/4" />
        <div className="flex flex-wrap gap-2 mt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div>
        <Skeleton className="h-5 w-1/3" />
        <div className="border rounded-md mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                <TableHead><Skeleton className="h-5 w-28" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(2)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default function BrandItem({ brand }: BrandItemProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCompetitors = async () => {
    setIsLoading(true);
    const fetchedCompetitors = await getCompetitors(brand.brand_id);
    setCompetitors(fetchedCompetitors);
    setIsLoading(false);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && competitors.length === 0) {
      fetchCompetitors();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Link href={`/me/brands/${brand.brand_id}`}>
            <CardTitle className="hover:underline">{brand.name}</CardTitle>
          </Link>
          <CardDescription>
            <Link href={brand.url} target="_blank" rel="noreferrer" className="hover:underline">
              {brand.url}
            </Link>
          </CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={toggleOpen}>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent>
          {isLoading ? (
            <BrandItemSkeleton />
          ) : (
            <div>
              <h4 className="text-md font-medium mb-2">Social Links</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {brand.facebook_url && <Badge variant="secondary"><Link href={brand.facebook_url} target="_blank">Facebook</Link></Badge>}
                {brand.instagram_url && <Badge variant="secondary"><Link href={brand.instagram_url} target="_blank">Instagram</Link></Badge>}
                {brand.linkedin_url && <Badge variant="secondary"><Link href={brand.linkedin_url} target="_blank">LinkedIn</Link></Badge>}
                {brand.x_url && <Badge variant="secondary"><Link href={brand.x_url} target="_blank">X</Link></Badge>}
                {brand.youtube_url && <Badge variant="secondary"><Link href={brand.youtube_url} target="_blank">YouTube</Link></Badge>}
              </div>

              <h4 className="text-md font-medium mb-2">Competitors</h4>
              {competitors.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Socials</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competitors.map((competitor, index) => (
                      <TableRow key={index}>
                        <TableCell>{competitor.name}</TableCell>
                        <TableCell>
                          <Link href={competitor.url} target="_blank" rel="noreferrer" className="hover:underline">
                            {competitor.url}
                          </Link>
                        </TableCell>
                        <TableCell className="flex flex-wrap gap-1">
                            {competitor.facebook_url && <Badge variant="outline"><Link href={competitor.facebook_url} target="_blank">Facebook</Link></Badge>}
                            {competitor.instagram_url && <Badge variant="outline"><Link href={competitor.instagram_url} target="_blank">Instagram</Link></Badge>}
                            {competitor.linkedin_url && <Badge variant="outline"><Link href={competitor.linkedin_url} target="_blank">LinkedIn</Link></Badge>}
                            {competitor.x_url && <Badge variant="outline"><Link href={competitor.x_url} target="_blank">X</Link></Badge>}
                            {competitor.youtube_url && <Badge variant="outline"><Link href={competitor.youtube_url} target="_blank">YouTube</Link></Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No competitors found.</p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
