## More advanced stuff, querying components from Modules
Topics covered : Adding module components to commands, the init method

### The Problem
We want a command that interacts with our database. To solve this issue in an elegant manner, we'd rather not open a new db connection each time the command (or any other using the db) is typed.

### The Solution

We'll start by creating a db module to open our persistent db connection. I chose to use mongodb, but anything else would do.

- **Module file (modules/mongo/index.js)**
```javascript
const Module = require('hotbot').Module;
const MongoClient = require('mongodb').MongoClient;

class Mongo extends Module {

	constructor(config) {
		super(config);
	}

	init(cb) {
		MongoClient.connect(this.config.url, (err, db) => {
			if (err) {
				this.log(err);
			}
			this.db = db;
			cb();
		});
	}
}

module.exports = Mongo;
```

Seriously, that's it, our bot has a db connection. Isn't HotBot awesome?

The next step is to add this db connection to our command, so we can use it anytime. this is done through the 'requestModuleComponent' method.

```javascript
const Command = require('hotbot').Command;
const config = {
	name: 'db',
	type: 'node',
	args: [{type: 'string'}],
	help: 'db test',
	logLevel: 0
};

class DbStuff extends Command {

	constructor(dataStore) {
		super(dataStore, config);
	}

	init() {
		this.requestModuleComponent('mongo', 'db', 'addDb');
	}

	addDb(db) {
		this.db = db;
		console.log('we have db!');
	}

	test() {
		//do something nice here
	}

	processResult(chan, err, data) {
		console.log(chan, err, data);
		let msg;

		if (err) {
			msg = this.blockify(`${err}\n----------------\n${err.stack}`);
		}else {
			msg = this.blockify(`${JSON.stringify(data, null, 4)}`);
		}
		this.send(msg, chan);
	}
}

module.exports = DbStuff;
```
And, Voila! our command now has the db connection from the mongo module created earlier.
