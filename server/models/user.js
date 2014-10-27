'use strict';

module.exports = function(Bookshelf) {

  var model = {};

  model.User = Bookshelf.Model.extend({
    tableName: 'member'
  });

  // Test it
  // new User({'ident':'lparsons'}).fetch()
  //   .then(function(user) {
  //     console.log('User fetched');
  //     console.log(user.get('ident'));
  //   })
  //   .catch(function(err) {
  //     console.log(error);
  //   });

  return model;
}

