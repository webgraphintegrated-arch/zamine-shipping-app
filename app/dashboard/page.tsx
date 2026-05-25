"use client";

import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import {
  Bell,
  Box,
  Clock3,
  CreditCard,
  FileText,
  History,
  LogOut,
  PackageCheck,
  Settings,
  Truck,
  Upload,
  User,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type PackageItem = {
  id: string;
  tracking_number: string;
  store_name: string | null;
  shipping_method: string | null;
  status: string | null;
  invoice_url: string | null;
  estimated_arrival: string | null;
  created_at: string;
  customer_id: string;
  shipment_batch: string | null;
  total_due: number | null;
  amount_paid: number | null;
  payment_status: string | null;
  is_archived: boolean | null;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [customerName, setCustomerName] = useState("Customer");
  const [customerId, setCustomerId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [storeName, setStoreName] = useState("");
  const [shippingMethod, setShippingMethod] = useState("AIR");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setCustomerId(user.id);

      const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, avatar_url, role")
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

      setCustomerName(
        profile?.full_name || user.user_metadata?.full_name || "Customer"
      );
      setAvatarUrl(profile?.avatar_url || "");
      await fetchPackages(user.id);
      await fetchNotifications(user.id);

      setLoadingUser(false);
    }

    checkUser();
  }, [router]);

  /* =========================
     START FETCH PACKAGES
  ========================= */
  async function fetchPackages(userId: string) {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("customer_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPackages((data || []) as PackageItem[]);
  }
  /* =========================
     END FETCH PACKAGES
  ========================= */

  /* =========================
     START FETCH NOTIFICATIONS
  ========================= */
  async function fetchNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications((data || []) as NotificationItem[]);
  }
  /* =========================
     END FETCH NOTIFICATIONS
  ========================= */

  /* =========================
     START MARK NOTIFICATION READ
  ========================= */
  async function markNotificationRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchNotifications(customerId);
  }
  /* =========================
     END MARK NOTIFICATION READ
  ========================= */

  /* =========================
     START SUBMIT PACKAGE
  ========================= */
  async function handleSubmitPackage() {
    setMessage("");

    if (!trackingNumber || !storeName || !shippingMethod || !invoiceFile) {
      setMessage("Please complete all fields and upload your invoice.");
      return;
    }

    setSubmitLoading(true);

    const fileExt = invoiceFile.name.split(".").pop();
    const fileName = `${customerId}-${Date.now()}.${fileExt}`;
    const filePath = `invoices/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(filePath, invoiceFile);

    if (uploadError) {
      setSubmitLoading(false);
      setMessage(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("invoices")
      .getPublicUrl(filePath);

    const invoiceUrl = publicUrlData.publicUrl;

    const { error: insertError } = await supabase.from("packages").insert([
      {
        customer_id: customerId,
        tracking_number: trackingNumber,
        store_name: storeName,
        shipping_method: shippingMethod,
        invoice_url: invoiceUrl,
        status: "Invoice Received",
        payment_status: "Unpaid",
        amount_paid: 0,
        is_archived: false,
      },
    ]);

    if (insertError) {
      setSubmitLoading(false);
      setMessage(insertError.message);
      return;
    }

    setTrackingNumber("");
    setStoreName("");
    setShippingMethod("AIR");
    setInvoiceFile(null);
    setMessage("Package submitted successfully.");

    await fetchPackages(customerId);

    setSubmitLoading(false);
  }
  /* =========================
     END SUBMIT PACKAGE
  ========================= */

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const outstandingBalance = useMemo(() => {
    return packages.reduce((sum, item) => {
      const total = Number(item.total_due || 0);
      const paid = Number(item.amount_paid || 0);
      return sum + Math.max(total - paid, 0);
    }, 0);
  }, [packages]);

  const paidTotal = useMemo(() => {
    return packages.reduce((sum, item) => sum + Number(item.amount_paid || 0), 0);
  }, [packages]);

  if (loadingUser) {
    return (
      <main
        className={`${poppins.className} flex min-h-screen items-center justify-center bg-[#f5f9ff]`}
      >
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#57B7DF] border-t-[#FC9700]" />
          <p className="font-bold text-[#071D3A]">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`${poppins.className} min-h-screen bg-[#f5f9ff]`}>
      <div className="flex min-h-screen">
        {/* =========================
            START SIDEBAR
        ========================= */}
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
    const Icon = item.icon;

    return (
      <Link
        key={item.title}
        href={item.href}
        className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition ${
          item.title === "Dashboard"
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
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </aside>
        {/* =========================
            END SIDEBAR
        ========================= */}

        <div className="flex-1">
          {/* =========================
              START TOPBAR
          ========================= */}
          <header className="flex items-center justify-between border-b bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Welcome Back, {customerName}
              </p>

              <h1 className="text-3xl font-black text-[#071D3A]">
                Customer Dashboard
              </h1>
            </div>

             <div className="flex items-center gap-4">
              <Link
                href="/dashboard/notifications"
                className="relative rounded-full bg-[#f5f9ff] p-3 transition hover:bg-[#FC9700] hover:text-white"
              >
                <Bell className="text-[#071D3A]" size={22} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FC9700] text-xs font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

                        <Link
            href="/dashboard/settings"
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#57B7DF] text-white transition hover:scale-105"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={22} />
            )}
          </Link>
            </div>
          </header>
          {/* =========================
              END TOPBAR
          ========================= */}

          <div className="flex justify-end bg-white px-6 py-3 lg:hidden">
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#FC9700] px-5 py-2 text-sm font-bold text-white"
            >
              Logout
            </button>
          </div>

          <div className="p-6">
            {/* =========================
                START SHIPPING ADDRESS
            ========================= */}
            <div className="mb-8 rounded-[32px] bg-[#061B36] p-7 text-white shadow-lg">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                Your Zamine Shipping Address
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-white/60">Air Freight Format</p>
                  <h2 className="mt-2 font-mono text-lg font-bold leading-8">
                    ZSS {customerName} AIR
                    <br />
                    7818 NW 71ST ST
                    <br />
                    MIAMI, FL 33195-6375
                    <br />
                    United States
                  </h2>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-white/60">Sea Freight Format</p>
                  <h2 className="mt-2 font-mono text-lg font-bold leading-8">
                    ZSS {customerName} SEA
                    <br />
                    7818 NW 71ST ST
                    <br />
                    MIAMI, FL 33195-6375
                    <br />
                    United States
                  </h2>
                </div>
              </div>
            </div>
            {/* =========================
                END SHIPPING ADDRESS
            ========================= */}

            {/* =========================
                START STATS
            ========================= */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Active Packages", packages.length.toString(), Truck],
                [
                  "Ready For Pickup",
                  packages
                    .filter((item) => item.status === "Ready For Pickup")
                    .length.toString(),
                  PackageCheck,
                ],
                [`Balance Due`, `EC$${outstandingBalance.toFixed(2)}`, Clock3],
                [`Amount Paid`, `EC$${paidTotal.toFixed(2)}`, Upload],
              ].map(([title, value, Icon]) => (
                <div
                  key={title as string}
                  className="rounded-[28px] bg-white p-7 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        {title as string}
                      </p>

                      <h2 className="mt-3 text-4xl font-black text-[#071D3A]">
                        {value as string}
                      </h2>
                    </div>

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3E3]">
                      <Icon className="text-[#FC9700]" size={30} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* =========================
                END STATS
            ========================= */}

            <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              {/* =========================
                  START SUBMIT PACKAGE
              ========================= */}
              <div className="rounded-[32px] bg-white p-8 shadow-lg">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                  Submit Package
                </p>

                <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                  Upload Invoice
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Submit your tracking number and invoice so Zamine can process
                  your package.
                </p>

                <div className="mt-7 space-y-5">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Tracking Number"
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                  />

                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Store Name"
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                  />

                  <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                  >
                    <option value="AIR">AIR</option>
                    <option value="SEA">SEA</option>
                  </select>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-dashed border-[#dbe4f0] bg-[#f8fbff] p-5"
                  />

                  {message && (
                    <div className="rounded-2xl bg-[#f5f9ff] p-4 text-sm font-semibold text-[#071D3A]">
                      {message}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitPackage}
                    disabled={submitLoading}
                    className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#FC9700] font-black text-white transition hover:bg-[#e28700] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitLoading ? "Submitting..." : "Submit Package"}
                  </button>
                </div>
              </div>
              {/* =========================
                  END SUBMIT PACKAGE
              ========================= */}

              {/* =========================
                  START PACKAGE CARDS
              ========================= */}
              <div className="rounded-[32px] bg-white p-8 shadow-lg">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                      Recent Activity
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                      Your Active Packages
                    </h2>
                  </div>

                  <Link
                    href="/dashboard/track-package"
                    className="rounded-full bg-[#FC9700] px-6 py-3 text-center font-bold text-white"
                  >
                    Track Package
                  </Link>
                </div>

                <div className="mt-8 space-y-4">
                  {packages.length === 0 ? (
                    <div className="rounded-2xl bg-[#f8fbff] px-6 py-8 text-center text-slate-500">
                      No active packages.
                    </div>
                  ) : (
                    packages.map((item) => {
                      const totalDue = Number(item.total_due || 0);
                      const amountPaid = Number(item.amount_paid || 0);
                      const balance = Math.max(totalDue - amountPaid, 0);

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-[#edf2f7] bg-[#f8fbff] p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FC9700]">
                                Package
                              </p>

                              <h3 className="mt-2 text-xl font-black text-[#071D3A]">
                                {item.tracking_number}
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {item.store_name || "N/A"} ·{" "}
                                {item.shipping_method || "N/A"}
                              </p>
                            </div>

                            <span className="rounded-full bg-[#FFF3E3] px-4 py-2 text-sm font-bold text-[#FC9700]">
                              {item.status || "Pending"}
                            </span>
                          </div>

                          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <p className="text-xs font-bold uppercase text-slate-400">
                                Shipment Batch
                              </p>
                              <p className="mt-1 font-black text-[#071D3A]">
                                {item.shipment_batch || "Not Assigned"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase text-slate-400">
                                Payment
                              </p>
                              <p className="mt-1 font-black text-[#071D3A]">
                                {item.payment_status || "Unpaid"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase text-slate-400">
                                Paid
                              </p>
                              <p className="mt-1 font-black text-[#071D3A]">
                                EC${amountPaid.toFixed(2)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase text-slate-400">
                                Balance
                              </p>
                              <p className="mt-1 font-black text-[#071D3A]">
                                EC${balance.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            {item.invoice_url ? (
                              <a
                                href={item.invoice_url}
                                target="_blank"
                                className="rounded-full bg-[#57B7DF] px-5 py-2 text-sm font-black text-white"
                              >
                                View Invoice
                              </a>
                            ) : (
                              <span className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-500">
                                No Invoice
                              </span>
                            )}

                            {item.estimated_arrival && (
                              <span className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-500">
                                ETA:{" "}
                                {new Date(
                                  item.estimated_arrival
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              {/* =========================
                  END PACKAGE CARDS
              ========================= */}
            </div>

            {/* =========================
                START NOTIFICATIONS
            ========================= */}
            <div className="mt-10 rounded-[32px] bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                    Notifications
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                    Recent Updates
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3E3]">
                  <Bell className="text-[#FC9700]" size={26} />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {notifications.length === 0 ? (
                  <div className="rounded-2xl bg-[#f8fbff] px-6 py-8 text-center text-slate-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border border-[#edf2f7] p-5 ${
                        item.is_read ? "bg-[#f8fbff]" : "bg-[#FFF8ED]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#FC9700]">
                            {item.notification_type || "general"}
                          </p>

                          <h3 className="mt-2 text-lg font-black text-[#071D3A]">
                            {item.title}
                          </h3>

                          <p className="mt-2 leading-7 text-slate-600">
                            {item.message}
                          </p>

                          <p className="mt-2 text-xs font-semibold text-slate-400">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>

                        {!item.is_read && (
                          <button
                            onClick={() => markNotificationRead(item.id)}
                            className="rounded-full bg-[#061B36] px-4 py-2 text-xs font-black text-white"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* =========================
                END NOTIFICATIONS
            ========================= */}
          </div>
        </div>
      </div>
    </main>
  );
}