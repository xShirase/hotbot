/* !
 * hotbot
 * Copyright (c) 2016 Guillaume RUCH <shirase.dev@gmail.com>
 * MIT Licensed
 */

const path = require('path');
const fs = require('fs');
const Module = require('../Module.js');

const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const clientEvts = require('@slack/client').CLIENT_EVENTS;
const rtmEvts = require('@slack/client').RTM_EVENTS;

class Slack extends Module {

	constructor(config) {
		super(config);
		const slackToken = config.connection.token;
		const autoReconnect = config.connection.autoReconnect || true;
		const autoMark = config.connection.autoMark || true;

		this.slack = new RtmClient(slackToken, {
			logLevel: 'error',
			dataStore: new MemoryDataStore(),
			autoReconnect,
			autoMark
		});

		this.slack.on(clientEvts.RTM.RTM_CONNECTION_OPENED, () => {
			const user = this.slack.dataStore.getUserById(this.slack.activeUserId);
			const team = this.slack.dataStore.getTeamById(this.slack.activeTeamId);

			this.name = user.name;

			this.log(`Connected to ${team.name} as ${user.name}`);
		});

		const p = this.config.commandsPath;

		this.commands = fs.readdirSync(p).filter(f => fs.statSync(p + '/' + f).isDirectory());
		this.modules = {};
		this.expects = [];
	}

	init(cb) {
		this.commands.forEach(m => {
			const Command = require(path.resolve(this.config.commandsPath, m));

			this.log(`Slack - Loaded Command ${m}`);
			this.modules[m] = new Command(this.slack.dataStore)
				.on('init', this.log)
				.on('log', this.log)
				.on('expect', msg => this.expects.push({module: m, chan: msg.chan, method: msg.method || 'reply'}))
				.on('rmExpect', msg => {
					this.expects = this.expects.filter(o => o.chan !== msg);
				})
				.on('requestModuleComponent', d => {
					this.emit('requestComponent', {
						from: 'slack',
						to: d.to,
						method: 'forwardComponent',
						component: d.component,
						fw: {name: m, method: d.method}
					});
				})
				.on('msg', this.sendFromObject.bind(this));
			this.modules[m].init();
		});

		this.slack.on(rtmEvts.MESSAGE, msg => {
			if (! msg.text) {
				return;
			}
			this.processMsg(msg);
		});

		this.slack.start();
		cb();
	}

	forwardComponent(comp, dest) {
		this.modules[dest.name][dest.method](comp);
	}

	processMsg(msg) {
		const cmd = msg.text.split(' ')[0];
		const isExpected = this.expects.filter(o => o.chan === msg.channel)[0];

		if (isExpected) {
			this.modules[isExpected.module][isExpected.method](msg);
		}else if (this.commands.includes(cmd)) {
			let res;

			if (! this.modules[cmd].config.noValidate) {
				res = this.verifyArgs(cmd, msg.text);
			}
			let reply;

			if (res === 1) {
				reply = `Wrong number of arguments for command *${cmd}*, expected *${this.modules[cmd].config.help}*`;
				this.send(reply, msg.channel);
			}else if (res === 2) {
				reply = `Wrong arguments type for command *${cmd}*, expected *${this.modules[cmd].config.help}*`;
				this.send(reply, msg.channel);
			}else {
				msg.text = res;
				this.modules[cmd].execute(msg);
			}
		}else {
			this.watch(msg);
		}
	}

	watch(msg) {

	}

	parseArgs(str) {
		const parser = new RegExp(/"[^"]*"|[^\s"]+/g);
		const args = str.match(parser);

		return args.splice(0, 1);
	}

	verifyArgs(cmd, msg) {
		let result = 0;
		const args = this.parseArgs(msg);
		const valid = this.modules[cmd].config.args;

		result = args;
		if (valid.length !== args.length) {
			return 1;
		}

		valid.forEach((e, i) => {
			try {
				if (! (e.type === 'string' || e.type === JSON.parse(args[i]))) {
					// TODO add options param
					result = 2;
				}
			}catch (wtv) {
				result = 2;
			}
		});
		return result;
	}

	send(msg, chanId, cb) {
		if (msg) {
			this.slack.sendMessage(msg, chanId, () => {
				if (cb) {
					cb();
				}
			});
		}
	}

	sendFromObject(o) {
		console.log(o);
		this.send(o.msg, o.chan);
	}

	sendFromModule(o) {
		console.log(o);
		this.send(o.msg, o.chan);
	}

	message(m) {
		if (m.DM) {
			const DM = m.DM.split(',');

			DM.forEach(e => this.send(m.msg, this.slack.dataStore.getDMByName(e).id));
		}
		if (m.chan) {
			const chan = m.chan.split(',');

			chan.forEach(e => this.send(m.msg, this.slack.dataStore.getChannelByName(e).id));
		}
	}

}

module.exports = Slack;
