import { HotelVenue } from '../types/conference';
import breweryBanquetImg from '../assets/images/rawdons_brewery_banquet_1792861790124.jpg';
import estateGroundsImg from '../assets/images/rawdons_estate_grounds_1792861790559.jpg';

export const initial5Venues: HotelVenue[] = [
  {
    id: 'main-conference',
    code: 'VEN-01',
    name: 'Main Conference Room',
    subtitle: 'The Mill Room & Lake Lawn Terrace',
    description:
      'Rawdons flagship plenary hall featuring historic exposed timber king-post trusses, acoustic sound baffling, integrated 3-meter motorised projection screen, laser projection, and direct French doors opening onto the pristine trout dam lawns.',
    sqMeters: 185,
    dimensions: '18.5m x 10.0m (4.8m pitch ceiling)',
    capacities: {
      cinema: 120,
      schoolroom: 80,
      banquet: 75,
      uShape: 45,
      boardroom: 36,
      cocktail: 150,
      cabaret: 60,
    },
    seasonalPricing: {
      low: {
        name: 'Low Season (Winter / Off-Peak)',
        months: 'May – July',
        fullDayRate: 8500,
        halfDayRate: 5500,
      },
      mid: {
        name: 'Mid Season (Autumn & Spring)',
        months: 'Feb – Apr, Aug – Oct',
        fullDayRate: 11500,
        halfDayRate: 7500,
      },
      peak: {
        name: 'Peak Season (Summer & Year-End)',
        months: 'Nov – Jan',
        fullDayRate: 14500,
        halfDayRate: 9800,
      },
    },
    attendeeTiers: [
      {
        id: 'tier-1',
        name: 'Executive Intimate (1–30 pax)',
        minPax: 1,
        maxPax: 30,
        flatHire: 7500,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-2',
        name: 'Standard Plenary (31–60 pax)',
        minPax: 31,
        maxPax: 60,
        flatHire: 11000,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-3',
        name: 'Full Summit (61–100 pax)',
        minPax: 61,
        maxPax: 100,
        flatHire: 14500,
        perExtraPaxRate: 120,
      },
      {
        id: 'tier-4',
        name: 'Grand Assembly (101–150 pax)',
        minPax: 101,
        maxPax: 150,
        flatHire: 17500,
        perExtraPaxRate: 150,
      },
    ],
    inclusions: [
      'Motorised 3m HD Projector Screen & Laser Projector',
      'Uncapped High-Speed Estate Fibre Wi-Fi',
      '2x Flipcharts with Markers & Paper Pad',
      'Wireless Handheld & Lapel Audio Microphones',
      'Dual Split Climate Air Conditioning & Heating',
      'Integrated Generator Backup (Uninterrupted Power)',
      'Estate Chilled Spring Water & Peppermint Station',
      'Nottingham Road Countryside Note Pads & Executive Pens',
    ],
    features: [
      'Exposed timber king-post trusses & heritage character',
      'Abundant natural daylight with motorized blackout drapes',
      'Private double French doors directly to dam lawn',
      'Dedicated delegate breakaway terrace',
    ],
    recommendedFor: 'Full-day corporate conferences, AGM meetings, annual strategy summits, and executive workshops.',
    restrictions: 'Blackout drapes required during high-contrast video playback on bright sunny afternoons.',
    image: breweryBanquetImg,
    active: true,
  },
  {
    id: 'breakfast-dining-patio',
    code: 'VEN-02',
    name: 'Breakfast Dining Room / Patio',
    subtitle: 'Heritage Country Dining Room & Flagstone Garden Patio',
    description:
      'Warm country estate dining hall paired with a spacious covered flagstone patio overlooking the rose gardens. Ideal for working breakfasts, plenary lunches, breakaway buffet sessions, and elegant banquet dinners.',
    sqMeters: 150,
    dimensions: '15.0m x 10.0m + 45m² Covered Patio',
    capacities: {
      cinema: 70,
      schoolroom: 45,
      banquet: 90,
      uShape: 32,
      boardroom: 28,
      cocktail: 110,
      cabaret: 54,
    },
    seasonalPricing: {
      low: {
        name: 'Low Season (Winter / Off-Peak)',
        months: 'May – July',
        fullDayRate: 6500,
        halfDayRate: 4200,
      },
      mid: {
        name: 'Mid Season (Autumn & Spring)',
        months: 'Feb – Apr, Aug – Oct',
        fullDayRate: 8800,
        halfDayRate: 5800,
      },
      peak: {
        name: 'Peak Season (Summer & Year-End)',
        months: 'Nov – Jan',
        fullDayRate: 11500,
        halfDayRate: 7500,
      },
    },
    attendeeTiers: [
      {
        id: 'tier-1',
        name: 'Intimate Dining (1–30 pax)',
        minPax: 1,
        maxPax: 30,
        flatHire: 5500,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-2',
        name: 'Medium Banquet (31–60 pax)',
        minPax: 31,
        maxPax: 60,
        flatHire: 8500,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-3',
        name: 'Full Dining Room (61–90 pax)',
        minPax: 61,
        maxPax: 90,
        flatHire: 11000,
        perExtraPaxRate: 95,
      },
      {
        id: 'tier-4',
        name: 'Indoor + Patio Overflow (91–110 pax)',
        minPax: 91,
        maxPax: 110,
        flatHire: 13500,
        perExtraPaxRate: 120,
      },
    ],
    inclusions: [
      'Direct Buffet & Hot Chafing Station Access',
      'Solid Timber Dining Tables & Upholstered Chairs',
      'Covered Outdoor Flagstone Patio with Gas Heaters',
      'Uncapped High-Speed Fibre Wi-Fi',
      'Mobile 65" 4K Smart Display on Presentation Trolley',
      'Multi-Zone Background Sound System',
      'Estate Spring Water & Cordial Station',
    ],
    features: [
      'Large multi-pane sash windows with fountain views',
      'Seamless flow from enclosed dining room to open patio',
      'Built-in colonial buffet service counters',
      'Original brick fireplace for cosy autumn/winter ambiance',
    ],
    recommendedFor: 'Working delegate breakfasts, midday buffet luncheons, awards gala banquets, and celebration dinners.',
    restrictions: 'Breakfast service takes precedence until 10:00 AM unless full-day exclusive buyout is contracted.',
    image: estateGroundsImg,
    active: true,
  },
  {
    id: 'stirrup-cup',
    code: 'VEN-03',
    name: 'Stirrup Cup',
    subtitle: 'Historic 1950s English Pub & Fireside Snug',
    description:
      'The legendary heritage soul of Rawdons Hotel. A genuine 1950s English countryside pub with dark polished timber, hunting brasses, Chesterfield leather seating, and roaring open log fireplaces. Perfect for fireside executive board meetings, arrival welcome drinks, and evening networking.',
    sqMeters: 85,
    dimensions: '10.0m x 8.5m',
    capacities: {
      cinema: 35,
      schoolroom: 20,
      banquet: 40,
      uShape: 18,
      boardroom: 16,
      cocktail: 75,
      cabaret: 24,
    },
    seasonalPricing: {
      low: {
        name: 'Low Season (Winter / Off-Peak)',
        months: 'May – July',
        fullDayRate: 5000,
        halfDayRate: 3500,
      },
      mid: {
        name: 'Mid Season (Autumn & Spring)',
        months: 'Feb – Apr, Aug – Oct',
        fullDayRate: 6800,
        halfDayRate: 4600,
      },
      peak: {
        name: 'Peak Season (Summer & Year-End)',
        months: 'Nov – Jan',
        fullDayRate: 8900,
        halfDayRate: 5900,
      },
    },
    attendeeTiers: [
      {
        id: 'tier-1',
        name: 'Executive Fireside (1–20 pax)',
        minPax: 1,
        maxPax: 20,
        flatHire: 4500,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-2',
        name: 'Pub Reception (21–45 pax)',
        minPax: 21,
        maxPax: 45,
        flatHire: 6500,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-3',
        name: 'Cocktail Exclusive (46–75 pax)',
        minPax: 46,
        maxPax: 75,
        flatHire: 8500,
        perExtraPaxRate: 110,
      },
      {
        id: 'tier-4',
        name: 'Extended Pub Overflow (76–85 pax)',
        minPax: 76,
        maxPax: 85,
        flatHire: 9800,
        perExtraPaxRate: 130,
      },
    ],
    inclusions: [
      'Dedicated Heritage Pub Bartender & Bar Infrastructure',
      'Two Roaring Open Log Fireplaces with Unlimited Timber',
      'Chesterfield Leather Armchairs & Pub Dining Tables',
      '55" HD Smart Screen for Presentations or Keynotes',
      'Uncapped High-Speed Fibre Wi-Fi',
      'Craft Beer Draught Taps Available on Demand',
      'Complimentary Artisan Biltong & Roasted Nuts Snack Bowls',
    ],
    features: [
      'Authentic 1950s KwaZulu-Natal Midlands country pub charm',
      'Twin hearth stone fireplaces with copper mantels',
      'Heritage equestrian brasses & antique woodwork',
      'Warm, intimate acoustic environment for executive dialogue',
    ],
    recommendedFor: 'Arrival welcome cocktails, fireside executive board summits, intimate brainstorms, and post-conference networking.',
    restrictions: 'Public hotel guests diverted to Main Drawing Room during exclusive private hire.',
    image: breweryBanquetImg,
    active: true,
  },
  {
    id: 'bar-garden-brewery',
    code: 'VEN-04',
    name: 'Bar Garden / Brewery',
    subtitle: 'Craft Brewery Lawn, Pergola & Outdoor Taproom',
    description:
      'The iconic home of Nottingham Road Brewing Company. Set beneath ancient oak trees with expansive manicured lawns, timber pergolas, outdoor festoon lighting, and direct sightlines into the copper brewing vats. Unmatched for outdoor team building, spit braais, and craft beer masterclasses.',
    sqMeters: 360,
    dimensions: '25.0m x 14.5m Lawn + 80m² Covered Pergola',
    capacities: {
      cinema: 150,
      schoolroom: 100,
      banquet: 160,
      uShape: 50,
      boardroom: 40,
      cocktail: 220,
      cabaret: 80,
    },
    seasonalPricing: {
      low: {
        name: 'Low Season (Winter / Off-Peak)',
        months: 'May – July',
        fullDayRate: 7500,
        halfDayRate: 4800,
      },
      mid: {
        name: 'Mid Season (Autumn & Spring)',
        months: 'Feb – Apr, Aug – Oct',
        fullDayRate: 10500,
        halfDayRate: 6900,
      },
      peak: {
        name: 'Peak Season (Summer & Year-End)',
        months: 'Nov – Jan',
        fullDayRate: 14000,
        halfDayRate: 9200,
      },
    },
    attendeeTiers: [
      {
        id: 'tier-1',
        name: 'Lawn Snug (1–30 pax)',
        minPax: 1,
        maxPax: 30,
        flatHire: 6000,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-2',
        name: 'Garden Pergola (31–75 pax)',
        minPax: 31,
        maxPax: 75,
        flatHire: 9500,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-3',
        name: 'Full Brewery Lawn (76–150 pax)',
        minPax: 76,
        maxPax: 150,
        flatHire: 13500,
        perExtraPaxRate: 85,
      },
      {
        id: 'tier-4',
        name: 'Festival Scale (151–220 pax)',
        minPax: 151,
        maxPax: 220,
        flatHire: 16500,
        perExtraPaxRate: 110,
      },
    ],
    inclusions: [
      'Mobile 4-Tap Craft Beer Dispensing Unit & Dedicated Tapmaster',
      'Weatherproof Timber Pergola with Clear Roll-Down Blinds',
      'Outdoor Evening Festoon Fairy Lighting & 3x Fire Pits',
      'High-Power Outdoor PA System with Wireless Microphones',
      'Complimentary Lawn Games (Giant Jenga, Boules, Cornhole)',
      'Charcoal Braai & Spit Braai Station Setups',
      'Extended Estate Wi-Fi Coverage Across Entire Brewery Grounds',
    ],
    features: [
      'Direct sightlines into the artisanal copper brew kettles',
      'Shaded by 70-year-old towering Midlands oak trees',
      'Direct adjacency to the private fly fishing dam and trails',
      'All-weather contingency with high-grade roll-down blinds',
    ],
    recommendedFor: 'Outdoor team building, corporate braai celebrations, craft beer tastings, and casual lawn networking.',
    restrictions: 'Outdoor amplified music curfew at 22:30 PM per local Midlands conservancy regulations.',
    image: breweryBanquetImg,
    active: true,
  },
  {
    id: 'full-hotel-buyout',
    code: 'VEN-05',
    name: 'Full Hotel and All Venues',
    subtitle: 'Exclusive Estate Buyout (32 Rooms + All 4 Venues + 10 Hectares)',
    description:
      'The ultimate private estate experience. 100% exclusive access to all 32 luxury guest rooms and cottages (accommodating up to 64 sharing guests), all 4 conference and banquet venues, The Stirrup Cup pub, the brewery taproom, gardens, trout dams, and 10 hectares of countryside with 24-hour dedicated management and privacy.',
    sqMeters: 50000,
    dimensions: 'Entire 10-Hectare Midlands Estate & Private Grounds',
    capacities: {
      cinema: 250,
      schoolroom: 160,
      banquet: 220,
      uShape: 80,
      boardroom: 50,
      cocktail: 300,
      cabaret: 140,
    },
    seasonalPricing: {
      low: {
        name: 'Low Season (Winter / Off-Peak)',
        months: 'May – July',
        fullDayRate: 48000,
        halfDayRate: 32000,
      },
      mid: {
        name: 'Mid Season (Autumn & Spring)',
        months: 'Feb – Apr, Aug – Oct',
        fullDayRate: 65000,
        halfDayRate: 44000,
      },
      peak: {
        name: 'Peak Season (Summer & Year-End)',
        months: 'Nov – Jan',
        fullDayRate: 85000,
        halfDayRate: 58000,
      },
    },
    attendeeTiers: [
      {
        id: 'tier-1',
        name: 'Executive Estate Buyout (1–40 pax)',
        minPax: 1,
        maxPax: 40,
        flatHire: 45000,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-2',
        name: 'Standard Full Buyout (41–80 pax)',
        minPax: 41,
        maxPax: 80,
        flatHire: 62000,
        perExtraPaxRate: 0,
      },
      {
        id: 'tier-3',
        name: 'Summit Takeover (81–150 pax)',
        minPax: 81,
        maxPax: 150,
        flatHire: 78000,
        perExtraPaxRate: 250,
      },
      {
        id: 'tier-4',
        name: 'Grand Estate Festival (151–300 pax)',
        minPax: 151,
        maxPax: 300,
        flatHire: 95000,
        perExtraPaxRate: 350,
      },
    ],
    inclusions: [
      'Exclusive Private Use of All 32 Luxury Hotel Bedrooms & Suites',
      'Exclusive Access to All 4 Event Venues (Main Hall, Dining Room, Pub, Garden)',
      'Dedicated General Manager, Executive Chef & Private Staff Team',
      'Private Bar Service at The Stirrup Cup & Brewery Lawn',
      'Full Access to 2x Stocked Trout Fly Fishing Dams & Tackle',
      'Personalized Corporate Branding & Welcome Banner Placement',
      'Unrestricted Scheduling & Session Flow Across Venues',
      'Total Perimeter Security & Closed Gated Privacy',
    ],
    features: [
      '100% private and confidential estate environment',
      'Zero outside public hotel guests or day visitors',
      'Ultimate flexibility between indoor plenary halls and outdoor lawns',
      'Direct culinary customization with Executive Chef Thabo Khanye',
    ],
    recommendedFor: 'Confidential executive retreats, high-profile corporate summits, national sales conferences, and milestone brand launches.',
    restrictions: 'Requires minimum 30-day notice and 50% non-refundable confirmation deposit.',
    image: estateGroundsImg,
    active: true,
  },
];

