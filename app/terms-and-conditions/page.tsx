export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20 text-[#071D3A]">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-black">
          Terms & Conditions
        </h1>

        <div className="mt-12 space-y-10">

          <section>
            <h2 className="text-2xl font-black">
              Shipping Estimates
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Shipping calculator estimates provided on this website are for general guidance only. Final charges may vary after packages are received, weighed, measured, inspected, and processed by the warehouse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              Customs Charges
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Customs fees may apply depending on item value, category, packaging, and shipment contents. Customs exemptions for books may not apply if shipped together with taxable items.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              Customer Responsibility
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Customers are responsible for providing accurate shipping details, invoices, contact information, and package documentation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              Package Processing
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Processing and delivery times may vary depending on shipment volume, customs inspections, weather conditions, and carrier delays.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              Restricted Items
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Customers must not ship prohibited, illegal, hazardous, or restricted items through Zamine Shipping Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              Payments
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Outstanding balances must be settled before packages are released for pickup or delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black">
              Changes To Terms
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Zamine Shipping Services reserves the right to update these terms at any time without prior notice.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}