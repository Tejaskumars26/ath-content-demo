/** Texts of fieldConfig/funding-defaults.json; codes (grant, open…) map to translatable labels. */
export type FundingDefaults = {
  pageTitle: string;
  pageIntro: string;
  readMore: string;
  backToList: string;
  detailsHeading: string;
  fundingTypeLabel: string;
  statusLabel: string;
  frequencyLabel: string;
  agencyLabel: string;
  contactLabel: string;
  dueDateLabel: string;
  fundingTypes: Record<string, string>;
  statuses: Record<string, string>;
  frequencies: Record<string, string>;
  agencies: Record<string, string>;
};

export const label = (map: Record<string, string>, code: string) => map[code] || code;
