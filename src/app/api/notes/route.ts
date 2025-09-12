import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all notes for the user's tenant
    const notes = await prisma.note.findMany({
      where: { tenantId: user.tenantId },
      include: { author: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Check subscription limits for FREE plan
    if (user.tenant.plan === 'FREE') {
      const noteCount = await prisma.note.count({
        where: { tenantId: user.tenantId },
      });

      if (noteCount >= 3) {
        return NextResponse.json(
          { error: 'Note limit reached. Upgrade to Pro plan for unlimited notes.' },
          { status: 403 }
        );
      }
    }

    // Create the note
    const note = await prisma.note.create({
      data: {
        title,
        content: content || '',
        tenantId: user.tenantId,
        authorId: user.id,
      },
      include: { author: { select: { email: true } } },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
