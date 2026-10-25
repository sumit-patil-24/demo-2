const prisma = require('../db');
const { HttpError, asyncHandler } = require('../middleware/errors');
const S = require('../utils/serialize');

// ----- businesses -----
exports.listBusinesses = asyncHandler(async (req, res) => {
  const { status, q, page, pageSize } = req.query;
  const where = {};
  if (status) where.status = status.toUpperCase();
  if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { location: { contains: q, mode: 'insensitive' } }];
  const [rows, total] = await prisma.$transaction([
    prisma.business.findMany({
      where, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], skip: (page - 1) * pageSize, take: pageSize,
      include: { category: true, owner: { select: { id: true, name: true, email: true } } },
    }),
    prisma.business.count({ where }),
  ]);
  res.json({ items: rows.map((b) => S.business(b, { includeStatus: true })), total });
});

exports.setBusinessStatus = asyncHandler(async (req, res) => {
  const b = await prisma.business.update({
    where: { id: req.params.id }, data: { status: req.body.status.toUpperCase() },
    include: { category: true, owner: { select: { id: true, name: true, email: true } } },
  });
  res.json(S.business(b, { includeStatus: true }));
});

// ----- categories -----
const cat = (c) => ({ id: c.id, name: c.name, businessCount: c._count ? c._count.businesses : undefined });

exports.listCategories = asyncHandler(async (req, res) => {
  const rows = await prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { businesses: true } } } });
  res.json(rows.map(cat));
});
exports.createCategory = asyncHandler(async (req, res) => {
  const c = await prisma.category.create({ data: { name: req.body.name } });
  res.status(201).json(cat(c));
});
exports.updateCategory = asyncHandler(async (req, res) => {
  const c = await prisma.category.update({ where: { id: req.params.id }, data: { name: req.body.name } });
  res.json(cat(c));
});
exports.deleteCategory = asyncHandler(async (req, res) => {
  const n = await prisma.business.count({ where: { categoryId: req.params.id } });
  if (n > 0) throw new HttpError(409, `${n} business(es) still use this category. Move them first.`);
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// ----- enquiries -----
exports.listEnquiries = asyncHandler(async (req, res) => {
  const { status, businessId, page, pageSize } = req.query;
  const where = { ...(status ? { status: status.toUpperCase() } : {}), ...(businessId ? { businessId } : {}) };
  const [rows, total] = await prisma.$transaction([
    prisma.enquiry.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize,
      include: { business: { select: { name: true } } },
    }),
    prisma.enquiry.count({ where }),
  ]);
  res.json({ items: rows.map(S.enquiry), total });
});

// ----- analytics -----
exports.stats = asyncHandler(async (req, res) => {
  const [usersBy, bizBy, enqBy, products, perDay, cats] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.business.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.enquiry.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.product.count(),
    prisma.$queryRaw`SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
                     FROM "Enquiry" WHERE "createdAt" >= NOW() - INTERVAL '30 days' GROUP BY 1 ORDER BY 1`,
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { name: true, _count: { select: { businesses: { where: { status: 'APPROVED' } } } } },
    }),
  ]);
  const fold = (rows, key) => Object.fromEntries(rows.map((r) => [r[key].toLowerCase(), r._count._all]));
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  const users = fold(usersBy, 'role');
  const businesses = fold(bizBy, 'status');
  const enquiries = fold(enqBy, 'status');
  res.json({
    users: { total: sum(users), ...users },
    businesses: { total: sum(businesses), ...businesses },
    products,
    enquiries: { total: sum(enquiries), byStatus: enquiries },
    enquiriesPerDay: perDay,
    businessesByCategory: cats.map((c) => ({ category: c.name, count: c._count.businesses })),
  });
});
