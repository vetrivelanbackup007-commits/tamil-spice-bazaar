export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};
