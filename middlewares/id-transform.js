var Key = '431841948175129418314';
var KeyLength = Key.length;

module.exports = function(id) {
  id = '' + parseInt(id, 36);
  var result = '';
  for (var i = 0, len = id.length; i < len; i++) {
    num = 0 + id[i];
    cKey = 0 + Key[i % KeyLength];
    result = '' + (num ^ cKey);
  }
  return parseInt(result).toString(36);
};