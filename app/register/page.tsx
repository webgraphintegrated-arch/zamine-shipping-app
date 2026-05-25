"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, MapPin, Phone, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { sendCustomerRegistrationEmail } from "@/lib/sendZamineEmail";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister() {
  setMessage("");

  if (!fullName || !email || !phone || !address || !password) {
    setMessage("Please fill in all fields.");
    return;
  }

  setLoading(true);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        address,
      },
    },
  });

  if (error) {
    setLoading(false);
    setMessage(error.message);
    return;
  }

  const user = data.user;

  if (user) {
  await supabase.from("profiles").insert([
    {
      id: user.id,
      full_name: fullName,
      email,
      phone,
      address,
    },
  ]);

  /* =========================
     START AUTO PACKAGE CLAIM
  ========================= */

  const customerLabel = `ZSS ${fullName.toUpperCase()}`;

  const { error: claimError } = await supabase
    .from("packages")
    .update({
      customer_id: user.id,
      manually_linked: true,
    })
    .eq("customer_label", customerLabel)
    .is("customer_id", null);

  if (claimError) {
    console.log(claimError.message);
  }

  /* =========================
   END AUTO PACKAGE CLAIM
========================= */
}

/* =========================
   START REGISTRATION EMAIL
========================= */
await sendCustomerRegistrationEmail({
  customerEmail: email,
  customerName: fullName,
});
/* =========================
   END REGISTRATION EMAIL
========================= */

setLoading(false);

setMessage(
  "Account created successfully. Please check your email to confirm your account."
);

setTimeout(() => {
  router.push("/login");
}, 2000);
}
  

  return (
    <main className={`${poppins.className} min-h-screen bg-[#f5f9ff] text-[#071D3A]`}>
      <section className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-[#061B36] lg:block">
          <Image
            src="/hero-bg.png"
            alt="Zamine Shipping"
            fill
            className="object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#061B36]/95 to-[#061B36]/60" />

          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            <Link href="/">
              <Image
                src="/zamine-logo.png"
                alt="Zamine"
                width={230}
                height={80}
                className="h-auto w-[220px]"
              />
            </Link>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                Customer Account
              </p>

              <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight">
                Start shipping with Zamine today.
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-8 text-white/80">
                Create your account, get your shipping details, upload invoices, and track packages from USA to Antigua.
              </p>
            </div>

            <p className="text-sm text-white/60">
              © 2026 Zamine Shipping Services
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl">
            <div className="mb-8 lg:hidden">
              <Link href="/">
                <Image
                  src="/zamine-logo.png"
                  alt="Zamine"
                  width={220}
                  height={80}
                  className="h-auto w-[190px]"
                />
              </Link>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-xl md:p-10">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                Register
              </p>

              <h2 className="mt-3 text-4xl font-black text-[#071D3A]">
                Create Account
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Enter your details below to create your Zamine customer profile.
              </p>

              <form className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full Name
                  </label>

                  <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                    <User size={20} className="text-[#57B7DF]" />

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email Address
                  </label>

                  <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                    <Mail size={20} className="text-[#57B7DF]" />

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone Number
                  </label>

                  <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                    <Phone size={20} className="text-[#57B7DF]" />

                    <input
                      type="text"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Address
                  </label>

                  <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                    <MapPin size={20} className="text-[#57B7DF]" />

                    <input
                      type="text"
                      placeholder="Enter your address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Password
                  </label>

                  <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                    <Lock size={20} className="text-[#57B7DF]" />

                    <input
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                {message && (
                  <div className="rounded-2xl bg-[#f5f9ff] p-4 text-sm font-semibold text-[#071D3A]">
                    {message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FC9700] font-black text-white transition hover:bg-[#e28700] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                  <ArrowRight size={20} />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-[#FC9700]">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}