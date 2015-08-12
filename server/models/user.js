'use strict';

module.exports = function (Bookshelf) {

  var model = {};

  model.User = Bookshelf.Model.extend({
    tableName: 'member'
  });

  return model;
};

