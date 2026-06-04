import { Role } from '../entities/user/types.js';

// Role hierarchy check
// Order (ascending): user < contributor < admin
const ROLE_RANK: Record<Role, number> = {
    user: 0,
    contributor: 1,
    admin: 2,
};

export function hasMinimumRole(userRole: Role | undefined, requiredRole: Role): boolean {
    return (userRole !== undefined ? ROLE_RANK[userRole] : -1) >= ROLE_RANK[requiredRole];
}
