const configuration = require('config')

function load() { return configuration.get('application') }

function api() { return configuration.get('application.sub-modules.api') }

function version () { return configuration.get('package-json')['version'] }

function name() { return configuration.get('application.name') }

function security() { return configuration.get('application.sub-modules.security') }

function transports() { return configuration.get('application')["sub-modules"]["logging"]["transports"] }

module.exports = { load, version, api, name, security, transports }