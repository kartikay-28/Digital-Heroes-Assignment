export function generateRandomNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export function generateAlgorithmicNumbers(allUserScores: number[]): number[] {
  // Weights numbers by INVERSE frequency of user scores
  const frequencyMap = new Map<number, number>();
  for (let i = 1; i <= 45; i++) {
    frequencyMap.set(i, 0);
  }
  for (const score of allUserScores) {
    if (score >= 1 && score <= 45) {
      frequencyMap.set(score, frequencyMap.get(score)! + 1);
    }
  }

  const maxFreq = Math.max(...Array.from(frequencyMap.values()));
  
  // Calculate weights (inverse frequency)
  // We add 1 to the denominator to avoid division by zero and give unplayed numbers high chance
  const weights: { number: number; weight: number }[] = [];
  let totalWeight = 0;
  
  for (let i = 1; i <= 45; i++) {
    const freq = frequencyMap.get(i)!;
    // Numbers that appear less have higher weights
    const weight = (maxFreq - freq) + 1;
    weights.push({ number: i, weight });
    totalWeight += weight;
  }

  const result = new Set<number>();
  while (result.size < 5) {
    let randomVal = Math.random() * totalWeight;
    let selectedNum = 1;
    for (const item of weights) {
      randomVal -= item.weight;
      if (randomVal <= 0) {
        selectedNum = item.number;
        break;
      }
    }
    result.add(selectedNum);
  }

  return Array.from(result).sort((a, b) => a - b);
}

export function countMatches(entry: number[], drawn: number[]): number {
  return entry.filter(num => drawn.includes(num)).length;
}

export interface PrizeCalculation {
  tier5Pool: number;
  tier4Pool: number;
  tier3Pool: number;
  tier5PerWinner: number;
  tier4PerWinner: number;
  tier3PerWinner: number;
}

export function calculatePrizes(
  totalPool: number,
  jackpotAccumulated: number,
  tier5Count: number,
  tier4Count: number,
  tier3Count: number
): PrizeCalculation {
  const tier5Pool = (totalPool * 0.40) + jackpotAccumulated;
  const tier4Pool = totalPool * 0.35;
  const tier3Pool = totalPool * 0.25;

  return {
    tier5Pool,
    tier4Pool,
    tier3Pool,
    tier5PerWinner: tier5Count > 0 ? tier5Pool / tier5Count : 0,
    tier4PerWinner: tier4Count > 0 ? tier4Pool / tier4Count : 0,
    tier3PerWinner: tier3Count > 0 ? tier3Pool / tier3Count : 0,
  };
}

export function calculatePrizePool(subscriberCount: number, averageMonthlyRevenue: number): number {
  return subscriberCount * averageMonthlyRevenue * 0.6;
}

export interface DrawParams {
  subscriberCount: number;
  averageMonthlyRevenue: number;
  jackpotAccumulated: number;
  userEntries: { userId: string; numbers: number[] }[];
  drawType: "random" | "algorithm";
}

export interface DrawResult {
  drawnNumbers: number[];
  entries: { userId: string; numbers: number[]; matchCount: number; tier: number | null }[];
  winners: { userId: string; tier: number; prizeAmount: number }[];
  prizePool: number;
  prizes: PrizeCalculation;
  jackpotRolledOver: boolean;
}

export function runDraw(params: DrawParams): DrawResult {
  const { userEntries, drawType, subscriberCount, averageMonthlyRevenue, jackpotAccumulated } = params;

  let drawnNumbers: number[] = [];
  if (drawType === "algorithm") {
    const allScores = userEntries.flatMap(e => e.numbers);
    drawnNumbers = generateAlgorithmicNumbers(allScores);
  } else {
    drawnNumbers = generateRandomNumbers();
  }

  const entries = userEntries.map(e => {
    const matchCount = countMatches(e.numbers, drawnNumbers);
    let tier: number | null = null;
    if (matchCount === 3) tier = 3;
    if (matchCount === 4) tier = 4;
    if (matchCount === 5) tier = 5;

    return {
      userId: e.userId,
      numbers: e.numbers,
      matchCount,
      tier
    };
  });

  const tier5Count = entries.filter(e => e.tier === 5).length;
  const tier4Count = entries.filter(e => e.tier === 4).length;
  const tier3Count = entries.filter(e => e.tier === 3).length;

  const totalPool = calculatePrizePool(subscriberCount, averageMonthlyRevenue);
  const prizes = calculatePrizes(totalPool, jackpotAccumulated, tier5Count, tier4Count, tier3Count);

  const winners = entries
    .filter(e => e.tier !== null)
    .map(e => {
      let prizeAmount = 0;
      if (e.tier === 5) prizeAmount = prizes.tier5PerWinner;
      if (e.tier === 4) prizeAmount = prizes.tier4PerWinner;
      if (e.tier === 3) prizeAmount = prizes.tier3PerWinner;

      return {
        userId: e.userId,
        tier: e.tier as number,
        prizeAmount
      };
    });

  return {
    drawnNumbers,
    entries,
    winners,
    prizePool: totalPool,
    prizes,
    jackpotRolledOver: tier5Count === 0
  };
}