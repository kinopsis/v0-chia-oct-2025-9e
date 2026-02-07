import { NextResponse } from 'next/server';

export async function POST() {
    // Silent success for the chat widget's external analytics
    return NextResponse.json({ success: true }, { status: 200 });
}
