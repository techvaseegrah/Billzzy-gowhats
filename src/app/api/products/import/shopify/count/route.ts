import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { countShopifyProducts } from '@/lib/shopify';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const organisationId = parseInt(session.user.id);
    const { totalVariants } = await countShopifyProducts(organisationId);

    return NextResponse.json({ totalVariants });

  } catch (error: any) {
    console.error('Shopify count error:', error);
    return NextResponse.json({ error: 'Failed to count products from Shopify.', details: error.message }, { status: 500 });
  }
}
