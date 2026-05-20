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
  CreditCard,
  FileText,
  History,
  LogOut,
  Box,
  PackageCheck,
  ReceiptText,
  Truck,
  Upload,
  User,
  Wallet,
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
  total_due: number | null;
  amount_paid: number | null;
  payment_status: string | null;
  payment_method: string | null;
  receipt_number: string | null;
  is_archived: boolean | null;
  created_at: string;
};

type PaymentHistoryItem = {
  id: string;
  package_id: string;
  customer_id: string | null;
  tracking_number: string;
  amount: number;
  payment_method: string;
  receipt_number: string;
  created_at: string;
};

export default function CustomerBillingPage() {
  const router = useRouter();

  /* =========================
     START STATE
  ========================= */
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("Customer");
  const [customerId, setCustomerId] = useState("");

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  /* =========================
     END STATE
  ========================= */

  /* =========================
     START AUTH
  ========================= */
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
      await fetchPaymentHistory(user.id);

      setLoading(false);
    }

    checkUser();
  }, [router]);
  /* =========================
     END AUTH
  ========================= */

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
     START FETCH PAYMENT HISTORY
  ========================= */
  async function fetchPaymentHistory(userId: string) {
    const { data, error } = await supabase
      .from("payment_history")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      setPaymentHistory([]);
      return;
    }

    setPaymentHistory((data || []) as PaymentHistoryItem[]);
  }
  /* =========================
     END FETCH PAYMENT HISTORY
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
      ${item.payment_status}
      ${item.receipt_number}
    `
      .toLowerCase()
      .includes(search.toLowerCase());

    const paymentMatch =
      paymentFilter === "ALL" ? true : item.payment_status === paymentFilter;

    return searchMatch && paymentMatch;
  });
  /* =========================
     END FILTERS
  ========================= */

  /* =========================
     START SUMMARY
  ========================= */
  const totalDue = useMemo(() => {
    return packages.reduce((sum, item) => sum + Number(item.total_due || 0), 0);
  }, [packages]);

  const totalPaid = useMemo(() => {
    return packages.reduce((sum, item) => sum + Number(item.amount_paid || 0), 0);
  }, [packages]);

  const balanceDue = useMemo(() => {
    return packages.reduce((sum, item) => {
      const due = Number(item.total_due || 0);
      const paid = Number(item.amount_paid || 0);
      return sum + Math.max(due - paid, 0);
    }, 0);
  }, [packages]);

  const unpaidCount = useMemo(() => {
    return packages.filter((item) => item.payment_status !== "Paid").length;
  }, [packages]);
  /* =========================
     END SUMMARY
  ========================= */

  /* =========================
     START LOGOUT
  ========================= */
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }
  /* =========================
     END LOGOUT
  ========================= */

  if (loading) {
    return (
      <main
        className={`${poppins.className} flex min-h-screen items-center justify-center bg-[#f5f9ff]`}
      >
        <p className="font-bold text-[#071D3A]">Loading billing...</p>
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
  ].map((item) => {
    const Icon = item.icon as any;

    return (
      <Link
        key={item.title}
        href={item.href}
        className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition ${
          item.title === "Billing"
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
                Billing & Payments
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
                ["Total Charges", `EC$${totalDue.toFixed(2)}`, Wallet],
                ["Amount Paid", `EC$${totalPaid.toFixed(2)}`, ReceiptText],
                ["Balance Due", `EC$${balanceDue.toFixed(2)}`, CreditCard],
                ["Unpaid Packages", unpaidCount.toString(), PackageCheck],
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
                START ALERT
            ========================= */}
            {balanceDue > 0 && (
              <div className="mt-8 rounded-[28px] border border-[#FFE2AE] bg-[#FFF8ED] p-6">
                <h2 className="text-2xl font-black text-[#071D3A]">
                  Outstanding Balance
                </h2>

                <p className="mt-2 leading-7 text-slate-600">
                  You currently have an outstanding balance of{" "}
                  <strong>EC${balanceDue.toFixed(2)}</strong>. Please contact
                  Zamine Shipping Services to complete payment.
                </p>
              </div>
            )}
            {/* =========================
                END ALERT
            ========================= */}

            {/* =========================
                START FILTERS
            ========================= */}
            <div className="mt-10 grid gap-4 rounded-[32px] bg-white p-6 shadow-lg md:grid-cols-[1fr_240px]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tracking, store, payment or receipt..."
                className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
              />

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
              >
                <option value="ALL">All Payments</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            {/* =========================
                END FILTERS
            ========================= */}

            {/* =========================
                START BILLING CARDS
            ========================= */}
            <div className="mt-10 space-y-6">
              {filteredPackages.length === 0 ? (
                <div className="rounded-[32px] bg-white p-10 text-center shadow-lg">
                  <CreditCard className="mx-auto text-[#FC9700]" size={48} />

                  <h2 className="mt-5 text-3xl font-black text-[#071D3A]">
                    No Billing Items Found
                  </h2>

                  <p className="mt-3 text-slate-500">
                    Billing details will appear here once charges are added to
                    your packages.
                  </p>
                </div>
              ) : (
                filteredPackages.map((item) => {
                  const due = Number(item.total_due || 0);
                  const paid = Number(item.amount_paid || 0);
                  const balance = Math.max(due - paid, 0);

                  return (
                    <div
                      key={item.id}
                      className="rounded-[32px] bg-white p-6 shadow-lg"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC9700]">
                            Billing Item
                          </p>

                          <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                            {item.tracking_number}
                          </h2>

                          <p className="mt-2 text-slate-500">
                            {item.store_name || "Unknown Store"} ·{" "}
                            {item.shipping_method || "N/A"}
                          </p>
                        </div>

                        <div
                          className={`rounded-2xl px-6 py-4 ${
                            item.payment_status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : item.payment_status === "Partial"
                              ? "bg-[#FFF3E3] text-[#FC9700]"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <p className="text-xs font-black uppercase">
                            Payment
                          </p>

                          <h3 className="mt-2 text-xl font-black">
                            {item.payment_status || "Unpaid"}
                          </h3>
                        </div>
                      </div>

                      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl bg-[#f8fbff] p-5">
                          <p className="text-xs font-black uppercase text-slate-400">
                            Total Due
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            EC${due.toFixed(2)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#EAF9F1] p-5">
                          <p className="text-xs font-black uppercase text-green-700">
                            Amount Paid
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            EC${paid.toFixed(2)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#FFF3E3] p-5">
                          <p className="text-xs font-black uppercase text-[#FC9700]">
                            Balance
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            EC${balance.toFixed(2)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#f8fbff] p-5">
                          <p className="text-xs font-black uppercase text-slate-400">
                            Package Status
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {item.status || "Pending"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
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
                            Receipt Number
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {item.receipt_number || "N/A"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#f8fbff] p-5">
                          <p className="text-xs font-black uppercase text-slate-400">
                            Invoice
                          </p>

                          {item.invoice_url ? (
                            <a
                              href={item.invoice_url}
                              target="_blank"
                              className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#57B7DF] px-5 py-2 text-sm font-black text-white"
                            >
                              <FileText size={16} />
                              View Invoice
                            </a>
                          ) : (
                            <p className="mt-2 font-black text-[#071D3A]">
                              No Invoice
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* =========================
                END BILLING CARDS
            ========================= */}

            {/* =========================
                START PAYMENT HISTORY
            ========================= */}
            <div className="mt-12 rounded-[32px] bg-white p-8 shadow-lg">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                  Payments
                </p>

                <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                  Payment History
                </h2>
              </div>

              <div className="mt-8 space-y-4">
                {paymentHistory.length === 0 ? (
                  <div className="rounded-2xl bg-[#f8fbff] p-8 text-center text-slate-500">
                    No payment history yet.
                  </div>
                ) : (
                  paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-2xl border border-[#edf2f7] bg-[#f8fbff] p-5"
                    >
                      <div className="grid gap-4 md:grid-cols-5">
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Tracking
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {payment.tracking_number}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Amount
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            EC${Number(payment.amount || 0).toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Method
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {payment.payment_method || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Receipt
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {payment.receipt_number || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">
                            Date
                          </p>

                          <p className="mt-2 font-black text-[#071D3A]">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* =========================
                END PAYMENT HISTORY
            ========================= */}
          </div>
        </div>
      </div>
    </main>
  );
}