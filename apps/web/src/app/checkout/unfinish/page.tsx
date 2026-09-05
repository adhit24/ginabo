// DOKU Checkout unfinish callback — reached when the customer cancels or leaves payment page.
// Path: /checkout/unfinish

import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { order_id?: string; order?: string; invoice_number?: string };
}

export default function CheckoutUnfinishPage({ searchParams }: PageProps) {
  const orderNumber = searchParams.order_id || searchParams.order || searchParams.invoice_number;
  redirect(orderNumber ? `/order/${orderNumber}` : "/member");
}
