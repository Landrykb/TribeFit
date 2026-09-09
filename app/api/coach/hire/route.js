import { NextResponse } from 'next/server';
import { getUser, getCoachProfile, createCoachHire, setBalances, getBalances, getGroup } from '../../_store/db';
import { runWithStore } from '@/app/api/_store/db';

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const body = await request.json();
    const { clientId, coachId, priceTc } = body;

    if (!clientId || !coachId) {
      return NextResponse.json({ error: 'Missing clientId or coachId' }, { status: 400 });
    }

    const client = getUser(clientId);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const coachProfile = getCoachProfile(coachId);
    if (!coachProfile || coachProfile.status !== 'active') {
      return NextResponse.json({ error: 'Coach not found or inactive' }, { status: 404 });
    }

    // Tiered coach pricing based on coach level (10-20 TC)
    let basePrice = Number(priceTc) || coachProfile.pricing?.per_session || 15; // Default: 15 TC
    
    // Check if client is in a tribe (required for coach access)
    let isInTribe = false;
    if (client.group_id) {
      const group = getGroup(client.group_id);
      isInTribe = group && (group.group_type === 'tribe' || group.type === 'tribe');
    }
    
    // Only tribes can access coaches
    if (!isInTribe) {
      return NextResponse.json({ 
        error: 'Coach access is exclusive to tribes',
        message: 'Upgrade your squad to a tribe to hire coaches!'
      }, { status: 403 });
    }
    
    const price = basePrice; // Tiered pricing already set by coach
    let discountApplied = false;

    // Check if client has enough balance
    if ((client.wallet_balance_tc || 0) < price) {
      return NextResponse.json({ 
        error: 'Insufficient balance',
        required: price,
        available: client.wallet_balance_tc || 0
      }, { status: 400 });
    }

    // Deduct from client
    const newBalance = (client.wallet_balance_tc || 0) - price;
    setBalances({
      userId: clientId,
      groupId: client.group_id,
      wallet: newBalance
    });

    // Create hire record
    const hire = createCoachHire({
      clientId,
      coachId,
      priceTc: price
    });

    // Get updated balances
    const balances = getBalances({ userId: clientId, groupId: client.group_id });

    return NextResponse.json({
      success: true,
      hire,
      balances,
      discountApplied,
      originalPrice: discountApplied ? basePrice : undefined,
      finalPrice: price,
      message: discountApplied 
        ? `Successfully hired ${coachProfile.name}! (Tribe discount applied: ${basePrice} TC → ${price} TC)`
        : `Successfully hired ${coachProfile.name}!`
    }, { status: 201 });
  } catch (error) {
    console.error('Coach hire error:', error);
    return NextResponse.json({ error: 'Failed to hire coach' }, { status: 500 });
  }
  });
}
