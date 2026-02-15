'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, LoaderCircle, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface RedeemFormProps {
  onSuccess?: (membershipExpiresAt: string | null) => void
}

interface RedeemResponse {
  success?: boolean
  error?: string
  message?: string
  membershipExpiresAt?: string | null
}

function normalizeCode(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase().trim()
}

export default function RedeemForm({ onSuccess }: RedeemFormProps) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async () => {
    const normalized = normalizeCode(code)
    if (!normalized) {
      setErrorMessage('请输入卡密后再兑换')
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/redeem/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: normalized }),
      })

      const data = (await response.json()) as RedeemResponse
      if (!response.ok || !data.success) {
        setErrorMessage(data.error || '兑换失败，请稍后重试')
        return
      }

      setSuccessMessage(data.message || '兑换成功，会员已开通')
      setCode('')
      onSuccess?.(data.membershipExpiresAt ?? null)
    } catch (error) {
      console.error('兑换请求异常:', error)
      setErrorMessage('网络异常，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border-[#b7e0d0] bg-[#eef9f4]">
      <CardContent className="space-y-4 p-5">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a56]">
          <Ticket className="h-4 w-4" />
          输入卡密自动开通会员
        </p>

        <div className="space-y-2">
          <label htmlFor="redeem-code-input" className="text-sm text-slate-700">
            卡密
          </label>
          <Input
            id="redeem-code-input"
            placeholder="请输入卡密（不区分大小写）"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={submitting}
            className="font-mono tracking-wide"
          />
          <p className="text-xs text-slate-500">示例：A7C49D2E91F84B6C3E0A57D1F29B8C64</p>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <p className="inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </p>
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <p className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </p>
          </div>
        ) : null}

        <Button
          type="button"
          className="w-full rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              正在兑换...
            </>
          ) : (
            '立即兑换开通'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
