import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { ArrowLeft } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function TermsPage() {
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
            Terms & Conditions
          </h1>

          <p className="mt-6 leading-8 text-slate-600">
            Please read these terms carefully before using Zamine Shipping Services.
          </p>

          <div className="mt-12 space-y-10">

            {[
              [
                "Shipping Estimates",
                "Shipping calculator estimates provided on this website are for general guidance only. Final charges may vary after packages are received, weighed, measured, inspected, and processed by the warehouse.",
              ],

              [
                "Customs Charges",
                "Customs fees may apply depending on item value, category, packaging, and shipment contents. Customs exemptions for books may not apply if shipped together with taxable items.",
              ],

              [
                "Customer Responsibility",
                "Customers are responsible for providing accurate shipping details, invoices, contact information, and package documentation.",
              ],

              [
                "Package Processing",
                "Processing and delivery times may vary depending on shipment volume, customs inspections, weather conditions, and carrier delays.",
              ],

              [
                "Restricted Items",
                "Customers must not ship prohibited, illegal, hazardous, or restricted items through Zamine Shipping Services.",
              ],

              [
                "Payments",
                "Outstanding balances must be settled before packages are released for pickup or delivery.",
              ],

              [
                "Shipping Calculator Disclaimer",
                "Weight calculations displayed on this website are estimates only. Final charges may differ based on actual package weight, dimensions, retailer packaging, and warehouse verification.",
              ],

              [
                "Changes To Terms",
                "Zamine Shipping Services reserves the right to update these terms at any time without prior notice.",
              ],
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

      <footer className="bg-[#57b7df] py-7 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">

          <p className="text-center text-sm text-white/90 md:text-left">
            © 2026 Zamine Shipping Services. All Rights Reserved.
          </p>

          <div className="flex flex-col items-center gap-3 md:items-end">

            <p className="text-center text-[13px] text-white/70">
              Designed and Developed by{" "}
              <a
                href="https://webgraphintegrated.com"
                target="_blank"
                className="font-medium transition hover:text-[#071D3A]"
              >
                Webgraph Integrated
              </a>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm md:justify-end">
              <Link
                href="/privacy-policy"
                className="transition hover:text-[#071D3A]"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms-and-conditions"
                className="transition hover:text-[#071D3A]"
              >
                Terms & Conditions
              </Link>
            </div>

          </div>

        </div>
      </footer>
    </main>
  );
}