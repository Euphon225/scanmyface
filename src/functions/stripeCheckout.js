const { app } = require('@azure/functions');
const Stripe = require('stripe');

function getStripeClient() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
    }

    return new Stripe(secretKey, {
        apiVersion: '2024-06-20',
    });
}

function jsonResponse(status, payload) {
    return {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
    };
}

function resolveOrigin(request) {
    try {
        return new URL(request.url).origin;
    } catch {
        return null;
    }
}

app.http('stripeCheckout', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('stripeCheckout invoked');

        let payload = {};
        try {
            const body = await request.text();
            payload = body ? JSON.parse(body) : {};
        } catch (error) {
            context.log('Invalid JSON body for stripeCheckout:', error?.message || error);
            return jsonResponse(400, { success: false, error: 'Invalid JSON body.' });
        }

        const stripe = getStripeClient();
        const amount = Number(payload.amount ?? 500);
        const currency = (payload.currency || 'eur').toLowerCase();
        const origin = resolveOrigin(request);
        const successUrl = process.env.STRIPE_SUCCESS_URL || (origin ? `${origin}/?checkout=success` : null);
        const cancelUrl = process.env.STRIPE_CANCEL_URL || (origin ? `${origin}/?checkout=cancel` : null);

        if (!Number.isFinite(amount) || amount < 50) {
            context.log('stripeCheckout rejected invalid amount:', payload.amount);
            return jsonResponse(400, {
                success: false,
                error: 'Invalid amount. Minimum amount is 50 cents.'
            });
        }

        if (!successUrl || !cancelUrl) {
            context.log('stripeCheckout missing success/cancel URLs', { successUrl, cancelUrl, origin });
            return jsonResponse(500, {
                success: false,
                error: 'Missing checkout redirect URLs.'
            });
        }

        context.log('Creating Stripe Checkout Session', {
            amount,
            currency,
            successUrl,
            cancelUrl
        });

        try {
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                line_items: [
                    {
                        quantity: 1,
                        price_data: {
                            currency,
                            unit_amount: Math.round(amount),
                            product_data: {
                                name: payload.name || 'FC26 Premium Access',
                                description: payload.description || 'Paiement test pour accès Premium ou don'
                            }
                        }
                    }
                ],
                metadata: {
                    source: 'fc26',
                    purpose: payload.purpose || 'premium'
                }
            });

            context.log('Stripe Checkout Session created:', {
                id: session.id,
                url: session.url
            });

            return jsonResponse(200, {
                success: true,
                url: session.url
            });
        } catch (error) {
            context.log('Stripe Checkout creation failed:', error?.message || error);
            return jsonResponse(500, {
                success: false,
                error: 'Unable to create Stripe Checkout Session.'
            });
        }
    }
});
