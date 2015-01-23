'use strict';


var userSchema = {
  member: {
    ident: {type: 'string', nullable: false, unique: true, primary: true},
    descr: {type: 'string', nullable: false},
    affiliation: {type: 'string', nullable: false, default: ''},
    password: {type: 'string', default: null},
    tz_info: {type:'string', nullable: false, default: ''},
    im_info: {type:'string', nullable: false, default: ''},
    tel_info: {type:'string', nullable: false, default: ''},
    sms_info: {type:'string' },
    post_info: {type:'string', nullable: false, default: ''},
    bio_info: {type:'string', nullable: false, default: ''},
    uuid: {nullable: false, unique: true}
  }

};

module.exports = userSchema;