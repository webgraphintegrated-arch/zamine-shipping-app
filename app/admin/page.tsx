"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
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
      | "shipping_cost"
      | "customs_cost"
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
        field === "payment_status" ? value : value === "" ? null : Number(value),
    };

    const shippingCost = Number(updatedPackage.shipping_cost || 0);
    const customsCost = Number(updatedPackage.customs_cost || 0);
    const discount = Number(updatedPackage.discount || 0);
    const totalDue = shippingCost + customsCost - discount;

    const updatePayload = {
      [field]:
        field === "payment_status" ? value : value === "" ? null : Number(value),
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

    if (field === "payment_status") {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            customer_id: customerId,
            package_id: packageId,
            title: "Payment Status Updated",
            notification_type: "payment",
            message: `Your package (${trackingNumber}) payment status was updated to "${value}".`,
          },
        ]);

      if (notificationError) {
        alert(notificationError.message);
        return;
      }
    }

    await fetchPackages();
  }
  /* =========================
     END UPDATE BILLING
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
                      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                          <label className="mb-2 block text-sm font-semibold">
                            Weight
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

                        <div>
                          <label className="mb-2 block text-sm font-semibold">
                            Shipping Cost
                          </label>
                          <input
                            type="number"
                            defaultValue={item.shipping_cost || ""}
                            placeholder="0.00"
                            onBlur={(e) =>
                              updateBilling(
                                item.id,
                                item.customer_id,
                                item.tracking_number,
                                "shipping_cost",
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold">
                            Customs
                          </label>
                          <input
                            type="number"
                            defaultValue={item.customs_cost || ""}
                            placeholder="0.00"
                            onBlur={(e) =>
                              updateBilling(
                                item.id,
                                item.customer_id,
                                item.tracking_number,
                                "customs_cost",
                                e.target.value
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 outline-none"
                          />
                        </div>

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

                        <div className="rounded-2xl bg-[#061B36] p-4 text-white">
                          <p className="text-sm text-white/60">Total Due</p>
                          <h3 className="mt-1 text-2xl font-black">
                            EC${Number(item.total_due || 0).toFixed(2)}
                          </h3>
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