

const getRequestBodyContentString = (body) => {
    let requestBodyContent = '';

    Object.keys(body).forEach(propName => requestBodyContent += `${propName}=${body[propName]}; `);

    return requestBodyContent;
}

module.exports = getRequestBodyContentString;