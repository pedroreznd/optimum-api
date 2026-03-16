const timeframeConfig = {
  '1D': { resolution: '5', secondsPerPoint: 5 * 60, count: 78 },
  '1W': { resolution: '15', secondsPerPoint: 15 * 60, count: 130 },
  '1M': { resolution: '60', secondsPerPoint: 60 * 60, count: 360 },
  '3M': { resolution: 'D', secondsPerPoint: 24 * 60 * 60, count: 90 },
  '6M': { resolution: 'D', secondsPerPoint: 24 * 60 * 60, count: 180 },
  '1Y': { resolution: 'W', secondsPerPoint: 7 * 24 * 60 * 60, count: 52 },
  '5Y': { resolution: 'M', secondsPerPoint: 30 * 24 * 60 * 60, count: 60 },
} as const;

export type Timeframe = keyof typeof timeframeConfig;

export const getTimeframeParams = (
  timeframe: string,
): { resolution: string; from: number; to: number } => {
  const selected = timeframeConfig[timeframe as Timeframe] ?? timeframeConfig['3M'];
  const to = Math.floor(Date.now() / 1000);
  const from = to - selected.count * selected.secondsPerPoint;

  return {
    resolution: selected.resolution,
    from,
    to,
  };
};
