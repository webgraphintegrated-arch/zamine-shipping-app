"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function LoginPage() {
  const router = useRouter();
 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setMessage("");

    if (!email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className={`${poppins.className} min-h-screen bg-[#f5f9ff] text-[#071D3A]`}>
      <section className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT SIDE */}
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
                Customer Login
              </p>

              <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight">
                Access your shipping dashboard.
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-8 text-white/80">
                Track shipments, upload invoices, view package updates, and manage your account.
              </p>
            </div>

            <p className="text-sm text-white/60">
              © 2026 Zamine Shipping Services
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
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
                Welcome Back
              </p>

              <h2 className="mt-3 text-4xl font-black text-[#071D3A]">
                Login
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Enter your account credentials below.
              </p>

              <form className="mt-8 space-y-5">
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
                    Password
                  </label>

                  <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                    <Lock size={20} className="text-[#57B7DF]" />

                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-bold text-[#FC9700] transition hover:text-[#e28700]"
                  >
                    Forgot password?
                  </Link>
                </div>
                {message && (
                  <div className="rounded-2xl bg-[#f5f9ff] p-4 text-sm font-semibold text-[#071D3A]">
                    {message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FC9700] font-black text-white transition hover:bg-[#e28700] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Logging In..." : "Login"}
                  <ArrowRight size={20} />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Don’t have an account?{" "}
                <Link href="/register" className="font-bold text-[#FC9700]">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}