# HotBot is a Slack Bot, and so much more.

##Table of Contents
* [Who is it for?](https://github.com/xShirase/hotbot/blob/master/README.md#who-is-it-for)
* [What can it do?](https://github.com/xShirase/hotbot/blob/master/README.md#what-can-it-do)
* [How does it work?](https://github.com/xShirase/hotbot/blob/master/README.md#how-does-it-work)
    * [Installation](https://github.com/xShirase/hotbot/blob/master/README.md#installation)
    * [Folder structure](https://github.com/xShirase/hotbot/blob/master/README.md#folder-structure)
    * [Configuration and minimal app](https://github.com/xShirase/hotbot/blob/master/README.md#configuration-and-minimal-app)
* [Modules](https://github.com/xShirase/hotbot/blob/master/README.md#modules)
    * [Doc and examples](https://github.com/xShirase/hotbot/blob/master/README.md#modules-documentation-and-examples)
* [Commands](https://github.com/xShirase/hotbot/blob/master/README.md#commands)
    * [Doc and examples](https://github.com/xShirase/hotbot/blob/master/README.md#commands-documentation-and-examples-)
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

### Modules Documentation and examples

- [Getting Started with Modules](https://github.com/xShirase/hotbot/blob/master/docs/GettingStarted.md)
- [Module API](https://github.com/xShirase/hotbot/blob/master/docs/Modules.md)

## Commands
Commands are what you type into the Slack app, and how the bot reacts to it. Commands take priority over regular messages.

The Command class includes a slack.dataStore, for easy access to all the helpers it provides. It also abstracts a lot of the things you want to do multiple times, like send a message, wait for a specific user input, etc. 

To add a new command, create a new folder in the commands directory (configurable), and add an index.js containing the command config and class.

### Commands documentation and examples :

- [Getting Started with Commands](https://github.com/xShirase/hotbot/blob/master/docs/GettingStarted.md)
- [Command API](https://github.com/xShirase/hotbot/blob/master/docs/Commands.md) 

## Enough said, take my money!!
Well, thank you, kind stranger!

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=X25NV92LUG8WG)

## To-Do List
- [ ] Enable optional restricting of commands to DM
- [ ] argument validation based on options
- [ ] Yeoman generator for project skeleton
- [ ] more error handling

## Changelog

## Can I contribute?
YES! You're more than welcome to, through the issues, or by forking and creating pull requests.


