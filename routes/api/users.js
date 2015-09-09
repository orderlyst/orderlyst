var express = require('express');
var router = express.Router();
var UserModel = require('../../models/user');

router.get('/:id', function(req, res, next) {
  var userId = req.params.id;
  UserModel
    .findOne({
      _id: id
    })
    .exec(function(err, user){
      if (user) {
        res.json(user);
      } else {
        next();
      }
    });
});

router.post('/', function(req, res, next) {
  var name = req.body.name;
  var user = new UserModel({
    "name": name
  });
  user.save(function(err){
    if (!user) {
      res.json(user);
    }
  })
});

module.exports = router;
