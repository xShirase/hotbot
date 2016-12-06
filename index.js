/* !
 * hotbot
 * Copyright (c) 2016 Guillaume RUCH <shirase.dev@gmail.com>
 * MIT Licensed
 */

const HotBot = require('./lib/HotBot.js');
const Module = require('./lib/Module.js');
const Command = require('./lib/Command.js');

exports = module.exports = HotBot;
exports.version = require('./package.json').version;

// Expose Module

exports.Module = Module;

// Expose Command

exports.Command = Command;
