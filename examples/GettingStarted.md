
Example command file : *fw/index.js*
```javascript
const config = {
	name: 'fw',
	args: [{type: 'string'}, {type: 'string'}],
	help: 'fw <channel> "<message>"',
	logLevel: 0
};

const Command = require('hotbot').Command;
class Fw extends Command {

	constructor(dataStore) {
		super(dataStore, config);
	}

	execute(msg) {
		const args = msg.text;

		if (this.store.getChannelByName(args[0])) {
			this.send(args[1], this.store.getChannelByName(args[0]).id);
		}else if (this.store.getDMByName(args[0])) {
			this.send(args[1], this.store.getDMByName(args[0]).id);
		}else {
			this.send(`Can't find recipient *${args[0]}*`, msg.channel);
		}
	}
}

module.exports = Fw;
```
The above example simply forwards a message to a channel or DM of your choice.

Notice how the argument number and types are defined, by default, a command string will be parsed first by delimiting quotes, THEN by spaces, and msg.text will reach your command as an Array of arguments.

Example use of *fw*
`fw general "HotBot Rocks!"`
Type it in any channel your bot lives in, and it'll write "HotBot rocks!" in the general channel.