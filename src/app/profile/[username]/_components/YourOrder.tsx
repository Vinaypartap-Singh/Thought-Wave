import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";
import UpdateStatus from "./UpdateStatus";

export default function YourOrder({ products }: { products: any }) {
  const product = products?.products[0];

  return (
    <div>
      <div key={product.id}>
        <Image
          src={product.product.image}
          alt={"Product Image"}
          width={700}
          height={700}
          className="rounded-md object-cover w-full"
        />
        <div className="mt-3">
          <h3 className="font-bold text-sm">{product.name}</h3>
          <p className="text-primary text-sm">
            Status:{" "}
            {products.status.charAt(0).toUpperCase() +
              products.status.slice(1).toLowerCase()}
          </p>
          <p className="text-primary text-sm">
            Price: {formatPrice(product.price)}
          </p>
          {products.status === "PENDING" && (
            <UpdateStatus orderId={products.id} />
          )}
        </div>
      </div>
    </div>
  );
}
