const PhoneNumber = require('./../models/PhoneNumber');

module.exports = function inboundService() {
  /**
   * Find if the given phone number exists in the DB or not for the given requester.
   * @param {String} number The number to search for.
   * @param {Number} requesterAccountId The accound of the requester.
   * @returns {Promise}
   */
  function findIfRecordExists(number, requesterAccountId) {
    return new Promise((resolve, reject) => {
      PhoneNumber.findOne({
        where: {
          number,
          account_id: requesterAccountId,
        },
      }).then((phoneNumber) => {
        if (phoneNumber) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  return {
    findIfRecordExists,
  };
};
