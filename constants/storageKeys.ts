// Single source of truth for AsyncStorage keys. lib/progressSync.ts writes
// these keys directly when restoring a cloud snapshot, so every store MUST
// read its state through this map — never a locally re-declared literal.
export const StorageKeys = {
  // progressStore
  xp:             '@thaiapp_xp',
  hearts:         '@thaiapp_hearts',
  gems:           '@thaiapp_gems',
  premium:        '@thaiapp_premium_v2',
  lessonProgress: '@thaiapp_lesson_progress',
  lessonStars:    '@thaiapp_lesson_stars',
  skillLevel:     '@thaiapp_skill_level',
  dailyXp:        '@thaiapp_daily_xp',
  // srsStore
  srsProgress:    '@thaiapp_progress',
  writing:        '@thaiapp_writing',
  streak:         '@thaiapp_streak',
  // userStore
  profile:        '@thaiapp_user_profile',
  rewards:        '@thaiapp_unlocked_rewards',
} as const;
