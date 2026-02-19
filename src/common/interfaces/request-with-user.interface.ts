import { Request } from 'express';

export interface RequestUser {
  id: string;
  phoneNumber: string;
  userType: string;
  fullName: string;
  verificationStatus: string;
}

export interface RequestAdmin {
  id: string;
  username: string;
  role: string;
  fullName: string;
  isActive: boolean;
  canVerifyMembers: boolean;
  canVerifyClients: boolean;
  canResetPasswords: boolean;
  canManageContent: boolean;
  canManageEvents: boolean;
  canManageAdmins: boolean;
  canExportData: boolean;
  canAccessReports: boolean;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}

export interface RequestWithAdmin extends Request {
  user: RequestAdmin;
}