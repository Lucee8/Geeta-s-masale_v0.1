/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { EventEmitter } from 'events';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), 'server', 'db', 'data');
const LOCK_TIMEOUT_MS = 5000;
const BCRYPT_ROUNDS = 12; // Increased from 10

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type AdminRole = 'Super Admin' | 'Manager' | 'Staff';
export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Dispatched'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';
export type PaymentStatus = 'Success' | 'Pending' | 'Failed';
export type DiscountType = 'Percentage' | 'Fixed';
export type StoreStatus = 'Open' | 'Closed' | 'Maintenance';
export type MessageStatus = 'New' | 'In Progress' | 'Resolved';

export interface Admin {
  id: number;
  username: string;
  passwordHash: string;
  role: AdminRole;
  name: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  count: number;
  hidden: boolean;
}

export interface Product {
  id: string;
  category: string;
  name: string;
  weight: string;
  mrp: number;
  ratePerKg: number;
  description: string;
  ingredients: string;
  usage: string;
  shelfLife: string;
  notes: string;
  image: string;
  stock: number;
  isBestseller: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  weight: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerEmail: string;
  items: OrderItem[];
  paymentType: 'UPI' | 'COD';
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  transactionReference: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface Review {
  id: number;
  name: string;
  ratingValue: number; // 1–5
  comment: string;
  date: string;
  verified: boolean;
  approved: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  whatsapp: string;
}

export interface WebsiteSettings {
  logo: string;
  upiId: string;
  contactNumber: string;
  email: string;
  address: string;
  socialLinks: SocialLinks;
  footer: string;
  storeStatus: StoreStatus;
}

export interface Banner {
  id: number;
  title: string;
  image: string;
  active: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  value: number;
  minOrderAmount: number;
  active: boolean;
  usageCount: number;
  maxUsage?: number;
  expiresAt?: string;
}

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

/**
 * Validates that a filename contains only safe characters.
 * Prevents path traversal attacks like '../../etc/passwd'.
 */
function assertSafeFilename(filename: string): void {
  if (!/^[\w.-]+\.json$/.test(filename)) {
    throw new Error(`Unsafe filename rejected: "${filename}"`);
  }
}

/**
 * Validates that data is serialisable and within size limits.
 */
function assertSerializable(data: unknown, maxBytes = 50 * 1024 * 1024): void {
  if (data === undefined) {
    throw new TypeError('Cannot write undefined to data file');
  }
  const serialized = JSON.stringify(data);
  if (serialized.length > maxBytes) {
    throw new RangeError(
      `Data exceeds maximum allowed size of ${maxBytes} bytes`
    );
  }
}

// ---------------------------------------------------------------------------
// File Locking (Async, per-file mutex)
// ---------------------------------------------------------------------------

/**
 * Per-file promise-based mutex.
 * Ensures reads and writes to each file are serialised,
 * eliminating race conditions on concurrent requests.
 */
class FileLock {
  private queue: Map<string, Promise<void>> = new Map();

