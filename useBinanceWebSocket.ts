'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_URL } from '@/lib/constants';
import { BinanceWsPayload, CandleData, ConnectionStatus } from '@/types/trading';

interface UseBinanceWsProps {
  onCandleUpdate?: (candle: CandleData) => void;
  onPriceUpdate?: (price: number) => void;
}

export function useBinanceWebSocket({ onCandleUpdate, onPriceUpdate }: UseBinanceWsProps) {
  const [status, setStatus] = useState<ConnectionStatus>('CONNECTING');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      setStatus('CONNECTING');
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('CONNECTED');
        retryCountRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const payload: BinanceWsPayload = JSON.parse(event.data);
          if (payload && payload.k) {
            const k = payload.k;
            const currentClose = parseFloat(k.c);

            const candle: CandleData = {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: currentClose,
              volume: parseFloat(k.v),
            };

            if (onCandleUpdate) onCandleUpdate(candle);
            if (onPriceUpdate) onPriceUpdate(currentClose);
          }
        } catch (err) {
          // Payload parse hatası
        }
      };

      ws.onclose = () => {
        setStatus('DISCONNECTED');
        // Exponential backoff reconnect
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 15000);
        retryCountRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoffDelay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setStatus('DISCONNECTED');
    }
  }, [onCandleUpdate, onPriceUpdate]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { status };
}