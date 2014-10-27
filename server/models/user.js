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




// var Bookshelf = app.get('Bookshelf');

// var User = Bookshelf.Model.extend({
//   tableName: 'member'
// });

// return new User({email: 'foobar@gmail.com'})
//   .fetch()
//   .then(console.log);




// var authenticate = function(plainText, hashedText) {
//   return encryptPassword(plainText) === hashedText;
// };

// var makeSalt = function() {
//   return crypto.randomBytes(16).toString('base64');
// };

// var encryptPassword = function(password) {
//   if (!password || !this.salt) return '';
//   var salt = new Buffer(this.salt, 'base64');
//   return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
// };

// From ops-trust
// First, searches that username exists with a password < attempts (Login.pm)
// pw = crypt(req.password, member.password)
// if pw === member.password then successful
//    put in session
//        logged in - true
//        username, uuid, .. 

// Setting a password
// common::mkpw_portal(pass1)

// sub mkpw_portal($) {
//   my($cleartext) = @_;

//   my $salt = '$1$'.join('',
//            ('.', '/', 0..9, 'A'..'Z', 'a'..'z')
//         [rand 64, rand 64, rand 64, rand 64,
//          rand 64, rand 64, rand 64, rand 64]).'$';
//   return crypt($cleartext, $salt);
// }
