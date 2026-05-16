const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

const STRIPE_PRICES = {
  'pass24h': 'price_1TX8fI0F5tPT2CvowRDs8Esr',
  '5scans': 'price_1TX8gy0F5tPT2CvoKFqcb7nU',
  'seasonpass': 'price_1TX8hc0F5tPT2CvoRrwkTmaX'
};

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'app')));

// API Routes
app.post('/api/create-checkout', async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'priceId is required' });
    }

    // Validate that the priceId is one of the allowed prices
    const isValidPrice = Object.values(STRIPE_PRICES).includes(priceId);
    if (!isValidPrice) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    // Build the origin from the request
    const origin = `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${origin}/app/index.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`
    });

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
