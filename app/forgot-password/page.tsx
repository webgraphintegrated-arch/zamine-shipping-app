"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Poppins } from "next/font/google";
import { Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleResetPassword() {
    setMessage("");

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        process.env.NEXT_PUBLIC_SITE_URL + "/reset-password",
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password reset link sent. Please check your email.");
  }

  return (
    <main className={`${poppins.className} min-h-screen bg-[#f5f9ff]`}>
      <section className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-xl md:p-10">
          <Link href="/">
            <Image
              src="/zamine-logo.png"
              alt="Zamine"
              width={220}
              height={80}
              className="mb-8 h-auto w-[190px]"
            />
          </Link>

          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Password Help
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#071D3A]">
            Forgot Password
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Enter your email address and we’ll send you a secure password reset link.
          </p>

          <div className="mt-8">
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

          {message && (
            <div className="mt-5 rounded-2xl bg-[#f5f9ff] p-4 text-sm font-semibold text-[#071D3A]">
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FC9700] font-black text-white transition hover:bg-[#e28700] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
            <ArrowRight size={20} />
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Remember your password?{" "}
            <Link href="/login" className="font-bold text-[#FC9700]">
              Login here
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}