const { z } = require('zod');

// Optional text field: '' becomes null, undefined stays undefined (so PATCH-style updates work).
const optText = (max) =>
  z.string().trim().max(max).optional().transform((v) => (v === '' ? null : v));
const optUrl = () =>
  z.union([z.literal(''), z.string().trim().url('Enter a valid URL.').max(500)])
    .optional().transform((v) => (v === '' ? null : v));
const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254);

const paging = (defaultSize = 10) => ({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(defaultSize),
});

const register = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(100),
  email,
  password: z.string().min(8, 'Use at least 8 characters.').max(72, 'Password is too long.'),
  // Admins are never self-registered; they are created by the seed script.
  role: z.enum(['customer', 'owner']).default('customer'),
});

const login = z.object({ email, password: z.string().min(1, 'Enter your password.').max(72) });

const businessQuery = z.object({
  q: z.string().trim().max(100).default(''),
  category: z.string().trim().max(100).default(''),
  location: z.string().trim().max(100).default(''),
  sort: z.enum(['newest', 'rating', 'name']).default('newest'),
  ...paging(6),
});

const enquiryCreate = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100),
  email,
  message: z.string().trim().min(10, 'Write at least 10 characters.').max(2000),
  businessId: z.string().trim().min(1, 'businessId is required.'),
});

const businessCreate = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(1, 'Choose a category.').max(100), // category NAME
  description: z.string().trim().min(10, 'Describe your business (10+ characters).').max(3000),
  location: z.string().trim().min(2).max(100),
  phone: optText(30),
  email: z.union([z.literal(''), email]).optional().transform((v) => (v === '' ? null : v)),
  hours: optText(120),
  image: optUrl(),
});
const businessUpdate = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().min(10).max(3000).optional(),
  location: z.string().trim().min(2).max(100).optional(),
  phone: optText(30),
  email: z.union([z.literal(''), email]).optional().transform((v) => (v === '' ? null : v)),
  hours: optText(120),
  image: optUrl(),
});

const price = z.coerce.number().min(0, 'Price cannot be negative.').max(9999999.99).transform((n) => Math.round(n * 100) / 100);
const productCreate = z.object({
  name: z.string().trim().min(2).max(120),
  description: optText(2000),
  price,
  image: optUrl(),
});
const productUpdate = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: optText(2000),
  price: price.optional(),
  image: optUrl(),
});

const enquiryStatus = z.object({ status: z.enum(['new', 'read', 'replied', 'closed']) });
const enquiryListQuery = z.object({
  status: z.enum(['new', 'read', 'replied', 'closed']).optional(),
  ...paging(10),
});

const adminBusinessQuery = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  q: z.string().trim().max(100).default(''),
  ...paging(10),
});
const businessStatus = z.object({ status: z.enum(['pending', 'approved', 'rejected', 'suspended']) });
const categoryBody = z.object({ name: z.string().trim().min(2, 'Name is too short.').max(60) });
const adminEnquiryQuery = z.object({
  status: z.enum(['new', 'read', 'replied', 'closed']).optional(),
  businessId: z.string().trim().optional(),
  ...paging(10),
});

module.exports = {
  register, login, businessQuery, enquiryCreate, businessCreate, businessUpdate,
  productCreate, productUpdate, enquiryStatus, enquiryListQuery,
  adminBusinessQuery, businessStatus, categoryBody, adminEnquiryQuery,
};
