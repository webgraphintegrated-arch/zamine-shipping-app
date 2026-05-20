"use client";

import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type ProfileItem = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type PreviewItem = {
  customerName: string;
  customerLabel: string;
  trackingNumber: string;
  weight: string;
  store: string;
  shippingMethod: string;
  matchedCustomerId: string | null;
  matchedEmail: string | null;
  status: "Ready" | "No Customer Match" | "Duplicate" | "Missing Info";
};

type HistoryItem = {
  id: string;
  tracking_number: string;
  customer_label: string | null;
  store_name: string | null;
  carrier: string | null;
  shipping_method: string | null;
  weight_lbs: number | null;
  warehouse_received_at: string | null;
  created_at: string;
};

export default function WarehousePage() {
  const router = useRouter();

  /* =========================
     START STATE
  ========================= */
  const [historySearch, setHistorySearch] = useState("");
  const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState(""); 

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
 

  const [customerName, setCustomerName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [weight, setWeight] = useState("");
  const [storeName, setStoreName] = useState("");
  const [shippingMethod, setShippingMethod] = useState("AIR");

  const [bulkText, setBulkText] = useState("");
  const [previewRows, setPreviewRows] = useState<PreviewItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  /* =========================
     END STATE
  ========================= */

  /* =========================
     START AUTH CHECK
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

      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin" && profile?.role !== "warehouse_admin") {
        router.push("/dashboard");
        return;
      }

      await fetchProfiles();
      await fetchHistory(user.id);

      setLoading(false);
    }

    checkUser();
  }, [router]);
  /* =========================
     END AUTH CHECK
  ========================= */

  /* =========================
     START FETCH PROFILES
  ========================= */
  async function fetchProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email");

    if (error) {
      alert(error.message);
      return;
    }

    setProfiles((data || []) as ProfileItem[]);
  }
  /* =========================
     END FETCH PROFILES
  ========================= */

  /* =========================
     START FETCH HISTORY
  ========================= */
  async function fetchHistory(userId: string) {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("warehouse_added_by", userId)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setHistory((data || []) as HistoryItem[]);
  }
  /* =========================
     END FETCH HISTORY
  ========================= */

  /* =========================
     START HELPERS
  ========================= */
  function normalize(value: string) {
    return value
      .toLowerCase()
      .replace("zss", "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanWeight(value: string) {
    return value.toString().replace(/lb|lbs/gi, "").trim();
  }

  function makeCustomerLabel(name: string) {
    const cleanName = name.replace(/^zss\s+/i, "").trim();
    return `ZSS ${cleanName.toUpperCase()}`;
  }

  function findCustomer(name: string) {
    const cleanName = normalize(name);

    return (
      profiles.find((profile) => normalize(profile.full_name || "") === cleanName) ||
      null
    );
  }

  async function checkDuplicateTracking(tracking: string) {
    const { data } = await supabase
      .from("packages")
      .select("id")
      .eq("tracking_number", tracking)
      .maybeSingle();

    return !!data;
  }

  async function buildPreviewRows(rows: Omit<PreviewItem, "matchedCustomerId" | "matchedEmail" | "status">[]) {
    const completedRows: PreviewItem[] = [];

    for (const row of rows) {
      const missingInfo = !row.customerName || !row.trackingNumber;
      const duplicate = row.trackingNumber
        ? await checkDuplicateTracking(row.trackingNumber)
        : false;
      const customer = findCustomer(row.customerName);

      completedRows.push({
        ...row,
        matchedCustomerId: customer?.id || null,
        matchedEmail: customer?.email || null,
        status: missingInfo
          ? "Missing Info"
          : duplicate
          ? "Duplicate"
          : customer
          ? "Ready"
          : "No Customer Match",
      });
    }

    setPreviewRows(completedRows);
  }
  /* =========================
     END HELPERS
  ========================= */

  /* =========================
     START SINGLE PACKAGE SAVE
  ========================= */
  async function handleSingleSave() {
    if (!customerName || !trackingNumber) {
      alert("Customer name and tracking number are required.");
      return;
    }

    const row = {
      customerName,
      customerLabel: makeCustomerLabel(customerName),
      trackingNumber,
      weight: cleanWeight(weight),
      store: storeName,
      shippingMethod,
    };

    await buildPreviewRows([row]);
  }
  /* =========================
     END SINGLE PACKAGE SAVE
  ========================= */

  /* =========================
     START BULK TEXT PREVIEW
  ========================= */
  async function handleBulkPreview() {
    if (!bulkText.trim()) {
      alert("Paste package rows first.");
      return;
    }

    const rows = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.includes("|")
          ? line.split("|")
          : line.includes("\t")
          ? line.split("\t")
          : line.split(",");

        const name = parts[0]?.trim() || "";
        const tracking = parts[1]?.trim() || "";
        const weightValue = parts[2]?.trim() || "";
        const store = parts[3]?.trim() || "";

        return {
          customerName: name.replace(/^zss\s+/i, ""),
          customerLabel: makeCustomerLabel(name),
          trackingNumber: tracking,
          weight: cleanWeight(weightValue),
          store,
          shippingMethod: "AIR",
        };
      });

    await buildPreviewRows(rows);
  }
  /* =========================
     END BULK TEXT PREVIEW
  ========================= */

  /* =========================
     START EXCEL UPLOAD
  ========================= */
  async function handleExcelUpload(file: File) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonRows: any[] = XLSX.utils.sheet_to_json(sheet);

    const rows = jsonRows.map((row) => {
      const name =
        row["Customer Name"] ||
        row["Name"] ||
        row["Customer"] ||
        row["ZSS Name"] ||
        "";

      const tracking =
        row["Tracking Number"] ||
        row["Tracking"] ||
        row["Tracking #"] ||
        "";

      const weightValue = row["Weight"] || row["Weight LB"] || row["LBS"] || "";

      const store =
        row["Store"] ||
        row["Carrier"] ||
        row["Vendor"] ||
        row["Company"] ||
        "";

      return {
        customerName: String(name).replace(/^zss\s+/i, ""),
        customerLabel: makeCustomerLabel(String(name)),
        trackingNumber: String(tracking).trim(),
        weight: cleanWeight(String(weightValue)),
        store: String(store).trim(),
        shippingMethod: "AIR",
      };
    });

    await buildPreviewRows(rows);
  }
  /* =========================
     END EXCEL UPLOAD
  ========================= */

  /* =========================
     START SAVE PREVIEW ROWS
  ========================= */
  async function savePreviewRows() {
    const readyRows = previewRows.filter(
  (row) =>
    row.status !== "Duplicate" &&
    row.status !== "Missing Info"
);

    if (readyRows.length === 0) {
      alert("No ready rows to save.");
      return;
    }

    setSaving(true);

    for (const row of readyRows) {
      const { data: insertedPackage, error } = await supabase
        .from("packages")
        .insert([
          {
            customer_id: row.matchedCustomerId,
            tracking_number: row.trackingNumber,
            store_name: row.store,
            carrier: row.store,
            shipping_method: row.shippingMethod,
            weight_lbs: row.weight ? Number(row.weight) : null,
            customer_label: row.customerLabel,
            warehouse_received_at: new Date().toISOString(),
            warehouse_added_by: currentUserId,
            status: "Delivered to US Warehouse",
          },
        ])
        .select("id")
        .single();

      if (error) {
        alert(error.message);
        setSaving(false);
        return;
      }

      await supabase.from("notifications").insert([
        {
          customer_id: row.matchedCustomerId,
          package_id: insertedPackage?.id,
          title: "Package Received at US Warehouse",
          notification_type: "shipment",
          message: `Your package (${row.trackingNumber}) was received at the US warehouse.`,
        },
      ]);
    }

    alert(`${readyRows.length} package(s) saved successfully.`);

    setPreviewRows([]);
    setBulkText("");
    setCustomerName("");
    setTrackingNumber("");
    setWeight("");
    setStoreName("");

    await fetchHistory(currentUserId);

    setSaving(false);
  }
  /* =========================
     END SAVE PREVIEW ROWS
  ========================= */

  /* =========================
   START FILTER HISTORY
========================= */
const filteredHistory = history.filter((item) => {
  const searchMatch = `${item.tracking_number} ${item.customer_label} ${item.store_name} ${item.carrier}`
    .toLowerCase()
    .includes(historySearch.toLowerCase());

  const itemDate = item.created_at
    ? new Date(item.created_at).toISOString().split("T")[0]
    : "";

  const startMatch = startDate ? itemDate >= startDate : true;
  const endMatch = endDate ? itemDate <= endDate : true;

  return searchMatch && startMatch && endMatch;
});
/* =========================
   END FILTER HISTORY
========================= */

  if (loading) {
    return (
      <main className={`${poppins.className} flex min-h-screen items-center justify-center bg-[#f5f9ff]`}>
        <p className="text-lg font-bold text-[#071D3A]">
          Loading warehouse dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className={`${poppins.className} min-h-screen bg-[#f5f9ff] p-6`}>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* =========================
            START HEADER
        ========================= */}
        <section className="rounded-[32px] bg-[#061B36] p-8 text-white shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Miami Warehouse Admin
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Warehouse Package Intake
          </h1>

          <p className="mt-3 max-w-3xl text-white/70">
            Add single packages, paste bulk rows, or upload Excel files received at the US warehouse.
          </p>
        </section>
        {/* =========================
            END HEADER
        ========================= */}

        {/* =========================
            START SINGLE ENTRY
        ========================= */}
        <section className="rounded-[32px] bg-white p-8 shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Single Entry
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
            Add One Package
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
            />

            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking Number"
              className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
            />

            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight"
              className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
            />

            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Store / Carrier"
              className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
            />

            <select
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value)}
              className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
            >
              <option>AIR</option>
              <option>SEA</option>
            </select>
          </div>

          <button
            onClick={handleSingleSave}
            className="mt-6 rounded-2xl bg-[#FC9700] px-8 py-4 font-black text-white"
          >
            Preview Package
          </button>
        </section>
        {/* =========================
            END SINGLE ENTRY
        ========================= */}

        {/* =========================
            START BULK PASTE
        ========================= */}
        <section className="rounded-[32px] bg-white p-8 shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Bulk Paste
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
            Paste Multiple Packages
          </h2>

          <p className="mt-3 text-slate-500">
            Format: Customer Name | Tracking Number | Weight | Store
          </p>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={8}
            placeholder={`SHAWN BENJAMIN | TBA329288271559 | 10LB | AMAZON\nKESRAN WILLIAMS | TBA329279296877 | 7LB | AMAZON`}
            className="mt-6 w-full rounded-2xl border border-[#dbe4f0] p-5 outline-none"
          />

          <button
            onClick={handleBulkPreview}
            className="mt-6 rounded-2xl bg-[#061B36] px-8 py-4 font-black text-white"
          >
            Preview Bulk Rows
          </button>
        </section>
        {/* =========================
            END BULK PASTE
        ========================= */}

        {/* =========================
            START EXCEL UPLOAD
        ========================= */}
        <section className="rounded-[32px] bg-white p-8 shadow-xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Excel Upload
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
            Upload Excel File
          </h2>

          <p className="mt-3 text-slate-500">
            Excel columns should be: Customer Name, Tracking Number, Weight, Store.
          </p>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleExcelUpload(file);
            }}
            className="mt-6 w-full rounded-2xl border border-dashed border-[#dbe4f0] bg-[#f8fbff] p-6"
          />
        </section>
        {/* =========================
            END EXCEL UPLOAD
        ========================= */}

        {/* =========================
            START PREVIEW
        ========================= */}
        {previewRows.length > 0 && (
          <section className="rounded-[32px] bg-white p-8 shadow-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                  Preview
                </p>

                <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                  Review Before Saving
                </h2>
              </div>

              <button
                onClick={savePreviewRows}
                disabled={saving}
                className="rounded-2xl bg-[#FC9700] px-8 py-4 font-black text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Ready Rows"}
              </button>
            </div>

            <div className="mt-8 grid gap-4">
              {previewRows.map((row, index) => (
                <div
                  key={`${row.trackingNumber}-${index}`}
                  className="rounded-2xl border border-[#edf2f7] bg-[#f8fbff] p-5"
                >
                  <div className="grid gap-4 md:grid-cols-5">
                    <div>
                      <p className="text-xs font-bold text-slate-400">Customer</p>
                      <p className="font-black">{row.customerLabel}</p>
                      <p className="text-xs text-slate-500">
                        {row.matchedEmail || "No profile match"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">Tracking</p>
                      <p className="font-black">{row.trackingNumber}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">Weight</p>
                      <p className="font-black">{row.weight || "N/A"} LB</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">Store</p>
                      <p className="font-black">{row.store || "N/A"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">Status</p>
                      <p
                        className={`font-black ${
                          row.status === "Ready"
                            ? "text-green-600"
                            : row.status === "Duplicate"
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        {row.status === "Ready"
  ?                 "Matched Customer"
  :                     row.status === "No Customer Match"
  ?                     "Unregistered Customer"
  :                      row.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* =========================
            END PREVIEW
        ========================= */}

        {/* =========================
            START HISTORY
        ========================= */}
        <section className="rounded-[32px] bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                History
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                Packages You Added
              </h2>
            </div>

            <input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search history..."
              className="h-14 w-full max-w-md rounded-2xl border border-[#dbe4f0] px-5 outline-none"
            />
          </div>
<div className="mt-4 flex flex-wrap gap-3">
  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
  />

  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
  />

  <button
    onClick={() => {
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(today);
    }}
    className="h-14 rounded-2xl bg-[#061B36] px-6 font-bold text-white"
  >
    Today
  </button>
</div>
          <div className="mt-8 grid gap-4">
            {filteredHistory.length === 0 ? (
              <div className="rounded-2xl bg-[#f8fbff] p-8 text-center text-slate-500">
                No warehouse entries yet.
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#edf2f7] bg-[#f8fbff] p-5"
                >
                  <div className="grid gap-4 md:grid-cols-5">
                    <div>
                      <p className="text-xs font-bold text-slate-400">Customer</p>
                      <p className="font-black">{item.customer_label}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">Tracking</p>
                      <p className="font-black">{item.tracking_number}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">Weight</p>
                      <p className="font-black">{item.weight_lbs || "N/A"} LB</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">Store</p>
                      <p className="font-black">{item.store_name || item.carrier}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-400">Added</p>
                      <p className="font-black">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        {/* =========================
            END HISTORY
        ========================= */}
      </div>
    </main>
  );
}