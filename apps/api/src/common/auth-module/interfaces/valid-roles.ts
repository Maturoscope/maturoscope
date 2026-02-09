export enum ValidRoles {
  admin = 'admin',
  superUser = 'superUser',
  user = 'user',
}

export const getRolesMapped = () => ({
  user: process.env.AUTH0_USER_ROLE,
  admin: process.env.AUTH0_ADMIN_ROLE
});
