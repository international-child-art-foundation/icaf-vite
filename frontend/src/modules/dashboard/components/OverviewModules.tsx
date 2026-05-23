import { Link } from 'react-router-dom';
import type { Role } from '@icaf/shared';
import { canAdmin, canReview } from '../utils/dashboardFormat';
import { DashboardModule } from './DashboardModule';

export function OverviewModules({ role }: { role: Role | null }) {
  return (
    <>
      <DashboardModule
        title="Common actions"
        description="Start from the action that matches the work in front of you."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <ActionLink
            to="/submit-artwork"
            label="Submit artwork"
            detail="Create an individual or group artwork submission."
          />
          <ActionLink
            to="/dashboard?tab=submissions"
            label="View my submissions"
            detail="Check status for artwork and groups tied to this account."
          />
          <ActionLink
            to="/gallery"
            label="Open gallery"
            detail="Review the public gallery experience."
          />
        </div>
      </DashboardModule>

      {canReview(role) && (
        <DashboardModule
          title="Contributor actions"
          description="Admins see these because they inherit contributor review responsibilities."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <ActionLink
              to="/dashboard?tab=review"
              label="Review groups"
              detail="Approve submitted groups before they appear publicly."
            />
            <ActionLink
              to="/dashboard?tab=review"
              label="Review artworks"
              detail="Approve, hide, or reject submitted artworks."
            />
          </div>
        </DashboardModule>
      )}

      {canAdmin(role) && (
        <DashboardModule
          title="Admin actions"
          description="Use these for corrections after normal review is not enough."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <ActionLink
              to="/dashboard?tab=admin"
              label="Bulk artwork correction"
              detail="Change metadata for selected artworks with a confirmation step."
            />
            <ActionLink
              to="/dashboard?tab=admin"
              label="Group correction readiness"
              detail="See what group edit API support is still missing."
            />
          </div>
        </DashboardModule>
      )}
    </>
  );
}

function ActionLink({
  to,
  label,
  detail,
}: {
  to: string;
  label: string;
  detail: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-black/10 p-4 transition hover:-translate-y-0.5 hover:border-black/30 hover:shadow-sm"
    >
      <span className="block text-base font-semibold text-neutral-950">
        {label}
      </span>
      <span className="mt-1 block text-sm leading-6 text-neutral-600">
        {detail}
      </span>
    </Link>
  );
}
