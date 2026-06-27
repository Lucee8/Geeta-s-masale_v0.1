const categories = [
  {
    id: 'Masale',
    name: 'Malvani Masalas & Chutneys',
    description: 'Generations of expertise in roasting and blending coastal spices, red chillies, and garlic.',
    image: '/src/assets/images/cashew_premium_1780594672474.png',
    count: 11,
    hidden: false
  },
  {
    id: 'Pith',
    name: 'Traditional Flours (Pith)',
    description: 'Freshly milled rice, pulse, and grain flours prepared for authentic Bhakri, Vade, and Modak.',
    image: '/src/assets/images/masala_hero_1780594616996.png',
    count: 7,
    hidden: false
  }
];

const products = [
  {
    id: 'm1',
    category: 'Masale',
    name: 'Malvani Special Sunday Masala',
    weight: '250gm',
    mrp: 275,
    ratePerKg: 1100,
    description: 'A classic coastal spice blend for Sunday feasts.',
    ingredients: 'Coriander, Red Chilli, Cumin, Turmeric, Black Pepper',
    usage: 'Use during tempering for rich flavor.',
    shelfLife: '12 Months',
    notes: 'No artificial colors or preservatives.',
    image: '/src/assets/images/masala_hero_1780594616996.png',
    stock: 120,
    isBestseller: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p1',
    category: 'Pith',
    name: 'Gavthi Kulith Pithi',
    weight: '250gm',
    mrp: 85,
    ratePerKg: 340,
    description: 'Traditional horse gram flour for Malvani soups and breads.',
    ingredients: 'Horse Gram',
    usage: 'Boil with kokum and spices for a warming pithi.',
    shelfLife: '6 Months',
    notes: 'Rich in fiber and protein.',
    image: '/src/assets/images/malvani_cooking_1780594653286.png',
    stock: 50,
    isBestseller: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const reviews = [
  {
    id: 1,
    name: 'Prasad Gawde',
    ratingValue: 5,
    comment: 'Pure organic Sankeshwari and Ghati chilli mix. True taste of Malvan kitchen.',
    date: '2026-06-15',
    verified: true,
    approved: true,
    createdAt: '2026-06-15T00:00:00.000Z'
  }
];

const settings = {
  logo: '/src/assets/images/geetas_storefront_1780594715235.png',
  upiId: 'bhaveshkoyande62@okaxis',
  contactNumber: '+91 91762 04289',
  email: 'geetasmasale@gmail.com',
  address: 'Near Dewoolwada along Kasal-Malvan Highway, Malvan, Maharashtra, India',
  socialLinks: {
    instagram: 'https://instagram.com/geetasmasale',
    facebook: 'https://facebook.com/geetasmasale',
    whatsapp: 'https://wa.me/917620428920'
  },
  footer: '© 2026 Sri Geeta\'s Spices. Handcrafted along the beautiful shores of Malvan.',
  storeStatus: 'Open'
};

function sendJson(res, body, statusCode = 200) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

export default async function handler(req, res) {
  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  const path = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.end();
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'GET' && path[0] === 'products') {
    return sendJson(res, products);
  }

  if (req.method === 'GET' && path[0] === 'categories') {
    return sendJson(res, categories);
  }

  if (req.method === 'GET' && path[0] === 'reviews') {
    return sendJson(res, reviews);
  }

  if (req.method === 'GET' && path[0] === 'settings') {
    return sendJson(res, settings);
  }

  if (req.method === 'POST' && path[0] === 'reviews') {
    const body = await readBody(req);
    const newReview = {
      id: Date.now(),
      name: body.name || 'Guest',
      ratingValue: Number(body.rating || 5),
      comment: body.review || body.comment || 'Thanks for visiting Geeta\'s Masale.',
      date: new Date().toISOString().slice(0, 10),
      verified: false,
      approved: true,
      createdAt: new Date().toISOString()
    };
    reviews.unshift(newReview);
    return sendJson(res, { message: 'Review received', review: newReview }, 201);
  }

  if (req.method === 'POST' && path[0] === 'orders') {
    return sendJson(res, { message: 'Order received', ok: true }, 201);
  }

  if (req.method === 'POST' && path[0] === 'contact') {
    return sendJson(res, { message: 'Contact received', ok: true }, 201);
  }

  if (req.method === 'POST' && path[0] === 'auth' && path[1] === 'login') {
    const body = await readBody(req);
    if (!body.username || !body.password) {
      return sendJson(res, { error: 'Username and password are required' }, 400);
    }
    return sendJson(res, {
      message: 'Login successful',
      token: 'demo-token',
      user: { id: 1, username: body.username, role: 'Super Admin', name: 'Demo Admin' }
    });
  }

  if (req.method === 'GET' && path[0] === 'admin' && path[1] === 'analytics') {
    return sendJson(res, {
      summary: {
        totalRevenue: 125000,
        pendingRevenue: 18000,
        totalOrdersCount: 15,
        itemCategoriesCount: categories.length,
        totalApprovedReviewsCount: reviews.length,
        pendingReviewsCount: 0,
        unreadInquiriesCount: 1,
        itemsOnHandCount: 170,
        lowStockThresholdCount: 2
      }
    });
  }

  if (req.method === 'GET' && path[0] === 'admin' && path[1] === 'products') {
    return sendJson(res, products);
  }

  if (req.method === 'GET' && path[0] === 'admin' && path[1] === 'categories') {
    return sendJson(res, categories);
  }

  if (req.method === 'GET' && path[0] === 'admin' && path[1] === 'orders') {
    return sendJson(res, []);
  }

  if (req.method === 'GET' && path[0] === 'admin' && path[1] === 'reviews') {
    return sendJson(res, reviews);
  }

  if (req.method === 'GET' && path[0] === 'admin' && path[1] === 'contact') {
    return sendJson(res, []);
  }

  if (req.method === 'GET' && path[0] === 'admin' && path[1] === 'coupons') {
    return sendJson(res, []);
  }

  if (req.method === 'GET' && path[0] === 'coupons' && path[1] === 'validate') {
    return sendJson(res, { code: url.searchParams.get('code') || 'GEETA50', valid: true, discountType: 'Fixed', value: 50 });
  }

  return sendJson(res, { error: 'Route not found' }, 404);
}
