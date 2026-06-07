import { Link } from 'react-router-dom';
import type { Role } from '@icaf/shared';
import { canAdmin, canReview } from '../utils/dashboardFormat';
import { DashboardModule } from './DashboardModule';

export function OverviewModules({ role }: { role: Role | null }) {
  return (
    <>
      <DashboardModule
        title="Manage your ICAF resources"
        description="Submit artwork or manage your active submissions."
      >
        <div className="grid gap-3 md:grid-cols-3">
          <ActionLink
            to="/submit-artwork"
            label="Submit artwork"
            detail="Share your art with the world."
          />
          <ActionLink
            to="/submit-artwork?quantity=group"
            label="Submit artwork group"
            detail="Submit on behalf of a classroom or group."
          />
          <ActionLink
            to="/my-icaf?tab=submissions"
            label="View my submissions"
            detail="Check status for artwork and groups tied to this account."
          />
          <ActionLink
            to="/gallery"
            label="Open gallery"
            detail="Get inspired by the creations of others."
          />
        </div>
      </DashboardModule>

      {canReview(role) && (
        <DashboardModule title="Contributor Corner" description="">
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
        <DashboardModule title="Admin Actions" description="">
          <div className="grid gap-3 md:grid-cols-2">
            <ActionLink
              to="/my-icaf?tab=admin"
              label="Artwork admin"
              detail="Start with approved artwork, then switch status views."
            />
            <ActionLink
              to="/my-icaf?tab=news"
              label="News admin"
              detail="Create, edit, delete, or bulk upload public news items."
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
