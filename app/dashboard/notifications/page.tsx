"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  History,
  Home,
  LogOut,
  Menu,
  PackageCheck,
  Settings,
  Truck,
  Upload,
  User,
  Warehouse,
  X,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function NotificationsDashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Package Ready For Pickup",
      message:
        "Your package ZSS12345 is ready for pickup at the warehouse.",
      type: "shipment",
      read: false,
      time: "5 mins ago",
    },
    {
      id: 2,
      title: "Invoice Approved",
      message:
        "Your uploaded invoice has been verified successfully.",
      type: "system",
      read: false,
      time: "15 mins ago",
    },
    {
      id: 3,
      title: "Payment Received",
      message:
        "Payment for invoice INV-2026-001 has been received.",
      type: "payment",
      read: true,
      time: "1 hour ago",
    },
    {
      id: 4,
      title: "Shipment Arrived",
      message:
        "AIR Shipment #AIR-2026-001 has arrived in Antigua.",
      type: "shipment",
      read: true,
      time: "2 hours ago",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const shipmentCount = notifications.filter(
    (n) => n.type === "shipment"
  ).length;
  const paymentCount = notifications.filter(
    (n) => n.type === "payment"
  ).length;
  const systemCount = notifications.filter(
    (n) => n.type === "system"
  ).length;

  function markAsRead(id: number) {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  }

  function markAllAsRead() {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
  }

  useEffect(() => {
    document.title = "Notifications Dashboard";
  }, []);

  return (
    <main
      className={`${poppins.className} min-h-screen bg-[#f5f9ff] text-[#071D3A]`}
    >
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`fixed left-0 top-0 z-50 h-screen w-[290px] overflow-y-auto bg-[#061B36] px-6 py-8 text-white transition-all duration-300 lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:static`}
        >
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-black">
              Zamine Dashboard
            </h2>

            <button
              onClick={() => setMenuOpen(false)}
              className="lg:hidden"
            >
              <X size={28} />
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Dashboard",
                icon: Home,
                href: "/dashboard",
              },
              {
                title: "Track Package",
                icon: PackageCheck,
                href: "/dashboard/track-package",
              },
              {
                title: "Billing",
                icon: CreditCard,
                href: "/dashboard/billing",
              },
              {
                title: "Upload Invoice",
                icon: Upload,
                href: "/dashboard/upload",
              },
              {
                title: "Warehouse",
                icon: Warehouse,
                href: "/dashboard/warehouse",
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
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition ${
                    item.title === "Notifications"
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

          <div className="mt-10 rounded-3xl bg-white/10 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FC9700]">
                <User size={26} />
              </div>

              <div>
                <h3 className="font-bold">
                  Customer Account
                </h3>

                <p className="text-sm text-white/70">
                  customer@zamine.com
                </p>
              </div>
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500 px-5 py-4 font-bold text-white transition hover:bg-red-600">
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="flex-1">
          {/* TOPBAR */}
          <header className="sticky top-0 z-40 border-b border-[#e5edf7] bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="rounded-xl bg-[#061B36] p-3 text-white lg:hidden"
                >
                  <Menu size={22} />
                </button>

                <div>
                  <h1 className="text-3xl font-black">
                    Notifications
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Shipment, billing and system updates.
                  </p>
                </div>
              </div>

              <button
                onClick={markAllAsRead}
                className="rounded-2xl bg-[#FC9700] px-6 py-3 font-bold text-white transition hover:bg-[#e28700]"
              >
                Mark All Read
              </button>
            </div>
          </header>

          {/* MAIN */}
          <section className="p-6">
            {/* SUMMARY CARDS */}
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
                  <div
                    key={title}
                    className="rounded-[28px] bg-white p-7 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          {title}
                        </p>

                        <h2 className="mt-3 text-4xl font-black text-[#071D3A]">
                          {value}
                        </h2>
                      </div>

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3E3]">
                        <CardIcon
                          className="text-[#FC9700]"
                          size={30}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* NOTIFICATIONS */}
            <div className="mt-10 rounded-[32px] bg-white p-7 shadow-lg">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">
                    Recent Notifications
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest shipment and billing activity.
                  </p>
                </div>

                <div className="rounded-full bg-[#FFF3E3] px-5 py-2 text-sm font-black text-[#FC9700]">
                  {notifications.length} Notifications
                </div>
              </div>

              <div className="space-y-5">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-3xl border p-6 transition ${
                      notification.read
                        ? "border-[#edf2f7] bg-[#f9fbff]"
                        : "border-[#FC9700]/30 bg-[#fff8f0]"
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-5">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                            notification.type === "shipment"
                              ? "bg-[#dff4ff]"
                              : notification.type === "payment"
                              ? "bg-[#fff3e3]"
                              : "bg-[#edf2f7]"
                          }`}
                        >
                          {notification.type === "shipment" ? (
                            <Truck
                              className="text-[#1587D4]"
                              size={28}
                            />
                          ) : notification.type === "payment" ? (
                            <CreditCard
                              className="text-[#FC9700]"
                              size={28}
                            />
                          ) : (
                            <AlertCircle
                              className="text-[#071D3A]"
                              size={28}
                            />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-bold text-[#071D3A]">
                              {notification.title}
                            </h3>

                            {!notification.read && (
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
                            {notification.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {!notification.read && (
                          <button
                            onClick={() =>
                              markAsRead(notification.id)
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#FC9700] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e28700]"
                          >
                            <CheckCircle2 size={18} />
                            Mark Read
                          </button>
                        )}

                        <button className="inline-flex items-center gap-2 rounded-2xl border border-[#dbe4f0] px-5 py-3 text-sm font-bold text-[#071D3A] transition hover:bg-[#f5f9ff]">
                          View Details
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}