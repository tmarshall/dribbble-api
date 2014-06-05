Dribbble Api 0.0.2
==================


# What's this?

This is a node module, serving as Dribbble API wrapper. See the [Dribbble API docs](http://dribbble.com/api/) for more details.


# Installation

The easiest way to install is via [npm](http://npmjs.org/)

```
npm install dribbble-api
```

Otherwise, you can install this is by taking the code and sticking it in your node_modules folder. 


# Usage

Dribbble doesn't (yet) require any sort of auth key or access token. Still, this module is a constructor. This way, if things change and keys are required, the constructor would be utilized and legacy code would be less effected.

Making a request looks something like this:

```js
var dribbbleApi = require('dribbble-api')

var dribbble = new dribbbleApi()

dribbble.list('debuts', function(err, res, json, paging) { })
```

Every callback gets four arguments; An error (if there is one), the HTTP response, a JSON object (probably what you will want) and a paging object (more on this in the [paging section](#paging)).


## Player

All of the player-related functions require a player id (or username).

### Player Profile

```js
dribbble.player('44656', function(err, res, json, paging) {
	console.log(json)
})
```

### A Player's Shots

```js
dribbble.playerShots('44656', function(err, res, json, paging) {
	console.log(json)	// json.shots
})
```

### Shots by Users Player is Following

```js
dribbble.playerFollowingShots('44656', function(err, res, json, paging) {
	console.log(json)	// json.shots
})
```

### Shots Liked by Player

```js
dribbble.playerLikes('44656', function(err, res, json, paging) {
	console.log(json)	// json.shots
})
```

### Users that Follow the Player

```js
dribbble.playerFollowers('44656', function(err, res, json, paging) {
	console.log(json)	// json.players
})
```

### Users that the Player Follows

```js
dribbble.playerFollows('44656', function(err, res, json, paging) {
	console.log(json)	// json.players
})
```

### Users Drafted by the Player

```js
dribbble.playerDraftees('44656', function(err, res, json, paging) {
	console.log(json)	// json.players
})
```


## Shots

All of the shot-related functions, except for `list`, require a shot id.

### An Individual Shot's Profile

```js
dribbble.shot('300230', function(err, res, json, paging) {
	console.log(json)
})
```

### Rebounds of a Shot

```js
dribbble.shotRebounds('43424', function(err, res, json, paging) {
	console.log(json) 	// json.shots
})
```

### Comments on a Shot

```js
dribbble.shotComments('43424', function(err, res, json, paging) {
	console.log(json) 	// json.comments
})
```

### Lists of Shots

This one is a bit different. It doesn't take a shot id. Instead it takes the name of a list.

Possible names are `popular`, `debuts` and `everyone`. 

If you don't pass a list name it will default to `popular`.

```js
dribbble.list('popular', function(err, res, json, paging) {
	console.log(json) 	// json.shots
})

// has the same effect as

dribbble.list(function(err, res, json, paging) {
	console.log(json) 	// json.shots
})
```


# Options

Dribbble allows for options to be set. You can set these by passing your options, as an `{}` object, just before the callback.

```js
dribbble.lists('debuts', { per_page: 30, page: 5 }, function(err, res, json, paging) { })
```


# Paging

The paging object returned to the callbacks may contain a `next` or `previous` function. These functions allow you to make another request, using the same arguments passed before, but with a new callback.

Here's an example where we request as many pages as we can, from the 'popular list', and add all resulting shots to the `popularShots` array.
Once this is done we'll call `onRequestsFinished`.

```js
var popularShots = []

var onRequestsFinished = function() {
	// do something
}

var requestCallback = function(err, res, json, paging) {
	if (Array.isArray(json.shots)) {
		popularShots = popularShots.concat(json.shots)
	}

	if (paging.next) {
		paging.next(requestCallback)
	}
	else {
		onRequestsFinished()
	}
}

dribbble.list('popular', requestCallback)
```

# Future Plans

* User constructor, similar to the one in the [Facebook Graph API](https://github.com/tmarshall/Facebook-Graph-API#using-the-user-object)
* Performance tweaks