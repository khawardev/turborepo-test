"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Brand, Competitor } from "@/types";

interface BrandNavProps {
  brand: Brand & {
    competitors: (Competitor & { crawledContent?: any[] })[];
    crawledContent?: any[];
  };
}

const BrandNav = ({ brand }: BrandNavProps) => {
  const pathname = usePathname();
  const params = useParams();
  const brandId = params.brand_id;

  const brandWebsiteUrls = brand.crawledContent
    ? [...new Set(brand.crawledContent.map((item) => item.url))]
    : [];

  const socialMediaPlatforms = [
    { name: "Facebook", url: brand.facebook_url },
    { name: "LinkedIn", url: brand.linkedin_url },
    { name: "X", url: brand.x_url },
    { name: "YouTube", url: brand.youtube_url },
    { name: "Instagram", url: brand.instagram_url },
  ].filter((p) => p.url);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{brand.name}</h2>
        <div className="ml-4 mt-2 space-y-2">
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center font-semibold">
              <ChevronRight className="w-4 h-4 mr-2 transition-transform duration-200 [&[data-state=open]>svg]:rotate-90" />
              Website
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 mt-2 space-y-1">
              {brandWebsiteUrls.map((url) => (
                <Link
                  key={url}
                  href={`/brands/${brandId}?url=${encodeURIComponent(url)}`}
                  className={cn(
                    "block text-muted-foreground hover:text-foreground",
                    pathname === `/brands/${brandId}` &&
                      (params.url === url || (!params.url && brandWebsiteUrls[0] === url))
                      ? "text-foreground"
                      : "",
                  )}
                >
                  {new URL(url).pathname}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
          {socialMediaPlatforms.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center font-semibold">
                <ChevronRight className="w-4 h-4 mr-2 transition-transform duration-200 [&[data-state=open]>svg]:rotate-90" />
                Social Media
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-4 mt-2 space-y-1">
                {socialMediaPlatforms.map((platform) => (
                  <Link
                    key={platform.name}
                    href={platform.url!}
                    target="_blank"
                    className="block text-muted-foreground hover:text-foreground"
                  >
                    {platform.name}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
      {brand.competitors && brand.competitors.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Competitors</h2>
          <div className="ml-4 mt-2 space-y-4">
            {brand.competitors.map((competitor) => {
              const competitorWebsiteUrls = competitor.crawledContent
                ? [...new Set(competitor.crawledContent.map((item) => item.url))]
                : [];

              return (
                <div key={competitor.competitor_id}>
                  <h3 className="font-semibold">{competitor.name}</h3>
                  <div className="ml-4 mt-2 space-y-2">
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center font-medium">
                        <ChevronRight className="w-4 h-4 mr-2 transition-transform duration-200 [&[data-state=open]>svg]:rotate-90" />
                        Website
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-4 mt-2 space-y-1">
                        {competitorWebsiteUrls.map((url) => (
                          <Link
                            key={url}
                            href={`/brands/${brandId}/competitors/${
                              competitor.name
                            }?url=${encodeURIComponent(url)}`}
                            className={cn(
                              "block text-muted-foreground hover:text-foreground",
                              pathname ===
                                `/brands/${brandId}/competitors/${competitor.name}` &&
                                params.url === url
                                ? "text-foreground"
                                : "",
                            )}
                          >
                            {new URL(url).pathname}
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center font-medium">
                        <ChevronRight className="w-4 h-4 mr-2 transition-transform duration-200 [&[data-state=open]>svg]:rotate-90" />
                        Social Media
                      </CollapsibleTrigger>
                      <CollapsibleContent className="ml-4 mt-2 space-y-1">
                        {[
                          { name: "Facebook", url: competitor.facebook_url },
                          { name: "LinkedIn", url: competitor.linkedin_url },
                          { name: "X", url: competitor.x_url },
                          { name: "YouTube", url: competitor.youtube_url },
                          { name: "Instagram", url: competitor.instagram_url },
                        ]
                          .filter((p) => p.url)
                          .map((platform) => (
                            <Link
                              key={platform.name}
                              href={platform.url!}
                              target="_blank"
                              className="block text-muted-foreground hover:text-foreground"
                            >
                              {platform.name}
                            </Link>
                          ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandNav;
