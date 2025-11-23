'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog"
import DashboardHeader from "@/components/stages/ccba/dashboard/shared/DashboardHeader"
import { PatternedSeparator } from "@/components/static/shared/chandai/SepratorChandai"
import { Separator } from "@/components/ui/separator"
import { Clipboard } from "lucide-react"
import { toast } from "sonner"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"

export default function Page() {
    function CopyButton({ text }:any) {
        const handleCopy = async () => {
            await navigator.clipboard.writeText(text)
            toast.success("Manage your team, billing")
        }

        return (
            <div>
                <Button variant={'ghost'} onClick={handleCopy} className="flex items-center gap-2">
                    <Clipboard className="size-4" />
                    Copy
                </Button>
            </div>
        )
    }
    return (
        <>
            <div className="relative flex flex-1 flex-col gap-8 p-8 max-w-4xl">

                <DashboardHeader
                    title="Settings"
                    subtitle="Manage your team, billing, and account preferences"
                />
              <ThemeSwitcher/>
                <CopyButton text="Hello world" />
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-9 space-y-8 rounded-xl p-0.5">

                        {/* Team Name Section */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-medium">Team Name</h3>
                                <p className="text-sm text-muted-foreground">Update your team's display name</p>
                            </div>
                            <div className="flex gap-2">
                                <Input defaultValue="Personal" className="max-w-md bg-background" />
                                <Button variant="secondary">Save</Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Invite Section */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-medium">Invite Team Members</h3>
                                <p className="text-sm text-muted-foreground">Add new members to your team</p>
                            </div>
                            <div className="flex gap-2 max-w-xl">
                                <Input placeholder="Enter email address" className="flex-1 bg-background" />
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-24 bg-background">
                                            Member
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Member Info</DialogTitle>
                                            <DialogDescription>
                                                Details about the member go here.
                                            </DialogDescription>
                                        </DialogHeader>

                                        {/* Put any content you want here */}
                                        <div className="mt-4 space-y-2">
                                            <p>Member Name: John Doe</p>
                                            <p>Email: john@example.com</p>
                                        </div>

                                        <DialogClose asChild>
                                            <Button className="mt-4 w-full">Close</Button>
                                        </DialogClose>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="secondary">Send Invite</Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Invited members will receive an email with instructions to join your team.</p>
                        </div>

                        <Separator />


                        {/* Team Members List */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-medium">Team Members</h3>
                                <p className="text-sm text-muted-foreground">Manage your team's access and permissions</p>
                            </div>

                            <div className="flex items-center justify-between p-2 border rounded-lg bg-card/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">K</div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium flex items-center gap-2">
                                            khawarsultan.developer@gmail.com
                                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase font-bold">Admin</span>
                                        </span>
                                        <span className="text-xs text-muted-foreground">khawarsultan.developer@gmail.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}