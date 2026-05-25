"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";
import { sendInvoiceUploadedEmail } from "@/lib/sendZamineEmail";
import {
  ArrowLeft,
  Bell,
  FileText,
  Settings,
  CreditCard,
History,
  LogOut,
  PackageCheck,
  Box,
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
  invoice_url: string | null;
  status: string | null;
  created_at: string;
};

export default function UploadInvoicePage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("Customer");

  const [trackingNumber, setTrackingNumber] = useState("");
  const [storeName, setStoreName] = useState("");
  const [shippingMethod, setShippingMethod] = useState("AIR");
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [recentPackages, setRecentPackages] = useState<PackageItem[]>([]);

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

      await fetchRecentPackages(user.id);

      setLoadingUser(false);
    }

    checkUser();
  }, [router]);
  /* =========================
     END AUTH CHECK
  ========================= */

  /* =========================
     START FETCH RECENT PACKAGES
  ========================= */
  async function fetchRecentPackages(userId: string) {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("customer_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      alert(error.message);
      return;
    }

    setRecentPackages((data || []) as PackageItem[]);
  }
  /* =========================
     END FETCH RECENT PACKAGES
  ========================= */

  /* =========================
     START SUBMIT INVOICE
  ========================= */
  async function handleSubmitInvoice() {
    setMessage("");

    if (!trackingNumber || !storeName || !shippingMethod || !invoiceFile) {
      setMessage("Please complete all fields and upload your invoice.");
      return;
    }

    setSubmitting(true);

    const fileExt = invoiceFile.name.split(".").pop();
    const fileName = `${customerId}-${Date.now()}.${fileExt}`;
    const filePath = `invoices/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(filePath, invoiceFile);

    if (uploadError) {
      setSubmitting(false);
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
        customer_label: `ZSS ${customerName.toUpperCase()}`,
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
      setSubmitting(false);
      setMessage(insertError.message);
      return;
    }

    await supabase.from("notifications").insert([
      {
        customer_id: customerId,
        title: "Invoice Submitted",
        message: `Your invoice for package (${trackingNumber}) was submitted successfully.`,
        notification_type: "shipment",
      },
    ]);
    /* =========================
   START INVOICE EMAIL
========================= */
const {
  data: { user },
} = await supabase.auth.getUser();

await sendInvoiceUploadedEmail({
  customerEmail: user?.email || "",
  customerName,
  trackingNumber,
  storeName,
});
/* =========================
   END INVOICE EMAIL
========================= */

    setTrackingNumber("");
    setStoreName("");
    setShippingMethod("AIR");
    setInvoiceFile(null);
    setMessage("Invoice submitted successfully.");

    await fetchRecentPackages(customerId);

    setSubmitting(false);
  }
  /* =========================
     END SUBMIT INVOICE
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

  if (loadingUser) {
    return (
      <main
        className={`${poppins.className} flex min-h-screen items-center justify-center bg-[#f5f9ff]`}
      >
        <p className="font-bold text-[#071D3A]">Loading upload page...</p>
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
          item.title === "Upload Invoice"
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

        {/* =========================
            START MAIN
        ========================= */}
        <div className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Welcome Back, {customerName}
              </p>

              <h1 className="text-3xl font-black text-[#071D3A]">
                Upload Invoice
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

          <div className="flex justify-end bg-white px-6 py-3 lg:hidden">
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#FC9700] px-5 py-2 text-sm font-bold text-white"
            >
              Logout
            </button>
          </div>

          <div className="p-6">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              {/* =========================
                  START UPLOAD FORM
              ========================= */}
              <section className="rounded-[32px] bg-white p-8 shadow-lg">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                  Submit Package
                </p>

                <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                  Invoice Upload Form
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Upload your invoice and tracking details so Zamine can process your package.
                </p>

                <div className="mt-7 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Tracking Number
                    </label>

                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Example: 1Z999AA10123456784"
                      className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Store Name
                    </label>

                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Example: Amazon, SHEIN, Walmart"
                      className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Shipping Method
                    </label>

                    <select
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#57B7DF]"
                    >
                      <option value="AIR">AIR</option>
                      <option value="SEA">SEA</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Invoice File
                    </label>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setInvoiceFile(e.target.files?.[0] || null)
                      }
                      className="w-full rounded-2xl border border-dashed border-[#dbe4f0] bg-[#f8fbff] p-5"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Accepted files: PDF, JPG, JPEG, PNG.
                    </p>
                  </div>

                  {message && (
                    <div className="rounded-2xl bg-[#f5f9ff] p-4 text-sm font-semibold text-[#071D3A]">
                      {message}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitInvoice}
                    disabled={submitting}
                    className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FC9700] font-black text-white transition hover:bg-[#e28700] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload size={20} />
                    {submitting ? "Submitting..." : "Submit Invoice"}
                  </button>
                </div>
              </section>
              {/* =========================
                  END UPLOAD FORM
              ========================= */}

              {/* =========================
                  START RECENT UPLOADS
              ========================= */}
              <section className="rounded-[32px] bg-white p-8 shadow-lg">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                  Recent Uploads
                </p>

                <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                  Your Latest Packages
                </h2>

                <div className="mt-8 space-y-4">
                  {recentPackages.length === 0 ? (
                    <div className="rounded-2xl bg-[#f8fbff] px-6 py-8 text-center text-slate-500">
                      No recent packages yet.
                    </div>
                  ) : (
                    recentPackages.map((item) => (
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

                        <div className="mt-4 flex flex-wrap gap-3">
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

                          <span className="rounded-full bg-white px-5 py-2 text-sm font-black text-slate-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
              {/* =========================
                  END RECENT UPLOADS
              ========================= */}
            </div>
          </div>
        </div>
        {/* =========================
            END MAIN
        ========================= */}
      </div>
    </main>
  );
}