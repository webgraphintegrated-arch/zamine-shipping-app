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

        <!-- HEADER -->
        <div style="background:#061B36;border-radius:28px 28px 0 0;padding:40px 30px;text-align:center;">

          <div style="display:inline-block;background:#ffffff;border-radius:18px;padding:14px 20px;margin-bottom:22px;">
            <img
              src="https://www.zamineshipping.com/zamine-logo.png"
              alt="Zamine Shipping Services"
              style="width:190px;height:auto;display:block;"
            />
          </div>

          <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:900;letter-spacing:-0.5px;">
            Zamine Shipping
          </h1>

          <p style="margin:12px 0 0;color:#57B7DF;font-size:14px;font-weight:700;">
            Your package is ready for pickup
          </p>
        </div>

        <!-- BODY -->
        <div style="background:#ffffff;padding:36px;border-radius:0 0 28px 28px;">

          <h2 style="margin:0 0 18px;font-size:28px;color:#071D3A;font-weight:900;">
            Hi ${customerName},
          </h2>

          <p style="font-size:16px;line-height:1.8;color:#4b5563;margin:0 0 20px;">
            Good news! Your package is now ready for pickup at Zamine Shipping Services.
          </p>

          <!-- DETAILS CARD -->
          <div style="margin:30px 0;padding:24px;background:#f5f9ff;border-radius:22px;border:1px solid #e5edf5;">

            <p style="margin:0 0 14px;font-size:13px;font-weight:900;color:#FC9700;text-transform:uppercase;letter-spacing:0.12em;">
              Package Details
            </p>

            <p style="margin:10px 0;font-size:16px;color:#071D3A;">
              <strong>Tracking Number:</strong> ${trackingNumber}
            </p>

            <p style="margin:10px 0;font-size:16px;color:#071D3A;">
              <strong>Store:</strong> ${storeName || "N/A"}
            </p>

            <p style="margin:10px 0;font-size:16px;color:#071D3A;">
              <strong>Balance Due:</strong> ${balanceText}
            </p>

            <p style="margin:10px 0;font-size:16px;color:#071D3A;">
              <strong>Pickup Location:</strong>
              ${
                pickupLocation ||
                "Utility Dr, Cassada Gardens, Antigua"
              }
            </p>
          </div>

          <p style="font-size:16px;line-height:1.8;color:#4b5563;">
            Please bring a valid ID and be prepared to complete any outstanding payment before collection.
          </p>

          <!-- BUTTON -->
          <div style="margin-top:32px;">
            <a
              href="https://www.zamineshipping.com/dashboard/track-package"
              style="display:inline-block;background:#FC9700;color:#ffffff;text-decoration:none;padding:16px 30px;border-radius:999px;font-weight:800;font-size:15px;"
            >
              View Package Details
            </a>
          </div>

          <p style="margin-top:38px;font-size:14px;line-height:1.8;color:#6b7280;">
            Need help? Reply to this email or contact Zamine Shipping Services for support.
          </p>
        </div>

        <!-- FOOTER -->
        <p style="text-align:center;margin-top:24px;font-size:12px;color:#94a3b8;">
          © 2026 Zamine Shipping Services. All rights reserved.
        </p>

      </div>
    </div>
  `;
}