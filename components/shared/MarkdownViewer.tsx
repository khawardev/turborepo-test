'use client'
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { cleanAndFlattenBullets } from "@/lib/static/cleanMarkdown";

export const MarkdownViewer = ({ content }: { content: string }) => {
    return (
        <div className="prose prose-neutral max-w-none markdown-body space-y-6  dark:prose-invert">
            <ReactMarkdown components={{
                img: ({ node, ...props }) => {
                    if (!props.src) return null
                    return <img {...props} alt={props.alt || ""} />
                },
                table: ({ node, ...props }) => (
                    <div className="table-wrapper">
                        <table {...props} />
                    </div>
                ),
            }}  remarkPlugins={[remarkGfm]}>
                {cleanAndFlattenBullets(content)} 
            </ReactMarkdown>
        </div>
    );
};