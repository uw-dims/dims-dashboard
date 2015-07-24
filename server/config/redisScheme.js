'use strict';
var redisScheme = {

  'types': {
    'userSettings': {
      'set': 'userSettings',
      'prefix': 'userSetting'
    },
    'tickets': {
      'set': 'tickets',
      'prefix': 'ticket',
      'counter': '.__counter'
    },
    'topics': {
      'counter': '.__counter',
      'timestamp': '.__timestamp'
    }
  },

  'counterSuffix': '.__counter',
  'timestampSuffix': '.__timestamp',
  'topicSuffix': '.__topics',
  'typeSuffix' : '.__type',
  'fileSuffix' : '.__file',

  'tickets': {
    'setName': 'ticket.__tickets',
    'counter': 'ticket.__counter',
    'prefix': 'ticket'
  },

  'files': {
    'setName': 'file.__files',
    'prefix': 'file',
    'metaSuffix': '.__meta'
  },

  'userSettings': {
    'setName': 'userSettings',
    'prefix': 'userSetting'
  },

  'topicTypes': ['silk', 'cif', 'crosscor', 'cidrs', 'mitigation', 'data'],

  'delimiter': ':'

};

module.exports = redisScheme;

/**
	* =====================================
	* UserSettings
	* Keys are constructed as prefix:username, where prefix is defined in types (types.userSettings.prefix) and username is the 
	* username (userid) of the logged in user.
  * Keys are stored in a set named types.userSettings.set. Therefore, all userSetting keys can be
  * retrieved using SMEMBERS types.userSettings.set (return value is an array). You could also use
  * SINTER types.userSettings.set types.userSettings.set (intersection of sets).
  *
  * Values for a particular userSetting are stored in a redis hash. The node redis client allows settings to be stored
  * internally as javascript objects and then persisted to the database without explicit serializing. So we can use:
  * client.hmset(key, settings) which is the equivalent of HMSET key field1 setting1 field2 setting2 ... etc.
  * Settings objects look like (showing the default settings initialized for each user at first login):
  *  {
	*		'anonymize': 'false',
	*		'rpcDebug': 'true',
	*		'rpcVerbose': 'true',
	*		'cifbulkQueue': 'cifbulk_v1'
  *  }
	*
	* Defaults are defined in config.js
	*/



// EOF
