module.exports = function (content) {
  console.log('normal 3')
  return content
}
module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  console.log('pitch 3')
}
