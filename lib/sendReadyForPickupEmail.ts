import { readyForPickupEmail } from "./email-templates/readyForPickupEmail";

export async function sendReadyForPickupEmail({
  customerEmail,
  customerName,
  trackingNumber,
  storeName,
  balanceDue,
}: {
  customerEmail: string;
  customerName: string;
  trackingNumber: string;
  storeName?: string;
  balanceDue?: number;
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          to: customerEmail,

          subject: `Package Ready for Pickup - ${trackingNumber}`,

          html: readyForPickupEmail({
            customerName,
            trackingNumber,
            storeName,
            balanceDue,
          }),
        }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error(error);
  }
}
