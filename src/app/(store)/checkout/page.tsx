import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-luxe text-gold-deep">
          Almost there
        </p>
        <h1 className="mt-2 font-display text-5xl">Checkout</h1>
      </header>
      <CheckoutForm settings={settings} />
    </div>
  );
}
