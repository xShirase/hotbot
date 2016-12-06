# Example 1 : *fw*, command that forwards messages to a channel (make the bot talk!)

## Folder Structure
```
   |--app.js
   |--config
   |  |--config.js
   |--modules
   |--commands
      |--fw
         |--index.js
```


## Command file : *fw/index.js*
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

## Command Usage

`fw general "HotBot Rocks!"`

Type it in any channel your bot lives in, and it'll write "HotBot rocks!" in the general channel.

# Example 2 : *rps*, challenge anyone to a rock/paper/scissors game!

## Folder Structure
```
   |--app.js
   |--config
   |  |--config.js
   |--modules
   |--commands
      |--rps
         |--index.js
```


## Command file : *rps/index.js*

```javascript
const Command = require('hotbot').Command;
const config = {
	name: 'rps',
	args: [{type: 'string'}, {type: 'string'}],
	help: 'rps <opponent> <move>',
	queue: {
		prefix: 'test',
		redis: {
			port: 6379,
			host: '52.30.93.20',
			auth: 'GczfMd!zPzmDV^N&7eEa6MgEYtc8yS88E6PqBW*ag%MHRE4S9xhb5XhYKKrsCATjW!f45!aBR$pN8avky7^TF&snh6%jdp'
		}
	},
	logLevel: 0
};

class RPS extends Command {

	constructor(dataStore) {
		super(dataStore, config);
		this.moves = ['rock', 'paper', 'scissors'];
		this.map = {};
		this.moves.forEach((choice, i) => {
			this.map[choice] = {};
			this.map[choice][choice] = 1;
			this.map[choice][this.moves[(i + 1) % 3]] = this.moves[(i + 1) % 3];
			this.map[choice][this.moves[(i + 2) % 3]] = choice;
		});
	}

	execute(msg) {
	        // Receiving the command message
		const args = msg.text;
		const op = this.store.getDMByName(args[0]).id;
		const move = args[1];
		const name = this.store.getUserById(msg.user).name;
		// We expect a reply, and store the game parameters for that channel
		this.expect(op, {op, opname: args[0], ch: msg.channel, name, move});
                // it's on, baby, it's ON!
		this.send(`${name} has challenged you to Rock,Paper,Scissors!! Your move? (rock,paper,scissors)`, op);
		this.send('Challenge sent, waiting for opponent', msg.channel);
	}

	score(a, b) { //uses send() and sendMulti() to print out the results
		let win;
		let lose;

		if ((this.map[b.text] || {})[a.move] === b.text) {
			win = [a.op, a.opname, b.text];
			lose = [a.ch, a.name, a.move];
			this.send(`${win[2]} beats ${lose[2]}, YOU WIN`, win[0]);
			this.send(`${win[2]} beats ${lose[2]}, YOU LOSE`, lose[0]);
		}else if ((this.map[b.text] || {})[a.move] === 1) {
			this.sendMulti('It\'s a tie!', [a.ch, a.op]);
		}else {
			win = [a.ch, a.name, a.move];
			lose = [a.op, a.opname, b.text];
			this.send(`${win[2]} beats ${lose[2]}, YOU WIN`, win[0]);
			this.send(`${win[2]} beats ${lose[2]}, YOU LOSE`, lose[0]);
		}
	}

	reply(msg) {  //this is where our expected reply arrives
		if (this.moves.includes(msg.text)) {
			const game = this.getExpected(msg.channel);
			if(game){
			    console.log('game');
			    this.rmExpect(msg.channel);
			    this.score(game, msg);
			}else{
			    this.log('something went wrong');
			}
		}else {
			this.send('Invalid move, try again!', msg.channel);
		}
	}

}

module.exports = RPS;
```
## Command usage
`rps colleague rock`

This will send a challenge to @colleague. he will obviously not see your move until he's played.
