import { useState, useEffect, useRef } from 'react';
import {
  Bug,
  X,
  MapPin,
  ShieldAlert,
  QrCode,
  PartyPopper,
  Clock,
  Coffee,
  Building2,
  BookOpen,
  Trees,
  ScanLine,
  Check,
  AlertTriangle,
  ShieldCheck,
  Navigation,
  TrendingUp,
  FlaskConical,
} from 'lucide-react';
import type { MeetupLocation } from '@/data/chat';

type DemoView = 'safe-zone' | 'countdown' | 'qr' | 'success' | null;

const DEMO_LOCATIONS: MeetupLocation[] = [
  { name: 'Cabramatta Library', address: 'Hughes St, Cabramatta NSW 2166', distanceKm: 1.2, type: 'library' },
  { name: 'Liverpool Westfields', address: 'Macquarie St, Liverpool NSW 2170', distanceKm: 2.8, type: 'shopping' },
  { name: 'Cabramatta Cafe Central', address: 'Railway Pde, Cabramatta NSW 2166', distanceKm: 0.9, type: 'cafe' },
  { name: 'Parramatta Park Entrance', address: 'Pitt St, Parramatta NSW 2150', distanceKm: 3.5, type: 'park' },
];

const TYPE_ICON: Record<MeetupLocation['type'], typeof Coffee> = {
  cafe: Coffee,
  shopping: Building2,
  library: BookOpen,
  park: Trees,
};

export function DebugBar() {
  const [view, setView] = useState<DemoView>(null);

  const buttons = [
    { id: 'safe-zone' as const, label: 'Safe Zone', icon: MapPin, color: 'text-sky-600' },
    { id: 'countdown' as const, label: 'Ghosting', icon: ShieldAlert, color: 'text-red-500' },
    { id: 'qr' as const, label: 'QR Scanner', icon: QrCode, color: 'text-emerald-600' },
    { id: 'success' as const, label: 'Swap Done', icon: PartyPopper, color: 'text-amber-600' },
  ];

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 bg-ink-50/80 border-b border-line flex-shrink-0 overflow-x-auto">
        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-ink-400 flex-shrink-0">
          <FlaskConical size={10} /> Demo
        </span>
        <div className="flex items-center gap-1.5 ml-1">
          {buttons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => setView(btn.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-line bg-surface hover:bg-lineSoft/60 transition-colors flex-shrink-0"
              >
                <Icon size={12} className={btn.color} />
                <span className="text-[10px] font-bold text-ink-700 whitespace-nowrap">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {view === 'safe-zone' && <DemoSafeZone onClose={() => setView(null)} />}
      {view === 'countdown' && <DemoCountdown onClose={() => setView(null)} />}
      {view === 'qr' && <DemoQR onClose={() => setView(null)} />}
      {view === 'success' && <DemoSuccess onClose={() => setView(null)} />}
    </>
  );
}

function ModalShell({ title, subtitle, icon, iconColor, iconBg, onClose, children }: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] bg-surface rounded-2xl border border-line shadow-2xl flex flex-col overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-lg ${iconBg} border flex items-center justify-center ${iconColor}`}>
              {icon}
            </span>
            <div>
              <h2 className="text-[15px] font-bold text-ink-900">{title}</h2>
              <p className="text-[11px] text-ink-400">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-lineSoft flex items-center justify-center text-ink-500 transition-colors">
            <X size={17} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function DebugBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[9px] font-bold text-amber-600">
      <Bug size={9} /> DEBUG PREVIEW
    </span>
  );
}

function DemoSafeZone({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<MeetupLocation | null>(DEMO_LOCATIONS[0]);

  return (
    <ModalShell
      title="Safe Zone Selector"
      subtitle="Pick a public meetup spot for the trade"
      icon={<MapPin size={16} className="text-emerald-600" />}
      iconColor="text-emerald-600"
      iconBg="bg-emerald-500/10"
      onClose={onClose}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-ink-700">Recommended mid-point locations</p>
          <DebugBadge />
        </div>
        <div className="space-y-2">
          {DEMO_LOCATIONS.map((loc) => {
            const Icon = TYPE_ICON[loc.type];
            const isActive = selected?.name === loc.name;
            return (
              <button
                key={loc.name}
                onClick={() => setSelected(loc)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-emerald-500/50 bg-emerald-500/10 shadow-sm'
                    : 'border-line bg-surface hover:border-line/80 hover:bg-lineSoft/40'
                }`}
              >
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-emerald-500/15 border border-emerald-500/25' : 'bg-lineSoft border border-line'
                }`}>
                  <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-ink-400'} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-bold truncate ${isActive ? 'text-emerald-700' : 'text-ink-900'}`}>{loc.name}</p>
                  <p className="text-[11px] text-ink-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={10} className="text-ink-400" />
                    {loc.address}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <Navigation size={10} />
                    {loc.distanceKm}km
                  </span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                      <Check size={10} /> Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <button
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-bold transition-colors"
        >
          <Check size={15} /> Confirm Safe Zone
        </button>
      </div>
    </ModalShell>
  );
}

