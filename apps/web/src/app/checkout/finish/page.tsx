// DOKU Checkout finish callback — reached after a payment attempt completes.
// Path: /checkout/finish

import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { order_id?: string; order?: string; invoice_number?: string };
}

export default function CheckoutFinishPage({ searchParams }: PageProps) {
  const orderNumber = searchParams.order_id || searchParams.order || searchParams.invoice_number;
  redirect(orderNumber ? `/order/${orderNumber}` : "/member");
}
