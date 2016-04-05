/**
 * Copyright (C) 2014, 2015, 2016 University of Washington.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

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

