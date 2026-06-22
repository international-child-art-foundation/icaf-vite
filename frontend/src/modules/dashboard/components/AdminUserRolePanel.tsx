import { useState, type FormEvent } from 'react';
import { ROLES, type Role } from '@icaf/shared';
import { UserCog } from 'lucide-react';
import { alterUserRole } from '@/api/admin';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { DashboardModule, ModuleState } from './DashboardModule';

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  contributor: 'Contributor',
  user: 'User',
  deleting: 'Deleting',
};

export function AdminUserRolePanel() {
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('user');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateUserRole = async (trimmedUserId: string) => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await alterUserRole(trimmedUserId, {
        new_role: selectedRole,
      });
      setMessage(
        `Updated ${response.user_id} from ${roleLabels[response.old_role]} to ${roleLabels[response.new_role]}.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update user role.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUserId = userId.trim();
    if (!trimmedUserId) {
      setError('Enter a user ID.');
      setMessage(null);
      return;
    }

    void updateUserRole(trimmedUserId);
  };

  return (
    <DashboardModule
      title="Update user authorization"
      description="Set an account authorization level by user ID."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end">
          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
            User ID
            <Input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Enter user ID"
              autoComplete="off"
              disabled={busy}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-800">
            Authorization level
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as Role)}
              disabled={busy}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" disabled={busy}>
            <UserCog />
            {busy ? 'Updating...' : 'Update'}
          </Button>
        </div>

        {error && <ModuleState tone="error">{error}</ModuleState>}
        {message && <ModuleState tone="success">{message}</ModuleState>}
      </form>
    </DashboardModule>
  );
}
