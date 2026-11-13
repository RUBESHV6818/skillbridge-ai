// src/middleware/error.js
module.exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports.errorHandler = (err, req, res, next) => {
  const uploadErrorStatus = err.name === 'MulterError'
    ? (err.code === 'LIMIT_FILE_SIZE' ? 413 : 400)
    : null;
  const statusCode = uploadErrorStatus || err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.code === 'LIMIT_FILE_SIZE'
    ? 'Resume is too large. The maximum upload size is 5 MB.'
    : err.message;
  res.status(statusCode);
  res.json({
    message,
    // In production, stack trace should be omitted
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};
