"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandDialog, CommandInput, CommandList, CommandItem } from "@/components/ui/command"

const MODELS = [
    { id: "claude-3-haiku", name: "Anthropic Claude 3 Haiku — 200K tokens" },
    { id: "claude-4-sonnet", name: "Anthropic Claude 4 Sonnet — 200K tokens" },
    { id: "claude-4-1-opus", name: "Anthropic Claude 4.1 Opus — 200K tokens" },
    { id: "claude-4-opus", name: "Anthropic Claude 4 Opus — 200K tokens" },
    { id: "deepseek-r1", name: "DeepSeek R1 — 128K tokens" },
    { id: "meta-llama4-scout", name: "Meta LLaMA 4 Scout — 3.5M tokens" },
    { id: "claude-3-5-sonnet", name: "Anthropic Claude 3.5 Sonnet — 200K tokens" },
    { id: "claude-3-sonnet", name: "Anthropic Claude 3 Sonnet — 200K tokens" },
    { id: "claude-3-7-sonnet", name: "Anthropic Claude 3.7 Sonnet — 200K tokens" },
]

export function WebsiteModelSelector({ selectedModel, setSelectedModel }: any) {
    const [open, setOpen] = useState(false)

    const handleSelect = (modelId: string) => {
        setSelectedModel(modelId)
        setOpen(false)
    }

    return (
        <>
            <Button
                className="w-full"
                variant="outline"
                onClick={() => setOpen(true)}
            >
                {selectedModel ? `${selectedModel}` : "Select Model"}
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search models..." />
                <CommandList>
                    {MODELS.map((model) => (
                        <CommandItem
                            key={model.id}
                            onSelect={() => handleSelect(model.id)}
                            className={`cursor-pointer ${selectedModel === model.id ? "bg-accent text-accent-foreground" : ""
                                }`}
                        >
                            {model.name}
                        </CommandItem>
                    ))}
                </CommandList>
            </CommandDialog>
        </>
    )
}