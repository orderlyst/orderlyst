var mongoose = require('mongoose');

var randomCodeGenerator = function(){
  return Math.random().toString(36).substring(4,Math.random() * 2 + 8);
};

var OrderItemSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  name: {
    type: String
  },
  price: {
    type: Number
  }
});

var OrderSchema = mongoose.Schema({
  host: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  code: {
    type: String,
    default: randomCodeGenerator
  },
  surcharge: {
    type: Number,
    default: 0.0
  },
  tax: {
    type: Number,
    default: 0.0
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  closed: {
    type: Date,
    default: null
  },
  items: [
    OrderItemSchema
  ]
});

var OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;
