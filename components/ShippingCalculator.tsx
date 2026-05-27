"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, AlertTriangle, ArrowRight } from "lucide-react";

export default function ShippingCalculator() {
  const [method, setMethod] = useState("AIR");
  const [weight, setWeight] = useState("");
  const [itemValue, setItemValue] = useState("");

  const estimate = useMemo(() => {
  const packageWeight = Number(weight || 0);
  const value = Number(itemValue || 0);

  const airRate = 10;
  const seaRate = 6;

  const shippingRate =
    method === "AIR" ? airRate : seaRate;

  const shippingEstimate =
    packageWeight * shippingRate;

  let customsEstimate = 0;

  // No customs under EC$20
  if (value >= 20) {
    customsEstimate = value * 0.515;
  }

  const totalEstimate =
    shippingEstimate + customsEstimate;

  return {
    shippingEstimate,
    customsEstimate,
    totalEstimate,
  };
}, [method, weight, itemValue]);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-[34px] bg-[#f5f9ff] p-8 shadow-xl md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#FC9700] shadow-sm">
                <Calculator size={18} />
                Shipping Estimate Calculator
              </div>

              <h2 className="mt-5 text-4xl font-black text-[#071D3A] md:text-5xl">
                Get An Estimated Shipping Range
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                Use this calculator to get a general idea of your possible shipping cost before your package arrives.
              </p>

              <div className="mt-7 rounded-2xl border-2 border-[#FC9700] bg-white p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 shrink-0 text-[#FC9700]" size={24} />

                  <p className="text-sm font-bold leading-7 text-[#071D3A]">
                    IMPORTANT: This calculator provides a general estimate only. Final charges may change after your package reaches the warehouse and is weighed with its actual packaging, dimensions, and carrier materials. Amazon and other retailers may package items differently than expected. Customs charges are estimated at 51.5% for applicable items. No customs charges apply to items under EC$20 or books shipped by themselves. If books are shipped together with taxable items, customs exemptions may not apply..
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-7 shadow-lg">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#071D3A]">
                    Shipping Method
                  </label>

                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#1587D4]"
                  >
                    <option value="AIR">Air Freight</option>
                    <option value="SEA">Sea Freight</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#071D3A]">
                    Estimated Weight (lbs)
                  </label>

                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Example: 5"
                    className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#1587D4]"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-[#071D3A]">
                  Estimated Item Value (EC$)
                </label>

                <input
                  type="number"
                  value={itemValue}
                  onChange={(e) => setItemValue(e.target.value)}
                  placeholder="Example: 250"
                  className="h-14 w-full rounded-2xl border border-[#dbe4f0] px-5 outline-none focus:border-[#1587D4]"
                />
              </div>

              <div className="mt-7 space-y-4 rounded-2xl bg-[#061B36] p-6 text-white">
                <div className="flex justify-between gap-4">
                  <span className="text-white/70">Estimated Shipping</span>
                  <strong>EC${estimate.shippingEstimate.toFixed(2)}</strong>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-white/70">Estimated Customs</span>
                  <strong>EC${estimate.customsEstimate.toFixed(2)}</strong>
                </div>

                

                <div className="border-t border-white/15 pt-4">
                  <div className="flex justify-between gap-4 text-xl">
                    <span className="font-black">Estimated Total</span>
                    <strong className="text-[#FC9700]">
                      EC${estimate.totalEstimate.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FC9700] px-6 py-3 font-bold text-white transition hover:bg-[#e28700]"
                >
                  Create Account
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-[#dbe4f0] px-6 py-3 font-bold text-[#071D3A]"
                >
                  Upload Invoice
                </Link>
              </div>

              <p className="mt-5 text-xs font-semibold leading-6 text-slate-500">
                Rates shown here are for estimate purposes only and may be adjusted by Zamine Shipping Services after warehouse verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}