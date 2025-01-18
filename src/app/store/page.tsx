import { getAllProducts } from "@/actions/store.action";
import { getDbUserID } from "@/actions/user.action";
import { formatPrice } from "@/utils/formatPrice";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import DeleteButton from "./_components/DeleteButton";
import PlaceOrderButton from "./_components/PlaceOrder";

export default async function store() {
  const { userId } = await auth();
  const products = await getAllProducts();
  const dbUserId = await getDbUserID();

  return (
    <div>
      <div className="space-y-6 flex gap-4">
        {products?.length > 0 ? (
          products.map((product: any) => (
            <div key={product.id} className="w-1/2 flex flex-col gap-4">
              <Image
                src={product.image}
                alt={product.name}
                width={700}
                height={700}
                className="rounded-md object-cover w-full"
              />
              <div>
                <h3 className="font-bold text-sm">{product.name}</h3>
                <p className="text-primary text-sm">
                  Price: {formatPrice(product.price)}
                </p>
                <div className="grid grid-cols-2 gap-x-2 mt-3">
                  {product.userId === userId && (
                    <DeleteButton productId={product.id} />
                  )}
                  <PlaceOrderButton
                    userId={dbUserId!}
                    storeId={product.storeId}
                    productId={product.id}
                    quantity={1}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">
            No products available yet. Start adding products to showcase your
            store's offerings!
          </p>
        )}
      </div>
    </div>
  );
}
