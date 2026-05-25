"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Box,
  CreditCard,
  History,
  Lock,
  LogOut,
  PackageCheck,
  Settings,
  Upload,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function DashboardSettingsPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [customerName, setCustomerName] = useState("Customer");
  const [customerEmail, setCustomerEmail] = useState("");

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setCustomerEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone_number, avatar_url, role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
        return;
      }

      if (profile?.role === "warehouse_admin") {
        router.push("/admin/warehouse");
        return;
      }

      const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "Customer";

        setAvatarUrl(profile?.avatar_url || ""); 
      setCustomerName(name);
      setFullName(name);
      setPhoneNumber(profile?.phone_number || "");
     

      setLoadingUser(false);
    }

    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleUpdateProfile() {
    setMessage("");

    if (!fullName.trim()) {
      setMessage("Full name is required.");
      return;
    }

    setUpdatingProfile(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUpdatingProfile(false);
      router.push("/login");
      return;
    }

    let uploadedAvatarUrl = avatarUrl;

    if (avatarFile) {
      if (avatarFile.size > 2 * 1024 * 1024) {
  setUpdatingProfile(false);
  setMessage("Profile image must be under 2MB.");
  return;
}
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

if (!allowedTypes.includes(avatarFile.type)) {
  setUpdatingProfile(false);
  setMessage("Only JPG, PNG and WEBP images are allowed.");
  return;
}
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true,
        });

      if (uploadError) {
        setUpdatingProfile(false);
        setMessage(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      uploadedAvatarUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        avatar_url: uploadedAvatarUrl,
      })
      .eq("id", user.id);

    setUpdatingProfile(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCustomerName(fullName.trim());
    setAvatarUrl(uploadedAvatarUrl);
    setAvatarFile(null);
    setMessage("Profile updated successfully.");
  }

  async function handleChangePassword() {
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

    setUpdatingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setUpdatingPassword(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage("Password updated successfully.");
  }

  if (loadingUser) {
    return (
      <main
        className={`${poppins.className} flex min-h-screen items-center justify-center bg-[#f5f9ff]`}
      >
        <p className="font-bold text-[#071D3A]">
          Loading settings...
        </p>
      </main>
    );
  }

  return (
    <main className={`${poppins.className} min-h-screen bg-[#f5f9ff]`}>
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] flex-col bg-[#061B36] text-white lg:flex">
          <div className="border-b border-white/10 p-8">
            <Link href="/">
              <Image
                src="/zamine-logo.png"
                alt="Zamine"
                width={220}
                height={80}
                className="h-auto w-[180px]"
              />
            </Link>
          </div>

          <div className="flex-1 space-y-2 p-5">
            {[
              {
                title: "Dashboard",
                icon: Box,
                href: "/dashboard",
              },
              {
                title: "Track Package",
                icon: PackageCheck,
                href: "/dashboard/track-package",
              },
              {
                title: "Upload Invoice",
                icon: Upload,
                href: "/dashboard/upload",
              },
              {
                title: "Billing",
                icon: CreditCard,
                href: "/dashboard/billing",
              },
              {
                title: "History",
                icon: History,
                href: "/dashboard/history",
              },
              {
                title: "Notifications",
                icon: Bell,
                href: "/dashboard/notifications",
              },
              {
                title: "Settings",
                icon: Settings,
                href: "/dashboard/settings",
              },
            ].map((item) => {
              const Icon = item.icon as any;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition ${
                    item.title === "Settings"
                      ? "bg-[#FC9700] text-white"
                      : "hover:bg-white/10"
                  }`}
                >
                  <Icon size={22} />

                  <span className="font-semibold">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-white/10 p-5">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition hover:bg-white/10"
            >
              <LogOut size={22} />
              <span className="font-semibold">
                Logout
              </span>
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Welcome Back, {customerName}
              </p>

              <h1 className="text-3xl font-black text-[#071D3A]">
                Account Settings
              </h1>
            </div>

            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-full bg-[#061B36] px-5 py-3 text-sm font-bold text-white md:flex"
            >
              <ArrowLeft size={18} />
              Dashboard
            </Link>
          </header>

          <div className="flex justify-end bg-white px-6 py-3 lg:hidden">
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#FC9700] px-5 py-2 text-sm font-bold text-white"
            >
              Logout
            </button>
          </div>

          <div className="p-6">
            {message && (
              <div className="mb-6 max-w-2xl rounded-2xl bg-white p-4 text-sm font-semibold text-[#071D3A] shadow">
                {message}
              </div>
            )}

            <section className="mb-8 max-w-2xl rounded-[32px] bg-white p-8 shadow-lg">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dff4ff]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="text-[#57B7DF]" size={38} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-[#57B7DF]">
                    Profile
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                    Account Information
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {customerEmail}
                  </p>
                </div>
              </div>

              <p className="mt-6 leading-7 text-slate-600">
                Update your customer account information and profile photo.
              </p>

              <div className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Profile Photo
                  </label>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) =>
                      setAvatarFile(e.target.files?.[0] || null)
                    }
                    className="w-full rounded-2xl border border-dashed border-[#dbe4f0] bg-[#f8fbff] p-5"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Accepted files: JPG, JPEG, PNG, WEBP.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                  />
                </div>

                <button
                  onClick={handleUpdateProfile}
                  disabled={updatingProfile}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#57B7DF] font-black text-white transition hover:bg-[#1587D4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </section>

            <section className="max-w-2xl rounded-[32px] bg-white p-8 shadow-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3E3]">
                <Lock className="text-[#FC9700]" size={30} />
              </div>

              <p className="mt-6 text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                Security
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                Change Password
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Update your account password below.
              </p>

              <div className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={updatingPassword}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FC9700] font-black text-white transition hover:bg-[#e28700] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}