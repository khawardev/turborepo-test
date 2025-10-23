"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ButtonSpinner } from "@/components/shared/spinner"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { WebsiteModelSelector } from "../website/WebsiteModelSelector"
import { batchSocialReports } from "@/server/actions/social/socialReportActions"


export function SocialReportButton({ brand_id, batch_id }: any) {
    const router= useRouter()
    const [open, setOpen] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [isPending, startTransition] = useTransition()
    const [selectedModels, setSelectedModels] = useState<string[]>([])

    async function handleGenerate() {
        toast.info("Reports generation may take 20–25 minutes to complete")

        setOpen(false)
        startTransition(async () => {
            const socialReports = await batchSocialReports({
                brand_id,
                batch_id,
                model_id: selectedModels[0],
                social_prompt: prompt || null,
            })

            setSelectedModels([])
            setPrompt("")
            router.refresh();
            if (socialReports.success) {
                toast.success('Reports has been genrated successfully 🎉')
            } else {
                toast.success(socialReports.error)
            }
                
        })
    }
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button disabled={isPending}>
                        {isPending ? (
                            <ButtonSpinner>Genrating</ButtonSpinner>
                        ) : (
                            "Generate Social Reports"
                        )}
                    </Button>
                </DialogTrigger>
                <DialogContent >
                    <DialogHeader>
                        <DialogTitle>Generate Social Reports</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium mb-2">Select LLM Models</p>
                            <WebsiteModelSelector
                                selectedModel={selectedModels[0]}
                                setSelectedModel={(modelId: string) => setSelectedModels([modelId])}
                            />
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Social Synthesizer Prompt (optional)</p>
                            <Textarea
                                placeholder="Enter your custom prompt..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            disabled={selectedModels.length === 0 || isPending}
                            onClick={handleGenerate}
                        >
                            {isPending ? "Generating..." : "Genrate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

