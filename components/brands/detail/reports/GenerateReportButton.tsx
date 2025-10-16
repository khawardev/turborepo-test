"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { genrateReports } from "@/server/actions/reportsActions"
import { ModelSelector } from "@/components/brands/detail/reports/ModelSelector"
import { ButtonSpinner } from "@/components/shared/spinner"
import { toast } from "sonner"


export function GenerateReportButton({ brand_id, batch_id }: any) {
    const [open, setOpen] = useState(false)
    const [prompt, setPrompt] = useState("")
    const [isPending, startTransition] = useTransition()
    const [selectedModels, setSelectedModels] = useState<string[]>([])

    async function handleGenerate() {
        toast.info("Reports generation started", { duration: 4000 })
        toast.info("It may take 20–25 minutes to complete")

        startTransition(async () => {
            setOpen(false)
            await genrateReports({
                brand_id,
                batch_id,
                selectedModel: selectedModels[0],
                sythesizerPrompt: prompt || null,
            })
            setSelectedModels([])
            setPrompt("")
            toast.success('Reports has been genrated successfully 🎉')
        })
    }
    return (
        <>
            <Button disabled={isPending} onClick={() => setOpen(true)}>
                {isPending ? (
                    <ButtonSpinner>Genrating</ButtonSpinner>
                ) : (
                    "Generate Reports"
                )}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Generate Reports</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium mb-2">Select LLM Models</p>
                            <ModelSelector
                                selectedModel={selectedModels[0]}
                                setSelectedModel={(modelId: string) => setSelectedModels([modelId])}
                            />
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-2">Synthesizer Prompt (optional)</p>
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

