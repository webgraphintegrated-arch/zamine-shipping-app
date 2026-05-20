"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type PackageItem = {
  id: string;
  tracking_number: string;
  customer_label: string | null;
  store_name: string | null;
  shipping_method: string | null;
  status: string | null;
  weight_lbs: number | null;
  warehouse_received_at: string | null;
  shipment_batch: string | null;
  shipment_batch_date: string | null;
  created_at: string;
  is_archived: boolean | null;
};

export default function ShipmentsPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [creatingBatch, setCreatingBatch] = useState(false);

  useEffect(() => {
    fetchShipmentPackages();
  }, []);

  /* =========================
     START FETCH SHIPMENTS
  ========================= */
  async function fetchShipmentPackages() {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_archived", false)
      .in("status", [
        "Delivered to US Warehouse",
        "In Transit",
        "Ready For Pickup",
      ])
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPackages((data || []) as PackageItem[]);
    setLoading(false);
  }
  /* =========================
     END FETCH SHIPMENTS
  ========================= */

  /* =========================
     START FILTER
  ========================= */
  const filteredPackages = packages.filter((item) => {
    const searchMatch = `${item.tracking_number} ${item.customer_label} ${item.store_name} ${item.status} ${item.shipment_batch}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const methodMatch =
      methodFilter === "ALL" ? true : item.shipping_method === methodFilter;

    return searchMatch && methodMatch;
  });
  /* =========================
     END FILTER
  ========================= */

  /* =========================
     START SUMMARY
  ========================= */
  const totalWeight = useMemo(() => {
    return filteredPackages.reduce(
      (sum, item) => sum + Number(item.weight_lbs || 0),
      0
    );
  }, [filteredPackages]);

  const airCount = filteredPackages.filter(
    (item) => item.shipping_method === "AIR"
  ).length;

  const seaCount = filteredPackages.filter(
    (item) => item.shipping_method === "SEA"
  ).length;

  const readyCount = filteredPackages.filter(
    (item) => item.status === "Ready For Pickup"
  ).length;

  const unbatchedAirCount = filteredPackages.filter(
    (item) => item.shipping_method === "AIR" && !item.shipment_batch
  ).length;

  const unbatchedSeaCount = filteredPackages.filter(
    (item) => item.shipping_method === "SEA" && !item.shipment_batch
  ).length;
  /* =========================
     END SUMMARY
  ========================= */

  /* =========================
     START UPDATE STATUS
  ========================= */
  async function updateShipmentStatus(packageId: string, status: string) {
    const { error } = await supabase
      .from("packages")
      .update({ status })
      .eq("id", packageId);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchShipmentPackages();
  }
  /* =========================
     END UPDATE STATUS
  ========================= */

  /* =========================
     START CREATE SHIPMENT BATCH
  ========================= */
  async function createShipmentBatch(shippingMethod: "AIR" | "SEA") {
    setCreatingBatch(true);

    const year = new Date().getFullYear();

    const shipmentPackages = filteredPackages.filter(
      (item) => item.shipping_method === shippingMethod && !item.shipment_batch
    );

    if (shipmentPackages.length === 0) {
      alert(`No ${shippingMethod} packages available for batching.`);
      setCreatingBatch(false);
      return;
    }

    const batchNumber = `${shippingMethod}-${year}-${String(Date.now()).slice(
      -3
    )}`;

    const packageIds = shipmentPackages.map((item) => item.id);

    const { error } = await supabase
      .from("packages")
      .update({
        shipment_batch: batchNumber,
        shipment_batch_date: new Date().toISOString(),
        status: "In Transit",
      })
      .in("id", packageIds);

    if (error) {
      alert(error.message);
      setCreatingBatch(false);
      return;
    }

    alert(`${batchNumber} created successfully.`);

    await fetchShipmentPackages();

    setCreatingBatch(false);
  }
  /* =========================
     END CREATE SHIPMENT BATCH
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
            Shipments
          </p>

          <h1 className="mt-2 text-4xl font-black">Shipment Queue</h1>
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
          START SUMMARY
      ========================= */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Packages In Queue</p>
          <h2 className="mt-3 text-4xl font-black">{filteredPackages.length}</h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Total Weight</p>
          <h2 className="mt-3 text-4xl font-black">
            {totalWeight.toFixed(1)} LB
          </h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">AIR / SEA</p>
          <h2 className="mt-3 text-4xl font-black">
            {airCount} / {seaCount}
          </h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Ready For Pickup</p>
          <h2 className="mt-3 text-4xl font-black">{readyCount}</h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">Unbatched AIR / SEA</p>
          <h2 className="mt-3 text-4xl font-black">
            {unbatchedAirCount} / {unbatchedSeaCount}
          </h2>
        </div>
      </div>
      {/* =========================
          END SUMMARY
      ========================= */}

      {/* =========================
          START BATCH BUTTONS
      ========================= */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          disabled={creatingBatch}
          onClick={() => createShipmentBatch("AIR")}
          className="rounded-2xl bg-[#061B36] px-6 py-4 font-black text-white disabled:opacity-50"
        >
          Create AIR Shipment Batch
        </button>

        <button
          disabled={creatingBatch}
          onClick={() => createShipmentBatch("SEA")}
          className="rounded-2xl bg-[#FC9700] px-6 py-4 font-black text-white disabled:opacity-50"
        >
          Create SEA Shipment Batch
        </button>
      </div>
      {/* =========================
          END BATCH BUTTONS
      ========================= */}

      {/* =========================
          START FILTERS
      ========================= */}
      <div className="mb-8 grid gap-4 rounded-[32px] bg-white p-6 shadow-sm md:grid-cols-[1fr_220px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tracking, customer, store, status or batch..."
          className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
        />

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
        >
          <option value="ALL">All Methods</option>
          <option value="AIR">AIR</option>
          <option value="SEA">SEA</option>
        </select>
      </div>
      {/* =========================
          END FILTERS
      ========================= */}

      {/* =========================
          START PACKAGE LIST
      ========================= */}
      {loading ? (
        <div className="rounded-[32px] bg-white p-10 text-center font-bold">
          Loading shipments...
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="rounded-[32px] bg-white p-10 text-center font-bold">
          No shipment packages found.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPackages.map((item) => (
            <div
              key={item.id}
              className="rounded-[32px] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC9700]">
                    Shipment Package
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    {item.customer_label || "Unknown Customer"}
                  </h2>

                  <p className="mt-1 text-slate-500">
                    Tracking: {item.tracking_number}
                  </p>

                  <p className="mt-1 text-slate-500">
                    Store: {item.store_name || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#061B36] px-6 py-5 text-white">
                  <p className="text-sm uppercase text-white/70">Weight</p>
                  <p className="mt-2 text-3xl font-black">
                    {Number(item.weight_lbs || 0).toFixed(1)} LB
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Shipping
                  </p>
                  <p className="mt-2 font-black">
                    {item.shipping_method || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8fbff] p-5">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Warehouse Date
                  </p>
                  <p className="mt-2 font-black">
                    {item.warehouse_received_at
                      ? new Date(item.warehouse_received_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#EAF2FF] p-5">
                  <p className="text-xs font-bold uppercase text-blue-500">
                    Shipment Batch
                  </p>
                  <p className="mt-2 font-black">
                    {item.shipment_batch || "Not Assigned"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FFF3E3] p-5">
                  <p className="text-xs font-bold uppercase text-[#FC9700]">
                    Current Status
                  </p>
                  <p className="mt-2 font-black">{item.status || "N/A"}</p>
                </div>

                <select
                  value={item.status || "Delivered to US Warehouse"}
                  onChange={(e) =>
                    updateShipmentStatus(item.id, e.target.value)
                  }
                  className="h-full min-h-[80px] rounded-2xl border border-[#dbe4f0] px-5 font-bold outline-none"
                >
                  <option value="Delivered to US Warehouse">
                    Delivered to US Warehouse
                  </option>
                  <option value="In Transit">In Transit</option>
                  <option value="Ready For Pickup">Ready For Pickup</option>
                </select>
              </div>

              {item.shipment_batch_date && (
                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Batch created:{" "}
                  {new Date(item.shipment_batch_date).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {/* =========================
          END PACKAGE LIST
      ========================= */}
    </main>
  );
}