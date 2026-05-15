import {
  VOCABULARY,
  VOCABULARY_STATS,
  getCardById,
  getCardsByCategory,
  getCardsByRegion,
  searchCards,
  getRelatedCards,
} from '../data/vocabulary';

describe('VOCABULARY data integrity', () => {
  it('has at least 50 cards', () => {
    expect(VOCABULARY.length).toBeGreaterThanOrEqual(50);
  });

  it('all cards have required fields', () => {
    VOCABULARY.forEach(card => {
      expect(card.id).toBeTruthy();
      expect(card.thai).toBeTruthy();
      expect(card.romanization).toBeTruthy();
      expect(card.ipa).toBeTruthy();
      expect(card.englishMeaning).toBeTruthy();
      if (card.audioFile !== undefined) expect(card.audioFile).toBeTruthy();
      expect(card.exampleSentence).toBeDefined();
      expect(card.exampleSentence.thai).toBeTruthy();
      expect(card.difficultyRating).toBeGreaterThanOrEqual(1);
      expect(card.difficultyRating).toBeLessThanOrEqual(5);
    });
  });

  it('all card IDs are unique', () => {
    const ids = VOCABULARY.map(c => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all relatedCardIds reference existing cards', () => {
    const allIds = new Set(VOCABULARY.map(c => c.id));
    VOCABULARY.forEach(card => {
      card.relatedCardIds?.forEach(relId => {
        expect(allIds.has(relId)).toBe(true);
      });
    });
  });

  it('all tones are valid', () => {
    const validTones = ['mid', 'low', 'falling', 'high', 'rising'];
    VOCABULARY.forEach(card => {
      expect(validTones).toContain(card.tone);
    });
  });

  it('all regions are valid GameRegion values', () => {
    const validRegions = [
      'krung_thon', 'paa_isaan', 'doi_nuea', 'talee_tong',
      'mueang_hin', 'wang_loi_faa', 'daen_winyaan',
    ];
    VOCABULARY.forEach(card => {
      expect(validRegions).toContain(card.region);
    });
  });

  it('example sentences have all required fields', () => {
    VOCABULARY.forEach(card => {
      const ex = card.exampleSentence;
      expect(ex.thai).toBeTruthy();
      expect(ex.romanization).toBeTruthy();
      expect(ex.englishLiteral).toBeTruthy();
      expect(ex.englishNatural).toBeTruthy();
    });
  });
});

describe('getCardById', () => {
  it('finds a card by id', () => {
    const card = getCardById('food_001');
    expect(card).toBeDefined();
    expect(card!.thai).toBe('กิน');
  });

  it('returns undefined for unknown id', () => {
    expect(getCardById('does_not_exist')).toBeUndefined();
  });
});

describe('getCardsByCategory', () => {
  it('returns only cards of specified category', () => {
    const foodCards = getCardsByCategory('food');
    expect(foodCards.length).toBeGreaterThan(0);
    foodCards.forEach(c => expect(c.category).toBe('food'));
  });

  it('returns greetings cards', () => {
    const cards = getCardsByCategory('greetings');
    expect(cards.length).toBeGreaterThan(0);
  });
});

describe('getCardsByRegion', () => {
  it('returns only krung_thon cards', () => {
    const cards = getCardsByRegion('krung_thon');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach(c => expect(c.region).toBe('krung_thon'));
  });
});

describe('searchCards', () => {
  it('finds cards by Thai script', () => {
    const results = searchCards('กิน');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(c => c.thai.includes('กิน'))).toBe(true);
  });

  it('finds cards by romanization', () => {
    const results = searchCards('sa-wat-dee');
    expect(results.length).toBeGreaterThan(0);
  });

  it('finds cards by English meaning', () => {
    const results = searchCards('delicious');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(c => c.englishMeaning.includes('delicious'))).toBe(true);
  });

  it('returns empty array for no match', () => {
    expect(searchCards('zzznomatch')).toHaveLength(0);
  });
});

describe('getRelatedCards', () => {
  it('returns related cards when they exist', () => {
    const card = getCardById('food_001')!; // has relatedCardIds: ['food_002']
    const related = getRelatedCards(card);
    expect(related.length).toBeGreaterThan(0);
    expect(related.some(c => c.id === 'food_002')).toBe(true);
  });

  it('returns empty array for card with no relations', () => {
    const card = getCardById('num_001')!;
    const related = getRelatedCards(card);
    expect(related).toHaveLength(0);
  });
});

describe('VOCABULARY_STATS', () => {
  it('reports correct total', () => {
    expect(VOCABULARY_STATS.total).toBe(VOCABULARY.length);
  });

  it('has cultural notes on some cards', () => {
    expect(VOCABULARY_STATS.withCulturalNotes).toBeGreaterThan(5);
  });

  it('reports cards by category', () => {
    expect(VOCABULARY_STATS.byCategory['food']).toBeGreaterThan(0);
    expect(VOCABULARY_STATS.byCategory['greetings']).toBeGreaterThan(0);
  });
});
