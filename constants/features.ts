// App-wide feature flags.

// PREMIUM_ON_HOLD — while true, the paid Premium tier is suspended:
// every user is treated as Premium (unlimited hearts, all worlds unlocked)
// and the Stripe paywall can never appear. Used to test all layers of the
// app before commercial launch.
//
// To re-enable the paid tier, set this to false. Note: lessons a tester
// unlocked while the hold was active remain unlocked on that device.
export const PREMIUM_ON_HOLD = true;
