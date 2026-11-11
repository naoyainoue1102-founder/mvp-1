import { useState, useEffect } from 'react';
import {
  MapPin,
  Coffee,
  Home,
  Check,
  ChevronDown,
  ChevronUp,
  QrCode,
  ScanLine,
  Camera,
  ShieldAlert,
  Car,
  Lock,
  Zap,
  AlertTriangle,
  XCircle,
  PartyPopper,
  ShieldCheck,
  TrendingUp,
  Building2,
  BookOpen,
  Trees,
  Clock,
  Minus,
} from 'lucide-react';
import type { ProtocolState, MeetupMode, MeetupLocation } from '@/data/chat';

interface TradeProtocolPanelProps {
  state: ProtocolState;
  myName: string;
  theirName: string;
  isInitiator: boolean;
  perspective: 'me' | 'them';
  safeZoneLocations: MeetupLocation[];
  onProposeMeetup: (details: {
    mode: MeetupMode;
    location: MeetupLocation | null;
    homeOwner: string | null;
    suburbRadius: string | null;
    date: string;
    time: string;
  }) => void;
  onAgreeMeetup: () => void;
  onOnMyWay: () => void;
  onGenerateQR: () => void;
  onScanQR: () => void;
  onInspection: (result: 'match' | 'reject') => void;
  onConfirmFinalSwap: () => void;
  onReportGhosting: () => void;
  onSkipGhosting: () => void;
}

