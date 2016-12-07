const path = require('path');
const Slack = require('./slack');
const EventEmitter = require('events');

class HotBot extends EventEmitter {

	constructor(config) {
		super();
		this.slackConfig = config.slack;
		this.modulesPath = config.modulesPath;
		this.modules = config.modules.sort((a, b) => a.priority - b.priority);
	}

	plugModules() {
		if (this.modules.length !== 0) {
			this.prioritizeLoad(this.loadSlack.bind(this));
		}else {
			console.log('No modules found');
			this.loadSlack();
		}
	}

	prioritizeLoad(cb) {
		const m = this.modules.filter(e => ! e.started)[0];

		if (! m) {
			this.emit('init');
			cb();
		}else {
			const Module = require(path.resolve(this.modulesPath, m.name));

			this[m.name] = new Module(m)
			.on('log', log => this.emit('log', log))
			.on('requestComponent', this.requestComponent.bind(this))
			.on('broadcast', this.broadcast.bind(this));
			this[m.name].init(err => {
				if (err) {
					this.emit('err', err);
				}

				this.modules.forEach(e => {
					if (m.name === e.name) {
						this.emit('log', `module ${m.name} started`);
						e.started = true;
					}
				});
				this.prioritizeLoad(cb);
			});
		}
	}

	loadSlack() {
		if (this.slackConfig.token !== '') {
			this.slack = new Slack(this.slackConfig)
			.on('log', log => this.emit('log', log))
			.on('requestComponent', this.requestComponent.bind(this))
			.on('broadcast', this.broadcast.bind(this));
			this.slack.init(err => {
				if (err) {
					this.emit('err', err);
				}
				this.emit('log', 'Slack Module started');
			});
		}else {
			console.log('No Slack token has been configured. See documentation for more details');
		}
	}

	requestComponent(d) {
		this[d.from][d.method](this[d.to][d.component], d.fw);
	}

	log(m) {
		console.log(m);
	}

	broadcast(data) {
		console.log('');
		if (! this[data.module]) {
			this.log(`Module '${data.module}' not found, available modules:\n${this.modules.map(e => e.name).join('\n')}`);
		}else {
			this[data.module].message(data.msg);
		}
	}

}

module.exports = HotBot;
