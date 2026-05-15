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

app.http('create-checkout', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('create-checkout invoked');

        // Parse request body
        let payload = {};
        try {
            const body = await request.text();
            payload = body ? JSON.parse(body) : {};
        } catch (error) {
            context.log('Invalid JSON body for create-checkout:', error?.message || error);
            return jsonResponse(400, { success: false, error: 'Invalid JSON body.' });
        }

        // Validate priceId
        const priceId = payload.priceId;
        if (!priceId || typeof priceId !== 'string' || priceId.trim() === '') {
            context.log('create-checkout rejected: missing or invalid priceId', { priceId });
            return jsonResponse(400, {
                success: false,
                error: 'Missing or invalid priceId in request body.'
            });
        }

        const stripe = getStripeClient();

        // Configure success and cancel URLs
        const successUrl = 'https://scanmyface.gg/success.html?session_id={CHECKOUT_SESSION_ID}';
        const cancelUrl = 'https://scanmyface.gg/cancel.html';

        context.log('Creating Stripe Checkout Session', {
            priceId,
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
                        price: priceId,
                        quantity: 1
                    }
                ]
            });

            context.log('Checkout Session created successfully', {
                sessionId: session.id,
                url: session.url
            });

            return jsonResponse(200, {
                success: true,
                sessionId: session.id,
                url: session.url
            });
        } catch (error) {
            context.log('Error creating Stripe Checkout Session:', error?.message || error);
            return jsonResponse(500, {
                success: false,
                error: 'Failed to create checkout session: ' + (error?.message || 'Unknown error')
            });
        }
    }
});
