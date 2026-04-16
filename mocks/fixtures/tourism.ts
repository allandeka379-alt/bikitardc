// Bikita tourism — seeded sites, culture and
// accommodation for the public /tourism page.
// Spec §3.1 "Bikita tourism page" Demo-Visual.

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
}

export interface CultureItem {
  id: string;
  title: string;
  body: string;
}

export const ATTRACTIONS: Attraction[] = [
  {
    id: 'a_duma',
    name: 'Duma ruins',
    kind: 'historical',
    blurb: 'Stone kraal ruins dating to the 15th century, sheltered in a granite overhang.',
    ward: 'Nhema',
    imageUrl:
      'https://images.unsplash.com/photo-1528312635006-8ea0bc49ec63?w=1000&q=75&auto=format&fit=crop',
  },
  {
    id: 'a_falls',
    name: 'Nyika falls',
    kind: 'natural',
    blurb: 'Two-tier seasonal falls along the Mupani river gorge — spectacular between December and April.',
    ward: 'Nyika',
    imageUrl:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000&q=75&auto=format&fit=crop',
  },
  {
    id: 'a_sacred',
    name: 'Mupani sacred pool',
    kind: 'religious',
    blurb: 'A ceremonial site used for rain-making rituals; visitors welcome with a local guide.',
    ward: 'Mupani',
    imageUrl:
      'https://images.unsplash.com/photo-1552083375-1447ce886485?w=1000&q=75&auto=format&fit=crop',
  },
  {
    id: 'a_craft',
    name: 'Bikita craft market',
    kind: 'cultural',
    blurb: 'Weaving, stone sculpture and beadwork; open every Saturday morning at the Civic Centre.',
    ward: 'Chikwanda',
    imageUrl:
      'https://images.unsplash.com/photo-1533450718592-29d45e4d3dbd?w=1000&q=75&auto=format&fit=crop',
  },
  {
    id: 'a_baobab',
    name: 'Bota baobab grove',
    kind: 'natural',
    blurb: 'A grove of ancient baobabs, some estimated over 1 000 years old. Guided walks daily.',
    ward: 'Bota',
    imageUrl:
      'https://images.unsplash.com/photo-1609519078244-9eaa9cec7fde?w=1000&q=75&auto=format&fit=crop',
  },
];

export const ATTRACTION_LABEL: Record<AttractionKind, string> = {
  natural:     'Natural',
  cultural:    'Cultural',
  historical:  'Historical',
  religious:   'Sacred site',
};

export const GUESTHOUSES: Guesthouse[] = [
  {
    id: 'g_nyika_lodge',
    name: 'Nyika View Lodge',
    tier: 'premium',
    rooms: 16,
    nightlyUsdFrom: 85,
    phone: '+263 77 000 1111',
    blurb: 'Hilltop lodge above Nyika falls. Full-board available. Solar-powered.',
    ward: 'Nyika',
  },
  {
    id: 'g_civic',
    name: 'Civic Centre Inn',
    tier: 'standard',
    rooms: 22,
    nightlyUsdFrom: 45,
    phone: '+263 77 000 2222',
    blurb: 'Conveniently located next to the council offices. Conference facilities.',
    ward: 'Chikwanda',
  },
  {
    id: 'g_bota_rest',
    name: 'Bota Rest House',
    tier: 'budget',
    rooms: 8,
    nightlyUsdFrom: 20,
    phone: '+263 77 000 3333',
    blurb: 'Family-run lodge near the baobab grove. Breakfast included.',
    ward: 'Bota',
  },
  {
    id: 'g_mupani_camp',
    name: 'Mupani camp & guesthouse',
    tier: 'standard',
    rooms: 12,
    nightlyUsdFrom: 55,
    phone: '+263 77 000 4444',
    blurb: 'Camp sites plus 12 self-catering rooms. Cultural evenings on request.',
    ward: 'Mupani',
  },
];

export const TIER_LABEL: Record<GuesthouseTier, string> = {
  budget:   'Budget',
  standard: 'Standard',
  premium:  'Premium',
};

export const CULTURE: CultureItem[] = [
  {
    id: 'c_mukwerera',
    title: 'Mukwerera — rain-making ceremony',
    body: 'Held annually at Mupani sacred pool in October, mukwerera brings elders together to seek good rains for the planting season.',
  },
  {
    id: 'c_jerusarema',
    title: 'Jerusarema dance festival',
    body: 'A traditional dance festival hosted every August at the Bikita Civic Centre. Open to visitors; dress respectfully.',
  },
  {
    id: 'c_cuisine',
    title: 'Local cuisine',
    body: 'Sadza served with wild mushroom relish (nhedzi), peanut-butter muriwo and fresh mopane-worm snacks are local specialities worth seeking out.',
  },
];
