"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Poppins } from "next/font/google";
import { Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpdatePassword() {
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully.");

    setTimeout(() => {
      router.push("/login");
    }, 1500);
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
            Reset Password
          </p>

          <h1 className="mt-3 text-4xl font-black text-[#071D3A]">
            Create New Password
          </h1>

          <p className="mt-3 leading-7 text-slate-600">
            Enter your new password below to regain access to your account.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                New Password
              </label>

              <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                <Lock size={20} className="text-[#57B7DF]" />

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Confirm Password
              </label>

              <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                <Lock size={20} className="text-[#57B7DF]" />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  className="w-full outline-none"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl bg-[#f5f9ff] p-4 text-sm font-semibold text-[#071D3A]">
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={handleUpdatePassword}
            disabled={loading}
            className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FC9700] font-black text-white transition hover:bg-[#e28700] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </main>
  );
}