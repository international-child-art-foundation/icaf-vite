import { Button } from '../ui/button';

export const ManageSubscriptionCallout = () => {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md bg-gray-50 p-6 shadow-md">
      <p className="font-montserrat text-xl font-semibold">
        Already have a subscription?
      </p>
      <p className="text-md leading-relaxed text-gray-700">
        Manage it in our secure portal.
      </p>
      <div className="">
        <Button
          className="rounded-full px-6 py-3 text-base"
          variant="default"
          size="lg"
        >
          <a
            href={'https://billing.stripe.com/p/login/4gM6oJffa1Rvfgia62abK00'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage Subscription
          </a>
        </Button>
      </div>
    </div>
  );
};
