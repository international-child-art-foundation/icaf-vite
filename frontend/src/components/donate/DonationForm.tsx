import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeartIcon, X, Copy, Check, Info } from 'lucide-react';
import JustGiving from '@/assets/donate/DonateForm-JustGiving.svg';
import NetworkForGood from '@/assets/donate/DonateForm-NetworkForGood.svg';
import SendCheck from '@/assets/donate/DonateForm-SendACheck.svg';
import Icaflogo from '@/assets/donate/icafLogo.svg';
import { formatWithCommas } from '@/lib/utils';

type donationFrequencies = 'one-time' | 'monthly';

interface DonationFormProps {
  whiteBackdrop: boolean;
}

const DonationForm = ({ whiteBackdrop }: DonationFormProps) => {
  const presetAmounts = [200, 100, 50];
  const [donationAmountString, setDonationAmountString] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const donationAmountNumeric = parseInt(
    donationAmountString.replace(/[^0-9]/g, ''),
  );

  const activeDonationOption = presetAmounts.includes(
    parseInt(donationAmountString),
  )
    ? donationAmountString
    : 'other';

  const [frequency, setFrequency] = useState<donationFrequencies>('one-time');
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handlePresetClick = (amount: number) => {
    setDonationAmountString(amount.toString());
  };

  const handleOtherClick = () => {
    setDonationAmountString('0');
  };

  const handleUserInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setDonationAmountString(value);
  };

  const handleSendCheckClick = () => {
    setShowCheckModal(true);
    setIsCopied(false);
  };

  function handleCopyAddress() {
    const address = `Post Office Box 58133,
Washington, D.C. 20037`;
    void navigator.clipboard.writeText(address);
    setIsCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  const handleDonateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRedirectModal(true);
  };

  const handleGotItClick = () => {
    setShowRedirectModal(false);
    window.open(
      `https://www.every.org/icaf?search_meta=%7B%22query%22%3A%22international+art+foun%22%7D&donateTo=icaf&amount=${donationAmountNumeric}&frequency=${frequency}#/donate/card`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const textColor = '';
  const donationOptionColor = whiteBackdrop
    ? 'border-1 text-gray-800 border-gray-800'
    : 'border-1 border-white text-white md:text-gray-800 lg:text-white ';
  const donationOptionCoreStyles =
    'text-xl font-nunito rounded border px-3 py-2 transition-all duration-200';
  return (
    <>
      <div className="font-montserrat mx-auto md:block">
        <div className="">
          <div className="mb-6">
            <a
              href="#"
              className={`hover:text-secondary-yellow flex items-center gap-2 text-sm text-white transition-colors md:text-gray-800 lg:text-white`}
            >
              <span>Donate via Every.org using card, Apple Pay & more</span>
            </a>
          </div>

          <div className="mb-6 hidden md:block">
            <div className="mb-4 grid grid-cols-4 gap-2">
              {presetAmounts.map((amount) => (
                <button
                  type="button"
                  key={amount}
                  onClick={() => handlePresetClick(amount)}
                  className={`${donationOptionCoreStyles} ${amount === donationAmountNumeric ? 'border-secondary-yellow bg-primary text-secondary-yellow shadow-md' : donationOptionColor} `}
                >
                  ${amount}
                </button>
              ))}
              <button
                type="button"
                onClick={handleOtherClick}
                className={`${donationOptionCoreStyles} ${activeDonationOption === 'other' ? 'border-secondary-yellow bg-primary text-secondary-yellow shadow-md' : donationOptionColor} `}
              >
                Other
              </button>
            </div>

            <div className="relative">
              <div className="font-nunito relative text-xl">
                <span className="font-nunito absolute left-3 top-1/2 z-10 -translate-y-1/2 transform text-lg text-white text-white/70 md:text-gray-800 lg:text-white">
                  $
                </span>
                <input
                  type="text"
                  value={
                    isEditing
                      ? donationAmountString
                      : formatWithCommas(donationAmountString)
                  }
                  onFocus={() => setIsEditing(true)}
                  onBlur={() => setIsEditing(false)}
                  onChange={handleUserInput}
                  placeholder="Enter amount"
                  className={` ${whiteBackdrop ? 'border-gray-800 text-gray-800' : 'border-white text-white'} focus:border-secondary-yellow w-full rounded border bg-white/10 py-2 pl-8 pr-24 placeholder-white/50 transition-all focus:bg-white/15 focus:outline-none`}
                />
                <div className="absolute bottom-0 right-0 top-0 flex items-center">
                  <select
                    value={frequency}
                    onChange={(e) =>
                      setFrequency(e.target.value as donationFrequencies)
                    }
                    className={`font-nunito border-none bg-transparent px-3 py-2 text-lg ${whiteBackdrop ? 'border-gray-800 text-gray-800' : 'text-white'} appearance-none pr-14 focus:outline-none focus:ring-0 [&>option]:bg-white [&>option]:text-black`}
                  >
                    <option>One-time</option>
                    <option>Monthly</option>
                  </select>
                  <span
                    className={`pointer-events-none absolute right-10 top-1/2 h-4 w-px -translate-y-1/2 ${whiteBackdrop ? 'bg-gray-500' : 'bg-white/30'}`}
                  />
                  <svg
                    className={`pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 ${whiteBackdrop ? 'stroke-gray-800' : 'stroke-white'}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>{' '}
                </div>
              </div>
            </div>
          </div>

          {donationAmountNumeric > 999999 && (
            <div className="hidden gap-2 md:flex">
              <Info color={`${whiteBackdrop ? 'black' : 'white'}`} />
              <p
                className={`${whiteBackdrop ? 'text-primary' : 'text-white'} `}
              >
                Please{' '}
                <a
                  href={'icaf.org/contact-us'}
                  className={`underline ${whiteBackdrop ? 'text-grey-200' : 'text-'} `}
                >
                  {' '}
                  Contact Us
                </a>{' '}
                to donate an amount this large.
              </p>
            </div>
          )}

          <Button
            asChild
            variant="secondary"
            className="mb-4 mt-4 flex h-14 w-full items-center justify-center self-start rounded-full px-6 text-base font-bold tracking-wide"
            onClick={handleDonateClick}
          >
            <a href="#" className="font-nunito text-md flex items-center gap-2">
              DONATE IN 60 SECONDS
              <HeartIcon
                strokeWidth={2}
                className="!h-5 !w-5 stroke-black lg:!h-5 lg:!w-5"
              />
            </a>
          </Button>

          <p className="mb-6 text-center text-xs text-white md:text-gray-800 lg:text-white">
            International Child Art Foundation's Tax ID (EIN) 52-2032649
          </p>

          <div className="hidden text-center md:block">
            <div className="mb-4 border-t-2 border-white/30 md:border-gray-300 lg:border-white/30"></div>
            <h3 className="mb-4 text-sm font-semibold text-white md:text-gray-800 lg:text-white">
              Other Donation Methods
            </h3>
            <div className="flex justify-center gap-6">
              <a
                href="https://www.networkforgood.org/donation/MakeDonation.aspx?ORGID2=522032649&vlrStratCode=nZXb2ZdCu0mkYBGguVqwHg3Urn4pNhQPKO6LvPJDxffjfPYvs02mtIFg%2b23WunIU"
                className="hover:text-secondary-yellow text-xs text-white transition-colors md:text-gray-800 lg:text-white"
              >
                <div className="flex flex-col items-center">
                  <div className="border-1 mb-2 flex h-16 w-16 items-center justify-center rounded-full border bg-white">
                    <img
                      src={NetworkForGood}
                      alt="Network for Good"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  Network for good
                </div>
              </a>

              <a
                href="https://www.justgiving.com/internationalchildartfoundation"
                className="hover:text-secondary-yellow text-xs text-white transition-colors md:text-gray-800 lg:text-white"
              >
                <div className="flex flex-col items-center">
                  <div className="border-1 mb-2 flex h-16 w-16 items-center justify-center rounded-full border bg-white">
                    <img
                      src={JustGiving}
                      alt="JustGiving"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  JustGiving
                </div>
              </a>

              <div className="group flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleSendCheckClick}
                  className="border-1 mb-2 flex h-16 w-16 items-center justify-center rounded-full border bg-white transition-colors hover:bg-gray-100"
                >
                  <img
                    src={SendCheck}
                    alt="Send a Check"
                    className="h-10 w-10 object-contain"
                  />
                </button>
                <button
                  type="button"
                  onClick={handleSendCheckClick}
                  className="group-hover:text-secondary-yellow text-xs text-white transition-colors md:text-gray-800 lg:text-white"
                >
                  Send a Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8">
            <button
              type="button"
              onClick={() => setShowCheckModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="mb-6">
              <img src={Icaflogo} alt="ICAF Logo" className="h-15 w-20" />
            </div>

            <h2 className={`mb-6 text-center text-xl font-bold ${textColor}`}>
              Mail your check to ICAF
            </h2>

            <div className="mb-6 text-center">
              <p className="leading-relaxed text-gray-700">
                Post Office Box 58133,
                <br />
                Washington, D.C. 20037
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyAddress}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-colors ${
                isCopied
                  ? 'text-primary border-primary border-2 bg-white'
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy to clipboard
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {showRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8">
            <button
              type="button"
              onClick={() => setShowRedirectModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="mb-6">
              <img src={Icaflogo} alt="ICAF Logo" className="h-15 w-20" />
            </div>

            <h2 className={`mb-4 text-center text-2xl font-bold ${textColor}`}>
              Heads up!
            </h2>

            <div className="mb-6 text-center">
              <p className="mb-4 leading-relaxed text-gray-700">
                You're about to be redirected to Every.org to complete your
                donation.
              </p>
              <p className="text-sm leading-relaxed text-gray-600">
                An optional tip to Every.org may appear. You can set it to $0.
                100% of your donation will go to ICAF.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGotItClick}
              className="bg-primary hover:bg-primary/90 w-full rounded-full px-6 py-3 font-semibold text-white transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DonationForm;
