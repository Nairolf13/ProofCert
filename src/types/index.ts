export interface User {
  id: string;
  email: string;
  username: string;
  address?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  role?: 'OWNER' | 'TENANT' | 'ADMIN';
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  propertyId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  user?: User;
  property?: Property;
  createdAt: string;
}

export interface Proof {
  id: string;
  title?: string;
  content?: string;
  contentType: ProofType;
  hash: string;
  ipfsHash?: string;
  arweaveId?: string;
  timestamp: string;
  location?: string;
  isPublic: boolean;
  shareToken: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  transactionHash?: string;
  deletedAt?: string | null;
}

export const ProofType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  DOCUMENT: 'DOCUMENT'
} as const;

export type ProofType = typeof ProofType[keyof typeof ProofType];

export interface CreateProofRequest {
  title?: string;
  content?: string;
  contentType: ProofType;
  file?: File;
  location?: string;
  isPublic?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface ShareableProof {
  id: string;
  title?: string;
  hash: string;
  timestamp: string;
  contentType: ProofType;
  isPublic: boolean;
  ipfsHash?: string;
}

export interface Review {
  id: string;
  rating: number; // 1 à 5
  comment: string;
  propertyId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export type PricePeriod = 'DAY' | 'WEEK' | 'MONTH';

export interface Property {
  id: string;
  title: string;
  description?: string;
  address: string;
  country?: string;
  region?: string;
  city?: string;
  area?: number; // superficie en m²
  price?: number; // prix de la location
  pricePeriod?: PricePeriod; // période du prix
  isAvailable?: boolean;
  photos: string[];
  ownerId: string;
  owner?: User;
  rentals?: Rental[];
  proofs?: Proof[];
  amenities?: string[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  property?: Property;
  tenant?: User;
  proofs?: Proof[];
  createdAt: string;
  updatedAt: string;
}