function DemoCountdown({ onClose }: { onClose: () => void }) {
  const startTime = useRef(Date.now());
  const [remaining, setRemaining] = useState(15 * 60 * 1000);
  const [expired, setExpired] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - startTime.current;
      const left = Math.max(0, 15 * 60 * 1000 - elapsed);
      setRemaining(left);
      if (left <= 0) setExpired(true);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <ModalShell
      title="Anti-Ghosting Countdown"
      subtitle="15-minute waiting period after check-in"
      icon={<ShieldAlert size={16} className="text-red-500" />}
      iconColor="text-red-500"
      iconBg="bg-red-500/10"
      onClose={onClose}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-600">
            <ShieldAlert size={11} /> Anti-Ghosting Protection Active
          </span>
          <DebugBadge />
        </div>

        <p className="text-[12px] text-ink-500 leading-relaxed">
          You checked in at the safe zone, but the other trader hasn't arrived yet. The 15-minute countdown is running.
          If it expires, you can report them for ghosting — no penalty to you.
        </p>

        <div className="flex flex-col items-center py-6 rounded-xl bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={28} className={expired ? 'text-red-500' : 'text-amber-500'} />
            <span className={`font-mono text-[44px] font-bold tnum ${expired ? 'text-red-500' : 'text-amber-500'}`}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-400">
            {expired ? 'WAITING PERIOD EXPIRED' : 'TIME REMAINING'}
          </span>
        </div>

        {reported ? (
          <div className="flex items-center gap-2 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 text-[12px] font-bold justify-center">
            <AlertTriangle size={14} /> Ghosting Reported — Penalty Applied to Trader
          </div>
        ) : expired ? (
          <button
            onClick={() => setReported(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white text-[13px] font-bold transition-colors"
          >
            <ShieldAlert size={16} /> REPORT GHOSTING
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-lineSoft border border-line text-ink-500 text-[12px] font-bold">
            <Clock size={14} /> Waiting for other trader to arrive...
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: ShieldCheck, label: 'You checked in', active: true },
            { icon: ScanLine, label: 'Trader scanned', active: false },
            { icon: Check, label: 'Both on-site', active: false },
          ].map((step) => (
            <div key={step.label} className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border ${step.active ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-lineSoft/50 border-line'}`}>
              <step.icon size={16} className={step.active ? 'text-emerald-500' : 'text-ink-400'} />
              <span className={`text-[9px] font-bold text-center ${step.active ? 'text-emerald-600' : 'text-ink-400'}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

function DemoQR({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'generate' | 'generated' | 'scanned' | 'inspect' | 'done'>('generate');
  const [inspection, setInspection] = useState<'match' | 'reject' | null>(null);

  return (
    <ModalShell
      title="QR Scanner / Code"
      subtitle="On-site GPS verification via dynamic QR"
      icon={<QrCode size={16} className="text-emerald-600" />}
      iconColor="text-emerald-600"
      iconBg="bg-emerald-500/10"
      onClose={onClose}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600">
            <QrCode size={11} /> Step 2: On-Site Verification
          </span>
          <DebugBadge />
        </div>

        {phase === 'generate' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-line bg-lineSoft/40 flex items-center justify-center mb-4">
              <QrCode size={48} className="text-ink-300" />
            </div>
            <p className="text-[12px] text-ink-500 text-center mb-4 max-w-xs">
              Generate a dynamic QR code. The other trader scans it on-site to verify you're both physically at the same GPS location.
            </p>
            <button
              onClick={() => setPhase('generated')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-[13px] font-bold transition-colors"
            >
              <QrCode size={16} /> Generate QR Code
            </button>
          </div>
        )}

        {phase === 'generated' && (
          <div className="flex flex-col items-center py-6">
            <div className="w-36 h-36 rounded-2xl bg-white border border-line flex items-center justify-center mb-4 shadow-lg">
              <QrCode size={72} className="text-ink-900" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <Check size={12} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-600">QR Generated — waiting for scan</span>
            </div>
            <button
              onClick={() => setPhase('scanned')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-ink-900 hover:bg-ink-700 text-white text-[13px] font-bold transition-colors"
            >
              <ScanLine size={16} /> Simulate Scan
            </button>
          </div>
        )}

        {phase === 'scanned' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mb-4 animate-[scaleIn_0.3s_ease-out]">
              <ShieldCheck size={32} className="text-emerald-600" />
            </div>
            <p className="text-[14px] font-bold text-emerald-700 mb-1">GPS Check-In Verified</p>
            <p className="text-[11px] text-ink-500 mb-4 text-center max-w-xs">Both traders are physically on-site. Proceed to quick inspection.</p>
            <button
              onClick={() => setPhase('inspect')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-[13px] font-bold transition-colors"
            >
              <Check size={16} /> Start Inspection
            </button>
          </div>
        )}

        {phase === 'inspect' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-[12px] font-bold text-amber-600">Quick Inspection</span>
            </div>
            <p className="text-[12px] text-ink-500 leading-relaxed">
              Compare the physical items with their original photos. Confirm they match the descriptions before swapping.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setInspection('match'); setPhase('done'); }}
                className="flex flex-col items-center gap-2 py-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
              >
                <Check size={28} />
                <span className="text-[12px] font-bold">ITEMS MATCH</span>
              </button>
              <button
                onClick={() => { setInspection('reject'); setPhase('done'); }}
                className="flex flex-col items-center gap-2 py-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <AlertTriangle size={28} />
                <span className="text-[12px] font-bold">REJECT SAFELY</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center py-8">
            {inspection === 'match' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <p className="text-[14px] font-bold text-emerald-700 mb-1">Inspection Passed</p>
                <p className="text-[11px] text-ink-500 text-center mb-4">Items match their descriptions. Proceeding to final handshake.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center mb-4">
                  <X size={32} className="text-red-500" />
                </div>
                <p className="text-[14px] font-bold text-red-600 mb-1">Trade Aborted Safely</p>
                <p className="text-[11px] text-ink-500 text-center mb-4">No trust score penalty applied. You've been released from this swap.</p>
              </>
            )}
            <button
              onClick={() => { setPhase('generate'); setInspection(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lineSoft border border-line text-ink-700 hover:bg-lineSoft/70 text-[12px] font-bold transition-colors"
            >
              Restart Demo
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-2">
          {['generate', 'generated', 'scanned', 'inspect', 'done'].map((p, i) => (
            <span
              key={p}
              className={`w-2 h-2 rounded-full transition-colors ${
                ['generate', 'generated', 'scanned', 'inspect', 'done'].indexOf(phase) >= i
                  ? 'bg-emerald-500'
                  : 'bg-line'
              }`}
            />
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

function DemoSuccess({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell
      title="Swap Success"
      subtitle="Trade completed — both traders confirmed"
      icon={<PartyPopper size={16} className="text-amber-500" />}
      iconColor="text-amber-500"
      iconBg="bg-amber-500/10"
      onClose={onClose}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-600">
            <Check size={11} /> SWAP COMPLETED
          </span>
          <DebugBadge />
        </div>

        <div className="flex flex-col items-center py-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-emerald-500/20">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mb-4 animate-[scaleIn_0.4s_ease-out]">
            <PartyPopper size={40} className="text-emerald-600" />
          </div>
          <p className="text-[22px] font-extrabold text-emerald-700 mb-1">SWAP COMPLETED</p>
          <p className="text-[12px] text-ink-500 text-center max-w-xs">
            Both traders confirmed the exchange. Items have been handed over and the trade is locked in.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="flex flex-col items-center gap-2 py-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <TrendingUp size={22} className="text-emerald-600" />
            <p className="text-[11px] font-bold text-emerald-700">Trust Scores</p>
            <p className="text-[10px] text-ink-500 text-center">Increased for both traders</p>
          </div>
          <div className="flex flex-col items-center gap-2 py-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <ShieldCheck size={22} className="text-amber-500" />
            <p className="text-[11px] font-bold text-amber-600">Pending Offers</p>
            <p className="text-[10px] text-ink-500 text-center">Auto-revoked</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Trade Summary</p>
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-line bg-surface">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-1">You gave</p>
              <p className="text-[13px] font-bold text-ink-900">PS5 Slim (Disc Edition)</p>
              <p className="text-[11px] text-ink-500">Est. value $680</p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Check size={16} className="text-emerald-600" />
              </div>
            </div>
            <div className="flex-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-1">You received</p>
              <p className="text-[13px] font-bold text-ink-900">Canon EOS R6 Camera</p>
              <p className="text-[11px] text-ink-500">Est. value $1,650 + $40 cash</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-ink-900 hover:bg-ink-700 text-white text-[13px] font-bold transition-colors"
        >
          <Check size={16} /> Done
        </button>
      </div>
    </ModalShell>
  );
}