function GhostingCountdown({ startTime, reported, onReport, onSkip }: { startTime: number; reported: boolean; onReport: () => void; onSkip: () => void }) {
  const [remaining, setRemaining] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - startTime;
      const left = Math.max(0, 15 * 60 * 1000 - elapsed);
      setRemaining(left);
      if (left <= 0) setExpired(true);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <ShieldAlert size={13} className="text-red-400" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">Anti-Ghosting</span>
      </div>
      <div className="flex items-center gap-2 mb-2.5">
        <Clock size={14} className={expired ? 'text-red-400' : 'text-amber-400'} />
        <span className={`font-mono text-[18px] font-bold tnum ${expired ? 'text-red-400' : 'text-amber-400'}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
        <span className="text-[9px] font-mono text-slate-500">{expired ? 'EXPIRED' : 'left'}</span>
        {!reported && (
          <button
            onClick={onSkip}
            className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md border border-amber-500/40 text-amber-400 text-[9px] font-bold uppercase tracking-wider hover:bg-amber-500/10 transition-colors"
          >
            <Zap size={10} /> Tua nhanh (Demo)
          </button>
        )}
      </div>
      {reported ? (
        <div className="flex items-center gap-1.5 py-1.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold justify-center">
          <AlertTriangle size={12} /> Ghosting Reported
        </div>
      ) : expired ? (
        <button
          onClick={onReport}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-red-500 hover:bg-red-400 text-white text-[10px] font-bold transition-colors"
        >
          <ShieldAlert size={13} /> REPORT GHOSTING
        </button>
      ) : (
        <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-slate-800 text-slate-500 text-[10px] font-bold">
          <Clock size={12} /> Waiting for trader...
        </div>
      )}
    </div>
  );
}

export function TradeProtocolPanel({
  state,
  myName,
  theirName,
  isInitiator,
  perspective,
  safeZoneLocations,
  onProposeMeetup,
  onAgreeMeetup,
  onOnMyWay,
  onGenerateQR,
  onScanQR,
  onInspection,
  onConfirmFinalSwap,
  onReportGhosting,
  onSkipGhosting,
}: TradeProtocolPanelProps) {
  const [minimized, setMinimized] = useState(false);
  const [expandedStep, setExpandedStep] = useState<ProtocolState['currentStep']>(state.currentStep);
  const [meetupMode, setMeetupMode] = useState<MeetupMode>('safe-zone');
  const [selectedLoc, setSelectedLoc] = useState<MeetupLocation | null>(safeZoneLocations[0] ?? null);
  const [homeOwner, setHomeOwner] = useState<'me' | 'them'>('me');
  const [meetupDate, setMeetupDate] = useState('');
  const [meetupTime, setMeetupTime] = useState('');
  const [proposing, setProposing] = useState(false);

  useEffect(() => {
    if (state.currentStep) setExpandedStep(state.currentStep);
  }, [state.currentStep]);

  const step1 = state.steps[0];
  const step2 = state.steps[1];
  const step3 = state.steps[2];
  const otherPerspective = perspective === 'me' ? 'them' : 'me';
  const myGenerated = state.qrGeneratedBy.includes(perspective);
  const theirGenerated = state.qrGeneratedBy.includes(otherPerspective);
  const myScanned = state.qrScannedBy.includes(perspective);

  const canPropose = meetupMode === 'home-base' || !!selectedLoc;

  const handlePropose = () => {
    if (!canPropose || proposing) return;
    setProposing(true);
    setTimeout(() => {
      onProposeMeetup({
        mode: meetupMode,
        location: meetupMode === 'safe-zone' ? selectedLoc : null,
        homeOwner: meetupMode === 'home-base' ? (homeOwner === 'me' ? myName : theirName) : null,
        suburbRadius: meetupMode === 'home-base' ? '500m radius' : null,
        date: meetupDate,
        time: meetupTime,
      });
      setProposing(false);
    }, 600);
  };

  if (!state.active) return null;

  const steps = [step1, step2, step3];
  const activeIdx = steps.findIndex((s) => s.status === 'active');

  // Minimized: slim bar with current step + expand button
  if (minimized) {
    const currentLabel = state.currentStep
      ? steps.find((s) => s.id === state.currentStep)?.label
      : state.swapCompleted ? 'Swap Completed' : 'Idle';
    return (
      <div className="flex flex-col bg-slate-950 border-t border-emerald-500/20 flex-shrink-0">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 hover:bg-emerald-500/10 border-b border-emerald-500/20 transition-colors w-full"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0">
            <Zap size={11} className="text-emerald-400 fill-emerald-400" />
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">Protocol</span>
          <span className="text-[9px] text-slate-500 truncate flex-1 text-left">
            {state.swapCompleted ? 'Swap completed' : `Step ${activeIdx + 1} of 3 · ${currentLabel}`}
          </span>
          <ChevronUp size={13} className="text-slate-500 flex-shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-950 border-t border-emerald-500/20 flex-shrink-0 max-h-[52vh]">
      {/* Panel header with minimize button */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border-b border-emerald-500/20 flex-shrink-0">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 border border-emerald-500/30 flex-shrink-0">
          <Zap size={11} className="text-emerald-400 fill-emerald-400" />
        </span>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">Protocol</span>

        {/* Mini progress dots */}
        <div className="flex items-center gap-1.5 ml-1">
          {steps.map((s, i) => (
            <span key={s.id} className="flex items-center gap-1.5">
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border text-[8px] font-mono font-bold tnum ${
                  s.status === 'complete'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : s.status === 'active'
                      ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                      : s.status === 'rejected'
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {s.status === 'complete' ? <Check size={9} /> : s.status === 'rejected' ? <XCircle size={9} /> : i + 1}
              </span>
              {i < steps.length - 1 && <span className={`w-3 h-px ${s.status === 'complete' ? 'bg-emerald-500/40' : 'bg-slate-700'}`} />}
            </span>
          ))}
        </div>

        <button
          onClick={() => setMinimized(true)}
          aria-label="Minimize protocol panel"
          className="ml-auto w-6 h-6 rounded hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0"
        >
          <Minus size={13} />
        </button>
      </div>

      <div className="overflow-y-auto">
        {/* COMPLETED STEPS: collapsed one-line summaries, click to expand for review */}
        {step1.status === 'complete' && (
          <CompletedStepRow
            stepNumber={1}
            label="Meetup Scheduled"
            expanded={expandedStep === 'meetup'}
            onToggle={() => setExpandedStep(expandedStep === 'meetup' ? null : 'meetup')}
          >
            <div className="px-2.5 pb-2.5 pt-1 space-y-2">
              {state.meetup && (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800">
                  {state.meetup.mode === 'safe-zone' ? <MapPin size={12} className="text-emerald-400" /> : <Home size={12} className="text-sky-400" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-slate-300 truncate">
                      {state.meetup.location?.name ?? `${state.meetup.homeOwner}'s home`}
                    </p>
                    <p className="text-[8px] text-slate-500">
                      {state.meetup.date} at {state.meetup.time}
                      {state.meetup.mode === 'home-base' && state.meetup.suburbRadius && ` · ${state.meetup.suburbRadius}`}
                    </p>
                  </div>
                </div>
              )}
              {state.meetup?.mode === 'home-base' && state.meetup.onMyWay && state.meetup.addressUnlocked && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <Lock size={11} className="text-emerald-400" />
                  <p className="text-[9px] text-emerald-400 font-semibold">Address Unlocked — full street address revealed</p>
                </div>
              )}
              {state.meetup?.mode === 'home-base' && !state.meetup.onMyWay && (
                <button
                  onClick={onOnMyWay}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold hover:bg-sky-500/20 transition-colors"
                >
                  <Car size={12} /> ON MY WAY
                </button>
              )}
            </div>
          </CompletedStepRow>
        )}

        {step2.status === 'complete' && (
          <CompletedStepRow
            stepNumber={2}
            label="On-Site Verified"
            expanded={expandedStep === 'checkin'}
            onToggle={() => setExpandedStep(expandedStep === 'checkin' ? null : 'checkin')}
          >
            <div className="px-2.5 pb-2.5 pt-1">
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <ShieldCheck size={12} className="text-emerald-400" />
                <p className="text-[10px] text-emerald-300 font-semibold">
                  {state.inspectionResult === 'match' ? 'Items matched — inspection passed' : 'Inspection rejected'}
                </p>
              </div>
            </div>
          </CompletedStepRow>
        )}

        {/* ACTIVE STEP: full content (only one shown at a time) */}
        {step1.status === 'active' && (
          <div className="border-b border-slate-800 bg-sky-500/5">
            <ActiveStepHeader stepNumber={1} label="Meetup Scheduled" />
            <div className="px-3 pb-3 space-y-2.5">
              {state.meetup ? (
                <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  <Clock size={12} className="animate-pulse" />
                  {isInitiator ? `Waiting for ${theirName} to review the meetup...` : 'Review the meetup proposal above to continue'}
                </div>
              ) : !isInitiator ? (
                <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  <Clock size={12} className="animate-pulse" /> Waiting for {theirName} to select meetup spot...
                </div>
              ) : (
              <>
              {/* Mode selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMeetupMode('safe-zone')}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                    meetupMode === 'safe-zone'
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <Coffee size={13} className={meetupMode === 'safe-zone' ? 'text-emerald-400' : 'text-slate-500'} />
                  <div>
                    <p className={`text-[10px] font-bold ${meetupMode === 'safe-zone' ? 'text-emerald-400' : 'text-slate-400'}`}>Safe Zone</p>
                    <p className="text-[8px] text-slate-500">Cafes, malls</p>
                  </div>
                </button>
                <button
                  onClick={() => setMeetupMode('home-base')}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                    meetupMode === 'home-base'
                      ? 'border-sky-500/40 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <Home size={13} className={meetupMode === 'home-base' ? 'text-sky-400' : 'text-slate-500'} />
                  <div>
                    <p className={`text-[10px] font-bold ${meetupMode === 'home-base' ? 'text-sky-400' : 'text-slate-400'}`}>Home Base</p>
                    <p className="text-[8px] text-slate-500">Address Shield</p>
                  </div>
                </button>
              </div>

              {meetupMode === 'safe-zone' && (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Recommended spots</p>
                  {safeZoneLocations.map((loc) => {
                    const Icon = loc.type === 'cafe' ? Coffee : loc.type === 'shopping' ? Building2 : loc.type === 'library' ? BookOpen : Trees;
                    return (
                      <button
                        key={loc.name}
                        onClick={() => setSelectedLoc(loc)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                          selectedLoc?.name === loc.name
                            ? 'border-emerald-500/40 bg-emerald-500/10'
                            : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <Icon size={12} className={selectedLoc?.name === loc.name ? 'text-emerald-400' : 'text-slate-500'} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] font-semibold truncate ${selectedLoc?.name === loc.name ? 'text-emerald-300' : 'text-slate-300'}`}>{loc.name}</p>
                          <p className="text-[8px] text-slate-500 truncate">{loc.address}</p>
                        </div>
                        <span className="text-[8px] font-mono text-slate-500 tnum flex-shrink-0">{loc.distanceKm}km</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {meetupMode === 'home-base' && (
                <div className="space-y-2">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Meet at whose home?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setHomeOwner('me')}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                        homeOwner === 'me' ? 'border-sky-500/40 bg-sky-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <Home size={12} className={homeOwner === 'me' ? 'text-sky-400' : 'text-slate-500'} />
                      <div>
                        <p className={`text-[10px] font-bold ${homeOwner === 'me' ? 'text-sky-300' : 'text-slate-400'}`}>My Home</p>
                        <p className="text-[8px] text-slate-500">{myName}'s address</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setHomeOwner('them')}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-colors ${
                        homeOwner === 'them' ? 'border-sky-500/40 bg-sky-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <Home size={12} className={homeOwner === 'them' ? 'text-sky-400' : 'text-slate-500'} />
                      <div>
                        <p className={`text-[10px] font-bold ${homeOwner === 'them' ? 'text-sky-300' : 'text-slate-400'}`}>Their Home</p>
                        <p className="text-[8px] text-slate-500">{theirName}'s address</p>
                      </div>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <Lock size={11} className="text-amber-400 flex-shrink-0" />
                    <p className="text-[8px] text-amber-400/80">Address Shield: 500m radius shown. Full address unlocks 30-45 min before meetup.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Date</label>
                  <input
                    type="date"
                    value={meetupDate}
                    onChange={(e) => setMeetupDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-2 text-[11px] text-slate-200 outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Time</label>
                  <input
                    type="time"
                    value={meetupTime}
                    onChange={(e) => setMeetupTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-2 text-[11px] text-slate-200 outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <button
                onClick={handlePropose}
                disabled={!canPropose || !meetupDate || !meetupTime || proposing}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-ink-900 text-[11px] font-bold transition-colors"
              >
                {proposing ? (
                  <><span className="w-3 h-3 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" /> Proposing...</>
                ) : (
                  <><MapPin size={13} /> Propose Meetup</>
                )}
              </button>
              </>
              )}
            </div>
          </div>
        )}

        {step2.status === 'active' && (
          <div className="border-b border-slate-800 bg-sky-500/5">
            <ActiveStepHeader stepNumber={2} label="On-Site Verified" />
            <div className="px-3 pb-3 space-y-2.5">
              {state.ghosting.active && state.ghosting.countdownStart && (
                <GhostingCountdown startTime={state.ghosting.countdownStart} reported={state.ghosting.reported} onReport={onReportGhosting} onSkip={onSkipGhosting} />
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onGenerateQR}
                  disabled={myGenerated}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-colors ${
                    myGenerated ? 'border-emerald-500/30 bg-emerald-500/10 cursor-default' : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <QrCode size={18} className={myGenerated ? 'text-emerald-400' : 'text-slate-400'} />
                  <span className={`text-[10px] font-bold ${myGenerated ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {myGenerated ? 'My QR Generated' : 'Generate QR'}
                  </span>
                </button>
                <button
                  onClick={onScanQR}
                  disabled={!theirGenerated || myScanned}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-colors ${
                    myScanned
                      ? 'border-emerald-500/30 bg-emerald-500/10 cursor-default'
                      : !theirGenerated
                        ? 'border-slate-800 bg-slate-900 opacity-40 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <ScanLine size={18} className={myScanned ? 'text-emerald-400' : 'text-slate-400'} />
                  <span className={`text-[10px] font-bold ${myScanned ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {myScanned ? 'Scan Complete' : 'Scan QR'}
                  </span>
                </button>
              </div>
              {!theirGenerated && !myScanned && (
                <p className="text-[9px] text-slate-500 text-center">Scan unlocks once {theirName} generates their QR code. You can generate yours now.</p>
              )}

              {state.qrScanned && state.ghosting.active && state.inspectionResult === null && (
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <Clock size={12} className="text-amber-400" />
                  <p className="text-[10px] text-amber-400 font-semibold">You checked in. Waiting for the other trader...</p>
                </div>
              )}

              {state.qrScanned && !state.ghosting.active && state.inspectionResult === null && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Camera size={12} className="text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Quick Inspection</span>
                  </div>
                  <p className="text-[9px] text-slate-500">Compare physical items with original photos. Confirm they match before swapping.</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onInspection('match')}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition-colors"
                    >
                      <Check size={12} /> ITEMS MATCH
                    </button>
                    <button
                      onClick={() => onInspection('reject')}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-colors"
                    >
                      <AlertTriangle size={12} /> REJECT SAFELY
                    </button>
                  </div>
                </div>
              )}

              {state.inspectionResult === 'reject' && (
                <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                  <XCircle size={12} className="text-red-400" />
                  <p className="text-[10px] text-red-400 font-semibold">Trade aborted safely — no trust score penalty</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step3.status === 'active' && (
          <div className="border-b border-slate-800 bg-sky-500/5">
            <ActiveStepHeader stepNumber={3} label="Final Lock & Handshake" />
            <div className="px-3 pb-3 space-y-2.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <ShieldCheck size={11} className="text-emerald-400 flex-shrink-0" />
                <p className="text-[8px] text-slate-500">Both traders must confirm after holding the swapped items. The platform then auto-completes the swap, updates trust scores, and revokes pending offers.</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${state.finalConfirmedBy.includes(myName) ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-800 border-slate-700'}`}>
                    {state.finalConfirmedBy.includes(myName) && <Check size={11} className="text-emerald-400" />}
                  </span>
                  <span className="text-[10px] text-slate-300">{myName} (You)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${state.finalConfirmedBy.includes(theirName) ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-800 border-slate-700'}`}>
                    {state.finalConfirmedBy.includes(theirName) && <Check size={11} className="text-emerald-400" />}
                  </span>
                  <span className="text-[10px] text-slate-300">{theirName}</span>
                </div>
              </div>

              {!state.finalConfirmedBy.includes(myName) && (
                <button
                  onClick={onConfirmFinalSwap}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-ink-900 text-[11px] font-extrabold tracking-wide transition-all active:scale-[0.98]"
                >
                  <Zap size={14} className="fill-ink-900" />
                  CONFIRM FINAL SWAP
                </button>
              )}
              {state.finalConfirmedBy.includes(myName) && !state.swapCompleted && (
                <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                  <Clock size={12} /> Waiting for {theirName} to confirm...
                </div>
              )}
            </div>
          </div>
        )}

        {/* SWAP COMPLETED (replaces step 3 active content) */}
        {state.swapCompleted && (
          <div className="px-3 py-3">
            <div className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <PartyPopper size={24} className="text-emerald-400" />
              <p className="text-[13px] font-extrabold text-emerald-400">SWAP COMPLETED</p>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                <TrendingUp size={10} className="text-emerald-400" />
                Trust Scores up · Pending offers revoked
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveStepHeader({ stepNumber, label }: { stepNumber: number; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-sky-500/10 border-b border-sky-500/20">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 border border-sky-500/40 flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
      </span>
      <span className="text-[11px] font-bold text-sky-300">Step {stepNumber}: {label}</span>
      <span className="ml-auto text-[8px] font-mono uppercase tracking-wider text-sky-500/60">In Progress</span>
    </div>
  );
}

function CompletedStepRow({ stepNumber, label, expanded, onToggle, children }: {
  stepNumber: number;
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-800 bg-emerald-500/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-emerald-500/10 transition-colors"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 flex-shrink-0">
          <Check size={11} className="text-emerald-400" />
        </span>
        <span className="text-[10px] font-bold text-emerald-400 truncate flex-1">Step {stepNumber}: {label}</span>
        {expanded ? <ChevronUp size={12} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={12} className="text-slate-500 flex-shrink-0" />}
      </button>
      {expanded && children}
    </div>
  );
}
