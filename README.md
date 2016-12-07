# HotBot is a Slack Bot, and so much more.
[![npm package](https://nodei.co/npm/hotbot.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/hotbot/)

##Table of Contents
* [Who is it for?](https://github.com/xShirase/hotbot/blob/master/README.md#who-is-it-for)
* [What can it do?](https://github.com/xShirase/hotbot/blob/master/README.md#what-can-it-do)
* [How does it work?](https://github.com/xShirase/hotbot/blob/master/README.md#how-does-it-work)
    * [Installation](https://github.com/xShirase/hotbot/blob/master/README.md#installation)
    * [Folder structure](https://github.com/xShirase/hotbot/blob/master/README.md#folder-structure)
    * [Configuration and minimal app](https://github.com/xShirase/hotbot/blob/master/README.md#configuration-and-minimal-app)
* [Modules](https://github.com/xShirase/hotbot/blob/master/README.md#modules)
    * Documentation 
    * [Getting Started, adding a web Server](https://github.com/xShirase/hotbot#getting-started-adding-a-basic-web-server)
    * [Building on the previous example](https://github.com/xShirase/hotbot#building-on-it-modules-communication)
* [Commands](https://github.com/xShirase/hotbot/blob/master/README.md#commands)
    * [API doc](https://github.com/xShirase/hotbot#commands-documentation-)
    * [1st example : fw, make the bot talk!](https://github.com/xShirase/hotbot#command-fw-make-the-bot-talk)
    * [2nd example : Rock, Paper, Scissors!](https://github.com/xShirase/hotbot#command-rps-rockpaperscissors-challenge)
    * [More advanced stuff, querying components from Modules](https://github.com/xShirase/hotbot#more-advanced-stuff-querying-components-from-modules)
* [To-Do List](https://github.com/xShirase/hotbot/blob/master/README.md#to-do-list)
* [Donate](https://github.com/xShirase/hotbot/blob/master/README.md#enough-said-take-my-money)
* [Contribute](https://github.com/xShirase/hotbot/blob/master/README.md#can-i-contribute)

## Who is it for?

HotBot is the perfect starting point if you have many different tasks you'd like to control through Slack and don't want to try and configure a million different apps and integrations.

## What can it do?
Anything. The HotBot I run in production at the moment does: 
- processing github commit notifications and dispatching them to the relevant people,
- running ALL our backend operations, from starting our servers to scaling our infrastructure, to backing up databases.
- monitoring our servers and website traffic.
- querying our MongoDB, including performing Map/reduce operations
- a ton of shell things. Yes, it is essentially a SHELL, with all that it implies
- pranking other team members
- Rock, Paper, Scissors!

## How does it work?

Hotbot is made of 3 primary components, a config file, Modules and Commands that interact with each other in various ways.

### Installation

  - Latest release:

        $ npm install hotbot

### Folder structure
A basic HotBot project is structured as follows 
```
   |--app.js
   |--config
   |  |--config.js
   |--modules
   |   |--myModule
   |   |  |--index.js
   |   |--myOtherModule
   |      |--index.js   
   |--commands
      |--myCommand
      |  |--index.js
      |--myOtherCommand
         |--index.js
```

### Configuration and minimal app 

The mimimal configuration (/config/config.json) is as follows :
```javascript
const config = {
	modulesPath: 'path/to/modules/directory',
	modules: [], // module config goes here, see further down for details
	slack: {
		name: 'slack',
		connection: {
			token: 'xoxo-mySlackBotToken',
			autoReconnect: true,
			autoMark: true
		},
		commandsPath: 'path/to/commands/directory'
	}
};

module.exports = config;
```

And the most basic app possible (does absolutely nothing, but will light up your bot's dot in the slack panel) :
```javascript
const config = require('./config/config.js');
const HotBot = require('hotbot');

const app = new HotBot(config);

app.plugModules();
app.on('init', () => console.log('All modules init'))
	.on('log', m => console.log(m));
```


## Modules

Modules are essentially daemons. Example of modules would be :
- A web server
- A website healthcheck alert
- A calendar/reminder app
- A webhook for your GitHub notifications

Modules live in a directory that you can specify, and will be auto-loaded/init on startup, in an order that you can also configure.
They can also pass messages to each other, and to the Slack Bot (which is also a Module), and request components from each other.
For example, your Github module needs to add a route to your Express server module at runtime? Not a problem! 

### Modules Documentation

- [Module API](https://github.com/xShirase/hotbot/blob/master/docs/Modules.md)

### Getting started, adding a basic web server

- **Folder Structure**
```
   |--app.js
   |--config
   |  |--config.js
   |--commands
   |--modules
      |--web
         |--index.js
```
- **Module configuration**
To enable our module, we need to add it to the modules part of our config file. We'll also make its port configurable, because why not.

```javascript
const config = {
	modulesPath: path.resolve(__dirname, '../modules'),
	modules: [
		{
			name: 'web',
			priority: 1,
			port: 1987
		}
	],
	slack: {
		name: 'slack',
		connection: {
			token: 'xoxb-tokentokentoken',
			autoReconnect: true,
			autoMark: true
		},
		commandsPath: path.resolve(__dirname, '../commands')
	}
};

module.exports = config;
```
Priority isn't an issue, so we'll leave it at 1, we want the web server to start as soon as possible.


- **Module file (modules/web/index.js)**
```javascript
const express = require('express');
const Module = require('hotbot').Module;
const bodyParser = require('body-parser');

class Web extends Module {

	constructor(config) {
		super();
		this.config = config;
		this.app = express()
			.use(bodyParser.json());
	}

	init(cb) {
		this.app.get('/', (req,res)=>{
			this.sendToSlack('Someone is on our server!', ['me','otheruser'], ['general','otherchannel']);
			res.send('Hello, world!')
		});
		this.app.listen(this.config.port, () => {
			console.log('web start');
			cb();
		});
	}
}

module.exports = Web;

```
The sendToSlack method takes 2 arrays, the first one, for DM names (eg:user names), the second for channel names.
Any time someone will ping our server on port 1987, we'll get notified on Slack.

## Building on it, modules communication.

In this follow-up example, let's add a module that will notify us when someone commits to one of our organization projects on Github.
we have setup an organization-wide webhook to send us notifications to htxp://example.com:1987/commit-hook. 

Now let's get the other side of the hook ready!

- **Module configuration**

Building on the previous example, we already have a web server. Our new module should load after it, so we can inject the route for our hook.
```javascript
modules: [
	{
		name: 'web',
		priority: 1,
		port: 1987
	}, {
		name: 'git',
		priority: 60,
		notifyChannel: 'bot_broadcast',
		notifyDM: 'xshirase'
	}
],
```
We've also set up a default user and channel to notify. Now let's get to the real thing.

- **Module file (modules/git/index.js)**
```javascript
const Module = require('hotbot').Module;

class Git extends Module {

	constructor(config) {
		super(config);
	}

	init(cb) {
		this.requestRoute('addRoute');
		cb();
	}

	addRoute(app) {
		app.post('/hook_push', (req, res) => {
			this.processCommit(req.body);
			res.status(200).json({});
		});
	}

	processCommit(git) {
		const o = {
			pusher: git.pusher.name,
			repo: git.repository.name,
			branch: git.ref.replace(/.*heads\//, ''),
			num: git.after,
			mod: git.head_commit.modified,
			add: git.head_commit.added,
			del: git.head_commit.deleted,
			url: git.head_commit.url,
			commits: git.commits
		};

		this.log(`Git commit on ${o.repo}/${o.branch}`);
		const chan = this.config.notifyChannel;
		const dm = this.config.notifyDM;
		const msg = this.buildMsg(o);
		this.sendToSlack(msg, dm, chan);
	}

	buildMsg(o) {
		return `*Git Report* : \n - Push by ${o.pusher} on *${o.repo} / _${o.branch}_* \n- Head Commit URL: ${o.url}\n- *Commits (${o.commits.length})* : \n${o.commits.map(el => `_${el.message}_`).join('\n')}`;
	}

}

module.exports = Git;
```
The result, on a random commit :
![resultexample2](https://github.com/xShirase/hotbot/raw/master/docs/MyScreenshot.png "git webhook to Slack")



## Commands
Commands are what you type into the Slack app, and how the bot reacts to it. Commands take priority over regular messages.

The Command class includes a slack.dataStore, for easy access to all the helpers it provides. It also abstracts a lot of the things you want to do multiple times, like send a message, wait for a specific user input, etc. 

To add a new command, create a new folder in the commands directory (configurable), and add an index.js containing the command config and class.


### Commands documentation :

- [Command API](https://github.com/xShirase/hotbot/blob/master/docs/Commands.md) 

### Command *fw*, make the bot talk!

- **Folder Structure**
```
   |--app.js
   |--config
   |  |--config.js
   |--modules
   |--commands
      |--fw
         |--index.js
```

- **Command file : commands/fw/index.js***
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

- **Command Usage**

`fw general "HotBot Rocks!"`

Type it in any channel your bot lives in, and it'll write "HotBot rocks!" in the general channel.

### Command *rps*, rock/paper/scissors challenge!

- **Folder Structure**
```
   |--app.js
   |--config
   |  |--config.js
   |--modules
   |--commands
      |--rps
         |--index.js
```


- **Command file : commands/rps/index.js**

```javascript
const Command = require('hotbot').Command;
const config = {
	name: 'rps',
	args: [{type: 'string'}, {type: 'string'}],
	help: 'rps <opponent> <move>',
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
- **Command usage**
`rps colleague rock`

This will send a challenge to @colleague. he will obviously not see your move until he's played. you can type other commands in between your challenge and the reply. You can also configure on which method to reply, to allow for more intricate commands and interactions.


### More advanced stuff, querying components from Modules
See : [DB example](https://github.com/xShirase/hotbot/blob/master/docs/DB-Example.md)

## Enough said, take my money!!
Well, thank you, kind stranger!

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=X25NV92LUG8WG)

## To-Do List
*v1.1*
- [ ] Enable optional restricting of commands to DM
- [ ] argument validation based on options
- [ ] Yeoman generator for project skeleton
- [ ] handle more than just the "message" event
- [ ] expose the watch() method to interact with non-command messages
- [ ] more error handling

## Changelog

## Can I contribute?
YES! You're more than welcome to, through the issues, or by forking and creating pull requests.


