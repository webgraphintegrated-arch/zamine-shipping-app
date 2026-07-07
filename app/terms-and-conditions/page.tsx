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
                "Air Freight",
                "Air freight shipments are charged at EC$10.00 per pound based on the actual weight determined by Zamine Shipping Services when the package is received and processed.",
              ],
              [
                "Sea Freight",
                "Sea freight shipments are charged at EC$6.00 per pound based on the actual weight determined by Zamine Shipping Services when the package is received and processed.",
              ],
              [
                "Customs Charges",
                "Customs duties are calculated at 51.5% of the declared value for eligible goods. Books shipped by themselves are exempt from customs duties. Items with a declared value under EC$20.00 are also exempt. If books are shipped together with taxable items, the customs exemption may not apply.",
              ],
              [
                "Shipping Calculator Disclaimer",
                "The shipping calculator on this website is provided for estimation purposes only. Final charges may differ after your package is received, weighed, measured, inspected, and processed by the warehouse. Retailers such as Amazon may package items differently than expected, which can affect the final shipping weight and cost.",
              ],
              [
                "Warehouse Weighing Process",
                "All packages are weighed upon arrival at the warehouse. The official warehouse weight is used for billing purposes, regardless of any estimated weight provided by the retailer, customer, or online calculator.",
              ],
              [
                "Oversized Packages",
                "Large, bulky, or unusually shaped packages may require additional handling or review. Final shipping costs will be based on the package received and processed by the warehouse.",
              ],
              [
                "Package Inspection",
                "Zamine Shipping Services reserves the right to inspect shipments when required for customs processing, security, verification of declared contents, or compliance with applicable laws and shipping requirements.",
              ],
              [
                "Restricted & Prohibited Items",
                "Customers must not ship prohibited, illegal, hazardous, or restricted items through Zamine Shipping Services. Such items may be refused, delayed, confiscated, returned, or reported to the appropriate authorities.",
              ],
              [
                "Customer Responsibilities",
                "Customers are responsible for providing accurate contact information, shipping details, invoices, declared values, and package documentation. Incorrect or incomplete information may result in shipment delays or additional charges.",
              ],
              [
                "Invoice Requirements",
                "Customers may be required to upload invoices before customs processing can be completed. Failure to provide a valid invoice may delay shipment processing, customs clearance, pickup, or delivery.",
              ],
              [
                "Package Processing",
                "Processing and delivery times may vary depending on shipment volume, customs inspections, carrier delays, weather conditions, public holidays, and other circumstances beyond the control of Zamine Shipping Services.",
              ],
              [
                "Payments",
                "Outstanding balances must be paid before packages are released for pickup or delivery. Packages may be held until all applicable shipping charges, customs duties, and related balances are settled.",
              ],
              [
                "Pickup Process",
                "Customers will be notified when their package is ready for pickup. A valid form of identification may be required before a package is released.",
              ],
              [
                "Delivery Process",
                "Where delivery services are offered, delivery times are estimates only and may vary based on location, availability, weather, traffic, and operational conditions.",
              ],
              [
                "Changes To Terms",
                "Zamine Shipping Services reserves the right to update these Terms & Conditions at any time. Updated versions will be published on this website and become effective once posted.",
              ],
              [
                "Contact Us",
                "If you have questions about these Terms & Conditions or Zamine Shipping Services, please contact us through our Contact page, by email, or by phone during normal business hours.",
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
              <Link href="/privacy-policy" className="transition hover:text-[#071D3A]">
                Privacy Policy
              </Link>

              <Link href="/terms-and-conditions" className="transition hover:text-[#071D3A]">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}