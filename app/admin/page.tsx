"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import {
  sendDeliveredEmail,
  sendPackageReceivedEmail,
  sendReadyForPickupEmail,
} from "@/lib/sendZamineEmail";
import { supabase } from "@/lib/supabaseClient";

import {
  Bell,
  Boxes,
  CheckCircle2,
  DollarSign,
  LogOut,
  PackageCheck,
  Search,
  Truck,
  User,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

/* =========================
   START TYPES
========================= */
type CustomerInfo = {
  full_name: string | null;
  email: string | null;
};
type CustomerOption = {
  id: string;
  full_name: string | null;
  email: string | null;
};

 type PackageItem = {
  customer: CustomerInfo | null;
  id: string;
  tracking_number: string;
  store_name: string;
  shipping_method: string;
  status: string;
  invoice_url: string | null;
  estimated_arrival: string | null;
  created_at: string;
  customer_id: string;
  customer_label?: string | null;
  carrier?: string | null;

  weight_lbs: number | null;

  declared_value: number | null;
  package_category: string | null;

  shipping_cost: number | null;
  customs_cost: number | null;

  discount: number | null;
  total_due: number | null;

  payment_status: string | null;
};
/* =========================
   END TYPES
========================= */

/* =========================
   START OPTIONS
========================= */
const statusOptions = [
  "Invoice Received",
  "Delivered to US Warehouse",
  "Ready For Pickup",
  "Delivered",
];

const paymentOptions = ["Unpaid", "Paid", "Partial"];
/* =========================
   END OPTIONS
========================= */

export default function AdminDashboardPage() {
  const router = useRouter();

  /* =========================
     START STATE
  ========================= */
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      await fetchPackages();
      /* =========================
   START FETCH CUSTOMERS
========================= */
async function fetchCustomers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "customer")
    .order("full_name", { ascending: true });

  if (error) {
    alert(error.message);
    return;
  }

  setCustomers((data || []) as CustomerOption[]);
}
/* =========================
   END FETCH CUSTOMERS
========================= */
      await fetchCustomers();
      setLoading(false);
    }

    checkUser();
  }, [router]);
  /* =========================
     END AUTH CHECK
  ========================= */

  /* =========================
   START FETCH PACKAGES
========================= */
async function fetchPackages() {
  const { data: packageData, error: packageError } = await supabase
    .from("packages")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (packageError) {
    alert(packageError.message);
    return;
  }

  const { data: profileData, error: profileError } = await supabase
  .from("profiles")
  .select("id, full_name, email");

if (profileError) {
  alert(profileError.message);
  return;
}

  const mergedPackages = (packageData || []).map((pkg) => {
    const customer = profileData?.find(
      (profile) => profile.id === pkg.customer_id
    );

    /* =========================
   START CUSTOMER MERGE
========================= */
return {
  ...pkg,
  customer: {
    full_name: customer?.full_name || null,
    email: customer?.email || null,
  },
};
/* =========================
   END CUSTOMER MERGE
========================= */
  });

  setPackages(mergedPackages as PackageItem[]);
}
/* =========================
   END FETCH PACKAGES
========================= */

  /* =========================
   START CUSTOMER HELPERS
========================= */

function getCustomerName(item: any) {
  console.log("CUSTOMER OBJECT:", item);

  return item?.customer?.full_name || "Unknown Customer";
}

function getCustomerEmail(item: any) {
  return item?.customer?.email || "No email found";
}

