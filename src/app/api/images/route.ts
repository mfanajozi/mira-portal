import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const images = await DatabaseService.getImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await auth();
    if (!authResult?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, notes } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    if (!['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' }, 
        { status: 400 }
      );
    }

    await DatabaseService.updateStatus(
      'images', 
      id, 
      status as 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
      notes,
      authResult.userId
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating image status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}