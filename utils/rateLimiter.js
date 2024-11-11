const rateLimitMap = new Map();

/**
 * @param {string} userId - The ID of the user.
 * @param {string} action - The action to rate limit.
 * @param {number} limit - Maximum allowed actions.
 * @param {number} duration - Time window in milliseconds.
 * @returns {boolean} - Whether the user is rate-limited.
 */
const isRateLimited = (userId, action, limit = 5, duration = 60000) => {
  const key = `${userId}:${action}`;
  const now = Date.now();

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }

  const timestamps = rateLimitMap.get(key).filter(timestamp => now - timestamp < duration);
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);

  return timestamps.length > limit;
};

module.exports = isRateLimited;
