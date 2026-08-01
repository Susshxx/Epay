import type { ActivityLog, Donor, LeaderboardEntry, Tier } from '../types/epay';

export const activityLogs: ActivityLog[] = [];

export const leaderboard: LeaderboardEntry[] = [];

export const topDonor: Donor | null = null;

export const featuredDonor: Donor | null = null;

export const moneyStack = [
  {
    back: "/326-723.png",
    front: "/326-725.png"
  },
  {
    back: "/326-729.png",
    front: "/326-730.png"
  },
  {
    back: "/326-733.png",
    front: "/326-734.png"
  }
];

// Funding tiers: as total donations grow, the vessel "upgrades" and the
// goal, quote, and tier badge move on to the next level.
export const tiers: Tier[] = [
  {
    level: 1,
    name: 'Plastic Cup',
    goal: 10000,
    image: "/311-53.png",
    quote: 'Started with a crushed paper cup and high hopes.'
  },
  {
    level: 2,
    name: 'Metal Katori',
    goal: 20000,
    image: "/316-185.png",
    quote: 'Bought 2 cups of chai to power the coding session.'
  },
  {
    level: 3,
    name: 'Silver Katori',
    goal: 30000,
    image: "/316-243.png",
    quote: 'Saved enough to pay the internet bill so the app stays live.'
  },
  {
    level: 4,
    name: 'Brass Katori',
    goal: 50000,
    image: "/316-301.png",
    quote: 'Upgraded to brass — allegedly worth more than plastic.'
  },
  {
    level: 5,
    name: 'Finally Got a Phone',
    goal: 100000,
    image: "/316-363.png",
    quote: 'Finally got a phone. The struggle was worth it.'
  }
];

export const images = {
  logo: "/308-44.png",
  spentBill: "/326-737.png",
  dreamJar: "/312-55.png",
  coffeeCup: "/311-53.png",
  leaderboardPaper: "/315-84.png"
};
