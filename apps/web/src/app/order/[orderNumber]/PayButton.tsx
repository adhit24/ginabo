'use client'

// PayButton — redirects to DOKU Checkout for pending orders.

import { useState } from 'react'

interface Props {
  paymentUrl?: string | null
  orderNumber: string
}

export function PayButton({ paymentUrl, orderNumber }: Props) {
  const [loading, setLoading] = useState(false)

  function handlePay() {
    if (!paymentUrl) {
      alert('Halaman pembayaran belum tersedia. Silakan muat ulang halaman.')
      return
    }

    setLoading(true)
    window.location.href = paymentUrl
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading || !paymentUrl}
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
