import { NextResponse } from 'next/server';
import { getUser, getCoachProfile, createCoachHire, getBalances, updateUserStats, listUserTribes } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientId, coachId, priceTc } = body;

    if (!clientId || !coachId) {
      return NextResponse.json({ error: 'Missing clientId or coachId' }, { status: 400 });
    }

    const client = await getUser(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const coachProfile = await getCoachProfile(coachId);
    if (!coachProfile || coachProfile.status !== 'active') {
      return NextResponse.json({ error: 'Coach not found or inactive' }, { status: 404 });
    }

    const basePrice = Number(priceTc) || coachProfile.pricing?.per_session || 15;

    const tribes = await listUserTribes(clientId);
    const inTribe = tribes.some(g => g.group_type === 'tribe');

    if (!inTribe) {
      return NextResponse.json({
        error: 'Coach access is exclusive to tribes',
        message: 'Upgrade your squad to a tribe to hire coaches!'
      }, { status: 403 });
    }

    const price = basePrice;
    const discountApplied = false;

    if ((client.wallet_balance_tc || 0) < price) {
      return NextResponse.json({
        error: 'Insufficient balance',
        required: price,
        available: client.wallet_balance_tc || 0
      }, { status: 400 });
    }

    await updateUserStats(clientId, { wallet_balance_tc: (client.wallet_balance_tc || 0) - price });
    const hire = await createCoachHire({ clientId, coachId, priceTc: price });
    const balances = await getBalances({ userId: clientId, groupId: client.group_id });

    return NextResponse.json({
      success: true,
      hire,
      balances,
      discountApplied,
      finalPrice: price,
      message: `Successfully hired ${coachProfile.name}!`
    }, { status: 201 });

  } catch (error) {
    console.error('Coach hire error:', error);
    return NextResponse.json({ error: error.message || 'Failed to hire coach' }, { status: 500 });
  }
}
