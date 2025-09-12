import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can upgrade subscriptions
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can upgrade subscriptions' },
        { status: 403 }
      );
    }

    // Verify the tenant slug matches the user's tenant
    if (user.tenant.slug !== params.slug) {
      return NextResponse.json(
        { error: 'You can only upgrade your own tenant' },
        { status: 403 }
      );
    }

    // Update tenant to PRO plan
    const updatedTenant = await prisma.tenant.update({
      where: { slug: params.slug },
      data: { plan: 'PRO' },
    });

    return NextResponse.json({
      message: 'Tenant upgraded to Pro plan successfully',
      tenant: {
        id: updatedTenant.id,
        slug: updatedTenant.slug,
        name: updatedTenant.name,
        plan: updatedTenant.plan,
      },
    });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
