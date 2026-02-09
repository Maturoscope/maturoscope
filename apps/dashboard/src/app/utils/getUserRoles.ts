import { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { verifyToken } from './authDecode';

export const ROLES_MAPPED = {
  user: process.env.AUTH0_USER_ROLE,
  admin: process.env.AUTH0_ADMIN_ROLE,
};

export const getUserRoles = async (): Promise<string[]> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token || !token.value) {
      throw Error('No token found');
    }

    const decoded = (await verifyToken(token.value)) as JwtPayload;
    const roles = decoded.userRoles

    if (roles.length <= 0) return ['user'];

    return roles;
  } catch {
    return ['user'];
  }
};
