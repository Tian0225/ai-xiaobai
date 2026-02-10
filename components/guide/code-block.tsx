'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  language: string
  code: string
  showLineNumbers?: boolean
}

export function CodeBlock({ language, code, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-6">
      {/* 语言标签 */}
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg text-sm font-mono">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          aria-label="复制代码"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>

      {/* 代码块 */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 0.5rem 0.5rem',
          fontSize: '0.9rem',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
