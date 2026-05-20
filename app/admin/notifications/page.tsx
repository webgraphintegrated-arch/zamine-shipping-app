"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type NotificationItem = {
  id: string;

  customer_id: string | null;

  package_id: string | null;

  title: string;

  message: string;

  notification_type: string | null;

  is_read: boolean | null;

  created_at: string;

  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export default function NotificationsPage() {
  /* =========================
     START STATE
  ========================= */

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  /* =========================
     END STATE
  ========================= */

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* =========================
     START FETCH NOTIFICATIONS
  ========================= */

  async function fetchNotifications() {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setNotifications(
      (data || []) as NotificationItem[]
    );

    setLoading(false);
  }

  /* =========================
     END FETCH NOTIFICATIONS
  ========================= */

  /* =========================
     START FILTERED DATA
  ========================= */

  const filteredNotifications =
    notifications.filter((item) => {
      const searchMatch = `
        ${item.title}
        ${item.message}
        ${item.notification_type}
        ${item.profiles?.full_name}
        ${item.profiles?.email}
      `
        .toLowerCase()
        .includes(search.toLowerCase());

      const filterMatch =
        filter === "ALL"
          ? true
          : item.notification_type ===
            filter;

      return searchMatch && filterMatch;
    });

  /* =========================
     END FILTERED DATA
  ========================= */

  /* =========================
     START SUMMARY
  ========================= */

  const unreadCount = useMemo(() => {
    return notifications.filter(
      (item) => !item.is_read
    ).length;
  }, [notifications]);

  const paymentNotifications =
    notifications.filter(
      (item) =>
        item.notification_type ===
        "payment"
    ).length;

  const shipmentNotifications =
    notifications.filter(
      (item) =>
        item.notification_type ===
        "shipment"
    ).length;

  const systemNotifications =
    notifications.filter(
      (item) =>
        item.notification_type ===
        "system"
    ).length;

  /* =========================
     END SUMMARY
  ========================= */

  /* =========================
     START MARK READ
  ========================= */

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchNotifications();
  }

  /* =========================
     END MARK READ
  ========================= */

  /* =========================
     START MARK ALL READ
  ========================= */

  async function markAllAsRead() {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("is_read", false);

    if (error) {
      alert(error.message);
      return;
    }

    fetchNotifications();
  }

  /* =========================
     END MARK ALL READ
  ========================= */

  /* =========================
     START DELETE
  ========================= */

  async function deleteNotification(
    id: string
  ) {
    const confirmDelete = confirm(
      "Delete notification?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchNotifications();
  }

  /* =========================
     END DELETE
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
            Notifications
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Notification Center
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={markAllAsRead}
            className="rounded-2xl bg-[#FC9700] px-6 py-3 font-black text-white"
          >
            Mark All Read
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

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Unread
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {unreadCount}
          </h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Payment
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {paymentNotifications}
          </h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Shipment
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {shipmentNotifications}
          </h2>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            System
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {systemNotifications}
          </h2>
        </div>
      </div>

      {/* =========================
          END SUMMARY
      ========================= */}

      {/* =========================
          START FILTERS
      ========================= */}

      <div className="mb-8 grid gap-4 rounded-[32px] bg-white p-6 shadow-sm md:grid-cols-[1fr_220px]">
        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search customer, title or message..."
          className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
        />

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
          className="h-14 rounded-2xl border border-[#dbe4f0] px-5 outline-none"
        >
          <option value="ALL">
            All Notifications
          </option>

          <option value="payment">
            Payment
          </option>

          <option value="shipment">
            Shipment
          </option>

          <option value="system">
            System
          </option>
        </select>
      </div>

      {/* =========================
          END FILTERS
      ========================= */}

      {/* =========================
          START NOTIFICATIONS
      ========================= */}

      {loading ? (
        <div className="rounded-[32px] bg-white p-10 text-center font-bold">
          Loading notifications...
        </div>
      ) : filteredNotifications.length ===
        0 ? (
        <div className="rounded-[32px] bg-white p-10 text-center font-bold">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredNotifications.map(
            (item) => (
              <div
                key={item.id}
                className={`rounded-[32px] p-6 shadow-sm ${
                  item.is_read
                    ? "bg-white"
                    : "bg-[#FFF8ED]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FC9700]">
                        {item.notification_type ||
                          "General"}
                      </p>

                      {!item.is_read && (
                        <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                          UNREAD
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-2xl font-black">
                      {item.title}
                    </h2>

                    <p className="mt-3 max-w-3xl text-slate-600">
                      {item.message}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-6 text-sm font-semibold text-slate-500">
                      <span>
                        Customer:
                        {" "}
                        {item.profiles
                          ?.full_name ||
                          "Unknown"}
                      </span>

                      <span>
                        Email:
                        {" "}
                        {item.profiles
                          ?.email || "N/A"}
                      </span>

                      <span>
                        {new Date(
                          item.created_at
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {!item.is_read && (
                      <button
                        onClick={() =>
                          markAsRead(
                            item.id
                          )
                        }
                        className="rounded-2xl bg-[#061B36] px-5 py-3 text-sm font-black text-white"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteNotification(
                          item.id
                        )
                      }
                      className="rounded-2xl bg-red-100 px-5 py-3 text-sm font-black text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* =========================
          END NOTIFICATIONS
      ========================= */}
    </main>
  );
}