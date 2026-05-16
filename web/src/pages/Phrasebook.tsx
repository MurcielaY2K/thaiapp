import React, { useState } from 'react';
import { speakThai } from '../utils/audio';

interface Phrase {
  thai: string;
  romanization: string;
  english: string;
  note?: string;
}

interface PhraseCategory {
  id: string;
  icon: string;
  label: string;
  phrases: Phrase[];
}

const PHRASEBOOK: PhraseCategory[] = [
  {
    id: 'greetings', icon: '👋', label: 'Greetings',
    phrases: [
      { thai: 'สวัสดีครับ / ค่ะ', romanization: 'sa-wat-dii khrap / kha', english: 'Hello / Goodbye', note: 'ครับ for male, ค่ะ for female speaker' },
      { thai: 'สบายดีไหมครับ', romanization: 'sa-baai-dii mai khrap', english: 'How are you?' },
      { thai: 'สบายดีครับ ขอบคุณ', romanization: 'sa-baai-dii khrap, khob-khun', english: 'I\'m fine, thank you' },
      { thai: 'แล้วพบกันใหม่', romanization: 'laeo phop gan mai', english: 'See you again' },
      { thai: 'ยินดีที่ได้รู้จัก', romanization: 'yin-dii thi dai ruu-jak', english: 'Nice to meet you' },
    ],
  },
  {
    id: 'courtesy', icon: '🙏', label: 'Courtesy',
    phrases: [
      { thai: 'ขอบคุณมากครับ', romanization: 'khob-khun maak khrap', english: 'Thank you very much' },
      { thai: 'ไม่เป็นไร', romanization: 'mai pen rai', english: 'No problem / Never mind' },
      { thai: 'ขอโทษครับ', romanization: 'kho-thot khrap', english: 'I\'m sorry / Excuse me' },
      { thai: 'ได้ครับ', romanization: 'dai khrap', english: 'Yes / OK / Agreed' },
      { thai: 'ไม่ได้ครับ', romanization: 'mai dai khrap', english: 'No / Can\'t / Not OK' },
    ],
  },
  {
    id: 'questions', icon: '❓', label: 'Questions',
    phrases: [
      { thai: 'นี่คืออะไร', romanization: 'nii khue a-rai', english: 'What is this?' },
      { thai: 'ที่นี่อยู่ที่ไหน', romanization: 'thi-nii yuu thi-nai', english: 'Where is this place?' },
      { thai: 'เท่าไหร่ครับ', romanization: 'thao-rai khrap', english: 'How much is it?' },
      { thai: 'ทำไมครับ', romanization: 'tham-mai khrap', english: 'Why?' },
      { thai: 'พูดภาษาอังกฤษได้ไหม', romanization: 'phut pha-saa ang-krit dai mai', english: 'Do you speak English?' },
      { thai: 'ช่วยพูดช้าๆ ได้ไหมครับ', romanization: 'chuai phut chaa chaa dai mai khrap', english: 'Can you please speak slowly?' },
    ],
  },
  {
    id: 'food', icon: '🍜', label: 'Food & Drink',
    phrases: [
      { thai: 'อร่อยมาก', romanization: 'a-roi maak', english: 'Very delicious!', note: 'Great compliment after a meal' },
      { thai: 'เผ็ดไหมครับ', romanization: 'phet mai khrap', english: 'Is it spicy?' },
      { thai: 'ไม่เผ็ดได้ไหม', romanization: 'mai phet dai mai', english: 'Can I have it not spicy?' },
      { thai: 'ขอน้ำเปล่าหน่อยครับ', romanization: 'kho naam plao noi khrap', english: 'Can I have some water please?' },
      { thai: 'เก็บตังค์ด้วยครับ', romanization: 'kep tang duai khrap', english: 'Check, please' },
      { thai: 'อิ่มแล้วครับ', romanization: 'im laeo khrap', english: 'I\'m full' },
    ],
  },
  {
    id: 'transport', icon: '🚕', label: 'Transport',
    phrases: [
      { thai: 'ไป... เท่าไหร่', romanization: 'pai ... thao-rai', english: 'How much to go to ...?' },
      { thai: 'จอดตรงนี้ได้เลย', romanization: 'jot trong nii dai loei', english: 'Stop here please' },
      { thai: 'ขึ้นรถได้เลยไหม', romanization: 'khuuen rot dai loei mai', english: 'Can I get in now?' },
      { thai: 'ใกล้แค่ไหน', romanization: 'klai khae nai', english: 'How far is it?' },
      { thai: 'เดินไปได้ไหม', romanization: 'dooen pai dai mai', english: 'Can I walk there?' },
    ],
  },
  {
    id: 'shopping', icon: '🛍️', label: 'Shopping',
    phrases: [
      { thai: 'ลดราคาได้ไหมครับ', romanization: 'lot ra-khaa dai mai khrap', english: 'Can you reduce the price?' },
      { thai: 'แพงไปครับ', romanization: 'phaeng pai khrap', english: 'That\'s too expensive' },
      { thai: 'มีสีอื่นไหม', romanization: 'mii sii uen mai', english: 'Do you have other colors?' },
      { thai: 'ขนาดใหญ่กว่านี้มีไหม', romanization: 'kha-naat yai kwaa nii mii mai', english: 'Do you have a larger size?' },
      { thai: 'ซื้อ... ชิ้น', romanization: 'suue ... chin', english: 'I\'ll buy ... pieces' },
    ],
  },
  {
    id: 'emergency', icon: '🆘', label: 'Emergency',
    phrases: [
      { thai: 'ช่วยด้วย', romanization: 'chuai duai', english: 'Help!' },
      { thai: 'โทรตำรวจด้วย', romanization: 'tho tam-ruat duai', english: 'Call the police!' },
      { thai: 'ไม่สบายครับ', romanization: 'mai sa-baai khrap', english: 'I don\'t feel well' },
      { thai: 'ต้องไปหาหมอ', romanization: 'tong pai haa mo', english: 'I need to see a doctor' },
      { thai: 'หนังสือเดินทางหายครับ', romanization: 'nang-sue dooen-thaang haai khrap', english: 'I lost my passport' },
    ],
  },
];

