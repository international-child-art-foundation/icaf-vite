// Role hierarchy check
// Order (ascending): user < guardian < contributor < admin
const ROLE_RANK: Record<string, number> = {
    user: 0,
    guardian: 1,
    contributor: 2,
    admin: 3,
};

export function hasMinimumRole(userRole: string | undefined, requiredRole: string): boolean {
    return (ROLE_RANK[userRole ?? ''] ?? -1) >= (ROLE_RANK[requiredRole] ?? 999);
}
