import {
  customerRegistrationEmail,
  deliveredEmail,
  invoiceUploadedEmail,
  packageReceivedEmail,
  readyForPickupEmail,
} from "@/lib/email-templates/zamineEmails";

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      subject,
      html,
    }),
  });

  return response.json();
}

export async function sendCustomerRegistrationEmail({
  customerEmail,
  customerName,
}: {
  customerEmail: string;
  customerName: string;
}) {
  return sendEmail({
    to: customerEmail,
    subject: "Welcome to Zamine Shipping",
    html: customerRegistrationEmail({ customerName }),
  });
}

export async function sendInvoiceUploadedEmail({
  customerEmail,
  customerName,
  trackingNumber,
  storeName,
}: {
  customerEmail: string;
  customerName: string;
  trackingNumber: string;
  storeName?: string;
}) {
  return sendEmail({
    to: customerEmail,
    subject: "Your Zamine invoice was received",
    html: invoiceUploadedEmail({
      customerName,
      trackingNumber,
      storeName,
    }),
  });
}

export async function sendPackageReceivedEmail({
  customerEmail,
  customerName,
  trackingNumber,
  storeName,
}: {
  customerEmail: string;
  customerName: string;
  trackingNumber: string;
  storeName?: string;
}) {
  return sendEmail({
    to: customerEmail,
    subject: "Your Zamine package was received",
    html: packageReceivedEmail({
      customerName,
      trackingNumber,
      storeName,
    }),
  });
}

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
  return sendEmail({
    to: customerEmail,
    subject: "Your Zamine package is ready for pickup",
    html: readyForPickupEmail({
      customerName,
      trackingNumber,
      storeName,
      balanceDue,
    }),
  });
}

export async function sendDeliveredEmail({
  customerEmail,
  customerName,
  trackingNumber,
  storeName,
}: {
  customerEmail: string;
  customerName: string;
  trackingNumber: string;
  storeName?: string;
}) {
  return sendEmail({
    to: customerEmail,
    subject: "Your Zamine package was delivered",
    html: deliveredEmail({
      customerName,
      trackingNumber,
      storeName,
    }),
  });
}
