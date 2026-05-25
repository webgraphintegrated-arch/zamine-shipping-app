"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";

import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Settings,
  Clock3,
  FileText,
  LogOut,
  CreditCard,
History,
Box,
  PackageCheck,
  Search,
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
  shipment_batch: string | null;
  shipment_batch_date: string | null;
  total_due: number | null;
  amount_paid: number | null;
  payment_status: string | null;
  payment_method: string | null;
  receipt_number: string | null;
  is_archived: boolean | null;
  created_at: string;
};

export default function CustomerTrackPackagePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("Customer");
  const [customerId, setCustomerId] = useState("");

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
        .select("full_name, role")
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

      await fetchPackages(user.id);

      setLoading(false);
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
     START FILTERS
  ========================= */
  const filteredPackages = packages.filter((item) => {
    const searchMatch = `
      ${item.tracking_number}
      ${item.store_name}
      ${item.shipping_method}
      ${item.status}
      ${item.shipment_batch}
      ${item.payment_status}
    `
      .toLowerCase()
      .includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "ALL" ? true : item.status === statusFilter;

    return searchMatch && statusMatch;
  });
  /* =========================
     END FILTERS
  ========================= */

  const readyCount = useMemo(
    () => packages.filter((item) => item.status === "Ready For Pickup").length,
    [packages]
  );

  const inTransitCount = useMemo(
    () => packages.filter((item) => item.status === "In Transit").length,
    [packages]
  );

  const totalBalance = useMemo(() => {
    return packages.reduce((sum, item) => {
      const total = Number(item.total_due || 0);
      const paid = Number(item.amount_paid || 0);
      return sum + Math.max(total - paid, 0);
    }, 0);
  }, [packages]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function getStepNumber(status: string | null) {
    const steps = [
      "Invoice Received",
      "Delivered to US Warehouse",
      "In Transit",
      "Ready For Pickup",
      "Delivered",
    ];

    const index = steps.findIndex((step) => step === status);
    return index >= 0 ? index + 1 : 1;
  }

  if (loading) {
    return (
      <main
        className={`${poppins.className} flex min-h-screen items-center justify-center bg-[#f5f9ff]`}
      >
        <p className="font-bold text-[#071D3A]">Loading tracking...</p>
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
          item.title === "Track Package"
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
              START HEADER
          ========================= */}
          <header className="flex items-center justify-between border-b bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Welcome Back, {customerName}
              </p>

              <h1 className="text-3xl font-black text-[#071D3A]">
                Track Your Packages
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-full bg-[#061B36] px-5 py-3 text-sm font-bold text-white md:flex"
              >
                <ArrowLeft size={18} />
                Dashboard
              </Link>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#57B7DF] text-white">
                <User size={22} />
              </div>
            </div>
          </header>
          {/* =========================
              END HEADER
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
                START SUMMARY
            ========================= */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Active Packages", packages.length.toString(), PackageCheck],
                ["In Transit", inTransitCount.toString(), Truck],
                ["Ready For Pickup", readyCount.toString(), CheckCircle2],
                [`Balance Due`, `EC$${totalBalance.toFixed(2)}`, Clock3],
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
                END SUMMARY
            ========================= */}

            {/* =========================
                START FILTERS
            ========================= */}
            <div className="mt-10 grid gap-4 rounded-[32px] bg-white p-6 shadow-lg md:grid-cols-[1fr_260px]">
              <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                <Search size={20} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tracking, store, batch or status..."
                  className="w-full outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Invoice Received">Invoice Received</option>
                <option value="Delivered to US Warehouse">
                  Delivered to US Warehouse
                </option>
                <option value="In Transit">In Transit</option>
                <option value="Ready For Pickup">Ready For Pickup</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
            {/* =========================
                END FILTERS
            ========================= */}

            {/* =========================
                START PACKAGE LIST
            ========================= */}
            <div className="mt-10 space-y-6">
              {filteredPackages.length === 0 ? (
                <div className="rounded-[32px] bg-white p-10 text-center shadow-lg">
                  <PackageCheck className="mx-auto text-[#FC9700]" size={48} />

                  <h2 className="mt-5 text-3xl font-black text-[#071D3A]">
                    No Packages Found
                  </h2>

                  <p className="mt-3 text-slate-500">
                    Upload an invoice or adjust your search filters.
                  </p>

                  <Link
                    href="/dashboard/upload"
                    className="mt-6 inline-flex rounded-full bg-[#FC9700] px-6 py-3 font-black text-white"
                  >
                    Upload Invoice
                  </Link>
                </div>
              ) : (
                filteredPackages.map((item) => {
                  const totalDue = Number(item.total_due || 0);
                  const amountPaid = Number(item.amount_paid || 0);
                  const balance = Math.max(totalDue - amountPaid, 0);
                  const currentStep = getStepNumber(item.status);

                  return (
                    <div
                      key={item.id}
                      className="rounded-[32px] bg-white p-6 shadow-lg"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC9700]">
                            Package Tracking
                          </p>

                          <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                            {item.tracking_number}
                          </h2>

                          <p className="mt-2 text-slate-500">
                            {item.store_name || "Unknown Store"} ·{" "}
                            {item.shipping_method || "N/A"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#FFF3E3] px-6 py-4">
                          <p className="text-xs font-black uppercase text-[#FC9700]">
                            Status
                          </p>

                          <h3 className="mt-2 text-xl font-black text-[#071D3A]">
                            {item.status || "Pending"}
                          </h3>
                        </div>
                      </div>

                      {/* =========================
                          START TIMELINE
                      ========================= */}
                      <div className="mt-8 grid gap-4 md:grid-cols-5">
                        {[
                          "Invoice Received",
                          "US Warehouse",
                          "In Transit",
                          "Ready Pickup",
                          "Delivered",
                        ].map((step, index) => {
                          const active = index + 1 <= currentStep;

                          return (
                            <div
                              key={step}
                              className={`rounded-2xl p-4 ${
                                active
                                  ? "bg-[#FFF3E3] text-[#071D3A]"
                                  : "bg-[#f8fbff] text-slate-400"
                              }`}
                            >
                              <div
                                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                                  active
                                    ? "bg-[#FC9700] text-white"
                                    : "bg-white text-slate-400"
                                }`}
                              >
                                {index + 1}
                              </div>

                              <p className="text-sm font-black">{step}</p>
                            </div>
                          );
                        })}
                      </div>
                      {/* =========================
                          END TIMELINE
                      ========================= */}

                      {/* =========================
                          START DETAILS
                      ========================= */}
                      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl bg-[#f8fbff] p-5">
                          <p className="text-xs font-black uppercase text-slate-400">
                            Shipment Batch
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {item.shipment_batch || "Not Assigned"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#f8fbff] p-5">
                          <p className="text-xs font-black uppercase text-slate-400">
                            Estimated Arrival
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {item.estimated_arrival
                              ? new Date(
                                  item.estimated_arrival
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#EAF9F1] p-5">
                          <p className="text-xs font-black uppercase text-green-700">
                            Amount Paid
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            EC${amountPaid.toFixed(2)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#FFF3E3] p-5">
                          <p className="text-xs font-black uppercase text-[#FC9700]">
                            Balance Due
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            EC${balance.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {/* =========================
                          END DETAILS
                      ========================= */}

                      {/* =========================
                          START PAYMENT DETAILS
                      ========================= */}
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-[#f8fbff] p-5">
                          <p className="text-xs font-black uppercase text-slate-400">
                            Payment Status
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {item.payment_status || "Unpaid"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#f8fbff] p-5">
                          <p className="text-xs font-black uppercase text-slate-400">
                            Payment Method
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {item.payment_method || "N/A"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#f8fbff] p-5">
                          <p className="text-xs font-black uppercase text-slate-400">
                            Receipt
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {item.receipt_number || "N/A"}
                          </p>
                        </div>
                      </div>
                      {/* =========================
                          END PAYMENT DETAILS
                      ========================= */}

                      {/* =========================
                          START ACTIONS
                      ========================= */}
                      <div className="mt-6 flex flex-wrap gap-3">
                        {item.invoice_url ? (
                          <a
                            href={item.invoice_url}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-full bg-[#57B7DF] px-5 py-3 text-sm font-black text-white"
                          >
                            <FileText size={18} />
                            View Invoice
                          </a>
                        ) : (
                          <Link
                            href="/dashboard/upload"
                            className="inline-flex items-center gap-2 rounded-full bg-[#FC9700] px-5 py-3 text-sm font-black text-white"
                          >
                            <Upload size={18} />
                            Upload Invoice
                          </Link>
                        )}

                        {item.status === "Ready For Pickup" && (
                          <div className="rounded-full bg-green-100 px-5 py-3 text-sm font-black text-green-700">
                            Ready for pickup at Zamine
                          </div>
                        )}

                        {balance > 0 && (
                          <div className="rounded-full bg-red-100 px-5 py-3 text-sm font-black text-red-700">
                            Payment required: EC${balance.toFixed(2)}
                          </div>
                        )}
                      </div>
                      {/* =========================
                          END ACTIONS
                      ========================= */}
                    </div>
                  );
                })
              )}
            </div>
            {/* =========================
                END PACKAGE LIST
            ========================= */}
          </div>
        </div>
      </div>
    </main>
  );
}