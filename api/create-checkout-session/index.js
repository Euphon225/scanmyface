const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const STRIPE_PRICES = {
  'pass24h': 'price_1TX8fI0F5tPT2CvowRDs8Esr',
  '5scans': 'price_1TX8gy0F5tPT2CvoKFqcb7nU',
  'seasonpass': 'price_1TX8hc0F5tPT2CvoRrwkTmaX'
};

module.exports = async function (context, req) {
  context.log('Create checkout session function triggered');

  try {
    if (req.method !== 'POST') {
      context.res = {
        status: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
      return;
    }

    const { priceId } = req.body;

    if (!priceId) {
      context.res = {
        status: 400,
        body: JSON.stringify({ error: 'priceId is required' })
      };
      return;
    }

    // Validate that the priceId is one of the allowed prices
    const isValidPrice = Object.values(STRIPE_PRICES).includes(priceId);
    if (!isValidPrice) {
      context.res = {
        status: 400,
        body: JSON.stringify({ error: 'Invalid price ID' })
      };
      return;
    }

    // Get the origin from the request to build absolute URLs for Stripe
    const origin = req.headers['x-forwarded-proto'] + '://' + req.headers['x-forwarded-host'];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: origin + '/app/index.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: origin + '/'
    });

    context.res = {
      status: 200,
      body: JSON.stringify({
        success: true,
        url: session.url,
        sessionId: session.id
      })
    };

  } catch (error) {
    context.log('Error creating checkout session:', error);
    context.res = {
      status: 500,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message
      })
    };
  }
};
