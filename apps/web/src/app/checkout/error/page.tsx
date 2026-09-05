// DOKU Checkout error callback — reached when a payment attempt fails.
// Path: /checkout/error

import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { order_id?: string; order?: string; invoice_number?: string };
}

export default function CheckoutErrorPage({ searchParams }: PageProps) {
  const orderNumber = searchParams.order_id || searchParams.order || searchParams.invoice_number;
  redirect(orderNumber ? `/order/${orderNumber}` : "/member");
}
