import React, { useState, useMemo, useCallback } from 'react';
import { VOCABULARY } from '@engine/data/vocabulary';
import { VocabCard, CardSRSState, TONE_COLORS, GameRegion, SemanticCategory, ThaiTone, REGIONS } from '@engine/types';
import { useGame } from '../context/GameContext';
import { speakThai } from '../utils/audio';
import { getFavorites, toggleFavorite } from '../utils/favorites';

const REGION_COLOR: Record<string, string> = {
  krung_thon: 'var(--r-kt)', paa_isaan: 'var(--r-pi)', doi_nuea: 'var(--r-dn)',
  talee_tong: 'var(--r-tt)', mueang_hin: 'var(--r-mh)', wang_loi_faa: 'var(--r-wl)', daen_winyaan: 'var(--r-dw)',
};

const ALL_TONES: ThaiTone[] = ['mid', 'low', 'falling', 'high', 'rising'];

export function VocabBrowser() {
  const { profile, facade } = useGame();
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState<GameRegion | 'all'>('all');
  const [filterTone, setFilterTone] = useState<ThaiTone | 'all'>('all');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'seen' | 'favorites'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => getFavorites());
  const [hideRoman, setHideRoman] = useState(false);

  const handleToggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nowFav = toggleFavorite(id);
    setFavorites(prev => {
      const next = new Set(prev);
      if (nowFav) next.add(id); else next.delete(id);
      return next;
    });
  }, []);

  const unlocked = profile?.unlockedRegions ?? ['krung_thon'];
  const pool = VOCABULARY.filter(c => unlocked.includes(c.region));
  const srsMap = facade?.srsMap ?? new Map();

  const categories = useMemo(() => {
    const cats = new Set(pool.map(c => c.category));
    return ['all', ...Array.from(cats).sort()] as (SemanticCategory | 'all')[];
  }, [pool.length]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return pool.filter(c => {
      if (filterRegion !== 'all' && c.region !== filterRegion) return false;
      if (filterTone !== 'all' && c.tone !== filterTone) return false;
      if (filterCat !== 'all' && c.category !== filterCat) return false;
      if (filterStatus === 'new' && srsMap.has(c.id)) return false;
      if (filterStatus === 'seen' && !srsMap.has(c.id)) return false;
      if (filterStatus === 'favorites' && !favorites.has(c.id)) return false;

      if (!q) return true;
      return (
        c.thai.includes(q) ||
        c.romanization.toLowerCase().includes(q) ||
        c.englishMeaning.toLowerCase().includes(q) ||
        c.englishAlternatives?.some(a => a.toLowerCase().includes(q))
      );
    });
  }, [pool, search, filterRegion, filterTone, filterCat, filterStatus, srsMap, favorites]);

  const unlockedRegions = unlocked as GameRegion[];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Search */}
      <div style={{ padding: '14px 16px 10px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Vocabulary</div>
          <button
            onClick={() => setHideRoman(h => !h)}
            title={hideRoman ? 'Show romanization' : 'Hide romanization (reading challenge)'}
            style={{ background: hideRoman ? 'var(--warning)' : 'var(--surface-hi)', border: `1px solid ${hideRoman ? 'var(--warning)' : 'var(--border)'}`, borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, color: hideRoman ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}
          >{hideRoman ? '🙈 Roman hidden' : '🔤 Hide roman'}</button>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text-muted)' }}>🔍</span>
          <input
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px 10px 36px', color: 'var(--text)', fontSize: 14, outline: 'none' }}
            placeholder="Search Thai, romanization, or English…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {/* Region chips */}
          <FilterChip label="All regions" active={filterRegion === 'all'} onClick={() => setFilterRegion('all')} color="var(--primary)" />
          {unlockedRegions.map(r => (
            <FilterChip key={r} label={REGIONS[r].nameEnglish.split(' ').slice(1).join(' ') || REGIONS[r].nameEnglish} active={filterRegion === r} onClick={() => setFilterRegion(filterRegion === r ? 'all' : r)} color={REGION_COLOR[r]} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {/* Tone chips */}
          <FilterChip label="All tones" active={filterTone === 'all'} onClick={() => setFilterTone('all')} color="var(--text-sec)" />
          {ALL_TONES.map(t => (
            <FilterChip key={t} label={t} active={filterTone === t} onClick={() => setFilterTone(filterTone === t ? 'all' : t)} color={TONE_COLORS[t]} />
          ))}
        </div>

        {/* Category */}
        <div style={{ marginTop: 8 }}>
          <select
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text)', fontSize: 12, width: '100%' }}
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <FilterChip label="All" active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} color="var(--text-sec)" />
          <FilterChip label="🆕 Unseen" active={filterStatus === 'new'} onClick={() => setFilterStatus(filterStatus === 'new' ? 'all' : 'new')} color="var(--success)" />
          <FilterChip label="📖 Studied" active={filterStatus === 'seen'} onClick={() => setFilterStatus(filterStatus === 'seen' ? 'all' : 'seen')} color="var(--info)" />
          <FilterChip label={`♥ Saved${favorites.size > 0 ? ` (${favorites.size})` : ''}`} active={filterStatus === 'favorites'} onClick={() => setFilterStatus(filterStatus === 'favorites' ? 'all' : 'favorites')} color="var(--error)" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }}>{filtered.length} word{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* List */}
      <div className="scroll" style={{ flex: 1 }}>
        {filtered.map(card => (
          <CardRow
            key={card.id}
            card={card}
            srsState={srsMap.get(card.id) as CardSRSState | undefined}
            isFav={favorites.has(card.id)}
            onFavorite={handleToggleFavorite}
            hideRoman={hideRoman}
            isOpen={expanded === card.id}
            toggle={() => setExpanded(p => p === card.id ? null : card.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔎</div>
            <div>No words match your search</div>
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      style={{
        flexShrink: 0, padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        background: active ? color : 'var(--bg)', border: `1px solid ${active ? color : 'var(--border)'}`,
        color: active ? '#fff' : 'var(--text-sec)', transition: 'all 0.15s',
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function CardRow({ card, isOpen, toggle, srsState, isFav, onFavorite, hideRoman }: {
  card: VocabCard; isOpen: boolean; toggle: () => void; srsState?: CardSRSState;
  isFav: boolean; onFavorite: (id: string, e: React.MouseEvent) => void;
  hideRoman: boolean;
}) {
  const seen = !!srsState;
  const regionColor = REGION_COLOR[card.region] ?? 'var(--primary)';
  const toneColor = TONE_COLORS[card.tone];

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        style={{ width: '100%', background: 'transparent', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}
        onClick={toggle}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <div style={{ width: 4, height: 32, borderRadius: 2, background: regionColor }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: seen ? 'var(--success)' : 'var(--border)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{card.thai}</span>
            {!hideRoman && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{card.romanization}</span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-sec)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.englishMeaning}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: toneColor, background: `${toneColor}22`, borderRadius: 6, padding: '2px 6px' }}>{card.tone}</span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              style={{ background: 'transparent', border: 'none', fontSize: 15, color: isFav ? 'var(--error)' : 'var(--border)', padding: '2px 4px', lineHeight: 1, transition: 'color 0.15s' }}
              onClick={e => onFavorite(card.id, e)}
              title={isFav ? 'Remove from saved' : 'Save word'}
            >{isFav ? '♥' : '♡'}</button>
            <button
              style={{ background: 'transparent', border: 'none', fontSize: 13, color: 'var(--text-muted)', padding: '2px 4px', lineHeight: 1 }}
              onClick={e => { e.stopPropagation(); speakThai(card.thai); }}
            >🔊</button>
            <span style={{ fontSize: 10, color: isOpen ? 'var(--primary)' : 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div style={{ padding: '0 16px 16px 34px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* IPA + category */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {card.ipa && <Tag label={card.ipa} color="var(--text-muted)" />}
            <Tag label={card.category.replace(/_/g, ' ')} color={regionColor} />
            {'difficultyRating' in card && <Tag label={'★'.repeat(card.difficultyRating)} color="var(--gold)" />}
          </div>

          {/* Alternatives */}
          {card.englishAlternatives && card.englishAlternatives.length > 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              also: {card.englishAlternatives.join(', ')}
            </div>
          )}

          {/* Example sentence */}
          {card.exampleSentence && (
            <div style={{ background: 'var(--surface-hi)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{card.exampleSentence.thai}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{card.exampleSentence.romanization}</div>
              <div style={{ fontSize: 12, color: 'var(--text-sec)', fontStyle: 'italic', marginTop: 4 }}>"{card.exampleSentence.englishNatural}"</div>
            </div>
          )}

          {/* Cultural note */}
          {card.culturalNote && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 14 }}>💡</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{card.culturalNote}</span>
            </div>
          )}

          {/* SRS state */}
          {srsState && (
            <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <SRSPill label="Reviews" value={`${srsState.correctReviews}/${srsState.totalReviews}`} color="var(--info)" />
              <SRSPill label="Interval" value={srsState.interval > 0 ? `${srsState.interval}d` : 'New'} color="var(--primary)" />
              <SRSPill label="Ease" value={srsState.easeFactor.toFixed(1)} color="var(--gold)" />
              <SRSPill
                label="Next review"
                value={srsState.isMastered ? '⭐ Mastered' : srsState.nextReviewDate}
                color={srsState.isMastered ? 'var(--gold)' : 'var(--text-muted)'}
              />
            </div>
          )}
          {!srsState && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Not yet studied · appears in your next session</div>
          )}
        </div>
      )}
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize: 11, color, background: `${color}22`, borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>
      {label}
    </span>
  );
}

function SRSPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, flex: 1, minWidth: 60 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</span>
    </div>
  );
}
