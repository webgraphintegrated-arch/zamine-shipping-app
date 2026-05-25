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

  return `
    <div style="margin:0;padding:0;background:#f5f9ff;font-family:Arial,Helvetica,sans-serif;color:#071D3A;">
      <div style="max-width:680px;margin:0 auto;padding:30px 18px;">
        <div style="background:#061B36;border-radius:28px 28px 0 0;padding:30px;text-align:center;">

  <img
    src="https://zamineshipping.com/zamine-logo.png"
    alt="Zamine Shipping Services"
    style="width:180px;height:auto;margin-bottom:20px;"
  />

  <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:900;">
    Zamine Shipping
  </h1>
          <p style="margin:10px 0 0;color:#57B7DF;font-size:14px;font-weight:700;">
            Your package is ready for pickup
          </p>
        </div>

        <div style="background:#ffffff;padding:34px;border-radius:0 0 28px 28px;">
          <h2 style="margin:0 0 16px;font-size:28px;color:#071D3A;">
            Hi ${customerName},
          </h2>

          <p style="font-size:16px;line-height:1.7;color:#4b5563;">
            Good news! Your package is now ready for pickup at Zamine Shipping Services.
          </p>

          <div style="margin:26px 0;padding:22px;background:#f5f9ff;border-radius:20px;">
            <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#FC9700;text-transform:uppercase;">
              Package Details
            </p>

            <p style="margin:8px 0;font-size:16px;">
              <strong>Tracking Number:</strong> ${trackingNumber}
            </p>

            <p style="margin:8px 0;font-size:16px;">
              <strong>Store:</strong> ${storeName || "N/A"}
            </p>

            <p style="margin:8px 0;font-size:16px;">
              <strong>Balance Due:</strong> ${balanceText}
            </p>

            <p style="margin:8px 0;font-size:16px;">
              <strong>Pickup Location:</strong> ${
                pickupLocation || "Utility Dr, Cassada Gardens, Antigua"
              }
            </p>
          </div>

          <p style="font-size:16px;line-height:1.7;color:#4b5563;">
            Please bring a valid ID and be prepared to complete any outstanding payment before collection.
          </p>

          <a
            href="https://zamineshipping.com/dashboard/track-package"
            style="display:inline-block;margin-top:24px;background:#FC9700;color:#ffffff;text-decoration:none;padding:15px 26px;border-radius:999px;font-weight:800;"
          >
            View Package Details
          </a>

          <p style="margin-top:34px;font-size:14px;line-height:1.7;color:#6b7280;">
            Need help? Reply to this email or contact Zamine Shipping Services for support.
          </p>
        </div>

        <p style="text-align:center;margin-top:22px;font-size:12px;color:#94a3b8;">
          © 2026 Zamine Shipping Services. All rights reserved.
        </p>
      </div>
    </div>
  `;
}
