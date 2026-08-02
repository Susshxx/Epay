export type Donor = {
  id: string;
  name: string;
  message: string;
  avatarUrl: string;
  rating: number;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  message: string;
  amount: string;
};

export type ActivityLog = {
  id: string;
  amount: string;
  detail: string;
  isSpent?: boolean;
  createdAt?: number;
};

export type AdminNotification = {
  id: string;
  amount: number;
  donorName: string;
  message: string;
  timestamp: number;
};

export type PendingPayment = {
  id: string;
  amount: number;
  donorName: string;
  message: string;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
};

export type Tier = {
  level: number;
  name: string;
  goal: number;
  image: string;
  quote: string;
};