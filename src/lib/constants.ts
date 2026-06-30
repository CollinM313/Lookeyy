export const CANCELLATION_WINDOW_HOURS = 24;

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "House",
  CONDO: "Condo",
  TOWNHOUSE: "Townhouse",
  APARTMENT: "Apartment",
  LAND: "Land",
  MULTI_FAMILY: "Multi-family",
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  PENDING_ADMIN_APPROVAL: "Pending approval",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

export const TOUR_TYPE_LABELS: Record<string, string> = {
  RECORDED: "Recorded video walkthrough",
  LIVE: "Live video call tour",
};
