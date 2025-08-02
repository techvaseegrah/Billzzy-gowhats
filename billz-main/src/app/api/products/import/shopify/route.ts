import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { importProductsFromShopify } from '@/lib/shopify';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const organisationId = parseInt(session.user.id);
    const { importedCount } = await importProductsFromShopify(organisationId);

    return NextResponse.json({ 
        message: `Successfully imported ${importedCount} new products.`,
        importedCount
    });

  } catch (error: any) {
    console.error('Shopify import error:', error);
    return NextResponse.json({ error: 'Failed to import products from Shopify.', details: error.message }, { status: 500 });
  }
}