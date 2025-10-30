"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FileText, MoreHorizontalIcon, Search } from "lucide-react"
import { useTransition } from "react"

import { scrapeBatchSocial } from "@/server/actions/social/socialScrapeActions"
import { scrapeBatchWebsite } from "@/server/actions/website/websiteScrapeActions"
import { ButtonSpinner } from "@/components/shared/spinner"
import { ScrapeSocialDialog } from "@/components/brands/detail/scraps/social/AskSocialScrapeDialog"
import { WebsiteAskLimitToast } from "@/components/brands/detail/scraps/website/WebsiteAskLimitToast"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SocialReportButton } from "@/components/brands/detail/reports/social/SocialReportButton"
import { WebsiteReportButton } from "@/components/brands/detail/reports/website/WebsiteReportButton"
import { BiAnalyse } from "react-icons/bi";
import { MdOutlineWebAsset } from "react-icons/md";
import { RiGeminiFill } from "react-icons/ri"

export function ScrapeReportActionButtons({
  brand_id,
  website_batch_id,
  social_batch_id,
}: {
  brand_id: string
  website_batch_id: string | null
  social_batch_id: string | null
}) {
  const router = useRouter()
  const [isWebsiteScrapingPending, startWebsiteScrapingTransition] =
    useTransition()
  const [isSocialScrapingPending, startSocialScrapingTransition] =
    useTransition()

  // Website Scraping Logic from WebsiteScraps.tsx
  const scrapeWebsite = async (limit: number) => {
    startWebsiteScrapingTransition(async () => {
      toast.info("Website scraping job started...")
      const result = await scrapeBatchWebsite(brand_id, limit)
      if (result?.success) {
        router.refresh()
        toast.success("Scraping completed successfully 🎉")
      } else {
        toast.error("Scraping failed.")
      }
    })
  }

  const askWebsiteScrapeLimit = () => {
    toast.custom((t: any) => (
      <WebsiteAskLimitToast t={t} onConfirm={scrapeWebsite} />
    ))
  }

  // Social Scraping Logic from SocialScraps.tsx
  const handleScrapeSocial = (details: {
    startDate: string
    endDate: string
  }) => {
    startSocialScrapingTransition(async () => {
      toast.info("Social scraping job started...")
      const result = await scrapeBatchSocial(
        brand_id,
        details.startDate,
        details.endDate
      )

      if (result?.success) {
        toast.success(
          result.message || "Social Scraping completed successfully 🎉"
        )
        router.refresh()
      } else {
        toast.error(result?.error || "Social scraping failed.")
      }
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Actions
          <MoreHorizontalIcon  />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-34">
        {/* Website Sub Menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger >
            <span>Website</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent  sideOffset={10}>
            <DropdownMenuItem
              onClick={askWebsiteScrapeLimit}
              disabled={isWebsiteScrapingPending}
            >
              {isWebsiteScrapingPending ? (
                <ButtonSpinner>Scraping</ButtonSpinner>
              ) : (
                  <MdOutlineWebAsset  />
              )}
              <span>Scrape</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <WebsiteReportButton
              brand_id={brand_id}
              batch_id={website_batch_id}
            >
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                disabled={!website_batch_id}
              >
                <RiGeminiFill  />
                <span>Create Report</span>
              </DropdownMenuItem>
            </WebsiteReportButton>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Social Media Sub Menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Social Media</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent   sideOffset={10}>
            <ScrapeSocialDialog
              isLoading={isSocialScrapingPending}
              onConfirm={handleScrapeSocial}
            >
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                disabled={isSocialScrapingPending}
              >
                {isSocialScrapingPending ? (
                  <ButtonSpinner>Scraping</ButtonSpinner>
                ) : (
                    <MdOutlineWebAsset  />
                )}
                <span>Scrape </span>
              </DropdownMenuItem>
            </ScrapeSocialDialog>
            <DropdownMenuSeparator />
            <SocialReportButton
              brand_id={brand_id}
              batch_id={social_batch_id}
            >
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                disabled={!social_batch_id}
              >
                <RiGeminiFill  />
                <span>Create Report</span>
              </DropdownMenuItem>
            </SocialReportButton>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
