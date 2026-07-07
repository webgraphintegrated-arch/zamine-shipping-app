"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Poppins } from "next/font/google";

import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function AboutUsPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const stats = [
    {
      icon: Truck,
      title: "Islandwide Delivery",
      text: "Convenient pickup and delivery services across Antigua.",
    },
    {
      icon: Warehouse,
      title: "Reliable Shipping",
      text: "Air and sea freight solutions from USA to Antigua.",
    },
    {
      icon: ShieldCheck,
      title: "Trusted Support",
      text: "Professional customs clearance and customer service.",
    },
    {
      icon: Users,
      title: "Dedicated Team",
      text: "A growing team committed to smooth package handling.",
    },
  ];

  const team = [
    {
      name: "Jasmine Thomas",
      role: "Owner",
      initials: "JT",
    },
    {
      name: "Zach Thomas",
      role: "Owner",
      initials: "ZT",
    },
    {
      name: "Angel James",
      role: "Customer Service / Front Desk",
      initials: "AJ",
    },
    {
      name: "Oshin Thomas",
      role: "Deliveries & In-House Sorting",
      initials: "OT",
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
            <Link href="/how-it-works" className="transition hover:text-[#FC9700]">How It Works</Link>
                        <Link href="/track-package" className="transition hover:text-[#FC9700]">Track Package</Link>
             <Link href="/about-us" className="text-[#FC9700]">About Us</Link>
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
          alt="About Hero"
          fill
          className="object-cover opacity-20"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#061B36] via-[#061B36]/90 to-[#061B36]/70" />

        <div className="relative z-20 mx-auto max-w-7xl px-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            About Zamine
          </p>

          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight md:text-7xl">
            Trusted Shipping Solutions From USA to Antigua
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            Zamine Shipping Services provides reliable package handling,
            customs support, air freight, sea freight, and islandwide delivery
            services for customers across Antigua.
          </p>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-[30px] shadow-2xl">
            <Image
              src="/promo-banner.jpg"
              alt="Zamine"
              width={1200}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
              Who We Are
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight text-[#071D3A]">
              Professional Shipping & Delivery Services
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Zamine Shipping Services focuses on making online shopping and
              shipping easier for customers in Antigua. Our team assists with
              package processing, invoice verification, customs clearance, and
              islandwide delivery support.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              Whether you are shipping personal items or  business packages, Zamine offers dependable service and customer
              support every step of the way.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#FC9700] px-8 py-4 font-bold text-white transition hover:bg-[#e28700]"
            >
              Contact Our Team
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-[#f7faff] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
              Why Choose Us
            </p>

            <h2 className="mt-4 text-4xl font-black text-[#071D3A]">
              Reliable Support For Every Shipment
            </h2>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[24px] bg-white p-8 shadow-xl"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3E3]">
                    <Icon className="text-[#FC9700]" size={30} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-[#071D3A]">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
              Meet The Team
            </p>

            <h2 className="mt-4 text-4xl font-black text-[#071D3A]">
              The People Behind Zamine
            </h2>
          </div>

          <div className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-[24px] border border-slate-100 bg-white p-8 text-center shadow-lg"
              >
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#57B7DF] to-[#FC9700] text-3xl font-black text-white">
                  {member.initials}
                </div>

                <h3 className="mt-6 text-xl font-bold text-[#071D3A]">
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

      {/* CTA */}
      <section className="bg-[#061B36] py-24 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Ready To Ship?
          </p>

          <h2 className="mt-5 text-4xl font-black md:text-5xl">
            Let Zamine Handle Your Shipping Needs
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/75">
            Fast processing, customs support, and islandwide delivery services
            designed to make shipping easier.
          </p>

          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#FC9700] px-10 py-4 font-bold text-white transition hover:bg-[#e28700]"
          >
            Contact Us
            <ArrowRight size={20} />
          </Link>
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