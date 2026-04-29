import { subDays } from "date-fns";

import type { Prisma } from "@prisma/client";

export async function enqueueBookingNotifications(opts: {
  tx: Prisma.TransactionClient;
  bookingNumber: string;
  customer: { name: string; email: string | null; phone: string | null };
  startAt: Date;
}) {
  const jobs: Array<Promise<unknown>> = [];

  if (opts.customer.email) {
    jobs.push(
      opts.tx.notificationJob.create({
        data: {
          channel: "EMAIL",
          eventType: "BOOKING_CONFIRMED",
          to: opts.customer.email,
          subject: `Booking confirmed ${opts.bookingNumber}`,
          body: `Hi ${opts.customer.name}, booking kamu sudah dikonfirmasi. ID: ${opts.bookingNumber}.`,
          scheduledAt: new Date()
        }
      })
    );

    jobs.push(
      opts.tx.notificationJob.create({
        data: {
          channel: "EMAIL",
          eventType: "BOOKING_REMINDER_H1",
          to: opts.customer.email,
          subject: `Reminder booking ${opts.bookingNumber}`,
          body: `Hi ${opts.customer.name}, reminder H-1 untuk booking kamu. ID: ${opts.bookingNumber}.`,
          scheduledAt: subDays(opts.startAt, 1)
        }
      })
    );
  }

  if (opts.customer.phone) {
    jobs.push(
      opts.tx.notificationJob.create({
        data: {
          channel: "WHATSAPP",
          eventType: "BOOKING_CONFIRMED",
          to: opts.customer.phone,
          payload: { template: "booking_confirmed", params: { name: opts.customer.name, bookingNumber: opts.bookingNumber } },
          scheduledAt: new Date()
        }
      })
    );

    jobs.push(
      opts.tx.notificationJob.create({
        data: {
          channel: "WHATSAPP",
          eventType: "BOOKING_REMINDER_H1",
          to: opts.customer.phone,
          payload: { template: "booking_reminder_h1", params: { name: opts.customer.name, bookingNumber: opts.bookingNumber } },
          scheduledAt: subDays(opts.startAt, 1)
        }
      })
    );
  }

  await Promise.all(jobs);
}

export async function enqueueOrderNotifications(opts: {
  tx: Prisma.TransactionClient;
  orderNumber: string;
  customer: { name: string; email: string | null; phone: string | null };
}) {
  const jobs = [];
  if (opts.customer.email) {
    jobs.push(
      opts.tx.notificationJob.create({
        data: {
          channel: "EMAIL",
          eventType: "ORDER_CREATED",
          to: opts.customer.email,
          subject: `Order created ${opts.orderNumber}`,
          body: `Hi ${opts.customer.name}, order kamu sudah tercatat. ID: ${opts.orderNumber}.`,
          scheduledAt: new Date()
        }
      })
    );
  }
  if (opts.customer.phone) {
    jobs.push(
      opts.tx.notificationJob.create({
        data: {
          channel: "WHATSAPP",
          eventType: "ORDER_CREATED",
          to: opts.customer.phone,
          payload: { template: "order_created", params: { name: opts.customer.name, orderNumber: opts.orderNumber } },
          scheduledAt: new Date()
        }
      })
    );
  }
  await Promise.all(jobs);
}
