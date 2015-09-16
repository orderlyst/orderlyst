var express = require('express');
var router = express.Router();
var idTransform = require('../../middlewares/id-transform');

/**
 * To fetch a user's information
 */
router.get('/:id', function(req, res, next) {
  var userId = idTransform.decrypt(req.params.id);

  req.models.User
    .find({
      where: {
        userId: userId
      }
    })
    .then(function(user){
      res.json(user);
    });
});

/**
 * To create a new user
 */
router.post('/', function(req, res, next) {
  var name = req.body.name;
  req.models.User
    .create({
      "name": name
    })
    .then(function(user){
      res.json(user);
    });
});

/**
 * To update an existing user
 */
router.post('/:id', function(req, res, next) {
  var name = req.body.name;
  var userId = idTransform.decrypt(req.params.id);

  req.models.User
    .find({
      where: {
        userId: userId
      }
    })
    .then(function(user){
      user
        .update({
          name: name
        })
        .then(function(user){
          res.json(user);
        });
    });
});

module.exports = router;
