// Map legend — fixed to the bottom-left of the map
// showing what each marker colour means.

import { STATUS_COLOR, STATUS_LABEL, type RequestStatus } from '@/mocks/fixtures/service-requests';

const ORDER: RequestStatus[] = ['open', 'assigned', 'in-progress', 'resolved', 'reopened'];

export function MapLegend() {
  return (
    <div className="glass-card-light rounded-md px-3 py-2.5 text-small shadow-card-md">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
        Status
      </div>
      <ul className="flex flex-col gap-1">
        {ORDER.map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[s].dot, boxShadow: '0 0 0 2px rgba(255,255,255,0.95)' }}
              aria-hidden
            />
            <span className="text-micro text-ink">{STATUS_LABEL[s]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
