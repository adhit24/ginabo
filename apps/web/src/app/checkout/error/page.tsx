// Midtrans Snap "error" callback — reached when a payment attempt fails
// outright. Order stays pending; send them back to the order detail page
// where they can see the failure and retry via PayButton.
// Path: /checkout/error

import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { order_id?: string };
}

export default function CheckoutErrorPage({ searchParams }: PageProps) {
  redirect(searchParams.order_id ? `/order/${searchParams.order_id}` : "/member");
}
