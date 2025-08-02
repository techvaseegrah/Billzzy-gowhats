export interface ShopifyProductVariant {
  sku: string;
  price: string;
  inventoryQuantity: number;
  title: string;
}

export interface ShopifyProduct {
  title: string;
  vendor: string;
  productType: string;
  variants: {
    edges: {
      node: ShopifyProductVariant;
    }[];
  };
}