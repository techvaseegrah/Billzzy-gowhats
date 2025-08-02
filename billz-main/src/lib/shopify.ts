import { prisma } from './prisma';
import { ShopifyProduct } from '@/types/shopify';
import { inspect } from 'util'; // For detailed server-side logging

const getProductsQuery = `
query getProducts($first: Int, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        title
        vendor
        productType
        variants(first: 100) {
          edges {
            node {
              sku
              price
              inventoryQuantity
              title
            }
          }
        }
      }
    }
  }
}
`;

interface ShopifyResponse {
  data: {
    products: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
      edges: {
        node: ShopifyProduct;
      }[];
    };
  };
}

/**
 * A reusable helper function to fetch all products from a Shopify store using the GraphQL API.
 * It handles pagination to ensure all products are retrieved.
 */
async function fetchAllShopifyProducts(domain: string, token: string): Promise<ShopifyProduct[]> {
  let allProducts: ShopifyProduct[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await fetch(`https://${domain}/admin/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query: getProductsQuery,
        variables: { first: 50, after: cursor },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Shopify API request failed: ${response.statusText}. Body: ${errorBody}`);
    }

    const jsonResponse: ShopifyResponse = await response.json();
    if (!jsonResponse.data || !jsonResponse.data.products) {
      throw new Error('Invalid Shopify API response structure');
    }

    const { products } = jsonResponse.data;
    allProducts = allProducts.concat(products.edges.map(edge => edge.node));
    hasNextPage = products.pageInfo.hasNextPage;
    cursor = products.pageInfo.endCursor;
  }

  return allProducts;
}

/**
 * Counts the total number of product variants in a Shopify store without importing them.
 * This is used for the progress bar calculation on the frontend.
 */
export async function countShopifyProducts(organisationId: number) {
  const organisation = await prisma.organisation.findUnique({
    where: { id: organisationId },
    select: { shopifyDomain: true, shopifyToken: true },
  });

  if (!organisation?.shopifyDomain || !organisation?.shopifyToken) {
    throw new Error('Shopify credentials are not configured.');
  }

  // Use the helper to get all products
  const shopifyProducts = await fetchAllShopifyProducts(organisation.shopifyDomain, organisation.shopifyToken);

  // Sum up the number of variants from all products
  const totalVariants = shopifyProducts.reduce((acc, product) => acc + product.variants.edges.length, 0);

  return { totalVariants };
}


/**
 * Imports products from Shopify into the local database for a given organisation.
 * Each product variant is treated as a separate product entry in the database.
 */
export async function importProductsFromShopify(organisationId: number) {
  const organisation = await prisma.organisation.findUnique({
    where: { id: organisationId },
    select: { shopifyDomain: true, shopifyToken: true },
  });

  if (!organisation?.shopifyDomain || !organisation?.shopifyToken) {
    throw new Error('Shopify credentials are not configured.');
  }

  // Use the helper to get all products
  const shopifyProducts = await fetchAllShopifyProducts(organisation.shopifyDomain, organisation.shopifyToken);

  let importedCount = 0;
  for (const product of shopifyProducts) {
    for (const variantEdge of product.variants.edges) {
      const variant = variantEdge.node;

      // Determine the final SKU and Name based on variant data
      let finalSku: string;
      let finalName: string;

      if (!variant.sku || variant.sku.trim() === '') {
        // If SKU is empty, generate it from product and variant titles
        finalSku = `${product.title}-${variant.title}`;
        finalName = finalSku;
      } else {
        // If SKU exists, use it and create a descriptive name
        finalSku = variant.sku;
        finalName = `${product.title} - ${variant.title}`;
      }
      
      // Check if a product with this SKU already exists for the organization
      const existingProduct = await prisma.product.findFirst({
        where: { SKU: finalSku, organisationId },
      });

      // If it exists, skip to the next variant
      if (existingProduct) {
        continue;
      }

      // Find or create the product category
      let categoryId: number | undefined;
      if (product.productType && product.productType.trim() !== "") {
        // **FIXED LOGIC**: Use findFirst and then create, which works without a @@unique constraint.
        let category = await prisma.productCategory.findFirst({
          where: {
            name: product.productType,
            organisationId: organisationId,
          }
        });

        if (!category) {
          category = await prisma.productCategory.create({
            data: {
              name: product.productType,
              organisationId: organisationId,
            }
          });
        }
        
        categoryId = category.id;
      }
      
      // Create the new product record in the database
      const newProduct = await prisma.product.create({
        data: {
          name: finalName,
          SKU: finalSku,
          netPrice: parseFloat(variant.price),
          sellingPrice: parseFloat(variant.price),
          quantity: variant.inventoryQuantity || 0,
          seller: product.vendor || 'Shopify',
          organisationId,
          categoryId,
        },
      });

      // Create a corresponding inventory record
      await prisma.inventory.create({
        data: {
            productId: newProduct.id,
            categoryId,
            organisationId,
            quantity: newProduct.quantity,
        }
      });

      importedCount++;
    }
  }

  return { importedCount };
}
