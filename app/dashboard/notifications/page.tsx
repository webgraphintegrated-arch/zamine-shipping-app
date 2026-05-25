"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CreditCard,
  History,
  LogOut,
  PackageCheck,
  Settings,
  Truck,
  Upload,
  User,
  Box,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  notification_type: string | null;
  is_read: boolean | null;
  created_at: string;
  package_id: string | null;
  customer_id: string;
};

export default function CustomerNotificationsPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [customerName, setCustomerName] = useState("Customer");
  const [customerId, setCustomerId] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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

      if (profile?.role === "warehouse_admin") {
        router.push("/admin/warehouse");
        return;
      }

      setCustomerId(user.id);
      setCustomerName(profile?.full_name || user.user_metadata?.full_name || "Customer");

      await fetchNotifications(user.id);

      setLoadingUser(false);
    }

    checkUser();
  }, [router]);

  async function fetchNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications((data || []) as NotificationItem[]);
  }

  async function markAsRead(notificationId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchNotifications(customerId);
  }

  async function markAllAsRead() {
    if (!customerId) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("customer_id", customerId)
      .eq("is_read", false);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchNotifications(customerId);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  const shipmentCount = useMemo(
    () => notifications.filter((item) => item.notification_type === "shipment").length,
    [notifications]
  );

  const paymentCount = useMemo(
    () => notifications.filter((item) => item.notification_type === "payment").length,
    [notifications]
  );

  const systemCount = useMemo(
    () => notifications.filter((item) => item.notification_type === "system").length,
    [notifications]
  );

  function getIcon(type: string | null) {
    if (type === "shipment") return Truck;
    if (type === "payment") return CreditCard;
    return AlertCircle;
  }

  function getTimeAgo(dateString: string) {
    const now = new Date().getTime();
    const date = new Date(dateString).getTime();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  if (loadingUser) {
    return (
      <main className={`${poppins.className} flex min-h-screen items-center justify-center bg-[#f5f9ff]`}>
        <p className="font-bold text-[#071D3A]">Loading notifications...</p>
      </main>
    );
  }

  return (
    <main className={`${poppins.className} min-h-screen bg-[#f5f9ff]`}>
      <div className="flex min-h-screen">
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
              const Icon = item.icon as any;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition ${
                    item.title === "Notifications"
                      ? "bg-[#FC9700] text-white"
                      : "hover:bg-white/10"
                  }`}
                >
                  <Icon size={22} />
                  <span className="font-semibold">{item.title}</span>
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

        <div className="flex-1">
          <header className="flex items-center justify-between border-b bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Welcome Back, {customerName}
              </p>

              <h1 className="text-3xl font-black text-[#071D3A]">
                Notifications
              </h1>
            </div>

            <button
              onClick={markAllAsRead}
              className="rounded-full bg-[#FC9700] px-5 py-3 text-sm font-black text-white"
            >
              Mark All Read
            </button>
          </header>

          <div className="flex justify-end bg-white px-6 py-3 lg:hidden">
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#FC9700] px-5 py-2 text-sm font-bold text-white"
            >
              Logout
            </button>
          </div>

          <section className="p-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Unread", unreadCount, Bell],
                ["Shipment", shipmentCount, Truck],
                ["Payment", paymentCount, CreditCard],
                ["System", systemCount, AlertCircle],
              ].map((item) => {
                const title = item[0] as string;
                const value = item[1] as number;
                const CardIcon = item[2] as any;

                return (
                  <div key={title} className="rounded-[28px] bg-white p-7 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">{title}</p>
                        <h2 className="mt-3 text-4xl font-black text-[#071D3A]">{value}</h2>
                      </div>

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3E3]">
                        <CardIcon className="text-[#FC9700]" size={30} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-[32px] bg-white p-7 shadow-lg">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Recent Notifications</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest shipment, billing and account updates.
                  </p>
                </div>

                <div className="rounded-full bg-[#FFF3E3] px-5 py-2 text-sm font-black text-[#FC9700]">
                  {notifications.length} Notifications
                </div>
              </div>

              <div className="space-y-5">
                {notifications.length === 0 ? (
                  <div className="rounded-2xl bg-[#f8fbff] px-6 py-10 text-center text-slate-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const NotificationIcon = getIcon(notification.notification_type) as any;

                    return (
                      <div
                        key={notification.id}
                        className={`rounded-3xl border p-6 transition ${
                          notification.is_read
                            ? "border-[#edf2f7] bg-[#f9fbff]"
                            : "border-[#FC9700]/30 bg-[#fff8f0]"
                        }`}
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex gap-5">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3E3]">
                              <NotificationIcon className="text-[#FC9700]" size={28} />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-xl font-bold text-[#071D3A]">
                                  {notification.title}
                                </h3>

                                {!notification.is_read && (
                                  <span className="rounded-full bg-[#FC9700] px-3 py-1 text-xs font-black text-white">
                                    NEW
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 max-w-3xl leading-7 text-slate-600">
                                {notification.message}
                              </p>

                              <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
                                <Bell size={15} />
                                {getTimeAgo(notification.created_at)}
                              </div>
                            </div>
                          </div>

                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-[#FC9700] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e28700]"
                            >
                              <CheckCircle2 size={18} />
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}