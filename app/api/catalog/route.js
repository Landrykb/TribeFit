export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Mock catalog items (in production, this would fetch from database)
    const mockCatalogItems = [
      {
        id: '1',
        name: 'Resistance Bands Set',
        price_tc: 150,
        category: 'equipment',
        description: 'Professional resistance bands with multiple resistance levels for full-body workouts',
        specs: {
          colors: ['red', 'blue', 'green'],
          resistance: ['light', 'medium', 'heavy']
        },
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        in_stock: true
      },
      {
        id: '2',
        name: 'Yoga Mat Premium',
        price_tc: 120,
        category: 'equipment',
        description: 'Non-slip premium yoga mat with superior cushioning and durability',
        specs: {
          colors: ['purple', 'blue', 'black'],
          thickness: ['4mm', '6mm']
        },
        image_url: 'https://images.unsplash.com/photo-1506629905427-4d4f5f8eff60?w=400',
        in_stock: true
      },
      {
        id: '3',
        name: 'Protein Powder',
        price_tc: 200,
        category: 'nutrition',
        description: 'Whey protein powder for optimal muscle recovery and growth',
        specs: {
          flavors: ['vanilla', 'chocolate', 'strawberry'],
          size: ['1kg', '2kg']
        },
        image_url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
        in_stock: true
      },
      {
        id: '4',
        name: 'Dumbbells Set',
        price_tc: 300,
        category: 'equipment',
        description: 'Adjustable dumbbells perfect for home workouts',
        specs: {
          weight: ['10kg', '15kg', '20kg'],
          material: ['rubber', 'iron']
        },
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        in_stock: true
      },
      {
        id: '5',
        name: 'Pre-Workout Boost',
        price_tc: 80,
        category: 'nutrition',
        description: 'Natural energy booster for intense workout sessions',
        specs: {
          flavors: ['citrus', 'berry', 'tropical'],
          caffeine: ['normal', 'high']
        },
        image_url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
        in_stock: true
      },
      {
        id: '6',
        name: 'Foam Roller',
        price_tc: 90,
        category: 'equipment',
        description: 'High-density foam roller for muscle recovery and flexibility',
        specs: {
          size: ['small', 'large'],
          density: ['soft', 'firm']
        },
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        in_stock: true
      }
    ];

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let filteredItems = mockCatalogItems;
    if (category) {
      filteredItems = mockCatalogItems.filter(item => item.category === category);
    }

    return NextResponse.json({
      success: true,
      items: filteredItems,
      categories: ['equipment', 'nutrition'],
      total: filteredItems.length
    });

  } catch (error) {
    console.error('Catalog fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}