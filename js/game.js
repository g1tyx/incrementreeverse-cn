var player;
var needCanvasUpdate = true;
var NaNalert = false;
var gameEnded = false;

// Don't change this
const TMT_VERSION = {
	tmtNum: "2.1.3.1",
	tmtName: "We should have thought of this sooner!"
}

function finishedChallenges(layer, data){
	return challengeCompletions(layer, data) == (layers[layer].challenges[data].completionLimit || 1)
}

function getResetGain(layer, useType = null) {
	let type = useType
	if (!useType) type = tmp[layer].type
	if(tmp[layer].type == "none")
		return new Decimal (0)
	if (tmp[layer].gainExp.eq(0)) return new Decimal(0)
	if (type=="static") {
		if ((!tmp[layer].canBuyMax) || tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(1)
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1).log(tmp[layer].base).times(tmp[layer].gainExp).pow(Decimal.pow(tmp[layer].exponent, -1))
		return gain.floor().sub(player[layer].points).add(1).max(1);
	} else if (type=="normal"){
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(0)
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)
		if (gain.gte("e1e7")) gain = gain.sqrt().times("e5e6")
		return gain.floor().max(0);
	} else if (type=="custom"){
		return layers[layer].getResetGain()
	} else {
		return new Decimal(0)
	}
}

function getNextAt(layer, canMax=false, useType = null) {
	let type = useType
	if (!useType) type = tmp[layer].type
	if(tmp[layer].type == "none")
		return new Decimal (Infinity)

	if (tmp[layer].gainMult.lte(0)) return new Decimal(Infinity)
	if (tmp[layer].gainExp.lte(0)) return new Decimal(Infinity)

	if (type=="static") 
	{
		if (!tmp[layer].canBuyMax) canMax = false
		let amt = player[layer].points.plus((canMax&&tmp[layer].baseAmount.gte(tmp[layer].nextAt))?tmp[layer].resetGain:0)
		let extraCost = Decimal.pow(tmp[layer].base, amt.pow(tmp[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult)
		let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires)
		if (tmp[layer].roundUpCost) cost = cost.ceil()
		return cost;
	} else if (type=="normal"){
		let next = tmp[layer].resetGain.add(1)
		if (next.gte("e1e7")) next = next.div("e5e6").pow(2)
		next = next.root(tmp[layer].gainExp).div(tmp[layer].gainMult).root(tmp[layer].exponent).times(tmp[layer].requires).max(tmp[layer].requires)
		if (tmp[layer].roundUpCost) next = next.ceil()
		return next;
	} else if (type=="custom" && layers[layer].getNextAt != undefined){
		return layers[layer].getNextAt(canMax)
	} else {
		return new Decimal(0)
	}}

// Return true if the layer should be highlighted. By default checks for upgrades only.
function shouldNotify(layer){
	for (id in tmp[layer].upgrades){
		if (!isNaN(id)){
			if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
				return true
			}
		}
	}

	if (layers[layer].shouldNotify){
		return layers[layer].shouldNotify()
	}
	else 
		return false
}

function canReset(layer)
{
	if (tmp[layer].type == "normal")
		return tmp[layer].baseAmount.gte(tmp[layer].requires)
	else if (tmp[layer].type== "static")
		return tmp[layer].baseAmount.gte(tmp[layer].nextAt) 
	if (tmp[layer].type == "none")
		return false
	else if (layers[layer].canReset != undefined)
		return layers[layer].canReset()
	else return tmp[layer].baseAmount.gte(tmp[layer].requires)
}

function rowReset(row, layer) {
	if (row == "side") {
		for (lr in ROW_LAYERS["side"]){
			if (layers[lr].doReset) {
				player[lr].activeChallenge = null // Exit challenges on any row reset on an equal or higher row
				layers[lr].doReset(layer)
			}
		}
		return
	}
	let order = Object.keys(ROW_LAYERS[row])
	if (row == 3) order = order.reverse()
	for (let i = 0; i < order.length; i ++){
		lr = order[i]
		if (layers[lr].doReset) {
			player[lr].activeChallenge = null // Exit challenges on any row reset on an equal or higher row
			layers[lr].doReset(layer)
		}
		else if(tmp[layer].row > tmp[lr].row && row !== "side") layerDataReset(lr)
	}
}

function layerDataReset(layer, keep = []) {
	let storedData = {unlocked: player[layer].unlocked} // Always keep unlocked

	for (thing in keep) {
		if (player[layer][keep[thing]] !== undefined)
			storedData[keep[thing]] = player[layer][keep[thing]]
	}

	player[layer] = layers[layer].startData();
	player[layer].upgrades = []
	player[layer].milestones = []
	player[layer].challenges = getStartChallenges(layer)
	resetBuyables(layer)
	if (layers[layer].clickables && !player[layer].clickables) 
		player[layer].clickables = getStartClickables(layer)

	for (thing in storedData) {
		player[layer][thing] =storedData[thing]
	}
}

