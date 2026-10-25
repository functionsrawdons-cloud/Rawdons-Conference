import { DepartmentChecklistItem } from '../types/conference';

export const createStandardChecklists = (): DepartmentChecklistItem[] => [
  // --- BANQUETING & FRONT OF HOUSE ---
  {
    id: 'chk-bq-1',
    department: 'Banqueting',
    category: 'Room Setup',
    task: 'Inspect conference seating format, table linen, chair alignment, and AV sightlines',
    timing: '24 Hours Prior',
    responsibleStaff: 'Sarah Mthembu',
    completed: true,
    notes: 'Verify U-shape horseshoe width allows presenter walking room. Double-check table skirting.'
  },
  {
    id: 'chk-bq-2',
    department: 'Banqueting',
    category: 'Table Amenities',
    task: 'Place Rawdons embossed notepads, executive pens, mints, and still/sparkling spring water carafes on every delegate desk',
    timing: 'Day of · 07:00',
    responsibleStaff: 'Bongani Ndlovu',
    completed: true,
    notes: 'Replenish iced water carafes before morning tea and after lunch.'
  },
  {
    id: 'chk-bq-3',
    department: 'Banqueting',
    category: 'Tea Stations',
    task: 'Setup Veranda Arrival Coffee & Scone Station (Silver urns, fresh milk, lemon slices, sweeteners, artisanal teas)',
    timing: 'Day of · 07:15',
    responsibleStaff: 'Banqueting Service Team',
    completed: true,
    notes: 'Check coffee temperature and verify hot chocolate & Milo available as per PDF page 3.'
  },
  {
    id: 'chk-bq-4',
    department: 'Banqueting',
    category: 'Lunch Service',
    task: 'Dining room mise en place: set tables with polished cutlery, napery, wine glasses, and reserved client signs',
    timing: 'Day of · 12:30',
    responsibleStaff: 'Bongani Ndlovu',
    completed: false,
    notes: 'Confirm dietary table placards for vegetarian, vegan, and severe allergy delegates.'
  },
  {
    id: 'chk-bq-5',
    department: 'Banqueting',
    category: 'Evening Service',
    task: 'Set evening banquet room: mood lighting, warm table candles, bar cash register float, clean glassware',
    timing: 'Day of · 17:30',
    responsibleStaff: 'Sarah Mthembu',
    completed: false,
    notes: 'Open estate dining veranda doors for pre-dinner welcome drinks.'
  },

  // --- KITCHEN BRIGADE & CULINARY ---
  {
    id: 'chk-kit-1',
    department: 'Kitchen',
    category: 'Dietary Verification',
    task: 'Review 7-day final dietary run-sheet with Head Chef and print dedicated service pass list',
    timing: '7 Days Prior',
    responsibleStaff: 'Chef Thabo Khanye',
    completed: true,
    notes: 'Highlight critical nut allergy protocol and verify certified halaal supplier delivery.'
  },
  {
    id: 'chk-kit-2',
    department: 'Kitchen',
    category: 'Food Cost Control',
    task: 'Cross-check wholesale protein delivery invoices and ensure total menu cost adheres strictly to 33.0% target',
    timing: '2 Days Prior',
    responsibleStaff: 'Chef Thabo Khanye',
    completed: true,
    notes: 'Verify yields for Midlands beef chuck, chicken breast supremes, and trout fillets.'
  },
  {
    id: 'chk-kit-3',
    department: 'Kitchen',
    category: 'Morning Bakery',
    task: 'Bake morning break assortment: artisan scones, savory muffins, and filled mini croissants',
    timing: 'Day of · 06:45',
    responsibleStaff: 'Sipho Cele (Sous Chef)',
    completed: true,
    notes: 'Bake gluten-free muffins in separate oven tray with dedicated parchment.'
  },
  {
    id: 'chk-kit-4',
    department: 'Kitchen',
    category: 'Buffet Health & Safety',
    task: 'Execute 2-hour buffet service protocol and log temperature probes (Hot dishes > 65°C, cold items < 5°C)',
    timing: 'Day of · 13:00',
    responsibleStaff: 'Chef Thabo Khanye',
    completed: false,
    notes: 'Rawdons health regulations require strictly maximum 2 hours buffet duration.'
  },
  {
    id: 'chk-kit-5',
    department: 'Kitchen',
    category: 'Evening Plated Service',
    task: 'Pre-warm dinner plates, test red wine rosemary jus reduction, and portion proteins to 240g spec',
    timing: 'Day of · 17:45',
    responsibleStaff: 'Sipho Cele',
    completed: false,
    notes: 'Ensure vegetarian potato gnocchi and vegan alternatives ready at the pass simultaneously.'
  },

  // --- ADMIN, SALES & RESERVATIONS ---
  {
    id: 'chk-adm-1',
    department: 'Admin',
    category: 'Proposal & Booking',
    task: 'Issue official 24-hour proposal with estate conference planning guidelines and brochure',
    timing: 'Within 24 Hours',
    responsibleStaff: 'Claire Pillay',
    completed: true,
    notes: 'Proposal sent with provisional 14-day booking hold.'
  },
  {
    id: 'chk-adm-2',
    department: 'Admin',
    category: 'Financials & Deposit',
    task: 'Verify receipt of 50% booking deposit in estate bank account and issue confirmation receipt',
    timing: '14 Days Prior',
    responsibleStaff: 'Claire Pillay',
    completed: false,
    notes: 'Deposit required to finalize lodge accommodation and Mill Room lock-in.'
  },
  {
    id: 'chk-adm-3',
    department: 'Admin',
    category: 'Accommodation Allocations',
    task: 'Process client rooming list into PMS, assign Single & Sharing manor suites, and encode electronic keycards',
    timing: '3 Days Prior',
    responsibleStaff: 'Lauren Van Zyl',
    completed: false,
    notes: 'Prepare VIP welcome letter signed by General Manager for guest check-in desk.'
  },
  {
    id: 'chk-adm-4',
    department: 'Admin',
    category: 'Billing Reconciliation',
    task: 'Generate master pro-forma invoice, reconcile extra delegate day passes, and prepare departure settlement',
    timing: 'Day of · 16:00',
    responsibleStaff: 'Claire Pillay',
    completed: false,
    notes: 'Ensure all beverage tabs and room incidentals are routed to client master account.'
  },

  // --- TECHNICAL & AV ---
  {
    id: 'chk-av-1',
    department: 'Technical & AV',
    category: 'Wi-Fi & Connectivity',
    task: 'Run network speed test in conference room, verify guest SSID bandwidth, and place Wi-Fi tent cards on desks',
    timing: 'Day Prior · 16:00',
    responsibleStaff: 'Estate AV Technician',
    completed: true,
    notes: 'Ensure minimum 50Mbps low-latency connection for remote presenter calls.'
  },
  {
    id: 'chk-av-2',
    department: 'Technical & AV',
    category: 'AV Hardware',
    task: 'Power test 75" UHD presentation displays, HDMI cable switchers, and presentation wireless clicker',
    timing: 'Day of · 07:00',
    responsibleStaff: 'Estate AV Technician',
    completed: true,
    notes: 'Clean projector lens, check spare HDMI/USB-C adapters for Apple/Windows laptops.'
  },
  {
    id: 'chk-av-3',
    department: 'Technical & AV',
    category: 'Sound & Audio',
    task: 'Test wireless roving microphones, podium mic, check audio mixer gains, and put fresh batteries in mic transmitters',
    timing: 'Day of · 07:15',
    responsibleStaff: 'Estate AV Technician',
    completed: true,
    notes: 'Conduct vocal sound-check from back of room.'
  },
  {
    id: 'chk-av-4',
    department: 'Technical & AV',
    category: 'Power & Climate',
    task: 'Calibrate HVAC air-conditioning to 21°C, test standby backup diesel generator, and stack dry firewood for lodge fires',
    timing: 'Day of · 07:30',
    responsibleStaff: 'Maintenance Lead',
    completed: false,
    notes: 'Check fuel levels on estate generator to guarantee zero conference interruptions.'
  }
];
