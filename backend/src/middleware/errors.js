const { ZodError } = require('zod');

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// The frontend reads `response.data.message`, so every error carries one.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const errors = {};
    for (const i of err.issues) {
      const k = i.path.join('.') || '_';
      if (!errors[k]) errors[k] = i.message;
    }
    const first = err.issues[0];
    const message = first.path.length ? `${first.path.join('.')}: ${first.message}` : first.message;
    return res.status(400).json({ message, errors });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, ...(err.details ? { details: err.details } : {}) });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body is not valid JSON.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
  if (err.code === 'P2002') return res.status(409).json({ message: 'That value is already in use.' });
  if (err.code === 'P2025') return res.status(404).json({ message: 'Record not found.' });
  if (err.code === 'P2003') return res.status(409).json({ message: 'This record is still referenced by other data.' });

  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on our side. Please try again.' });
}

module.exports = { HttpError, asyncHandler, notFound, errorHandler };
