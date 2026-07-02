// Supabase Edge Function: Stripe webhook → entitlements table.
//
// Deploy:  supabase functions deploy stripe-webhook --no-verify-jwt
// Secrets: supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_...
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)
//
// Stripe events handled:
//   checkout.session.completed        → activate (links auth user ↔ customer/subscription)
//   customer.subscription.updated     → sync status + period end
//   customer.subscription.deleted     → canceled
//   invoice.payment_failed            → past_due
//
// The buyer's Supabase auth uuid arrives as `client_reference_id` on the
// Checkout Session (appended to the Payment Link URL by the app).

import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

function subscriptionStatusToEntitlement(s: Stripe.Subscription.Status): string {
  if (s === 'active' || s === 'trialing') return 'active';
  if (s === 'past_due' || s === 'unpaid') return 'past_due';
  return 'canceled';
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const authId = session.client_reference_id;
        if (!authId) {
          // Paid without an app-provided user id — needs manual linking.
          console.error('checkout.session.completed without client_reference_id', session.id);
          break;
        }
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        let periodEnd: string | null = null;
        let status = 'active';
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          periodEnd = new Date(sub.current_period_end * 1000).toISOString();
          status = subscriptionStatusToEntitlement(sub.status);
        }
        await supabase.from('entitlements').upsert({
          auth_id: authId,
          status,
          stripe_customer_id:
            typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
          stripe_subscription_id: subscriptionId ?? null,
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const status =
          event.type === 'customer.subscription.deleted'
            ? 'canceled'
            : subscriptionStatusToEntitlement(sub.status);
        await supabase
          .from('entitlements')
          .update({
            status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (subId) {
          await supabase
            .from('entitlements')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subId);
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response('Handler error', { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
