import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(
      'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=150',
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BitFlow-Paper/1.0',
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Binance Gateway error: ${res.statusText}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Map Binance array format to Lightweight Charts format
    // [openTime, open, high, low, close, volume, ...]
    const candles = data.map((item: any[]) => ({
      time: Math.floor(Number(item[0]) / 1000),
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    }));

    return NextResponse.json(candles);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch klines from upstream' },
      { status: 502 }
    );
  }
}