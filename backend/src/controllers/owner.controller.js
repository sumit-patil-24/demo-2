const prisma = require('../db');
const { HttpError, asyncHandler } = require('../middleware/errors');
const S = require('../utils/serialize');

async function myBusiness(userId) {
  const b = await prisma.business.findUnique({ where: { ownerId: userId } });
  if (!b) throw new HttpError(404, 'You have not created a business profile yet.');
  return b;
}
async function categoryId(name) {
  const c = await prisma.category.findUnique({ where: { name } });
  if (!c) throw new HttpError(400, 'Unknown category. Choose one from the category list.');
  return c.id;
}
const strip = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

// ----- business profile -----
exports.getBusiness = asyncHandler(async (req, res) => {
  const b = await prisma.business.findUnique({
    where: { ownerId: req.user.id }, include: { category: true, products: { orderBy: { createdAt: 'asc' } } },
  });
  if (!b) throw new HttpError(404, 'You have not created a business profile yet.');
  res.json(S.business(b, { includeStatus: true }));
});

exports.createBusiness = asyncHandler(async (req, res) => {
  if (await prisma.business.findUnique({ where: { ownerId: req.user.id } })) {
    throw new HttpError(409, 'You already have a business profile. Edit it instead.');
  }
  const { category, ...rest } = req.body;
  const b = await prisma.business.create({
    data: { ...strip(rest), ownerId: req.user.id, categoryId: await categoryId(category), status: 'PENDING' },
    include: { category: true },
  });
  res.status(201).json(S.business(b, { includeStatus: true }));
});

exports.updateBusiness = asyncHandler(async (req, res) => {
  const current = await myBusiness(req.user.id);
  const { category, ...rest } = req.body;
  const data = strip(rest);
  if (category) data.categoryId = await categoryId(category);
  const b = await prisma.business.update({ where: { id: current.id }, data, include: { category: true } });
  res.json(S.business(b, { includeStatus: true }));
});

// ----- products -----
exports.listProducts = asyncHandler(async (req, res) => {
  const biz = await myBusiness(req.user.id);
  const rows = await prisma.product.findMany({ where: { businessId: biz.id }, orderBy: { createdAt: 'asc' } });
  res.json(rows.map(S.product));
});

exports.createProduct = asyncHandler(async (req, res) => {
  const biz = await myBusiness(req.user.id);
  const p = await prisma.product.create({ data: { ...strip(req.body), businessId: biz.id } });
  res.status(201).json(S.product(p));
});

async function ownProduct(userId, id) {
  const biz = await myBusiness(userId);
  const p = await prisma.product.findFirst({ where: { id, businessId: biz.id } });
  if (!p) throw new HttpError(404, 'Product not found.');
  return p;
}

exports.updateProduct = asyncHandler(async (req, res) => {
  const p = await ownProduct(req.user.id, req.params.id);
  const updated = await prisma.product.update({ where: { id: p.id }, data: strip(req.body) });
  res.json(S.product(updated));
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const p = await ownProduct(req.user.id, req.params.id);
  await prisma.product.delete({ where: { id: p.id } });
  res.status(204).end();
});

// ----- enquiries -----
exports.listEnquiries = asyncHandler(async (req, res) => {
  const biz = await myBusiness(req.user.id);
  const { status, page, pageSize } = req.query;
  const where = { businessId: biz.id, ...(status ? { status: status.toUpperCase() } : {}) };
  const [rows, total] = await prisma.$transaction([
    prisma.enquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.enquiry.count({ where }),
  ]);
  res.json({ items: rows.map(S.enquiry), total });
});

exports.setEnquiryStatus = asyncHandler(async (req, res) => {
  const biz = await myBusiness(req.user.id);
  const e = await prisma.enquiry.findFirst({ where: { id: req.params.id, businessId: biz.id } });
  if (!e) throw new HttpError(404, 'Enquiry not found.');
  const updated = await prisma.enquiry.update({ where: { id: e.id }, data: { status: req.body.status.toUpperCase() } });
  res.json(S.enquiry(updated));
});
