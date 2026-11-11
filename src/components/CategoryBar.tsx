import { MapPin, X } from 'lucide-react';
import { categories, type CategoryId } from '@/data/items';

interface CategoryBarProps {
  active: CategoryId;
  onChange: (id: CategoryId) => void;
  activeSuburbs: string[];
  suburbs: string[];
  onToggleSuburb: (suburb: string) => void;
  onClearSuburbs: () => void;
}

export function CategoryBar({
  active,
  onChange,
  activeSuburbs,
  suburbs,
  onToggleSuburb,
  onClearSuburbs,
}: CategoryBarProps) {
  const showSuburbs = active === 'stay-near' || active === 'items' || active === 'free-trade';
  const hasActive = activeSuburbs.length > 0;

  return (
    <div className="sticky top-16 z-20 bg-surface/95 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Segmented control — category tabs */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = cat.id === active;
            return (
              <button
                key={cat.id}
                onClick={() => onChange(cat.id)}
                className={`relative py-3 text-[13px] whitespace-nowrap transition-colors ${
                  isActive
                    ? 'font-semibold text-ink-900'
                    : 'font-medium text-ink-400 hover:text-ink-700'
                }`}
              >
                {cat.label}
                <span
                  className={`absolute left-0 right-0 bottom-0 h-px transition-all ${
                    isActive ? 'bg-ink-900 opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Suburb multi-select pills */}
        {showSuburbs && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 -mt-0.5">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400 flex-shrink-0 pr-1">
              <MapPin size={11} /> Near
            </span>
            {suburbs.map((s) => {
              const isOn = activeSuburbs.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => onToggleSuburb(s)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${
                    isOn
                      ? 'bg-ink-900 text-white border-ink-900 shadow-sm shadow-ink-900/20'
                      : 'bg-surface text-ink-500 border-line hover:border-ink-400/50 hover:text-ink-700'
                  }`}
                >
                  {s}
                </button>
              );
            })}
            {hasActive && (
              <button
                onClick={onClearSuburbs}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-ink-500 hover:text-ink-900 hover:bg-lineSoft/70 whitespace-nowrap flex-shrink-0 transition-colors border border-transparent hover:border-line"
              >
                <X size={11} />
                All Suburbs
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
