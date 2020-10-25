
const type = Object.freeze({
    validation:   "Validation Error",
    internal:  "Internal Error"
});

const setResponseError = (typeError, error) => ({
    result: typeError > 0 ? type.internal : type.validation,
    validationMessage: error
})

module.exports = setResponseError;