function resetBuyables(layer){
	if (layers[layer].buyables) player[layer].buyables = getStartBuyables(layer)
	player[layer].spentOnBuyables = new Decimal(0)
}


function addPoints(layer, gain) {
	player[layer].points = player[layer].points.add(gain).max(0)
	if (player[layer].best) player[layer].best = player[layer].best.max(player[layer].points)
	if (player[layer].total) player[layer].total = player[layer].total.add(gain)
	if (player[layer].bestOnce) player[layer].bestOnce = player[layer].bestOnce.max(gain)
}

function generatePoints(layer, diff) {
	addPoints(layer, tmp[layer].resetGain.times(diff))
}

var prevOnReset

function doReset(layer, force=false) {
	let row = tmp[layer].row
	if (!force) {
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return;
		let gain = tmp[layer].resetGain
		if (tmp[layer].type=="static") {
			if (tmp[layer].baseAmount.lt(tmp[layer].nextAt)) return;
			gain =(tmp[layer].canBuyMax ? gain : 1)
		} 
		if (tmp[layer].type=="custom") {
			if (!tmp[layer].canReset) return;
		} 

		let timesMult = hasUpgrade("o", 13) && layer == "sp" ? 5 : 1
		if (hasMilestone("c", 1) && layer == "sp") timesMult *= 3
		if (hasMilestone("c", 2) && layer == "sp") timesMult *= 5
		if (devSpeedUp) timesMult *= 2

		timesMult = Math.floor(timesMult)
		if (player[layer].times != undefined) player[layer].times += timesMult

		if (layers[layer].onPrestige)
			layers[layer].onPrestige(gain)
		
		addPoints(layer, gain)
		updateMilestones(layer)
		updateAchievements(layer)

		if (!player[layer].unlocked) {
			player[layer].unlocked = true;
			needCanvasUpdate = true;

			if (tmp[layer].increaseUnlockOrder){
				lrs = tmp[layer].increaseUnlockOrder
				for (lr in lrs)
					if (!player[lrs[lr]].unlocked) player[lrs[lr]].unlockOrder++
			}
		}
		tmp[layer].baseAmount = new Decimal(0) // quick fix
	}
	if (tmp[layer].resetsNothing) return

	for (layerResetting in layers) {
		if (row >= layers[layerResetting].row && (!force || layerResetting != layer)) completeChallenge(layerResetting)
	}

	prevOnReset = {...player} //Deep Copy
	player.points = (row == 0 ? new Decimal(0) : getStartPoints())

	for (let x = row; x >= 0; x--) rowReset(x, layer)
	rowReset("side", layer)
	prevOnReset = undefined

	updateTemp()
	updateTemp()
}

function resetRow(row) {
	if (prompt('你真要重置这一行的所有层级？输入 "I WANT TO RESET THIS" （不含引号）以确认。')!="I WANT TO RESET THIS") return
	let pre_layers = ROW_LAYERS[row-1]
	let layers = ROW_LAYERS[row]
	let post_layers = ROW_LAYERS[row+1]
	rowReset(row+1, post_layers[0])
	doReset(pre_layers[0], true)
	for (let layer in layers) {
		player[layer].unlocked = false
		if (player[layer].unlockOrder) player[layer].unlockOrder = 0
	}
	player.points = getStartPoints()
	updateTemp();
	resizeCanvas();
}

function startChallenge(layer, x) {
	let enter = false
	if (!player[layer].unlocked) return
	if (player[layer].activeChallenge == x) {
		completeChallenge(layer, x)
		delete player[layer].activeChallenge
	} else {
		enter = true
	}	
	doReset(layer, true)
	if (layer == "b") doReset("am", true)
	if (enter) player[layer].activeChallenge = x

	updateChallengeTemp(layer)
}

function canCompleteChallenge(layer, x){
	if (x != player[layer].activeChallenge) return

	let challenge = tmp[layer].challenges[x] 

	if (challenge.currencyInternalName){
		let name = challenge.currencyInternalName
		if (challenge.currencyLocation){
			return !(challenge.currencyLocation[name].lt(challenge.goal)) 
		}
		else if (challenge.currencyLayer){
			let lr = challenge.currencyLayer
			return !(player[lr][name].lt(readData(challenge.goal))) 
		}
		else {
			return !(player[name].lt(challenge.goal))
		}
	}
	else {
		return !(player[layer].points.lt(challenge.goal))
	}
}

