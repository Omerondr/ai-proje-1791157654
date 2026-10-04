import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TradeRecord, ChartMarker, OrderSide } from '@/types/trading';
import { INITIAL_USDT, INITIAL_BTC, DEFAULT_FEE_RATE } from '@/lib/constants';
import { calculateBuy, calculateSell } from '@/lib/calculations';

interface TradingStoreState {
  usdtBalance: number;
  btcBalance: number;
  currentPrice: number;
  priceDirection: 'up' | 'down' | 'neutral';
  trades: TradeRecord[];
  markers: ChartMarker[];
  averageBuyPrice: number;

  setCurrentPrice: (price: number) => void;
  executeOrder: (side: OrderSide, rawAmount: number) => { success: boolean; message: string };
  resetAccount: () => void;
  clearHistoryOnly: () => void;
}

export const useTradingStore = create<TradingStoreState>()(
  persist(
    (set, get) => ({
      usdtBalance: INITIAL_USDT,
      btcBalance: INITIAL_BTC,
      currentPrice: 0,
      priceDirection: 'neutral',
      trades: [],
      markers: [],
      averageBuyPrice: 0,

      setCurrentPrice: (newPrice: number) => {
        const prevPrice = get().currentPrice;
        let dir: 'up' | 'down' | 'neutral' = 'neutral';
        if (prevPrice > 0) {
          if (newPrice > prevPrice) dir = 'up';
          else if (newPrice < prevPrice) dir = 'down';
        }
        set({ currentPrice: newPrice, priceDirection: dir });
      },

      executeOrder: (side: OrderSide, rawAmount: number) => {
        const { usdtBalance, btcBalance, currentPrice, trades, markers, averageBuyPrice } = get();

        if (currentPrice <= 0) {
          return { success: false, message: 'Canlı fiyat akışı bekleniyor...' };
        }

        const nowSeconds = Math.floor(Date.now() / 1000);
        const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        if (side === 'BUY') {
          if (rawAmount <= 0) return { success: false, message: 'Geçersiz USDT tutarı.' };
          if (rawAmount > usdtBalance) {
            return { success: false, message: 'Yetersiz USDT bakiyesi.' };
          }

          const { netBtc, feeInUsdt, totalCostUsdt } = calculateBuy(rawAmount, currentPrice, DEFAULT_FEE_RATE);
          if (netBtc <= 0) return { success: false, message: 'Alınan miktar çok küçük.' };

          // Yeni ortalama alış fiyatını hesapla (Weighted Average)
          const currentTotalCost = btcBalance * averageBuyPrice;
          const newTotalCost = currentTotalCost + totalCostUsdt;
          const newTotalBtc = btcBalance + netBtc;
          const newAvgPrice = newTotalBtc > 0 ? newTotalCost / newTotalBtc : currentPrice;

          const trade: TradeRecord = {
            id: orderId,
            timestamp: Date.now(),
            side: 'BUY',
            price: currentPrice,
            btcAmount: netBtc,
            usdtAmount: totalCostUsdt,
            fee: feeInUsdt,
          };

          const marker: ChartMarker = {
            time: nowSeconds,
            position: 'belowBar',
            color: '#10B981',
            shape: 'arrowUp',
            text: `AL: ${netBtc.toFixed(4)} BTC`,
          };

          set({
            usdtBalance: Number((usdtBalance - totalCostUsdt).toFixed(2)),
            btcBalance: Number((btcBalance + netBtc).toFixed(8)),
            averageBuyPrice: newAvgPrice,
            trades: [trade, ...trades],
            markers: [...markers, marker],
          });

          return { success: true, message: `Alış Başarılı: ${netBtc.toFixed(6)} BTC alındı.` };
        } else {
          // SATIŞ
          if (rawAmount <= 0) return { success: false, message: 'Geçersiz BTC miktarı.' };
          if (rawAmount > btcBalance) {
            return { success: false, message: 'Yetersiz BTC bakiyesi.' };
          }

          const { grossUsdt, netUsdt, feeInUsdt } = calculateSell(rawAmount, currentPrice, DEFAULT_FEE_RATE);
          
          // Kâr/Zarar Hesabı (PnL)
          const costBasis = rawAmount * (averageBuyPrice || currentPrice);
          const pnl = Number((netUsdt - costBasis).toFixed(2));
          const pnlPercent = costBasis > 0 ? Number(((pnl / costBasis) * 100).toFixed(2)) : 0;

          const newBtcBalance = Number((btcBalance - rawAmount).toFixed(8));

          const trade: TradeRecord = {
            id: orderId,
            timestamp: Date.now(),
            side: 'SELL',
            price: currentPrice,
            btcAmount: rawAmount,
            usdtAmount: netUsdt,
            fee: feeInUsdt,
            pnl,
            pnlPercent,
          };

          const marker: ChartMarker = {
            time: nowSeconds,
            position: 'aboveBar',
            color: '#EF4444',
            shape: 'arrowDown',
            text: `SAT: ${rawAmount.toFixed(4)} BTC`,
          };

          set({
            usdtBalance: Number((usdtBalance + netUsdt).toFixed(2)),
            btcBalance: newBtcBalance < 0.00000001 ? 0 : newBtcBalance,
            averageBuyPrice: newBtcBalance === 0 ? 0 : averageBuyPrice,
            trades: [trade, ...trades],
            markers: [...markers, marker],
          });

          return { success: true, message: `Satış Başarılı: ${netUsdt.toFixed(2)} USDT hesaba eklendi.` };
        }
      },

      resetAccount: () => {
        set({
          usdtBalance: INITIAL_USDT,
          btcBalance: INITIAL_BTC,
          trades: [],
          markers: [],
          averageBuyPrice: 0,
        });
      },

      clearHistoryOnly: () => {
        set({
          trades: [],
          markers: [],
        });
      },
    }),
    {
      name: 'bitflow_portfolio_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usdtBalance: state.usdtBalance,
        btcBalance: state.btcBalance,
        trades: state.trades,
        markers: state.markers,
        averageBuyPrice: state.averageBuyPrice,
      }),
    }
  )
);