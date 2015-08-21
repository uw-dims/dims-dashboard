'use strict';

module.exports = function (Bookshelf) {

  var User = Bookshelf.Model.extend({
    tableName: 'member',
    idAttribute: 'ident',
    email: function () {
      return this.hasMany(Email, 'member');
    }
  });

  var Users = Bookshelf.Collection.extend({
    model: User
  });

  var Email = Bookshelf.Model.extend({
    tableName: 'member_email',
    idAttribute: ['member', 'email'],
    name: function () {
      return this.belongsTo(User, 'member');
    }
  });

  var TrustGroup = Bookshelf.Model.extend({
    tableName: 'trustgroup',
    idAttribute: 'ident'
  });

  var MemberTrustGroup = Bookshelf.Model.extend({
    tableName: 'member_trustgroup',
    idAttribute: ['member', 'trustGroup']
  });

  var MailingList = Bookshelf.Model.extend({
    tableName: 'mailinglist',
    idAttribute: ['lhs', 'trustgroup']
  });

  var MemberMailingList = Bookshelf.Model.extend({
    tableName: 'member_mailinglist',
    idAttribute: ['member', 'lhs', 'trustgroup']
  });

  var userModel = {
    User: User,
    Users: Users,
    Email: Email,
    TrustGroup: TrustGroup,
    MemberTrustGroup: MemberTrustGroup,
    MailingList: MailingList,
    MemberMailingList: MemberMailingList
  };

  return userModel;
};