function completeChallenge(layer, x) {
	var x = player[layer].activeChallenge
	if (!x) return
	if (layer == "sp") {
		let pts = layers.sp.challenges.getPointGain()
		if (x == 11) player.sp.chall1points = player.sp.chall1points.max(pts)
		if (x == 12) player.sp.chall2points = player.sp.chall2points.max(pts)
		if (x == 21) player.sp.chall3points = player.sp.chall3points.max(pts)
		if (x == 22) player.sp.chall4points = player.sp.chall4points.max(pts)
	}
	if (!canCompleteChallenge(layer, x)){
		delete player[layer].activeChallenge
		return
	}
	if (player[layer].challenges[x] < tmp[layer].challenges[x].completionLimit || player[layer].challenges[x] == undefined) {
		needCanvasUpdate = true
		player[layer].challenges[x] += 1
		if (layers[layer].challenges[x].onComplete) layers[layer].challenges[x].onComplete()
	}
	while (player[layer].challenges[x] < tmp[layer].challenges[x].completionLimit) {
		if (layer == "b" && x == 12) break

		tmp[layer].challenges[x].goal = layers[layer].challenges[x].goal
		if (typeof tmp[layer].challenges[x].goal == "function"){
			tmp[layer].challenges[x].goal = tmp[layer].challenges[x].goal()
		}
		
		if (canCompleteChallenge(layer, x)) player[layer].challenges[x] += 1
		else break
	}
	delete player[layer].activeChallenge
	updateChallengeTemp(layer)
}

VERSION.withoutName = "v" + VERSION.num + (VERSION.pre ? " Pre-Release " + VERSION.pre : VERSION.pre ? " Beta " + VERSION.beta : "")
VERSION.withName = VERSION.withoutName + (VERSION.name ? ": " + VERSION.name : "")

function gameLoop(diff) {
	if (isEndgame() || gameEnded) gameEnded = 1

	if (isNaN(diff)) diff = 0
	if (gameEnded && !player.keepGoing) {
		diff = 0
		player.tab = "gameEnded"
	}
	if (player.devSpeed) diff *= player.devSpeed

	let limit = maxTickLength()
	if (diff > limit) diff = limit

	addTime(diff)
	player.points = player.points.add(tmp.pointGen.times(diff)).max(0)

	for (x = 0; x <= maxRow; x++){
		for (item in TREE_LAYERS[x]) {
			let layer = TREE_LAYERS[x][item].layer
			if (layers[layer].update) layers[layer].update(diff);
		}
	}

	for (row in OTHER_LAYERS){
		for (item in OTHER_LAYERS[row]) {
			let layer = OTHER_LAYERS[row][item].layer
			if (layers[layer].update) layers[layer].update(diff);
		}
	}	

	for (x = maxRow; x >= 0; x--){
		for (item in TREE_LAYERS[x]) {
			let layer = TREE_LAYERS[x][item].layer
			if (layers[layer].automate) layers[layer].automate();
		}
	}

	for (row in OTHER_LAYERS){
		for (item in OTHER_LAYERS[row]) {
			let layer = OTHER_LAYERS[row][item].layer
			if (layers[layer].automate) layers[layer].automate();
		}
	}

	for (layer in layers){
		if (layers[layer].milestones) updateMilestones(layer);
		if (layers[layer].achievements) updateAchievements(layer)
	}

	if (player.hasNaN&&!NaNalert) {
		clearInterval(interval);
		player.autosave = false;
		NaNalert = true;

		alert("你的存档坏了，上 Discord 问问看吧。")
	}
}

function hardReset() {
	if (!confirm("你确定要这样做吗？你将会失去所有的游戏进度！")) return
	player = getStartPlayer()
	save();
	window.location.reload();
}

var ticking = false
var devstop = false

function aboveZero(){
	list = ["i", "am", "a", "m", "e", "p", "n", "g", "q", "s", "b", "sp", "pi", "c", "o"]
	for (let i = 0; i < list.length; i ++){
		player[list[i]].points = player[list[i]].points.max(0)
	}
}

var interval = setInterval(function() {
	if (player===undefined||tmp===undefined) return;
	if (ticking) return;
	if (gameEnded&&!player.keepGoing) return;
	if (devstop) return
	ticking = true
	let now = Date.now()
	let diff = (now - player.time) / 1e3
	if (player.offTime !== undefined) {
		if (player.offTime.remain > modInfo.offlineLimit * 3600000) player.offTime.remain = modInfo.offlineLimit * 3600000
		if (player.offTime.remain > 0) {
			let offlineDiff = Math.max(player.offTime.remain / 10, diff)
			player.offTime.remain -= offlineDiff
			diff += offlineDiff
		}
		if (!player.offlineProd || player.offTime.remain <= 0) delete player.offTime
	}
	if (player.devSpeed != undefined) diff *= player.devSpeed
	player.time = now
	if (needCanvasUpdate) resizeCanvas();
	aboveZero()
	updateTemp();
	gameLoop(diff)
	ticking = false
}, 50)
