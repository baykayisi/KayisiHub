const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - { isValid, errors }
 */
const validatePagination = (page, limit, maxLimit = 50) => {
  const errors = [];

  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    errors.push('Page must be a positive integer');
  }

  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1) {
    errors.push('Limit must be a positive integer');
  }

  if (limitNum > maxLimit) {
    errors.push(`Limit cannot exceed ${maxLimit}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    page: Math.max(1, pageNum),
    limit: Math.min(limitNum, maxLimit)
  };
};

/**
 * Get safe error message for client
 */
const getSafeErrorMessage = (error, isDevelopment = false) => {
  if (isDevelopment) {
    return error.message;
  }
  return 'An error occurred while processing your request';
};

module.exports = { isValidObjectId, validatePagination, getSafeErrorMessage };
