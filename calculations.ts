import BigNumber from 'bignumber.js';

export function calculateBuy(
  usdtAmount: number,
  btcPrice: number,
  feeRate: number = 0.001
): { netBtc: number; feeInUsdt: number; totalCostUsdt: number } {
  const usdt = new BigNumber(usdtAmount);
  const price = new BigNumber(btcPrice);
  const feeR = new BigNumber(feeRate);

  if (usdt.isNaN() || price.isZero() || usdt.isLessThanOrEqualTo(0)) {
    return { netBtc: 0, feeInUsdt: 0, totalCostUsdt: 0 };
  }

  const feeInUsdt = usdt.multipliedBy(feeR);
  const netSpend = usdt.minus(feeInUsdt);
  const netBtc = netSpend.dividedBy(price);

  return {
    netBtc: Number(netBtc.toFixed(8, BigNumber.ROUND_DOWN)),
    feeInUsdt: Number(feeInUsdt.toFixed(4, BigNumber.ROUND_HALF_UP)),
    totalCostUsdt: Number(usdt.toFixed(2, BigNumber.ROUND_HALF_UP)),
  };
}

export function calculateSell(
  btcAmount: number,
  btcPrice: number,
  feeRate: number = 0.001
): { grossUsdt: number; netUsdt: number; feeInUsdt: number } {
  const btc = new BigNumber(btcAmount);
  const price = new BigNumber(btcPrice);
  const feeR = new BigNumber(feeRate);

  if (btc.isNaN() || btc.isLessThanOrEqualTo(0) || price.isLessThanOrEqualTo(0)) {
    return { grossUsdt: 0, netUsdt: 0, feeInUsdt: 0 };
  }

  const grossUsdt = btc.multipliedBy(price);
  const feeInUsdt = grossUsdt.multipliedBy(feeR);
  const netUsdt = grossUsdt.minus(feeInUsdt);

  return {
    grossUsdt: Number(grossUsdt.toFixed(2, BigNumber.ROUND_HALF_UP)),
    netUsdt: Number(netUsdt.toFixed(2, BigNumber.ROUND_HALF_UP)),
    feeInUsdt: Number(feeInUsdt.toFixed(4, BigNumber.ROUND_HALF_UP)),
  };
}

export function calculateNetWorth(
  usdtBalance: number,
  btcBalance: number,
  currentPrice: number
): number {
  const usdt = new BigNumber(usdtBalance || 0);
  const btc = new BigNumber(btcBalance || 0);
  const price = new BigNumber(currentPrice || 0);

  const btcValue = btc.multipliedBy(price);
  const total = usdt.plus(btcValue);

  return Number(total.toFixed(2, BigNumber.ROUND_HALF_UP));
}