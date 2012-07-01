var 
	request = require('request'),
	querystring = require('querystring'),
	pathArgs = /:([a-z]+)(?:\=([a-z,]+))?/gi,
	pathArg = /:([a-z]+)(?:\=([a-z,]+))?/i,
	slice = Array.prototype.slice

// constructor
function court() {
	return this
}

// building the func that the prototype will use
function pregame(name, path) {
	var 
		expected = [],
		match, possible

	// parsing paths
	// e.g.
	// 'shots/:id/rebound' will expect the first argument to be that of 'id'
	// 'shots/:id=tmars,44656' expects an 'id' that can only be set to 'tmars' or '44656', defaulting to 'tmars'
	// note that things will not work properly if you try to set a defaulting argument after a non-defaulting argument
	pathArgs.lastIndex = 0
	while ((match = pathArgs.exec(path)) !== null) {
		expected.push({
			name: match[1],
			allowed: (possible = match[2] != undefined ? match[2].split(',') : undefined),
			assume: possible != undefined ? possible[0] : undefined
		})
	}

	// the actual function that will be used
	return function() {
		var 
			lex = this,
			args = slice.call(arguments),
			options,
			callback,
			actual,
			adjustedPath = path,
			diff,
			i

		// sent too many arguments?
		if (args.length > expected.length + 2 /* 2 = options + callback */) {
			throw 'Too many arguments passed to .' + name + '()'
			return;
		}

		// last argument must always be the callback
		if (typeof args[args.length - 1] !== 'function') {
			throw 'No callback given for .' + name + '()'
			return;
		}

		callback = args.pop()

		// may have sent options, just before callback
		if (typeof args[args.length - 1] === 'object') {
			options = args.pop()
		}

		// making sure the passed arguments (sans callback) match the expected
		for (i = 0, diff = expected.length - args.length; i < expected.length; i++) {
			actual = args.length >= expected.length - i ? args[ i - diff ] : expected[i].assume

			// if not a defaulting argument, then throw
			if (actual == undefined) {
				throw 'No value given for ' + expected[i].name
				return;
			}

			// if not in the allowed values set
			if (expected[i].allowed && !~expected[i].allowed.indexOf(actual)) {
				throw 'Value passed is not one of the following: ' + expected[i].allowed.join(', ')
				return;
			}

			adjustedPath = adjustedPath.replace(pathArg, actual)
		}
			
		// firing request
		!function gameon(options, callback) {
			request('http://api.dribbble.com/' + adjustedPath + (options ? '?' + querystring.stringify(options) : ''), function(err, res, body) {
				var paging = {}

				// not sure if this try catch is needed (or a good idea)
				try {
					body = JSON.parse(body)
				} catch(e) {}

				if (
					typeof body.pages === 'number' &&
					typeof body.page === 'number'
				) {
					if (body.page < body.pages) {
						options = options || {}

						paging.next = function(callback) {
							options.page = body.page + 1

							gameon(options, callback)

							return lex
						}
					}

					if (body.page > 1) {
						options = options || {}

						paging.previous = function(callback) {
							options.page = body.page - 1

							gameon(options, callback)

							return lex
						}
					}
				}

				callback(err, res, body, paging)
			})
		}(options, callback)

		return this
	}
}

;[
	{ name: 'shot', path: 'shots/:id' },
	{ name: 'shotRebounds', path: 'shots/:id/rebounds' },
	{ name: 'shotComments', path: 'shots/:id/comments' },
	{ name: 'list', path: 'shots/:list=popular,everyone,debuts' },
	{ name: 'player', path: 'players/:id' },
	{ name: 'playerShots', path: 'players/:id/shots' },
	{ name: 'playerFollowingShots', path: 'players/:id/shots/following' },
	{ name: 'playerLikes', path: 'players/:id/shots/likes' },
	{ name: 'playerFollowers', path: 'players/:id/followers' },
	{ name: 'playerFollows', path: 'players/:id/following' },
	{ name: 'playerDraftees', path: 'players/:id/draftees' }
].forEach(function(definition) {
	court.prototype[definition.name] = pregame(definition.name, definition.path)
})

module.exports = court