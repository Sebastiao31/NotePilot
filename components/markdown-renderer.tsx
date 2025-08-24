"use client"

import React, { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeSlug from "rehype-slug"
import rehypeRaw from "rehype-raw"
import rehypeKatex from "rehype-katex"
import { extractHeadings } from "@/lib/markdown"

type Props = {
  content: string
  showTOC?: boolean
}

const Callout: React.FC<{ type: "TIP" | "INFO" | "WARNING"; title?: string; children?: React.ReactNode }>=({ type, title, children }) => {
  const color = type === "TIP" ? "bg-emerald-50 border-emerald-300" : type === "INFO" ? "bg-blue-50 border-blue-300" : "bg-amber-50 border-amber-300"
  return (
    <div className={`border ${color} rounded-md p-3 my-2`}>
      <div className="font-semibold mb-1">{title ?? type}</div>
      <div className="text-sm leading-6">{children}</div>
    </div>
  )
}

function transformCallouts(md: string): string {
  // Convert > [!TYPE] Title to HTML we can safely render
  return md.replace(/(^|\n)> \[!(TIP|INFO|WARNING)\] ?([^\n]*)\n([\s\S]*?)(?=\n\n|$)/g, (_m, p1, kind, t, body) => {
    const title = t?.trim() || kind
    const inner = body.replace(/^>\s?/gm, "")
    return `${p1}<div data-callout="${kind}"><strong>${title}</strong>\n${inner}\n</div>`
  })
}

// Best-effort fallback: convert loose bracketed TeX like
// "[ F = G \\frac{m_1 \\cdot m_2}{d^2} ]" into display math "$$ ... $$"
// Only triggers if we detect obvious TeX tokens and the content is not already in $...$
function transformLooseMath(md: string): string {
  const MATH_HINT = /(\\frac|\\cdot|\\times|\\sqrt|\\sum|\\int|\\pi|\\alpha|\\beta|\\gamma|[a-zA-Z]_\{?\d+\}?|\^\{[^}]+\}|\^[0-9]+)/
  return md.replace(/\[\s*([^\]\n]+?)\s*\]/g, (match, inner: string) => {
    if (/\$/.test(inner)) return match
    if (!MATH_HINT.test(inner)) return match
    return `$$${inner}$$`
  })
}

const MarkdownRenderer: React.FC<Props> = ({ content, showTOC=false }) => {
  const processed = useMemo(() => transformLooseMath(transformCallouts(content)), [content])
  const toc = useMemo(() => extractHeadings(content), [content])

  return (
    <div className="md-content max-w-none">
      {showTOC && toc.length > 2 && (
        <div className="mb-6 border rounded-md p-3 bg-gray-50">
          <div className="text-sm font-semibold mb-2">Table of contents</div>
          <ul className="m-0">
            {toc.map((h) => (
              <li key={h.id} className={`ml-${(h.level-1)*4}`}>
                <a href={`#${h.id}`} className="text-sm hover:underline">{h.text}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ReactMarkdown
        rehypePlugins={[rehypeSlug, rehypeRaw, rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-semibold" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-semibold underline" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-medium" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5" {...props} />,
          li: ({node, ...props}) => <li className="my-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
          hr: () => <></>,
          table: ({node, ...props}) => <table className="table-auto border-collapse" {...props} />,
          th: ({node, ...props}) => <th className="border px-2 py-1 bg-gray-50" {...props} />,
          td: ({node, ...props}) => <td className="border px-2 py-1" {...props} />,
          div: ({node, ...props}) => {
            const t = (props as any)["data-callout"]
            if (t === "TIP" || t === "INFO" || t === "WARNING") {
              return <Callout type={t as any} title={undefined}>{props.children}</Callout>
            }
            return <div {...props} />
          }
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer


