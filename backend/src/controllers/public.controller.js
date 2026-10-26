const prisma = require('../db');
const { HttpError, asyncHandler } = require('../middleware/errors');
const S = require('../utils/serialize');

exports.categories = asyncHandler(async (req, res) => {
  const rows = await prisma.category.findMany({ orderBy: { name: 'asc' }, select: { name: true } });
  res.json(rows.map((c) => c.name)); // string[] as the frontend expects
});

exports.locations = asyncHandler(async (req, res) => {
  const rows = await prisma.business.findMany({
    where: { status: 'APPROVED' }, distinct: ['location'], select: { location: true }, orderBy: { location: 'asc' },
  });
  res.json(rows.map((r) => r.location));
});

const ORDER = {
  newest: [{ createdAt: 'desc' }],
  rating: [{ rating: 'desc' }, { createdAt: 'desc' }],
  name: [{ name: 'asc' }],
};

exports.listBusinesses = asyncHandler(async (req, res) => {
  const { q, category, location, sort, page, pageSize } = req.query;
  const where = { status: 'APPROVED' };
  if (category) where.category = { name: category };
  if (location) where.location = { equals: location, mode: 'insensitive' };
  if (q) {
    const has = { contains: q, mode: 'insensitive' };
    where.OR = [
      { name: has }, { description: has }, { location: has },
      { category: { name: has } },
      { products: { some: { name: has } } },
    ];
  }
  const [rows, total] = await prisma.$transaction([
    prisma.business.findMany({
      where, orderBy: ORDER[sort], skip: (page - 1) * pageSize, take: pageSize, include: { category: true },
    }),
    prisma.business.count({ where }),
  ]);
  res.json({ items: rows.map((b) => S.business(b)), total });
});

exports.getBusiness = asyncHandler(async (req, res) => {
  const b = await prisma.business.findFirst({
    where: { id: req.params.id, status: 'APPROVED' },
    include: { category: true, products: { orderBy: { createdAt: 'asc' } } },
  });
  if (!b) throw new HttpError(404, 'Business not found.');
  res.json(S.business(b));
});

exports.createEnquiry = asyncHandler(async (req, res) => {
  const { name, email, message, businessId } = req.body;
  const biz = await prisma.business.findFirst({ where: { id: businessId, status: 'APPROVED' }, select: { id: true } });
  if (!biz) throw new HttpError(404, 'Business not found.');
  const e = await prisma.enquiry.create({
    data: { name, email, message, businessId, customerId: req.user ? req.user.id : null },
  });
  res.status(201).json({ ok: true, id: e.id });
});

exports.myEnquiries = asyncHandler(async (req, res) => {
  const rows = await prisma.enquiry.findMany({
    where: { customerId: req.user.id }, orderBy: { createdAt: 'desc' }, include: { business: { select: { name: true } } },
  });
  res.json(rows.map(S.enquiry));
});
