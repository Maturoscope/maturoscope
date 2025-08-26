export enum ValidRoles {
  admin = 'admin',
  superUser = 'superUser',
  user = 'user',
}

export const rolesMapped = {
  user: process.env.AUTH0_USER_ROLE,
  admin: process.env.AUTH0_ADMIN_ROLE,
  superUser: process.env.AUTH0_SUPER_USER_ROLE,
};
