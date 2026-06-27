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

const orders = [];
const contacts = [];
const coupons = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  const path = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const [, adminPath] = path;

  const authHeader = req.headers.authorization || '';
  const hasToken = authHeader.startsWith('Bearer ');
  if (!hasToken) {
    res.statusCode = 401;
    res.json({ error: 'Unauthorized' });
    return;
  }

  if (req.method === 'GET' && adminPath === 'analytics') {
    res.statusCode = 200;
    res.json({
      summary: {
        totalRevenue: 125000,
        pendingRevenue: 18000,
        totalOrdersCount: orders.length,
        itemCategoriesCount: categories.length,
        totalApprovedReviewsCount: reviews.length,
        pendingReviewsCount: 0,
        unreadInquiriesCount: contacts.length,
        itemsOnHandCount: products.reduce((sum, p) => sum + p.stock, 0),
        lowStockThresholdCount: products.filter(p => p.stock < 15).length
      },
      ordersOverTime: [],
      topSellingProducts: [],
      categoryDistribution: [],
      recentOrders: []
    });
    return;
  }

  if (req.method === 'GET' && adminPath === 'products') {
    res.statusCode = 200;
    res.json(products);
    return;
  }

  if (req.method === 'GET' && adminPath === 'categories') {
    res.statusCode = 200;
    res.json(categories);
    return;
  }

  if (req.method === 'GET' && adminPath === 'orders') {
    res.statusCode = 200;
    res.json(orders);
    return;
  }

  if (req.method === 'GET' && adminPath === 'customers') {
    res.statusCode = 200;
    res.json([]);
    return;
  }

  if (req.method === 'GET' && adminPath === 'reviews') {
    res.statusCode = 200;
    res.json(reviews);
    return;
  }

  if (req.method === 'GET' && adminPath === 'contact') {
    res.statusCode = 200;
    res.json(contacts);
    return;
  }

  if (req.method === 'GET' && adminPath === 'coupons') {
    res.statusCode = 200;
    res.json(coupons);
    return;
  }

  res.statusCode = 404;
  res.json({ error: 'Route not found' });
}
