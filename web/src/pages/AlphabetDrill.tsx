import React, { useState } from 'react';
import { speakThai } from '../utils/audio';

interface ConsonantData {
  char: string;
  rtgs: string;
  ipa: string;
  cls: 'mid' | 'high' | 'low';
  example: string;
  exampleMeaning: string;
}

const CLASS_COLOR = { mid: 'var(--text-sec)', high: 'var(--info)', low: 'var(--success)' };
const CLASS_LABEL = { mid: 'Mid', high: 'High', low: 'Low' };
const CLASS_DESC = {
  mid:  'Default tone: mid. 9 consonants.',
  high: 'Default tone: rising. 11 consonants.',
  low:  'Default tone: mid, but shift differently with marks. 24 consonants.',
};

const CONSONANTS: ConsonantData[] = [
  { char: 'ก', rtgs: 'k',  ipa: 'k', cls: 'mid',  example: 'กา',    exampleMeaning: 'crow' },
  { char: 'ข', rtgs: 'kh', ipa: 'kʰ', cls: 'high', example: 'ข้าว',  exampleMeaning: 'rice' },
  { char: 'ค', rtgs: 'kh', ipa: 'kʰ', cls: 'low',  example: 'คน',    exampleMeaning: 'person' },
  { char: 'ง', rtgs: 'ng', ipa: 'ŋ',  cls: 'low',  example: 'งาน',   exampleMeaning: 'work' },
  { char: 'จ', rtgs: 'ch', ipa: 'tɕ', cls: 'mid',  example: 'จาน',   exampleMeaning: 'plate' },
  { char: 'ฉ', rtgs: 'ch', ipa: 'tɕʰ', cls: 'high', example: 'ฉัน',  exampleMeaning: 'I (female)' },
  { char: 'ช', rtgs: 'ch', ipa: 'tɕʰ', cls: 'low',  example: 'ช้าง',  exampleMeaning: 'elephant' },
  { char: 'ซ', rtgs: 's',  ipa: 's',  cls: 'low',  example: 'ซื้อ',   exampleMeaning: 'to buy' },
  { char: 'ญ', rtgs: 'y',  ipa: 'j',  cls: 'low',  example: 'ญาติ',   exampleMeaning: 'relative' },
  { char: 'ด', rtgs: 'd',  ipa: 'd',  cls: 'mid',  example: 'ดี',    exampleMeaning: 'good' },
  { char: 'ต', rtgs: 't',  ipa: 't',  cls: 'mid',  example: 'ตา',    exampleMeaning: 'eye/grandfather' },
  { char: 'ถ', rtgs: 'th', ipa: 'tʰ', cls: 'high', example: 'ถนน',   exampleMeaning: 'road' },
  { char: 'ท', rtgs: 'th', ipa: 'tʰ', cls: 'low',  example: 'ทำ',    exampleMeaning: 'to do' },
  { char: 'น', rtgs: 'n',  ipa: 'n',  cls: 'low',  example: 'น้ำ',   exampleMeaning: 'water' },
  { char: 'บ', rtgs: 'b',  ipa: 'b',  cls: 'mid',  example: 'บ้าน',   exampleMeaning: 'house' },
  { char: 'ป', rtgs: 'p',  ipa: 'p',  cls: 'mid',  example: 'ปลา',   exampleMeaning: 'fish' },
  { char: 'ผ', rtgs: 'ph', ipa: 'pʰ', cls: 'high', example: 'ผม',    exampleMeaning: 'hair / I (male)' },
  { char: 'ฝ', rtgs: 'f',  ipa: 'f',  cls: 'high', example: 'ฝน',    exampleMeaning: 'rain' },
  { char: 'พ', rtgs: 'ph', ipa: 'pʰ', cls: 'low',  example: 'พ่อ',    exampleMeaning: 'father' },
  { char: 'ฟ', rtgs: 'f',  ipa: 'f',  cls: 'low',  example: 'ฟัน',   exampleMeaning: 'tooth' },
  { char: 'ม', rtgs: 'm',  ipa: 'm',  cls: 'low',  example: 'แม่',   exampleMeaning: 'mother' },
  { char: 'ย', rtgs: 'y',  ipa: 'j',  cls: 'low',  example: 'ยา',    exampleMeaning: 'medicine' },
  { char: 'ร', rtgs: 'r',  ipa: 'r',  cls: 'low',  example: 'รัก',   exampleMeaning: 'to love' },
  { char: 'ล', rtgs: 'l',  ipa: 'l',  cls: 'low',  example: 'ลูก',   exampleMeaning: 'child' },
  { char: 'ว', rtgs: 'w',  ipa: 'w',  cls: 'low',  example: 'วัน',   exampleMeaning: 'day' },
  { char: 'ส', rtgs: 's',  ipa: 's',  cls: 'high', example: 'สวัสดี', exampleMeaning: 'hello' },
  { char: 'ห', rtgs: 'h',  ipa: 'h',  cls: 'high', example: 'หมา',   exampleMeaning: 'dog' },
  { char: 'อ', rtgs: 'o',  ipa: 'ʔ',  cls: 'mid',  example: 'อาหาร', exampleMeaning: 'food' },
  { char: 'ฮ', rtgs: 'h',  ipa: 'h',  cls: 'low',  example: 'ฮา',    exampleMeaning: 'ha (laugh)' },
];

