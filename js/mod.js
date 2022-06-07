let modInfo = {
	name: "增量树宇宙",
	id: "Incrementreeverse-CN",
	author: "pg132",
	pointsName: "点数",
	discordName: "pg132#7975",
	discordLink: "",
	changelogLink: "about:blank",
    	offlineLimit: 10/3600,   
	// In hours, so the current (10/3600) is 10 seconds
    	initialStartPoints: new Decimal (0) // Used for hard resets and new players
}

// Set your version in num and name
let VERSION = {
	num: "1.0",
	name: "The Abelian Tributary",
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
	function (){
		if (shiftDown) return "已按下 Shift 键"
		if (inChallenge("q", 11)) {
			return "你正在进行夸克挑战 Son"
		} 
		if (inChallenge("q", 12)) {
			return "你正在进行夸克挑战 Sun"
		}
		if (inChallenge("q", 21)) {
			return "你正在进行夸克挑战 Pole"
		}
		if (inChallenge("q", 22)) {
			return "你正在进行夸克挑战 Poll"
		}
		if (inChallenge("m", 11)) {
			return "你正在进行物质挑战 Creak"
		}
		if (inChallenge("m", 12)) {
			return "你正在进行物质挑战 Creek"
		}
		if (inChallenge("am", 11)) {
			return "你正在进行反物质挑战 Know?"
		}
		if (inChallenge("am", 12)) {
			return "你正在进行反物质挑战 No!"
		}
		if (inChallenge("b", 11)) {
			return "你正在进行玻色子挑战 Been"
		}
		if (inChallenge("b", 12)) {
			return "你正在进行玻色子挑战 Bin"
		}
		if (inChallenge("b", 21)) {
			return "你正在进行玻色子挑战 Band"
		}
		if (inChallenge("b", 22)) {
			return "你正在进行玻色子挑战 Banned"
		}
		if (inChallenge("sp", 11)) {
			return "你正在进行超级重置挑战 Quartz"
		}
		if (inChallenge("sp", 12)) {
			return "你正在进行超级重置挑战 Quarts"
		}
		if (inChallenge("sp", 21)) {
			return "你正在进行超级重置挑战 Jewel"
		}
		if (inChallenge("sp", 22)) {
			return "你正在进行超级重置挑战 Joule"
		}
		if (player.c.best.gt(0))  return "已解锁所有层级！"
		if (player.f.best.gt(0))  return "你还需要解锁 1 个层级"
		if (player.o.best.gt(0))  return "你还需要解锁 2 个层级"
		if (player.pi.best.gt(0)) return "你还需要解锁 3 个层级"
		if (player.sp.best.gt(0)) return "你还需要解锁 4 个层级"
		if (player.b.best.gt(0))  return "你还需要解锁 5 个层级"
		if (player.s.best.gt(0))  return "你还需要解锁 6 个层级"
		if (player.q.best.gt(0))  return "你还需要解锁 7 个层级"
		if (player.g.best.gt(0))  return "你还需要解锁 8 个层级"
		if (player.n.best.gt(0))  return "你还需要解锁 9 个层级"
		if (player.p.best.gt(0))  return "你还需要解锁 10 个层级"
		if (player.p.best.gt(0))  return "你还需要解锁 11 个层级"
		if (player.e.best.gt(0))  return "你还需要解锁 12 个层级"
		if (player.m.best.gt(0))  return "你还需要解锁 13 个层级"
		if (player.a.best.gt(0))  return "你还需要解锁 14 个层级"
		if (player.am.best.gt(0)) return "你还需要解锁 15 个层级"
		return "欢迎来到增量树宇宙！"
	},
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.layer > 1.7e308
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return 1000 // in ms
}

var controlDown = false
var shiftDown = false

window.addEventListener('keydown', function(event) {
	if (event.keyCode == 16) shiftDown = true;
	if (event.keyCode == 17) controlDown = true;
}, false);

window.addEventListener('keyup', function(event) {
	if (event.keyCode == 16) shiftDown = false;
	if (event.keyCode == 17) controlDown = false;
}, false);