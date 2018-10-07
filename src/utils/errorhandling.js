module.exports = function getErrorHandlingUtls() {
  function getErrorString(errors) {
    let errStr = '';
    const errKeys = Object.keys(errors);
    errKeys.forEach((key) => {
      if (!errStr) {
        errStr = errors[key];
      } else {
        errStr = `${errStr}, ${errors[key]}`;
      }
    });
    return errStr;
  }

  return {
    getErrorString,
  };
};
