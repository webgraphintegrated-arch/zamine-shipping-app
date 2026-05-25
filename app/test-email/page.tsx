"use client";

export default function TestEmailPage() {
  const sendTestEmail = async () => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "jenell.j.james@gmail.com",
          subject: "Zamine Shipping Test Email",
          html: `
            <div style="font-family: Arial; padding: 20px;">
              <h1 style="color:#FC9700;">Zamine Shipping</h1>

              <p>Your email system is now connected successfully.</p>

              <p>This is a test email from your Zamine Shipping platform.</p>
            </div>
          `,
        }),
      });

      const data = await response.json();

      console.log(data);

      alert("Email sent!");
    } catch (error) {
      console.error(error);
      alert("Failed to send");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={sendTestEmail}
        className="rounded-xl bg-orange-500 px-6 py-4 text-white"
      >
        Send Test Email
      </button>
    </div>
  );
}
