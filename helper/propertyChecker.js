
exports.CheckPropertyIfValid = (model, ...props) => {

    const bodyProperties = Object.keys(model);

    return props.every(propertyName => bodyProperties.includes(propertyName));
}