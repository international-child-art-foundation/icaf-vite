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
            detail="Create an individual artwork submission."
          />
          <ActionLink
            to="/submit-artwork-group"
            label="Submit artwork group"
            detail="Create a group artwork submission."
          />
          <ActionLink
            to="/my-icaf?tab=submissions"
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
            {canAdmin(role) ? (
              <ActionLink
                to="/my-icaf?tab=review"
                label="Artwork review"
                detail="Review approved, pending, hidden, and rejected artwork."
              />
            ) : (
              <>
                <ActionLink
                  to="/my-icaf?tab=review"
                  label="Review groups"
                  detail="Approve submitted groups before they appear publicly."
                />
                <ActionLink
                  to="/my-icaf?tab=review"
                  label="Review artworks"
                  detail="Approve, hide, or reject submitted artworks."
                />
              </>
            )}
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
              to="/my-icaf?tab=admin"
              label="Artwork admin"
              detail="Start with approved artwork, then switch status views."
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
