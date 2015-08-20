'use strict';

module.exports = function (Bookshelf) {

  var userModel = {};

  var User = Bookshelf.Model.extend({
    tableName: 'member',
    email: function () {
      return this.hasOne(Email, 'member');
    }
  });

  var Users = Bookshelf.Collection.extend({
    model: User
  });

  var Email = Bookshelf.Model.extend({
    tableName: 'member_email',
    name: function () {
      return this.belongsTo(User, 'member');
    }
  });

  userModel.User = User;
  userModel.Users = Users;
  userModel.Email = Email;

  return userModel;
};

