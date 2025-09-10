"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Brand, Competitor } from "@/types";

interface BrandNavProps {
  brand: Brand & { competitors: Competitor[] };
}

export default function BrandNav({ brand }: BrandNavProps) {
  const pathname = usePathname();

  return (
    <nav className="p-4">
      <h2 className="mb-4 text-lg font-semibold">{brand.name}</h2>
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Brand</AccordionTrigger>
          <AccordionContent>
            <Link href={`/me/brands/${brand.brand_id}`} passHref>
              <Button
                variant={
                  pathname === `/me/brands/${brand.brand_id}`
                    ? "secondary"
                    : "ghost"
                }
                className="w-full justify-start"
              >
                {brand.name}
              </Button>
            </Link>
          </AccordionContent>
        </AccordionItem>
        {brand.competitors.length > 0 && (
          <AccordionItem value="item-2">
            <AccordionTrigger>Competitors</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-1">
                {brand.competitors.map((competitor, index) => (
                  <Link
                    href={`/me/brands/${brand.brand_id}/competitors/${competitor.name}`}
                    key={index}
                    passHref
                  >
                    <Button
                      variant={
                        pathname ===
                        `/me/brands/${brand.brand_id}/competitors/${competitor.name}`
                          ? "secondary"
                          : "ghost"
                      }
                      className="w-full justify-start"
                    >
                      {competitor.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </nav>
  );
}