export function Phrasebook({ onExit }: { onExit: () => void }) {
  const [activeCat, setActiveCat] = useState(PHRASEBOOK[0].id);
  const category = PHRASEBOOK.find(c => c.id === activeCat)!;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <button style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--surface-hi)', color: 'var(--text-sec)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onExit}>✕</button>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 17, textAlign: 'center' }}>Phrasebook</span>
        <div style={{ width: 32 }} />
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', overflowX: 'auto', scrollbarWidth: 'none', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {PHRASEBOOK.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: activeCat === cat.id ? 'var(--primary)' : 'var(--bg)', border: `1px solid ${activeCat === cat.id ? 'var(--primary)' : 'var(--border)'}`, color: activeCat === cat.id ? '#fff' : 'var(--text-sec)', transition: 'all 0.15s' }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Phrases */}
      <div className="scroll" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tap the Thai text or 🔊 to hear it spoken</div>
        {category.phrases.map((phrase, i) => (
          <div
            key={i}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <button
                style={{ background: 'transparent', textAlign: 'left', flex: 1 }}
                onClick={() => speakThai(phrase.thai.split(' / ')[0])}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 4 }}>{phrase.thai}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{phrase.romanization}</div>
              </button>
              <button
                onClick={() => speakThai(phrase.thai.split(' / ')[0])}
                style={{ fontSize: 20, flexShrink: 0, background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >🔊</button>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-sec)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>{phrase.english}</div>
            {phrase.note && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>💡 {phrase.note}</div>
            )}
          </div>
        ))}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
