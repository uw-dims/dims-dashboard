'use strict';

module.exports = function (Bookshelf) {

  var User = Bookshelf.Model.extend({
    tableName: 'member',
    idAttribute: 'ident',
    email: function () {
      return this.hasMany(Email, 'member');
    },
    trustgroups: function () {
      return this.belongsToMany(TrustGroup, 'member_trustgroup', 'trustgroup', 'trustgroup');
      // return this.belongsToMany(TrustGroup).through(MemberTrustGroup, 'ident', 'member');
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
    idAttribute: 'ident',
    users: function () {
      return this.belongsToMany(User, 'member_trustgroup', 'member', 'member');
      // return this.belongsToMany(User).through(MemberTrustGroup, 'ident', 'trustgroup');
    }
  });

  var TrustGroups = Bookshelf.Collection.extend({
    model: TrustGroup
  });

  var MemberTrustGroup = Bookshelf.Model.extend({
    tableName: 'member_trustgroup',
    idAttribute: ['member', 'trustgroup'],
    users: function () {
      // return this.hasMany(User, 'ident');
      return this.belongsTo(User, 'ident');
    },
    // email: function () {
    //   return this.hasMany(Email, 'member', 'email')
    // },
    trustgroups: function () {
      // return this.hasMany(TrustGroup, 'ident');
      return this.belongsTo(TrustGroup, 'ident');
    }
  });

  var MemberTrustGroups = Bookshelf.Collection.extend({
    model: MemberTrustGroup
  });

  var MailingList = Bookshelf.Model.extend({
    tableName: 'mailinglist',
    idAttribute: ['lhs', 'trustgroup']
  });

  var MailingLists = Bookshelf.Collection.extend({
    model: MailingList
  });

  var MemberMailingList = Bookshelf.Model.extend({
    tableName: 'member_mailinglist',
    idAttribute: ['member', 'lhs', 'trustgroup']
  });

  var MemberMailingLists = Bookshelf.Collection.extend({
    model: MemberMailingList
  });

  var userModel = {
    User: User,
    Users: Users,
    Email: Email,
    TrustGroup: TrustGroup,
    TrustGroups: TrustGroups,
    MemberTrustGroup: MemberTrustGroup,
    MemberTrustGroups: MemberTrustGroups,
    MailingList: MailingList,
    MailingLists: MailingLists,
    MemberMailingList: MemberMailingList,
    MemberMailingLists: MemberMailingLists
  };

  return userModel;
};

