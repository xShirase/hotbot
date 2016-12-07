/* !
 * hotbot
 * Copyright (c) 2016 Guillaume RUCH <shirase.dev@gmail.com>
 * MIT Licensed
 */

const EventEmitter = require('events');
const defaultConfig = {
	name: 'Command Name',
	args: {},
	help: 'describe args usage here',
	logLevel: 1
};

class Command extends EventEmitter {

	constructor(dataStore, config) {
		super();
		this.store = dataStore;
		this.config = Object.assign(defaultConfig, config);
		this.expected = {};
	}

	init() {
		if (this.config.logLevel > 0) {
			console.log('Placeholder - You may want to override the init() method of this Command.');
		}
	}

	requestModuleComponent(to, component, method) {
		this.emit('requestModuleComponent', {
			to,
			component,
			method
		});
	}

	execute(msg) {
		if (this.config.logLevel > 0) {
			console.log('Default - You may want to override the execute() method of this Command.');
		}

		const args = msg.text;

		if (args.length > 1) {
			this[args.shift()](args, msg.channel);
		}else {
			this[args[0]](msg.channel);
		}
	}

	send(m, c, cb) {
		const msg = m.replace(/(^")|("$)/g, '');

		this.emit('msg', {msg, chan: c});
		if (cb) {cb();}
	}

	sendMulti(m, chans) {
		chans.forEach(chan => this.send(m, chan));
	}

	reply() {
		if (this.config.logLevel > 0) {
			console.log('Placeholder - You may want to override the reply() method of this Command.');
		}
	}

	expect(id, obj) {
		this.expected[id] = obj;
		this.emit('expect', {chan: id});
	}

	rmExpect(chan) {
		this.expected[chan] = null;
		this.emit('rmExpect', chan);
	}

	log(log) {
		this.emit('log', log);
	}

	isExpected(chan) {
		return this.expected[chan];
	}

	getExpected(chan) {
		return this.expected[chan];
	}

	log(log) {
		this.emit('log', log);
	}

	blockify(msg) {
		return `\`\`\`${msg}\`\`\``;
	}

}

module.exports = Command;
