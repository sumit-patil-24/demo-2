// validate(schema, 'body' | 'query') -> replaces req[source] with the parsed, typed value.
module.exports = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return next(result.error);
  req[source] = result.data;
  next();
};
