import { Role } from '../entities/user/types.js';

// Role hierarchy check
// Order (ascending): user < guardian < contributor < admin
const ROLE_RANK: Record<Role, number> = {
    user: 0,
    guardian: 1,
    contributor: 2,
    admin: 3,
};

export function hasMinimumRole(userRole: Role | undefined, requiredRole: Role): boolean {
    return (userRole !== undefined ? ROLE_RANK[userRole] : -1) >= ROLE_RANK[requiredRole];
}
