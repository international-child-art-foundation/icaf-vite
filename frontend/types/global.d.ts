export {};

declare global {
  namespace Gtag {
    export type ConsentState = 'granted' | 'denied';

    export interface ConsentParams {
      ad_storage?: ConsentState;
      analytics_storage?: ConsentState;
      ad_user_data?: ConsentState;
      ad_personalization?: ConsentState;
    }

    export interface ConfigParams {
      send_page_view?: boolean;
      groups?: string | string[];
      campaign_id?: string;
      campaign_name?: string;
      currency?: string;
      [key: string]: unknown;
    }

    export interface EventParams {
      value?: number;
      currency?: string;
      items?: unknown[];
      [key: string]: unknown;
    }

    export interface CustomParams {
      [key: string]: unknown;
    }

    export interface GtagFn {
      (command: 'js', date: Date): void;

      (command: 'config', measurementId: string, config?: ConfigParams): void;

      (command: 'event', eventName: string, params?: EventParams): void;

      (command: 'set', params: CustomParams): void;

      (
        command: 'consent',
        action: 'default' | 'update',
        params: ConsentParams,
      ): void;
    }
  }

  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag.GtagFn;
  }
}
