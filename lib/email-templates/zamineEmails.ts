const brand = {
  navy: "#061B36",
  orange: "#FC9700",
  blue: "#57B7DF",
  light: "#f5f9ff",
  text: "#071D3A",
};

function emailWrapper(content: string) {
  return `
  <div style="margin:0;padding:0;background:${brand.light};font-family:Arial,Helvetica,sans-serif;color:${brand.text};">
    <div style="max-width:680px;margin:0 auto;padding:30px 18px;">
      <div style="background:${brand.navy};border-radius:28px 28px 0 0;padding:30px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:900;">Zamine Shipping</h1>
        <p style="margin:10px 0 0;color:${brand.blue};font-size:14px;font-weight:700;">
          Shipping from USA to Antigua
        </p>
      </div>

      <div style="background:#ffffff;padding:34px;border-radius:0 0 28px 28px;">
        ${content}
      </div>

      <p style="text-align:center;margin-top:22px;font-size:12px;color:#94a3b8;">
        © 2026 Zamine Shipping Services. All rights reserved.
      </p>
    </div>
  </div>`;
}

function button(label: string, link: string) {
  return `
    <a href="${link}" style="display:inline-block;margin-top:24px;background:${brand.orange};color:#ffffff;text-decoration:none;padding:15px 26px;border-radius:999px;font-weight:800;">
      ${label}
    </a>
  `;
}

export function customerRegistrationEmail({
  customerName,
}: {
  customerName: string;
}) {
  return emailWrapper(`
    <h2 style="margin:0 0 16px;font-size:28px;color:${brand.text};">Welcome to Zamine, ${customerName}!</h2>

    <p style="font-size:16px;line-height:1.7;color:#4b5563;">
      Your Zamine Shipping account has been created successfully. You can now upload invoices, track packages, view your shipment history, and receive package updates.
    </p>

    <div style="margin:26px 0;padding:22px;background:${brand.light};border-radius:20px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:${brand.orange};text-transform:uppercase;">
        Next Steps
      </p>

      <p style="margin:8px 0;font-size:16px;">1. Log in to your customer dashboard.</p>
      <p style="margin:8px 0;font-size:16px;">2. Use your Zamine shipping address when shopping online.</p>
      <p style="margin:8px 0;font-size:16px;">3. Upload your invoice after your order is placed.</p>
    </div>

    ${button("Go To Dashboard", "https://zamineshipping.com/dashboard")}

    <p style="margin-top:34px;font-size:14px;line-height:1.7;color:#6b7280;">
      Need help? Reply to this email or contact Zamine Shipping Services.
    </p>
  `);
}

export function invoiceUploadedEmail({
  customerName,
  trackingNumber,
  storeName,
}: {
  customerName: string;
  trackingNumber: string;
  storeName?: string;
}) {
  return emailWrapper(`
    <h2 style="margin:0 0 16px;font-size:28px;color:${brand.text};">Invoice Received</h2>

    <p style="font-size:16px;line-height:1.7;color:#4b5563;">
      Hi ${customerName}, your invoice has been submitted successfully and is now pending review by Zamine Shipping Services.
    </p>

    <div style="margin:26px 0;padding:22px;background:${brand.light};border-radius:20px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:${brand.orange};text-transform:uppercase;">
        Invoice Details
      </p>

      <p style="margin:8px 0;font-size:16px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p style="margin:8px 0;font-size:16px;"><strong>Store:</strong> ${storeName || "N/A"}</p>
    </div>

    ${button("View Package", "https://zamineshipping.com/dashboard/track-package")}
  `);
}

export function packageReceivedEmail({
  customerName,
  trackingNumber,
  storeName,
}: {
  customerName: string;
  trackingNumber: string;
  storeName?: string;
}) {
  return emailWrapper(`
    <h2 style="margin:0 0 16px;font-size:28px;color:${brand.text};">Package Received</h2>

    <p style="font-size:16px;line-height:1.7;color:#4b5563;">
      Hi ${customerName}, your package has been received and added to the Zamine Shipping system.
    </p>

    <div style="margin:26px 0;padding:22px;background:${brand.light};border-radius:20px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:${brand.orange};text-transform:uppercase;">
        Package Details
      </p>

      <p style="margin:8px 0;font-size:16px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p style="margin:8px 0;font-size:16px;"><strong>Store:</strong> ${storeName || "N/A"}</p>
      <p style="margin:8px 0;font-size:16px;"><strong>Status:</strong> Package Received</p>
    </div>

    ${button("Track Package", "https://zamineshipping.com/dashboard/track-package")}
  `);
}

export function readyForPickupEmail({
  customerName,
  trackingNumber,
  storeName,
  balanceDue,
  pickupLocation,
}: {
  customerName: string;
  trackingNumber: string;
  storeName?: string;
  balanceDue?: number;
  pickupLocation?: string;
}) {
  const balanceText =
    typeof balanceDue === "number"
      ? `EC$${balanceDue.toFixed(2)}`
      : "To be confirmed";

  return emailWrapper(`
    <h2 style="margin:0 0 16px;font-size:28px;color:${brand.text};">Your package is ready for pickup</h2>

    <p style="font-size:16px;line-height:1.7;color:#4b5563;">
      Hi ${customerName}, your package is now ready for pickup at Zamine Shipping Services.
    </p>

    <div style="margin:26px 0;padding:22px;background:${brand.light};border-radius:20px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:${brand.orange};text-transform:uppercase;">
        Pickup Details
      </p>

      <p style="margin:8px 0;font-size:16px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p style="margin:8px 0;font-size:16px;"><strong>Store:</strong> ${storeName || "N/A"}</p>
      <p style="margin:8px 0;font-size:16px;"><strong>Balance Due:</strong> ${balanceText}</p>
      <p style="margin:8px 0;font-size:16px;"><strong>Pickup Location:</strong> ${pickupLocation || "Utility Dr, Cassada Gardens, Antigua"}</p>
    </div>

    <p style="font-size:16px;line-height:1.7;color:#4b5563;">
      Please bring a valid ID and be prepared to complete any outstanding payment before collection.
    </p>

    ${button("View Package Details", "https://zamineshipping.com/dashboard/track-package")}
  `);
}

export function deliveredEmail({
  customerName,
  trackingNumber,
  storeName,
}: {
  customerName: string;
  trackingNumber: string;
  storeName?: string;
}) {
  return emailWrapper(`
    <h2 style="margin:0 0 16px;font-size:28px;color:${brand.text};">Package Delivered</h2>

    <p style="font-size:16px;line-height:1.7;color:#4b5563;">
      Hi ${customerName}, your package has been marked as delivered. Thank you for shipping with Zamine Shipping Services.
    </p>

    <div style="margin:26px 0;padding:22px;background:${brand.light};border-radius:20px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:${brand.orange};text-transform:uppercase;">
        Delivery Details
      </p>

      <p style="margin:8px 0;font-size:16px;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p style="margin:8px 0;font-size:16px;"><strong>Store:</strong> ${storeName || "N/A"}</p>
      <p style="margin:8px 0;font-size:16px;"><strong>Status:</strong> Delivered</p>
    </div>

    <p style="font-size:16px;line-height:1.7;color:#4b5563;">
      We appreciate your business and look forward to serving you again.
    </p>
  `);
}
