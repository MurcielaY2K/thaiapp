import React, { useState, useMemo } from 'react';
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
      { thai: 'สวัสดีครับ / ค่ะ', romanization: 'sa-wat-dii khrap / kha', english: 'Hello / Goodbye', note: 'ครับ for male speakers, ค่ะ for female speakers' },
      { thai: 'สบายดีไหมครับ', romanization: 'sa-baai-dii mai khrap', english: 'How are you?' },
      { thai: 'สบายดีครับ ขอบคุณ', romanization: 'sa-baai-dii khrap, khob-khun', english: "I'm fine, thank you" },
      { thai: 'แล้วพบกันใหม่', romanization: 'laeo phop gan mai', english: 'See you again' },
      { thai: 'ยินดีที่ได้รู้จัก', romanization: 'yin-dii thi dai ruu-jak', english: 'Nice to meet you' },
      { thai: 'สวัสดีตอนเช้า', romanization: 'sa-wat-dii ton chao', english: 'Good morning' },
      { thai: 'สวัสดีตอนเย็น', romanization: 'sa-wat-dii ton yen', english: 'Good evening' },
      { thai: 'ฝันดีครับ', romanization: 'fan dii khrap', english: 'Good night / Sweet dreams' },
      { thai: 'นานไม่ได้เจอกัน', romanization: 'naan mai dai joe gan', english: 'Long time no see' },
      { thai: 'คุณชื่ออะไรครับ', romanization: 'khun chue a-rai khrap', english: 'What is your name?' },
      { thai: 'ผม/ดิฉันชื่อ...', romanization: 'phom / di-chan chue ...', english: 'My name is ...', note: 'ผม for male, ดิฉัน for female' },
      { thai: 'คุณมาจากไหน', romanization: 'khun maa jaak nai', english: 'Where are you from?' },
      { thai: 'ผมมาจากอเมริกา', romanization: 'phom maa jaak a-me-ri-kaa', english: 'I am from America' },
    ],
  },
  {
    id: 'courtesy', icon: '🙏', label: 'Courtesy',
    phrases: [
      { thai: 'ขอบคุณมากครับ', romanization: 'khob-khun maak khrap', english: 'Thank you very much' },
      { thai: 'ไม่เป็นไร', romanization: 'mai pen rai', english: 'No problem / Never mind', note: 'The most versatile phrase in Thai — use it often!' },
      { thai: 'ขอโทษครับ', romanization: 'kho-thot khrap', english: "I'm sorry / Excuse me" },
      { thai: 'ได้ครับ', romanization: 'dai khrap', english: 'Yes / OK / Agreed' },
      { thai: 'ไม่ได้ครับ', romanization: 'mai dai khrap', english: "No / Can't / Not OK" },
      { thai: 'กรุณา...', romanization: 'ga-ru-naa ...', english: 'Please ... (formal)' },
      { thai: 'ขอ... หน่อยได้ไหมครับ', romanization: 'kho ... noi dai mai khrap', english: 'May I have ... please?' },
      { thai: 'ยินดีครับ', romanization: 'yin-dii khrap', english: "You're welcome / My pleasure" },
      { thai: 'ขอบใจมากนะ', romanization: 'khop-jai maak na', english: 'Thanks a lot (informal)' },
      { thai: 'ไม่ต้องครับ', romanization: 'mai tong khrap', english: "No need / Don't bother" },
      { thai: 'โปรดรอสักครู่', romanization: 'prote ro sak khru', english: 'Please wait a moment' },
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
      { thai: 'หมายความว่าอะไร', romanization: 'maai khwaam waa a-rai', english: 'What does this mean?' },
      { thai: 'เขียนได้ไหมครับ', romanization: 'khian dai mai khrap', english: 'Can you write it down?' },
      { thai: 'พูดอีกทีได้ไหม', romanization: 'phut iik thii dai mai', english: 'Can you say that again?' },
      { thai: 'ใช่ไหมครับ', romanization: 'chai mai khrap', english: 'Is that right? / Correct?' },
      { thai: 'กี่โมงครับ', romanization: 'kii mong khrap', english: 'What time is it?' },
      { thai: 'วันนี้วันอะไรครับ', romanization: 'wan-nii wan a-rai khrap', english: 'What day is today?' },
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
      { thai: 'อิ่มแล้วครับ', romanization: 'im laeo khrap', english: "I'm full" },
      { thai: 'ขอเมนูหน่อยครับ', romanization: 'kho me-nuu noi khrap', english: 'May I have the menu?' },
      { thai: 'แนะนำอะไรได้บ้างครับ', romanization: 'nae-nam a-rai dai baang khrap', english: 'What do you recommend?' },
      { thai: 'กินเจครับ', romanization: 'kin je khrap', english: "I'm vegetarian" },
      { thai: 'แพ้ถั่วลิสงครับ', romanization: 'phae thua li-song khrap', english: "I'm allergic to peanuts" },
      { thai: 'อร่อยดีมากเลย', romanization: 'a-roi dii maak loei', english: 'This tastes really great!' },
      { thai: 'ขอสั่งอาหารได้เลยไหมครับ', romanization: 'kho sang aa-haan dai loei mai khrap', english: 'May I order now?' },
      { thai: 'ขอกล่องกลับบ้านได้ไหม', romanization: 'kho klong klab baan dai mai', english: 'Can I have a takeaway box?' },
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
      { thai: 'สถานีรถไฟอยู่ที่ไหน', romanization: 'sa-thaa-nii rot-fai yuu thi-nai', english: 'Where is the train station?' },
      { thai: 'สนามบินอยู่ที่ไหนครับ', romanization: 'sa-naam-bin yuu thi-nai khrap', english: 'Where is the airport?' },
      { thai: 'รถเมล์สาย... ผ่านที่นี่ไหม', romanization: 'rot-mee saai ... phaan thi-nii mai', english: 'Does bus number ... stop here?' },
      { thai: 'เรียกแท็กซี่ให้หน่อยได้ไหม', romanization: 'riak thek-sii hai noi dai mai', english: 'Can you call a taxi for me?' },
      { thai: 'ขอแผนที่หน่อยครับ', romanization: 'kho phaen-thi noi khrap', english: 'May I have a map?' },
    ],
  },
  {
    id: 'shopping', icon: '🛍️', label: 'Shopping',
    phrases: [
      { thai: 'ลดราคาได้ไหมครับ', romanization: 'lot ra-khaa dai mai khrap', english: 'Can you reduce the price?' },
      { thai: 'แพงไปครับ', romanization: 'phaeng pai khrap', english: "That's too expensive" },
      { thai: 'มีสีอื่นไหม', romanization: 'mii sii uen mai', english: 'Do you have other colors?' },
      { thai: 'ขนาดใหญ่กว่านี้มีไหม', romanization: 'kha-naat yai kwaa nii mii mai', english: 'Do you have a larger size?' },
      { thai: 'ซื้อ... ชิ้น', romanization: 'suue ... chin', english: "I'll buy ... pieces" },
      { thai: 'ดูได้ไหมครับ', romanization: 'duu dai mai khrap', english: 'Can I look at it?' },
      { thai: 'ลองได้ไหมครับ', romanization: 'long dai mai khrap', english: 'Can I try it on?' },
      { thai: 'จ่ายด้วยบัตรได้ไหม', romanization: 'jai duai bat dai mai', english: 'Can I pay by card?' },
      { thai: 'ของแท้ไหมครับ', romanization: 'khong thae mai khrap', english: 'Is this authentic/genuine?' },
      { thai: 'เอาอันนี้ครับ', romanization: 'ao an nii khrap', english: "I'll take this one" },
      { thai: 'มีถุงให้ไหมครับ', romanization: 'mii thung hai mai khrap', english: 'Do you have a bag?' },
    ],
  },
  {
    id: 'directions', icon: '🧭', label: 'Directions',
    phrases: [
      { thai: 'ตรงไป', romanization: 'trong pai', english: 'Go straight' },
      { thai: 'เลี้ยวซ้าย', romanization: 'liiao saai', english: 'Turn left' },
      { thai: 'เลี้ยวขวา', romanization: 'liiao khwaa', english: 'Turn right' },
      { thai: 'อยู่ตรงหัวมุม', romanization: 'yuu trong hua mum', english: "It's at the corner" },
      { thai: 'อยู่ใกล้ๆ', romanization: 'yuu klai klai', english: "It's nearby" },
      { thai: 'อยู่ไกลมาก', romanization: 'yuu klai maak', english: "It's far away" },
      { thai: 'ห้องน้ำอยู่ที่ไหนครับ', romanization: 'hong-naam yuu thi-nai khrap', english: 'Where is the restroom?' },
      { thai: 'โรงพยาบาลอยู่ที่ไหน', romanization: 'rong-pha-yaa-baan yuu thi-nai', english: 'Where is the hospital?' },
      { thai: 'ร้านสะดวกซื้ออยู่ที่ไหน', romanization: 'raan sa-duak-suue yuu thi-nai', english: 'Where is the convenience store?' },
      { thai: 'ขึ้นลิฟต์ได้ที่ไหน', romanization: 'khuuen lif dai thi-nai', english: 'Where can I take the elevator?' },
    ],
  },
  {
    id: 'hotel', icon: '🏨', label: 'Hotel & Stay',
    phrases: [
      { thai: 'จองห้องพักไว้ครับ', romanization: 'jong hong phak wai khrap', english: 'I have a reservation' },
      { thai: 'มีห้องว่างไหมครับ', romanization: 'mii hong waang mai khrap', english: 'Do you have available rooms?' },
      { thai: 'ราคาคืนละเท่าไหร่', romanization: 'ra-khaa khuuen la thao-rai', english: 'How much per night?' },
      { thai: 'เช็คอินได้กี่โมง', romanization: 'chek-in dai kii mong', english: 'What time is check-in?' },
      { thai: 'เช็คเอาท์กี่โมงครับ', romanization: 'chek-ao kii mong khrap', english: 'What time is check-out?' },
      { thai: 'รวมอาหารเช้าไหมครับ', romanization: 'ruam aa-haan chao mai khrap', english: 'Is breakfast included?' },
      { thai: 'ห้องมีปัญหาครับ', romanization: 'hong mii pan-haa khrap', english: 'There is a problem with the room' },
      { thai: 'ขอผ้าเช็ดตัวเพิ่มได้ไหม', romanization: 'kho phaa-chet-tua phoem dai mai', english: 'Can I have more towels?' },
      { thai: 'ขอกุญแจสำรองได้ไหม', romanization: 'kho gun-jae sam-rong dai mai', english: 'Can I have a spare key?' },
      { thai: 'Wi-Fi รหัสผ่านคืออะไรครับ', romanization: 'wai-fai ra-hat-phaan khue a-rai khrap', english: 'What is the Wi-Fi password?' },
    ],
  },
  {
    id: 'smalltalk', icon: '💬', label: 'Small Talk',
    phrases: [
      { thai: 'คุณทำงานอะไรครับ', romanization: 'khun tham-ngaan a-rai khrap', english: 'What do you do for work?' },
      { thai: 'ผมเป็นนักท่องเที่ยว', romanization: 'phom pen nak-thong-thiiao', english: "I'm a tourist" },
      { thai: 'ประเทศไทยสวยมาก', romanization: 'pra-thet thai suai maak', english: 'Thailand is very beautiful' },
      { thai: 'คนไทยน่ารักมาก', romanization: 'khon thai naa-rak maak', english: 'Thai people are very kind' },
      { thai: 'กำลังเรียนภาษาไทยครับ', romanization: 'gam-lang rian pha-saa thai khrap', english: "I'm learning Thai" },
      { thai: 'ภาษาไทยยากมาก', romanization: 'pha-saa thai yaak maak', english: 'Thai is very difficult' },
      { thai: 'ผมชอบอาหารไทยมาก', romanization: 'phom chob aa-haan thai maak', english: 'I love Thai food' },
      { thai: 'อากาศร้อนมากเลย', romanization: 'aa-gaat ron maak loei', english: "It's so hot today" },
      { thai: 'คิดถึงประเทศไทยครับ', romanization: 'kit thueng pra-thet thai khrap', english: 'I miss Thailand' },
      { thai: 'จะกลับมาอีกครับ', romanization: 'ja glap maa iik khrap', english: "I'll come back again" },
    ],
  },
  {
    id: 'numbers', icon: '🔢', label: 'Numbers & Time',
    phrases: [
      { thai: 'หนึ่ง สอง สาม', romanization: 'nueng song saam', english: 'One, two, three' },
      { thai: 'สี่ ห้า หก', romanization: 'sii haa hok', english: 'Four, five, six' },
      { thai: 'เจ็ด แปด เก้า สิบ', romanization: 'jet paet kao sip', english: 'Seven, eight, nine, ten' },
      { thai: 'ตอนนี้กี่โมงครับ', romanization: 'ton-nii kii mong khrap', english: 'What time is it now?' },
      { thai: 'บ่ายสองโมงครับ', romanization: 'baai song mong khrap', english: "It's 2 PM" },
      { thai: 'เที่ยงคืน', romanization: 'thiiang-khuuen', english: 'Midnight' },
      { thai: 'วันนี้ / พรุ่งนี้ / เมื่อวาน', romanization: 'wan-nii / phrung-nii / mueua-waan', english: 'Today / Tomorrow / Yesterday' },
      { thai: 'เดือนนี้ / เดือนหน้า', romanization: 'duean-nii / duean-naa', english: 'This month / Next month' },
      { thai: 'ปีนี้ / ปีหน้า', romanization: 'pii-nii / pii-naa', english: 'This year / Next year' },
      { thai: 'สัปดาห์ที่แล้ว', romanization: 'sap-daa thi laeo', english: 'Last week' },
    ],
  },
  {
    id: 'emergency', icon: '🆘', label: 'Emergency',
    phrases: [
      { thai: 'ช่วยด้วย', romanization: 'chuai duai', english: 'Help!' },
      { thai: 'โทรตำรวจด้วย', romanization: 'tho tam-ruat duai', english: 'Call the police!' },
      { thai: 'โทรรถพยาบาลด้วย', romanization: 'tho rot-pha-yaa-baan duai', english: 'Call an ambulance!' },
      { thai: 'ไม่สบายครับ', romanization: 'mai sa-baai khrap', english: "I don't feel well" },
      { thai: 'ต้องไปหาหมอ', romanization: 'tong pai haa mo', english: 'I need to see a doctor' },
      { thai: 'หนังสือเดินทางหายครับ', romanization: 'nang-sue dooen-thaang haai khrap', english: 'I lost my passport' },
      { thai: 'ถูกขโมยครับ', romanization: 'thuuk kha-mooi khrap', english: 'I was robbed' },
      { thai: 'ไฟไหม้', romanization: 'fai mai', english: 'Fire!' },
      { thai: 'ต้องการล่ามครับ', romanization: 'tong-gaan laam khrap', english: 'I need an interpreter' },
      { thai: 'สถานทูตอยู่ที่ไหนครับ', romanization: 'sa-thaan-thuut yuu thi-nai khrap', english: 'Where is the embassy?' },
    ],
  },
];

