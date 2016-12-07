/* !
 * hotbot
 * Copyright (c) 2016 Guillaume RUCH <shirase.dev@gmail.com>
 * MIT Licensed
 */

const EventEmitter = require('events');

class Module extends EventEmitter {

	constructor(config) {
		super();
		this.config = config;
	}

	init(cb) {
		console.log(`Module ${this.config.name} initialized, you may want to override the init() method`);
		cb();
	}

	message(m) {
		console.log(`Message Received: ${m}`);
		console.log(`You may want to override the message() method in ${this.config.name}`);
	}

	requestComponent(from, to, method, component) {
		this.emit('requestComponent', {
			from,
			method,
			to,
			component
		});
	}

	requestRoute(method) {
		this.requestComponent(this.config.name, 'web', method, 'app');
	}

	pluckConfig(obj, key) {
		return key.split('.').reduce((o, x) => {
			return typeof o === 'undefined' || o === null ? o : o[x];
		}, obj);
	}

	sendToSlack(msg, DM, chan) {
		this.emit('broadcast', {
			module: 'slack',
			msg: {msg, chan, DM}
		});
	}

	log(log) {
		this.emit('log', log);
	}

	sendToModule(module, msg) {
		this.emit('broadcast', {
			module,
			msg
		});
	}
}

module.exports = Module;
