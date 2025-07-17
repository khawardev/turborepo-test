'use client'

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Download, Stars } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import { toast } from "sonner";

export function ContentActions({ content, auditURL }: any) {
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        toast.success("Content copied to clipboard");
    };
    const currentDate = new Date().toISOString().split("T")[0];

    const handleDownloadTxt = () => {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${auditURL}-humanbrandai-${currentDate}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size={'sm'}>
                        Actions <IoIosArrowDown />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-22" align="end">
                    <DropdownMenuItem onClick={handleCopy}>
                        <Copy size={16} className="opacity-60 mr-2" aria-hidden="true" />
                        <span>Copy</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadTxt}>
                        <Download size={16} className="opacity-60 mr-2" aria-hidden="true" />
                        <span>Save Report .txt</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}