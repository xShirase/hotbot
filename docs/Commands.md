# Command API

## Default Configuration
```
{
	name: 'Command Name',
	args: {},
	noValidate:false,
	help: 'describe args usage here',
	logLevel: 0
}
```
## Arguments and validation
the `args` option takes an Array of object with the following properties :
- type ('string,'number','object')

from v1.1.0 :
- validOptions : Array(String)
- optional : true/false

The validator will expect your command to have the exact number of required arguments, of the right type.
To skip the default(basic) validation, set `noValidate:true`. The args option is then unnecessary.

Once the Bot recognizes a command, the following happens:
- message.text is parsed into an array of arguments, double-quoted blocks count as one.
- if the noValidate option isn't set, the array is validated against the Command config
- the array is then reinjected into the original message.text property
- the command `execute(message)` method is called.

##Methods

###  Constructor
```javascript
constructor(dataStore, config) {
  this.store = dataStore;
  this.config = Object.assign(defaultConfig, config);
  this.expected = {};
}
```
The store property is a Slack Datastore, with all its helper methods, [see here for more info](https://github.com/slackapi/node-slack-sdk/blob/master/lib/data-store/memory-data-store.js)


###  ```Command.init()```

Will be called on command load, when the program starts. Defaults to doing nothing silently.

### ```Command.requestModuleComponent(to,component,method)```

Requests a component fom one of the installed modules. [See here for example use.]()
Once the module replies, the method specified will be called with the component as an argument *Command.method(component)*


###  ```Command.execute(message)```
```
{
    "id": 1,
    "type": "message",
    "channel": "C024BE91L",
    "text": ['say','"Hello world!"']
}
```
This is the structure of the message as it arrives into the `.execute()` method. The channel field is a channel or DM id.
The default execute() command is a dispatcher that does the following :
```javascript
execute(msg) {
	const args = msg.text;
	if (args.length > 1) {
		this[args.shift()](args, msg.channel);
	}else {
		this[args[0]](msg.channel);
	}
}
``` 
So, if it receives ['foo','bar'], it'll call the method this.foo(bar,channel). In most cases, you don't need to overwrite it, except if you have only one type of arguments (or no arguments at all), in which case the whole execution can happen in the execute() method.

## Sending messages

### ```Command.send(message, channelID [,callback])```

Sends a message to a channel or DM


### ```Command.sendMulti(message, Array(ChannelID))```

Sends a message to an array of channels or DM


## Expecting user input

In some cases, one command does not suffice and we want a series of interactions between a user and the bot (usually in the bot's DM channel)
To achieve that, we need to tell our Command to "expect" the next message in the channel to be a "reply" to whatever it is waiting for.
See (Rock, paper, scissors)[] for more details and a full example.

### ```Command.expect(channelID, obj [,replyMethodName])```

Tells the bot to expect a message in the channel specified
This message will be sent directly to the `reply()` method of the command. If you have set a `replyMethodName`, it'll go to this instead. The message WILL NOT be parsed.
In addition, you can store an object into this.expects, containing parameters necessary to the next steps.


### ```Command.reply(message)```

The expected message will arrive here, to be processed as needed. think of it as a secondary `execute()` method.


### ```Command.rmExpect(channelID)```

If the `reply()` method has parsed and validated the response message, release the expect on this particular channel.


### ```Command.isExpected(channelID)```


Retrieves the object stored in the `expect()` method


### ```Command.getExpected(channelID)```

Alias for `isExpected`

## Misc

### ```Command.blockify(text)```

Returns provided text encased in triple backticks, to be displayed as a block in Slack.

### ```Command.log(text)```
