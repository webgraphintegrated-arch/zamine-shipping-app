"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Poppins } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";

import {
  ArrowRight,
  Clock,
  HelpCircle,
  MapPin,
  Menu,
  Phone,
  Search,
  Truck,
  X,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function TrackPackagePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [packageData, setPackageData] = useState<any>(null);
  const [message, setMessage] = useState("");
  const resultsRef = useRef<HTMLDivElement | null>(null);

  async function handleTrackPackage() {
  setLoading(true);
  setMessage("");
  setPackageData(null);

  if (!trackingNumber.trim()) {
    setMessage("Please enter a tracking number.");
    setLoading(false);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return;
  }

  const { data, error } = await supabase
    .from("packages")
    .select(
      `
      tracking_number,
      store_name,
      shipping_method,
      status,
      estimated_arrival,
      shipment_batch
    `
    )
    .eq("tracking_number", trackingNumber.trim())
    .maybeSingle();

  if (error || !data) {
    setMessage(
      "Package not found. Please verify your tracking number or contact Zamine."
    );

    setLoading(false);

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return;
  }

  setPackageData(data);

  setLoading(false);

  setTimeout(() => {
    resultsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

  return (
    <main className={`${poppins.className} min-h-screen bg-white text-[#071D3A]`}>
      {/* TOP INFO BAR */}
      <div className="hidden bg-[#57B7DF] text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 text-sm font-semibold">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Utility Dr, Cassada Gardens, Antigua</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>(268) 736-5780 / 5781</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Mon - Thu: 9AM - 5PM | Fri: 8AM - 4PM | Sat - Sun: Closed</span>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061B36]/95 text-white shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/">
            <Image
              src="/zamine-logo.png"
              alt="Zamine Shipping"
              width={220}
              height={80}
              priority
              className="h-auto w-[160px] md:w-[220px]"
            />
          </Link>

          <nav className="hidden items-center gap-9 text-sm font-semibold lg:flex">
            <Link href="/" className="transition hover:text-[#FC9700]">Home</Link>
            <Link href="/how-it-works" className="transition hover:text-[#FC9700]">How It Works</Link>
            <Link href="/track-package" className="text-[#FC9700]">Track Package</Link>
            <Link href="/about-us" className="transition hover:text-[#FC9700]">About Us</Link>
            <Link href="/contact" className="transition hover:text-[#FC9700]">Contact</Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-[#FC9700] px-7 py-3 font-bold text-white transition hover:bg-[#e28700]"
            >
              Register
              <ArrowRight size={18} />
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full bg-[#FC9700] p-3 text-white lg:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#061B36] px-6 pb-6 pt-4 lg:hidden">
            <nav className="flex flex-col gap-4 text-sm font-semibold">
              <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link href="/how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link>
              <Link href="/track-package" className="text-[#FC9700]" onClick={() => setMenuOpen(false)}>Track Package</Link>
              <Link href="/about-us" onClick={() => setMenuOpen(false)}>About Us</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            </nav>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-white/10 px-5 py-4 text-center font-bold text-white"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-[#FC9700] px-5 py-4 text-center font-bold text-white"
              >
                Register
              </Link>
            </div>

            <div className="mt-6 space-y-4 rounded-2xl bg-white/10 p-5 text-sm text-white/90">
              <div className="flex gap-3">
                <MapPin size={18} className="mt-1 shrink-0 text-[#FC9700]" />
                <span>Utility Dr, Cassada Gardens, Antigua</span>
              </div>

              <div className="flex gap-3">
                <Phone size={18} className="mt-1 shrink-0 text-[#FC9700]" />
                <span>(268) 736-5780 / 5781</span>
              </div>

              <div className="flex gap-3">
                <Clock size={18} className="mt-1 shrink-0 text-[#FC9700]" />
                <span>
                  Mon - Thu: 9AM - 5PM
                  <br />
                  Fri: 8AM - 4PM
                  <br />
                  Sat - Sun: Closed
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#061B36] py-28 text-white">
        <Image
          src="/hero-bg.png"
          alt="Track package"
          fill
          className="object-cover opacity-20"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#061B36] via-[#061B36]/90 to-[#061B36]/70" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Track Package
          </p>

          <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
            Track Your Shipment
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/80">
            Enter your tracking number to view your package status from the USA to Antigua.
          </p>
        </div>
      </section>

      {/* TRACKING BOX */}
      <section className="bg-[#f5f9ff] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[34px] bg-white p-8 shadow-xl md:p-12">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF3E3]">
                <Search className="text-[#FC9700]" size={36} />
              </div>

              <h2 className="mt-6 text-4xl font-black text-[#071D3A]">
                Enter Tracking Number
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-600">
                Public tracking shows limited package details only. Log in to view invoices, balances, receipts and full package history.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4 md:flex-row">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Example: ZSS123456789"
                className="h-16 flex-1 rounded-2xl border border-[#dbe4f0] px-6 text-lg outline-none focus:border-[#1587D4]"
              />

              <button
                onClick={handleTrackPackage}
                disabled={loading}
                className="h-16 rounded-2xl bg-[#FC9700] px-10 text-lg font-black text-white transition hover:bg-[#e28700] disabled:opacity-60"
              >
                {loading ? "Tracking..." : "Track Now"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="rounded-full bg-[#061B36] px-6 py-3 text-sm font-black text-white"
              >
                Customer Login
              </Link>

              <Link
                href="/register"
                className="rounded-full bg-[#57B7DF] px-6 py-3 text-sm font-black text-white"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKING RESULTS */}
<div ref={resultsRef}>
  {message && (
    <section className="bg-[#f5f9ff] px-6 pb-12">
      <div className="mx-auto max-w-5xl rounded-[32px] bg-white p-8 text-center shadow-lg">
        <p className="text-xl font-bold text-red-500">
          {message}
        </p>
      </div>
    </section>
  )}

  {packageData && (
    <section className="bg-[#f5f9ff] px-6 pb-20">
      <div className="mx-auto max-w-5xl rounded-[34px] bg-white p-8 shadow-xl md:p-12">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
              Package Found
            </p>

            <h2 className="mt-4 text-4xl font-black text-[#071D3A]">
              {packageData.tracking_number}
            </h2>

            <p className="mt-3 text-slate-500">
              {packageData.store_name || "Store not listed"}
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFF3E3] px-6 py-4">
            <p className="text-xs font-black uppercase text-[#FC9700]">
              Current Status
            </p>

            <h3 className="mt-2 text-2xl font-black text-[#071D3A]">
              {packageData.status || "Pending"}
            </h3>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-[#f5f9ff] p-5">
            <p className="text-xs font-black uppercase text-slate-400">
              Shipping Method
            </p>

            <h3 className="mt-2 text-xl font-black text-[#071D3A]">
              {packageData.shipping_method || "N/A"}
            </h3>
          </div>

          <div className="rounded-2xl bg-[#f5f9ff] p-5">
            <p className="text-xs font-black uppercase text-slate-400">
              Estimated Arrival
            </p>

            <h3 className="mt-2 text-xl font-black text-[#071D3A]">
              {packageData.estimated_arrival
                ? new Date(
                    packageData.estimated_arrival
                  ).toLocaleDateString()
                : "N/A"}
            </h3>
          </div>

          <div className="rounded-2xl bg-[#f5f9ff] p-5">
            <p className="text-xs font-black uppercase text-slate-400">
              Shipment Batch
            </p>

            <h3 className="mt-2 text-xl font-black text-[#071D3A]">
              {packageData.shipment_batch || "Not Assigned"}
            </h3>
          </div>

          <div className="rounded-2xl bg-[#f5f9ff] p-5">
            <p className="text-xs font-black uppercase text-slate-400">
              Full Details
            </p>

            <Link
              href="/login"
              className="mt-2 inline-flex rounded-full bg-[#FC9700] px-5 py-2 text-sm font-black text-white"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </section>
  )}
</div>

      {/* TRACKING TIMELINE */}
      <section className="bg-[#f5f9ff] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
              Package Journey
            </p>

            <h2 className="mt-4 text-4xl font-black text-[#071D3A]">
              Tracking Stages
            </h2>
          </div>

          <div className="mt-12 space-y-5">
            
            {(() => {
  const stages = [
    "Invoice Received",
    "Delivered to US Warehouse",
    "Ready For Pickup",
    "Delivered",
  ];

  const currentStatus = packageData?.status || "";

  const currentIndex = stages.findIndex(
    (stage) =>
      stage.toLowerCase() === currentStatus.toLowerCase()
  );

  return stages.map((stage, index) => {
    const completed = index < currentIndex;
    const active = index === currentIndex;

    return (
      <div
        key={stage}
        className={`flex gap-5 rounded-2xl border p-6 shadow-lg transition ${
          completed
            ? "border-[#57B7DF] bg-[#dff4ff]"
            : active
            ? "border-[#FC9700]/30 bg-[#fff8f0]"
            : "border-[#edf2f7] bg-white"
        }`}
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-black text-white ${
            completed
              ? "bg-[#57B7DF]"
              : active
              ? "bg-[#FC9700]"
              : "bg-[#cbd5e1]"
          }`}
        >
          {completed ? "✓" : index + 1}
        </div>

        <div>
          <h3 className="text-xl font-bold text-[#071D3A]">
            {stage}
          </h3>

          <p className="mt-2 text-slate-600">
            {completed
              ? "Completed successfully."
              : active
              ? "Your package is currently at this stage."
              : "Pending package progress."}
          </p>
        </div>
      </div>
    );
  });
})()}

            
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[34px] bg-[#f5f9ff] p-8 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#FC9700] shadow-sm">
                  <HelpCircle size={18} />
                  Tracking FAQs
                </div>

                <h2 className="mt-5 text-4xl font-black">
                  Need Tracking Help?
                </h2>

                <p className="mt-4 leading-8 text-slate-600">
                  If your tracking has not updated, contact Zamine with your full name, tracking number and invoice.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  ["Why can’t I see billing information here?", "For privacy, billing, invoices and receipts are only available after logging into your customer dashboard."],
                  ["What do I need to check my package?", "You only need your tracking number for public tracking."],
                  ["How do I see full details?", "Log in or register for a customer account to view your full package dashboard."],
                ].map(([q, a]) => (
                  <details key={q} className="group rounded-2xl bg-white p-5 shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
                      {q}
                      <span className="text-[#FC9700] transition group-open:rotate-45">+</span>
                    </summary>

                    <p className="mt-4 leading-7 text-slate-600">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#061B36] py-20 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Truck className="mx-auto text-[#FC9700]" size={44} />

          <h2 className="mt-5 text-4xl font-black md:text-5xl">
            Want Full Package Details?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/75">
            Create an account or log in to view invoices, payment status, receipts and full shipment history.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 font-bold text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-3 rounded-full bg-[#FC9700] px-8 py-4 font-bold text-white"
            >
              Register
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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