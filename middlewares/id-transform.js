var Key = '431841948175129418314';
var KeyLength = Key.length;

var keyCharAt = function(key, i) {
  return key.charCodeAt(Math.floor(i % key.length));
};

module.exports = {
  encrypt: function(id) {
    id = '' + id;
    var result = [];
    for (var i = 0, len = id.length; i < len; i++) {
      num = 0 + id.charCodeAt(i);
      result.push(num ^ keyCharAt(Key, i));
    }
    return new Buffer(result).toString('base64');
  },
  decrypt: function(id) {
    var buffer = new Buffer(id, 'base64');
    var data = Array.prototype.slice.call(buffer, 0);
    var result = '';
    data.forEach(function(val, i){
      result += String.fromCharCode(val ^ keyCharAt(Key, i));
    });
    return result;
  }
};
