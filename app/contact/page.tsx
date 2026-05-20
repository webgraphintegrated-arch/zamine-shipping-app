"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Poppins } from "next/font/google";

import {
  ArrowRight,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <Link href="/track-package" className="transition hover:text-[#FC9700]">Track Package</Link>
            <Link href="/about-us" className="transition hover:text-[#FC9700]">About Us</Link>
             <Link href="/contact" className="text-[#FC9700]">Contact</Link>
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
          alt="Contact Zamine"
          fill
          className="object-cover opacity-20"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#061B36] via-[#061B36]/90 to-[#061B36]/70" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Contact Zamine
          </p>

          <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
            We’re Here To Help
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/80">
            Contact our team for shipping instructions, package updates, customs
            clearance support, delivery information, and general inquiries.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-[#f5f9ff] px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-stretch gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            {/* FORM */}
            <div className="flex h-full flex-col rounded-[32px] bg-white p-8 shadow-xl md:p-12">
              <h2 className="text-3xl font-black text-[#071D3A]">
                Send us a message
              </h2>

              <p className="mt-4 leading-7 text-[#6B7280]">
                Have questions about shipping, customs clearance or package
                tracking? Fill out the form below and our team will get back to
                you shortly.
              </p>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
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
                  className="min-h-[260px] w-full flex-1 rounded-2xl border border-[#dbe4f0] p-5 outline-none focus:border-[#1587D4]"
                />
              </div>

              <button className="mt-8 rounded-full bg-[#FC9700] px-10 py-4 font-bold text-white shadow-lg transition hover:bg-[#e88900]">
                Send Message
              </button>
            </div>

            {/* INFO CARD */}
            <div className="h-full rounded-[32px] bg-[#58b6dd] p-8 text-white shadow-xl">
              <h2 className="text-3xl font-black leading-tight">
                Contact Information
              </h2>

              <p className="mt-4 leading-7 text-white/80">
                Our team is available during business hours to assist with all
                your shipping and delivery needs.
              </p>

              <div className="mt-10 space-y-5">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="mb-1 text-sm text-white/70">Hotline</p>
                  <h3 className="text-xl font-bold">+1 (268) 736-5780</h3>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="mb-1 text-sm text-white/70">Email</p>
                  <h3 className="break-all text-lg font-bold">
                    zamine.shipping268@gmail.com
                  </h3>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="mb-1 text-sm text-white/70">Address</p>
                  <h3 className="text-lg font-bold leading-7">
                    Utility Dr, Cassada Gardens,
                    <br />
                    St John's, Antigua
                  </h3>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="mb-1 text-sm text-white/70">Opening Hours</p>
                  <h3 className="text-lg font-bold leading-7">
                    Mon - Thu: 9AM - 5PM
                    <br />
                    Fri: 8AM - 4PM
                    <br />
                    Sat - Sun: Closed
                  </h3>
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

      {/* FAQ */}
      <section className="bg-[#f5f9ff] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[34px] bg-white p-8 shadow-xl md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f9ff] px-4 py-2 text-sm font-bold text-[#FC9700]">
                  <HelpCircle size={18} />
                  Frequently Asked Questions
                </div>

                <h2 className="mt-5 text-4xl font-black text-[#071D3A]">
                  Got Questions?
                  <br />
                  We’ve Got Answers
                </h2>

                <p className="mt-4 leading-8 text-slate-600">
                  Quick answers to help you understand how to contact Zamine and
                  get shipping support.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: "What should I contact Zamine for?",
                    a: "You can contact Zamine for package updates, invoice questions, customs clearance support, delivery details, and general shipping inquiries.",
                  },
                  {
                    q: "Where is Zamine located?",
                    a: "Zamine is located at Utility Dr, Cassada Gardens, St John's, Antigua.",
                  },
                  {
                    q: "What are your opening hours?",
                    a: "Monday to Thursday: 9AM to 5PM, Friday: 8AM to 4PM, Saturday and Sunday: Closed.",
                  },
                  {
                    q: "Can I ask about a package before it arrives?",
                    a: "Yes. For the best assistance, have your tracking number, invoice, full name, and shipping method ready.",
                  },
                ].map((faq) => (
                  <details
                    key={faq.q}
                    className="group rounded-2xl bg-[#f5f9ff] p-5"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
                      {faq.q}
                      <span className="text-[#FC9700] transition group-open:rotate-45">
                        +
                      </span>
                    </summary>

                    <p className="mt-4 leading-7 text-slate-600">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
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