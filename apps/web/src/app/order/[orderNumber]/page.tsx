// Server Component — order detail page with payment status
// Path: /order/[orderNumber]

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatMoney } from '@/lib/money'
import { PayButton } from './PayButton'
import type { OrderStatus, PaymentStatus } from '@/types/database'

interface PageProps {
  params: { orderNumber: string }
}

// ─── Status badge helpers ──────────────────────────────────────────────────────

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Menunggu Pembayaran',
  paid: 'Dibayar',
  processing: 'Diproses',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
}

const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Belum Dibayar',
  paid: 'Lunas',
  failed: 'Gagal',
  expired: 'Kadaluarsa',
  refunded: 'Dikembalikan',
  challenge: 'Ditinjau',
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_CLASS[status] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderNumber } = params

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-gray-900">Kamu belum login</p>
        <Link
          href="/auth/login"
          className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Login untuk melihat pesanan
        </Link>
      </div>
    )
  }

  // Fetch order — RLS ensures ownership
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      order_number,
      status,
      subtotal,
      shipping_cost,
      discount_amount,
      tax_amount,
      total_amount,
      shipping_provider,
      tracking_number,
      created_at,
      shipping_address:addresses(
        recipient_name,
        phone,
        address_line1,
        address_line2,
        city,
        province,
        postal_code
      ),
      items:order_items(
        id,
        product_name,
        variant_name,
        quantity,
        unit_price,
        total_price
      ),
      payments(
        id,
        status,
        snap_token,
        snap_redirect_url,
        payment_type,
        settlement_time,
        fraud_status
      )
    `,
    )
    .eq('order_number', orderNumber)
    .single()

  if (error || !order) {
    notFound()
  }

  // Resolve latest payment
  type PaymentRecord = {
    id: string
    status: PaymentStatus
    snap_token: string | null
    snap_redirect_url: string | null
    payment_type: string | null
    settlement_time: string | null
    fraud_status: string | null
  }

  const payments = Array.isArray(order.payments)
    ? (order.payments as PaymentRecord[])
    : []
  const latestPayment = payments[0] ?? null

  const isPendingPayment = order.status === 'pending_payment'
  const isShipped = order.status === 'shipped'

  // Resolve address
  type AddressRecord = {
    recipient_name: string
    phone: string
    address_line1: string
    address_line2: string | null
    city: string
    province: string
    postal_code: string
  }
  const addr = order.shipping_address as AddressRecord | null

  type OrderItem = {
    id: string
    product_name: string
    variant_name: string | null
    quantity: number
    unit_price: number
    total_price: number
  }
  const items = (order.items ?? []) as OrderItem[]

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="grid gap-6">
        {/* Header */}
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Detail Pesanan
          </h1>
          <p className="text-sm text-gray-500">
            Terima kasih telah berbelanja di Ginabo!
          </p>
        </div>

        {/* Order summary card */}
        <div className="grid gap-5 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          {/* Order number + status */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Nomor Pesanan
              </div>
              <div className="mt-1 font-mono text-lg font-semibold text-gray-900">
                {order.order_number}
              </div>
            </div>
            <StatusBadge status={order.status as OrderStatus} />
          </div>

          {/* Date */}
          <div className="text-sm text-gray-500">
            Dipesan pada{' '}
            <span className="font-medium text-gray-700">
              {new Date(order.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Items */}
          <div className="grid gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Produk
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900">{item.product_name}</div>
                  {item.variant_name && (
                    <div className="text-xs text-gray-500">{item.variant_name}</div>
                  )}
                  <div className="text-gray-500">
                    {item.quantity} &times; {formatMoney(item.unit_price)}
                  </div>
                </div>
                <div className="shrink-0 font-semibold text-gray-900">
                  {formatMoney(item.total_price)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="grid gap-1 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Ongkos Kirim</span>
              <span>{formatMoney(order.shipping_cost)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Diskon</span>
                <span>- {formatMoney(order.discount_amount)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatMoney(order.total_amount)}</span>
            </div>
          </div>

          {/* Payment info */}
          {latestPayment && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <div className="font-semibold text-gray-900">Pembayaran</div>
              <div className="mt-1 text-gray-600">
                Metode:{' '}
                <span className="font-medium text-gray-800">
                  {latestPayment.payment_type
                    ? latestPayment.payment_type.replace(/_/g, ' ').toUpperCase()
                    : '—'}
                </span>
              </div>
              <div className="text-gray-600">
                Status:{' '}
                <span className="font-medium text-gray-800">
                  {PAYMENT_STATUS_LABEL[latestPayment.status] ?? latestPayment.status}
                </span>
              </div>
              {latestPayment.settlement_time && (
                <div className="text-gray-600">
                  Dikonfirmasi:{' '}
                  <span className="font-medium text-gray-800">
                    {new Date(latestPayment.settlement_time).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Shipping address */}
          {addr && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <div className="font-semibold text-gray-900">Alamat Pengiriman</div>
              <div className="mt-1 text-gray-700">{addr.recipient_name}</div>
              <div className="text-gray-600">{addr.phone}</div>
              <div className="text-gray-600">
                {addr.address_line1}
                {addr.address_line2 ? `, ${addr.address_line2}` : ''}
              </div>
              <div className="text-gray-600">
                {addr.city}, {addr.province} {addr.postal_code}
              </div>
            </div>
          )}

          {/* Tracking info for shipped orders */}
          {isShipped && order.tracking_number && (
            <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 text-sm">
              <div className="font-semibold text-purple-900">Info Pengiriman</div>
              <div className="mt-1 text-purple-700">
                Kurir:{' '}
                <span className="font-medium">{order.shipping_provider ?? '—'}</span>
              </div>
              <div className="text-purple-700">
                No. Resi:{' '}
                <span className="font-mono font-medium">{order.tracking_number}</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA row */}
        <div className="flex flex-wrap gap-3">
          {isPendingPayment && latestPayment?.snap_token && (
            <PayButton
              snapToken={latestPayment.snap_token}
              orderNumber={order.order_number}
            />
          )}
          <Link
            href="/shop"
            className="inline-flex rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-900 hover:border-gray-300"
          >
            Belanja Lagi
          </Link>
          <Link
            href="/member"
            className="inline-flex rounded-full border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-900 hover:border-gray-300"
          >
            Riwayat Pesanan
          </Link>
        </div>
      </div>
    </div>
  )
}
