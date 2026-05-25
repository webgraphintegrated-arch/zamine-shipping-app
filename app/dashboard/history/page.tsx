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
  Clock3,
  FileText,
  Settings,
  History,
  LogOut,
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
  shipment_batch: string | null;
  total_due: number | null;
  amount_paid: number | null;
  payment_status: string | null;
  delivered_at: string | null;
  created_at: string;
};

export default function CustomerHistoryPage() {
  const router = useRouter();

  /* =========================
     START STATE
  ========================= */

  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] =
    useState("Customer");

  const [packages, setPackages] = useState<
    PackageItem[]
  >([]);

  const [search, setSearch] = useState("");

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admin");
        return;
      }

      if (
        profile?.role ===
        "warehouse_admin"
      ) {
        router.push("/admin/warehouse");
        return;
      }

      setCustomerName(
        profile?.full_name ||
          user.user_metadata?.full_name ||
          "Customer"
      );

      await fetchHistory(user.id);

      setLoading(false);
    }

    checkUser();
  }, [router]);

  /* =========================
     END AUTH
  ========================= */

  /* =========================
     START FETCH HISTORY
  ========================= */

  async function fetchHistory(userId: string) {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("customer_id", userId)
      .eq("is_archived", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setPackages(
      (data || []) as PackageItem[]
    );
  }

  /* =========================
     END FETCH HISTORY
  ========================= */

  /* =========================
     START FILTER
  ========================= */

  const filteredPackages =
    packages.filter((item) => {
      return `
      ${item.tracking_number}
      ${item.store_name}
      ${item.shipping_method}
      ${item.status}
      ${item.payment_status}
      ${item.shipment_batch}
    `
        .toLowerCase()
        .includes(search.toLowerCase());
    });

  /* =========================
     END FILTER
  ========================= */

  /* =========================
     START SUMMARY
  ========================= */

  const deliveredCount = useMemo(() => {
    return packages.filter(
      (item) => item.status === "Delivered"
    ).length;
  }, [packages]);

  const totalSpent = useMemo(() => {
    return packages.reduce(
      (sum, item) =>
        sum +
        Number(item.amount_paid || 0),
      0
    );
  }, [packages]);

  const airCount = useMemo(() => {
    return packages.filter(
      (item) =>
        item.shipping_method === "AIR"
    ).length;
  }, [packages]);

  const seaCount = useMemo(() => {
    return packages.filter(
      (item) =>
        item.shipping_method === "SEA"
    ).length;
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
        <p className="font-bold text-[#071D3A]">
          Loading history...
        </p>
      </main>
    );
  }

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#f5f9ff]`}
    >
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
                icon: PackageCheck,
                href: "/dashboard",
              },
              {
                title: "Track Package",
                icon: Truck,
                href:
                  "/dashboard/track-package",
              },
              {
                title: "Upload Invoice",
                icon: Upload,
                href:
                  "/dashboard/upload",
              },
              {
                title: "Billing",
                icon: Bell,
                href:
                  "/dashboard/billing",
              },
              {
                title: "History",
                icon: History,
                href:
                  "/dashboard/history",
              },
              {
                title: "Notifications",
                icon: Bell,
                href:
                  "/dashboard/notifications",
              },
              {
                title: "Notifications",
                icon: Bell,
                href: "/dashboard/notifications",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition ${
                    item.title ===
                    "History"
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
                Welcome Back,{" "}
                {customerName}
              </p>

              <h1 className="text-3xl font-black text-[#071D3A]">
                Shipment History
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
                [
                  "Delivered Packages",
                  deliveredCount.toString(),
                  CheckCircle2,
                ],
                [
                  "Total Spent",
                  `EC$${totalSpent.toFixed(
                    2
                  )}`,
                  Clock3,
                ],
                [
                  "AIR Shipments",
                  airCount.toString(),
                  Truck,
                ],
                [
                  "SEA Shipments",
                  seaCount.toString(),
                  PackageCheck,
                ],
              ].map(
                ([title, value, Icon]) => (
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
                        <Icon
                          className="text-[#FC9700]"
                          size={30}
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* =========================
                END SUMMARY
            ========================= */}

            {/* =========================
                START SEARCH
            ========================= */}

            <div className="mt-10 rounded-[32px] bg-white p-6 shadow-lg">
              <div className="flex h-14 items-center gap-3 rounded-2xl border border-[#dbe4f0] px-5">
                <Search
                  size={20}
                  className="text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search tracking, store, shipment batch..."
                  className="w-full outline-none"
                />
              </div>
            </div>

            {/* =========================
                END SEARCH
            ========================= */}

            {/* =========================
                START HISTORY LIST
            ========================= */}

            <div className="mt-10 space-y-6">
              {filteredPackages.length ===
              0 ? (
                <div className="rounded-[32px] bg-white p-10 text-center shadow-lg">
                  <History
                    className="mx-auto text-[#FC9700]"
                    size={48}
                  />

                  <h2 className="mt-5 text-3xl font-black text-[#071D3A]">
                    No History Found
                  </h2>

                  <p className="mt-3 text-slate-500">
                    Delivered and archived
                    packages will appear
                    here.
                  </p>
                </div>
              ) : (
                filteredPackages.map(
                  (item) => {
                    const paid =
                      Number(
                        item.amount_paid ||
                          0
                      );

                    const due =
                      Number(
                        item.total_due ||
                          0
                      );

                    return (
                      <div
                        key={item.id}
                        className="rounded-[32px] bg-white p-6 shadow-lg"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-5">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC9700]">
                              Archived Package
                            </p>

                            <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                              {
                                item.tracking_number
                              }
                            </h2>

                            <p className="mt-2 text-slate-500">
                              {item.store_name ||
                                "Unknown Store"}{" "}
                              ·{" "}
                              {item.shipping_method ||
                                "N/A"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-green-100 px-6 py-4 text-green-700">
                            <p className="text-xs font-black uppercase">
                              Status
                            </p>

                            <h3 className="mt-2 text-xl font-black">
                              {
                                item.status
                              }
                            </h3>
                          </div>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl bg-[#f8fbff] p-5">
                            <p className="text-xs font-black uppercase text-slate-400">
                              Shipment Batch
                            </p>

                            <p className="mt-2 font-black text-[#071D3A]">
                              {item.shipment_batch ||
                                "N/A"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#EAF9F1] p-5">
                            <p className="text-xs font-black uppercase text-green-700">
                              Amount Paid
                            </p>

                            <p className="mt-2 font-black text-[#071D3A]">
                              EC$
                              {paid.toFixed(
                                2
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#f8fbff] p-5">
                            <p className="text-xs font-black uppercase text-slate-400">
                              Total Charge
                            </p>

                            <p className="mt-2 font-black text-[#071D3A]">
                              EC$
                              {due.toFixed(
                                2
                              )}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#f8fbff] p-5">
                            <p className="text-xs font-black uppercase text-slate-400">
                              Delivered
                            </p>

                            <p className="mt-2 font-black text-[#071D3A]">
                              {item.delivered_at
                                ? new Date(
                                    item.delivered_at
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                          {item.invoice_url ? (
                            <a
                              href={
                                item.invoice_url
                              }
                              target="_blank"
                              className="inline-flex items-center gap-2 rounded-full bg-[#57B7DF] px-5 py-3 text-sm font-black text-white"
                            >
                              <FileText
                                size={18}
                              />
                              View Invoice
                            </a>
                          ) : (
                            <div className="rounded-full bg-[#f8fbff] px-5 py-3 text-sm font-black text-slate-500">
                              No Invoice
                            </div>
                          )}

                          <div className="rounded-full bg-[#EAF9F1] px-5 py-3 text-sm font-black text-green-700">
                            Fully Completed
                          </div>
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>

            {/* =========================
                END HISTORY LIST
            ========================= */}
          </div>
        </div>
      </div>
    </main>
  );
}