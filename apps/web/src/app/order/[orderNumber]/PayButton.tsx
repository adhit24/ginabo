'use client'

// PayButton — triggers Midtrans Snap popup for pending orders.
// Loaded dynamically so the Snap.js script only runs client-side.

import { useEffect, useRef, useState } from 'react'

// Derive Snap URL from the public client key environment variable.
// NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION should be "true" in production.
const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

const SNAP_JS_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: unknown) => void
          onPending: (result: unknown) => void
          onError: (result: unknown) => void
          onClose: () => void
        },
      ) => void
    }
  }
}

interface Props {
  snapToken: string
  orderNumber: string
}

export function PayButton({ snapToken, orderNumber }: Props) {
  const [loading, setLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (scriptRef.current || window.snap) {
      setScriptReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = SNAP_JS_URL
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY)
    script.onload = () => setScriptReady(true)
    document.head.appendChild(script)
    scriptRef.current = script
  }, [])

  function handlePay() {
    if (!window.snap || !snapToken) return
    setLoading(true)

    window.snap.pay(snapToken, {
      onSuccess: () => {
        window.location.reload()
      },
      onPending: () => {
        window.location.reload()
      },
      onError: () => {
        setLoading(false)
        alert('Pembayaran gagal, silakan coba lagi.')
      },
      onClose: () => {
        setLoading(false)
      },
    })
  }

  return (
    <button
      onClick={handlePay}
      disabled={!scriptReady || loading}
      className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={`Bayar pesanan ${orderNumber}`}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Memproses...
        </>
      ) : (
        'Bayar Sekarang'
      )}
    </button>
  )
}