  async acquire<T>(filename: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.queue.get(filename) ?? Promise.resolve();

    let releaseLock!: () => void;
    const current = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    // Chain onto existing lock for this file
    this.queue.set(filename, previous.then(() => current));

    // Wait for our turn
    await previous;

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Lock timeout for file: ${filename}`)),
        LOCK_TIMEOUT_MS
      )
    );

    try {
      return await Promise.race([fn(), timeout]);
    } finally {
      releaseLock();
      // Clean up resolved chains to prevent memory leaks
      if (this.queue.get(filename) === current) {
        this.queue.delete(filename);
      }
    }
  }
}

const fileLock = new FileLock();

// ---------------------------------------------------------------------------
// Core Async I/O
// ---------------------------------------------------------------------------

/**
 * Reads a JSON file, returning defaultData if absent or corrupt.
 * Uses atomic file locking to prevent concurrent read/write conflicts.
 */
async function readDataFile<T>(filename: string, defaultData: T): Promise<T> {
  assertSafeFilename(filename);
  const filePath = path.join(DATA_DIR, filename);

  return fileLock.acquire(filename, async () => {
    try {
      const content = await fsp.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (err: unknown) {
      if (isNodeError(err) && err.code === 'ENOENT') {
        // File doesn't exist yet — seed it
        await writeDataFileRaw(filename, filePath, defaultData);
        return defaultData;
      }
      if (err instanceof SyntaxError) {
        console.error(
          `[DB] Corrupt JSON in ${filename}, restoring defaults:`,
          err.message
        );
        await writeDataFileRaw(filename, filePath, defaultData);
        return defaultData;
      }
      throw err;
    }
  });
}

/**
 * Writes JSON to a file atomically (write to temp → rename).
 * A crash mid-write won't leave a corrupt file.
 */
async function writeDataFile<T>(filename: string, data: T): Promise<void> {
  assertSafeFilename(filename);
  assertSerializable(data);
  const filePath = path.join(DATA_DIR, filename);

  return fileLock.acquire(filename, () =>
    writeDataFileRaw(filename, filePath, data)
  );
}

/**
 * Inner write — must be called while the lock is already held.
 * Writes to a temp file then atomically renames to prevent corruption.
 */
async function writeDataFileRaw<T>(
  filename: string,
  filePath: string,
  data: T
): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  const serialized = JSON.stringify(data, null, 2);
  await fsp.writeFile(tempPath, serialized, 'utf-8');
  await fsp.rename(tempPath, filePath); // Atomic on POSIX systems
  console.debug(`[DB] Written: ${filename} (${serialized.length} bytes)`);
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}

// ---------------------------------------------------------------------------
// Directory Bootstrap (async, run once at startup)
// ---------------------------------------------------------------------------

let bootstrapPromise: Promise<void> | null = null;

export async function bootstrapDatabase(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    await fsp.mkdir(DATA_DIR, { recursive: true });
    console.info(`[DB] Data directory ready: ${DATA_DIR}`);

    // Prime all collections so files exist on disk
    await Promise.all([
      getAdmins(),
      getCategories(),
      getProducts(),
      getReviews(),
      getWebsiteSettings(),
      getBanners(),
      getCoupons(),
      getOrders(),
      getPayments(),
      getContactMessages(),
    ]);

    console.info('[DB] Bootstrap complete.');
  })();

  return bootstrapPromise;
}

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'Masale',
    name: 'Malvani Masalas & Chutneys',
    description:
      'Generations of expertise in roasting and blending coastal spices, red chillies, and garlic.',
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    count: 11,
    hidden: false,
  },
  {
    id: 'Pith',
    name: 'Traditional Flours (Pith)',
    description:
      'Freshly milled rice, pulse, and grain flours prepared for authentic Bhakri, Vade, and Modak.',
    image:
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80',
    count: 7,
    hidden: false,
  },
  {
    id: 'Malvani products',
    name: 'Konkan Specialties & Meva',
    description:
      'Sun-dried Kokum, parboiled rice, fruit leathers (Poli), and authentic farm-fresh items.',
    image:
      'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
    count: 11,
    hidden: false,
  },
  {
    id: 'Laddoos',
    name: 'Handmade Laddoos',
    description:
      'Sweet, nutritious daily delicacies rolled with pure ghee, organic jaggery, peanuts, and dry fruits.',
    image:
      'https://images.unsplash.com/photo-1581781868311-6415779c13dd?w=600&auto=format&fit=crop&q=80',
    count: 4,
    hidden: false,
  },
  {
    id: 'Kaju',
    name: 'Premium Malvan Cashews (Kaju)',
    description:
      'Export-grade whole cashews, salted variants, masala-flavored crunch, and healthy split kernels.',
    image: '/src/assets/images/cashew_premium_1780594672474.png',
    count: 7,
    hidden: false,
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'm1',
    category: 'Masale',
    name: 'Malvani Special Sunday Masala',
    weight: '250gm',
    mrp: 275,
    ratePerKg: 1100,
    description:
      'Our crown jewel. A secret multi-generational blend of heavy-roast spices and rich Ghati chillies designed for your slow-cooked Sunday feasts.',
    ingredients:
      'Coriander, Red Chilli, Cumin, Turmeric, Black Pepper, Dagad Phool, Star Anise, Jaiphal, Aromatic Konkan Spices',
    usage:
      'Add 2-3 tablespoons during the gravy tempering phase. Cook on low heat to release slow-roasted essential oils.',
    shelfLife: '12 Months',
    notes: 'No artificial colors, preservatives, or added MSG. Strictly vegetarian.',
    image:
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    stock: 120,
    isBestseller: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // … additional products follow same pattern
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Prasad Gawde',
    ratingValue: 5,
    comment:
      'Pure organic Sankeshwari and Ghati chilli mix. True taste of Malvan kitchen.',
    date: '2026-06-15',
    verified: true,
    approved: true,
    createdAt: '2026-06-15T00:00:00.000Z',
  },
];

const DEFAULT_SETTINGS: WebsiteSettings = {
  logo: 'https://ik.imagekit.io/9f6w6a0wf/logo.png.png',
  upiId: 'bhaveshkoyande62@okaxis',
  contactNumber: '+91 91762 04289',
  email: 'geetasmasale@gmail.com',
  address:
    'Near Dewoolwada along Kasal-Malvan Highway, Malvan, Maharashtra, India',
  socialLinks: {
    instagram: 'https://instagram.com/geetasmasale',
    facebook: 'https://facebook.com/geetasmasale',
    whatsapp: 'https://wa.me/917620428920',
  },
  footer:
    '© 2026 Sri Geeta\'s Spices. Handcrafted along the beautiful shores of Malvan.',
  storeStatus: 'Open',
};

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 1,
    code: 'GEETA50',
    discountType: 'Fixed',
    value: 50,
    minOrderAmount: 399,
    active: true,
    usageCount: 0,
  },
  {
    id: 2,
    code: 'KONKAN10',
    discountType: 'Percentage',
    value: 10,
    minOrderAmount: 500,
    active: true,
    usageCount: 0,
  },
];

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 1,
    title: 'Pure Sunday Griddle Roast',
    image: '/src/assets/images/masala_hero_1780594616996.png',
    active: true,
  },
];

// ---------------------------------------------------------------------------
// Public Collection API
// ---------------------------------------------------------------------------

// --- Admins ---
export async function getAdmins(): Promise<Admin[]> {
  const admins = await readDataFile<Admin[]>('admins.json', []);

  if (admins.length === 0) {
    // Read initial password from environment — never hardcode in source
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (!initialPassword) {
      throw new Error(
        'ADMIN_INITIAL_PASSWORD environment variable must be set for first-time setup'
      );
    }
    if (initialPassword.length < 12) {
      throw new Error('Initial admin password must be at least 12 characters');
    }

    const passwordHash = await bcrypt.hash(initialPassword, BCRYPT_ROUNDS);
    const superAdmin: Admin = {
      id: 1,
      username: 'admin',
      passwordHash,
      role: 'Super Admin',
      name: 'Bhavesh Admin',
      createdAt: new Date().toISOString(),
    };

    await writeDataFile('admins.json', [superAdmin]);
    return [superAdmin];
  }

  return admins;
}

export async function saveAdmins(admins: Admin[]): Promise<void> {
  await writeDataFile('admins.json', admins);
}

// --- Categories ---
export const getCategories = (): Promise<Category[]> =>
  readDataFile('categories.json', DEFAULT_CATEGORIES);

export const saveCategories = (c: Category[]): Promise<void> =>
  writeDataFile('categories.json', c);

// --- Products ---
export const getProducts = (): Promise<Product[]> =>
  readDataFile('products.json', DEFAULT_PRODUCTS);

export const saveProducts = (p: Product[]): Promise<void> =>
  writeDataFile('products.json', p);

// --- Orders ---
export const getOrders = (): Promise<Order[]> =>
  readDataFile('orders.json', []);

export const saveOrders = (o: Order[]): Promise<void> =>
  writeDataFile('orders.json', o);

// --- Payments ---
export const getPayments = (): Promise<Payment[]> =>
  readDataFile('payments.json', []);

export const savePayments = (p: Payment[]): Promise<void> =>
  writeDataFile('payments.json', p);

// --- Reviews ---
export const getReviews = (): Promise<Review[]> =>
  readDataFile('reviews.json', DEFAULT_REVIEWS);

export const saveReviews = (r: Review[]): Promise<void> =>
  writeDataFile('reviews.json', r);

// --- Contact Messages ---
export const getContactMessages = (): Promise<ContactMessage[]> =>
  readDataFile('contact_messages.json', []);

export const saveContactMessages = (m: ContactMessage[]): Promise<void> =>
  writeDataFile('contact_messages.json', m);

// --- Website Settings ---
export const getWebsiteSettings = (): Promise<WebsiteSettings> =>
  readDataFile('website_settings.json', DEFAULT_SETTINGS);

export const saveWebsiteSettings = (s: WebsiteSettings): Promise<void> =>
  writeDataFile('website_settings.json', s);

// --- Banners ---
export const getBanners = (): Promise<Banner[]> =>
  readDataFile('banners.json', DEFAULT_BANNERS);

export const saveBanners = (b: Banner[]): Promise<void> =>
  writeDataFile('banners.json', b);

// --- Coupons ---
export const getCoupons = (): Promise<Coupon[]> =>
  readDataFile('coupons.json', DEFAULT_COUPONS);

export const saveCoupons = (c: Coupon[]): Promise<void> =>
  writeDataFile('coupons.json', c);

// ---------------------------------------------------------------------------
// Convenience Atomic Helpers
// ---------------------------------------------------------------------------

/**
 * Appends a single item to a collection atomically.
 * Safer than: const list = await get(); list.push(item); await save(list);
 * because the lock is held across the entire read-modify-write.
 */
export async function appendOrder(order: Order): Promise<void> {
  await fileLock.acquire('orders.json', async () => {
    const filePath = path.join(DATA_DIR, 'orders.json');
    let orders: Order[] = [];
    try {
      const content = await fsp.readFile(filePath, 'utf-8');
      orders = JSON.parse(content);
    } catch {
      // File doesn't exist yet
    }
    orders.push(order);
    await writeDataFileRaw('orders.json', filePath, orders);
  });
}

export async function appendPayment(payment: Payment): Promise<void> {
  await fileLock.acquire('payments.json', async () => {
    const filePath = path.join(DATA_DIR, 'payments.json');
    let payments: Payment[] = [];
    try {
      const content = await fsp.readFile(filePath, 'utf-8');
      payments = JSON.parse(content);
    } catch {
      // File doesn't exist yet
    }
    payments.push(payment);
    await writeDataFileRaw('payments.json', filePath, payments);
  });
}