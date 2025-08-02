import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';

// Dummy query to validate credentials
const VALIDATION_QUERY = `query { shop { name } }`;

async function validateShopifyCredentials(domain: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${domain}/admin/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query: VALIDATION_QUERY }),
    });

    console.log(`Validating Shopify credentials for domain: ${response.ok}`);
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { shopifyDomain, shopifyToken } = await request.json();

    if (!shopifyDomain || !shopifyToken) {
        return NextResponse.json({ error: 'Domain and Token are required.' }, { status: 400 });
    }

    // Validate credentials before saving
    const isValid = await validateShopifyCredentials(shopifyDomain, shopifyToken);
    if (!isValid) {
        return NextResponse.json({ error: 'Invalid Shopify credentials. Please check your domain and token.' }, { status: 400 });
    }

    await prisma.organisation.update({
      where: { id: parseInt(session.user.id) },
      data: {
        shopifyDomain,
        shopifyToken,
      },
    });

    return NextResponse.json({ message: 'Shopify settings saved successfully.' });

  } catch (error: any) {
    console.error('Failed to save Shopify settings:', error);
    return NextResponse.json({ error: 'An error occurred while saving settings.' }, { status: 500 });
  }
}