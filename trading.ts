export type OrderSide = 'BUY' | 'SELL';

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

export interface CandleData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradeRecord {
  id: string;
  timestamp: number;
  side: OrderSide;
  price: number;
  btcAmount: number;
  usdtAmount: number;
  fee: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface ChartMarker {
  time: number;
  position: 'aboveBar' | 'belowBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown';
  text: string;
}

export interface BinanceKlineRaw {
  t: number; // Kline start time
  T: number; // Kline close time
  s: string; // Symbol
  i: string; // Interval
  o: string; // Open price
  c: string; // Close price
  h: string; // High price
  l: string; // Low price
  v: string; // Base asset volume
  x: boolean; // Is this kline closed?
}

export interface BinanceWsPayload {
  e: string;
  E: number;
  s: string;
  k: BinanceKlineRaw;
}