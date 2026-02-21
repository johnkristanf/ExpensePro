'use client'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownProps {
    content: string
    className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
    return (
        <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    table: ({ node, ...props }) => (
                        <div className="my-4 w-full overflow-y-auto rounded-lg border">
                            <table className="w-full text-sm" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-muted/50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th
                            className="border-b px-4 py-2 text-left font-semibold text-muted-foreground [&[align=center]]:text-center [&[align=right]]:text-right"
                            {...props}
                        />
                    ),
                    td: ({ node, ...props }) => (
                        <td
                            className="border-b px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
                            {...props}
                        />
                    ),
                    tr: ({ node, ...props }) => (
                        <tr
                            className="transition-colors hover:bg-muted/30 last:border-0"
                            {...props}
                        />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="leading-relaxed mb-2 last:mb-0" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
