var express = require('express');
var router = express.Router();
var UserModel = require('../../models/user');

router.get('/:id', function(req, res, next) {
  var userId = req.params.id;
  UserModel
    .findOne({
      "_id": userId
    })
    .exec(function(err, user){
      if (user) {
        res.json(user);
      } else {
        next(err);
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
  });
});

router.post('/:id', function(req, res, next) {
  var name = req.body.name;
  var userId = req.params.id;

  UserModel
    .findOne({
      "_id": userid
    })
    .exec(function(err, user){
      user.name = name;
      user.save();
      if (user) {
        res.json(user);
      } else {
        next(err);
      }
    })
});

module.exports = router;
