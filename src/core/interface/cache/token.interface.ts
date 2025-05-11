export interface TokenCachePayload {
    id: string;
    email: string;
    name: string;
    clientId: string;
    isTwoFactorEnabled: boolean;
    ip: string;
    issuedAt: number;
  }