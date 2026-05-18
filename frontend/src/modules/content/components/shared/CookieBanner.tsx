import { useGlobalContext } from './GlobalContext';

export default function CookieBanner() {
  const {
    setGlobalCookieConsentValue,
    cookieBannerVisible,
    setCookieBannerVisible,
  } = useGlobalContext();

  const handleUserCookieResponse = (consentValue: boolean) => {
    setGlobalCookieConsentValue(consentValue);
    setCookieBannerVisible(false);
  };

  return (
    cookieBannerVisible && (
      <div className="fixed bottom-0 left-0 right-0 z-[25] bg-gray-800 p-6 text-white">
        <span
          onClick={() => setCookieBannerVisible(false)}
          className="absolute right-0 top-0 cursor-pointer pr-4 pt-2 text-5xl font-light active:scale-90"
        >
          &times;
        </span>

        <p className="mx-auto mb-3 w-[800px] max-w-[90%] text-center text-lg">
          Hey there!
        </p>
        <p className="mx-auto mb-3 w-[800px] max-w-[90%]">
          🍪 We use cookies to help us learn more about the behavior and
          location of our users so we can provide you with the best possible
          experience.
        </p>
        <p className="mx-auto mb-6 w-[800px] max-w-[90%]">
          You can choose to accept or deny these cookies. And don't worry, you
          can change your cookie settings anytime by clicking the Cookie
          Settings button at the bottom of the page.
        </p>

        <div className="m-auto flex justify-center">
          <button
            type="button"
            onClick={() => handleUserCookieResponse(true)}
            className="bg-primary ml-2 w-[200px] rounded px-3 py-2 text-white active:scale-[97%]"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => handleUserCookieResponse(false)}
            className="bg-primary ml-2 w-[200px] rounded px-3 py-2 text-white active:scale-[97%]"
          >
            Deny
          </button>
        </div>
      </div>
    )
  );
}
