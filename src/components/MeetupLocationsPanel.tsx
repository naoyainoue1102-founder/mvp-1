import { useState, useMemo } from 'react';
import {
  X,
  MapPin,
  Coffee,
  Building2,
  BookOpen,
  Trees,
  Search,
  Plus,
  Check,
  Navigation,
  Clock,
  Star,
  Shield,
  Trash2,
} from 'lucide-react';
import type { MeetupLocation } from '@/data/chat';

interface MeetupLocationsPanelProps {
  open: boolean;
  onClose: () => void;
  locations: MeetupLocation[];
  onAdd: (loc: MeetupLocation) => void;
  onRemove: (index: number) => void;
}

const TYPE_META: Record<MeetupLocation['type'], { icon: typeof Coffee; label: string; color: string; bg: string; border: string }> = {
  cafe: { icon: Coffee, label: 'Cafe', color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  shopping: { icon: Building2, label: 'Shopping Center', color: 'text-sky-600', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  library: { icon: BookOpen, label: 'Library', color: 'text-violet-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  park: { icon: Trees, label: 'Park', color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

const SAFETY_FEATURES = [
  { icon: Shield, label: 'CCTV monitored' },
  { icon: Clock, label: 'Daytime hours' },
  { icon: Navigation, label: 'Public transport nearby' },
  { icon: Star, label: 'High foot traffic' },
];

export function MeetupLocationsPanel({ open, onClose, locations, onAdd, onRemove }: MeetupLocationsPanelProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MeetupLocation['type'] | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', address: '', distanceKm: '', type: 'cafe' as MeetupLocation['type'] });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return locations.filter((loc) => {
      if (filter !== 'all' && loc.type !== filter) return false;
      if (q && !loc.name.toLowerCase().includes(q) && !loc.address.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [locations, query, filter]);

  const canAdd = newLoc.name.trim() && newLoc.address.trim() && newLoc.distanceKm.trim();

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd({
      name: newLoc.name.trim(),
      address: newLoc.address.trim(),
      distanceKm: parseFloat(newLoc.distanceKm) || 0,
      type: newLoc.type,
    });
    setNewLoc({ name: '', address: '', distanceKm: '', type: 'cafe' });
    setShowAddForm(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] bg-surface rounded-2xl border border-line shadow-2xl flex flex-col overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <MapPin size={16} className="text-emerald-600" />
            </span>
            <div>
              <h2 className="text-[15px] font-bold text-ink-900">Safe Zone Locations</h2>
              <p className="text-[11px] text-ink-400">Public meetup spots recommended for trade exchanges</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg hover:bg-lineSoft flex items-center justify-center text-ink-500 transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* Search + filters */}
        <div className="px-5 py-3 border-b border-line flex-shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-lineSoft/60 border border-line rounded-lg pl-3 pr-2 py-2">
              <Search size={14} className="text-ink-400 flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or address..."
                className="flex-1 bg-transparent text-[12px] text-ink-900 placeholder:text-ink-400 outline-none px-2"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-ink-400 hover:text-ink-700">
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold transition-colors ${
                showAddForm ? 'bg-slate-200 text-ink-500 hover:bg-slate-300' : 'bg-emerald-500 text-white hover:bg-emerald-400'
              }`}
            >
              {showAddForm ? <X size={14} /> : <Plus size={14} />}
              {showAddForm ? 'Cancel' : 'Add'}
            </button>
          </div>

          {/* Type filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
            {(Object.keys(TYPE_META) as MeetupLocation['type'][]).map((t) => {
              const meta = TYPE_META[t];
              const Icon = meta.icon;
              return (
                <FilterChip
                  key={t}
                  active={filter === t}
                  onClick={() => setFilter(t)}
                  label={meta.label}
                  icon={<Icon size={11} />}
                />
              );
            })}
          </div>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="px-5 py-4 border-b border-line bg-lineSoft/30 flex-shrink-0 animate-[fadeIn_0.15s_ease-out]">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">Location Name</label>
                <input
                  value={newLoc.name}
                  onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                  placeholder="e.g. Cabramatta Plaza"
                  className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-[12px] text-ink-900 placeholder:text-ink-400 outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">Address</label>
                <input
                  value={newLoc.address}
                  onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}
                  placeholder="e.g. Hughes St, Cabramatta NSW 2166"
                  className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-[12px] text-ink-900 placeholder:text-ink-400 outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newLoc.distanceKm}
                  onChange={(e) => setNewLoc({ ...newLoc, distanceKm: e.target.value })}
                  placeholder="e.g. 1.5"
                  className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-[12px] text-ink-900 placeholder:text-ink-400 outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block mb-1">Type</label>
                <select
                  value={newLoc.type}
                  onChange={(e) => setNewLoc({ ...newLoc, type: e.target.value as MeetupLocation['type'] })}
                  className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-[12px] text-ink-900 outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {(Object.keys(TYPE_META) as MeetupLocation['type'][]).map((t) => (
                    <option key={t} value={t}>{TYPE_META[t].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-bold transition-colors"
            >
              <Plus size={14} /> Add Safe Zone
            </button>
          </div>
        )}

        {/* Location list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="w-12 h-12 rounded-full bg-lineSoft border border-line flex items-center justify-center mb-3">
                <MapPin size={20} className="text-ink-400" />
              </span>
              <p className="text-[13px] font-semibold text-ink-700">No locations found</p>
              <p className="text-[11px] text-ink-400 mt-1">Try adjusting your search or add a new safe zone.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((loc) => {
                const meta = TYPE_META[loc.type];
                const Icon = meta.icon;
                const originalIndex = locations.indexOf(loc);
                return (
                  <div
                    key={`${loc.name}-${originalIndex}`}
                    className="group flex items-start gap-3 p-3.5 rounded-xl border border-line bg-surface hover:border-line/80 hover:shadow-sm transition-all"
                  >
                    <span className={`w-10 h-10 rounded-lg ${meta.bg} ${meta.border} border flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className={meta.color} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-bold text-ink-900 truncate">{loc.name}</p>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.border} border text-[9px] font-bold ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-ink-400 flex-shrink-0" />
                        {loc.address}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                          <Navigation size={10} />
                          {loc.distanceKm}km away
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-ink-400">
                          <Shield size={10} className="text-emerald-500" />
                          Verified safe zone
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(originalIndex)}
                      aria-label="Remove location"
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-ink-400 hover:text-red-500 flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-line bg-lineSoft/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {SAFETY_FEATURES.slice(0, 2).map((f) => (
                <span key={f.label} className="flex items-center gap-1 text-[10px] font-medium text-ink-500">
                  <f.icon size={11} className="text-emerald-500" />
                  {f.label}
                </span>
              ))}
              <span className="text-[10px] text-ink-400">· 4 safety checks per zone</span>
            </div>
            <span className="text-[11px] font-mono font-semibold text-ink-500 tnum">
              {filtered.length} / {locations.length} locations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
        active ? 'bg-ink-900 text-white' : 'bg-lineSoft text-ink-500 hover:bg-lineSoft/80 border border-line'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
