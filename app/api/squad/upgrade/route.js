import { NextResponse } from 'next/server';
import { getDB, saveDB } from '../../_store/db';
import { runWithStore } from '@/app/api/_store/db';

export async function POST(request) {
  return runWithStore(async () => {
  try {
    const { squadId, upgradedBy } = await request.json();

    // Validate required fields
    if (!squadId || !upgradedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: squadId and upgradedBy' },
        { status: 400 }
      );
    }

    // Actually update the squad to tribe in the database
    const db = getDB();
    
    // Find the squad in groups (groups is an object, not array)
    let squad = null;
    
    if (db.groups && typeof db.groups === 'object') {
      // Groups is stored as object with IDs as keys
      squad = db.groups[squadId];
    }
    
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found', squadId, available: Object.keys(db.groups || {}) },
        { status: 404 }
      );
    }
    
    // Update squad to tribe
    squad.group_type = 'tribe';
    squad.type = 'tribe'; // Some places use 'type'
    squad.upgraded_at = new Date().toISOString();
    squad.upgraded_by = upgradedBy;
    
    // Update max members for tribe
    squad.max_members = 15;
    
    // Save changes - update global DB first
    if (globalThis.__DB__ && globalThis.__DB__.groups) {
      globalThis.__DB__.groups[squadId] = squad;
    }
    
    saveDB(db);

    const mockUpgradeResponse = {
      success: true,
      message: 'Squad successfully upgraded to Tribe!',
      upgradedSquad: {
        id: squadId,
        previousType: 'squad',
        newType: 'tribe',
        upgradedAt: squad.upgraded_at,
        upgradedBy: upgradedBy,
        bonusRewards: {
          bonusTC: 0, // No TC bonus - sustainable model
          newFeatures: ['Tribe voting', 'Advanced challenges', 'Verified badge'],
          memberBenefits: 'All members get tribe perks'
        }
      },
      celebration: {
        title: 'Tribe Upgrade Complete! 🏆',
        message: 'Your squad has evolved into a mighty tribe! Unlock new features and lead your community to greatness.',
        effects: ['confetti', 'fanfare', 'tribal_horn']
      }
    };

    return NextResponse.json(mockUpgradeResponse, { status: 200 });

  } catch (error) {
    console.error('Squad upgrade error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upgrade squad to tribe',
        details: error.message 
      },
      { status: 500 }
    );
  }
  });
}

export async function GET(request) {
  return runWithStore(async () => {
  try {
    // Get upgrade requirements and eligibility info
    const upgradeInfo = {
      requirements: {
        minimumStreakDays: 30,
        minimumParticipationRate: 70,
        minimumMembers: 3,
        ownershipRequired: true
      },
      benefits: {
        customization: 'Custom logos and themes',
        governance: 'Democratic voting system',
        rewards: '500 TC upgrade bonus + member rewards',
        features: 'Advanced challenges and tribe-specific goals'
      },
      process: [
        'Verify squad meets all requirements',
        'Confirm upgrade with squad members',
        'Transform squad data to tribe format',
        'Award upgrade bonuses to all members',
        'Enable tribe-specific features'
      ]
    };

    return NextResponse.json(upgradeInfo, { status: 200 });

  } catch (error) {
    console.error('Squad upgrade info error:', error);
    return NextResponse.json(
      { error: 'Failed to get upgrade information' },
      { status: 500 }
    );
  }
  });
}