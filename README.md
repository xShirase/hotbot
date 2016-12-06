# HotBot is a Slack Bot, and so much more.

## Who is it for?

I created this bot to help with my company's daily operations, alerting devs of code changes, managing our cloud servers, get notifications from multiple webhooks, and more. HotBot is the perfect starting point if you have many different tasks you'd like to control through Slack and don't want to try and configure a million different apps and integrations.

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

Hotbot is made of 2 primary components, Modules and Commands.

### Modules

Modules are essentially servers. Adding a http server to receive your webhooks is adding a Module.
Modules live in a directory that you can specify, and will be auto-loaded on startup, in an order that you can also configure.
They can also pass messages to each other, and to the Slack Bot (which is also a Module), and request components from each other.
For example, your Github module needs to add a route to your Express server module at runtime? Not a problem! 

Module Documentation and examples

### Commands
Commands are what you type into the Slack app. 


## Where is the documentation ?

## Enough said, take my money!!
Well, thank you, kind stranger!

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=X25NV92LUG8WG)
