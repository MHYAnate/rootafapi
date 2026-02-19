export interface JwtPayload {
  sub: string;
  phoneNumber: string;
  userType: string;
  iat?: number;
  exp?: number;
}

export interface AdminJwtPayload {
  sub: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}