'use strict';
/*
 * GET home page.
 */

exports.index = function (req, res) {
  var session = req.session;

  res.render('index', { title: 'DIMS Dashboard' });
};

// exports.partials = function (req, res) {
//   var name = req.params.name;
//   res.render('partials/' + name);
// };

// exports.data = function (req, res) {
//   var name = req.params.name;
//   res.send('data/' + name);
// }
