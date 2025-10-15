import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react'
import { toast } from 'sonner';

export function AskLimitToast({ t, onConfirm }: { t: any; onConfirm: (limit: number) => void }) {
    const [limit, setLimit] = React.useState("")

    const handleConfirm = () => {
        const parsedLimit = Number(limit)
        if (!parsedLimit || parsedLimit <= 0) {
            toast.error("Please enter a valid number")
            return
        }
        toast.dismiss(t.id)
        toast.success(`Limit set to ${parsedLimit}`)
        onConfirm(parsedLimit)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleConfirm()
    }

    return (
        <div className="flex flex-col gap-3 bg-border/60 border border-border p-4 rounded-xl shadow-lg">
            <p className="text-sm font-medium">Enter scraping limit</p>
            <Input
                type="number"
                placeholder="e.g. 10"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
            />
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => toast.dismiss(t.id)}>
                    Cancel
                </Button>
                <Button size="sm" onClick={handleConfirm}>
                    Confirm
                </Button>
            </div>
        </div>
    )
}
