import { getSettings } from "@/lib/settings";
import { formatTaka } from "@/lib/format";

export const metadata = { title: "Shipping & Delivery" };

export default async function ShippingPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <header data-reveal>
        <p className="text-xs uppercase tracking-luxe text-gold-deep">Help</p>
        <h1 className="mt-2 font-display text-5xl">Shipping & Delivery</h1>
      </header>

      <div className="mt-8 space-y-6">
        <Block title="Delivery charges">
          <ul className="space-y-1.5">
            <li className="flex justify-between border-b border-line pb-1.5">
              <span>Inside Dhaka</span>
              <span className="font-medium">
                {formatTaka(s.deliveryInsideDhaka)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Outside Dhaka</span>
              <span className="font-medium">
                {formatTaka(s.deliveryOutsideDhaka)}
              </span>
            </li>
          </ul>
          {s.freeDeliveryThreshold && s.freeDeliveryThreshold > 0 ? (
            <p className="mt-3 text-sm text-success">
              Enjoy free delivery on orders over{" "}
              {formatTaka(s.freeDeliveryThreshold)}.
            </p>
          ) : null}
          <p className="mt-3 text-sm text-ink-mute">
            Selected items may ship free — look for the “Free delivery” badge.
          </p>
        </Block>

        <Block title="Delivery time">
          <p>
            Orders inside Dhaka are typically delivered within 1–3 working days.
            Outside Dhaka usually takes 3–5 working days. We&apos;ll call to
            confirm before dispatch.
          </p>
        </Block>

        <Block title="Payment">
          <p>
            We accept <strong>Cash on Delivery</strong> only. Pay the courier in
            cash when your order arrives — no advance payment required.
          </p>
        </Block>

        <Block title="Returns">
          <p>
            Not the right fit? You can return unworn items with tags within 7
            days of delivery. Reach us and we&apos;ll arrange it.
          </p>
        </Block>
      </div>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border border-line bg-paper p-6 text-sm leading-relaxed text-ink-soft"
      data-reveal
    >
      <h2 className="mb-3 font-display text-2xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
