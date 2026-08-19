// Midtrans Snap "finish" callback — reached after a payment attempt completes
// (success, pending, or denied). Midtrans appends order_id as a query param.
// Path: /checkout/finish

import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { order_id?: string };
}

export default function CheckoutFinishPage({ searchParams }: PageProps) {
  redirect(searchParams.order_id ? `/order/${searchParams.order_id}` : "/member");
}
