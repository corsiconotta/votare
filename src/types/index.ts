// MP Types
export enum Chamber {
  DEPUTIES = 'DEPUTIES',
  SENATE = 'SENATE',
}

export enum VotePosition {
  FOR = 'FOR',
  AGAINST = 'AGAINST',
  ABSTAIN = 'ABSTAIN',
  ABSENT = 'ABSENT',
}

export interface MP {
  id: string;
  name: string;
  party: string;
  chamber: Chamber;
  region: string;
  imageUrl?: string;
  bio?: string;
  contactEmail?: string;
}

// Vote Types
export interface Vote {
  id: string;
  title: string;
  description: string;
  chamber: Chamber;
  date: string; // ISO format
  topics: string[];
  result: string;
  totalFor: number;
  totalAgainst: number;
  totalAbstain: number;
  totalAbsent: number;
}

// Vote Record Types
export interface VoteRecord {
  id: string;
  mpId: string;
  voteId: string;
  position: VotePosition;
}

// User Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor';
}