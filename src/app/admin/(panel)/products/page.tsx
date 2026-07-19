import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { toProductDTO } from "@/lib/products";
import { formatTaka } from "@/lib/format";
import { PageHeader, Card, PrimaryLink } from "@/components/admin/ui";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { PlusIcon } from "@/components/ui/icons";

export default async function AdminProductsPage() {
  const rows = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  const products = rows.map(toProductDTO);

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} product${products.length === 1 ? "" : "s"}`}
        action={
          <PrimaryLink href="/admin/products/new">
            <PlusIcon className="h-4 w-4" /> Add product
          </PrimaryLink>
        }
      />

      {products.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <p className="font-display text-2xl">No products yet</p>
            <p className="mt-2 text-sm text-ink-soft">
              Add your first product to start selling.
            </p>
            <div className="mt-5 flex justify-center">
              <PrimaryLink href="/admin/products/new">
                <PlusIcon className="h-4 w-4" /> Add product
              </PrimaryLink>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-mute">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Tags</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-0 transition-colors hover:bg-sand/50"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                        {p.images[0] && (
                          <Image
                            src={p.images[0]}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="font-medium text-ink hover:text-gold-deep cursor-pointer"
                      >
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {p.categoryName ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-medium">
                      {formatTaka(p.effectivePrice)}
                    </span>
                    {p.discountPercent > 0 && (
                      <span className="ml-1 text-xs text-ink-mute line-through">
                        {formatTaka(p.price)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Tag on={!p.featured ? undefined : true} label="Featured" />
                      {p.freeDelivery && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
                          Free delivery
                        </span>
                      )}
                      {p.discountPercent > 0 && (
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-medium text-gold-deep">
                          −{p.discountPercent}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-sand hover:text-ink cursor-pointer"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

function Tag({ on, label }: { on?: boolean; label: string }) {
  if (!on) return null;
  return (
    <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-ink-soft">
      {label}
    </span>
  );
}
