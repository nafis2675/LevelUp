// app/api/rules/[id]/route.ts - Rule Management API

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      name,
      eventType,
      xpAmount,
      cooldown,
      maxPerDay,
      isActive,
      conditions
    } = body;

    const rule = await prisma.xPRule.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(eventType && { eventType }),
        ...(xpAmount && { xpAmount }),
        ...(typeof cooldown === 'number' && { cooldown }),
        ...(typeof maxPerDay === 'number' && { maxPerDay }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(conditions !== undefined && { conditions })
      }
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json(
      { error: 'Failed to update rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.xPRule.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete rule' },
      { status: 500 }
    );
  }
}
