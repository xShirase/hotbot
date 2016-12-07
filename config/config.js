/* !
 * hotbot
 * Copyright (c) 2016 Guillaume RUCH <shirase.dev@gmail.com>
 * MIT Licensed
 */

const config = {
	modulesPath: '',
	modules: [],
	slack: {
		name: 'slack',
		connection: {
			token: '',
			autoReconnect: true,
			autoMark: true
		},
		commandsPath: ''
	}
};

module.exports = config;