export function Phrasebook({ onExit }: { onExit: () => void }) {
  const [activeCat, setActiveCat] = useState<string | 'all'>('greetings');
  const [search, setSearch] = useState('');

  const allPhrases = useMemo(() =>
    PHRASEBOOK.flatMap(cat => cat.phrases.map(p => ({ ...p, catId: cat.id, catIcon: cat.icon, catLabel: cat.label }))),
    []
  );

  const isSearching = search.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = search.toLowerCase().trim();
    return allPhrases.filter(p =>
      p.thai.includes(q) ||
      p.romanization.toLowerCase().includes(q) ||
      p.english.toLowerCase().includes(q) ||
      p.note?.toLowerCase().includes(q)
    );
  }, [search, allPhrases]);

  const category = PHRASEBOOK.find(c => c.id === activeCat);
  const displayPhrases = isSearching ? searchResults : (category?.phrases ?? []);
  const totalPhrases = PHRASEBOOK.reduce((s, c) => s + c.phrases.length, 0);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 12px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--surface-hi)', color: 'var(--text-sec)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onExit}>✕</button>
          <span style={{ flex: 1, fontWeight: 700, fontSize: 17, textAlign: 'center' }}>Phrasebook</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 32, textAlign: 'right' }}>{totalPhrases}</span>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: 'var(--text-muted)' }}>🔍</span>
          <input
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 12px 9px 36px', color: 'var(--text)', fontSize: 14, outline: 'none' }}
            placeholder="Search Thai, romanization, or English…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', color: 'var(--text-muted)', fontSize: 16, padding: 4 }}>✕</button>
          )}
        </div>
      </div>

      {/* Category chips — hidden while searching */}
      {!isSearching && (
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
      )}

      {/* Phrases list */}
      <div className="scroll" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isSearching ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tap the Thai text or 🔊 to hear it spoken</div>
        )}

        {displayPhrases.map((phrase, i) => (
          <PhraseCard
            key={i}
            phrase={phrase}
            catLabel={isSearching && 'catLabel' in phrase ? `${'catIcon' in phrase ? phrase.catIcon : ''} ${'catLabel' in phrase ? phrase.catLabel : ''}` : undefined}
          />
        ))}

        {displayPhrases.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔎</div>
            <div>No phrases match your search</div>
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

function PhraseCard({ phrase, catLabel }: { phrase: Phrase; catLabel?: string }) {
  const [showRoman, setShowRoman] = useState(true);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
      {catLabel && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{catLabel}</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <button
          style={{ background: 'transparent', textAlign: 'left', flex: 1 }}
          onClick={() => speakThai(phrase.thai.split(' / ')[0])}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 4 }}>{phrase.thai}</div>
          {showRoman && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{phrase.romanization}</div>}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => speakThai(phrase.thai.split(' / ')[0])}
            style={{ fontSize: 18, background: 'var(--surface-hi)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >🔊</button>
          <button
            onClick={() => setShowRoman(r => !r)}
            title={showRoman ? 'Hide romanization' : 'Show romanization'}
            style={{ fontSize: 12, background: showRoman ? 'var(--surface-hi)' : 'var(--warning)', border: `1px solid ${showRoman ? 'var(--border)' : 'var(--warning)'}`, borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: showRoman ? 'var(--text-muted)' : '#fff' }}
          >あ</button>
        </div>
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-sec)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>{phrase.english}</div>
      {phrase.note && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>💡 {phrase.note}</div>
      )}
    </div>
  );
}
