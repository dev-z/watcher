/**
 * Validates the incoming parameters in the request body.
 * @param {Object} body The request body.
 * @param {String} body.from Whom the sms is from.
 * @param {String} body.to To whom the sms is addressed to.
 * @param {String} body.text Contents of the SMS.
 * @returns {Object} Error object || null
 */
function validateParams(body = {}) {
  const errors = {};
  // from
  if (body.from) {
    if (!(body.from.length >= 6 && body.from.length <= 16)) {
      errors.from = 'from is invalid';
    }
  } else {
    errors.from = 'from is missing';
  }
  // to
  if (body.to) {
    if (!(body.to.length >= 6 && body.to.length <= 16)) {
      errors.to = 'to is invalid';
    }
  } else {
    errors.to = 'to is missing';
  }
  // text
  if (body.text) {
    if (!(body.text.length >= 1 && body.text.length <= 120)) {
      errors.text = 'text is invalid';
    }
  } else {
    errors.text = 'text is missing';
  }

  if (Object.keys(errors).length === 0) {
    // If no errors were found,
    return null;
  }
  // Otherwise, return the errors object.
  return errors;
}

module.exports = {
  validateParams,
};