const VOWELS = [
  { symbol: 'า', name: 'sara aa',   sound: 'aa', example: 'กา', long: true },
  { symbol: 'ิ', name: 'sara i',    sound: 'i',  example: 'กิน', long: false },
  { symbol: 'ี', name: 'sara ii',   sound: 'ii', example: 'ดี', long: true },
  { symbol: 'ึ', name: 'sara ue',   sound: 'ue', example: 'ถึง', long: false },
  { symbol: 'ื', name: 'sara uee',  sound: 'uee',example: 'มือ', long: true },
  { symbol: 'ุ', name: 'sara u',    sound: 'u',  example: 'กุ้ง', long: false },
  { symbol: 'ู', name: 'sara uu',   sound: 'uu', example: 'รู', long: true },
  { symbol: 'เ', name: 'sara e',    sound: 'e',  example: 'เก่า', long: true },
  { symbol: 'แ', name: 'sara ae',   sound: 'ae', example: 'แมว', long: true },
  { symbol: 'โ', name: 'sara o',    sound: 'o',  example: 'โรง', long: true },
  { symbol: 'ใ', name: 'sara ai',   sound: 'ai', example: 'ใจ', long: true },
  { symbol: 'ไ', name: 'sara ai 2', sound: 'ai', example: 'ไป', long: true },
];

type Tab = 'consonants' | 'vowels';

export function AlphabetDrill({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<Tab>('consonants');
  const [filterCls, setFilterCls] = useState<'all' | 'mid' | 'high' | 'low'>('all');
  const [selected, setSelected] = useState<ConsonantData | null>(null);

  const shown = tab === 'consonants'
    ? CONSONANTS.filter(c => filterCls === 'all' || c.cls === filterCls)
    : [];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--surface-hi)', color: 'var(--text-sec)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onExit}>✕</button>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, textAlign: 'center' }}>Thai Alphabet</span>
        <div style={{ width: 32 }} />
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {(['consonants', 'vowels'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setSelected(null); }}
            style={{ flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 700, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', background: 'transparent', borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`, borderRadius: 0 }}>
            {t === 'consonants' ? '🔤 Consonants' : '🗣️ Vowels'}
          </button>
        ))}
      </div>

      {tab === 'consonants' && (
        <>
          {/* Class filter */}
          <div style={{ display: 'flex', gap: 8, padding: '10px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            {(['all', 'mid', 'high', 'low'] as const).map(cls => (
              <button key={cls} onClick={() => setFilterCls(cls)}
                style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 700, borderRadius: 8, border: `1px solid ${filterCls === cls ? CLASS_COLOR[cls as 'mid'|'high'|'low'] ?? 'var(--primary)' : 'var(--border)'}`, background: filterCls === cls ? `${CLASS_COLOR[cls as 'mid'|'high'|'low'] ?? 'var(--primary)'}22` : 'var(--bg)', color: filterCls === cls ? CLASS_COLOR[cls as 'mid'|'high'|'low'] ?? 'var(--primary)' : 'var(--text-muted)' }}>
                {cls === 'all' ? 'All' : CLASS_LABEL[cls]}
              </button>
            ))}
          </div>

          {filterCls !== 'all' && (
            <div style={{ padding: '8px 16px', background: 'var(--surface-hi)', fontSize: 12, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
              {CLASS_DESC[filterCls]}
            </div>
          )}
        </>
      )}

      <div className="scroll" style={{ flex: 1, padding: 16 }}>
        {tab === 'consonants' ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {shown.map(c => (
                <button
                  key={c.char}
                  onClick={() => { setSelected(p => p?.char === c.char ? null : c); speakThai(c.char); }}
                  style={{
                    background: selected?.char === c.char ? `${CLASS_COLOR[c.cls]}22` : 'var(--surface)',
                    border: `2px solid ${selected?.char === c.char ? CLASS_COLOR[c.cls] : 'var(--border)'}`,
                    borderRadius: 12, padding: '10px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{c.char}</span>
                  <span style={{ fontSize: 10, color: CLASS_COLOR[c.cls], fontWeight: 700 }}>{c.rtgs}</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: CLASS_COLOR[c.cls], flexShrink: 0 }} />
                </button>
              ))}
            </div>

            {selected && (
              <div style={{ marginTop: 16, background: 'var(--surface)', borderRadius: 16, padding: 20, border: `2px solid ${CLASS_COLOR[selected.cls]}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <button
                    onClick={() => speakThai(selected.char)}
                    style={{ fontSize: 64, background: 'var(--surface-hi)', border: `2px solid ${CLASS_COLOR[selected.cls]}`, borderRadius: 16, width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >{selected.char}</button>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: CLASS_COLOR[selected.cls] }}>{selected.rtgs}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>/{selected.ipa}/</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: CLASS_COLOR[selected.cls], background: `${CLASS_COLOR[selected.cls]}22`, borderRadius: 6, padding: '3px 8px', display: 'inline-block', marginTop: 4 }}>{CLASS_LABEL[selected.cls]} class</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => speakThai(selected.example)} style={{ fontSize: 24, fontWeight: 700, background: 'var(--surface-hi)', borderRadius: 10, padding: '8px 14px', border: '1px solid var(--border)' }}>{selected.example} 🔊</button>
                  <div style={{ fontSize: 14, color: 'var(--text-sec)' }}>{selected.exampleMeaning}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>
                  {CLASS_DESC[selected.cls]}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, lineHeight: 1.5 }}>
              Thai has 32 vowels (long &amp; short pairs). Tap a vowel to hear an example word.
            </div>
            {VOWELS.map(v => (
              <button
                key={v.symbol}
                onClick={() => speakThai(v.example)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}
              >
                <span style={{ fontSize: 32, fontWeight: 700, minWidth: 44, textAlign: 'center', color: 'var(--primary)' }}>{v.symbol}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Sound: /{v.sound}/ · {v.long ? 'Long' : 'Short'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{v.example}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔊 tap to hear</div>
                </div>
              </button>
            ))}
          </div>
        )}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
