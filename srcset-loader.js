const loaderAPI = function loader(source) {
  const options = this.getOptions();

  console.log('--- TEST ! ', source);

  return source;
}

exports.default = loaderAPI;