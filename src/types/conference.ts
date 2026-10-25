export type DepartmentRole = 'Banqueting' | 'Kitchen' | 'Admin';

export type SeatingFormat = 'U-Shape' | 'Schoolroom' | 'Boardroom' | 'Banquet Rounds' | 'Cinema' | 'Cabaret';

export type EventStatus = 'Inquiry' | 'Proposal Issued' | 'Confirmed' | 'Operational Review' | 'Ready for Arrival';

export type PackageType = 'Full-Day Package' | 'Half-Day Package' | 'Custom Executive Package';

export type AvRequirementType = 'Standard (Projector, Screen, Wi-Fi, Flipcharts)' | 'Advanced AV & Staging' | 'Specialized Technical Support';

export interface StaffMember {
  id: string;
  name: string;
  role: DepartmentRole;
  title: string;
  email: string;
  phone: string;
  active: boolean;
}

export interface TaskItem {
  id: string;
  name: string;
  role: DepartmentRole;
  completed: boolean;
  dueDateDesc?: string;
  assignee?: string;
  notes?: string;
  actionKey?: 'seating' | 'dietary' | 'food-cost' | 'proposal' | 'contract' | 'general';
}

export interface WorkflowSection {
  id: string;
  phase: string;
  subtitle: string;
  tasks: TaskItem[];
}

export interface DietaryBreakdown {
  standard: number;
  vegetarian: number;
  vegan: number;
  glutenFree: number;
  halaal: number;
  nutAllergy: number;
  diabetic: number;
  specialNotes: string;
}

export interface DepartmentChecklistItem {
  id: string;
  department: 'Banqueting' | 'Kitchen' | 'Admin' | 'Technical & AV';
  category: string;
  task: string;
  timing: string;
  responsibleStaff: string;
  completed: boolean;
  notes?: string;
}

export interface ConferenceEvent {
  id: string;
  clientName: string;
  eventTitle: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  
  // Section 1: Initial Requirements (Aligned with Rawdons PDF)
  dateRange: string;
  startDate: string;
  endDate: string;
  dateFlexibility: string;
  delegateMin: number;
  delegateMax: number;
  delegateCurrent: number;
  accommodationSingle: number;
  accommodationSharing: number;
  accommodationRooms: number;
  seatingFormat: SeatingFormat;
  breakawayRoomsNeeded: boolean;
  breakawayRoomsCount: number;
  dailyStartTime: string;
  dailyEndTime: string;
  eveningEvents: string;

  // Section 2: Culinary & Beverage Excellence (Aligned with Rawdons PDF)
  packageType: PackageType;
  cateringPackage: string;
  costPerHead: number;
  sellingPricePerHead: number;
  dietary: DietaryBreakdown;

  // Section 3: Venue & Technical Inclusions (Aligned with Rawdons PDF)
  venueRoom: string;
  venueId?: string;
  venueSeason?: string;
  venueDuration?: 'Full-Day' | 'Half-Day';
  venuePricingModel?: 'seasonal' | 'attendee-tier';
  venueHireFee?: number;
  avRequirements: AvRequirementType;
  avSpecialNotes?: string;

  // Section 4: Booking Timeline & Process (Aligned with Rawdons PDF)
  siteInspectionRequested: boolean;
  provisionalHoldUntil?: string;
  contractSigned: boolean;
  depositPaid: boolean;
  depositAmount: number;
  totalInvoiceEstimate: number;
  status: EventStatus;
  clientSpecialRequests?: string;

  workflow: WorkflowSection[];
  checklists?: DepartmentChecklistItem[];
  roomAllocations?: GuestRoomAllocation[];
  createdAt: string;
  lastUpdated: string;
}

export type VenueSeasonKey = 'low' | 'mid' | 'peak';

export interface SeasonalRate {
  name: string;
  months: string;
  fullDayRate: number;
  halfDayRate: number;
}

export interface AttendeeTierRate {
  id: string;
  name: string;
  minPax: number;
  maxPax: number;
  flatHire: number;
  perExtraPaxRate: number;
}

export interface VenueCapacities {
  cinema: number;
  schoolroom: number;
  banquet: number;
  uShape: number;
  boardroom: number;
  cocktail: number;
  cabaret: number;
}

export interface HotelVenue {
  id: string;
  name: string;
  code: string;
  subtitle: string;
  description: string;
  sqMeters: number;
  dimensions: string;
  capacities: VenueCapacities;
  seasonalPricing: {
    low: SeasonalRate;
    mid: SeasonalRate;
    peak: SeasonalRate;
  };
  attendeeTiers: AttendeeTierRate[];
  inclusions: string[];
  features: string[];
  recommendedFor: string;
  restrictions?: string;
  image?: string;
  active: boolean;
}

export type SleepingConfigType =
  | 'King Bed'
  | 'Queen Bed'
  | 'Twin Beds (2x Single/Three-Quarter)'
  | 'Two Double Beds'
  | 'Executive Suite (King + Fireplace)'
  | 'Bridal & VIP Manor Suite';

export type HotelWing =
  | 'Main Manor House'
  | 'Lake Dam Wing'
  | 'Garden Wing'
  | 'Thatched Orchard Cottages';

export interface HotelRoom {
  id: string;
  roomNumber: number;
  roomName: string;
  wing: HotelWing;
  floor: 'Ground Floor' | 'First Floor';
  bedConfig: SleepingConfigType;
  maxOccupancy: number;
  baseRateSingle: number;
  baseRateSharing: number;
  features: string[];
}

export interface GuestRoomAllocation {
  id: string;
  roomId: string;
  roomNumber: number;
  conferenceId: string;
  guest1Name: string;
  guest1Title?: string;
  guest1Phone?: string;
  guest2Name?: string;
  guest2Title?: string;
  occupancyType: 'Single' | 'Sharing' | 'Vacant' | 'House Use';
  keyCardEncoded: boolean;
  checkedIn: boolean;
  vipStatus?: boolean;
  specialRequests?: string;
  allocatedAt: string;
}

export interface SystemBackupBundle {
  version: string;
  exportDate: string;
  systemName: string;
  conferences: ConferenceEvent[];
  staff: StaffMember[];
  checklists: DepartmentChecklistItem[];
  hotelRooms?: HotelRoom[];
  roomAllocations?: Record<string, GuestRoomAllocation[]>;
  venues?: HotelVenue[];
}


