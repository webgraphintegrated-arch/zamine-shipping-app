"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type ArchivedPackage = {
  id: string;
  tracking_number: string;
  customer_label: string | null;
  store_name: string | null;
  shipping_method: string | null;
  status: string | null;
  payment_status: string | null;
  total_due: number | null;
  created_at: string;

  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export default function ArchivedPackagesPage() {
  const [packages, setPackages] = useState<ArchivedPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedPackages();
  }, []);

  /* =========================
     START FETCH ARCHIVED
  ========================= */
  async function fetchArchivedPackages() {
    const { data, error } = await supabase
      .from("packages")
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .eq("is_archived", true)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPackages((data || []) as ArchivedPackage[]);
    setLoading(false);
  }
  /* =========================
     END FETCH ARCHIVED
  ========================= */

  /* =========================
     START RESTORE PACKAGE
  ========================= */
  async function restorePackage(packageId: string) {
    const confirmRestore = confirm(
      "Restore this package back to active queue?"
    );

    if (!confirmRestore) return;

    const { error } = await supabase
      .from("packages")
      .update({
        is_archived: false,
      })
      .eq("id", packageId);

    if (error) {
      alert(error.message);
      return;
    }

    fetchArchivedPackages();
  }
  /* =========================
     END RESTORE PACKAGE
  ========================= */

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#f5f9ff] p-6 text-[#071D3A]`}
    >
      {/* =========================
          START PAGE HEADER
      ========================= */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Archive
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Archived Packages
          </h1>
        </div>

        <Link
          href="/admin"
          className="rounded-2xl bg-[#061B36] px-6 py-3 font-black text-white"
        >
          Back To Admin
        </Link>
      </div>
      {/* =========================
          END PAGE HEADER
      ========================= */}

      {loading ? (
        <div className="rounded-3xl bg-white p-10 text-center font-bold">
          Loading archived packages...
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center font-bold">
          No archived packages found.
        </div>
      ) : (
        <div className="space-y-6">
          {packages.map((item) => (
            <div
              key={item.id}
              className="rounded-[32px] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC9700]">
                    Archived Package
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    {item.profiles?.full_name ||
                      item.customer_label ||
                      "Unknown Customer"}
                  </h2>

                  <p className="mt-1 text-slate-500">
                    {item.profiles?.email || "No email"}
                  </p>
                </div>

                <button
                  onClick={() => restorePackage(item.id)}
                  className="rounded-2xl bg-[#061B36] px-5 py-3 text-sm font-black text-white"
                >
                  Restore Package
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Tracking
                  </p>

                  <p className="mt-2 font-black">
                    {item.tracking_number}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Store
                  </p>

                  <p className="mt-2 font-black">
                    {item.store_name || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Shipping
                  </p>

                  <p className="mt-2 font-black">
                    {item.shipping_method || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Status
                  </p>

                  <p className="mt-2 font-black">
                    {item.status || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Paid
                  </p>

                  <p className="mt-2 font-black">
                    {item.payment_status || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#061B36] p-5 text-white">
                <p className="text-sm uppercase text-white/70">
                  Total Paid
                </p>

                <p className="mt-2 text-3xl font-black">
                  EC${Number(item.total_due || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}