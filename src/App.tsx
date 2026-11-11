import { useMemo, useState, useCallback } from 'react';
import { Info, Check } from 'lucide-react';
import { Header } from '@/components/Header';
import { CategoryBar } from '@/components/CategoryBar';
import { ItemCard } from '@/components/ItemCard';
import { QuickViewModal } from '@/components/QuickViewModal';
import { UserProfileModal } from '@/components/UserProfileModal';
import { CreateListingModal } from '@/components/CreateListingModal';
import { Sidebar } from '@/components/Sidebar';
import { ItemsSidebar } from '@/components/ItemsSidebar';
import { StayNearGrouped } from '@/components/StayNearGrouped';
import { ChatDrawer } from '@/components/ChatDrawer';
import { OffersTerminal } from '@/components/OffersTerminal';
import { MakeOfferModal } from '@/components/MakeOfferModal';
import { MeetupLocationsPanel } from '@/components/MeetupLocationsPanel';
import { ControlHub } from '@/components/ControlHub';
import { InventoryWindow } from '@/components/InventoryWindow';
import { generateTraderProfile, type TraderProfile, type ProfileListing } from '@/data/traderProfiles';
import { items, stayNearSuburbs, type CategoryId, type SubCategoryId, type TradeItem } from '@/data/items';
import {
  createThread,
  createOfferMessage,
  createTextMessage,
  createProtocolState,
  createProtocolMessage,
  generateMockOffers,
  SAFE_ZONE_LOCATIONS,
  type ChatThread,
  type IncomingOffer,
  type MeetupMode,
  type MeetupLocation,
  type OfferStatus,
  type ProtocolState,
} from '@/data/chat';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('popular');
  const [activeSuburbs, setActiveSuburbs] = useState<string[]>([]);
  const [selected, setSelected] = useState<TradeItem | null>(null);
  const [profile, setProfile] = useState<TraderProfile | null>(null);
  const [query, setQuery] = useState('');
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategoryId>('all');
  const [userListings, setUserListings] = useState<TradeItem[]>(() => [
    {
      id: 'inv-1',
      title: 'iPad Pro 11" (M2)',
      category: 'items',
      owner: 'You',
      suburb: 'Cabramatta',
      location: 'Cabramatta, NSW',
      distanceKm: 0,
      condition: 'Like New',
      conditionScore: 95,
      estimatedValue: '$900',
      lookingFor: 'Gaming laptop',
      description: 'iPad Pro 11" M2, 256GB, Wi-Fi. Apple Pencil 2 included. Barely used.',
      images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
      subCategory: 'electronics-tech' as SubCategoryId,
      matchRate: 90,
      totalTrades: 3,
      views: 120,
    },
    {
      id: 'inv-2',
      title: 'Sony WH-1000XM5 Headphones',
      category: 'items',
      owner: 'You',
      suburb: 'Cabramatta',
      location: 'Cabramatta, NSW',
      distanceKm: 0,
      condition: 'Mint',
      conditionScore: 98,
      estimatedValue: '$380',
      lookingFor: 'Mechanical keyboard',
      description: 'Sony WH-1000XM5, industry-leading noise cancelling. Original box, case, and cable included.',
      images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
      subCategory: 'electronics-tech' as SubCategoryId,
      matchRate: 85,
      totalTrades: 1,
      views: 65,
    },
    {
      id: 'inv-3',
      title: 'Nintendo Switch OLED + 4 Games',
      category: 'items',
      owner: 'You',
      suburb: 'Cabramatta',
      location: 'Cabramatta, NSW',
      distanceKm: 0,
      condition: 'Good',
      conditionScore: 88,
      estimatedValue: '$300',
      lookingFor: 'PS5 games',
      description: 'Switch OLED, joycons in great shape. Includes Zelda TotK, Mario Odyssey, Smash Bros, and Mario Kart.',
      images: ['https://images.pexels.com/photos/7131262/pexels-photo-7131262.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
      subCategory: 'electronics-tech' as SubCategoryId,
      matchRate: 78,
      totalTrades: 0,
      views: 42,
    },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [terminalListing, setTerminalListing] = useState<TradeItem | null>(null);
  const [terminalOffers, setTerminalOffers] = useState<IncomingOffer[]>([]);
  const [offerTarget, setOfferTarget] = useState<TradeItem | null>(null);
  const [hubOpen, setHubOpen] = useState(false);
  const [invWinOpen, setInvWinOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [safeZoneLocations, setSafeZoneLocations] = useState<MeetupLocation[]>(SAFE_ZONE_LOCATIONS);
  const [activePerspective, setActivePerspective] = useState<'me' | 'them'>('me');

  const handleSelectCategory = (id: CategoryId) => {
    setActiveCategory(id);
    if (id === 'popular') setActiveSuburbs([]);
    if (id !== 'items') setActiveSubCategory('all');
  };

  const handleToggleSuburb = (suburb: string) => {
    setActiveSuburbs((prev) =>
      prev.includes(suburb) ? prev.filter((s) => s !== suburb) : [...prev, suburb]
    );
  };

  const handleClearSuburbs = () => setActiveSuburbs([]);

  const hasActiveSuburbs = activeSuburbs.length > 0;

  const allItems = useMemo(() => items, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((it) => {
      if (activeCategory === 'popular') {
        if (!it.popular) return false;
      } else if (activeCategory === 'free-trade') {
        if (!it.freeTrade) return false;
      } else if (hasActiveSuburbs && !activeSuburbs.includes(it.suburb)) return false;

      if (activeSubCategory !== 'all' && it.subCategory !== activeSubCategory) return false;

      if (q) {
        const haystack = `${it.title} ${it.lookingFor ?? ''} ${it.location} ${it.suburb} ${it.owner}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [activeCategory, activeSuburbs, hasActiveSuburbs, activeSubCategory, query, allItems]);

  const heading = useMemo(() => {
    if (activeCategory === 'popular') return 'Popular trades right now';
    if (activeCategory === 'stay-near') return hasActiveSuburbs ? `Stay near — ${activeSuburbs.length} suburb${activeSuburbs.length > 1 ? 's' : ''} selected` : 'Stay near — pick a suburb';
    if (activeCategory === 'free-trade') return hasActiveSuburbs ? `Free trade near ${activeSuburbs.join(', ')}` : 'Free Trade — swap anything, they accept';
    return hasActiveSuburbs ? `Items near ${activeSuburbs.join(', ')}` : 'All items up for swap';
  }, [activeCategory, activeSuburbs, hasActiveSuburbs]);

  const handleShowProfile = (owner: string, suburb: string) => {
    const extraListings: ProfileListing[] = userListings
      .filter((it) => it.owner === owner)
      .map((it) => ({ title: it.title, value: it.estimatedValue, suburb: it.suburb, matchRate: it.matchRate }));
    setProfile(generateTraderProfile(owner, suburb, extraListings));
  };

  const handlePublish = (item: TradeItem) => {
    setUserListings((prev) => [item, ...prev]);
    setToastMsg('Trade item listed successfully!');
    setToast(true);
    setTimeout(() => setToast(false), 3000);
    setActiveCategory('items');
  };

  const unreadCount = chatThreads.reduce((sum, t) => sum + t.unread, 0);

  const handlePropose = useCallback((targetItem: TradeItem) => {
    setOfferTarget(targetItem);
  }, []);

  const handleOfferSubmit = useCallback(
    (selectedItems: TradeItem[], cashMode: 'even' | 'i-add' | 'host-adds', cashAmount: number, _matchScore: number) => {
      if (!offerTarget || selectedItems.length === 0) return;
      const primaryItem = selectedItems[0];
      const cashTopUp = cashMode === 'even' ? '$0' : cashMode === 'i-add' ? `${cashAmount}` : `-${cashAmount}`;

      const thread = createThread(offerTarget);
      const offerMsg = createOfferMessage(thread.id, 'You', primaryItem, offerTarget, cashTopUp);
      const extraItems = selectedItems.slice(1);
      const messages = [offerMsg];
      if (extraItems.length > 0) {
        messages.push(
          createTextMessage(thread.id, 'system', `+ Additional items offered: ${extraItems.map((it) => it.title).join(', ')}.`),
        );
      }
      messages.push(
        createTextMessage(thread.id, 'system', `OFFER SUBMITTED · PENDING REVIEW — awaiting response from ${offerTarget.owner}.`),
      );
      thread.messages = messages;

      setChatThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
      setOfferTarget(null);
      setChatOpen(true);
      setToastMsg('Swap offer submitted! Chat opened with seller.');
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    },
    [offerTarget],
  );

  const handleSendMessage = useCallback((threadId: string, text: string) => {
    const msg = createTextMessage(threadId, activePerspective, text);
    setChatThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, msg], unread: 0 } : t,
      ),
    );
  }, [activePerspective]);

  const handleOfferAction = useCallback(
    (threadId: string, messageId: string, action: 'accept' | 'decline' | 'counter') => {
      setChatThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          const messages = t.messages.map((m) => {
            if (m.id !== messageId || !m.offer) return m;
            const status: OfferStatus = action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'countered';
            return { ...m, offer: { ...m.offer, status } };
          });
          const systemMsg = createTextMessage(
            threadId,
            'system',
            action === 'accept'
              ? 'Swap accepted by both parties. Arrange a meetup to exchange items.'
              : action === 'decline'
                ? 'Offer declined. You can propose a new trade anytime.'
                : 'Counter offer sent. Waiting for response.',
          );
          if (action === 'accept' && !t.protocolState) {
            const protocolState = createProtocolState();
            protocolState.active = true;
            protocolState.currentStep = 'meetup';
            protocolState.pendingAction = 'me';
            protocolState.steps = protocolState.steps.map((st) =>
              st.id === 'meetup' ? { ...st, status: 'active' } : st,
            );
            const startMsg = createProtocolMessage(threadId, 'protocol-start', 'Trade Protocol activated — both parties accepted the swap. Begin Step 1: schedule a meetup spot.');
            return { ...t, messages: [...messages, systemMsg, startMsg], protocolState };
          }
          return { ...t, messages: [...messages, systemMsg] };
        }),
      );
    },
    [],
  );

  const handleProposeMeetup = useCallback(
    (threadId: string, details: {
      mode: MeetupMode;
      location: MeetupLocation | null;
      homeOwner: string | null;
      suburbRadius: string | null;
      date: string;
      time: string;
    }) => {
      const meetupDetails = {
        mode: details.mode,
        location: details.location,
        homeOwner: details.homeOwner,
        suburbRadius: details.suburbRadius,
        fullAddress: null,
        date: details.date,
        time: details.time,
        proposer: 'proposer' as const,
        agreed: false,
        onMyWay: false,
        addressUnlocked: false,
      };
      const locText = details.mode === 'safe-zone'
        ? `${details.location?.name} — ${details.location?.address}`
        : `${details.homeOwner}'s home (${details.suburbRadius} radius — full address unlocks 30-45 min before meetup)`;
      const msg = createProtocolMessage(
        threadId,
        'meetup-proposal',
        `Meetup proposed: ${locText} on ${details.date} at ${details.time}.`,
        { meetup: meetupDetails },
      );
      setChatThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId || !t.protocolState) return t;
          const messages = t.messages.filter((m) => m.protocol?.protocolType !== 'meetup-proposal');
          return {
            ...t,
            messages: [...messages, msg],
            protocolState: { ...t.protocolState, meetup: meetupDetails, pendingAction: 'them' },
          };
        }),
      );
    },
    [],
  );

  const handleAgreeMeetup = useCallback((threadId: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const meetup = t.protocolState?.meetup ? { ...t.protocolState.meetup, agreed: true } : null;
        const msg = createProtocolMessage(
          threadId,
          'meetup-agreed',
          'Meetup confirmed by both parties. Proceed to Step 2: On-site QR check-in.',
          { meetup: meetup ?? undefined },
        );
        return {
          ...t,
          messages: [...t.messages, msg],
          protocolState: t.protocolState
            ? { ...t.protocolState, meetup, pendingAction: 'me', steps: t.protocolState.steps.map((st) => st.id === 'meetup' ? { ...st, status: 'complete' } : st.id === 'checkin' ? { ...st, status: 'active' } : st), currentStep: 'checkin' }
            : t.protocolState,
        };
      }),
    );
  }, []);

  const handleOnMyWay = useCallback((threadId: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId || !t.protocolState?.meetup) return t;
        const meetup = { ...t.protocolState.meetup, onMyWay: true, addressUnlocked: true };
        const msg = createProtocolMessage(threadId, 'address-unlocked', 'Address Shield unlocked — full street address revealed.', { meetup });
        return {
          ...t,
          messages: [...t.messages, msg],
          protocolState: { ...t.protocolState, meetup },
        };
      }),
    );
  }, []);

  const handleGenerateQR = useCallback((threadId: string, perspective: 'me' | 'them') => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId || !t.protocolState) return t;
        if (t.protocolState.qrGeneratedBy.includes(perspective)) return t;
        const msg = createProtocolMessage(threadId, 'qr-generated', 'Dynamic QR code generated. The other trader must scan it on-site to verify GPS presence.');
        return {
          ...t,
          messages: [...t.messages, msg],
          protocolState: { ...t.protocolState, qrGeneratedBy: [...t.protocolState.qrGeneratedBy, perspective] },
        };
      }),
    );
  }, []);

  const handleScanQR = useCallback((threadId: string, perspective: 'me' | 'them') => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId || !t.protocolState) return t;
        const ps = t.protocolState;
        const other = perspective === 'me' ? 'them' : 'me';
        if (!ps.qrGeneratedBy.includes(other) || ps.qrScannedBy.includes(perspective)) return t;
        const qrScannedBy = [...ps.qrScannedBy, perspective];
        if (qrScannedBy.length >= 2) {
          const msg = createProtocolMessage(threadId, 'qr-scanned', 'Both traders checked in via QR — both are on-site. Proceed to quick inspection.');
          return {
            ...t,
            messages: [...t.messages, msg],
            protocolState: {
              ...ps,
              qrScannedBy,
              pendingAction: 'me',
              ghosting: { ...ps.ghosting, active: false, checkedInUser: null, countdownStart: null },
              rewards: { trustScore: 3, swapPoints: 100 },
            },
          };
        }
        const checkedIn = perspective === 'me' ? 'You are' : `${t.participantName} is`;
        const msg = createProtocolMessage(threadId, 'qr-scanned', `QR scan complete — ${checkedIn} checked in. Waiting for the other trader to scan. Anti-ghosting protection is active.`);
        return {
          ...t,
          messages: [...t.messages, msg],
          protocolState: {
            ...ps,
            qrScanned: true,
            qrScannedBy,
            pendingAction: other,
            ghosting: { ...ps.ghosting, active: true, checkedInUser: perspective === 'me' ? 'You' : t.participantName, countdownStart: Date.now() },
          },
        };
      }),
    );
  }, []);

  const handleInspection = useCallback((threadId: string, result: 'match' | 'reject') => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId || !t.protocolState) return t;
        const msg = createProtocolMessage(
          threadId,
          'inspection-result',
          result === 'match' ? 'Inspection passed — items match their descriptions. Proceed to Step 3: Final lock and handshake.' : 'Inspection failed — trade aborted safely. No trust score penalty applied.',
          { inspection: result },
        );
        const steps = result === 'match'
          ? t.protocolState.steps.map((st) => st.id === 'checkin' ? { ...st, status: 'complete' as const } : st.id === 'final' ? { ...st, status: 'active' as const } : st)
          : t.protocolState.steps.map((st) => st.id === 'checkin' ? { ...st, status: 'rejected' as const } : st);
        return {
          ...t,
          messages: [...t.messages, msg],
          protocolState: { ...t.protocolState, inspectionResult: result, pendingAction: result === 'match' ? 'me' : null, steps, currentStep: result === 'match' ? 'final' : null, ghosting: { ...t.protocolState.ghosting, active: false } },
        };
      }),
    );
  }, []);

  const handleConfirmFinalSwap = useCallback((threadId: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId || !t.protocolState) return t;
        const theirName = t.participantName;
        const confirmer = activePerspective === 'me' ? 'You' : theirName;
        const finalConfirmedBy = [...new Set([...t.protocolState.finalConfirmedBy, confirmer])];
        const swapCompleted = finalConfirmedBy.length >= 2;
        const steps = swapCompleted
          ? t.protocolState.steps.map((st) => st.id === 'final' ? { ...st, status: 'complete' as const } : st)
          : t.protocolState.steps;
        const msg = swapCompleted
          ? createProtocolMessage(threadId, 'swap-completed', 'SWAP COMPLETED — both traders confirmed. Trust scores increased. All other pending offers auto-revoked.')
          : createProtocolMessage(threadId, 'final-swap', `${confirmer} confirmed the final swap. Waiting for the other trader.`, { finalConfirmedBy });
        return {
          ...t,
          messages: [...t.messages, msg],
          protocolState: { ...t.protocolState, finalConfirmedBy, swapCompleted, steps, pendingAction: swapCompleted ? null : 'them', currentStep: swapCompleted ? null : t.protocolState.currentStep },
        };
      }),
    );
  }, [activePerspective]);

  const handleReportGhosting = useCallback((threadId: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId || !t.protocolState) return t;
        const msg = createProtocolMessage(threadId, 'ghosting-reported', 'Ghosting reported — penalty applied to the no-show trader. You have been released from this swap.');
        return {
          ...t,
          messages: [...t.messages, msg],
          protocolState: {
            ...t.protocolState,
            ghosting: { ...t.protocolState.ghosting, reported: true, active: false },
            steps: t.protocolState.steps.map((st) => st.id === 'checkin' ? { ...st, status: 'rejected' as const } : st),
            currentStep: null,
          },
        };
      }),
    );
  }, []);

  const handleAddLocation = useCallback((loc: MeetupLocation) => {
    setSafeZoneLocations((prev) => [...prev, loc]);
    setToastMsg('Safe zone location added.');
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }, []);

  const handleRemoveLocation = useCallback((index: number) => {
    setSafeZoneLocations((prev) => prev.filter((_, i) => i !== index));
    setToastMsg('Safe zone location removed.');
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }, []);

  const handleSelectThread = useCallback((id: string) => {
    setActiveThreadId(id);
    setChatThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)),
    );
  }, []);

  const toggleChat = useCallback(() => {
    setChatOpen((v) => !v);
  }, []);

  const handleOpenTerminal = useCallback((listing: TradeItem) => {
    const offers = generateMockOffers(listing, items);
    setTerminalOffers(offers);
    setTerminalListing(listing);
  }, []);

  const handleExecuteOffer = useCallback(
    (offer: IncomingOffer) => {
      if (!terminalListing) return;
      const traderItem: TradeItem = {
        id: `trader-${offer.id}`,
        title: offer.offererItemTitle,
        category: 'items',
        owner: offer.offererName,
        suburb: terminalListing.suburb,
        location: terminalListing.location,
        distanceKm: 0,
        condition: offer.offererCondition,
        conditionScore: offer.offererConditionScore,
        estimatedValue: offer.offererEstimatedValue,
        lookingFor: terminalListing.title,
        description: 'Offered item for swap.',
        images: [offer.offererItemImage],
        subCategory: 'electronics-tech' as SubCategoryId,
        matchRate: offer.matchScore,
        totalTrades: 0,
        views: 0,
      };

      const thread = createThread(traderItem);
      const offerMsg = createOfferMessage(thread.id, offer.offererName, traderItem, terminalListing, offer.cashTopUp);
      const sysMsg = createTextMessage(thread.id, 'system', `SWAP MATCHED via Trading Terminal. ${offer.offererName}'s offer was accepted. All other offers have been closed.`);
      thread.messages = [offerMsg, sysMsg];

      setChatThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
      setChatOpen(true);
      setTerminalListing(null);
    },
    [terminalListing],
  );

  return (
    <div className="min-h-screen bg-canvas text-ink-900">
      <Header query={query} onQueryChange={setQuery} onOpenChat={toggleChat} onOpenHub={() => setHubOpen(true)} onOpenLocations={() => setLocationsOpen(true)} unreadCount={unreadCount} />

      <CategoryBar
        active={activeCategory}
        onChange={handleSelectCategory}
        activeSuburbs={activeSuburbs}
        suburbs={stayNearSuburbs}
        onToggleSuburb={handleToggleSuburb}
        onClearSuburbs={handleClearSuburbs}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
          <section className="lg:col-span-7 min-w-0">
        {/* Page header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-ink-900 tracking-tight">{heading}</h2>
            {activeCategory !== 'stay-near' && (
              <p className="text-[11px] text-ink-400 mt-0.5 tnum">
                {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} · live feed
              </p>
            )}
          </div>
        </div>

        {/* Free Trade info card — flat institutional style */}
        {activeCategory === 'free-trade' && (
          <div className="mb-5 p-3.5 rounded-xl border border-line bg-surface flex items-start gap-3">
            <span className="w-7 h-7 rounded-md bg-lineSoft border border-line flex items-center justify-center text-ink-500 flex-shrink-0">
              <Info size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-900">How Free Trade works</p>
              <p className="text-[11px] text-ink-500 mt-0.5 leading-relaxed">
                These owners did not specify what they want. Tap any listing and offer your own item — they will review and accept or pass. No haggling, just proposals.
              </p>
            </div>
          </div>
        )}

        {activeCategory === 'stay-near' && !hasActiveSuburbs ? (
          <StayNearGrouped
            suburbs={stayNearSuburbs}
            items={filtered}
            onOpen={setSelected}
            onSelectSuburb={handleToggleSuburb}
          />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-line rounded-xl bg-surface">
            <p className="font-semibold text-ink-900 text-sm">No matches found</p>
            <p className="text-[11px] text-ink-500 mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-4">
            {filtered.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onOpen={setSelected}
                highlight={item.popular && activeCategory === 'popular'}
                onAddTrade={() => setShowCreate(true)}
              />
            ))}
          </div>
        )}

        <footer className="mt-16 pt-6 border-t border-line text-center text-[11px] text-ink-400">
          <p>&copy; 2026 Swappy — a demo trading marketplace. Data is illustrative.</p>
        </footer>
          </section>

          {activeCategory === 'items' ? (
            <ItemsSidebar active={activeSubCategory} onChange={setActiveSubCategory} />
          ) : (
            <Sidebar onAddTrade={() => setShowCreate(true)} />
          )}
        </div>
      </main>

      <QuickViewModal item={selected} onClose={() => setSelected(null)} onShowProfile={handleShowProfile} onPropose={handlePropose} />
      <UserProfileModal profile={profile} onClose={() => setProfile(null)} />
      <CreateListingModal open={showCreate} onClose={() => setShowCreate(false)} onPublish={handlePublish} />

      <OffersTerminal
        open={!!terminalListing}
        listing={terminalListing}
        offers={terminalOffers}
        onClose={() => setTerminalListing(null)}
        onExecute={handleExecuteOffer}
      />

      <MakeOfferModal
        open={!!offerTarget}
        targetItem={offerTarget}
        inventory={userListings}
        onClose={() => setOfferTarget(null)}
        onAddQuickItem={() => { setOfferTarget(null); setShowCreate(true); }}
        onSubmit={handleOfferSubmit}
      />

      <MeetupLocationsPanel
        open={locationsOpen}
        onClose={() => setLocationsOpen(false)}
        locations={safeZoneLocations}
        onAdd={handleAddLocation}
        onRemove={handleRemoveLocation}
      />

      <ControlHub
        open={hubOpen}
        onClose={() => setHubOpen(false)}
        inventory={userListings}
        onAddItem={() => { setHubOpen(false); setShowCreate(true); }}
        onOpenInventory={() => { setHubOpen(false); setInvWinOpen(true); }}
      />

      <InventoryWindow
        open={invWinOpen}
        onClose={() => setInvWinOpen(false)}
        inventory={userListings}
        onAddItem={() => { setInvWinOpen(false); setShowCreate(true); }}
        onViewTradeBoard={() => {}}
        onCancelOffer={() => {}}
      />


      <ChatDrawer
        open={chatOpen}
        onToggle={toggleChat}
        threads={chatThreads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onSendMessage={handleSendMessage}
        onOfferAction={handleOfferAction}
        onProposeMeetup={handleProposeMeetup}
        onAgreeMeetup={handleAgreeMeetup}
        onOnMyWay={handleOnMyWay}
        onGenerateQR={handleGenerateQR}
        onScanQR={handleScanQR}
        onInspection={handleInspection}
        onConfirmFinalSwap={handleConfirmFinalSwap}
        onReportGhosting={handleReportGhosting}
        safeZoneLocations={safeZoneLocations}
        unreadCount={unreadCount}
        activePerspective={activePerspective}
        onSwitchPerspective={() => setActivePerspective((p) => (p === 'me' ? 'them' : 'me'))}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-lg bg-ink-900 text-white text-[13px] font-medium flex items-center gap-2 animate-[scaleIn_0.2s_ease-out] border border-ink-700 shadow-lg">
          <Check size={15} className="text-odds-up" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