export interface VenueHireCalculation {
  baseHire: number;
  extraSurcharge: number;
  totalHire: number;
  model: 'seasonal' | 'attendee-tier';
  seasonName?: string;
  durationName?: string;
  tierName?: string;
  extraPaxCount: number;
  breakdownText: string;
}

export function calculateVenueHireQuote(
  venue: HotelVenue,
  options: {
    model: 'seasonal' | 'attendee-tier';
    season: 'low' | 'mid' | 'peak';
    duration: 'Full-Day' | 'Half-Day';
    attendees: number;
  }
): VenueHireCalculation {
  const { model, season, duration, attendees } = options;

  if (model === 'seasonal') {
    const seasonData = venue.seasonalPricing[season] || venue.seasonalPricing.mid;
    const baseHire = duration === 'Full-Day' ? seasonData.fullDayRate : seasonData.halfDayRate;
    
    // Check if attendees exceed recommended capacity
    const maxCapacity = Math.max(...Object.values(venue.capacities));
    let extraSurcharge = 0;
    let extraPaxCount = 0;

    if (attendees > maxCapacity) {
      extraPaxCount = attendees - maxCapacity;
      extraSurcharge = extraPaxCount * 120; // Default overflow surcharge per head
    }

    const totalHire = baseHire + extraSurcharge;
    const breakdownText = `${seasonData.name} (${duration}) - Base: R${baseHire.toLocaleString()} ${
      extraSurcharge > 0 ? `+ R${extraSurcharge.toLocaleString()} (${extraPaxCount} overflow pax)` : ''
    }`;

    return {
      baseHire,
      extraSurcharge,
      totalHire,
      model: 'seasonal',
      seasonName: seasonData.name,
      durationName: duration,
      extraPaxCount,
      breakdownText,
    };
  } else {
    // Attendee-tier model
    const matchedTier =
      venue.attendeeTiers.find((t) => attendees >= t.minPax && attendees <= t.maxPax) ||
      venue.attendeeTiers[venue.attendeeTiers.length - 1];

    const baseHire = matchedTier.flatHire;
    let extraSurcharge = 0;
    let extraPaxCount = 0;

    if (attendees > matchedTier.maxPax && matchedTier.perExtraPaxRate > 0) {
      extraPaxCount = attendees - matchedTier.maxPax;
      extraSurcharge = extraPaxCount * matchedTier.perExtraPaxRate;
    }

    const totalHire = baseHire + extraSurcharge;
    const breakdownText = `${matchedTier.name} - Flat: R${baseHire.toLocaleString()} ${
      extraSurcharge > 0 ? `+ R${extraSurcharge.toLocaleString()} (${extraPaxCount} extra pax @ R${matchedTier.perExtraPaxRate}/pax)` : ''
    }`;

    return {
      baseHire,
      extraSurcharge,
      totalHire,
      model: 'attendee-tier',
      tierName: matchedTier.name,
      extraPaxCount,
      breakdownText,
    };
  }
}
