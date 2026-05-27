"use client";

import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { useState } from "react";
import ShippingCalculator from "@/components/ShippingCalculator";
import {
  ArrowRight,
  Clock,
  FileText,
  HelpCircle,
  MapPin,
  MapPinned,
  Menu,
  PackageCheck,
  Phone,
  UserPlus,
  X,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function HowItWorksPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Account",
      text: "Sign up with Zamine and provide your correct contact details so your packages can be matched to you.",
    },
    {
      icon: MapPinned,
      title: "Use Your Zamine Address",
      text: "When shopping online, use the ZSS address format with your full name and AIR or SEA clearly listed.",
    },
    {
      icon: FileText,
      title: "Send Your Invoice",
      text: "Submit your invoice after purchase so your shipment can be priced and prepared for customs clearance.",
    },
    {
      icon: PackageCheck,
      title: "Track & Receive",
      text: "Receive updates once your package arrives, clears customs, and is ready for delivery or pickup.",
    },
  ];

  const faqs = [
  {
    question: "How do I format my shipping address?",
    answer:
      "Use your assigned ZSS shipping code, followed by your full name and either AIR or SEA depending on your shipping method. Example: ZSS John Doe AIR.",
  },

  {
    question: "Do I need to include AIR or SEA?",
    answer:
      "Yes. Adding AIR or SEA helps our warehouse team correctly process and route your package based on your selected shipping method.",
  },

  {
    question: "When should I send my invoice?",
    answer:
      "Upload your invoice as soon as your order is placed or once your tracking number becomes available. This helps speed up customs clearance and package processing.",
  },

  {
    question: "How long does customs clearance take?",
    answer:
      "Customs processing times can vary depending on shipment volume, inspections, and package type. Our team works to process and clear packages as quickly as possible.",
  },

  {
    question: "Do you offer islandwide delivery?",
    answer:
      "Yes. Zamine Shipping Services offers convenient pickup and islandwide delivery options throughout Antigua.",
  },

  {
    question: "How do I track my package?",
    answer:
      "Once your package is processed, you can log into your customer dashboard to view shipment updates, invoice status, and pickup notifications.",
  },
];

  return (
    <main className={`${poppins.className} min-h-screen bg-white text-[#071D3A]`}>
      {/* TOP INFO BAR - DESKTOP ONLY */}
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
                        <Link href="/how-it-works" className="text-[#FC9700]">How It Works</Link>
<Link href="/track-package" className="transition hover:text-[#FC9700]">Track Package</Link>
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

              <Link href="/how-it-works" className="text-[#FC9700]" onClick={() => setMenuOpen(false)}>How It Works</Link>
              <Link href="/track-package" onClick={() => setMenuOpen(false)}>Track Package</Link>
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
      <section className="relative overflow-hidden bg-[#061B36] py-24 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image src="/hero-bg.png" alt="Zamine background" fill className="object-cover" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#FC9700]">
            Zamine Shipping Services
          </p>

          <h1 className="mt-5 text-5xl font-black md:text-7xl">
            How It Works
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/80 md:text-xl">
            A simple step-by-step guide to shipping from the USA to Antigua with Zamine.
          </p>
        </div>
      </section>

      {/* PROCESS TIMELINE */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FC9700]">
              Shipping Process
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Ship With Zamine In 4 Easy Steps
            </h2>
          </div>

          <div className="relative mt-20">
            <div className="absolute left-1/2 top-0 hidden h-full w-[3px] -translate-x-1/2 bg-slate-200 lg:block" />

            <div className="space-y-16">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={step.title}
                    className={`relative grid items-center gap-10 lg:grid-cols-2 ${
                      isEven ? "" : "lg:[&>*:first-child]:order-2"
                    }`}
                  >
                    <div className={isEven ? "lg:text-right" : "lg:text-left"}>
                      <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-xl">
                        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                          Step 0{index + 1}
                        </p>

                        <h3 className="mt-3 text-3xl font-black">{step.title}</h3>

                        <p className="mt-4 leading-8 text-slate-600">{step.text}</p>
                      </div>
                    </div>

                    <div className={isEven ? "lg:text-left" : "lg:text-right"}>
                      <div className="inline-flex h-36 w-36 items-center justify-center rounded-full bg-[#57B7DF]/15">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FC9700] text-white shadow-xl">
                          <Icon size={42} />
                        </div>
                      </div>
                    </div>

                    <div className="absolute left-1/2 top-1/2 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#FC9700] shadow-lg lg:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
<ShippingCalculator />
      {/* FAQ */}
<section className="py-24">
  <div className="mx-auto max-w-7xl px-6">
    <div className="rounded-[34px] bg-[#f5f9ff] p-8 md:p-12">

      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">

        {/* LEFT */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#FC9700] shadow-sm">
            <HelpCircle size={18} />
            Frequently Asked Questions
          </div>

          <h2 className="mt-5 text-4xl font-black">
            Got Questions?
            <br />
            We’ve Got Answers
          </h2>

          <p className="mt-4 leading-8 text-slate-600">
            Quick answers to help customers understand the shipping process.
          </p>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl bg-white p-5 shadow-sm transition"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-bold text-[#071D3A]">

                {faq.question}

                <span className="text-[#FC9700] transition duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>

              <p className="mt-4 leading-8 text-slate-600">
                {faq.answer}
              </p>
            </details>
          ))}

        </div>
      </div>
    </div>
  </div>
</section>
{/* FOOTER */}
<footer className="bg-[#57b7df] py-7 text-white">
  <div className="mx-auto max-w-7xl px-6">

    <div className="flex flex-col md:flex-row items-center justify-between gap-3">

      <p className="text-sm text-white/90 text-center md:text-left">
        © 2026 Zamine Shipping Services. All Rights Reserved.
      </p>

      <p className="text-[11px] md:text-xs text-white/70 text-center">
        Designed and Developed by{" "}
        <a
          href="https://webgraphintegrated.com"
          target="_blank"
          className="hover:text-[#071D3A] transition font-medium"
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