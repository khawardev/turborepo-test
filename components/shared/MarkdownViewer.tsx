'use client'
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { cleanAndFlattenBullets } from "@/lib/static/cleanMarkdown";

export const MarkdownViewer = ({ content }: { content: string }) => {
    return (
        <div className="prose prose-neutral max-w-none markdown-body  dark:prose-invert">
            <ReactMarkdown components={{
                img: ({ node, ...props }) => {
                    if (!props.src) return null
                    return <img {...props} alt={props.alt || ""} />
                },
            }} remarkPlugins={[remarkGfm]}>
                {cleanAndFlattenBullets(content)} 
            </ReactMarkdown>
        </div>
    );
};