// Ownership history timeline per property (spec
// §3.2 "Ownership history timeline" Demo-Visual).

export type OwnershipEventKind =
  | 'first-registration'
  | 'transfer'
  | 'inheritance'
  | 'subdivision';

export interface OwnershipEvent {
  id: string;
  propertyId: string;
  kind: OwnershipEventKind;
  from: string;
  to: string;
  at: string; // ISO date
  /** Amount involved when kind is `transfer` and it was a sale. */
  priceUsd?: number;
  /** Gazette / deed reference. */
  reference?: string;
  note?: string;
}

export const OWNERSHIP_LABEL: Record<OwnershipEventKind, string> = {
  'first-registration': 'First registration',
  transfer: 'Transfer',
  inheritance: 'Inheritance',
  subdivision: 'Subdivision',
};

export const OWNERSHIP_EVENTS: OwnershipEvent[] = [
  // Tendai's Nyika stand
  { id: 'oe_4521_a', propertyId: 'p_4521', kind: 'first-registration', from: '—',                    to: 'Ministry of Local Government', at: '1992-06-14', reference: 'GAZ/1992/427' },
  { id: 'oe_4521_b', propertyId: 'p_4521', kind: 'transfer',            from: 'Ministry of Local Government', to: 'Farai Moyo',                 at: '1997-11-03', priceUsd: 4_200, reference: 'BRDC/TR/1997/118' },
  { id: 'oe_4521_c', propertyId: 'p_4521', kind: 'inheritance',         from: 'Farai Moyo',                   to: 'Tendai Moyo',                at: '2018-03-21', reference: 'PROB/2018/092', note: 'Inherited after the passing of Farai Moyo.' },

  // Tendai's Mupani commercial stand
  { id: 'oe_2210_a', propertyId: 'p_2210', kind: 'first-registration', from: '—',           to: 'Mupani Co-operative',        at: '2001-09-08', reference: 'GAZ/2001/311' },
  { id: 'oe_2210_b', propertyId: 'p_2210', kind: 'subdivision',        from: 'Mupani Co-operative', to: 'Mupani Co-operative',   at: '2012-02-15', reference: 'BRDC/SD/2012/004', note: 'Commercial block subdivided from parent stand.' },
  { id: 'oe_2210_c', propertyId: 'p_2210', kind: 'transfer',           from: 'Mupani Co-operative', to: 'Tendai Moyo',           at: '2020-07-30', priceUsd: 18_000, reference: 'BRDC/TR/2020/084' },

  // A couple of others for completeness
  { id: 'oe_1177_a', propertyId: 'p_1177', kind: 'first-registration', from: '—',          to: 'Farai Murwisi', at: '2015-01-12', reference: 'GAZ/2015/018' },
  { id: 'oe_6802_a', propertyId: 'p_6802', kind: 'first-registration', from: '—',          to: 'Rudo Sibanda',  at: '2008-05-25', reference: 'GAZ/2008/242' },
  { id: 'oe_9044_a', propertyId: 'p_9044', kind: 'first-registration', from: '—',          to: 'Kudzai Nyatanga', at: '1984-11-02', reference: 'GAZ/1984/093' },
];

export function ownershipForProperty(propertyId: string): OwnershipEvent[] {
  return OWNERSHIP_EVENTS.filter((e) => e.propertyId === propertyId).sort((a, b) =>
    a.at < b.at ? 1 : -1,
  );
}
