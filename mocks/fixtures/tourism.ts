// Bikita tourism — real attractions, resorts, dams
// and cultural sites across the district.
// Photos served from /public/tourism/ — provided by
// Bikita Rural District Council.

export type AttractionKind = 'natural' | 'cultural' | 'historical' | 'religious';
export type GuesthouseTier = 'budget' | 'standard' | 'premium';

export interface Attraction {
  id: string;
  name: string;
  kind: AttractionKind;
  blurb: string;
  ward: string;
  imageUrl: string;
}

export interface Guesthouse {
  id: string;
  name: string;
  tier: GuesthouseTier;
  rooms: number;
  nightlyUsdFrom: number;
  phone: string;
  blurb: string;
  ward: string;
  imageUrl?: string;
}

export interface CultureItem {
  id: string;
  title: string;
  body: string;
}

export const ATTRACTIONS: Attraction[] = [
  {
    id: 'a_chibvumani',
    name: 'Chibvumani National Monument',
    kind: 'historical',
    blurb:
      'Ancient stone enclosure of the Rozvi era — one of the best-preserved dry-stone walled monuments in southern Zimbabwe.',
    ward: 'Nhema',
    imageUrl: '/tourism/chibvumani-monument.jpg',
  },
  {
    id: 'a_musimbira',
    name: 'Musimbira Ruins',
    kind: 'historical',
    blurb:
      'Stone ruins on a hillside plateau, traditionally associated with pre-colonial Shona settlement and governance.',
    ward: 'Mupani',
    imageUrl: '/tourism/musimbira-ruins.webp',
  },
  {
    id: 'a_chingoma',
    name: 'Chingoma Falls',
    kind: 'natural',
    blurb:
      'Seasonal waterfall on the Gande River in Chimbidzikai Village, Ward 4 — spectacular through the rainy months.',
    ward: 'Ward 4',
    imageUrl: '/tourism/chingoma-falls.jpg',
  },
  {
    id: 'a_chirirangoma',
    name: 'Chirirangoma Falls',
    kind: 'natural',
    blurb:
      'Two-tier falls on the Svibira River at Marecha / Mutsimba Village — popular weekend picnic spot.',
    ward: 'Marecha',
    imageUrl: '/tourism/chirirangoma-falls.jpg',
  },
  {
    id: 'a_hanyanya',
    name: 'Hanyanya Mountain',
    kind: 'natural',
    blurb:
      'A granite mountain offering panoramic views of the district — guided hikes available from the base camp.',
    ward: 'Bikita',
    imageUrl: '/tourism/hanyanya-mountain.jpg',
  },
  {
    id: 'a_nerumedzo',
    name: 'Nerumedzo Jiri Forest',
    kind: 'religious',
    blurb:
      'Sacred indigenous forest — home of the harurwa (stink bugs) and wild mazhanje fruit. A protected cultural heritage site.',
    ward: 'Nyika',
    imageUrl: '/tourism/nerumedzo-jiri-forest.jpg',
  },
  {
    id: 'a_siya_dam',
    name: 'Siya Dam',
    kind: 'natural',
    blurb:
      'The largest dam in Bikita district — year-round fishing, boat rides and a calm sunrise spot for birdwatching.',
    ward: 'Nhema',
    imageUrl: '/tourism/siya-dam.jpg',
  },
  {
    id: 'a_rozva_dam',
    name: 'Rozva Dam',
    kind: 'natural',
    blurb:
      'Community-managed dam with fishing cooperatives and stocked bream — angling permits issued by the council.',
    ward: 'Mupani',
    imageUrl: '/tourism/rozva-dam.jpg',
  },
  {
    id: 'a_zizhou_dam',
    name: 'Zizhou Dam · Silveira',
    kind: 'natural',
    blurb:
      'Quiet dam below Silveira Mission — great for walk-in picnics and a good stop on the pilgrim route.',
    ward: 'Silveira',
    imageUrl: '/tourism/zizhou-dam.jpg',
  },
  {
    id: 'a_devure_ranch',
    name: 'Devure Ranch',
    kind: 'natural',
    blurb:
      'Working conservancy with plains game — arranged game drives for school groups, researchers and eco-tourism visitors.',
    ward: 'Bota',
    imageUrl: '/tourism/devure-ranch.png',
  },
];

export const ATTRACTION_LABEL: Record<AttractionKind, string> = {
  natural:    'Natural',
  cultural:   'Cultural',
  historical: 'Historical',
  religious:  'Sacred site',
};

export const GUESTHOUSES: Guesthouse[] = [
  {
    id: 'g_chakas_lodge',
    name: "Chaka's Lodge & Holiday Resort",
    tier: 'premium',
    rooms: 24,
    nightlyUsdFrom: 85,
    phone: '+263 77 000 1111',
    blurb:
      'Full-service resort with conference rooms, pool and on-site restaurant. A top pick for weddings and corporate retreats.',
    ward: 'Nyika',
    imageUrl: '/tourism/chakas-lodge.jpg',
  },
  {
    id: 'g_chininga_resort',
    name: 'Chininga Resort',
    tier: 'standard',
    rooms: 18,
    nightlyUsdFrom: 55,
    phone: '+263 77 000 2222',
    blurb:
      'Family-friendly lakeside resort with self-catering cottages, chalets and a children\u2019s play area.',
    ward: 'Mupani',
    imageUrl: '/tourism/chininga-resort.jpg',
  },
  {
    id: 'g_silveira_guesthouse',
    name: 'Silveira Mission Guesthouse',
    tier: 'budget',
    rooms: 10,
    nightlyUsdFrom: 25,
    phone: '+263 77 000 3333',
    blurb:
      'Simple rooms on the Silveira Mission campus — breakfast included, perfect for pilgrims and retreat groups.',
    ward: 'Silveira',
  },
  {
    id: 'g_civic_centre_inn',
    name: 'Civic Centre Inn',
    tier: 'standard',
    rooms: 14,
    nightlyUsdFrom: 45,
    phone: '+263 77 000 4444',
    blurb:
      'Next to the Bikita civic centre with conference facilities and Wi-Fi — convenient for visiting contractors and council business.',
    ward: 'Chikwanda',
  },
];

export const TIER_LABEL: Record<GuesthouseTier, string> = {
  budget:   'Budget',
  standard: 'Standard',
  premium:  'Premium',
};

export const CULTURE: CultureItem[] = [
  {
    id: 'c_harurwa',
    title: 'Harurwa — the sacred stink bugs of Nerumedzo',
    body: 'Seasonally harvested from the Jiri forest, harurwa are a protected cultural delicacy. Collection is governed by customary rules and council by-laws alike.',
  },
  {
    id: 'c_mazhanje',
    title: 'Mazhanje — wild loquat season',
    body: 'Every March the mazhanje (wild loquat) fruit ripens across Bikita\u2019s indigenous forests — a beloved seasonal snack and roadside trade.',
  },
  {
    id: 'c_mukwerera',
    title: 'Mukwerera — rain-making ceremony',
    body: 'Held annually at traditional sacred pools in October; elders gather to seek good rains for the planting season.',
  },
  {
    id: 'c_silveira_heritage',
    title: 'Silveira Mission heritage',
    body: 'One of the oldest Catholic missions in southern Zimbabwe, still a working pilgrimage site with a hospital, schools and the Zizhou Dam nearby.',
  },
];
