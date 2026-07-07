import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { ArrowLeft } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function PrivacyPolicyPage() {
  return (
    <main className={`${poppins.className} min-h-screen bg-[#f5f9ff] text-[#071D3A]`}>
      <header className="bg-[#061B36] px-6 py-6 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/">
            <Image
              src="/zamine-logo.png"
              alt="Zamine Shipping"
              width={220}
              height={80}
              className="h-auto w-[180px]"
            />
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-full bg-[#FC9700] px-6 py-3 font-bold text-white"
          >
            <ArrowLeft size={18} />
            Back Home
          </Link>
        </div>
      </header>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-[34px] bg-white p-8 shadow-xl md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Legal
          </p>

          <h1 className="mt-4 text-5xl font-black">
            Privacy Policy
          </h1>

          <p className="mt-6 leading-8 text-slate-600">
            Zamine Shipping Services values your privacy and is committed to protecting your personal information.
          </p>

          <div className="mt-12 space-y-10">
            {[
              ["Information We Collect", "We may collect your name, email address, phone number, shipping details, uploaded invoices, package information, and account activity when using our website and services."],
              ["How We Use Your Information", "Your information is used to process shipments, communicate package updates, manage customer accounts, provide support, improve our services, and comply with customs and shipping requirements."],
              ["Invoice & Package Information", "Uploaded invoices and package details are used strictly for shipment processing, customs clearance, verification, and pricing purposes."],
              ["Data Security", "We take reasonable measures to protect your personal information and limit unauthorized access to customer data."],
              ["Third-Party Services", "Our website may use trusted third-party services for email communication, authentication, hosting, analytics, and shipping-related operations."],
              ["Contact Us", "For questions regarding this Privacy Policy, please contact Zamine Shipping Services directly."],
            ].map(([title, text]) => (
              <section key={title}>
                <h2 className="text-2xl font-black">
                  {title}
                </h2>

                <p className="mt-4 leading-8 text-slate-600">
                  {text}
                </p>
              </section>
            ))}
          </div>
        </div>
      </section>

     {/* FOOTER */}
<footer className="bg-[#57b7df] py-8 text-white">
  <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 md:flex-row">

    <div className="text-center md:text-left">
      <p className="text-sm font-medium text-white">
        © 2026 Zamine Shipping Services. All Rights Reserved.
      </p>
    </div>

    <div className="flex flex-col items-center gap-3 md:items-end">
      <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-bold md:justify-end">
        <Link href="/privacy-policy" className="text-white underline-offset-4 transition hover:text-[#071D3A] hover:underline">
          Privacy Policy
        </Link>

        <Link href="/terms-and-conditions" className="text-white underline-offset-4 transition hover:text-[#071D3A] hover:underline">
          Terms & Conditions
        </Link>
      </div>

      <p className="text-center text-[13px] text-white/80">
        Designed and Developed by{" "}
        <a
          href="https://webgraphintegrated.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold transition hover:text-[#071D3A]"
        >
          Webgraph Integrated
        </a>
      </p>
    </div>

  </div>
</footer>
    </main>
  );
}