const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const v = require('../validators');
const validate = require('../middleware/validate');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');
const auth = require('../controllers/auth.controller');
const pub = require('../controllers/public.controller');
const owner = require('../controllers/owner.controller');
const admin = require('../controllers/admin.controller');

const limiter = (max, windowMs, message) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { message } });
const authLimiter = limiter(30, 15 * 60 * 1000, 'Too many attempts. Try again in a few minutes.');
const enquiryLimiter = limiter(20, 60 * 60 * 1000, 'Too many enquiries from this address. Try again later.');

// ---- auth ----
router.post('/auth/register', authLimiter, validate(v.register), auth.register);
router.post('/auth/login', authLimiter, validate(v.login), auth.login);
router.get('/auth/me', requireAuth, auth.me);

// ---- public ----
router.get('/categories', pub.categories);
router.get('/locations', pub.locations);
router.get('/businesses', validate(v.businessQuery, 'query'), pub.listBusinesses);
router.get('/businesses/:id', pub.getBusiness);
router.post('/enquiries', enquiryLimiter, optionalAuth, validate(v.enquiryCreate), pub.createEnquiry);

// ---- customer ----
router.get('/enquiries/mine', requireAuth, requireRole('CUSTOMER', 'OWNER', 'ADMIN'), pub.myEnquiries);

// ---- business owner ----
const own = [requireAuth, requireRole('OWNER')];
router.get('/owner/business', ...own, owner.getBusiness);
router.post('/owner/business', ...own, validate(v.businessCreate), owner.createBusiness);
router.put('/owner/business', ...own, validate(v.businessUpdate), owner.updateBusiness);
router.get('/owner/products', ...own, owner.listProducts);
router.post('/owner/products', ...own, validate(v.productCreate), owner.createProduct);
router.put('/owner/products/:id', ...own, validate(v.productUpdate), owner.updateProduct);
router.delete('/owner/products/:id', ...own, owner.deleteProduct);
router.get('/owner/enquiries', ...own, validate(v.enquiryListQuery, 'query'), owner.listEnquiries);
router.patch('/owner/enquiries/:id', ...own, validate(v.enquiryStatus), owner.setEnquiryStatus);

// ---- admin ----
const adm = [requireAuth, requireRole('ADMIN')];
router.get('/admin/users', ...adm, validate(v.adminUserQuery, 'query'), admin.listUsers);
router.delete('/admin/users/:id', ...adm, admin.deleteUser);
router.get('/admin/businesses', ...adm, validate(v.adminBusinessQuery, 'query'), admin.listBusinesses);
router.patch('/admin/businesses/:id/status', ...adm, validate(v.businessStatus), admin.setBusinessStatus);
router.get('/admin/categories', ...adm, admin.listCategories);
router.post('/admin/categories', ...adm, validate(v.categoryBody), admin.createCategory);
router.put('/admin/categories/:id', ...adm, validate(v.categoryBody), admin.updateCategory);
router.delete('/admin/categories/:id', ...adm, admin.deleteCategory);
router.get('/admin/enquiries', ...adm, validate(v.adminEnquiryQuery, 'query'), admin.listEnquiries);
router.get('/admin/stats', ...adm, admin.stats);

module.exports = router;
