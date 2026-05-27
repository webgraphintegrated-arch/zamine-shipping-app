"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Poppins } from "next/font/google";
import ShippingCalculator from "@/components/ShippingCalculator";

import {
  ArrowRight,
  Clock,
  Clock3,
  FileCheck2,
  HelpCircle,
  Mail,
  MapPin,
  Menu,
  PackageCheck,
  Phone,
  Plane,
  Ship,
  ShieldCheck,
  Truck,
  Upload,
  UserPlus,
  X,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

const [contactName, setContactName] = useState("");
const [contactEmail, setContactEmail] = useState("");
const [contactMessage, setContactMessage] = useState("");
const [contactLoading, setContactLoading] = useState(false);
const [contactStatus, setContactStatus] = useState("");

  const services = [
    {
      icon: Plane,
      title: "Air Freight",
      text: "Fast and reliable shipping for urgent packages moving from the USA to Antigua.",
    },
    {
      icon: Ship,
      title: "Sea Freight",
      text: "Affordable ocean shipping for larger packages and heavy items.",
    },
    {
      icon: FileCheck2,
      title: "Customs Clearance",
      text: "Invoice and documentation support for smooth package processing.",
    },
    {
      icon: PackageCheck,
      title: "Package Tracking",
      text: "Track shipment progress from warehouse arrival to Antigua.",
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      title: "Create Your Account",
      text: "Register and receive your Zamine shipping address.",
    },
    {
      icon: Upload,
      title: "Upload Your Invoice",
      text: "Submit your invoice for package verification and processing.",
    },
    {
      icon: PackageCheck,
      title: "Track Your Package",
      text: "Receive updates throughout shipping and customs clearance.",
    },
  ];

  const team = [
    { name: "Jasmine Thomas", role: "Owner", initials: "JT" },
    { name: "Zach Thomas", role: "Owner", initials: "ZT" },
    { name: "Angel James", role: "Customer Service / Front Desk", initials: "AJ" },
    { name: "Oshin Thomas", role: "Deliveries & In-House Sorting", initials: "OT" },
  ];

  const faqs = [
    {
      q: "How do I format my shipping address?",
      a: "Use ZSS, your full name, and clearly add AIR or SEA depending on your shipment method.",
    },
    {
      q: "Do I need to send my invoice?",
      a: "Yes. Your invoice helps the team process pricing, customs clearance, and package verification.",
    },
    {
      q: "Do you offer islandwide delivery?",
      a: "Yes. Zamine offers convenient pickup and islandwide delivery options across Antigua.",
    },
    {
      q: "How do I track my package?",
      a: "Once your package is processed, you can receive updates from warehouse arrival to Antigua pickup or delivery.",
    },
  ];
  async function handleContactSubmit() {
  setContactStatus("");

  if (!contactName || !contactEmail || !contactMessage) {
    setContactStatus("Please complete all fields.");
    return;
  }

  try {
    setContactLoading(true);

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        to: "zamine.shipping268@gmail.com",

        subject: `New Contact Form Message - ${contactName}`,

        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;line-height:1.7;color:#071D3A;">

            <div style="text-align:center;margin-bottom:30px;">
              <img
                src="https://www.zamineshipping.com/zamine-logo.png"
                alt="Zamine Shipping"
                style="width:180px;height:auto;"
              />
            </div>

            <h2>New Website Contact Message</h2>

            <p>
              <strong>Full Name:</strong><br />
              ${contactName}
            </p>

            <p>
              <strong>Email:</strong><br />
              ${contactEmail}
            </p>

            <p>
              <strong>Message:</strong><br />
              ${contactMessage}
            </p>

          </div>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed");
    }

    setContactName("");
    setContactEmail("");
    setContactMessage("");

    setContactStatus("Message sent successfully.");

  } catch (error) {
    console.error(error);

    setContactStatus(
      "Something went wrong. Please try again."
    );
  } finally {
    setContactLoading(false);
  }
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
            <Link href="/" className="text-[#FC9700]">Home</Link>
            <Link href="/how-it-works" className="transition hover:text-[#FC9700]">How It Works</Link>
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
              <Link
  href="/"
  className="text-[#FC9700]"
  onClick={() => setMenuOpen(false)}
>
  Home
</Link>
              <Link href="/how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link>
              <Link
  href="/track-package"
  onClick={() => setMenuOpen(false)}
>
  Track Package
</Link>
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
      <section className="relative min-h-[660px] overflow-visible">
        <Image
          src="/hero-bg.png"
          alt="Hero"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="pointer-events-none absolute inset-0 bg-[#061B36]/60" />
<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#061B36]/95 via-[#061B36]/65 to-transparent" />

        <div className="relative z-20 mx-auto flex min-h-[660px] max-w-7xl items-center px-6 pb-28 pt-20">
          <div className="max-w-2xl text-white">
            <div className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Antigua Trusted Shipping Service
            </div>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Shipping From
              <br />
              <span className="text-[#57B7DF]">USA</span> to{" "}
              <span className="text-[#FC9700]">Antigua</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-white/85">
              Fast, reliable and affordable shipping solutions with customs support and package tracking.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
  <Link
    href="/register"
    className="flex items-center gap-3 rounded-full bg-[#FC9700] px-8 py-4 font-bold text-white shadow-lg transition hover:bg-[#e28700]"
  >
    Create Account
    <ArrowRight size={20} />
  </Link>

  <Link
    href="/track-package"
    className="flex items-center gap-3 rounded-full border-2 border-white bg-white/10 px-8 py-4 font-bold text-white backdrop-blur transition hover:bg-white hover:text-[#061B36]"
  >
    Track Package
    <PackageCheck size={20} />
  </Link>
</div>
          </div>
        </div>

        {/* FLOATING STRIP */}
        <div className="absolute bottom-[-183px] left-1/2 z-20 w-[calc(100%-40px)] max-w-5xl -translate-x-1/2 md:bottom-[-130px]">
          <div className="grid overflow-hidden rounded-[26px] bg-white shadow-2xl md:grid-cols-3 md:rounded-[30px]">
            <div className="flex items-center gap-4 border-b border-[#edf2f7] p-5 md:gap-5 md:border-b-0 md:border-r md:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef7ff] md:h-16 md:w-16">
                <Clock3 className="text-[#1587D4]" size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold md:text-xl">Fast Processing</h3>
                <p className="mt-1 text-sm leading-6 text-[#5f6b7a] md:text-base">
                  Quick package handling and updates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#FC9700] p-5 text-white md:gap-5 md:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 md:h-16 md:w-16">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold md:text-xl">Trusted Service</h3>
                <p className="mt-1 text-sm leading-6 text-white/90 md:text-base">
                  Reliable support from USA to Antigua.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 md:gap-5 md:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff5e8] md:h-16 md:w-16">
                <Truck className="text-[#FC9700]" size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold md:text-xl">Islandwide Delivery</h3>
                <p className="mt-1 text-sm leading-6 text-[#5f6b7a] md:text-base">
                  Pickup and delivery across Antigua.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-white pb-24 pt-72 md:pt-56">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
              Our Services
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Reliable Shipping Solutions
            </h2>
          </div>

          <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {services.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[18px] border border-slate-100 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3E3]">
                    <Icon className="text-[#FC9700]" size={30} />
                  </div>

                  <h3 className="text-lg font-bold">{item.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
              How It Works
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight text-[#071D3A]">
              A simple shipping process for every customer.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Create an account, use the correct Zamine address, submit your invoice, and follow your package updates from the USA to Antigua.
            </p>

            <Link
              href="/how-it-works"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#FC9700] px-8 py-4 font-bold text-white"
            >
              View Full Process
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="space-y-5">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex gap-5 rounded-2xl bg-white p-6 shadow-lg">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#57B7DF] text-white">
                    <Icon size={26} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#FC9700]">
                      Step 0{index + 1}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-[#071D3A]">
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-7 text-slate-600">
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROMO SECTION */}
<section className="bg-white py-20">
  <div className="mx-auto max-w-7xl px-6">
    <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-r from-[#ff6a00] via-[#FC9700] to-[#ffb347] shadow-2xl">

      {/* BACKGROUND DECOR */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute right-20 top-8 h-60 w-60 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-40px] h-80 w-80 rounded-full bg-[#061B36] blur-3xl" />
      </div>

      <div className="relative z-20 grid min-h-[360px] items-center gap-10 px-8 py-12 md:grid-cols-2 md:px-16 md:py-16">

        {/* LEFT CONTENT */}
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-white/90">
            Zamine Shipping Services
          </p>

          <h2 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
            Discover Easy
            <br />
            Online Shopping
            <br />
            & Shipping
          </h2>

          <p className="mt-5 max-w-xl text-base font-medium leading-8 text-white/90 md:text-lg">
            Shop from your favorite USA stores and ship your packages to Antigua with reliable air and sea freight support.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
  <Link
    href="/register"
    className="flex items-center gap-3 rounded-full bg-[#FC9700] px-8 py-4 font-bold text-white shadow-lg transition hover:bg-[#e28700]"
  >
    Create Account
    <ArrowRight size={20} />
  </Link>

  <Link
    href="/track-package"
    className="flex items-center gap-3 rounded-full border-2 border-white bg-white/10 px-8 py-4 font-bold text-white backdrop-blur transition hover:bg-white hover:text-[#061B36]"
  >
    Track Package
    <PackageCheck size={20} />
  </Link>
</div>
        </div>

        {/* RIGHT PROMO VISUAL */}
        <div className="relative hidden h-[320px] md:block">

          {/* LARGE SHAPE */}
          <div className="absolute right-10 top-1/2 h-[260px] w-[260px] -translate-y-1/2 rounded-[60px] border-[14px] border-white/30 rotate-12" />

          {/* SEARCH BAR */}
          <div className="absolute right-0 top-12 flex h-20 w-[360px] items-center justify-between rounded-full bg-white/90 px-8 shadow-2xl backdrop-blur">
            <span className="text-lg font-black text-[#061B36]">
              Track your package
            </span>

            <Link
  href="/track-package"
  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FC9700] text-white transition hover:bg-[#e28700]"
>
  <ArrowRight size={22} />
</Link>
          </div>

          {/* OFFER CARD */}
          <div className="absolute bottom-8 left-4 rounded-[30px] bg-[#061B36] p-7 text-white shadow-2xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#57B7DF]">
              Promo Highlight
            </p>

            <h3 className="mt-3 text-4xl font-black">
              FREE
            </h3>

            <p className="mt-1 text-xl font-bold">
              Islandwide Delivery
            </p>
          </div>

          {/* FLOATING BADGE */}
          <div className="absolute right-24 bottom-2 rounded-full bg-white px-7 py-4 text-lg font-black text-[#FC9700] shadow-2xl">
            AIR + SEA
          </div>

        </div>
      </div>
    </div>
  </div>
</section>

      {/* TEAM */}
      <section id="team" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
              Meet The Team
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#071D3A]">
              The People Behind Zamine
            </h2>
          </div>

          <div className="mt-12 flex gap-6 overflow-x-auto pb-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="min-w-[260px] rounded-[18px] bg-white p-7 text-center shadow-lg"
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#57B7DF] to-[#FC9700] text-3xl font-black text-white">
                  {member.initials}
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#071D3A]">
                  {member.name}
                </h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
<ShippingCalculator />
      {/* FAQ */}
      <section id="faq" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[34px] bg-[#f5f9ff] p-8 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
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
                  Quick answers to help customers understand shipping, invoices, clearance, and delivery.
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq) => (
                  <details key={faq.q} className="group rounded-2xl bg-white p-5 shadow-sm">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
                      {faq.q}
                      <span className="text-[#FC9700] transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-4 leading-7 text-slate-600">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
<section id="contact" className="bg-[#f5f9ff] px-6 pb-20 pt-10">
  <div className="mx-auto max-w-7xl">
    <div className="mb-14 text-center">
      <span className="text-sm font-semibold uppercase tracking-[4px] text-[#FC9700]">
        Contact Us
      </span>

      <h2 className="mt-4 text-4xl font-black text-[#071D3A] md:text-5xl">
        We're Here To Help
      </h2>
    </div>

    <div className="grid items-stretch gap-10 lg:grid-cols-[1.3fr_0.7fr]">

      {/* FORM */}
      <div className="flex h-full flex-col rounded-[32px] bg-white p-8 shadow-xl md:p-12">
        <h3 className="mb-3 text-3xl font-black text-[#071D3A]">
          Send us a message
        </h3>

        <p className="mb-10 leading-7 text-[#6B7280]">
          Have questions about shipping, customs clearance or package tracking?
          Fill out the form below.
        </p>

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#1587D4]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#1587D4]"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-1 flex-col">
          <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
            Message
          </label>

          <textarea
            rows={10}
            placeholder="Enter your message"
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            className="min-h-[260px] w-full flex-1 rounded-2xl border border-[#dbe4f0] p-5 outline-none focus:border-[#1587D4]"
          />
        </div>

        <button
          onClick={handleContactSubmit}
          disabled={contactLoading}
          className="mt-8 rounded-full bg-[#FC9700] px-10 py-4 font-bold text-white shadow-lg transition hover:bg-[#e88900] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {contactLoading ? "Sending..." : "Send Message"}
        </button>

        {contactStatus && (
          <p className="mt-4 text-sm font-semibold text-[#071D3A]">
            {contactStatus}
          </p>
        )}
      </div>

      {/* CONTACT INFO */}
      <div className="h-full rounded-[32px] bg-[#58b6dd] p-8 text-white shadow-xl">
        <h3 className="text-3xl font-black leading-tight">
          Contact Information
        </h3>

        <p className="mt-4 leading-7 text-white/80">
          Our team is available during business hours to assist with all your shipping and delivery needs.
        </p>

        <div className="mt-10 space-y-5">

          <div className="rounded-2xl bg-white/10 p-5">
            <p className="mb-1 text-sm text-white/70">
              Hotline
            </p>

            <h4 className="text-xl font-bold">
              +1 (268) 736-5780/81
            </h4>
          </div>

          <div className="rounded-2xl bg-white/10 p-5">
            <p className="mb-1 text-sm text-white/70">
              Email
            </p>

            <h4 className="break-all text-lg font-bold">
              zamine.shipping268@gmail.com
            </h4>
          </div>

          <div className="rounded-2xl bg-white/10 p-5">
            <p className="mb-1 text-sm text-white/70">
              Address
            </p>

            <h4 className="text-lg font-bold leading-7">
              Utility Dr, Cassada Gardens,
              <br />
              St John's, Antigua
            </h4>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>

      {/* MAP */}
      <section className="bg-white">
        <div className="h-[420px] w-full md:h-[520px]">
          <iframe
            src="https://maps.google.com/maps?q=17.13222551108614,-61.81308652502546&z=16&output=embed"
            width="100%"
            height="100%"
            loading="lazy"
            className="border-0 grayscale opacity-80"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#57b7df] py-7 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 md:flex-row">
          <p className="text-center text-sm text-white/90 md:text-left">
            © 2026 Zamine Shipping Services. All Rights Reserved.
          </p>

          <p className="text-center text-[11px] text-white/70">
            Designed and Developed by{" "}
            <a
              href="https://webgraphintegrated.com"
              target="_blank"
              className="font-medium transition hover:text-[#071D3A]"
            >
              Webgraph Integrated
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}