import Link from 'next/link';
import { formatINR } from '@/lib/currency';
import AddToCartButton from '@/components/shop/AddToCartButton';
import WishlistButton from '@/components/shop/WishlistButton';

export interface ProductCardProduct {
  id: string;
  slug: string;
  name: string;
  description?: string;
  price: number; // paise
  stock?: number;
  category?: string;
  images?: string; // JSON string array
}

export default function ProductCard({ product }: { product: ProductCardProduct }) {
  let imageUrl: string | undefined;
  try {
    const imgs = product.images ? JSON.parse(product.images) : [];
    imageUrl = Array.isArray(imgs) ? imgs[0] : undefined;
  } catch {
    imageUrl = undefined;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🌶️</div>
          )}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors"></div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold mb-1 line-clamp-1">{product.name}</h3>
        </Link>
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-semibold">{formatINR(product.price)}</span>
          <WishlistButton product={{
            id: product.id,
            name: product.name,
            price: product.price,
            slug: product.slug,
            images: product.images,
          }} />
        </div>
        <AddToCartButton id={product.id} name={product.name} price={product.price} className="w-full" />
      </div>
    </div>
  );
}
