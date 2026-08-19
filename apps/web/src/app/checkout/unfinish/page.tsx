// Midtrans Snap "unfinish" callback — reached when the customer closes the
// Snap page before completing payment. Order stays pending; send them back
// to the order detail page where they can retry via PayButton.
// Path: /checkout/unfinish

import { redirect } from "next/navigation";

interface PageProps {
  searchParams: { order_id?: string };
}

export default function CheckoutUnfinishPage({ searchParams }: PageProps) {
  redirect(searchParams.order_id ? `/order/${searchParams.order_id}` : "/member");
}
