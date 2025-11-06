// app/api/badges/[id]/route.ts - Badge Management API

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, description, imageUrl, rarity, requirement, isActive, isSecret } = body;

    const badge = await prisma.badge.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(imageUrl && { imageUrl }),
        ...(rarity && { rarity }),
        ...(requirement && { requirement }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof isSecret === 'boolean' && { isSecret })
      }
    });

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Error updating badge:', error);
    return NextResponse.json(
      { error: 'Failed to update badge' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.badge.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { error: 'Failed to delete badge' },
      { status: 500 }
    );
  }
}
