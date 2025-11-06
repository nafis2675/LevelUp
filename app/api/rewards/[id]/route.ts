// app/api/rewards/[id]/route.ts - Reward Management API

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
      description,
      type,
      config,
      requiredLevel,
      requiredXP,
      requiredBadges,
      isActive,
      isRepeatable,
      cooldownDays
    } = body;

    const reward = await prisma.reward.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(type && { type }),
        ...(config && { config }),
        ...(requiredLevel !== undefined && { requiredLevel }),
        ...(requiredXP !== undefined && { requiredXP }),
        ...(requiredBadges !== undefined && { requiredBadges }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof isRepeatable === 'boolean' && { isRepeatable }),
        ...(typeof cooldownDays === 'number' && { cooldownDays })
      }
    });

    return NextResponse.json(reward);
  } catch (error) {
    console.error('Error updating reward:', error);
    return NextResponse.json(
      { error: 'Failed to update reward' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.reward.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reward:', error);
    return NextResponse.json(
      { error: 'Failed to delete reward' },
      { status: 500 }
    );
  }
}
