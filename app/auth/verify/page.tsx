'use client'

import { verifyOtp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'

import { Suspense } from 'react'

function VerifyForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const error = searchParams.get('error')

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Verify OTP</CardTitle>
        <CardDescription>
          Enter the code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={verifyOtp} className="grid gap-4">
          <input type="hidden" name="email" value={email} />
          <div className="grid gap-2">
            <Label htmlFor="token">OTP Code</Label>
            <Input
              id="token"
              name="token"
              type="text"
              placeholder="123456"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-500 font-medium">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full">
            Verify
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function VerifyPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  )
}