/* =========================
   END CUSTOMER HELPERS
========================= */

  /* =========================
     START UPDATE STATUS
  ========================= */
  async function updateStatus(
    packageId: string,
    status: string,
    customerId: string,
    trackingNumber: string
  ) {
    const { error } = await supabase
      .from("packages")
      .update({ status })
      .eq("id", packageId);

    if (error) {
      alert(error.message);
      return;
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert([
        {
          customer_id: customerId,
          package_id: packageId,
          title: "Package Status Updated",
          notification_type: "shipment",
          message: `Your package (${trackingNumber}) status was updated to "${status}".`,
        },
      ]);

    if (notificationError) {
  alert(notificationError.message);
  return;
}

/* =========================
   START STATUS EMAIL AUTOMATION
========================= */
const packageItem = packages.find((item) => item.id === packageId);

if (packageItem?.customer?.email) {
  const customerEmail = packageItem.customer.email;
  const customerName = packageItem.customer.full_name || "Customer";

  if (status === "Invoice Received") {
    await sendPackageReceivedEmail({
      customerEmail,
      customerName,
      trackingNumber,
      storeName: packageItem.store_name,
    });
  }

  if (status === "Ready For Pickup") {
    await sendReadyForPickupEmail({
      customerEmail,
      customerName,
      trackingNumber,
      storeName: packageItem.store_name,
      balanceDue: Number(packageItem.total_due || 0),
    });
  }

  if (status === "Delivered") {
    await sendDeliveredEmail({
      customerEmail,
      customerName,
      trackingNumber,
      storeName: packageItem.store_name,
    });
  }
} else {
  alert("Status updated, but no customer email was found.");
}
/* =========================
   END STATUS EMAIL AUTOMATION
========================= */

await fetchPackages();
}
  /* =========================
     END UPDATE STATUS
  ========================= */

  /* =========================
     START UPDATE ARRIVAL DATE
  ========================= */
  async function updateArrival(packageId: string, date: string) {
    const { error } = await supabase
      .from("packages")
      .update({ estimated_arrival: date })
      .eq("id", packageId);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchPackages();
  }
  /* =========================
     END UPDATE ARRIVAL DATE
  ========================= */

  /* =========================
     START UPDATE BILLING
  ========================= */
  async function updateBilling(
  packageId: string,
  customerId: string,
  trackingNumber: string,
  field: keyof Pick<
    PackageItem,
    | "weight_lbs"
    | "declared_value"
    | "package_category"
    | "discount"
    | "payment_status"
  >,
  value: string
) {
  const currentPackage = packages.find((item) => item.id === packageId);

  if (!currentPackage) return;

  const updatedPackage = {
    ...currentPackage,
    [field]:
      field === "payment_status" || field === "package_category"
        ? value
        : value === ""
        ? null
        : Number(value),
  };

  const weight = Number(updatedPackage.weight_lbs || 0);

  const declaredValue = Number(
    updatedPackage.declared_value || 0
  );

  const discount = Number(updatedPackage.discount || 0);

  const method = (
    updatedPackage.shipping_method || ""
  ).toUpperCase();

  /* =========================
     SHIPPING COST
  ========================= */

  const shippingCost =
    method === "SEA"
      ? weight * 6
      : weight * 10;

  /* =========================
     CUSTOMS LOGIC
  ========================= */

  const category = (
    updatedPackage.package_category || ""
  ).toLowerCase();

  const isBook = category === "books";

  const isUnderTwenty =
    declaredValue < 20;

  const customsCost =
    isBook || isUnderTwenty
      ? 0
      : declaredValue * 0.515;

  /* =========================
     TOTAL
  ========================= */

  const totalDue = Math.max(
    shippingCost + customsCost - discount,
    0
  );

  const updatePayload = {
    [field]:
      field === "payment_status" ||
      field === "package_category"
        ? value
        : value === ""
        ? null
        : Number(value),

    shipping_cost: shippingCost,
    customs_cost: customsCost,
    total_due: totalDue,
  };

  const { error } = await supabase
    .from("packages")
    .update(updatePayload)
    .eq("id", packageId);

  if (error) {
    alert(error.message);
    return;
  }

  await fetchPackages();
}
  /* =========================
     END UPDATE BILLING
  ========================= */

  /* =========================
     START GENERATE INVOICE
  ========================= */
  async function generateInvoice(item: PackageItem) {
    if (!item.customer_id) {
      alert("No customer linked to this package.");
      return;
    }

    if (!item.customer?.email) {
      alert("No customer email found.");
      return;
    }

    const shippingFee = Number(item.shipping_cost || 0);
    const customsFee = Number(item.customs_cost || 0);
    const discount = Number(item.discount || 0);
    const weight = Number(item.weight_lbs || 0);
    const totalAmount = Math.max(shippingFee + customsFee - discount, 0);

    if (totalAmount <= 0) {
      alert("Please enter shipping/customs charges before generating invoice.");
      return;
    }

    const invoiceNumber = `ZSI-${Date.now()}`;
    const customerName = item.customer.full_name || "Customer";

    const { error: invoiceError } = await supabase.from("invoices").insert([
      {
        package_id: item.id,
        customer_id: item.customer_id,
        invoice_number: invoiceNumber,
        weight,
        customs_fee: customsFee,
        shipping_fee: shippingFee,
        handling_fee: 0,
        other_fee: 0,
        total_amount: totalAmount,
        amount_paid: 0,
        status: "Unpaid",
        notes: `Invoice generated for package ${item.tracking_number}`,
      },
    ]);

    if (invoiceError) {
      alert(invoiceError.message);
      return;
    }

    const { error: packageError } = await supabase
      .from("packages")
      .update({
        invoice_number: invoiceNumber,
        invoice_sent: true,
        total_due: totalAmount,
        payment_status: "Unpaid",
        status: "Ready For Pickup",
      })
      .eq("id", item.id);

    if (packageError) {
      alert(packageError.message);
      return;
    }

    await supabase.from("notifications").insert([
      {
        customer_id: item.customer_id,
        package_id: item.id,
        title: "Invoice Ready",
        notification_type: "payment",
        message: `Your invoice ${invoiceNumber} for package (${item.tracking_number}) is ready. Total due: EC$${totalAmount.toFixed(2)}.`,
      },
    ]);

    await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: item.customer.email,
        subject: `Your Zamine invoice is ready - ${invoiceNumber}`,
        html: `
          <div style="margin:0;padding:0;background:#f5f9ff;font-family:Arial,Helvetica,sans-serif;color:#071D3A;">
            <div style="max-width:680px;margin:0 auto;padding:30px 18px;">
              <div style="background:#061B36;border-radius:28px 28px 0 0;padding:40px 30px;text-align:center;">

  <div style="display:inline-block;background:#ffffff;border-radius:18px;padding:14px 20px;margin-bottom:22px;">
    <img
      src="https://www.zamineshipping.com/zamine-logo.png"
      alt="Zamine Shipping Services"
      style="width:190px;height:auto;display:block;"
    />
  </div>

  <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:900;">
    Zamine Shipping
  </h1>
                <p style="margin:10px 0 0;color:#57B7DF;font-size:14px;font-weight:700;">Your package invoice is ready</p>
              </div>

              <div style="background:#ffffff;padding:34px;border-radius:0 0 28px 28px;">
                <h2 style="margin:0 0 16px;font-size:28px;color:#071D3A;">Hi ${customerName},</h2>

                <p style="font-size:16px;line-height:1.7;color:#4b5563;">
                  Your invoice has been generated for your package. Please review the breakdown below.
                </p>

                <div style="margin:26px 0;padding:22px;background:#f5f9ff;border-radius:20px;">
                  <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#FC9700;text-transform:uppercase;">Invoice Details</p>
                  <p style="margin:8px 0;font-size:16px;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                  <p style="margin:8px 0;font-size:16px;"><strong>Tracking Number:</strong> ${item.tracking_number}</p>
                  <p style="margin:8px 0;font-size:16px;"><strong>Store:</strong> ${item.store_name || "N/A"}</p>
                  <p style="margin:8px 0;font-size:16px;"><strong>Weight:</strong> ${weight} lbs</p>
                </div>

                <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                  <tr>
                    <td style="padding:12px;border-bottom:1px solid #e5edf7;color:#64748b;">Shipping Fee</td>
                    <td style="padding:12px;border-bottom:1px solid #e5edf7;text-align:right;font-weight:800;">EC$${shippingFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;border-bottom:1px solid #e5edf7;color:#64748b;">Customs Fee</td>
                    <td style="padding:12px;border-bottom:1px solid #e5edf7;text-align:right;font-weight:800;">EC$${customsFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;border-bottom:1px solid #e5edf7;color:#64748b;">Discount</td>
                    <td style="padding:12px;border-bottom:1px solid #e5edf7;text-align:right;font-weight:800;">- EC$${discount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding:16px;font-size:18px;font-weight:900;color:#071D3A;">Total Due</td>
                    <td style="padding:16px;text-align:right;font-size:22px;font-weight:900;color:#FC9700;">EC$${totalAmount.toFixed(2)}</td>
                  </tr>
                </table>

                <p style="font-size:16px;line-height:1.7;color:#4b5563;margin-top:24px;">
                  Your package is ready for pickup once payment is completed according to Zamine Shipping Services procedures.
                </p>

                <a href="https://zamineshipping.com/dashboard/billing" style="display:inline-block;margin-top:24px;background:#FC9700;color:#ffffff;text-decoration:none;padding:15px 26px;border-radius:999px;font-weight:800;">
                  View Billing Details
                </a>

                <p style="margin-top:34px;font-size:14px;line-height:1.7;color:#6b7280;">
                  Need help? Reply to this email or contact Zamine Shipping Services for support.
                </p>
              </div>

              <p style="text-align:center;margin-top:22px;font-size:12px;color:#94a3b8;">
                © 2026 Zamine Shipping Services. All rights reserved.
              </p>
            </div>
          </div>
        `,
      }),
    });

    alert("Invoice generated and sent to customer.");
    await fetchPackages();
  }
  /* =========================
     END GENERATE INVOICE
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

  /* =========================
     START FILTER + TOTALS
  ========================= */
  const filteredPackages = packages.filter((item) =>
    `${item.tracking_number} ${item.store_name} ${item.status} ${
      item.payment_status
    } ${getCustomerName(item)} ${getCustomerEmail(item)}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalOutstanding = packages.reduce((sum, item) => {
    if (item.payment_status === "Paid") return sum;
    return sum + Number(item.total_due || 0);
  }, 0);

  const totalPaid = packages.reduce((sum, item) => {
    if (item.payment_status !== "Paid") return sum;
    return sum + Number(item.total_due || 0);
  }, 0);
  /* =========================
     END FILTER + TOTALS
  ========================= */

  /* =========================
     START LOADING SCREEN
  ========================= */
  if (loading) {
    return (
      <main
        className={`${poppins.className} flex min-h-screen items-center justify-center bg-[#f5f9ff]`}
      >
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#57B7DF] border-t-[#FC9700]" />
          <p className="font-bold text-[#071D3A]">
            Loading admin dashboard...
          </p>
        </div>
      </main>
    );
  }
  /* =========================
     END LOADING SCREEN
  ========================= */

  return (
    <main className={`${poppins.className} min-h-screen bg-[#f5f9ff]`}>
      <div className="flex min-h-screen">
        {/* =========================
            START SIDEBAR
        ========================= */}
        <aside className="hidden w-[290px] flex-col bg-[#061B36] text-white lg:flex">
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
                ["Admin Dashboard", Boxes, "/admin"],
                ["Archived Packages", PackageCheck, "/admin/archived"],
                ["Warehouse Intake", Truck, "/admin/warehouse"],
                ["Customers", User, "/admin/customers"],
                ["Shipments", Truck, "/admin/shipments"],
                ["Billing", DollarSign, "/admin/billing"],
                ["Notifications", Bell, "/admin/notifications"],
                ].map(([title, Icon, href]) => (
                <Link
                    key={title as string}
                    href={href as string}
                    className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition ${
                    href === "/admin"
                        ? "bg-[#FC9700] text-white"
                        : "hover:bg-white/10"
                    }`}
                >
                    <Icon size={22} />
                    <span className="font-semibold">{title as string}</span>
                </Link>
                ))}
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
            START MAIN CONTENT AREA
        ========================= */}
        <div className="flex-1">
          {/* =========================
              START TOPBAR
          ========================= */}
          <header className="flex items-center justify-between border-b bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Zamine Shipping Services
              </p>

              <h1 className="text-3xl font-black text-[#071D3A]">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative rounded-full bg-[#f5f9ff] p-3">
                <Bell className="text-[#071D3A]" size={22} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FC9700]" />
              </button>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#57B7DF] text-white">
                <User size={22} />
              </div>
            </div>
          </header>
          {/* =========================
              END TOPBAR
          ========================= */}

          {/* =========================
              START MOBILE LOGOUT
          ========================= */}
          <div className="flex justify-end bg-white px-6 py-3 lg:hidden">
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#FC9700] px-5 py-2 text-sm font-bold text-white"
            >
              Logout
            </button>
          </div>
          {/* =========================
              END MOBILE LOGOUT
          ========================= */}

          {/* =========================
              START PAGE CONTENT
          ========================= */}
          <div className="p-6">
            {/* =========================
                START STATS CARDS
            ========================= */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Total Packages", packages.length.toString(), Boxes],
                [
                  "Ready For Pickup",
                  packages
                    .filter((item) => item.status === "Ready For Pickup")
                    .length.toString(),
                  CheckCircle2,
                ],
                ["Outstanding", `EC$${totalOutstanding.toFixed(2)}`, DollarSign],
                ["Paid", `EC$${totalPaid.toFixed(2)}`, CheckCircle2],
              ].map(([title, value, Icon]) => (
                <div
                  key={title as string}
                  className="rounded-[28px] bg-white p-7 shadow-lg"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        {title as string}
                      </p>

                      <h2 className="mt-3 text-4xl font-black text-[#071D3A]">
                        {value as string}
                      </h2>
                    </div>

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3E3]">
                      <Icon className="text-[#FC9700]" size={30} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* =========================
                END STATS CARDS
            ========================= */}

            {/* =========================
                START PACKAGE MANAGEMENT
            ========================= */}
            <div className="mt-10 rounded-[32px] bg-white p-8 shadow-lg">
              {/* =========================
                  START PACKAGE MANAGEMENT HEADER
              ========================= */}
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FC9700]">
                    Package Management
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-[#071D3A]">
                    Customer Packages & Billing
                  </h2>
                </div>

                <div className="relative w-full max-w-md">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Search tracking, customer, store or payment..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] pl-12 pr-5 outline-none focus:border-[#57B7DF]"
                  />
                </div>
              </div>
              {/* =========================
                  END PACKAGE MANAGEMENT HEADER
              ========================= */}

              {/* =========================
                  START PACKAGE CARD LIST
              ========================= */}
              <div className="mt-8 grid gap-6">
                {filteredPackages.length === 0 ? (
                  <div className="rounded-2xl bg-[#f8fbff] px-6 py-8 text-center text-slate-500">
                    No packages found.
                  </div>
                ) : (
                  filteredPackages.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[28px] border border-[#edf2f7] bg-[#f8fbff] p-6 shadow-sm"
                    >
                      {/* =========================
                          START PACKAGE CARD TOP
                      ========================= */}
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC9700]">
                            Customer
                          </p>
                            
                          <h3 className="mt-2 text-2xl font-black text-[#071D3A]">
                            {getCustomerName(item)}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {getCustomerEmail(item)}
                          </p>
                          {item.customer_id ? (
                        <div className="mt-3 inline-flex rounded-full bg-green-100 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-green-700">
                            Matched Customer
                        </div>
                        ) : (
                        <div className="mt-3 inline-flex rounded-full bg-orange-100 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-orange-700">
                            Unregistered Customer
                        </div>
                        )}
                        </div>
{/* =========================
    START LINK CUSTOMER
========================= */}

<div className="mt-4 flex flex-col gap-3 md:flex-row">
  <select
    onChange={async (e) => {
      const customerId = e.target.value;

      if (!customerId) return;

      const selectedCustomer = customers.find(
        (customer) => customer.id === customerId
      );

      const { error } = await supabase
        .from("packages")
        .update({
          customer_id: customerId,
          manually_linked: true,
        })
        .eq("id", item.id);

      if (error) {
        alert(error.message);
        return;
      }

      await supabase.from("notifications").insert([
        {
          customer_id: customerId,
          package_id: item.id,
          title: "Package Linked To Your Account",
          notification_type: "system",
          message: `A package (${item.tracking_number}) was linked to your account.`,
        },
      ]);

      alert("Customer linked successfully.");

      await fetchPackages();
    }}
    className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 outline-none"
  >
    <option value="">Link customer account...</option>

    {customers.map((customer) => (
      <option key={customer.id} value={customer.id}>
        {customer.full_name} ({customer.email})
      </option>
    ))}
  </select>
</div>

{/* =========================
    END LINK CUSTOMER
========================= */}
{/* =========================
    START ADMIN PACKAGE ACTIONS
========================= */}

<div className="mt-3 flex flex-wrap gap-3">

  {/* UNLINK CUSTOMER */}
  {item.customer_id && (
    <button
      onClick={async () => {
        const confirmUnlink = confirm(
          "Remove linked customer from this package?"
        );

        if (!confirmUnlink) return;

        const { error } = await supabase
          .from("packages")
          .update({
            customer_id: null,
            manually_linked: false,
          })
          .eq("id", item.id);

        if (error) {
          alert(error.message);
          return;
        }

        alert("Customer unlinked.");

        await fetchPackages();
      }}
      className="rounded-2xl bg-red-100 px-5 py-3 text-sm font-black text-red-700"
    >
      Unlink Customer
    </button>
  )}

  {/* ARCHIVE PACKAGE */}
  {item.status === "Delivered" &&
    item.payment_status === "Paid" && (
      <button
        onClick={async () => {
          const confirmArchive = confirm(
            "Archive this completed package?"
          );

          if (!confirmArchive) return;

          const { error } = await supabase
            .from("packages")
            .update({
              is_archived: true,
            })
            .eq("id", item.id);

          if (error) {
            alert(error.message);
            return;
          }

          alert("Package archived.");

          await fetchPackages();
        }}
        className="rounded-2xl bg-[#061B36] px-5 py-3 text-sm font-black text-white"
      >
        Archive Package
      </button>
    )}

</div>

{/* =========================
    END ADMIN PACKAGE ACTIONS
========================= */}
            {/* =========================
                START COPY INVITE
            ========================= */}

            <button
            onClick={() => {
                const inviteMessage = `Hi, your package (${item.tracking_number}) has arrived at Zamine Shipping Services. Please register your account to track packages and receive updates.`;

                navigator.clipboard.writeText(inviteMessage);

                alert("Invite message copied.");
            }}
            className="mt-3 rounded-2xl bg-[#061B36] px-5 py-3 text-sm font-black text-white"
            >
            Copy Registration Invite
            </button>

            {/* =========================
                END COPY INVITE
            ========================= */}
                        <div className="flex flex-wrap gap-3">
                              <button
                    onClick={async () => {
                      if (!item.customer?.email) {
                        alert("No customer email found.");
                        return;
                      }

                      const balanceDue = Number(item.total_due || 0);

                      await sendReadyForPickupEmail({
                        customerEmail: item.customer.email,
                        customerName:
                          item.customer.full_name || "Customer",
                        trackingNumber: item.tracking_number,
                        storeName: item.store_name,
                        balanceDue,
                      });

                      await supabase.from("notifications").insert([
                        {
                          customer_id: item.customer_id,
                          package_id: item.id,
                          title: "Package Ready For Pickup",
                          notification_type: "shipment",
                          message: `Your package (${item.tracking_number}) is ready for pickup.`,
                        },
                      ]);

                          alert("Ready for pickup email sent.");
                        }}
                        className="mt-3 rounded-2xl bg-green-600 px-5 py-3 text-sm font-black text-white"
                      >
                        Send Ready For Pickup Email
                      </button>
                          <span className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#071D3A] shadow-sm">
                            {item.tracking_number}
                          </span>

                          <span className="rounded-full bg-[#FFF3E3] px-5 py-2 text-sm font-bold text-[#FC9700]">
                            {item.shipping_method}
                          </span>

                          {item.invoice_url && (
                            <a
                              href={item.invoice_url}
                              target="_blank"
                              className="rounded-full bg-[#FC9700] px-5 py-2 text-sm font-bold text-white"
                            >
                              View Invoice
                            </a>
                          )}
                        </div>
                      </div>
                      {/* =========================
                          END PACKAGE CARD TOP
                      ========================= */}
{/* =========================
    START PACKAGE DETAILS ROW
========================= */}

<div className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

  <div>
    <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
      Customer Label
    </label>

    <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700">
      {(item as any).customer_label || "N/A"}
    </div>
  </div>

  <div>
    <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
      Tracking
    </label>

    <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700">
      {item.tracking_number}
    </div>
  </div>

  <div>
    <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
      Uploaded
    </label>

    <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700">
      {item.created_at
        ? new Date(item.created_at).toLocaleDateString()
        : "N/A"}
    </div>
  </div>

  <div>
    <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
      Carrier
    </label>

    <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700">
      {(item as any).carrier || "N/A"}
    </div>
  </div>

</div>

{/* =========================
    END PACKAGE DETAILS ROW
========================= */}
                      {/* =========================
                          START PACKAGE STATUS FIELDS
                      ========================= */}
                      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
                            Store
                          </label>
                          <div className="rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700">
                            {item.store_name}
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
                            Status
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              updateStatus(
                                item.id,
                                e.target.value,
                                item.customer_id,
                                item.tracking_number
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 outline-none"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
                            Arrival Date
                          </label>
                          <input
                            type="date"
                            value={item.estimated_arrival || ""}
                            onChange={(e) =>
                              updateArrival(item.id, e.target.value)
                            }
                            className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#071D3A]">
                            Payment
                          </label>
                          <select
                            value={item.payment_status || "Unpaid"}
                            onChange={(e) =>
                              updateBilling(
                                item.id,
                                item.customer_id,
                                item.tracking_number,
                                "payment_status",
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 font-bold outline-none"
                          >
                            {paymentOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* =========================
                          END PACKAGE STATUS FIELDS
                      ========================= */}

                     {/* =========================
    START BILLING FIELDS
========================= */}

<div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-6">

  {/* WEIGHT */}
  <div>
    <label className="mb-2 block text-sm font-semibold">
      Weight (lbs)
    </label>

    <input
      type="number"
      defaultValue={item.weight_lbs || ""}
      placeholder="lbs"
      onBlur={(e) =>
        updateBilling(
          item.id,
          item.customer_id,
          item.tracking_number,
          "weight_lbs",
          e.target.value
        )
      }
      className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 outline-none"
    />
  </div>

  {/* ITEM VALUE */}
  <div>
    <label className="mb-2 block text-sm font-semibold">
      Item Value (EC$)
    </label>

    <input
      type="number"
      defaultValue={item.declared_value || ""}
      placeholder="EC$ value"
      onBlur={(e) =>
        updateBilling(
          item.id,
          item.customer_id,
          item.tracking_number,
          "declared_value",
          e.target.value
        )
      }
      className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 outline-none"
    />
  </div>

  {/* CATEGORY */}
  <div>
    <label className="mb-2 block text-sm font-semibold">
      Category
    </label>

    <select
      defaultValue={
        item.package_category || "General"
      }
      onChange={(e) =>
        updateBilling(
          item.id,
          item.customer_id,
          item.tracking_number,
          "package_category",
          e.target.value
        )
      }
      className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 outline-none"
    >
      <option value="General">
        General Item
      </option>

      <option value="Books">
        Books Only
      </option>
    </select>
  </div>

  {/* DISCOUNT */}
  <div>
    <label className="mb-2 block text-sm font-semibold">
      Discount
    </label>

    <input
      type="number"
      defaultValue={item.discount || ""}
      placeholder="0.00"
      onBlur={(e) =>
        updateBilling(
          item.id,
          item.customer_id,
          item.tracking_number,
          "discount",
          e.target.value
        )
      }
      className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 outline-none"
    />
  </div>

  {/* SHIPPING */}
  <div className="rounded-2xl bg-white p-4">
    <p className="text-sm text-slate-500">
      Shipping
    </p>

    <h3 className="mt-1 text-xl font-black text-[#071D3A]">
      EC$
      {Number(item.shipping_cost || 0).toFixed(2)}
    </h3>
  </div>

  {/* CUSTOMS */}
  <div className="rounded-2xl bg-white p-4">
    <p className="text-sm text-slate-500">
      Customs
    </p>

    <h3 className="mt-1 text-xl font-black text-[#071D3A]">
      EC$
      {Number(item.customs_cost || 0).toFixed(2)}
    </h3>
  </div>

  {/* TOTAL */}
  <div className="rounded-2xl bg-[#061B36] p-4 text-white md:col-span-2">
    <p className="text-sm text-white/60">
      Total Due
    </p>

    <h3 className="mt-1 text-2xl font-black">
      EC$
      {Number(item.total_due || 0).toFixed(2)}
    </h3>
  </div>

  {/* INVOICE BUTTON */}
  <div className="flex items-end md:col-span-2">
    <button
      onClick={() => generateInvoice(item)}
      className="h-12 w-full rounded-2xl bg-[#FC9700] px-5 text-sm font-black text-white transition hover:bg-[#e28700]"
    >
      Generate & Send Invoice
    </button>
  </div>

</div>

{/* =========================
    END BILLING FIELDS
========================= */}
                    </div>
                  ))
                )}
              </div>
              {/* =========================
                  END PACKAGE CARD LIST
              ========================= */}

              <p className="mt-6 text-sm text-slate-500">
                Tip: Enter billing values, then click outside each field to save.
              </p>
            </div>
            {/* =========================
                END PACKAGE MANAGEMENT
            ========================= */}
          </div>
          {/* =========================
              END PAGE CONTENT
          ========================= */}
        </div>
        {/* =========================
            END MAIN CONTENT AREA
        ========================= */}
      </div>
    </main>
  );
}