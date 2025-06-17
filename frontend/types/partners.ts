export interface IPartner extends IPartnerPartial {
  logo: string;
}

export interface IPartnerPartial {
  id: number;
  name: string;
  description: string;
}

export type IPartners = IPartner[];
