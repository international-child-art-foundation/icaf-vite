import { Role } from '../entities/user/types.js';

// Role hierarchy check
// Order (ascending): deleting < user < contributor < admin
const ROLE_RANK: Record<Role, number> = {
  deleting: 0,
  user: 1,
  contributor: 2,
  admin: 3,
};

export function hasMinimumRole(
  userRole: Role | undefined,
  requiredRole: Role,
): boolean {
  return (userRole !== undefined ? ROLE_RANK[userRole] : -1) >= ROLE_RANK[requiredRole];
}