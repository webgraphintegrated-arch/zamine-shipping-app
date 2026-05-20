"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type CustomerItem = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at?: string;

  packages?: {
    id: string;
    total_due: number | null;
    payment_status: string | null;
    status: string | null;
  }[];
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* =========================
     START FETCH CUSTOMERS
  ========================= */
  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        packages (
          id,
          total_due,
          payment_status,
          status
        )
      `)
      .order("full_name", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setCustomers((data || []) as CustomerItem[]);
    setLoading(false);
  }
  /* =========================
     END FETCH CUSTOMERS
  ========================= */

  /* =========================
     START FILTERED CUSTOMERS
  ========================= */
  const filteredCustomers = customers.filter((customer) =>
    `${customer.full_name} ${customer.email} ${customer.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  /* =========================
     END FILTERED CUSTOMERS
  ========================= */

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#f5f9ff] p-6 text-[#071D3A]`}
    >
      {/* =========================
          START HEADER
      ========================= */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            CRM
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Customers
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
          END HEADER
      ========================= */}

      {/* =========================
          START SEARCH
      ========================= */}
      <div className="mb-8 rounded-[32px] bg-white p-6 shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer name, email or phone..."
          className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none"
        />
      </div>
      {/* =========================
          END SEARCH
      ========================= */}

      {/* =========================
          START CUSTOMER LIST
      ========================= */}
      {loading ? (
        <div className="rounded-[32px] bg-white p-10 text-center font-bold">
          Loading customers...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="rounded-[32px] bg-white p-10 text-center font-bold">
          No customers found.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCustomers.map((customer) => {
            const packageCount = customer.packages?.length || 0;

            const unpaidTotal =
              customer.packages
                ?.filter(
                  (pkg) =>
                    pkg.payment_status !== "Paid"
                )
                .reduce(
                  (sum, pkg) =>
                    sum + Number(pkg.total_due || 0),
                  0
                ) || 0;

            const paidTotal =
              customer.packages
                ?.filter(
                  (pkg) =>
                    pkg.payment_status === "Paid"
                )
                .reduce(
                  (sum, pkg) =>
                    sum + Number(pkg.total_due || 0),
                  0
                ) || 0;

            return (
              <div
                key={customer.id}
                className="rounded-[32px] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC9700]">
                      Customer
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      {customer.full_name || "Unknown Customer"}
                    </h2>

                    <p className="mt-1 text-slate-500">
                      {customer.email || "No email"}
                    </p>

                    <p className="mt-1 text-slate-500">
                      {customer.phone || "No phone"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#061B36] px-5 py-4 text-white">
                    <p className="text-xs uppercase text-white/70">
                      Packages
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      {packageCount}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl bg-[#FFF3E3] p-5">
                    <p className="text-xs font-bold uppercase text-[#FC9700]">
                      Outstanding Balance
                    </p>

                    <p className="mt-2 text-3xl font-black text-[#071D3A]">
                      EC${unpaidTotal.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#EAF9F1] p-5">
                    <p className="text-xs font-bold uppercase text-green-700">
                      Paid Total
                    </p>

                    <p className="mt-2 text-3xl font-black text-[#071D3A]">
                      EC${paidTotal.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f5f9ff] p-5">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Customer ID
                    </p>

                    <p className="mt-2 break-all text-sm font-black">
                      {customer.id}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* =========================
          END CUSTOMER LIST
      ========================= */}
    </main>
  );
}