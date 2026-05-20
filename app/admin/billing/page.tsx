"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type PackageItem = {
  id: string;
  customer_id: string | null;

  tracking_number: string;
  customer_label: string | null;
  store_name: string | null;
  shipping_method: string | null;

  status: string | null;
  payment_status: string | null;

  shipping_cost: number | null;
  customs_cost: number | null;
  discount: number | null;

  total_due: number | null;
  amount_paid: number | null;

  payment_method: string | null;
  receipt_number: string | null;

  is_archived: boolean | null;

  created_at: string;
};

type PaymentHistoryItem = {
  id?: string;
  package_id: string;
  customer_id: string | null;

  tracking_number: string;

  amount: number;

  payment_method: string;
  receipt_number: string;

  created_at: string;
};

export default function BillingPage() {
  /* =========================
     START STATE
  ========================= */

  const [packages, setPackages] = useState<PackageItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [paymentInputs, setPaymentInputs] = useState<
    Record<string, string>
  >({});

  const [methodInputs, setMethodInputs] = useState<
    Record<string, string>
  >({});

  const [receiptInputs, setReceiptInputs] = useState<
    Record<string, string>
  >({});

  const [paymentHistory, setPaymentHistory] = useState<
    PaymentHistoryItem[]
  >([]);

  /* =========================
     END STATE
  ========================= */

  useEffect(() => {
    fetchBilling();
    fetchPaymentHistory();
  }, []);

  /* =========================
     START FETCH BILLING
  ========================= */

  async function fetchBilling() {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_archived", false)
.neq("payment_status", "Paid")
.gt("total_due", 0)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPackages((data || []) as PackageItem[]);

    setLoading(false);
  }

  /* =========================
     END FETCH BILLING
  ========================= */

  /* =========================
     START FETCH HISTORY
  ========================= */

  async function fetchPaymentHistory() {
    const { data } = await supabase
      .from("payment_history")
      .select("*")
      .order("created_at", { ascending: false });

    setPaymentHistory(
      (data || []) as PaymentHistoryItem[]
    );
  }

  /* =========================
     END FETCH HISTORY
  ========================= */

  /* =========================
     START FILTER
  ========================= */

  const filteredPackages = packages.filter((item) =>
    `
      ${item.customer_label}
      ${item.tracking_number}
      ${item.store_name}
      ${item.payment_status}
    `
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* =========================
     END FILTER
  ========================= */

  /* =========================
     START SUMMARY CARDS
  ========================= */

  const totalOutstanding = useMemo(() => {
    return filteredPackages.reduce((sum, item) => {
      const due = Number(item.total_due || 0);

      const paid = Number(item.amount_paid || 0);

      return sum + (due - paid);
    }, 0);
  }, [filteredPackages]);

  const totalRevenue = useMemo(() => {
    return filteredPackages.reduce((sum, item) => {
      return sum + Number(item.amount_paid || 0);
    }, 0);
  }, [filteredPackages]);

  const totalPartial = useMemo(() => {
    return filteredPackages.filter(
      (item) => item.payment_status === "Partial"
    ).length;
  }, [filteredPackages]);

  const overdue7 = useMemo(() => {
    return filteredPackages.filter((item) => {
      const created = new Date(
        item.created_at
      ).getTime();

      const days =
        (Date.now() - created) /
        (1000 * 60 * 60 * 24);

      return days >= 7 && days < 30;
    }).length;
  }, [filteredPackages]);

  const overdue30 = useMemo(() => {
    return filteredPackages.filter((item) => {
      const created = new Date(
        item.created_at
      ).getTime();

      const days =
        (Date.now() - created) /
        (1000 * 60 * 60 * 24);

      return days >= 30;
    }).length;
  }, [filteredPackages]);

  /* =========================
     END SUMMARY CARDS
  ========================= */

  /* =========================
     START PROCESS PAYMENT
  ========================= */

  async function processPayment(item: PackageItem) {
    const paymentAmount = Number(
      paymentInputs[item.id] || 0
    );

    const paymentMethod =
      methodInputs[item.id] || "Cash";

    const receiptNumber =
      receiptInputs[item.id] || "N/A";

    if (paymentAmount <= 0) {
      alert("Enter payment amount.");
      return;
    }

    const currentPaid = Number(
      item.amount_paid || 0
    );

    const totalDue = Number(
      item.total_due || 0
    );

    const newAmountPaid =
      currentPaid + paymentAmount;

    let paymentStatus = "Partial";

    if (newAmountPaid <= 0) {
      paymentStatus = "Unpaid";
    }

    if (newAmountPaid >= totalDue) {
      paymentStatus = "Paid";
    }

    const shouldArchive =
      paymentStatus === "Paid" &&
      item.status === "Delivered";

    /* =========================
       UPDATE PACKAGE
    ========================= */

    const { error } = await supabase
      .from("packages")
      .update({
        amount_paid: newAmountPaid,

        payment_status: paymentStatus,

        payment_method: paymentMethod,

        receipt_number: receiptNumber,

        is_archived: shouldArchive,
      })
      .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    /* =========================
       PAYMENT HISTORY
    ========================= */

    await supabase
      .from("payment_history")
      .insert([
        {
          package_id: item.id,

          customer_id: item.customer_id,

          tracking_number:
            item.tracking_number,

          amount: paymentAmount,

          payment_method: paymentMethod,

          receipt_number: receiptNumber,
        },
      ]);

    /* =========================
       CUSTOMER NOTIFICATION
    ========================= */

    if (item.customer_id) {
      await supabase
        .from("notifications")
        .insert([
          {
            customer_id: item.customer_id,

            package_id: item.id,

            title: "Payment Received",
            notification_type: "payment",

            message: `A payment of EC$${paymentAmount.toFixed(
              2
            )} was received for package (${item.tracking_number}).`,
          },
        ]);
    }

    alert(
      shouldArchive
        ? "Payment completed and package archived."
        : "Payment saved."
    );

    fetchBilling();

    fetchPaymentHistory();
  }

  /* =========================
     END PROCESS PAYMENT
  ========================= */

  /* =========================
     START EXPORT EXCEL
  ========================= */

  function exportExcel() {
    const exportData = filteredPackages.map(
      (item) => ({
        Customer:
          item.customer_label || "",

        Tracking:
          item.tracking_number,

        Store: item.store_name,

        Total_Due:
          item.total_due || 0,

        Amount_Paid:
          item.amount_paid || 0,

        Outstanding:
          Number(item.total_due || 0) -
          Number(item.amount_paid || 0),

        Payment_Status:
          item.payment_status,
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(exportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Billing"
    );

    XLSX.writeFile(
      workbook,
      "billing-report.xlsx"
    );
  }

  /* =========================
     END EXPORT EXCEL
  ========================= */

  /* =========================
     START EXPORT PDF
  ========================= */

  function exportPDF() {
    const doc = new jsPDF();

    doc.text("Billing Report", 14, 15);

    autoTable(doc, {
      startY: 25,

      head: [
        [
          "Tracking",
          "Customer",
          "Total",
          "Paid",
          "Outstanding",
          "Status",
        ],
      ],

      body: filteredPackages.map(
        (item) => [
          item.tracking_number,

          item.customer_label || "",

          `EC$${Number(
            item.total_due || 0
          ).toFixed(2)}`,

          `EC$${Number(
            item.amount_paid || 0
          ).toFixed(2)}`,

          `EC$${(
            Number(item.total_due || 0) -
            Number(item.amount_paid || 0)
          ).toFixed(2)}`,

          item.payment_status || "",
        ]
      ),
    });

    doc.save("billing-report.pdf");
  }

  /* =========================
     END EXPORT PDF
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
            Billing
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Billing Management
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportExcel}
            className="rounded-2xl bg-green-600 px-6 py-3 font-black text-white"
          >
            Export Excel
          </button>

          <button
            onClick={exportPDF}
            className="rounded-2xl bg-red-600 px-6 py-3 font-black text-white"
          >
            Export PDF
          </button>

          <Link
            href="/admin"
            className="rounded-2xl bg-[#061B36] px-6 py-3 font-black text-white"
          >
            Back To Admin
          </Link>
        </div>
      </div>

      {/* =========================
          END HEADER
      ========================= */}

      {/* =========================
          START SUMMARY
      ========================= */}

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Outstanding
          </p>

          <h2 className="mt-3 text-4xl font-black">
            EC${totalOutstanding.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Revenue
          </p>

          <h2 className="mt-3 text-4xl font-black">
            EC${totalRevenue.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Partial Payments
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {totalPartial}
          </h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            7+ Days
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {overdue7}
          </h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            30+ Days
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {overdue30}
          </h2>
        </div>
      </div>

      {/* =========================
          END SUMMARY
      ========================= */}

      {/* =========================
          START SEARCH
      ========================= */}

      <div className="mb-8 rounded-[32px] bg-white p-6 shadow-sm">
        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search tracking, customer or payment..."
          className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none"
        />
      </div>

      {/* =========================
          END SEARCH
      ========================= */}

      {/* =========================
          START BILLING LIST
      ========================= */}

      {loading ? (
        <div className="rounded-[32px] bg-white p-10 text-center font-bold">
          Loading billing...
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPackages.map((item) => {
            const totalDue = Number(
              item.total_due || 0
            );

            const amountPaid = Number(
              item.amount_paid || 0
            );

            const outstanding =
              totalDue - amountPaid;

            return (
              <div
                key={item.id}
                className="rounded-[32px] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC9700]">
                      Billing Item
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      {item.customer_label ||
                        "Unknown Customer"}
                    </h2>

                    <p className="mt-1 text-slate-500">
                      Tracking:
                      {" "}
                      {item.tracking_number}
                    </p>

                    <p className="mt-1 text-slate-500">
                      Store:
                      {" "}
                      {item.store_name || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#061B36] p-5 text-white">
                    <p className="text-sm uppercase text-white/70">
                      Outstanding
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      EC$
                      {outstanding.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* =========================
                    START STATS
                ========================= */}

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <div className="rounded-2xl bg-[#f8fbff] p-5">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Total Due
                    </p>

                    <p className="mt-2 font-black">
                      EC$
                      {totalDue.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#EAF9F1] p-5">
                    <p className="text-xs font-bold uppercase text-green-700">
                      Amount Paid
                    </p>

                    <p className="mt-2 font-black">
                      EC$
                      {amountPaid.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FFF3E3] p-5">
                    <p className="text-xs font-bold uppercase text-[#FC9700]">
                      Status
                    </p>

                    <p className="mt-2 font-black">
                      {item.payment_status ||
                        "Unpaid"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8fbff] p-5">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Method
                    </p>

                    <p className="mt-2 font-black">
                      {item.payment_method ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8fbff] p-5">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Receipt
                    </p>

                    <p className="mt-2 font-black">
                      {item.receipt_number ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                {/* =========================
                    END STATS
                ========================= */}

                {/* =========================
                    START PAYMENT FORM
                ========================= */}

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    type="number"
                    placeholder="Payment Amount"
                    value={
                      paymentInputs[item.id] ||
                      ""
                    }
                    onChange={(e) =>
                      setPaymentInputs(
                        (prev) => ({
                          ...prev,

                          [item.id]:
                            e.target.value,
                        })
                      )
                    }
                    className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
                  />

                  <select
                    value={
                      methodInputs[item.id] ||
                      "Cash"
                    }
                    onChange={(e) =>
                      setMethodInputs(
                        (prev) => ({
                          ...prev,

                          [item.id]:
                            e.target.value,
                        })
                      )
                    }
                    className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
                  >
                    <option>Cash</option>
                    <option>Card</option>
                    <option>Transfer</option>
                  </select>

                  <input
                    placeholder="Receipt Number"
                    value={
                      receiptInputs[item.id] ||
                      ""
                    }
                    onChange={(e) =>
                      setReceiptInputs(
                        (prev) => ({
                          ...prev,

                          [item.id]:
                            e.target.value,
                        })
                      )
                    }
                    className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
                  />

                  <button
                    onClick={() =>
                      processPayment(item)
                    }
                    className="rounded-2xl bg-[#FC9700] px-5 py-4 font-black text-white"
                  >
                    Save Payment
                  </button>
                </div>

                {/* =========================
                    END PAYMENT FORM
                ========================= */}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================
          END BILLING LIST
      ========================= */}

      {/* =========================
          START HISTORY
      ========================= */}

      <div className="mt-12 rounded-[32px] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
            Payments
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Payment History
          </h2>
        </div>

        {paymentHistory.length === 0 ? (
          <div className="rounded-2xl bg-[#f8fbff] p-8 text-center font-bold text-slate-500">
            No payment history found.
          </div>
        ) : (
          <div className="space-y-4">
            {paymentHistory.map(
              (payment, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#e5edf6] p-5"
                >
                  <div className="grid gap-4 md:grid-cols-5">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Tracking
                      </p>

                      <p className="mt-2 font-black">
                        {
                          payment.tracking_number
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Amount
                      </p>

                      <p className="mt-2 font-black">
                        EC$
                        {payment.amount.toFixed(
                          2
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Method
                      </p>

                      <p className="mt-2 font-black">
                        {
                          payment.payment_method
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Receipt
                      </p>

                      <p className="mt-2 font-black">
                        {
                          payment.receipt_number
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">
                        Date
                      </p>

                      <p className="mt-2 font-black">
                        {new Date(
                          payment.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* =========================
          END HISTORY
      ========================= */}
    </main>
  );
}