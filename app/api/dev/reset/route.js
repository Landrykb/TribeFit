import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // Delete the persisted database file (correct path)
    const dbPath = path.join(process.cwd(), '.data', 'db.json');
    
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    
    // Clear the global database
    if (globalThis.__DB__) {
      delete globalThis.__DB__;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database reset to clean state. Refresh page to see changes.' 
    });
  } catch (error) {
    console.error('Reset failed:', error);
    return NextResponse.json({ 
      error: 'Failed to reset database',
      message: error.message 
    }, { status: 500 });
  }
}
