function getPointGen() {
	if (!canGenPoints()) return new Decimal(0)

	let gain = new Decimal(1)
        if (hasIUpg(11)) gain = gain.times(getIUpgEff(11))
        gain = gain.times(layers.am.effect())
        gain = gain.times(layers.m.effect()[0])
        gain = gain.times(layers.a.effect()[0])
        

        if (inChallenge("am", 12)) gain = gain.pow(.1)
	return gain
}

function filter(list, keep){
        return list.filter(x => keep.includes(x))
}

function canBuyMax(layer, id) {
        if (layer == "i") return hasAMUpgrade(13)
	return false
}

function hasIUpg(id){
        return hasUpgrade("i", id)
}

function getIUpgEff(id){
        return upgradeEffect("i", id)
}

function getIBuyableCost(id){
        return layers.i.buyables[id].cost()
}

function getNBuyableCost(id){
        return layers.n.buyables[id].cost()
}

function getIBuyableEff(id){
        return layers.i.buyables[id].effect()
}

function getNBuyableEff(id){
        return layers.n.buyables[id].effect()
}

function getIBuyablesTotalRow(row){
        a = new Decimal(0)
        for (i = 1; i <= layers.i.buyables.cols; i++){
                a = a.plus(getBuyableAmount("i", 10*row+i))
        }
        return a
}

function getIBuyableFormat(id){
        let a = getBuyableAmount("i", id)
        let init = formatWhole(a)
        let ex = layers.i.buyables[id].extra()
        if (ex.eq(0)) return init
        return init + " + " + formatWhole(ex)
}

function getNBuyableFormat(id){
        let a = getBuyableAmount("n", id)
        return formatWhole(a)
}

function getNExtraBuyableFormat(id){
        let a = layers.n.buyables[id].extra()
        return formatWhole(a)
}

function getAMUpgEff(id){
        return upgradeEffect("am", id)
}

function hasAMUpgrade(id){
        return hasUpgrade("am", id)
}

function formatNextIUpgText(id, amt){
        let start = "你需要 " + formatWhole(amt) + " 级的 "
        let end = " 以解锁下一个升级"
        let mid = layers.i.buyables[id].title
        return start + mid + end
}

function canSeeIUpgrade(id){
        return layers.i.upgrades[id].unlocked()
}

function canUnlIUpgForText(id){
        if (id <= 31) {
                if (hasAMUpgrade(12)) return false //we already see it
                if (id % 10 == 1) return !canSeeIUpgrade(id) && canSeeIUpgrade(id-7)
                return !canSeeIUpgrade(id) && canSeeIUpgrade(id-1)
        }
        if (!hasAMUpgrade(13)) return false
        if (id <= 34) {
                if (id % 10 == 1) return !canSeeIUpgrade(id) && canSeeIUpgrade(id-7)
                return !canSeeIUpgrade(id) && canSeeIUpgrade(id-1)
        }
        
        return false 
}

function hasAUpgrade(id){
        return hasUpgrade("a", id)
}

function getEUpgEff(id){
        return upgradeEffect("e", id)
}

function getIStaminaSoftcapStart(){ 
        //REMEMBER: IT IS A NUMBER NOT A DECIMAL
        if (inChallenge("sp", 21)) return 1
        let ret = 40
        if (hasChallenge("am", 11)) ret += 5
        if (hasChallenge("m", 11)) ret += 5
        if (hasUpgrade("e", 43)) ret += 1
        if (hasUpgrade("e", 54)) ret += 1
        if (hasUpgrade("am", 25)) ret += 3
        if (hasUpgrade("b", 43)) ret += challengeCompletions("b", 22)
        ret += layers.sp.effect()[0].toNumber()
        if (hasUpgrade("s", 42)) ret += player.s.upgrades.length
        if (hasUpgrade("sp", 13)) ret += player.sp.upgrades.length
        if (hasUpgrade("sp", 21)) ret += challengeCompletions("sp", 21)
        ret += layers.pi.effect().toNumber()
        if (hasMilestone("pi", 1)) ret += 2 * player.pi.milestones.length
        if (hasUpgrade("pi", 13)) ret += player.pi.upgrades.length
        if (hasUpgrade("sp", 54)) ret += 69
        if (hasUpgrade("sp", 54)) ret += 5
        if (hasUpgrade("o", 33)) ret += layers.o.buyables[11].total().toNumber()
        if (hasUpgrade("o", 42)) ret += 42
        ret += layers.f.ammoniaEffect()

        return ret
}


function getIncBuyableFormulaText(id){
        if (id == 11){
                let base = (hasIUpg(22) ? 1 : 2)/1.01
                let linear = format(base, 2) + "^x"
                return "10*" + linear + "*1.01^(x^2)"
        } 
        if (id == 12){
                let base = hasIUpg(23) ? 1 : 4
                let linear = ""
                if (base != 1) linear = format(base, 0) + "^x*"
                return "1e4*" + linear + "1.25^(x^2)"
        }
        if (id == 13){
                let linear = ""
                let b1 = hasIUpg(24) ? 1 : 2
                if (b1 != 1) linear = format(b1, 0) + "^x*"
                let quad = "1.25^(x^2)*"
                let start = "1e5*"
                if (!hasUpgrade("a", 14) && !hasUpgrade("pi", 32)) start = "1e5*" + linear + quad

                let y = getBuyableAmount("i", 13).minus(4).max(1)
                if (hasIUpg(31)) y = new Decimal(1)
                
                let base1 = y.div(10).plus(1)
                let base2 = y.sqrt().div(5).plus(1)

                let formatNum = hasIUpg(31) ? 1 : 2

                let exp = format(base1, formatNum) + "^(" + format(base2, formatNum) + "^"
                let end = hasIUpg(31) ? "(x/2.5+1)" : "x"
                
                return start + exp + end + ")"
        }
}

function getBChallengeTotal(){
        return challengeCompletions("b", 11) + challengeCompletions("b", 12) + challengeCompletions("b", 21) + challengeCompletions("b", 22)
}

function getStaminaMaximumAmount(){
        let a = 400

        if (hasUpgrade("pi", 33)) a += Math.max(0, player.pi.upgrades.length - 10) * 10
        if (hasUpgrade("p", 41)) {
                a += 2
                if (hasUpgrade("p", 42)) a += 2
                if (hasUpgrade("p", 43)) a += 2
                if (hasUpgrade("p", 44)) a += 2
                if (hasUpgrade("p", 45)) a += 2
        }
        if (hasUpgrade("p", 44)) a += 5
        if (hasUpgrade("p", 45)) a += 5
        if (hasUpgrade("p", 51)) {
                a += 4
                if (hasUpgrade("p", 52)) a += 4
                if (hasUpgrade("p", 53)) a += 4
                if (hasUpgrade("p", 54)) a += 4
                if (hasUpgrade("p", 55)) a += 4
        }
        if (hasUpgrade("sp", 53)) a += 3 * player.sp.upgrades.length
        if (hasUpgrade("pi", 43)) a += 5

        if (hasUpgrade("o", 54)) a += layers.o.buyables[23].total().pow(3).toNumber()

        return Math.min(Math.round(a), 1e9)
}

function getIncABMult(){
        let mult = 1
        if (hasMilestone("a", 4)) mult *= 1e3
        if (hasUpgrade("b", 23)) mult *= 5
        if (hasUpgrade("s", 55)) mult *= 10
        if (hasUpgrade("sp", 45)) mult *= 10
        if (hasMilestone("o", 0)) mult *= 10
        if (hasUpgrade("o", 22)) mult *= 25
        if (hasUpgrade("o", 52)) mult *= 100
        if (hasUpgrade("c", 12)) mult *= 20
        if (hasUpgrade("c", 15)) mult *= 20 
        return mult
}

function doMilestoneC1Buff(x){
        let buffexp = Decimal.pow(1.01, player.c.times)
        if (x.lte(10)) return x
        
        let ret = Decimal.pow(10, x.log10().pow(buffexp))

        return ret
}

function hasUnlockedRow(r){
        if (r == 4) return player.c.best.gt(0) || player.o.best.gt(0)
        if (r == 3) return hasUnlockedRow(4)   || player.s.best.gt(0) || player.sp.best.gt(0) || player.pi.best.gt(0)
        if (r == 2) return hasUnlockedRow(3)   || player.a.best.gt(0)
        if (r == 1) return hasUnlockedRow(2)   || player.am.best.gt(0)
}

var incGainFactor = new Decimal(1)
var devSpeedUp = false

// http://www.singularis.ltd.uk/bifroest/misc/homophones-list.html for list of homophones

addLayer("i", {
        name: "增量", 
        symbol: "I", 
        position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
                time: 0,
        }},
        color: "#4B4C83",
        requires: new Decimal(10), 
        resource: "增量", 
        baseResource: "点数", 
        baseAmount() {return player.points}, 
        type: "custom", 
        getResetGain() {
                let pts = layers.i.baseAmount()
                let pre = layers.i.getGainMultPre()
                let exp = layers.i.getGainExp()
                let pst = layers.i.getGainMultPost()
                let ret = new Decimal(0)
                if (!hasUpgrade("pi", 32)) {
                        ret = pts.max(10).log10().times(pre).pow(exp).times(pst).minus(1)
                } else {
                        let exp2 = layers.i.getGainExp(true)
                        ret1 = pts.max(10).log10().pow(exp2)
                        ret2 = pre.pow(exp)
                        ret = ret1.times(ret2).times(pst).minus(1)
                }
                ret = ret.times(incGainFactor).max(0)

                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                if (inChallenge("am", 11)) ret = ret.root(10)
                if (inChallenge("m", 11))  ret = ret.root(2)
                if (inChallenge("m", 12))  ret = ret.root(3)
                if (inChallenge("q", 11))  ret = ret.root(2)
                if (inChallenge("q", 12))  ret = ret.root(3)
                if (inChallenge("q", 21))  ret = ret.root(4)
                if (inChallenge("q", 22))  ret = ret.root(5)
                if (inChallenge("sp", 22)) ret = ret.root(100)

                return ret
        },
        getGainExp(unsoftcapped){
                let x = new Decimal(1)
                x = x.times(getIBuyableEff(13, unsoftcapped))
                if (hasUpgrade("pi", 34)) x = x.pow(Decimal.pow(1.1, player.pi.upgrades.length))
                if (hasUpgrade("p", 42)) x = x.pow(Decimal.pow(1.0001, player.p.upgrades.length ** 2))
                if (hasUpgrade("sp", 51)) {
                        let a = 1
                        if (hasUpgrade("sp", 52)) a ++
                        if (hasUpgrade("sp", 53)) a ++
                        if (hasUpgrade("sp", 54)) a ++
                        if (hasUpgrade("sp", 55)) a ++

                        x = x.pow(Decimal.pow(1.2, a))
                }
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                x = x.times(layers.o.buyables[11].effect())
                return x
        },
        getGainMultPre(){
                let x = new Decimal(1)
                if (hasIUpg(32))          x = x.times(layers.am.effect())
                if (hasAMUpgrade(14))     x = x.times(getBuyableAmount("i", 12).max(1))
                if (hasAMUpgrade(22))     x = x.times(getBuyableAmount("i", 11).max(1))
                if (hasAMUpgrade(24))     x = x.times(getBuyableAmount("i", 13).max(1))
                if (hasAUpgrade(21))      x = x.times(upgradeEffect("a", 21))
                if (hasAUpgrade(22))      x = x.times(upgradeEffect("a", 22))
                if (hasAUpgrade(23))      x = x.times(upgradeEffect("a", 23))
                if (hasUpgrade("e", 41))  x = x.times(upgradeEffect("e", 41))
                if (hasUpgrade("e", 44))  x = x.times(upgradeEffect("e", 44))
                x = x.times(getNBuyableEff(13))
                if (hasUpgrade("g", 24))  x = x.times(upgradeEffect("g", 24))
                if (hasUpgrade("sp", 41)) x = x.times(player.sp.points.plus(1))
                if (hasMilestone("o", 0)) x = x.times(layers.o.effect())

                return x
        },
        getGainMultPost(){
                let x = new Decimal(1)
                x = x.times(getIBuyableEff(11))
                if (hasIUpg(12)){
                        let a = 1
                        a += hasIUpg(11) ? 1 : 0
                        a += hasIUpg(13) ? 1 : 0
                        a += hasIUpg(14) ? 1 : 0
                        a += hasIUpg(15) ? 1 : 0
                        x = x.times(Decimal.pow(1.1, a))
                }
                x = x.times(getIBuyableEff(12))
                if (!hasIUpg(32)) x = x.times(layers.am.effect())
                if (hasAMUpgrade(11)) x = x.times(getAMUpgEff(11))
                if (hasAMUpgrade(12)) x = x.times(3)
                x = x.times(layers.a.effect()[0])
                x = x.times(layers.m.effect()[0])
                if (hasUpgrade("e", 23)) x = x.times(player.e.points.max(1))
                if (hasChallenge("m", 11)) x = x.times(player.e.points.max(1))
                x = x.times(getNBuyableEff(21))
                if (hasUpgrade("g", 31)) x = x.times(player.n.points.max(1))
                x = x.times(layers.s.effect())
                x = x.times(player.a.points.plus(1).pow(layers.b.effect()))
                x = x.times(layers.sp.effect()[1])
                
                return x
        },
        update(diff){
                player.i.points = player.i.points.plus(layers.i.getResetGain().times(diff))
                if (!player.i.best) player.i.best = new Decimal(0)
                player.i.best = player.i.best.max(player.i.points)
                
                if (!player.i.time) player.i.time = 0
                let mult = hasMilestone("sp", 2) ? 3 : 1
                player.i.time += diff * mult
                if (player.i.time > 1) {
                        let times = -Math.floor(player.i.time)
                        player.i.time += times
                        times *= -1
                        let mult = getIncABMult()
                        if (hasMilestone("a", 2) || hasUpgrade("pi", 32) || hasMilestone("o", 1)) {
                                layers.i.buyables[11].buyMax(times * mult)
                                layers.i.buyables[12].buyMax(times * mult)
                                layers.i.buyables[13].buyMax(times * mult)
                        }
                        if (player.i.time > 10) player.i.time = 10
                }
        },
        row: 0, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){return true},
        prestigeButtonText(){
                return "恭喜成功卡 bug"
        },
        canReset(){
                return false
        },
        nextUpgradeText(){
                let t = ""
                if (canUnlIUpgForText(13)) t = formatNextIUpgText(11, 10)
                if (canUnlIUpgForText(14)) t = formatNextIUpgText(12, 3)
                if (canUnlIUpgForText(21)) t = formatNextIUpgText(11, 15)
                if (canUnlIUpgForText(22)) t = formatNextIUpgText(11, 19)
                if (canUnlIUpgForText(23)) t = formatNextIUpgText(11, 65)
                if (canUnlIUpgForText(24)) t = formatNextIUpgText(11, 67)
                if (canUnlIUpgForText(31)) t = formatNextIUpgText(12, 14)
                if (canUnlIUpgForText(32)) t = formatNextIUpgText(12, 17)
                if (canUnlIUpgForText(33)) t = formatNextIUpgText(11, 89)
                if (canUnlIUpgForText(34)) t = formatNextIUpgText(13, 19)
                
                return t
        },
        upgrades: {
                rows: 3,
                cols: 5,
                11: {
                        title: "Cache",
                        description: "Incrementy multiplies point gain",
                        cost: new Decimal(2),
                        effect(){
                                let ret = player.i.points.plus(1)
                                if (hasIUpg(24)) ret = player.i.best.plus(1)
                                if (hasIUpg(21)) ret = ret.pow(2)
                                return ret
                        },
                },
                12: {
                        title: "Cash",
                        description: "Unlock the first repeatable upgrade and each upgrade in this row multiples Incrementy gain by 1.1",
                        cost: new Decimal(30),
                        unlocked(){
                                return hasIUpg(11) || hasUnlockedRow(1)
                        },
                },
                13: {
                        title: "Raze",
                        description: "Unlock the second repeatable upgrade",
                        cost: new Decimal(1e4),
                        unlocked(){
                                return getBuyableAmount("i", 11).gte(10) || hasUnlockedRow(1)
                        }
                },
                14: {
                        title: "Raise",
                        description: "Unlock the third repeatable upgrade",
                        cost: new Decimal(2e5),
                        unlocked(){
                                return getBuyableAmount("i", 12).gte(3) || hasUnlockedRow(1)
                        }
                },
                21: {
                        title: "Faze", 
                        description: "Square Cache",
                        cost: new Decimal(2e5),
                        unlocked(){
                                return getBuyableAmount("i", 11).gte(15) || hasUnlockedRow(1)
                        },
                },
                22: {
                        title: "Phase", 
                        description: "Remove the linear cost scaling of Incrementy Speed",
                        cost: new Decimal(15e7),
                        unlocked(){
                                return getBuyableAmount("i", 11).gte(19) || hasUnlockedRow(1)
                        },
                },
                23: {
                        title: "Flower", 
                        description: "Remove the linear cost scaling of Incrementy Strength",
                        cost: new Decimal(1e19),
                        unlocked(){
                                return getBuyableAmount("i", 11).gte(65) || hasUnlockedRow(1)
                        },
                },
                24: {
                        title: "Flour", 
                        description: "Remove the linear cost scaling of Incrementy Stamina and Cache is based on best Incrementy",
                        cost: new Decimal(1e20),
                        unlocked(){
                                return getBuyableAmount("i", 11).gte(67) || hasUnlockedRow(1)
                        },
                },
                31: {
                        title: "Kernel", 
                        description: "Nerf the superexponential Incrementy Stamina scaling",
                        cost: new Decimal(1e21),
                        unlocked(){
                                return getBuyableAmount("i", 12).gte(14) || hasUnlockedRow(1)
                        },
                },
                32: {
                        title: "Colonel", 
                        description: "Antimatter effect is applied before Stamina",
                        cost: new Decimal(2e29),
                        unlocked(){
                                return (hasAMUpgrade(13) && getBuyableAmount("i", 12).gte(17)) || hasUnlockedRow(2)
                        },
                },
                33: {
                        title: "Hall", 
                        description: "Each Incrementy Strength adds .02 to the Incrementy Strength base (capped at 10)",
                        cost: new Decimal(1e34),
                        unlocked(){
                                return (hasAMUpgrade(13) && getBuyableAmount("i", 11).gte(89)) || hasUnlockedRow(2)
                        },
                },
                34: {
                        title: "Haul", 
                        description: "Each Incrementy Speed adds .01 to the Incrementy Speed base (capped at 10)",
                        cost: new Decimal(1e37),
                        unlocked(){
                                return (hasAMUpgrade(13) && getBuyableAmount("i", 13).gte(19)) || hasUnlockedRow(2)
                        },
                },
                15: {
                        title: "Currently,",
                        description: "Each upgrade in this column adds .5 to the Neutrino Generation buyable base",
                        cost: new Decimal("1e59625"),
                        unlocked(){
                                return hasChallenge("q", 11) || hasIUpg(15) || hasUnlockedRow(3)
                        },
                },
                25: {
                        title: "Always,",
                        description: "Double Quark gain",
                        cost: new Decimal("1e61090"),
                        unlocked(){
                                return hasIUpg(15) || hasUnlockedRow(3)
                        },
                },
                35: {
                        title: "Friendless.",
                        description: "Amoeba Gain buyables give free levels to Incrementy Boost buyables",
                        cost: new Decimal("1e66205"),
                        unlocked(){
                                return hasIUpg(25) || hasUnlockedRow(3)
                        },
                },
        },
        buyables: {
                rows: 1,
                cols: 3,
                11: {
                        title: "Incrementy Speed",
                        display(){
                                let start = "<b><h2>Amount</h2>: " + getIBuyableFormat(11) + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getIBuyableEff(11)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getIBuyableCost(11)) + " Incrementy</b><br>"
                                let cformula = "<b><h2>Cost formula</h2>:<br>" + getIncBuyableFormulaText(11) + "</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.i.buyables[11].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? cformula + eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("i", 11).plus(a)
                                let base1 = hasIUpg(22) ? 1 : 2
                                let exp2 = x.minus(1).max(0).times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(1.01, exp2)).times(10)
                        },
                        effectBase(){
                                let x = layers.i.buyables[11].total()
                                let base = new Decimal(1.5)
                                let hauleff = x.div(100)
                                if (!hasUpgrade("a", 24)) hauleff = hauleff.min(10)
                                if (hasIUpg(34)) base = base.plus(hauleff)
                                if (hasUpgrade("s", 13)) base = base.plus(1)
                                return base
                        },
                        effect(){
                                let x = layers.i.buyables[11].total()
                                let base = layers.i.buyables[11].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.i.points.gte(getIBuyableCost(11)) && player.i.buyables[11].lt(5e5)
                        },
                        total(){
                                return getBuyableAmount("i", 11).plus(layers.i.buyables[11].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("s", 22)) ret = ret.plus(player.s.upgrades.length)
                                ret = ret.plus(layers.b.challenges[12].rewardEffect().times(layers.i.buyables[13].total()).floor())
                                return ret
                        },
                        buy(){
                                let cost = getIBuyableCost(11)
                                if (!layers.i.buyables[11].canAfford()) return
                                player.i.buyables[11] = player.i.buyables[11].plus(1)
                                if (!hasAMUpgrade(13)) player.i.points = player.i.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.i.points.lt(10)) return
                                if (player.i.points.lt(20)) {
                                        layers.i.buyables[11].buy()
                                        return
                                }
                                let base1 = (hasIUpg(22) ? 1 : 2 / 1.01) 

                                let pttarget = player.i.points.div(10).log(1.01)
                                let bfactor = Math.log(base1)/Math.log(1.01)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor - 1

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                target = target.min(5e5)

                                let diff = target.minus(player.i.buyables[11]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.i.buyables[11] = player.i.buyables[11].plus(diff)
                        },
                        unlocked(){ return hasIUpg(12) || hasUnlockedRow(3)},
                },
                12: {
                        title: "Incrementy Strength",
                        display(){
                                let start = "<b><h2>Amount</h2>: " + getIBuyableFormat(12) + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getIBuyableEff(12)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getIBuyableCost(12)) + " Incrementy</b><br>"
                                let cformula = "<b><h2>Cost formula</h2>:<br>" + getIncBuyableFormulaText(12) + "</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.i.buyables[12].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? cformula + eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("i", 12).plus(a)
                                let base1 = hasIUpg(23) ? 1 : 4
                                return Decimal.pow(base1, x).times(Decimal.pow(1.25, x.times(x))).times(1e4)
                        },
                        effectBase(){
                                let x = layers.i.buyables[12].total()
                                let base = new Decimal(2)
                                if (hasIUpg(33)) {
                                        let a = x.div(50)
                                        if (!hasUpgrade("b", 11)) a = a.min(10)
                                        base = base.plus(a)
                                }
                                base = base.plus(layers.b.challenges[11].rewardEffect())
                                return base
                        },
                        effect(){
                                let x = layers.i.buyables[12].total()
                                let base = layers.i.buyables[12].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.i.points.gte(getIBuyableCost(12)) && player.i.buyables[12].lt(5e5)
                        },
                        total(){
                                return getBuyableAmount("i", 12).plus(layers.i.buyables[12].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("s", 22)) ret = ret.plus(player.s.upgrades.length)
                                if (hasUpgrade("b", 31)) ret = ret.plus(layers.b.challenges[12].rewardEffect().times(layers.i.buyables[13].total()).floor())
                                return ret
                        },
                        buy(){
                                let cost = getIBuyableCost(12)
                                if (!layers.i.buyables[12].canAfford()) return
                                player.i.buyables[12] = player.i.buyables[12].plus(1)
                                if (!hasAMUpgrade(13)) player.i.points = player.i.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.i.points.lt(1e4)) return
                                if (player.i.points.lt(4e4)) {
                                        layers.i.buyables[12].buy()
                                        return
                                }
                                let base1 = (hasIUpg(23) ? 1 : 4) 

                                let pttarget = player.i.points.div(1e4).log(1.25)
                                let bfactor = Math.log(base1) / Math.log(1.25)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                target = target.min(5e5)

                                let diff = target.minus(player.i.buyables[12]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.i.buyables[12] = player.i.buyables[12].plus(diff)
                        },
                        unlocked(){ return hasIUpg(13) || hasUnlockedRow(3)},
                },
                13: {
                        title: "Incrementy Stamina",
                        display(){
                                let eformbase = format(layers.i.buyables[13].effectBase(), 3)
                                let eform = eformbase + "^x"
                                let scs = getIStaminaSoftcapStart()
                                if (layers.i.buyables[13].total().gt(scs)) eform = eformbase + "^(sqrt(x*" + formatWhole(scs) + "))"


                                let start = "<b><h2>Amount</h2>: " + getIBuyableFormat(13) + "</b><br>"
                                let softcapped = layers.i.buyables[13].total().gt(getIStaminaSoftcapStart())
                                let eff = "<b><h2>Effect</h2>: ^" + format(getIBuyableEff(13)) + (softcapped ? " (softcapped)" : "") + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getIBuyableCost(13)) + " Incrementy</b><br>"
                                let cformula = "<b><h2>Cost formula</h2>:<br>" + getIncBuyableFormulaText(13) + "</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + eform + "</b><br>"
                                let end = shiftDown ? cformula + eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("i", 13).plus(a)
                                let xcopy = getBuyableAmount("i", 13).plus(a)
                                if (x.gt(5e5)) x = x.div(5e5).pow(5).times(5e5)

                                let b1 = hasIUpg(24) ? 1 : 2
                                
                                let y = x.minus(4).max(1)
                                if (hasIUpg(31) || hasUpgrade("pi", 32)) {
                                        y = new Decimal(1)
                                        if (x.gt(5/3)) x = x.div(2.5).plus(1)
                                }
                                let base1 = y.div(10).plus(1)
                                let base2 = y.sqrt().div(5).plus(1)
                                
                                let ret = new Decimal(1e5)
                                if (!hasUpgrade("a", 14) && !hasUpgrade("pi", 32)) ret = ret.times(Decimal.pow(b1, xcopy).times(Decimal.pow(1.25, xcopy.times(xcopy))))
                                
                                return ret.times(Decimal.pow(base1, Decimal.pow(base2, x)))
                        },
                        effectBase(){
                                let add = devSpeedUp ? .001 : 0
                                if (hasUpgrade("p", 43)) add += .001
                                if (hasUpgrade("p", 53)) add += .002
                                return (hasUpgrade("pi", 32) ? 1.07 : 1.05) + add 
                        },
                        effect(){
                                let x = layers.i.buyables[13].total()
                                let scs = getIStaminaSoftcapStart()
                                if (!hasUpgrade("pi", 32) && x.gt(scs)) x = x.div(scs).pow(.5).times(scs)
                                let ret = Decimal.pow(layers.i.buyables[13].effectBase(), x)
                                
                                if (inChallenge("b", 11)) return x.div(20).plus(1)
                                return ret
                        },
                        canAfford(){
                                return player.i.points.gte(getIBuyableCost(13)) && player.i.buyables[13].lt(getStaminaMaximumAmount())
                        },
                        total(){
                                return getBuyableAmount("i", 13).plus(layers.i.buyables[13].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("s", 11)) ret = ret.plus(1)
                                if (hasUpgrade("s", 12)) ret = ret.plus(1)
                                if (hasUpgrade("s", 22)) ret = ret.plus(player.s.upgrades.length)
                                if (hasUpgrade("o", 11)) ret = ret.plus(1)
                                if (hasUpgrade("o", 14)) ret = ret.plus(1)
                                if (hasUpgrade("o", 15)) ret = ret.plus(player.o.upgrades.length)
                                ret = ret.plus(layers.o.buyables[13].effect())
                                return ret
                        },
                        buy(){
                                let cost = getIBuyableCost(13)
                                if (!layers.i.buyables[13].canAfford()) return
                                player.i.buyables[13] = player.i.buyables[13].plus(1)
                                if (!hasAMUpgrade(13)) player.i.points = player.i.points.minus(cost)
                        },
                        buyMax(maximum){
                                let pts = player.i.points
                                if (hasUpgrade("a", 14) || hasUpgrade("pi", 32)) {
                                        let pttarget = player.i.points.div(1e5)
                                        if (pttarget.lt(1.1)) return
                                        let xtarget = pttarget.log(1.1).log(1.2)
                                        let target = xtarget.minus(1).times(2.5).plus(1)

                                        if (target.gt(5e5)) target = target.div(5e5).root(5).times(5e5)
                                        target = target.min(getStaminaMaximumAmount())
                                        target = target.floor()
                                        
                                        let diff = target.minus(player.i.buyables[13]).max(0)
                                        if (maximum != undefined) diff = diff.min(maximum)
                                        player.i.buyables[13] = player.i.buyables[13].plus(diff)

                                        if (diff.eq(0)) layers.i.buyables[13].buy()
                                        return 
                                }
                                let max = 30
                                if (maximum != undefined) max = Math.min(maximum, 30)
                                for (i = 0; i < max; i++){
                                        layers.i.buyables[13].buy()
                                }
                        },
                        unlocked(){ return hasIUpg(14) || hasUnlockedRow(3)},
                },
        },
        tabFormat: {
                "Main": {
                        content: ["main-display",
                        ["display-text",
                                function() {return hasIUpg(24) && !hasAMUpgrade(13) && !hasUpgrade("pi", 32) ? "Your best incrementy is " + format(player.i.best) : ""}],
                        ["display-text",
                                function() {
                                        if (getIStaminaSoftcapStart() == "Infinity") return ""
                                        if (hasUpgrade("pi", 32)) return "The incrementy Stamina softcap start is " + formatWhole(getIStaminaSoftcapStart())
                                        return "You are gaining " + format(layers.i.getResetGain()) + " incrementy per second"
                                },
                                {"font-size": "20px"}
                        ],
                        ["display-text", function () {return layers.i.nextUpgradeText()}],
                        ["display-text", function () {
                                return player.i.best.plus(10).log10().plus(10).log10().gt(9) ? "You cannot buy Incrementy Buyables past 500,000 (" + formatWhole(getStaminaMaximumAmount()) + " for Stamina)!" : ""
                        }],
                        "blank",
                        "buyables", 
                        "blank", 
                        "upgrades"],
                        unlocked(){
                                return true
                        },
                },
                "Details":{
                        content: [
                                "main-display",
                                ["display-text", function(){
                                        return "The base Incrementy formula is log10(points), and is 0 below 10 points."
                                }],
                                ["display-text", function(){
                                        return "This gets multiplied by things referencing base incrementy gain."
                                }],
                                ["display-text", function(){
                                        return getBuyableAmount("i", 13).gt(0) ? "It is then raised to a power from Incrementy Stamina" : ""
                                }],
                                ["display-text", function(){
                                        return "It is then multiplied by things referencing Incrementy Gain"
                                }],
                                ["display-text", function(){
                                        return hasUpgrade("pi", 32) ? "The buffed formula makes the point to Incrementy synergy uncapped, but Stamina does not boost base Incrementy gain anymore" : ""
                                }],
                        ],
                        unlocked(){
                                return layers.am.layerShown() || hasUpgrade("pi", 32) || player.o.best.gt(0)
                        },
                },
        },
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 0) return

                //upgrades
                let keep = []
                if (hasUpgrade("am", 12)) keep.push(11, 12, 13, 14)
                if (!hasUpgrade("am", 13) && !hasUpgrade("o", 21)) player.i.upgrades = filter(player.i.upgrades, keep)

                //incrementy
                player.i.points = new Decimal(0)
                player.i.best = new Decimal(0)

                //buyables
                let resetBuyables = [11,12,13]
                for (let j = 0; j < resetBuyables.length; j++) {
                        player.i.buyables[resetBuyables[j]] = new Decimal(0)
                }

        },
})

addLayer("am", {
        name: "Antimatter", 
        symbol: "AM", 
        position: 0,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
        }},
        color: "#DB4C83",
        requires: new Decimal(100), 
        resource: "Antimatter",
        baseAmount() {return getIBuyablesTotalRow(1)}, 
        branches: ["i"],
        type: "custom", 
        effect(){
                if (inChallenge("m", 12)) return new Decimal(1)
                let a = player.am.points
                if (a.eq(0) && player.am.best.gt(0)) a = new Decimal(1)

                let ret = a.plus(1).pow(Math.log(3)/Math.log(2))
                if (!hasUpgrade("e", 33)) {
                        if (ret.gt(100)) ret = ret.div(100).sqrt().times(100)
                        if (ret.gt(1000)) ret = ret.div(1000).pow(.25).times(1000)
                        if (ret.gt(1e4)) ret = ret.div(1e4).pow(.125).times(1e4)
                        if (ret.gt(1e5)) ret = ret.log10().times(2).pow(5)
                }
                if (ret.gt(1e10)) ret = ret.log10().pow(10)
                if (ret.gt(1e25)) ret = ret.log10().times(4000).pow(5)
                
                if (hasAMUpgrade(23)) ret = ret.pow(2)
                return ret
        },
        effectDescription(){
                return "which multiplies incrementy and point gain by " + formatWhole(layers.am.effect())
        },
        getResetGain() {
                let amt = layers.am.baseAmount()
                let pre = layers.am.getGainMultPre()
                let exp = layers.am.getGainExp()
                let pst = layers.am.getGainMultPost()
                let ret = amt.sub(99).max(0).times(pre).pow(exp).times(pst)
                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)
                return ret.floor()
        },
        getGainExp(){
                let x = new Decimal(.5)
                if (hasAMUpgrade(23)) x = x.times(2)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                return x
        },
        getGainMultPre(){
                let x = new Decimal(1)
                return x
        },
        getGainMultPost(){
                let x = new Decimal(1)
                x = x.times(layers.a.effect()[1])
                x = x.times(layers.m.effect()[1])
                if (hasUpgrade("e", 42)) x = x.times(upgradeEffect("e", 42))
                x = x.times(getNBuyableEff(32))
                if (hasAMUpgrade(15)) x = x.times(upgradeEffect("am", 15))
                if (hasUpgrade("s", 11)) x = x.times(10)
                if (hasUpgrade("b", 41)) x = x.times(layers.p.buyables[12].effect())
                x = x.times(layers.sp.effect()[1])
                x = x.times(player.e.points.max(1).pow(layers.sp.challenges[21].rewardEffect()))
                if (hasUpgrade("sp", 21)) x = x.times(player.a.points.max(1).pow(player.sp.upgrades.length))
                if (hasUpgrade("sp", 44)) x = x.times(Decimal.pow(player.a.points.max(1), challengeCompletions("sp", 22)))
                if (hasMilestone("o", 1)) x = x.times(layers.o.effect())
                return x
        },
        prestigeButtonText(){
                let gain = layers.am.getResetGain()
                let start =  "Reset to gain " + formatWhole(gain) + " Antimatter (based on total buyable levels)<br>"
                let pre = layers.am.getGainMultPre()
                let exp = layers.am.getGainExp()
                let pst = layers.am.getGainMultPost()
                let nextAt = ""
                nextAt = "Next at " + formatWhole(gain.plus(1).div(pst).root(exp).div(pre).ceil().plus(99)) + " levels"
                return start + nextAt
        },
        canReset(){
                return layers.am.getResetGain().gt(0) && !hasUpgrade("pi", 32) && !hasAMUpgrade(21) && layers.am.baseAmount().gte(layers.am.requires)
        },
        update(diff){
                if (hasUpgrade("pi", 32)) {
                        player.am.points = new Decimal(0)
                        player.am.best = new Decimal(0)
                        return
                }
                if (!player.am.best) player.am.best = new Decimal(0)
                player.am.best = player.am.best.max(player.am.points)
                if (hasAMUpgrade(21)) player.am.points = player.am.points.plus(layers.am.getResetGain().times(diff))
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                let a = getIBuyablesTotalRow(1).gte(98) || hasUnlockedRow(1)
                return a && !hasUpgrade("pi", 32)
        },
        upgrades: {
                rows: 2,
                cols: 5,
                11: {
                        title: "Plane", 
                        description: "Incrementy boosts Incrementy gain",
                        cost: new Decimal(2),
                        effect(){
                                let exp = 1
                                return player.i.points.plus(10).log10().pow(exp)
                        },
                },
                12: {
                        title: "Plain", 
                        description: "Triple Incrementy gain, and keep the first row of Incrementy Upgrades",
                        cost: new Decimal(2),
                        unlocked(){
                                return hasAMUpgrade(11) || hasUnlockedRow(2)
                        },
                },
                13: {
                        title: "Sale",
                        description: "Unlock new I upgrades, keep them on AM reset, you can buy 100 Incrementy Buyables, and they don't cost Incrementy",
                        cost: new Decimal(10),
                        unlocked(){
                                return hasAMUpgrade(12) || hasUnlockedRow(2)
                        },
                },
                14: {
                        title: "Sail",
                        description: "Incrementy Strength levels multiply base incrementy gain",
                        cost: new Decimal(1e172),
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        unlocked(){
                                return hasIUpg(34) || hasUnlockedRow(2)
                        },
                },
                21: {
                        title: "Coarse", 
                        description: "Remove the Antimatter prestige, but gain 100% of gain on reset per second",
                        cost: new Decimal(200),
                        unlocked(){
                                return hasAMUpgrade(14) || hasUnlockedRow(2)
                        },
                },
                22: {
                        title: "Course",
                        description: "Incrementy Speed levels multiply base incrementy gain",
                        cost: new Decimal(1000),
                        unlocked(){
                                return hasAMUpgrade(21) || hasUnlockedRow(2)
                        },
                },
                23: {
                        title: "Waive",
                        description: "Square antimatter gain and effect",
                        cost: new Decimal(2000),
                        unlocked(){
                                return hasAMUpgrade(22) || hasUnlockedRow(2)
                        },
                }, 
                24: {
                        title: "Wave", 
                        description: "Incrementy Stamina levels multiply base incrementy gain",
                        cost: new Decimal(1e26),
                        unlocked(){
                                return hasMilestone("a", 4) || hasUnlockedRow(3)
                        },
                }, 
                15: {
                        title: "Sweet",
                        description: "Antimatter gain is boosted by Quark Challenge completions",
                        cost: new Decimal("1e687"),
                        effect(){
                                let c = 0
                                if (hasChallenge("q", 11)) c ++
                                if (hasChallenge("q", 12)) c ++
                                if (hasChallenge("q", 21)) c ++
                                if (hasChallenge("q", 22)) c ++
                                return Decimal.pow(1+c, 300)
                        },
                        unlocked(){
                                return hasChallenge("q", 21) || hasUnlockedRow(3)
                        },
                }, 
                25: {
                        title: "Suite",
                        description: "Incrementy Softcap starts 3 later <br>(52 -> 55)",
                        cost: new Decimal("1e870"),
                        unlocked(){
                                return hasUpgrade("am", 15) || hasUnlockedRow(3)
                        },
                }, 
        },
        challenges:{
                rows: 1,
                cols: 2,
                11: {
                        name: "Know?", 
                        challengeDescription: "Get ^.1 of your normal Incrementy gain",
                        rewardDescription: "Incrementy Stamina softcap starts 5 later (40 -> 45)",
                        unlocked(){
                                return hasAUpgrade(11) || hasUpgrade("s", 14) || hasUnlockedRow(3)
                        },
                        goal: new Decimal(1e100),
                        currencyInternalName: "points",
                },
                12: {
                        name: "No!", 
                        challengeDescription: "Get ^.1 of your normal point gain",
                        rewardDescription: "Unlock Matter and the ability to Matter Prestige",
                        unlocked(){
                                return hasAUpgrade(11) || hasUpgrade("s", 14) || hasUnlockedRow(3)
                        },
                        goal: new Decimal(2.22e222),
                        currencyInternalName: "points",
                },
        },
        tabFormat: ["main-display",
                ["display-text",
                        function() {
                                return hasAMUpgrade(21) ? "You are gaining " + format(layers.am.getResetGain()) + " Antimatter per second" : ""
                        },
                        {"font-size": "20px"}],
                ["prestige-button", "", function (){ return hasAMUpgrade(21) ? {'display': 'none'} : {}}],
                "blank", 
                "upgrades",
                "blank",
                "challenges"],
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 1) return

                //upgrades
                let keep = []
                if (!hasMilestone("a", 1) && !hasUpgrade("s", 14)) player.am.upgrades = filter(player.am.upgrades, keep)

                if (layers[layer].row >= 3 && !hasUpgrade("s", 14)) {
                        player.am.challenges[11] = 0
                        player.am.challenges[12] = 0
                }

                //resource
                player.am.points = new Decimal(0)
                player.am.best = new Decimal(0)
        },
})

addLayer("a", {
        name: "Amoebas", 
        symbol: "A", 
        position: 0,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
        }},
        color: "#1B4C23",
        requires: Decimal.pow(10, 417), 
        resource: "Amoeba",
        baseAmount() {return player.i.points}, 
        branches: ["am"],
        type: "custom", 
        effect(){
                if (inChallenge("m", 11) || inChallenge("m", 12)) return [new Decimal(1), new Decimal(1)]
                let a = player.a.points
                let eff1 = Decimal.add(1, a).pow(10)
                let eff2 = Decimal.add(2, a).div(2).pow(5)

                if (eff1.log10().gt(400)) eff1 = eff1.log10().div(4).pow(200)
                if (eff2.log10().gt(200)) eff2 = eff2.log10().div(2).pow(100)

                return [eff1, eff2]
        },
        effectDescription(){
                let eff = layers.a.effect()
                return "which multiplies incrementy and point gain by " + format(eff[0]) + " and antimatter gain by " + format(eff[1])
        },
        getResetGain() {
                let amt = layers.a.baseAmount()
                let exp = layers.a.getGainExp()
                if (amt.lt(Decimal.pow(10, 417))) return new Decimal(0)
                let gainexp = amt.log10().minus(17).pow(exp).div(2).minus(10)
                if (gainexp.lt(0)) return new Decimal(0)
                let ret = Decimal.pow(10, gainexp).times(layers.a.getGainMult()).floor()
                
                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)
                return ret
        },
        getGainExp(){
                let x = new Decimal(.5)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                return x
        },
        getGainMult(){
                let x = new Decimal(1)
                x = x.times(getNBuyableEff(33))
                if (hasUpgrade("s", 12)) x = x.times(100)
                x = x.times(player.q.points.max(10).log10().pow(layers.b.challenges[21].rewardEffect()))
                x = x.times(layers.sp.effect()[1])
                if (hasUpgrade("pi", 22)) x = x.times(Decimal.pow(player.s.points.plus(1), player.pi.upgrades.length))
                if (hasMilestone("o", 2)) x = x.times(layers.o.effect())
                return x
        },
        prestigeButtonText(){
                let gain = layers.a.getResetGain()
                let start =  "Reset to gain " + formatWhole(gain) + " Amoeba (based on incrementy)"
                let nextAt = ""
                if (gain.lt(1000)){
                        nextAt = "<br>Next at " + format(Decimal.pow(10, gain.plus(1).log10().plus(10).times(2).pow(2).plus(17))) + " incrementy"
                }
                return start + nextAt
        },
        canReset(){
                return layers.a.getResetGain().gt(0) && !hasUpgrade("pi", 32) && !hasMilestone("a", 3) && layers.a.baseAmount().gte(layers.a.requires)
        },
        update(diff){
                if (hasUpgrade("pi", 32)) {
                        player.a.points = new Decimal(0)
                        player.a.best = new Decimal(0)
                        return
                }
                if (!player.a.best) player.a.best = new Decimal(0)
                player.a.best = player.a.best.max(player.a.points)
                if (hasMilestone("a", 3)) player.a.points = player.a.points.plus(layers.a.getResetGain().times(diff))
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                let a = player.i.best.gt(Decimal.pow(10, 400)) || hasUnlockedRow(2) 
                return a && !hasUpgrade("pi", 32)
        },
        milestones:{
                1: {
                        requirementDescription: "<b>Right</b><br>Requires: 2 Amoebas", 
                        effectDescription: "You keep antimatter upgrades upon reset",
                        done(){
                                return player.a.best.gte(2) && !hasUpgrade("pi", 32)
                        },
                },
                2: {
                        requirementDescription: "<b>Rite</b><br>Requires: 5 Amoebas", 
                        effectDescription: "Once per second buy one of each Incrementy buyable",
                        done(){
                                return player.a.best.gte(5) && !hasUpgrade("pi", 32)
                        },
                },
                3: {
                        requirementDescription: "<b>Wright</b><br>Requires: 20 Amoebas", 
                        effectDescription: "Remove the ability to prestige, but gain 100% of amoebas on prestige per second",
                        done(){
                                return player.a.best.gte(20) && !hasUpgrade("pi", 32)
                        },
                },
                4: {
                        requirementDescription: "<b>Write</b><br>Requires: 5,000 Amoebas", 
                        effectDescription: "<b>Rite</b> buys 1000, and unlock Amoeba upgrades and Wave",
                        done(){
                                return player.a.best.gte(5e3) && !hasUpgrade("pi", 32)
                        },
                },
        },
        upgrades: {
                rows: 3,
                cols: 5,
                11: {
                        title: "Here", 
                        description: "Unlock two Antimatter Challenges",
                        cost: new Decimal(3e5),
                        unlocked(){
                                return hasMilestone("a", 4) || hasUnlockedRow(3)
                        },
                },
                12: {
                        title: "Hear",
                        description: "Unlock two Matter Challenges",
                        cost: new Decimal(5e13),
                        unlocked(){
                                return hasUpgrade("e", 24) || hasUnlockedRow(3)
                        },
                },
                13: {
                        title: "Crews",
                        description: "Unlock new Energy Upgrades",
                        cost: new Decimal(1e17),
                        unlocked(){
                                return hasChallenge("m", 12) || hasUnlockedRow(3)
                        },
                },
                14: {
                        title: "Cruise",
                        description: "Remove the quadratic cost scaling of Incrementy Stamina",
                        cost: new Decimal(1e35),
                        unlocked(){
                                return hasUpgrade("e", 34) || hasUnlockedRow(3)
                        },
                }, 
                21: {
                        title: "Steal",
                        description: "Amoebas boost base Incrementy gain",
                        cost: Decimal.pow(10, 7960),
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        effect(){
                                return player.a.points.max(10).log10()
                        },
                        unlocked(){
                                return hasUpgrade("a", 14) || hasUnlockedRow(3)
                        },
                }, 
                22: {
                        title: "Steel",
                        description: "Antimatter boosts base Incrementy gain",
                        cost: Decimal.pow(10, 8115),
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        effect(){
                                return player.am.points.max(10).log10()
                        },
                        unlocked(){
                                return hasUpgrade("a", 21) || hasUnlockedRow(3)
                        },
                },
                23: {
                        title: "Sign",
                        description: "Matter boosts base Incrementy gain",
                        cost: Decimal.pow(10, 8460),
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        effect(){
                                return player.m.points.max(10).log10()
                        },
                        unlocked(){
                                return hasUpgrade("a", 22) || hasUnlockedRow(3)
                        },
                }, 
                24: {
                        title: "Sine",
                        description: "Uncap Haul",
                        cost: Decimal.pow(10, 8700),
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        unlocked(){
                                return hasUpgrade("a", 23) || hasUnlockedRow(3)
                        },
                }, 
                15: {
                        title: "Flair",
                        description: "Amoebas boost Neutrino gain",
                        cost: new Decimal(2e162),
                        effect(){
                                return player.a.points.plus(10).log10().pow(5)
                        },
                        unlocked(){
                                return hasUpgrade("p", 32) || hasUnlockedRow(3)
                        },
                },
                25: {
                        title: "Flare",
                        description: "Particle Acceleration base is multiplied by Neutrino Generation total levels",
                        cost: new Decimal(1e167),
                        unlocked(){
                                return hasUpgrade("a", 15) || hasUnlockedRow(3)
                        },
                },
        },
        tabFormat: ["main-display",
                ["display-text",
                        function() {
                                return hasMilestone("a", 3) ? "You are gaining " + format(layers.a.getResetGain()) + " Amoebas per second" : ""
                        },
                        {"font-size": "20px"}],
                ["prestige-button", "", function (){ return hasMilestone("a", 3) ? {'display': 'none'} : {}}],
                "blank",
                "milestones",
                "blank", 
                "upgrades"],
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 2) return

                let keep = []
                if (!hasUpgrade("s", 15)) player.a.upgrades = filter(player.a.upgrades, keep)

                //milestones
                let milekeep = []
                if (!hasUpgrade("s", 21)) player.a.milestones = filter(player.a.milestones, milekeep)
                

                //resource
                player.a.points = new Decimal(0)
                player.a.best = new Decimal(0)
        },
})

addLayer("m", {
        name: "Matter", 
        symbol: "M", 
        position: 1,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
        }},
        color: "#3B1053",
        requires: Decimal.pow(10, 1116),
        resource: "Matter",
        baseAmount() {return player.i.points}, 
        branches: ["i"],
        type: "custom", 
        effect(){
                let a = player.m.points
                if (!hasMilestone("m", 2)) a = a.plus(1).log10()
                
                let eff1 = Decimal.add(10, a).div(10).pow(10)
                let eff2 = Decimal.add(2, a).div(2).pow(.5)

                if (eff1.gt(1e100)) eff1 = eff1.log10().pow(50)
                if (eff2.gt(1e50)) eff2 = eff2.log10().times(2).pow(25)
                return [eff1, eff2]
        },
        effectDescription(){
                let eff = layers.m.effect()
                return "which multiplies incrementy and point gain by " + format(eff[0]) + " and antimatter gain by " + format(eff[1])
        },
        getResetGain() {
                let amt = layers.m.baseAmount().max(1)
                let mlt = layers.m.getGainMult()
                let exp = layers.m.getGainExp()
                let ret = amt.pow(exp).minus(9).times(mlt).max(0).floor()
                
                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)
                return ret
        },
        getGainExp(){
                let x = new Decimal(1/1170)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                return x
        },
        getGainMult(){
                let x = new Decimal(1)
                if (hasUpgrade("e", 12)) x = x.times(getEUpgEff(12))
                if (hasUpgrade("e", 13)) x = x.times(getEUpgEff(13))
                if (hasUpgrade("e", 21)) x = x.times(player.a.points.plus(1))
                if (hasUpgrade("e", 22)) x = x.times(getEUpgEff(22))
                x = x.times(getNBuyableEff(31))
                x = x.times(layers.p.buyables[13].effect())
                if (hasUpgrade("s", 12)) x = x.times(100)
                x = x.times(layers.sp.effect()[1])
                if (hasMilestone("o", 3)) x = x.times(layers.o.effect())
                return x
        },
        prestigeButtonText(){
                let gain = layers.m.getResetGain()
                let start =  "Reset to gain " + formatWhole(gain) + " Matter (based on incrementy)"
                let nextAt = ""
                let mlt = layers.m.getGainMult()
                if (gain.lt(1000)){
                        nextAt = "<br>Next at " + format(gain.plus(1).div(mlt).plus(9).pow(1170)) + " incrementy"
                }
                return start + nextAt
        },
        canReset(){
                return layers.m.getResetGain().gt(0) && hasChallenge("am", 12) && !hasUpgrade("e", 14) && !hasUpgrade("pi", 32) && layers.m.baseAmount().gte(layers.m.requires)
        },
        update(diff){
                if (hasUpgrade("pi", 32)) {
                        player.m.points = new Decimal(0)
                        player.m.best = new Decimal(0)
                        return
                }
                if (hasUpgrade("e", 14)) player.m.points = player.m.points.plus(layers.m.getResetGain().times(diff))
                if (!player.m.best) player.m.best = new Decimal(0)
                player.m.best = player.m.best.max(player.m.points)
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                let a = hasChallenge("am", 12) || hasUnlockedRow(3)
                return a && !hasUpgrade("pi", 32)
        },
        milestones:{
                1: {
                        requirementDescription: "<b>Rain</b><br>Requires: 1 Matter", 
                        effectDescription: "Unlock Energy",
                        done(){
                                return player.m.points.gte(1) && !hasUpgrade("pi", 32)
                        },
                },
                2: {
                        requirementDescription: "<b>Reign</b><br>Requires: 1,000 Matter", 
                        effectDescription: "Severly buff matter effect",
                        done(){
                                return player.m.points.gte(1000) && !hasUpgrade("pi", 32)
                        },
                },
                3: {
                        requirementDescription: "<b>Rein</b><br>Requires: 50,000 Matter", 
                        effectDescription: "Unlock new Energy upgrades",
                        done(){
                                return player.m.points.gte(5e4) && !hasUpgrade("pi", 32)
                        },
                },
        },
        challenges:{
                rows: 1,
                cols: 2,
                11: {
                        name: "Creak", 
                        challengeDescription: "Amoebas base effects are 1 and square root Incrementy gain",
                        rewardDescription: "Incrementy Stamina softcap starts 5 later (45 -> 50)",
                        unlocked(){
                                return hasAUpgrade(12) || hasUnlockedRow(3)
                        },
                        goal: new Decimal("1e840"),
                        currencyInternalName: "points",
                },
                12: {
                        name: "Creek", 
                        challengeDescription: "Amoebas and Antimatter base effects are 1 and cube root Incrementy gain",
                        rewardDescription: "Energy multiples Incrementy gain",
                        unlocked(){
                                return hasAUpgrade(12) || hasUnlockedRow(3)
                        },
                        goal: new Decimal("1e500"),
                        currencyInternalName: "points",
                },
        },
        tabFormat: ["main-display",
                ["display-text",
                        function() {
                                return hasUpgrade("e", 14) ? "You are gaining " + format(layers.m.getResetGain()) + " Matter per second" : ""
                        },
                        {"font-size": "20px"}],
                ["prestige-button", "", function (){ return hasUpgrade("e", 14) ? {'display': 'none'} : {}}],
                "blank",
                "milestones",
                "blank", 
                "challenges"],
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 1) return

                if (layers[layer].row >= 3) {
                        if (!hasUpgrade("s", 14)) {
                                player.m.challenges[11] = 0
                                player.m.challenges[12] = 0
                        }
                        
                        //milestones
                        let milekeep = []
                        player.m.milestones = filter(player.m.milestones, milekeep)
                }

                //resource
                player.m.points = new Decimal(0)
                player.m.best = new Decimal(0)
        },
})

addLayer("e", {
        name: "Energy", 
        symbol: "E", 
        position: 1,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
        }},
        color: "#E3FF00",
        requires: Decimal.pow(10, 0),
        resource: "Energy",
        baseAmount() {return player.m.points.min(player.am.points)},
        branches: ["am", "m"],
        type: "custom", 
        getResetGain() {
                let amt = layers.e.baseAmount()
                let exp = layers.e.getGainExp()
                let mlt = layers.e.getGainMult()
                let ret = amt.pow(exp).times(mlt)
                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)
                return ret
        },
        getGainMult(){
                let x = new Decimal(1)
                if (hasUpgrade("e", 11)) x = x.times(getEUpgEff(11))
                x = x.times(getNBuyableEff(23))
                x = x.times(layers.sp.effect()[1])
                return x
        },
        getGainExp(){
                let x = new Decimal(1)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                return x
        },
        prestigeButtonText(){
                return "if you see this bug"
        },
        canReset(){
                return false
        },
        update(diff){
                if (hasUpgrade("pi", 32)) {
                        player.e.points = new Decimal(0)
                        player.e.best = new Decimal(0)
                        return
                }
                player.e.points = player.e.points.plus(layers.e.getResetGain().times(diff))

                if (!player.e.best) player.e.best = new Decimal(0)
                player.e.best = player.e.best.max(player.e.points)
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                let a = hasMilestone("m", 1) || hasUnlockedRow(3)
                return a && !hasUpgrade("pi", 32)
        },
        upgrades:{
                rows: 5,
                cols: 5,
                11:{
                        title: "Peace", 
                        description: "Incrementy buffs Energy gain",
                        cost: new Decimal(500),
                        effect(){
                                let exp = .5
                                if (hasUpgrade("e", 51)) exp *= Math.max(player.e.upgrades.length, 1)
                                return player.i.points.plus(10).log10().pow(exp)
                        }
                },
                12:{
                        title: "Piece",
                        description: "Energy buffs matter gain",
                        cost: new Decimal(1e4),
                        effect(){
                                let ret = player.e.points.plus(1).pow(.5)
                                if (ret.gt(1e200)) ret = ret.log10().div(2).pow(100)
                                return ret
                        },
                        unlocked(){
                                return hasUpgrade("e", 11) || hasUnlockedRow(3)
                        }
                },
                13:{
                        title: "Vial",
                        description: "Each level of Incrementy Speed boosts matter gain by 1%",
                        cost: new Decimal(1e8),
                        effect(){
                                let exp = 1
                                if (hasUpgrade("e", 24)) exp *= 2
                                if (hasUpgrade("e", 31)) exp *= 2
                                if (hasUpgrade("e", 32)) exp *= 2
                                return Decimal.pow(1.01, getBuyableAmount("i", 11)).pow(exp)
                        },
                        unlocked(){
                                return hasMilestone("m", 3) || hasUnlockedRow(3)
                        }
                },
                14:{
                        title: "Vile", 
                        description: "Remove the ability to Matter prestige, but get 100% of Matter upon prestige per second",
                        cost: new Decimal(1e12),
                        unlocked(){
                                return hasUpgrade("e", 13) || hasUnlockedRow(3)
                        },
                },
                21:{
                        title: "Mind", 
                        description: "Amoebas multiply matter gain",
                        cost: new Decimal(1e16),
                        unlocked(){
                                return hasUpgrade("e", 14) || hasUnlockedRow(3)
                        },
                },
                22:{
                        title: "Mined", 
                        description: "Each level of Incrementy Stamina boosts matter gain by 33%",
                        cost: new Decimal(1e41),
                        effect(){
                                let exp = 1
                                if (hasUpgrade("e", 34)) exp *= 2
                                return Decimal.pow(1.33, getBuyableAmount("i", 13)).pow(exp)
                        },
                        unlocked(){
                                return hasUpgrade("e", 21) || hasUnlockedRow(3)
                        },
                },
                23:{
                        title: "Cell",
                        description: "Energy multiplies Incrementy gain",
                        cost: new Decimal(1e71),
                        unlocked(){
                                return hasUpgrade("e", 22) || hasUnlockedRow(3)
                        },
                },
                24:{
                        title: "Sell",
                        description: "Square vial",
                        cost: new Decimal(1e75),
                        unlocked(){
                                return hasUpgrade("e", 23) || hasUnlockedRow(3)
                        },
                },
                31:{
                        title: "War",  
                        description: "Square vial",
                        cost: new Decimal(1e95),
                        unlocked(){
                                return hasUpgrade("a", 13) || hasUnlockedRow(3)
                        },
                },
                32:{
                        title: "Wore",  
                        description: "Square vial",
                        cost: new Decimal(1e110),
                        unlocked(){
                                return hasUpgrade("e", 31) || hasUnlockedRow(3)
                        },
                },
                33:{
                        title: "Rose",  
                        description: "Remove the current Antimatter to Incrementy multiplier softcaps",
                        cost: new Decimal(1e140),
                        unlocked(){
                                return hasUpgrade("e", 32) || hasUnlockedRow(3)
                        },
                },
                34:{
                        title: "Rows",  
                        description: "Square Mined",
                        cost: new Decimal(1e220),
                        unlocked(){
                                return hasUpgrade("e", 33) || hasUnlockedRow(3)
                        },
                },
                41:{
                        title: "Hare",
                        description: "The number of energy upgrades boost base incrementy gain",
                        cost: new Decimal("1e263"),
                        effect(){
                                let l = player.e.upgrades.length
                                if (l < 1) l = 1
                                return Decimal.pow(l, l / 4) 
                        },
                        unlocked(){
                                return hasUpgrade("a", 24) || hasUnlockedRow(3)
                        },
                },
                42:{
                        title: "Hair",
                        description: "The number of energy upgrades boosts Antimatter gain",
                        cost: new Decimal("1e9450"),
                        effect(){
                                let l = player.e.upgrades.length
                                if (l < 1) l = 1
                                let exp = l
                                if (hasUpgrade("e", 52)) exp *= 2 
                                if (hasUpgrade("e", 53)) exp *= 2 
                                return Decimal.pow(l, exp) 
                        },
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        unlocked(){
                                return hasUpgrade("e", 41) || hasUnlockedRow(3)
                        },
                },
                43:{
                        title: "Morning",
                        description: "Incrementy Stamina softcap starts 1 later (50 -> 51)",
                        cost: new Decimal("1e287"),
                        unlocked(){
                                return hasUpgrade("e", 42) || hasUnlockedRow(3)
                        },
                },
                44:{
                        title: "Mourning",
                        description: "Energy boosts base Incrementy gain",
                        cost: new Decimal("1e290"),
                        effect(){
                                return player.e.points.max(10).log10()
                        },
                        unlocked(){
                                return hasUpgrade("e", 43) || hasUnlockedRow(3)
                        },
                },
                51:{
                        title: "Gate",
                        description: "Peace is rasied to the power of Energy upgrades",
                        cost: new Decimal("1e10370"),
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        unlocked(){
                                return hasUpgrade("e", 44) || hasUnlockedRow(3)
                        },
                },
                52:{
                        title: "Gait",
                        description: "Square Hair",
                        cost: new Decimal("1e328"),
                        unlocked(){
                                return hasUpgrade("e", 51) || hasUnlockedRow(3)
                        },
                },
                53:{
                        title: "Boar",
                        description: "Square Hair",
                        cost: new Decimal("1e355"),
                        unlocked(){
                                return hasUpgrade("e", 52) || hasUnlockedRow(3)
                        },
                },
                54:{
                        title: "Bore",
                        description: "Incrementy Stamina softcap starts 1 later (51 -> 52)",
                        cost: new Decimal("1e385"),
                        unlocked(){
                                return hasUpgrade("e", 53) || hasUnlockedRow(3)
                        },
                },
                15:{
                        title: "Homophones?",
                        description: "Base Incrementy Gain buyable effect is raised to the tenth power",
                        cost: new Decimal("1e408"),
                        unlocked(){
                                return getBuyableAmount("n", 31).gte(2) || hasUnlockedRow(3)
                        },
                },
                25:{
                        title: "How",
                        description: "Gain a free Energy Boost buyable",
                        cost: new Decimal("1e418"),
                        unlocked(){
                                return hasUpgrade("e", 15) || hasUnlockedRow(3)
                        },
                }, 
                35:{
                        title: "Could", 
                        description: "Energy effects Neutrino gain",
                        cost: new Decimal("1e429"),
                        effect(){
                                return player.e.points.plus(10).log10().pow(.5)
                        },
                        unlocked(){
                                return hasUpgrade("e", 25) || hasUnlockedRow(3)
                        },
                },
                45:{
                        title: "You",
                        description: "Each Neutrino Generation level past 100 boosts its base by .01 (capped at 10)",
                        cost: new Decimal("1e439"),
                        unlocked(){
                                return (getBuyableAmount("n", 12).gte(24) && hasUpgrade("e", 35)) || hasUnlockedRow(3)
                        },
                },
                55:{
                        title: "Suggest?",
                        description: "Incrementy buffs Neutrino gain",
                        cost: new Decimal("1e457"),
                        effect(){
                                return player.i.points.plus(10).log10().root(3)
                        },
                        unlocked(){
                                return hasUpgrade("e", 45) || hasUnlockedRow(3)
                        },
                },
        },
        tabFormat: ["main-display",
                ["display-text", "Energy generation is based on the least amount of Matter and Antimatter"],
                ["display-text", function(){return "You are getting " + format(layers.e.getResetGain()) + " Energy per second"}],
                "blank",
                "blank", 
                "upgrades"],
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 2) return

                
                let keep = []
                if (!hasUpgrade("s", 21)) player.e.upgrades = filter(player.e.upgrades, keep)

                //resource
                player.e.points = new Decimal(0)
                player.e.best = new Decimal(0)
        },
})

addLayer("p", {
        name: "Particles", 
        symbol: "P", 
        position: 2,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
                time: 0,
        }},
        color: "#FFC0F0",
        requires: Decimal.pow(10, 11475),
        resource: "Particles",
        baseAmount() {return player.i.points},
        branches: ["i", "n", "g", "q"],
        type: "custom", 
        getResetGain() {
                let amt = layers.p.baseAmount()
                let exp = layers.p.getGainExp()
                let log = amt.max(10).log10().div(18.36)
                let ret = log.pow(exp).div(25)

                let add = new Decimal(hasUpgrade("s", 21) ? 1 : 0)
                if (hasUpgrade("s", 54)) add = add.max(1000)
                if (ret.lt(1)) return new Decimal(0).plus(add)
                ret = ret.plus(add).times(layers.p.getGainMult())

                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                return ret
        },
        getGainExp(){
                let x = new Decimal(.5)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                x = x.times(layers.o.buyables[21].effect())
                return x
        },
        getGainMult(){
                let x = new Decimal(1)
                x = x.times(getNBuyableEff(12))
                x = x.times(getNBuyableEff(22))
                if (hasUpgrade("g", 12)) x = x.times(upgradeEffect("g", 12))
                if (hasUpgrade("g", 13)) x = x.times(upgradeEffect("g", 13))
                if (hasUpgrade("g", 22)) x = x.times(upgradeEffect("g", 22))
                if (hasUpgrade("g", 23)) x = x.times(upgradeEffect("g", 23))
                x = x.times(layers.p.buyables[11].effect())
                if (hasUpgrade("s", 13)) x = x.times(100)
                x = x.times(layers.sp.effect()[1])
                if (hasUpgrade("s", 43)) x = x.times(player.i.points.max(1).pow(.0001))
                if (hasMilestone("o", 4)) x = x.times(layers.o.effect())
                return x
        },
        prestigeButtonText(){
                return "if you see this bug"
        },
        canReset(){
                return false
        },
        update(diff){
                let gain = layers.p.getResetGain().max(0)
                let a = hasUpgrade("s", 13) ? 1 : 60
                player.p.points = player.p.points.plus(gain.times(diff)).min(gain.times(a)).max(player.p.points)

                if (!player.p.best) player.p.best = new Decimal(0)
                player.p.best = player.p.best.max(player.p.points)

                let mult = hasMilestone("sp", 2) ? 3 : 1
                player.p.time += diff * mult
                if (player.p.time > 1){
                        player.p.time += -1
                        let j = hasUpgrade("s", 41) ? 4 : 1
                        if (hasMilestone("pi", 2)) j *= 5
                        if (hasMilestone("o", 0)) j *= 10
                        if ((hasUpgrade("s", 25) || hasMilestone("o", 1)) && !hasUpgrade("pi", 41)) {
                                if (layers.p.buyables[11].canAfford()) layers.p.buyables[11].buyMax(j)
                                if (layers.p.buyables[12].canAfford()) layers.p.buyables[12].buyMax(j)
                                if (layers.p.buyables[13].canAfford()) layers.p.buyables[13].buyMax(j)
                        }
                        if (player.p.time > 10) player.p.time = 10
                }
                if (hasUpgrade("pi", 41)) {
                        player.p.buyables[11] = new Decimal(0)
                        player.p.buyables[12] = new Decimal(0)
                        player.p.buyables[13] = new Decimal(0)
                }
        },
        upgrades:{
                rows: 5,
                cols: 5,
                11:{
                        title: "Groan",
                        description: "Begin production of Neutrinos",
                        cost: new Decimal(50),
                        unlocked(){
                                return true
                        },
                },
                12:{
                        title: "Grown",
                        description: "Amoebas boost Neutrino gain",
                        cost: new Decimal(6e4),
                        effect(){
                                return player.a.points.plus(10).log10().pow(.5)
                        },
                        unlocked(){
                                return getBuyableAmount("n", 12).gte(9) || hasUnlockedRow(3)
                        },
                },
                13:{
                        title: "Flea",
                        description: "Particles boost Neutrino gain",
                        cost: new Decimal(2e6),
                        effect(){
                                return player.p.points.plus(10).log10()
                        },
                        unlocked(){
                                return getBuyableAmount("n", 21).gte(6) || hasUnlockedRow(3)
                        },
                },
                14:{
                        title: "Flee",
                        description: "Neutrinos boost Neutrino gain",
                        cost: new Decimal(11e7),
                        effect(){
                                return player.n.points.plus(10).log10()
                        },
                        unlocked(){
                                return hasUpgrade("p", 13) || hasUnlockedRow(3)
                        },
                },
                21:{
                        title: "Tier",
                        description: "Begin production of Gluons",
                        cost: new Decimal(3.5e34),
                        unlocked(){
                                return getBuyableAmount("n", 12).gte(31) || hasUnlockedRow(3)
                        }
                },
                22:{
                        title: "Tear",
                        description: "Gluons boost Neutrinos",
                        cost: new Decimal(3e40),
                        effect(){
                                let ret = player.g.points.max(1)
                                if (ret.gt(1e10)) ret = ret.log10().pow(10)
                                return ret
                        },
                        unlocked(){
                                return getBuyableAmount("n", 12).gte(33) || hasUnlockedRow(3)
                        }
                },
                23:{
                        title: "Tide", 
                        description: "Each Gluon Upgrade adds .05 to the Neutrino Generation base",
                        cost: new Decimal(2e96),
                        unlocked(){
                                return getBuyableAmount("n", 11).gte(54) || hasUpgrade("g", 34) || hasUnlockedRow(3)
                        }
                },
                24:{
                        title: "Tied", 
                        description: "Energy boosts Gluon generation",
                        cost: new Decimal(1.5e128),
                        effect(){
                                return player.e.points.max(10).log10()
                        },
                        unlocked(){
                                return getBuyableAmount("n", 12).gte(64) || hasUnlockedRow(3)
                        }
                },
                31:{
                        title: "Break", 
                        description: "Begin production of Quarks",
                        cost: new Decimal(1.5e198),
                        unlocked(){
                                return hasUpgrade("g", 54) || hasUnlockedRow(3)
                        }
                },
                32:{
                        title: "Brake",
                        description: "Unlock a 5th Column of Amoeba Upgrades",
                        cost: new Decimal("7e311"),
                        unlocked(){
                                return hasUpgrade("p", 25) || hasUnlockedRow(3)
                        }
                },
                33:{
                        title: "Brews",
                        description: "Unlock the third Particle Buyable and P Collision gives free levels to middle column Neutrino buyables",
                        cost: new Decimal("4.2e352"),
                        unlocked(){
                                return hasUpgrade("p", 32) || hasUnlockedRow(3)
                        }
                },
                34:{
                        title: "Bruise",
                        description: "Particle Simulation gives free levels to right column Neutrino buyables and gain 1000x Neutrinos", 
                        cost: new Decimal("2.58e423"),
                        unlocked(){
                                return hasUpgrade("p", 33) || hasUnlockedRow(3)
                        }
                },
                15:{
                        title: "Accelerate!",
                        description: "Unlock the first Particle Buyable", 
                        cost: Decimal.pow(2, 1024),
                        unlocked(){
                                return hasChallenge("q", 22) || hasUnlockedRow(3)
                        }
                },
                25:{
                        title: "Collision!",
                        description: "Unlock the second Particle Buyable and P Acceleration gives free levels to left column Neutrino buyables", 
                        cost: Decimal.pow(10, 311),
                        unlocked(){
                                return hasUpgrade("p", 15) || hasUnlockedRow(3)
                        }
                },
                35:{
                        title: "Simulation?",
                        description: "Unlock Shards", 
                        cost: Decimal.pow(10, 502).times(2),
                        unlocked(){
                                return hasUpgrade("p", 34) || hasUnlockedRow(3)
                        }
                },
                41: {
                        title: "Fawn",
                        description: "Each upgrade in this row allows the purchase of two more Incrementy Stamina levels",
                        cost: Decimal.pow(10, Decimal.pow(10, 15500)),
                        unlocked(){
                                return hasUpgrade("pi", 42) || hasUpgrade("p", 41) 
                        }
                },
                42: {
                        title: "Faun",
                        description: "Per Particle upgrades squared raise Incrementy to 1.0001",
                        cost: Decimal.pow(10, Decimal.pow(10, 15555)),
                        unlocked(){
                                return hasUpgrade("p", 41)
                        }
                },
                43: {
                        title: "Phial",
                        description: "Add .001 to the Incrementy Stamina base",
                        cost: Decimal.pow(10, Decimal.pow(10, 16000)),
                        unlocked(){
                                return hasUpgrade("p", 42)
                        }
                },
                44: {
                        title: "File",
                        description: "Allows the purchase of five more Incrementy Stamina levels",
                        cost: Decimal.pow(10, Decimal.pow(10, 16300)),
                        unlocked(){
                                return hasUpgrade("p", 43)
                        }
                },
                45: {
                        title: "Phiz",
                        description: "Allows the purchase of five more Incrementy Stamina levels",
                        cost: Decimal.pow(10, Decimal.pow(10, 16610)),
                        unlocked(){
                                return hasUpgrade("p", 44)
                        }
                },
                51: {
                        title: "Fizz",
                        description: "Each upgrade in this row allows the purchase of four more Incrementy Stamina levels",
                        cost: Decimal.pow(10, Decimal.pow(10, 16880)),
                        unlocked(){
                                return hasUpgrade("p", 45)
                        }
                },
                52: {
                        title: "Boos",
                        description: "Remove the Pion gain softcap",
                        cost: Decimal.pow(10, Decimal.pow(10, 17050)),
                        unlocked(){
                                return hasUpgrade("p", 51)
                        }
                },
                53: {
                        title: "Booze",
                        description: "Add .002 to the Incrementy Stamina base",
                        cost: Decimal.pow(10, Decimal.pow(10, 17250)),
                        unlocked(){
                                return hasUpgrade("p", 52)
                        }
                },
                54: {
                        title: "Bass",
                        description: "Each Particle Upgrade squares base Neutrino gain",
                        cost: Decimal.pow(10, Decimal.pow(10, 17850)),
                        unlocked(){
                                return hasUpgrade("p", 53)
                        }
                },
                55: {
                        title: "Base",
                        description: "Unlock new Super Prestige Upgrades", 
                        cost: Decimal.pow(10, Decimal.pow(10, 18060)),
                        unlocked(){
                                return hasUpgrade("p", 54)
                        }
                },
        },
        buyables:{
                rows: 1, 
                cols: 3,
                11: {
                        title: "Particle Acceleration",
                        display(){
                                let additional = ""
                                if (layers.p.buyables[11].extra().gt(0)) additional = "+" + formatWhole(layers.p.buyables[11].extra())
                                let start = "<b><h2>Amount</h2>: " + formatWhole(getBuyableAmount("p", 11)) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(layers.p.buyables[11].effect()) + "<br> to Particles</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.p.buyables[11].cost()) + " Particles</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.p.buyables[11].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("p", 11).plus(a)
                                let exp1 = x.pow(1)
                                let exp2 = x.pow(2)
                                let exp3 = x.pow(3)
                                
                                return Decimal.pow(1e4, exp1).times(Decimal.pow(10, exp2)).times(Decimal.pow(2, exp3)).times(Decimal.pow(2, 1024))
                        },
                        effectBase(){
                                let base = new Decimal(100)
                                if (hasUpgrade("a", 25)) base = base.times(layers.n.buyables[11].total().max(1))
                                if (hasUpgrade("b", 44)) base = base.times(Decimal.pow(1.05, Decimal.times(challengeCompletions("b", 22), layers.p.buyables[13].total())))
                                return base
                        },
                        effect(){
                                let x = layers.p.buyables[11].total()
                                let base = layers.p.buyables[11].effectBase()
                                return Decimal.pow(base, x)
                        },
                        total(){
                                return getBuyableAmount("p", 11).plus(layers.p.buyables[11].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("s", 33)) ret = ret.plus(layers.p.buyables[13].total())
                                if (hasUpgrade("s", 34)) ret = ret.plus(layers.p.buyables[12].total())
                                return ret
                        },
                        canAfford(){
                                return player.p.points.gte(layers.p.buyables[11].cost()) && !hasUpgrade("pi", 41)
                        },
                        buy(){
                                let cost = layers.p.buyables[11].cost()
                                if (player.p.points.lt(cost)) return
                                player.p.buyables[11] = player.p.buyables[11].plus(1)
                                player.p.points = player.p.points.minus(cost)
                        },
                        buyMax(maximum){
                                if (player.p.points.lt(layers.p.buyables[11].cost())) return 
                                let increment = 0.5
                                let toSkip = 0
                                var check = 0
                                while (player.p.points.gte(layers.p.buyables[11].cost(increment * 2)) && increment < maximum) {
                                        increment *= 2
                                }
                                while (increment >= 1 && toSkip < maximum) {
                                        check = toSkip + increment
                                        if (player.p.points.gte(layers.p.buyables[11].cost(check))) toSkip += increment
                                        increment /= 2
                                }
                                if (toSkip > maximum) toSkip = maximum
                                player.p.buyables[11] = player.p.buyables[11].plus(toSkip + 1)
                        },
                        unlocked(){ return (hasUpgrade("p", 15) || hasUnlockedRow(3)) && !hasUpgrade("pi", 41)},
                },
                12: {
                        title: "Particle Collision",
                        display(){
                                let additional = ""
                                if (layers.p.buyables[12].extra().gt(0)) additional = "+" + formatWhole(layers.p.buyables[12].extra())
                                let start = "<b><h2>Amount</h2>: " + formatWhole(getBuyableAmount("p", 12)) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(layers.p.buyables[12].effect()) + "<br> to Neutrinos and Quarks</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.p.buyables[12].cost()) + " Particles</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.p.buyables[12].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("p", 12).plus(a)
                                let exp1 = x.pow(1)
                                let exp2 = x.pow(2)
                                let exp3 = x.pow(3)
                                let base1 = Decimal.pow(5, 8)
                                
                                return Decimal.pow(base1, exp1).times(Decimal.pow(25, exp2)).times(Decimal.pow(2, exp3)).times(Decimal.pow(10, 311))
                        },
                        effectBase(){
                                let base = new Decimal(1e7)
                                if (hasUpgrade("b", 23)) base = base.pow(1 + challengeCompletions("b", 12))
                                return base
                        },
                        effect(){
                                let x = layers.p.buyables[12].total()
                                let base = layers.p.buyables[12].effectBase()
                                return Decimal.pow(base, x)
                        },
                        total(){
                                return getBuyableAmount("p", 12).plus(layers.p.buyables[12].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("s", 35)) ret = ret.plus(layers.p.buyables[13].total())
                                if (hasUpgrade("b", 21)) ret = ret.plus(challengeCompletions("b", 11))
                                if (hasUpgrade("b", 41)) ret = ret.plus(challengeCompletions("b", 21))
                                return ret
                        },
                        canAfford(){
                                return player.p.points.gte(layers.p.buyables[12].cost()) && !hasUpgrade("pi", 41)
                        },
                        buy(){
                                let cost = layers.p.buyables[12].cost()
                                if (player.p.points.lt(cost)) return
                                player.p.buyables[12] = player.p.buyables[12].plus(1)
                                player.p.points = player.p.points.minus(cost)
                        },
                        buyMax(maximum){
                                if (player.p.points.lt(layers.p.buyables[12].cost())) return 
                                let increment = 0.5
                                let toSkip = 0
                                var check = 0
                                while (player.p.points.gte(layers.p.buyables[12].cost(increment * 2)) && increment < maximum) {
                                        increment *= 2
                                }
                                while (increment >= 1 && toSkip < maximum) {
                                        check = toSkip + increment
                                        if (player.p.points.gte(layers.p.buyables[12].cost(check))) toSkip += increment
                                        increment /= 2
                                }
                                if (toSkip > maximum) toSkip = maximum
                                player.p.buyables[12] = player.p.buyables[12].plus(toSkip + 1)
                        },
                        unlocked(){ return (hasUpgrade("p", 25) || hasUnlockedRow(3)) && !hasUpgrade("pi", 41)},
                },
                13: {
                        title: "Particle Simulation",
                        display(){
                                let additional = ""
                                if (layers.p.buyables[13].extra().gt(0)) additional = "+" + formatWhole(layers.p.buyables[13].extra())
                                let start = "<b><h2>Amount</h2>: " + formatWhole(getBuyableAmount("p", 13)) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(layers.p.buyables[13].effect()) + "<br> to Matter and Neutrinos</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.p.buyables[13].cost()) + " Particles</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.p.buyables[13].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("p", 13).plus(a)
                                let exp1 = x.pow(1)
                                let exp2 = x.pow(2)
                                let exp3 = x.pow(3)

                                return Decimal.pow(3e17, exp1).times(Decimal.pow(1e4, exp2)).times(Decimal.pow(5, exp3)).times(Decimal.pow(10, 422).times(5))
                        },
                        effectBase(){
                                let ret = new Decimal(1e10)
                                if (hasUpgrade("s", 23)) ret = ret.pow(player.p.buyables[13].max(1))
                                return ret
                        },
                        effect(){
                                let x = layers.p.buyables[13].total()
                                let base = layers.p.buyables[13].effectBase()
                                return Decimal.pow(base, x)
                        },
                        total(){
                                return getBuyableAmount("p", 13).plus(layers.p.buyables[13].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("b", 24)) ret = ret.plus(challengeCompletions("b", 12))
                                if (hasUpgrade("b", 33)) ret = ret.plus(challengeCompletions("b", 11))
                                if (hasUpgrade("b", 33)) ret = ret.plus(challengeCompletions("b", 21))
                                ret = ret.plus(layers.b.challenges[22].rewardEffect()[1])
                                return ret
                        },
                        canAfford(){
                                return player.p.points.gte(layers.p.buyables[13].cost()) && !hasUpgrade("pi", 41)
                        },
                        buy(){
                                let cost = layers.p.buyables[13].cost()
                                if (player.p.points.lt(cost)) return
                                player.p.buyables[13] = player.p.buyables[13].plus(1)
                                player.p.points = player.p.points.minus(cost)
                        },
                        buyMax(maximum){
                                if (player.p.points.lt(layers.p.buyables[13].cost())) return 
                                let increment = 0.5
                                let toSkip = 0
                                var check = 0
                                while (player.p.points.gte(layers.p.buyables[13].cost(increment * 2)) && increment < maximum) {
                                        increment *= 2
                                }
                                while (increment >= 1 && toSkip < maximum) {
                                        check = toSkip + increment
                                        if (player.p.points.gte(layers.p.buyables[13].cost(check))) toSkip += increment
                                        increment /= 2
                                }
                                if (toSkip > maximum) toSkip = maximum
                                player.p.buyables[13] = player.p.buyables[13].plus(toSkip + 1)
                        },
                        unlocked(){ return (hasUpgrade("p", 33) || hasUnlockedRow(3)) && !hasUpgrade("pi", 41)},
                },
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                return player.i.best.gt(Decimal.pow(10, 11450)) || hasUnlockedRow(3) || player.p.best.gt(0)
        },
        tabFormat: ["main-display",
                ["display-text", function(){
                        return "You are getting " + format(layers.p.getResetGain()) + " Particles per second (based on Incrementy, requires 1e11475)"
                        }],
                ["display-text", function(){ 
                        let a = hasUpgrade("s", 13) ? 1 : 60
                        return "This maxes at " + formatWhole(a) + " seconds worth of production (" + format(layers.p.getResetGain().times(a)) + ")"
                        }],
                "blank",
                "blank", 
                "upgrades",
                "blank",
                "buyables"],
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 2) return


                //upgrades
                let keep = []
                if (!hasUpgrade("s", 21)) player.p.upgrades = filter(player.p.upgrades, keep)


                //buyables
                let resetBuyables = [11, 12, 13]
                for (let j = 0; j < resetBuyables.length; j++) {
                        player.p.buyables[resetBuyables[j]] = new Decimal(0)
                }

                //resource
                player.p.points = new Decimal(0)
                player.p.best = new Decimal(0)
        },
})


addLayer("n", {
        name: "Neutrinos", 
        symbol: "N", 
        position: 2,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
                time: 0,
        }},
        color: "#B5F146",
        requires: Decimal.pow(10, 0),
        resource: "Neutrinos",
        baseAmount() {return player.p.points},
        branches: [],
        type: "custom", 
        getResetGain() {
                if (!hasUpgrade("p", 11)) return new Decimal(0)
                let amt = layers.n.baseAmount()
                let exp = layers.n.getGainExp()
                let base = amt.div(60).pow(exp)
                if (base.gt(1e10)) base = base.log10().pow(10)
                base = base.pow(layers.n.getPostExp())
                let ret = base.times(layers.n.getGainMult())

                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                if (inChallenge("sp", 12)) ret = ret.root(100)

                return ret
        },
        getPostExp(){
                let x = new Decimal(1)
                if (hasUpgrade("p", 53)) x = x.times(Decimal.pow(2, player.p.upgrades.length))
                x = x.times(layers.o.buyables[31].effect())
                return x
        },
        getGainExp(){
                let x = new Decimal(.5)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                return x
        },
        getGainMult(){
                let x = new Decimal(1)
                x = x.times(getNBuyableEff(11))
                if (hasUpgrade("p", 12)) x = x.times(upgradeEffect("p", 12))
                if (hasUpgrade("p", 13)) x = x.times(upgradeEffect("p", 13))
                if (hasUpgrade("p", 14)) x = x.times(upgradeEffect("p", 14))
                if (hasUpgrade("e", 35)) x = x.times(upgradeEffect("e", 35))
                if (hasUpgrade("e", 55)) x = x.times(upgradeEffect("e", 55))
                if (hasUpgrade("g", 11)) x = x.times(upgradeEffect("g", 11))
                if (hasUpgrade("p", 22)) x = x.times(upgradeEffect("p", 22))
                x = x.times(layers.p.buyables[12].effect())
                if (hasUpgrade("a", 15)) x = x.times(upgradeEffect("a", 15))
                x = x.times(layers.p.buyables[13].effect())
                if (hasUpgrade("s", 11)) x = x.times(2)
                if (hasUpgrade("s", 12)) x = x.times(Math.max(player.s.upgrades.length, 1))
                if (hasUpgrade("p", 34)) x = x.times(1000)
                x = x.times(layers.sp.effect()[1])
                x = x.times(layers.o.effect())
                return x
        },
        prestigeButtonText(){
                return "if you see this bug"
        },
        canReset(){
                return false
        },
        update(diff){
                let gain = layers.n.getResetGain()
                player.n.points = player.n.points.plus(gain.times(diff))

                if (!player.n.best) player.n.best = new Decimal(0)
                player.n.best = player.n.best.max(player.n.points)

                if (!player.n.time) player.n.time = 0
                let mult = hasMilestone("sp", 2) ? 3 : 1
                player.n.time += diff * mult
                if (player.n.time >= 1) {
                        let times = -Math.floor(player.n.time)
                        player.n.time += times
                        times *= -1
                        if (hasUpgrade("s", 23)) times *= 10
                        if (hasUpgrade("s", 41)) times *= 10
                        if (hasUpgrade("pi", 31)) times *= 2
                        if (hasUpgrade("sp", 52)) times *= 50
                        if (hasMilestone("o", 0)) times *= 10
                        
                        if (hasUpgrade("s", 14) || hasMilestone("o", 1)) {
                                layers.n.buyables[11].buyMax(times)
                                layers.n.buyables[12].buyMax(times)
                                layers.n.buyables[13].buyMax(times)
                                layers.n.buyables[21].buyMax(times)
                                layers.n.buyables[22].buyMax(times)
                                layers.n.buyables[23].buyMax(times)
                                layers.n.buyables[31].buyMax(times)
                                layers.n.buyables[32].buyMax(times)
                                layers.n.buyables[33].buyMax(times)
                        }
                        if (player.n.time > 10) player.n.time = 10
                }
        },
        buyables:{
                rows: 3,
                cols: 3,
                11: {
                        title: "Neutrino Generation",
                        display(){
                                let additional = ""
                                if (layers.n.buyables[11].extra().gt(0)) additional = "+" + getNExtraBuyableFormat(11)
                                let start = "<b><h2>Amount</h2>: " + getNBuyableFormat(11) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getNBuyableEff(11)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getNBuyableCost(11)) + " Neutrinos</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.n.buyables[11].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("n", 11).plus(a)
                                let base1 = 4
                                let base2 = 1.25
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(base2, exp2)).times(25)
                        },
                        total(){
                                return getBuyableAmount("n", 11).plus(layers.n.buyables[11].extra())
                        },
                        effect(){
                                let x = layers.n.buyables[11].total()
                                let base = layers.n.buyables[11].effectBase()
                                return Decimal.pow(base, x)
                        },
                        effectBase(){
                                if (inChallenge("sp", 11)) return new Decimal(1)
                                let ret = new Decimal(3)
                                if (hasUpgrade("e", 45)) {
                                        let diff = layers.n.buyables[11].total().div(100).minus(1).max(0)
                                        diff = diff.min(10)
                                        ret = ret.plus(diff)
                                }
                                if (hasUpgrade("g", 21)) ret = ret.plus(.3)
                                if (hasUpgrade("p", 23)) ret = ret.plus(player.g.upgrades.length / 20)
                                if (hasIUpg(15)) {
                                        let a = 1
                                        if (hasIUpg(25)) a ++
                                        if (hasIUpg(35)) a ++
                                        ret = ret.plus(a / 2)
                                }
                                if (hasUpgrade("s", 13)) ret = ret.plus(1)
                                ret = ret.plus(layers.b.challenges[11].rewardEffect())
                                return ret
                        },
                        canAfford(){
                                return player.n.points.gte(getNBuyableCost(11))
                        },
                        extra(){
                                let ret = layers.n.buyables[12].total().plus(layers.n.buyables[21].total()).plus(layers.n.buyables[13].total()).plus(layers.n.buyables[31].total())
                                if (hasUpgrade("g", 25)) ret = ret.plus(layers.n.buyables[13].total())
                                else if (hasUpgrade("g", 15)) ret = ret.plus(layers.n.buyables[13].total().div(3).floor())
                                if (hasUpgrade("g", 45)) ret = ret.plus(layers.n.buyables[33].total())
                                if (hasUpgrade("p", 25)) ret = ret.plus(layers.p.buyables[11].total())
                                if (hasUpgrade("s", 25)) ret = ret.plus(layers.n.buyables[22].total())
                                return ret
                        },
                        buy(){
                                let cost = getNBuyableCost(11)
                                if (player.n.points.lt(cost)) return
                                player.n.buyables[11] = player.n.buyables[11].plus(1)
                                player.n.points = player.n.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.n.points.lt(25)) return
                                let base1 = 4
                                let baseInit = 25
                                let base2 = 1.25

                                let pttarget = player.n.points.div(baseInit).log(base2)
                                let bfactor = Math.log(base1)/Math.log(base2)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                let diff = target.minus(player.n.buyables[11]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.n.buyables[11] = player.n.buyables[11].plus(diff)
                        },
                        unlocked(){ return true },
                },
                12: {
                        title: "Particle Generation",
                        display(){
                                let additional = ""
                                if (layers.n.buyables[12].extra().gt(0)) additional = "+" + getNExtraBuyableFormat(12)
                                let start = "<b><h2>Amount</h2>: " + getNBuyableFormat(12) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getNBuyableEff(12)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getNBuyableCost(12)) + " Neutrinos</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.n.buyables[12].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("n", 12).plus(a)
                                let base1 = 8
                                let base2 = 1.25
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(base2, exp2)).times(500)
                        },
                        total(){
                                return getBuyableAmount("n", 12).plus(layers.n.buyables[12].extra())
                        },
                        effect(){
                                let x = layers.n.buyables[12].total()
                                let base = layers.n.buyables[12].effectBase()
                                return Decimal.pow(base, x)
                        },
                        effectBase(){
                                if (inChallenge("sp", 11)) return new Decimal(1)
                                let ret = new Decimal(1.5)
                                if (hasUpgrade("b", 22)) ret = ret.plus(layers.b.challenges[11].rewardEffect().root(3))
                                ret = ret.plus(layers.b.challenges[22].rewardEffect()[0])
                                return ret
                        },
                        canAfford(){
                                return player.n.points.gte(getNBuyableCost(12))
                        },
                        extra(){
                                let ret = layers.n.buyables[22].total().plus(layers.n.buyables[13].total()).plus(layers.n.buyables[32].total())
                                if (hasUpgrade("g", 41)) ret = ret.plus(layers.n.buyables[31].total())
                                if (hasUpgrade("g", 54)) ret = ret.plus(layers.n.buyables[33].total())
                                if (hasUpgrade("p", 33)) ret = ret.plus(layers.p.buyables[12].total())
                                return ret
                        },
                        buy(){
                                let cost = getNBuyableCost(12)
                                if (player.n.points.lt(cost)) return
                                player.n.buyables[12] = player.n.buyables[12].plus(1)
                                player.n.points = player.n.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.n.points.lt(500)) return
                                let base1 = 8
                                let baseInit = 500
                                let base2 = 1.25

                                let pttarget = player.n.points.div(baseInit).log(base2)
                                let bfactor = Math.log(base1)/Math.log(base2)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                let diff = target.minus(player.n.buyables[12]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.n.buyables[12] = player.n.buyables[12].plus(diff)
                        },
                        unlocked(){ return player.n.buyables[11].gte(2) || hasUnlockedRow(3) },
                },
                13: {
                        title: "Base Incrementy Gain",
                        display(){
                                let additional = ""
                                if (layers.n.buyables[13].extra().gt(0)) additional = "+" + getNExtraBuyableFormat(13)
                                let start = "<b><h2>Amount</h2>: " + getNBuyableFormat(13) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getNBuyableEff(13)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getNBuyableCost(13)) + " Neutrinos</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.n.buyables[13].effectBase()) + "^x (based on best Incrementy)</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("n", 13).plus(a)
                                let base1 = 1024
                                let base2 = 25
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(base2, exp2)).times(1e21)
                        },
                        total(){
                                return getBuyableAmount("n", 13).plus(layers.n.buyables[13].extra())
                        },
                        effect(){
                                let x = layers.n.buyables[13].total()
                                let base = layers.n.buyables[13].effectBase()
                                return Decimal.pow(base, x)
                        },
                        effectBase(){
                                if (inChallenge("sp", 11)) return new Decimal(1)
                                let ret = player.i.best.plus(10).log10().max(1e4).div(1e4)
                                if (ret.lt(1)) return new Decimal(1)
                                if (ret.gt(2)) ret = ret.times(50).log10()
                                if (hasUpgrade("e", 15)) ret = ret.pow(10)
                                if (inChallenge("b", 12)) ret = ret.pow(new Decimal(2).div(3 + challengeCompletions("b", 12)))
                                if (inChallenge("b", 21)) return new Decimal(1)
                                return ret
                        },
                        canAfford(){
                                return player.n.points.gte(getNBuyableCost(13))
                        },
                        extra(){
                                let ret = layers.n.buyables[23].total().plus(layers.n.buyables[33].total())
                                if (hasUpgrade("g", 14)) ret = ret.plus(2)
                                if (hasUpgrade("g", 53)) ret = ret.plus(layers.n.buyables[32].total())
                                if (hasUpgrade("p", 34)) ret = ret.plus(layers.p.buyables[13].total())
                                if (hasUpgrade("s", 24)) ret = ret.plus(layers.n.buyables[31].total())
                                return ret
                        },
                        buy(){
                                let cost = getNBuyableCost(13)
                                if (player.n.points.lt(cost)) return
                                player.n.buyables[13] = player.n.buyables[13].plus(1)
                                player.n.points = player.n.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.n.points.lt(1e21)) return
                                let base1 = 1024
                                let baseInit = 1e21
                                let base2 = 25

                                let pttarget = player.n.points.div(baseInit).log(base2)
                                let bfactor = Math.log(base1)/Math.log(base2)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                let diff = target.minus(player.n.buyables[13]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.n.buyables[13] = player.n.buyables[13].plus(diff)
                        },
                        unlocked(){ return player.n.buyables[11].gte(12) || hasUnlockedRow(3) },
                },
                21: {
                        title: "Incrementy Boost",
                        display(){
                                let additional = ""
                                if (layers.n.buyables[21].extra().gt(0)) additional = "+" + getNExtraBuyableFormat(21)
                                let start = "<b><h2>Amount</h2>: " + getNBuyableFormat(21) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getNBuyableEff(21)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getNBuyableCost(21)) + " Neutrinos</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.n.buyables[21].effectBase()) + "^x (based on best Neutrinos)</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("n", 21).plus(a)
                                let base1 = 8
                                let base2 = 2.5
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(base2, exp2)).times(5e5)
                        },
                        total(){
                                return getBuyableAmount("n", 21).plus(layers.n.buyables[21].extra())
                        },
                        effect(){
                                let x = layers.n.buyables[21].total()
                                let base = layers.n.buyables[21].effectBase()
                                return Decimal.pow(base, x)
                        },
                        effectBase(){
                                if (inChallenge("sp", 11)) return new Decimal(1)
                                return player.n.best.plus(10).log10().pow(2)
                        },
                        canAfford(){
                                return player.n.points.gte(getNBuyableCost(21))
                        },
                        extra(){
                                let ret = layers.n.buyables[22].total().plus(layers.n.buyables[23].total()).plus(layers.n.buyables[31].total())
                                if (hasUpgrade("g", 52)) ret = ret.plus(layers.n.buyables[32].total())
                                if (hasIUpg(35)) ret = ret.plus(layers.n.buyables[33].total())
                                if (hasUpgrade("p", 25)) ret = ret.plus(layers.p.buyables[11].total())
                                if (hasUpgrade("b", 11)) ret = ret.plus(layers.i.buyables[13].total())
                                return ret
                        },
                        buy(){
                                let cost = getNBuyableCost(21)
                                if (player.n.points.lt(cost)) return
                                player.n.buyables[21] = player.n.buyables[21].plus(1)
                                player.n.points = player.n.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.n.points.lt(5e5)) return
                                let base1 = 8
                                let baseInit = 5e5
                                let base2 = 2.5

                                let pttarget = player.n.points.div(baseInit).log(base2)
                                let bfactor = Math.log(base1)/Math.log(base2)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                let diff = target.minus(player.n.buyables[21]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.n.buyables[21] = player.n.buyables[21].plus(diff)
                        },
                        unlocked(){ return player.n.buyables[11].gte(5) || hasUnlockedRow(3) },
                },
                22: {
                        title: "Particle Boost",
                        display(){
                                let additional = ""
                                if (layers.n.buyables[22].extra().gt(0)) additional = "+" + getNExtraBuyableFormat(22)
                                let start = "<b><h2>Amount</h2>: " + getNBuyableFormat(22) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getNBuyableEff(22)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getNBuyableCost(22)) + " Neutrinos</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.n.buyables[22].effectBase()) + "^x (based on best Neutrinos)</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("n", 22).plus(a)
                                let base1 = 256
                                let base2 = 5
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(base2, exp2)).times(1e10)
                        },
                        total(){
                                return getBuyableAmount("n", 22).plus(layers.n.buyables[22].extra())
                        },
                        effect(){
                                let x = layers.n.buyables[22].total()
                                let base = layers.n.buyables[22].effectBase()
                                return Decimal.pow(base, x)
                        },
                        effectBase(){
                                if (inChallenge("sp", 11)) return new Decimal(1)
                                let ret = player.n.best.plus(10).log10().root(2)
                                if (hasUpgrade("g", 32)) ret = ret.plus(layers.n.buyables[11].total().div(100))
                                if (hasUpgrade("g", 33)) ret = ret.plus(player.g.upgrades.length/4)
                                ret = ret.times(layers.sp.challenges[22].rewardEffect())
                                return ret
                        },
                        canAfford(){
                                return player.n.points.gte(getNBuyableCost(22))
                        },
                        extra(){
                                let ret = layers.n.buyables[23].total().plus(layers.n.buyables[32].total())
                                if (hasUpgrade("g", 44)) ret = ret.plus(layers.n.buyables[33].total())
                                if (hasUpgrade("p", 33)) ret = ret.plus(layers.p.buyables[12].total())
                                return ret
                        },
                        buy(){
                                let cost = getNBuyableCost(22)
                                if (player.n.points.lt(cost)) return
                                player.n.buyables[22] = player.n.buyables[22].plus(1)
                                player.n.points = player.n.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.n.points.lt(1e10)) return
                                let base1 = 256
                                let baseInit = 1e10
                                let base2 = 5

                                let pttarget = player.n.points.div(baseInit).log(base2)
                                let bfactor = Math.log(base1)/Math.log(base2)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                let diff = target.minus(player.n.buyables[22]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.n.buyables[22] = player.n.buyables[22].plus(diff)
                        },
                        unlocked(){ return player.n.buyables[11].gte(5) || hasUnlockedRow(3) },
                },
                23: {
                        title: "Energy Boost",
                        display(){
                                let additional = ""
                                if (layers.n.buyables[23].extra().gt(0)) additional = "+" + getNExtraBuyableFormat(23)
                                let start = "<b><h2>Amount</h2>: " + getNBuyableFormat(23) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getNBuyableEff(23)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getNBuyableCost(23)) + " Neutrinos</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.n.buyables[23].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("n", 23).plus(a)
                                let base1 = Decimal.pow(2, 15)
                                let base2 = 125
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(base2, exp2)).times(1e35)
                        },
                        total(){
                                return getBuyableAmount("n", 23).plus(layers.n.buyables[23].extra())
                        },
                        effect(){
                                let x = layers.n.buyables[23].total()
                                let base = layers.n.buyables[23].effectBase()
                                return Decimal.pow(base, x)
                        },
                        effectBase(){
                                if (inChallenge("sp", 11)) return new Decimal(1)
                                let ret = new Decimal(100)
                                if (hasUpgrade("g", 34)) ret = ret.plus(player.i.buyables[12].div(10))
                                return ret
                        },
                        canAfford(){
                                return player.n.points.gte(getNBuyableCost(23))
                        },
                        extra(){
                                let ret = layers.n.buyables[33].total()
                                if (hasUpgrade("e", 25)) ret = ret.plus(1)
                                if (hasUpgrade("g", 35)) {
                                        let a = 1
                                        if (hasUpgrade("g", 15)) a ++
                                        if (hasUpgrade("g", 25)) a ++
                                        if (hasUpgrade("g", 45)) a ++
                                        if (hasUpgrade("g", 55)) a ++
                                        ret = ret.plus(a)
                                }
                                if (hasUpgrade("p", 34)) ret = ret.plus(layers.p.buyables[13].total())
                                return ret
                        },
                        buy(){
                                let cost = getNBuyableCost(23)
                                if (player.n.points.lt(cost)) return
                                player.n.buyables[23] = player.n.buyables[23].plus(1)
                                player.n.points = player.n.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.n.points.lt(1e35)) return
                                let base1 = Math.pow(2, 15)
                                let baseInit = 1e35
                                let base2 = 125

                                let pttarget = player.n.points.div(baseInit).log(base2)
                                let bfactor = Math.log(base1)/Math.log(base2)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                let diff = target.minus(player.n.buyables[23]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.n.buyables[23] = player.n.buyables[23].plus(diff)
                        },
                        unlocked(){ return player.n.buyables[11].gte(12) || hasUnlockedRow(3) },
                },
                31: {
                        title: "Matter Gain",
                        display(){
                                let additional = ""
                                if (layers.n.buyables[31].extra().gt(0)) additional = "+" + getNExtraBuyableFormat(31)
                                let start = "<b><h2>Amount</h2>: " + getNBuyableFormat(31) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getNBuyableEff(31)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getNBuyableCost(31)) + " Neutrinos</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.n.buyables[31].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("n", 31).plus(a)
                                let base1 = Decimal.pow(2, 19)
                                let base2 = 1250
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(base2, exp2)).times(1e49)
                        },
                        total(){
                                return getBuyableAmount("n", 31).plus(layers.n.buyables[31].extra())
                        },
                        effect(){
                                let x = layers.n.buyables[31].total()
                                let base = layers.n.buyables[31].effectBase()
                                return Decimal.pow(base, x)
                        },
                        effectBase(){
                                if (inChallenge("sp", 11)) return new Decimal(1)
                                let ret = new Decimal(25)
                                if (hasUpgrade("g", 51)) ret = ret.plus(layers.n.buyables[31].total())
                                return ret
                        },
                        canAfford(){
                                return player.n.points.gte(getNBuyableCost(31))
                        },
                        extra(){
                                let ret = layers.n.buyables[32].total().plus(layers.n.buyables[33].total())
                                if (hasUpgrade("p", 25)) ret = ret.plus(layers.p.buyables[11].total())
                                return ret
                        },
                        buy(){
                                let cost = getNBuyableCost(31)
                                if (player.n.points.lt(cost)) return
                                player.n.buyables[31] = player.n.buyables[31].plus(1)
                                player.n.points = player.n.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.n.points.lt(1e49)) return
                                let base1 = Math.pow(2, 19)
                                let baseInit = 1e49
                                let base2 = 1250

                                let pttarget = player.n.points.div(baseInit).log(base2)
                                let bfactor = Math.log(base1)/Math.log(base2)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                let diff = target.minus(player.n.buyables[31]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.n.buyables[31] = player.n.buyables[31].plus(diff)
                        },
                        unlocked(){ return player.n.buyables[11].gte(20) || hasUnlockedRow(3) },
                },
                32: {
                        title: "Antimatter Gain",
                        display(){
                                let additional = ""
                                if (layers.n.buyables[32].extra().gt(0)) additional = "+" + getNExtraBuyableFormat(32)
                                let start = "<b><h2>Amount</h2>: " + getNBuyableFormat(32) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getNBuyableEff(32)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getNBuyableCost(32)) + " Neutrinos</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.n.buyables[32].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("n", 32).plus(a)
                                let base1 = Decimal.pow(2, 49)
                                let base2 = 1250
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(base2, exp2)).times(1e82)
                        },
                        total(){
                                return getBuyableAmount("n", 32).plus(layers.n.buyables[32].extra())
                        },
                        effect(){
                                let x = layers.n.buyables[32].total()
                                let base = layers.n.buyables[32].effectBase()
                                return Decimal.pow(base, x)
                        },
                        effectBase(){
                                if (inChallenge("sp", 11)) return new Decimal(1)
                                let ret = new Decimal(100)
                                if (hasUpgrade("s", 32)) ret = ret.plus(layers.n.buyables[32].total().pow(3))
                                if (hasUpgrade("g", 42)) ret = ret.pow(2)
                                if (hasUpgrade("g", 43)) ret = ret.pow(2)
                                return ret
                        },
                        canAfford(){
                                return player.n.points.gte(getNBuyableCost(32))
                        },
                        extra(){
                                let ret = layers.n.buyables[33].total()
                                if (hasUpgrade("p", 33)) ret = ret.plus(layers.p.buyables[12].total())
                                if (hasUpgrade("b", 32)) ret = ret.plus(challengeCompletions("b", 21) * 20)
                                return ret
                        },
                        buy(){
                                let cost = getNBuyableCost(32)
                                if (player.n.points.lt(cost)) return
                                player.n.buyables[32] = player.n.buyables[32].plus(1)
                                player.n.points = player.n.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.n.points.lt(1e82)) return
                                let base1 = Math.pow(2, 49)
                                let baseInit = 1e82
                                let base2 = 1250

                                let pttarget = player.n.points.div(baseInit).log(base2)
                                let bfactor = Math.log(base1)/Math.log(base2)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                let diff = target.minus(player.n.buyables[32]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.n.buyables[32] = player.n.buyables[32].plus(diff)
                        },
                        unlocked(){ return player.n.buyables[11].gte(20) || hasUnlockedRow(3) },
                },
                33: {
                        title: "Amoeba Gain",
                        display(){
                                let additional = ""
                                if (layers.n.buyables[33].extra().gt(0)) additional = "+" + getNExtraBuyableFormat(33)
                                let start = "<b><h2>Amount</h2>: " + getNBuyableFormat(33) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: x" + format(getNBuyableEff(33)) + "</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(getNBuyableCost(33)) + " Neutrinos</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.n.buyables[33].effectBase()) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("n", 33).plus(a)
                                let base1 = Decimal.pow(2, 214)
                                let base2 = Decimal.pow(5, 10).times(Decimal.pow(2, 18))
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, x).times(Decimal.pow(base2, exp2)).times(1e150)
                        },
                        total(){
                                return getBuyableAmount("n", 33).plus(layers.n.buyables[33].extra())
                        },
                        effect(){
                                let x = layers.n.buyables[33].total()
                                let base = layers.n.buyables[33].effectBase()
                                return Decimal.pow(base, x)
                        },
                        effectBase(){
                                if (inChallenge("sp", 11)) return new Decimal(1)
                                let ret = new Decimal(10)
                                if (hasUpgrade("g", 54)) ret = ret.times(layers.n.buyables[33].total())
                                ret = ret.pow(.1)
                                if (hasUpgrade("g", 55)) ret = ret.pow(2)
                                if (hasUpgrade("b", 12)) ret = ret.plus(challengeCompletions("b", 11))
                                if (hasUpgrade("sp", 14)) ret = ret.pow(upgradeEffect("sp", 14))
                                return ret
                        },
                        canAfford(){
                                return player.n.points.gte(getNBuyableCost(33))
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("p", 34)) ret = ret.plus(layers.p.buyables[13].total())
                                if (hasUpgrade("s", 15)) ret = ret.plus(1)
                                if (hasUpgrade("b", 12)) ret = ret.plus(challengeCompletions("b", 11))
                                return ret
                        },
                        buy(){
                                let cost = getNBuyableCost(33)
                                if (player.n.points.lt(cost)) return
                                player.n.buyables[33] = player.n.buyables[33].plus(1)
                                player.n.points = player.n.points.minus(cost)
                        },
                        buyMax(maximum){       
                                if (player.n.points.lt(1e150)) return
                                let base1 = Math.pow(2, 214)
                                let baseInit = 1e150
                                let base2 = Math.pow(5, 10)*Math.pow(2, 18)

                                let pttarget = player.n.points.div(baseInit).log(base2)
                                let bfactor = Math.log(base1)/Math.log(base2)
                                //want to find ax^2+bx = c
                                let c = pttarget
                                let b = bfactor
                                // let a = 1 this is constant so remove it

                                let target = c.times(4).plus(b * b).sqrt().minus(b).div(2).floor().plus(1)

                                let diff = target.minus(player.n.buyables[33]).max(0)
                                if (maximum != undefined) diff = diff.min(maximum)
                                player.n.buyables[33] = player.n.buyables[33].plus(diff)
                        },
                        unlocked(){ return player.n.buyables[11].gte(20) || hasUnlockedRow(3) },
                },
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                return hasUpgrade("p", 11) || hasUnlockedRow(3)
        },
        tabFormat: ["main-display",
                ["display-text", function(){return "You are getting " + format(layers.n.getResetGain()) + " Neutrinos per second (based on particles)"}],
                ["display-text", "Each buyable has an effect and gives a free level to all upgrades directly to the left or above it"],
                "blank",
                "blank", 
                "buyables"],
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 1) return

                //resource
                player.n.points = new Decimal(0)
                player.n.best = new Decimal(0)

                //buyables
                let resetBuyables = [11,12,13,21,22,23,31,32,33]
                for (let j = 0; j < resetBuyables.length; j++) {
                        player.n.buyables[resetBuyables[j]] = new Decimal(0)
                }
        },
})

addLayer("g", {
        name: "Gluons", 
        symbol: "G", 
        position: 3,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
        }},
        color: "#744100",
        requires: Decimal.pow(10, 0),
        resource: "Gluons",
        baseAmount() {return player.p.points},
        branches: [],
        type: "custom", 
        getResetGain() {
                if (!hasUpgrade("p", 21)) return new Decimal(0)
                let amt = layers.g.baseAmount()
                let exp = layers.g.getGainExp()
                let base = amt.div(3.5e34).pow(exp)
                if (base.lt(1)) return new Decimal(0)
                base = base.minus(1)
                if (base.lt(1)) base = base.sqrt()

                let ret = base.times(layers.g.getGainMult())
                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                return ret
        },
        getGainExp(){
                let x = new Decimal(.5)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                return x
        },
        getGainMult(){
                let x = new Decimal(1)
                if (hasUpgrade("p", 24)) x = x.times(upgradeEffect("p", 24))
                if (hasUpgrade("s", 23)) x = x.times(layers.p.buyables[13].effect())
                x = x.times(layers.sp.effect()[1])
                return x
        },
        prestigeButtonText(){
                return "if you see this bug"
        },
        canReset(){
                return false
        },
        update(diff){
                if (hasUpgrade("pi", 32)) {
                        player.g.points = new Decimal(0)
                        player.g.best = new Decimal(0)
                        return
                }
                let gain = layers.g.getResetGain()
                player.g.points = player.g.points.plus(gain.times(diff))

                if (!player.g.best) player.g.best = new Decimal(0)
                player.g.best = player.g.best.max(player.g.points)
        },
        upgrades:{
                rows: 5,
                cols: 5,
                11: {
                        title: "Won",
                        description: "Best Gluons boost Neutrino gain",
                        cost: new Decimal(10),
                        effect(){
                                let ret = player.g.best.max(1).root(10).times(20)
                                if (ret.gt(1000)) ret = ret.log10().plus(7).pow(3)
                                return ret
                        },
                        unlocked(){
                                return true
                        },
                },
                12: {
                        title: "One",
                        description: "Best Gluons boost Particle gain",
                        cost: new Decimal(15),
                        effect(){
                                let ret = player.g.best.max(1).root(20).times(20)
                                if (ret.gt(100)) ret = ret.log10().times(5).pow(2)
                                return ret
                        },
                        unlocked(){
                                return hasUpgrade("g", 11) || hasUnlockedRow(3)
                        },
                },
                13: {
                        title: "Build",
                        description: "Incrementy boosts Particle gain", 
                        cost: new Decimal(300),
                        effect(){
                                let ret = player.i.best.max(10).log10().root(4)
                                return ret
                        },
                        unlocked(){
                                return hasUpgrade("g", 12) || hasUnlockedRow(3)
                        },
                },
                14: {
                        title: "Billed",
                        description: "Add two free levels to Base Incrementy Gain Neutrino buyable", 
                        cost: new Decimal(1e15),
                        unlocked(){
                                return hasUpgrade("g", 13) || hasUnlockedRow(3)
                        },
                },
                21: {
                        title: "Main",
                        description: "Add .3 to the Neutrino Generation base", 
                        cost: new Decimal(5e21),
                        unlocked(){
                                return hasUpgrade("g", 14) || hasUnlockedRow(3)
                        },
                },
                22: {
                        title: "Mane",
                        description: "Boost Particle gain based on Gluon upgrades", 
                        cost: new Decimal(1e24),
                        effect(){
                                let l = player.g.upgrades.length
                                return Decimal.pow(l, l/2)
                        },
                        unlocked(){
                                return hasUpgrade("g", 21) || hasUnlockedRow(3)
                        },
                },
                23: {
                        title: "Sole",
                        description: "Boost Particle gain based on Energy", 
                        cost: new Decimal(1e26),
                        effect(){
                                return player.e.points.plus(10).log10()
                        },
                        unlocked(){
                                return hasUpgrade("g", 22) || hasUnlockedRow(3)
                        },
                },
                24: {
                        title: "Soul",
                        description: "Boost Base Incrementy gain based on Gluons", 
                        cost: new Decimal(1e27),
                        effect(){
                                return player.g.points.plus(10).log10().pow(5)
                        },
                        unlocked(){
                                return hasUpgrade("g", 23) || hasUnlockedRow(3)
                        },
                },
                31: {
                        title: "Muscle",
                        description: "Neutrinos multiply Incrementy gain", 
                        cost: new Decimal(1e28),
                        unlocked(){
                                return hasUpgrade("g", 24) || hasUnlockedRow(3)
                        },
                },
                32: {
                        title: "Mussel",
                        description: "Each Neutrino Generation Buyable adds .01 to the Particle Boost buyable base", 
                        cost: new Decimal(1e29),
                        unlocked(){
                                return hasUpgrade("g", 31) || hasUnlockedRow(3)
                        },
                },
                33: {
                        title: "Read",
                        description: "Each Gluon Upgrades adds .25 to the Particle Boost buyable base", 
                        cost: new Decimal(3e30),
                        unlocked(){
                                return hasUpgrade("g", 32) || hasUnlockedRow(3)
                        },
                },
                34: {
                        title: "Reed",
                        description: "Each Incrementy Strength adds .1 to the Energy Boost buyable base", 
                        cost: new Decimal(1e32),
                        unlocked(){
                                return hasUpgrade("g", 33) || hasUnlockedRow(3)
                        },
                },
                41: {
                        title: "Read?",
                        description: "Matter Gain buyables also give free levels to Particle Generation", 
                        cost: new Decimal(1e40),
                        unlocked(){
                                return hasUpgrade("g", 34) || hasUnlockedRow(3)
                        },
                },
                42: {
                        title: "Red!",
                        description: "Square Antimatter generation base", 
                        cost: new Decimal(1e48),
                        unlocked(){
                                return hasUpgrade("g", 41) || hasUnlockedRow(3)
                        },
                },
                43: {
                        title: "Idle",
                        description: "Square Antimatter generation base", 
                        cost: new Decimal(1e51),
                        unlocked(){
                                return hasUpgrade("g", 42) || hasUnlockedRow(3)
                        },
                },
                44: {
                        title: "Idol",
                        description: "Amoeba Gain buyables also give free levels to Particle Boost", 
                        cost: new Decimal(1e52),
                        unlocked(){
                                return hasUpgrade("g", 43) || hasUnlockedRow(3)
                        },
                },
                51: {
                        title: "Moat",
                        description: "Each Matter Gain buyable adds 1 to its base", 
                        cost: new Decimal(5e63),
                        unlocked(){
                                return hasUpgrade("g", 44) || hasUnlockedRow(3)
                        },
                },
                52: {
                        title: "Mote",
                        description: "Antimatter Gain buyables also gives free levels to Incrementry Boost", 
                        cost: new Decimal(2e64),
                        unlocked(){
                                return hasUpgrade("g", 51) || hasUnlockedRow(3)
                        },
                },
                53: {
                        title: "Blue",
                        description: "Antimatter Gain buyables also gives free levels to Base Incrementy Gain", 
                        cost: new Decimal(1e68),
                        unlocked(){
                                return hasUpgrade("g", 52) || hasUnlockedRow(3)
                        },
                },
                54: {
                        title: "Blew",
                        description: "Amoeba Gain buyables boost its effect base and give free levels to Particle Generation", 
                        cost: new Decimal(1e84),
                        unlocked(){
                                return hasUpgrade("g", 53) || hasUnlockedRow(3)
                        },
                },
                15: {
                        title: "How",
                        description: "Every third Base Incrementy Gain buyable gives an additional free level to Neutrino Generation", 
                        cost: new Decimal(3e100),
                        unlocked(){
                                return hasChallenge("q", 12) || hasUnlockedRow(3)
                        },
                },
                25: {
                        title: "Do",
                        description: "The above upgrade gives free additional levels to Neutrino Generation no matter what", 
                        cost: new Decimal(1e113),
                        unlocked(){
                                return player.n.buyables[11].gte(103) || hasUnlockedRow(3)
                        },
                },
                35: {
                        title: "We",
                        description: "Each upgrade in this column gives a free Energy Boost buyable", 
                        cost: new Decimal(1e129),
                        unlocked(){
                                return hasUpgrade("g", 25) || hasUnlockedRow(3)
                        },
                },
                45: {
                        title: "Name",
                        description: "Amoeba Gain buyables give free Neutrino Generation buyables", 
                        cost: new Decimal(1e137),
                        unlocked(){
                                return hasUpgrade("g", 35) || hasUnlockedRow(3)
                        },
                },
                55: {
                        title: "These?",
                        description: "Amoeba Gain buyables base is squared", 
                        cost: new Decimal(5e140),
                        unlocked(){
                                return hasUpgrade("am", 15) || hasUnlockedRow(3)
                        },
                },
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                let a = hasUpgrade("p", 21) || hasUnlockedRow(3)
                return a && !hasUpgrade("pi", 32)
        },
        tabFormat: ["main-display",
                ["display-text", function(){return "You are getting " + format(layers.g.getResetGain()) + " Gluons per second (based on particles)"}],
                "blank",
                "blank", 
                "upgrades"],
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 1) return

                //upgrades
                let keep = []
                if (!hasUpgrade("s", 15)) player.g.upgrades = filter(player.g.upgrades, keep)

                //resource
                player.g.points = new Decimal(0)
                player.g.best = new Decimal(0)
        },
})

addLayer("q", {
        name: "Quarks", 
        symbol: "Q", 
        position: 4,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
        }},
        color: "#A40130",
        requires: Decimal.pow(10, 1),
        resource: "Quarks",
        baseAmount() {return player.p.points},
        branches: [],
        type: "custom", 
        getResetGain() {
                if (!hasUpgrade("p", 31)) return new Decimal(0)
                let amt = layers.q.baseAmount()
                let exp = layers.q.getGainExp()
                let base = amt.div(1.5e198).pow(exp)
                if (base.lt(1)) return new Decimal(0)
                base = base.minus(1)
                if (base.lt(1)) base = base.cbrt()

                let ret = base.times(layers.q.getGainMult())
                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                return ret
        },
        getGainExp(){
                let x = new Decimal(.5)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                return x
        },
        getGainMult(){
                let x = new Decimal(1)
                if (hasIUpg(25)) x = x.times(2)
                x = x.times(layers.p.buyables[12].effect())
                x = x.times(layers.sp.effect()[1])
                return x
        },
        getChallGoalExp(){
                let q = player.q.points
                if (q.gt(100)) q = q.log10().times(50)
                if (q.gt(1e4)) q = q.log10().times(2.5).pow(4)
                if (q.gt(1e10)) q = q.log10().pow(10)
                return q.plus(10).log10().plus(9).log10().pow(-1)
        },
        prestigeButtonText(){
                return "if you see this bug"
        },
        canReset(){
                return false
        },
        update(diff){
                if (hasUpgrade("pi", 32)) {
                        player.q.points = new Decimal(0)
                        player.q.best = new Decimal(0)
                        return
                }
                let gain = layers.q.getResetGain()
                player.q.points = player.q.points.plus(gain.times(diff))

                if (!player.q.best) player.q.best = new Decimal(0)
                player.q.best = player.q.best.max(player.q.points)
        },
        challenges: {
                rows: 2,
                cols: 2,
                11: {
                        name: "Son",
                        challengeDescription: "Square root Incrementy gain",
                        rewardDescription: "Unlock a 5th column of Incrementy Upgrades",
                        unlocked(){
                                return true
                        },
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        goal(){
                                let exp = layers.q.getChallGoalExp()
                                return Decimal.pow(10, 7125).pow(exp)
                        },
                },
                12: {
                        name: "Sun",
                        challengeDescription: "Cube root Incrementy gain",
                        rewardDescription: "Unlock a 5th column of Gluon Upgrades",
                        unlocked(){
                                return true
                        },
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        goal(){
                                let exp = layers.q.getChallGoalExp()
                                return Decimal.pow(10, 4765).pow(exp)
                        },
                },
                21: {
                        name: "Pole",
                        challengeDescription: "Fourth root Incrementy gain",
                        rewardDescription: "Unlock a 5th column of Antimatter Upgrades",
                        unlocked(){
                                return true
                        },
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        goal(){
                                let exp = layers.q.getChallGoalExp()
                                return Decimal.pow(10, 3855).pow(exp)
                        },
                },
                22: {
                        name: "Poll",
                        challengeDescription: "Fifth root Incrementy gain",
                        rewardDescription: "Unlock a 5th column of Particle Upgrades",
                        unlocked(){
                                return true
                        },
                        currencyDisplayName: "Incrementy",
                        currencyInternalName: "points",
                        currencyLayer: "i",
                        goal(){
                                let exp = layers.q.getChallGoalExp()
                                return Decimal.pow(10, 3270).pow(exp)
                        },
                },
        },
        row: 1, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                let a = hasUpgrade("p", 31) || hasUnlockedRow(3)
                return a && !hasUpgrade("pi", 32)
        },
        tabFormat: ["main-display",
                ["display-text", function(){return "You are getting " + format(layers.q.getResetGain()) + " Quarks per second (based on particles)"}],
                ["display-text", function(){return "Your Quark amount raises Quark challenge goals to the power of " + format(layers.q.getChallGoalExp(), 6)}],
                "blank",
                "blank", 
                "challenges"],
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 1) return

                if (layers[layer].row >= 3 && !hasUpgrade("s", 14)) {
                        player.q.challenges[11] = 0
                        player.q.challenges[12] = 0
                        player.q.challenges[21] = 0
                        player.q.challenges[22] = 0
                }

                //resource
                player.q.points = new Decimal(0)
                player.q.best = new Decimal(0)
        },
})

addLayer("s", {
        name: "Shard", 
        symbol: "S", 
        position: 2,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
        }},
        color: "#1346DF",
        requires: Decimal.pow(10, 502), 
        resource: "Shards",
        baseAmount() {return player.p.points}, 
        branches: ["p"],
        type: "custom", 
        effect(){
                let amt = player.s.points
                if (amt.lt(1) && player.s.best.plus(player.sp.best).gte(1)) amt = new Decimal(1)
                if (amt.lt(9)) return Decimal.pow(1e4, amt.root(3))
                let ret = amt.pow(10)
                return ret
        },
        effectDescription(){
                let a = "which multiplies incrementy gain by " + formatWhole(layers.s.effect()) + "."
                let b = " The effect is always at least 10,000 once you have Shard reset once"
                if (player.s.best.gt(100)) return a
                return a + b 
        },
        getResetGain() {
                let amt = layers.s.baseAmount()
                let pre = layers.s.getGainMultPre()
                let exp = layers.s.getGainExp()
                let pst = layers.s.getGainMultPost()
                let ret = amt.div("1e500").max(1).log10().div(2).times(pre).pow(exp).times(pst)
                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                return ret.floor()
        },
        getGainExp(){
                let x = new Decimal(.5)
                if (hasUpgrade("s", 33)) x = x.times(3)
                if (hasUpgrade("s", 43)) x = x.times(3)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                x = x.times(layers.o.buyables[32].effect())
                return x
        },
        getGainMultPre(){
                let x = new Decimal(1)
                return x
        },
        getGainMultPost(){
                let x = new Decimal(1)
                if (hasUpgrade("s", 34)) x = x.times(Decimal.pow(2, layers.n.buyables[33].extra()))
                x = x.times(layers.sp.effect()[1])
                if (hasUpgrade("s", 44)) x = x.times(player.i.points.max(1).pow(.0001).pow(.0002))
                x = x.times(layers.sp.challenges[12].rewardEffect())
                if (hasUpgrade("sp", 33)) x = x.times(Decimal.pow(player.sp.points.max(1), challengeCompletions("sp", 21)))
                if (hasMilestone("o", 2)) x = x.times(player.o.total.max(1))
                if (hasMilestone("o", 5)) x = x.times(layers.o.effect())
                return x
        },
        prestigeButtonText(){
                let gain = layers.s.getResetGain()
                let start =  "Reset to gain " + formatWhole(gain) + " Shards<br>"
                let pre = layers.s.getGainMultPre()
                let exp = layers.s.getGainExp()
                let pst = layers.s.getGainMultPost()
                let nextAt = "Next at " + format(Decimal.pow(10, gain.plus(1).div(pst).root(exp).div(pre).times(2).plus(500))) + " particles"
                return start + nextAt
        },
        canReset(){
                return layers.s.getResetGain().gt(0) && hasUpgrade("p", 35)
        },
        update(diff){
                if (!player.s.best) player.s.best = new Decimal(0)
                player.s.best = player.s.best.max(player.s.points)
                if (hasUpgrade("s", 31)) player.s.points = player.s.points.plus(layers.s.getResetGain().times(diff))
        },
        upgrades: {
                rows: 5,
                cols: 5,
                11: {
                        title: "Lead",
                        description: "Gain a free Incrementy Stamina level, 10x Antimatter, and 2x Neutrinos",
                        cost: new Decimal(1),
                        unlocked(){
                                return true
                        },
                },
                12: {
                        title: "Led",
                        description: "Gain a free Incrementy Stamina level, gain 100x Matter and Amoeba, and Shard upgrades multiply Neutrino gain",
                        cost: new Decimal(1),
                        unlocked(){
                                return true
                        },
                },
                13: {
                        title: "Lynx",
                        description: "Add one to the base of Neutrino Generation and Incrementy Speed, make particle gain 100x faster but cap it at 1 second",
                        cost: new Decimal(1),
                        unlocked(){
                                return (hasUpgrade("s", 12) && hasUpgrade("s", 11)) || hasUnlockedRow(4)
                        },
                },
                14: {
                        title: "Links",
                        description: "Keep challenges and upgrades from AM, M, and Q, and buy one of each Neutrino Buyables every second",
                        cost: new Decimal(1),
                        unlocked(){
                                return hasUpgrade("s", 13) || hasUnlockedRow(4)
                        },
                },
                15: {
                        title: "Altar",
                        description: "Gain a free Amoeba Gain buyable and keep G and A upgrades",
                        cost: new Decimal(2),
                        unlocked(){
                                return hasUpgrade("s", 14) || hasUnlockedRow(4)
                        },
                },
                21: {
                        title: "Alter",
                        description: "Keep P and E upgrades and A milestones, add 1 to Particle per second production",
                        cost: new Decimal(4),
                        unlocked(){
                                return hasUpgrade("s", 15) || hasUnlockedRow(4)
                        },
                },
                22: {
                        title: "Wain",
                        description: "Each Shard Upgrade gives a free level to each Incrementy buyable",
                        cost: new Decimal(6),
                        unlocked(){
                                return hasUpgrade("s", 21) || hasUnlockedRow(4)
                        },
                },
                23: {
                        title: "Wane",
                        description: "Particle Simulation levels raise its base to its amount, Particle Simulation effects Gluons, and Links can buy 10",
                        cost: new Decimal(8),
                        unlocked(){
                                return hasUpgrade("s", 22) || hasUnlockedRow(4)
                        },
                },
                24: {
                        title: "Rap",
                        description: "Matter Gain gives levels to Base Incrementy Gain",
                        cost: new Decimal(10),
                        unlocked(){
                                return hasUpgrade("s", 23) || hasUnlockedRow(4)
                        },
                },
                25: {
                        title: "Wrap",
                        description: "Particle Boost give levels to Neutrino Gain and automatically buy Particle Upgrades once per second",
                        cost: new Decimal(20),
                        unlocked(){
                                return hasUpgrade("s", 24) || hasUnlockedRow(4)
                        },
                },
                31: {
                        title: "Wring", 
                        description: "Remove the ability to Shard Prestige but gain 100% of Shards on prestige per second",
                        cost: new Decimal(50),
                        unlocked(){
                                return hasUpgrade("s", 25) || hasUnlockedRow(4)
                        },
                },
                32: {
                        title: "Ring",
                        description: "Antimatter Gain buyables cubed adds to their original base",
                        cost: new Decimal(1000),
                        unlocked(){
                                return hasUpgrade("s", 31) || hasUnlockedRow(4)
                        },
                },
                33: {
                        title: "Lapse",
                        description: "Cube Shard gain and Particle Simulation gives free levels to Particle Accerelation",
                        cost() {
                                return hasMilestone("c", 5) ? new Decimal(0) : new Decimal("1e2374")
                        },
                        currencyDisplayName: "Antimatter",
                        currencyInternalName: "points",
                        currencyLayer: "am",
                        unlocked(){
                                return hasUpgrade("s", 32) || hasUnlockedRow(4)
                        },
                },
                34: {
                        title: "Laps",
                        description: "Each extra Amoeba Gain buyable doubles Shard gain and Particle Collision gives free levels to Particle Accerelation",
                        cost: new Decimal(3e5),
                        unlocked(){
                                return hasUpgrade("s", 33) || hasUnlockedRow(4)
                        },
                },
                35: {
                        title: "Help?", 
                        description: "Particle Simulation gives free levels to Particle Collision and begin generation of Bosons",
                        cost: new Decimal(2e8),
                        unlocked(){
                                return hasUpgrade("s", 34) || hasUnlockedRow(4)
                        },
                },
                41: {
                        title: "Hoard", 
                        description: "Links and Wrap buy ten and four times more and double Super Prestige point gain",
                        cost: new Decimal(1e69),
                        unlocked(){
                                return (hasUpgrade("s", 35) && hasMilestone("sp", 5)) || hasUpgrade("s", 41) || hasUnlockedRow(4)
                        },
                },
                42: {
                        title: "Horde", 
                        description: "Cube Super Prestige Point gain and each Shard upgrade pushes Incrementy Stamina softcap back by 1",
                        cost: new Decimal(50),
                        currencyDisplayName: "Super Prestige Points",
                        currencyInternalName: "points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("s", 41) || hasUnlockedRow(4)
                        },
                },
                43: {
                        title: "Forth", 
                        description: "Incrementy raised to .01% multiplies Particle gain and cube base Shard gain",
                        cost: new Decimal(50),
                        currencyDisplayName: "Super Prestige Points",
                        currencyInternalName: "points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("s", 42) || hasUnlockedRow(4)
                        },
                },
                44: {
                        title: "Fourth", 
                        description: "The previous upgrade works at .02% of the rate for Shards",
                        cost: new Decimal(400),
                        currencyDisplayName: "Super Prestige Points",
                        currencyInternalName: "points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("s", 43) || hasUnlockedRow(4)
                        },
                },
                45: {
                        title: "Ceiling", 
                        description: "The previous upgrade works at 1% of the rate for Super Prestige Points",
                        cost: new Decimal(1e97),
                        unlocked(){
                                return hasUpgrade("s", 44) || hasUnlockedRow(4)
                        },
                },
                51: {
                        title: "Sealing", 
                        description: "Incrementy boosts Super Prestige Point gain",
                        effect(){
                                return player.i.points.max(10).log10().max(10).log10().div(2).max(1)
                        },
                        cost: new Decimal(1e99),
                        unlocked(){
                                return hasUpgrade("s", 45) || hasUnlockedRow(4)
                        },
                },
                52: {
                        title: "Daze", 
                        description: "Each upgrade in this row doubles Super Prestige Point gain",
                        cost: new Decimal(1e103),
                        unlocked(){
                                return hasUpgrade("s", 51) || hasUnlockedRow(4)
                        },
                },
                53: {
                        title: "Days", 
                        description: "Square Super Prestige Point gain",
                        cost: new Decimal(5e107),
                        unlocked(){
                                return hasUpgrade("s", 52) || hasUnlockedRow(4)
                        },
                },
                54: {
                        title: "Deviser", 
                        description: "Always have at least 1000 Particles per second",
                        cost: new Decimal(5e123),
                        unlocked(){
                                return hasUpgrade("s", 53) || hasUnlockedRow(4)
                        },
                },
                55: {
                        title: "Devisor", 
                        description: "<b>Rite</b> can buy ten times more and unlock Obfuscations if you have Super Prestige Reset 25 times",
                        cost: new Decimal(5e129),
                        unlocked(){
                                return hasUpgrade("s", 54) || hasUnlockedRow(4)
                        },
                },

        }, 

        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                return player.s.best.gt(0) || hasUpgrade("p", 35) || player.sp.best.gt(0) || hasUnlockedRow(4)
        },
        tabFormat: ["main-display",
                ["display-text", function(){return hasUpgrade("s", 31) ? "You are getting " + format(layers.s.getResetGain()) + " Shards per second (based on particles)" : ""}],
                ["prestige-button", "", function (){ return hasUpgrade("s", 31) ? {'display': 'none'} : {}}],
                "blank", 
                "upgrades"],
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 3 && layer != "sp") return

                //upgrades
                let keep = []
                let j = Math.min(25, player.sp.times)
                if (hasUpgrade("o", 14)) j = Math.min(25, j + 2 * player.o.times)
                if (hasMilestone("sp", 1) || hasUpgrade("o", 14)) {
                        keep = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45,51,52,53,54,55].slice(0, j)
                }
                player.s.upgrades = filter(player.s.upgrades, keep)

                //resource
                player.s.points = new Decimal(0)
                player.s.best = new Decimal(0)
        },
})

addLayer("b", {
        name: "Bosons", 
        symbol: "B", 
        position: 1,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
                tokens: new Decimal(0),
        }},
        color: "#D346DF",
        requires: Decimal.pow(10, 694), 
        resource: "Bosons",
        baseAmount() {return player.p.points}, 
        branches: ["p", "g", "q"],
        type: "custom", 
        effect(){
                let amt = player.b.points
                let ret = amt.times(9).plus(1).log10()
                if (hasUpgrade("b", 42)) {
                        if (ret.gt(30)) ret = ret.times(3.3).plus(1).log10().pow(4).plus(14)
                } else if (hasUpgrade("b", 13)) {
                        if (ret.gt(20)) ret = ret.times(5).log10().pow(4).times(1.25)
                } else if (ret.gt(10)) ret = ret.log10().times(10)

                return ret
        },
        effectDescription(){
                let a = "which multiplies Incrementy gain by Amoebas ^" + format(layers.b.effect()) + "."
                return a 
        },
        getResetGain() {
                if (!hasUpgrade("s", 35)) return new Decimal(0)
                let amt = layers.b.baseAmount()
                let pre = layers.b.getGainMultPre()
                let exp = layers.b.getGainExp()
                let pst = layers.b.getGainMultPost()
                let ret = amt.div("1e692").max(1).log10().div(2).times(pre).pow(exp).times(pst)
                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                return ret
        },
        getGainExp(){
                let x = new Decimal(1.5)
                if (hasUpgrade("b", 14)) x = x.times(Decimal.pow(getBChallengeTotal(), .5).max(1))
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                return x
        },
        getGainMultPre(){
                let x = new Decimal(1)
                return x
        },
        getGainMultPost(){
                let x = new Decimal(5e5)
                x = x.times(layers.sp.effect()[1])
                if (hasUpgrade("sp", 31)) x = x.times(player.sp.points.max(1))
                return x
        },
        prestigeButtonText(){
                return "lul"
                /*
                let gain = layers.s.getResetGain()
                let start =  "Reset to gain " + formatWhole(gain) + " Shards<br>"
                let pre = layers.s.getGainMultPre()
                let exp = layers.s.getGainExp()
                let pst = layers.s.getGainMultPost()
                let nextAt = "Next at " + format(Decimal.pow(10, gain.plus(1).div(pst).root(exp).div(pre).times(2).plus(500))) + " particles"
                return start + nextAt
                */
        },
        canReset(){
                return false
        },
        update(diff){
                if (hasUpgrade("pi", 32)) {
                        player.b.points = new Decimal(0)
                        player.b.best = new Decimal(0)
                        player.b.tokens = new Decimal(0)
                        return 
                }
                if (!player.s.best) player.b.best = new Decimal(0)
                player.b.best = player.b.best.max(player.b.points)
                player.b.points = player.b.points.plus(layers.b.getResetGain().times(diff))
                player.b.tokens = player.b.tokens.plus(layers.b.tokenGain().times(diff))
        },
        challengesUnlocked(){
                let ret = 1
                if (hasUpgrade("b", 13)) ret = Math.max(2, ret)
                if (hasUpgrade("b", 31)) ret = Math.max(3, ret)
                if (hasUpgrade("b", 33)) ret = Math.max(4, ret)
                return ret
        },
        tokenGain(){
                let ret = Decimal.pow(getBChallengeTotal(), 2)
                if (hasUpgrade("b", 13)) ret = ret.times(Decimal.pow(2, getBChallengeTotal()))
                if (hasUpgrade("b", 24)) ret = ret.times(Decimal.pow(2, getBChallengeTotal()))
                if (hasUpgrade("b", 21)) ret = ret.times(Decimal.max(1, challengeCompletions("b", 11)))
                ret = ret.times(Decimal.pow(3, challengeCompletions("b", 22)))
                ret = ret.times(layers.o.effect())
                if (hasMilestone("c", 2)) ret = ret.times(layers.c.effect())

                if (hasMilestone("sp", 3)) ret = ret.pow(1.1).times(10)
                if (devSpeedUp) ret = ret.pow(1.1).times(10)
                ret = doMilestoneC1Buff(ret)
                return ret
        },
        challenges:{
                rows: 2,
                cols: 2,
                11: {
                        name: "Been", 
                        challengeDescription: "Incrementy Stamina effect is linear instead of exponential",
                        rewardDescription: "Add to the base of Incrementy Strength and Neutrino generation based on total Boson Challenge completions",
                        rewardEffect(){
                                let tot = new Decimal(getBChallengeTotal() + 1)
                                let comps = challengeCompletions("b", 11)

                                if (tot.gt(3)) tot = tot.log(3).plus(2)
                                if (tot.gt(4)) tot = tot.log(4).plus(3)
                                if (comps >= 4) comps = Math.log10(comps * 33 + 1) + 1

                                let ret = Decimal.pow(tot, comps).minus(1)

                                if (ret.gt(50)) ret = ret.times(2).log10().times(25)

                                return ret
                        },
                        rewardDisplay(){
                                let comps = "Because you have " + formatWhole(challengeCompletions("b", 11)) + " challenge completions, "
                                let eff = "add " + format(layers.b.challenges[11].rewardEffect()) + " to the base."
                                return comps + eff
                        },
                        unlocked(){
                                return layers.b.challengesUnlocked() >= 1 || hasUnlockedRow(4)
                        },
                        goal(){
                                let comps = challengeCompletions("b", 11)
                                let base = 91.3e3
                                base += comps * (comps + 9) * 800
                                if (comps >= 3) base += Math.pow(comps, 4) * 136
                                if (comps >= 5) base += -8550
                                if (comps == 6) base += 8994
                                if (comps == 7) base += 1114
                                if (comps == 8) base += -76106
                                if (comps >= 9) base = 954e3

                                if (hasMilestone("o", 0)) base *= Math.pow(.98, player.o.milestones.length)
                                return Decimal.pow(10, base)
                        },
                        currencyInternalName: "points",
                        completionLimit: 10,
                },
                12: {
                        name: "Bin", 
                        challengeDescription() {
                                return "Base Incrementy Gain buyable base is raised to the " + format(new Decimal(2).div(3 + challengeCompletions("b", 12)), 3)
                        },
                        rewardDescription: "Incrementy Stamina gives free levels to Incrementy Speed",
                        rewardEffect(){
                                let comps = challengeCompletions("b", 12)

                                let ret = Decimal.pow(comps + 8, 1.5).times(2)

                                if (comps == 0) ret = new Decimal(0)

                                return ret
                        },
                        rewardDisplay(){
                                let comps = "Because you have " + formatWhole(challengeCompletions("b", 12)) + " challenge completions, "
                                let eff = "you get " + format(layers.b.challenges[12].rewardEffect()) + " free Speed levels per Stamina."
                                return comps + eff
                        },
                        unlocked(){
                                return layers.b.challengesUnlocked() >= 2 || hasUnlockedRow(4)
                        },
                        goal(){
                                let comps = challengeCompletions("b", 12)
                                let base = 1.86e6
                                if (comps >= 1) base = 1.577e6
                                if (comps >= 2) base = 1.483e6
                                if (comps >= 3) base = 1.302e6
                                if (comps >= 4) base = 1.304e6
                                if (comps >= 5) base = 1.574e6
                                if (comps >= 6) base = 1.607e6
                                if (comps >= 7) base = 1.827e6
                                if (comps >= 8) base = 1.862e6
                                if (comps >= 9) base = 1.896e6

                                if (hasMilestone("o", 0)) base *= Math.pow(.98, player.o.milestones.length)
                                return Decimal.pow(10, base)
                        },
                        currencyInternalName: "points",
                        completionLimit: 10,
                },
                21: {
                        name: "Band", 
                        challengeDescription: "Base Incrementy Gain buyable effect base is 1",
                        rewardDescription: "Log10 of your Quarks raised to a power boosts Amoeba gain",
                        rewardEffect(){
                                let comps = challengeCompletions("b", 21)

                                let ret = Decimal.pow(comps * 5 + 11, 1.5)

                                if (comps == 0) ret = new Decimal(0)

                                return ret
                        },
                        rewardDisplay(){
                                let comps = "Because you have " + formatWhole(challengeCompletions("b", 21)) + " challenge completions, "
                                let eff = "you get a log(Quarks)^" + format(layers.b.challenges[21].rewardEffect()) + " multiplier to Amoeba gain."
                                return comps + eff
                        },
                        unlocked(){
                                return layers.b.challengesUnlocked() >= 3 || hasUnlockedRow(4)
                        },
                        goal(){
                                let comps = challengeCompletions("b", 21)
                                let base = 483e3
                                base += comps ** 2 * 13e3
                                if (comps >= 2) base += 16e3 * comps
                                if (comps >= 3) base += 16e3
                                if (comps >= 4) base += 24e3
                                if (comps >= 5) base += 14.4e3 * comps
                                if (comps >= 6) base += -30.4e3
                                if (comps >= 7) base += -92.4e3
                                if (comps >= 8) base += -125.4e3
                                if (comps >= 9) base += -59.4e3
                                if (devSpeedUp) base = Math.floor(base ** .995)

                                if (hasMilestone("o", 0)) base *= Math.pow(.98, player.o.milestones.length)
                                return Decimal.pow(10, base)
                        },
                        currencyInternalName: "points",
                        completionLimit: 10,
                },
                22: {
                        name: "Banned", 
                        challengeDescription: "Be in all 3 prior Challenges at Once",
                        rewardDescription: "Add to the Particle Generation base, and get extra Particle Simulation levels",
                        rewardEffect(){
                                let comps = challengeCompletions("b", 22)

                                let ret = Decimal.pow(comps, 2).plus(9)

                                if (comps == 0) ret = new Decimal(0)

                                return [ret, comps * (comps + 3) / 2 + comps * 4]
                        },
                        rewardDisplay(){
                                let comps = "Because you have " + formatWhole(challengeCompletions("b", 22)) + " challenge completions, "
                                let eff = "you get +" + format(layers.b.challenges[22].rewardEffect()[0]) + " to the Particle Generation base and "
                                let eff2 =  formatWhole(layers.b.challenges[22].rewardEffect()[1]) + " extra Particle Simulation levels."
                                return comps + eff + eff2
                        },
                        unlocked(){
                                return layers.b.challengesUnlocked() >= 4 || hasUnlockedRow(4)
                        },
                        goal(){
                                let comps = challengeCompletions("b", 22)
                                let base = 850e3
                                base += comps ** 2 * 15e3
                                base += comps * 38e3
                                if (comps >= 2) base += -16e3
                                if (comps >= 3) base += -66e3
                                if (comps >= 4) base += -68e3
                                if (comps >= 5) base += -74e3
                                if (comps >= 6) base += -104e3
                                if (comps >= 7) base += -164e3
                                if (comps >= 8) base += -144e3
                                if (comps >= 9) base += -211e3
                                if (devSpeedUp) base = Math.floor(base ** .995)

                                if (hasMilestone("o", 0)) base *= Math.pow(.98, player.o.milestones.length)
                                return Decimal.pow(10, base)
                        },
                        currencyInternalName: "points",
                        completionLimit: 10,
                        countsAs: [11, 12, 21],
                },
        },
        upgrades: {
                rows: 4,
                cols: 4, 
                11: {
                        title: "Few",
                        description: "Uncap Hall and Incrementy Stamina gives free levels to Incrementy Boost",
                        cost: new Decimal(30),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return challengeCompletions("b", 11) > 0 || hasUnlockedRow(4)
                        },
                },
                12: {
                        title: "Phew",
                        description: "Been completions add to the Amoeba Gain base and give free Amoeba Gain levels",
                        cost: new Decimal(300),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 11) || hasUnlockedRow(4)
                        },
                },
                13: {
                        title: "Maze", 
                        description: "Push the Boson softcap to 20, each challenge completion doubles token gain, and unlock the second challenge",
                        cost: new Decimal(1000),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 12) || hasUnlockedRow(4)
                        },
                },
                14: {
                        title: "Maize",
                        description: "Boson gain is rasied to the square root of Boson Challenge completions",
                        cost: new Decimal(5e5),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 13) || hasUnlockedRow(4)
                        },
                },
                21: {
                        title: "Load",
                        description: "Been Completions give Particle Collision levels and multiply token gain",
                        cost: new Decimal(1e6),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return (hasUpgrade("b", 14) && getBChallengeTotal() >= 7) || hasUnlockedRow(4)
                        },
                },
                22: {
                        title: "Lode",
                        description: "Been effects Particle Generation at cube root the rate",
                        cost: new Decimal(1e7),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 21) || hasUnlockedRow(4)
                        },
                },
                23: {
                        title: "Born",
                        description: "Raise Particle Collision base to 1 + Bin completions and <b>Rite</b> buys 5,000",
                        cost: new Decimal(4e7),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 22) || hasUnlockedRow(4)
                        },
                },
                24: {
                        title: "Borne",
                        description: "Bin completions give free Particle Simulation levels and each Boson Challenge doubles token gain",
                        cost: new Decimal(1e8),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 23) || hasUnlockedRow(4)
                        },
                },
                31: {
                        title: "Bawl",
                        description: "Unlock the third challenge and Bin reward effects Strength",
                        cost: new Decimal(2e12),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 24) || hasUnlockedRow(4)
                        },
                },
                32: {
                        title: "Ball",
                        description: "Band completions give 20 free Antimatter Gain buyables",
                        cost: new Decimal(2e14),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 31) || hasUnlockedRow(4)
                        },
                },
                33: {
                        title: "Dew",
                        description: "Been completions give free Particle Simulation levels and unlock the fourth challenge",
                        cost: new Decimal(1e17),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 32) || hasUnlockedRow(4)
                        },
                },
                34: {
                        title: "Due",
                        description: "Band completions give free Particle Simulation level",
                        cost: new Decimal(1e18),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 33) || hasUnlockedRow(4)
                        },
                }, 
                41: {
                        title: "Rye",
                        description: "Band completions give Particle Collision levels and Particle Collision effects Antimatter gain",
                        cost: new Decimal(5e20),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 34) || hasUnlockedRow(4)
                        },
                }, 
                42: {
                        title: "Wry",
                        description: "Push the Boson effect softcap to 30",
                        cost: new Decimal(5e23),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 41) || hasUnlockedRow(4)
                        },
                }, 
                43: {
                        title: "Throne",
                        description: "Each Banned completion increases the Incrementy Stamina softcap start by one",
                        cost: new Decimal(5e24),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 42) || hasUnlockedRow(4)
                        },
                },
                44: {
                        title: "Thrown",
                        description: "Multiplicatively increase the P Acceleration base by 5% per Banned completion per P Simulation level",
                        cost: new Decimal(5e27),
                        currencyDisplayName: "Tokens",
                        currencyInternalName: "tokens",
                        currencyLayer: "b",
                        unlocked(){
                                return hasUpgrade("b", 43) || hasUnlockedRow(4)
                        },
                }, 
        },
        row: 0, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                let a = player.b.best.gt(0) || hasUpgrade("s", 35) || player.sp.best.gt(0) || hasUnlockedRow(4)
                return a && !hasUpgrade("pi", 32)
        },
        tabFormat: {
                "Challenges": {
                        content: [
                                "main-display",
                                ["display-text", function(){
                                        let a = "Gain is based Particles. Starting challenges resets Bosons and Incrementy." 
                                        let b = "<br>You are getting " + format(layers.b.getResetGain()) + " Bosons per second"
                                        if (getBChallengeTotal() >= 40) a = ""
                                        return a+b
                                }],
                                "challenges"
                        ],
                        unlocked(){
                                return true
                        },
                }, 
                "Upgrades": {
                        content: [
                                ["display-text", function(){
                                        let a = "You have <h3>" + formatWhole(player.b.tokens) + "</h3> tokens"
                                        return a
                                }],
                                ["display-text", function(){
                                        let a = "You are gaining " + format(layers.b.tokenGain()) + " tokens per second"
                                        return a
                                }],
                                "blank",
                                "upgrades"
                        ],
                        unlocked(){
                                return challengeCompletions("b", 11) > 0 || player.pi.best.gt(0) || hasUnlockedRow(4)
                        },
                }
        },
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 0) return

                //only reset challenges if row >= 3
                if (layers[layer].row >= 3) {
                        let keep = []
                        if (!hasMilestone("sp", 5)) player.b.upgrades = filter(player.b.upgrades, keep)

                        if (!hasMilestone("o", 4)){
                                if (!hasMilestone("sp", 4)) player.b.challenges[11] = 0
                                if (!hasMilestone("sp", 4)) player.b.challenges[12] = 0
                                if (!hasMilestone("sp", 5)) player.b.challenges[21] = 0
                                if (!hasMilestone("sp", 5)) player.b.challenges[22] = 0
                        }       
                }

                //resource
                player.b.points = new Decimal(0)
                player.b.best = new Decimal(0)
                if (layer == "sp") player.b.tokens = new  Decimal(0)
        },
})

addLayer("sp", {
        name: "Superprestige", 
        symbol: "SP", 
        position: 2,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
                total: new Decimal(0),
                time: 0,
                times: 0,
                chall1points: new Decimal(0),
                chall2points: new Decimal(0),
                chall3points: new Decimal(0),
                chall4points: new Decimal(0),
        }},
        color: "#1CA2E8",
        requires: Decimal.pow(10, 65), 
        resource: "Super Prestige Points",
        baseAmount() {return player.s.points}, 
        branches: ["s"],
        type: "custom", 
        effect(forceSet){
                let amt = player.sp.best
                if (forceSet != undefined) amt = new Decimal(forceSet)
                if (amt.gt(10)) amt = amt.times(10).sqrt()
                if (amt.gt(20)) amt = amt.times(5).log10().times(10)
                if (amt.gt(40)) amt = amt.div(40).root(3).times(40)
                if (amt.gt(100)) amt = amt.log10().times(50)
                if (amt.gt(300)) amt = new Decimal(300)
                if (forceSet != undefined) return amt
                let a1 = amt.floor()

                let a2 = amt.times(10).max(1).pow(2)
                if (devSpeedUp) a2 = a2.times(10)
                if (hasUpgrade("o", 13)) a2 = a2.times(2)
                a2 = a2.times(layers.c.effect())
                return [a1, a2]
        },
        effectDescription(){
                let eff = layers.sp.effect()
                let a = "which increases the Incrementy Stamina softcap by " + formatWhole(eff[0]) + " ("
                let c = eff[0].plus(1)
                if (c.gt(100)) c = Decimal.pow(10, c.div(50))
                if (c.gt(40))  c = c.div(40).pow(3).times(40)
                if (c.gt(20))  c = Decimal.pow(10, c.div(10)).div(5)
                if (c.gt(10))  c = c.div(10).pow(2).times(10)
                let mid = "next at " + formatWhole(c.ceil())
                if (eff[0].plus(1).gt(300)) mid = "hardcapped"
                let b = ") and all previous prestige resources by " + format(eff[1]) + " (based on best Super Prestige Points)."
                return a + mid + b
        },
        getResetGain() {
                let amt = layers.sp.baseAmount()
                let pre = layers.sp.getGainMultPre()
                let exp = layers.sp.getGainExp()
                let pst = layers.sp.getGainMultPost()
                
                let ret = amt.div(1e64).max(1).log10().times(pre).pow(exp).times(pst)

                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                if (ret.gt("ee1000")) ret = Decimal.pow(10, Decimal.pow(10, ret.log10().log10().div(1000).pow(.999).times(1000)))

                return ret.floor()
        },
        getGainExp(){
                let x = new Decimal(.25)
                if (hasUpgrade("s", 42)) x = x.times(3)
                if (hasUpgrade("s", 53)) x = x.times(2)
                if (hasUpgrade("sp", 35)) x = x.times(1.01)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                x = x.times(layers.o.buyables[22].effect())
                return x
        },
        getGainMultPre(){
                let x = new Decimal(1)
                if (devSpeedUp) x = x.times(Decimal.pow(1.5, Math.sqrt(player.sp.upgrades.length + 1)))
                return x
        },
        getGainMultPost(){
                let x = new Decimal(1)
                if (hasUpgrade("s", 41)) x = x.times(2)
                if (hasUpgrade("s", 45)) x = x.times(player.i.points.max(1).pow(.0001).pow(.0002).pow(.01))
                if (hasUpgrade("s", 51)) x = x.times(upgradeEffect("s", 51))
                if (hasUpgrade("s", 52)) {
                        if (hasUpgrade("s", 51)) x = x.times(2)
                        x = x.times(2)
                        if (hasUpgrade("s", 53)) x = x.times(2)
                        if (hasUpgrade("s", 54)) x = x.times(2)
                        if (hasUpgrade("s", 55)) x = x.times(2)
                }
                x = x.times(layers.sp.challenges[11].rewardEffect())
                if (hasUpgrade("sp", 11)) x = x.times(upgradeEffect("sp", 11))
                if (hasUpgrade("sp", 23)) x = x.times(player.sp.chall3points.max(1))
                if (hasUpgrade("sp", 32)) x = x.times(Decimal.pow(50, challengeCompletions("sp", 22)))
                if (hasUpgrade("sp", 34)) x = x.times(player.sp.chall4points.max(1))
                if (hasUpgrade("sp", 15)) {
                        let a = 1
                        if (hasUpgrade("sp", 25)) a ++
                        if (hasUpgrade("sp", 35)) a ++
                        if (hasUpgrade("sp", 45)) a ++
                        x = x.times(Decimal.pow(challengeCompletions("sp", 11), a).max(1))
                }
                if (hasUpgrade("pi", 12)) x = x.times(upgradeEffect("pi", 12))
                if (hasMilestone("pi", 3)) x = x.times(Decimal.pow(2, player.pi.upgrades.length ** 2))
                if (hasUpgrade("pi", 21)) x = x.times(Decimal.pow(player.pi.points.plus(1), player.pi.upgrades.length))
                if (hasMilestone("o", 3)) x = x.times(Decimal.add(3, player.o.times).ln())
                if (hasUpgrade("o", 13)) x = x.times(2)
                if (hasMilestone("o", 6)) x = x.times(layers.o.effect())
                x = x.times(layers.c.effect())
                return x
        },
        prestigeButtonText(){
                let gain = layers.sp.getResetGain()
                let start =  "Reset to gain " + formatWhole(gain) + " Super Prestige Points<br>"
                let pre = layers.sp.getGainMultPre()
                let exp = layers.sp.getGainExp()
                let pst = layers.sp.getGainMultPost()
                let nextAt = "Next at " + format(Decimal.pow(10, gain.plus(1).div(pst).root(exp).div(pre)).times(1e64)) + " Shards"
                if (gain.gt(1e6)) nextAt = ""
                return start + nextAt
        },
        canReset(){
                return layers.sp.getResetGain().gt(0) && (getBChallengeTotal() >= 40 || player.sp.best.gt(0) || hasUnlockedRow(4)) && !hasUpgrade("sp", 12) 
        },
        update(diff){
                player.sp.best = player.sp.best.max(player.sp.points)

                if (hasUpgrade("sp", 12)) {
                        player.sp.points = player.sp.points.plus(layers.sp.getResetGain().times(diff))
                        player.sp.total = player.sp.total.plus(layers.sp.getResetGain().times(diff))
                        player.sp.time += diff
                        if (player.sp.time > 1) {
                                player.sp.time += -1
                                player.sp.times ++
                        }

                        if (player.sp.time > 10) player.sp.time = 10
                }

                if (hasUpgrade("pi", 32)) {
                        player.sp.chall1points = new Decimal(0)
                        player.sp.chall2points = new Decimal(0)
                        player.sp.chall3points = new Decimal(0)
                        player.sp.chall4points = new Decimal(0)
                        player.sp.challenges[11] = 0
                        player.sp.challenges[12] = 0
                        player.sp.challenges[21] = 0
                        player.sp.challenges[22] = 0
                }
        },
        milestones: {
                1: {
                        requirementDescription: "<b>Toad</b><br>Requires: 2 Total Super Prestige Points", 
                        effectDescription: "Keep one Shard upgrade per Super Prestige reset",
                        done(){
                                return player.sp.total.gte(2)
                        },
                },
                2: {
                        requirementDescription: "<b>Toed</b><br>Requires: 3 Total Super Prestige Points", 
                        effectDescription: "Autobuyers are triggered three times as often",
                        done(){
                                return player.sp.total.gte(3)
                        },
                },
                3: {
                        requirementDescription: "<b>Towed</b><br>Requires: 5 Total Super Prestige Points", 
                        effectDescription: "Raise token generation to the 1.1th power and then multiply it by 10",
                        done(){
                                return player.sp.total.gte(5)
                        },
                },
                4: {
                        requirementDescription: "<b>Wait</b><br>Requires: 8 Total Super Prestige Points", 
                        effectDescription: "Keep Been and Bin completions",
                        done(){
                                return player.sp.total.gte(8)
                        },
                },
                5: {
                        requirementDescription: "<b>Weight</b><br>Requires: 13 Total Super Prestige Points", 
                        effectDescription: "Keep Band and Banned completions and Token upgrades",
                        done(){
                                return player.sp.total.gte(13)
                        },
                },
        },
        challenges:{
                rows: 2,
                cols: 2,
                getPointGain(){
                        if (inChallenge("sp", 11)) {
                                let base = layers.sp.challenges[11].goal(true)
                                let pts = player.points
                                let diff = player.points.max(10).log(10).max(2).log(2).minus(base.log(10).log(2)).max(0)
                                return diff.plus(1).pow(3).minus(1).times(100).floor()
                        }
                        if (inChallenge("sp", 12)) {
                                let base = layers.sp.challenges[12].goal(true)
                                let pts = player.points
                                let diff = player.points.max(10).log(10).max(2).log(2).minus(base.log(10).log(2)).max(0)
                                return diff.plus(1).pow(3).minus(1).times(100).floor()
                        }
                        if (inChallenge("sp", 21)) {
                                let base = layers.sp.challenges[21].goal(true)
                                let pts = player.points
                                let diff = player.points.max(10).log(10).max(2).log(2).minus(base.log(10).log(2)).max(0)
                                return diff.plus(1).pow(3).minus(1).times(100).floor()
                        }
                        if (inChallenge("sp", 22)) {
                                let base = layers.sp.challenges[22].goal(true)
                                let pts = player.points
                                let diff = player.points.max(10).log(10).max(2).log(2).minus(base.log(10).log(2)).max(0)
                                if (diff.gt(1) && !hasUpgrade("pi", 11)) diff = diff.log(100).plus(1) 
                                return diff.plus(1).pow(3).minus(1).times(100).floor()
                        }
                        return new Decimal(0)
                },
                getAdditionalGain(){
                        let id 
                        let gain 
                        let tot = layers.sp.challenges.getPointGain()
                        if (inChallenge("sp", 11)) {
                                id = 11
                                gain = tot.minus(player.sp.chall1points).max(0)
                        }
                        if (inChallenge("sp", 12)) {
                                id = 12
                                gain = tot.minus(player.sp.chall2points).max(0)
                        }
                        if (inChallenge("sp", 21)) {
                                id = 21
                                gain = tot.minus(player.sp.chall3points).max(0)
                        }
                        if (inChallenge("sp", 22)) {
                                id = 22
                                gain = tot.minus(player.sp.chall4points).max(0)
                        }
                        if (id != undefined) return [gain, id]
                        return [null, null]
                },
                11: {
                        name: "Quartz", 
                        challengeDescription: "All Neutrino Buyable bases are set to 1",
                        rewardDescription: "Challenge Points boost Super Prestige Point gain<br>",
                        rewardEffect(){
                                let comps = challengeCompletions("sp", 11)
                                
                                let pts = player.sp.chall1points

                                let exp = Decimal.div(5, 11-Math.sqrt(comps))
                                if (hasUpgrade("sp", 43)) exp = exp.times(2)

                                return Decimal.pow(pts.plus(1), exp)
                        },
                        rewardDisplay(){
                                let comps = "Because you have " + formatWhole(player.sp.chall1points) + " Challenge Points "
                                comps += "and " + formatWhole(challengeCompletions("sp", 11)) + " Challenge completions, "
                                let eff = "you get " + format(layers.sp.challenges[11].rewardEffect()) + "x Super Prestige Points."
                                return comps + eff
                        },
                        unlocked(){
                                return !hasUpgrade("pi", 32) && player.sp.times >= 25
                        },
                        goal(initial = false){
                                let comps = challengeCompletions("sp", 11)
                                let init = 21
                                let exp = initial ? init : init + comps
                                return Decimal.pow(10, Decimal.pow(2, exp))
                        },
                        currencyInternalName: "points",
                        completionLimit: 25,
                },
                12: {
                        name: "Quarts", 
                        challengeDescription: "Neutrino gain is raised to the .01",
                        rewardDescription: "Challenge Points boost Shard Gain<br>",
                        rewardEffect(){
                                let comps = challengeCompletions("sp", 12)

                                let pts = player.sp.chall2points

                                let exp = pts.sqrt().min(10 + comps * 3)

                                let ret = Decimal.pow(pts.plus(1), exp)     

                                if (!hasUpgrade("sp", 25) && ret.gt(1e100)) ret = ret.log10().pow(50)
                                return ret                           
                        },
                        rewardDisplay(){
                                let comps = "Because you have " + formatWhole(player.sp.chall2points) + " Challenge Points, "
                                comps += "and " + formatWhole(challengeCompletions("sp", 12)) + " Challenge completions, "
                                let eff = "you get " + format(layers.sp.challenges[12].rewardEffect()) + "x Shard gain."
                                return comps + eff
                        },
                        unlocked(){
                                return !hasUpgrade("pi", 32) && player.sp.times >= 25
                        },
                        goal(initial = false){
                                let comps = challengeCompletions("sp", 12)
                                let init = 31
                                let exp = initial ? init : init + comps
                                return Decimal.pow(10, Decimal.pow(2, exp))
                        },
                        currencyInternalName: "points",
                        completionLimit: 25,
                },
                21: {
                        name: "Jewel", 
                        challengeDescription: "Incrementy Stamina Softcap starts at 1",
                        rewardDescription: "Challenge Points boost Energy to Antimatter Synergy<br>",
                        rewardEffect(){
                                let comps = challengeCompletions("sp", 21)

                                if (comps == 0) return new Decimal(0)

                                let pts = player.sp.chall3points

                                let effpts = pts.pow(1 - .8/Math.sqrt(comps))
                                let ret = Decimal.minus(Decimal.div(1, effpts.plus(10).log10()), 1).times(-1)

                                if (hasUpgrade("sp", 42)) ret = ret.sqrt()
                                if (hasUpgrade("pi", 23)) ret = ret.pow(Decimal.pow(.8, player.pi.milestones.length))
                                return ret
                        },
                        rewardDisplay(){
                                let comps = "Because you have " + formatWhole(player.sp.chall3points) + " Challenge Points, "
                                comps += "and " + formatWhole(challengeCompletions("sp", 21)) + " Challenge completions, "
                                let eff = "Energy^" + format(layers.sp.challenges[21].rewardEffect(), 4) + " boosts Antimatter gain."
                                return comps + eff
                        },
                        unlocked(){
                                return !hasUpgrade("pi", 32) && player.sp.times >= 25
                        },
                        goal(initial = false){
                                let comps = challengeCompletions("sp", 21)
                                let init = 21
                                let exp = initial ? init : init + comps
                                return Decimal.pow(10, Decimal.pow(2, exp))
                        },
                        currencyInternalName: "points",
                        completionLimit: 25,
                },
                22: {
                        name: "Joule", 
                        challengeDescription: "Incrementy gain is raised to the .01",
                        rewardDescription: "Challenge Points boost Particle Boost base<br>",
                        rewardEffect(){
                                let comps = challengeCompletions("sp", 22)

                                let pts = player.sp.chall4points

                                if (comps > 5) comps = comps / 4 + 3.75

                                return Decimal.pow(pts.plus(1), comps * Math.min(comps, 5) + 4)
                        },
                        rewardDisplay(){
                                let comps = "Because you have " + formatWhole(player.sp.chall4points) + " Challenge Points, "
                                comps += "and " + formatWhole(challengeCompletions("sp", 22)) + " Challenge completions, "
                                let eff = "you get x" + format(layers.sp.challenges[22].rewardEffect()) + " to Particle Boost base."
                                return comps + eff
                        },
                        unlocked(){
                                return !hasUpgrade("pi", 32) && player.sp.times >= 25
                        },
                        goal(initial = false){
                                let comps = challengeCompletions("sp", 22)
                                let init = 14
                                let exp = initial ? init : init + comps
                                return Decimal.pow(10, Decimal.pow(2, exp))
                        },
                        currencyInternalName: "points",
                        completionLimit: 25,
                },
        },
        upgrades: {
                rows: 5,
                cols: 5,
                11: {
                        title: "Lute",
                        description: "Quarts Challenge Points boost Super Prestige Point gain",
                        cost: new Decimal(366),
                        currencyDisplayName: "Quartz Challenge Points",
                        currencyInternalName: "chall1points",
                        currencyLayer: "sp",
                        effect(){
                                let amt = player.sp.chall2points
                                if (amt.lte(10)) return amt.max(1)

                                let ret = Decimal.pow(amt, Decimal.log10(amt).pow(-.5))

                                return ret
                        },
                        unlocked(){
                                return hasUpgrade("sp", 11) || player.sp.chall1points.gte(360) || hasUnlockedRow(4)
                        },
                }, 
                12: {
                        title: "Loot",
                        description: "Remove the ability to Prestige but gain 100% of SP Points on prestige and one SP time per second",
                        cost: new Decimal(396),
                        currencyDisplayName: "Quartz Challenge Points",
                        currencyInternalName: "chall1points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 11) || hasUnlockedRow(4)
                        },
                }, 
                13: {
                        title: "Earn",
                        description: "Each Super Prestige Upgrade pushes the Incrementy Stamina Softcap Start back by one",
                        cost: new Decimal(481),
                        currencyDisplayName: "Quartz Challenge Points",
                        currencyInternalName: "chall1points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 12) || hasUnlockedRow(4)
                        },
                },
                14: {
                        title: "Urn",
                        description: "Quarts Challenge Points raises Amoeba Gain base to a power",
                        cost: new Decimal(710),
                        effect(){
                                let ret = player.sp.chall2points.plus(1).pow(.5)

                                if (hasUpgrade("sp", 24)) ret = ret.times(3)
                                return ret
                        },
                        currencyDisplayName: "Quartz Challenge Points",
                        currencyInternalName: "chall1points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 13) || hasUnlockedRow(4)
                        },
                },
                21: {
                        title: "Ate",
                        description: "Each Super Prestige upgrade makes Amoebas multiply Antimatter",
                        cost: new Decimal(400),
                        currencyDisplayName: "Quarts Challenge Points",
                        currencyInternalName: "chall2points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 14) || hasUnlockedRow(4)
                        },
                },
                22: {
                        title: "Eight",
                        description: "Each Jewel completion pushes the Incrementy Stamina Softcap back by one",
                        cost: new Decimal(643),
                        currencyDisplayName: "Quarts Challenge Points",
                        currencyInternalName: "chall2points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 21) || hasUnlockedRow(4)
                        },
                },
                23: {
                        title: "Shear", 
                        description: "Jewel Points multiply Super Prestige Point gain",
                        cost: new Decimal(835),
                        currencyDisplayName: "Quarts Challenge Points",
                        currencyInternalName: "chall2points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 22) || hasUnlockedRow(4)
                        },
                }, 
                24: {
                        title: "Sheer", 
                        description: "Triple Urn",
                        cost: new Decimal(1097),
                        currencyDisplayName: "Quarts Challenge Points",
                        currencyInternalName: "chall2points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 23) || hasUnlockedRow(4)
                        },
                },
                31: {
                        title: "See", 
                        description: "Super Prestige Points multiply Bosons gain",
                        cost: new Decimal(1302),
                        currencyDisplayName: "Jewel Challenge Points",
                        currencyInternalName: "chall3points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 24) || hasUnlockedRow(4)
                        },
                },
                32: {
                        title: "Sea", 
                        description: "Each Joule Completion boosts Super Prestige point gain by 50x",
                        cost: new Decimal(1700),
                        currencyDisplayName: "Jewel Challenge Points",
                        currencyInternalName: "chall3points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 31) || hasUnlockedRow(4)
                        },
                },
                33: {
                        title: "Add", 
                        description: "Each Jewel Completion multiplies Shard gain by Super Prestige Points",
                        cost: new Decimal(2064),
                        currencyDisplayName: "Jewel Challenge Points",
                        currencyInternalName: "chall3points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 32) || hasUnlockedRow(4)
                        },
                },
                34: {
                        title: "Ad", 
                        description: "Joule Challenge Points multiply Super Prestige point gain",
                        cost: new Decimal(2295),
                        currencyDisplayName: "Jewel Challenge Points",
                        currencyInternalName: "chall3points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 33) || hasUnlockedRow(4)
                        },
                },
                41: {
                        title: "Liar", 
                        description: "Super Prestige Points Boost base Incrementy Gain",
                        cost: new Decimal(122),
                        currencyDisplayName: "Joule Challenge Points",
                        currencyInternalName: "chall4points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 34) || hasUnlockedRow(4)
                        },
                },
                42: {
                        title: "Lyre", 
                        description: "Square root Jewel Exponent (buff!)",
                        cost: new Decimal(1560),
                        currencyDisplayName: "Joule Challenge Points",
                        currencyInternalName: "chall4points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 41) || hasUnlockedRow(4)
                        },
                },
                43: {
                        title: "Ode", 
                        description: "Square Quartz reward",
                        cost: new Decimal(1565),
                        currencyDisplayName: "Joule Challenge Points",
                        currencyInternalName: "chall4points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 42) || hasUnlockedRow(4)
                        },
                },
                44: {
                        title: "Owed", 
                        description: "Each Joule Completion makes Amoebas multiply Antimatter gain",
                        cost: new Decimal(1576),
                        currencyDisplayName: "Joule Challenge Points",
                        currencyInternalName: "chall4points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 43) || hasUnlockedRow(4)
                        },
                }, 
                15: {
                        title: "Bale",
                        description: "Each Upgrade in this column multiplies Super Prestige point gain by Quartz completions",
                        cost: new Decimal(16919),
                        currencyDisplayName: "Quartz Challenge Points",
                        currencyInternalName: "chall1points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 44) || hasUnlockedRow(4)
                        },
                },
                25: {
                        title: "Bail",
                        description: "Remove the 1e100 softcap of Quarts",
                        cost: new Decimal(32955),
                        currencyDisplayName: "Quarts Challenge Points",
                        currencyInternalName: "chall2points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 15) || hasUnlockedRow(4)
                        },
                },
                35: {
                        title: "Barren",
                        description: "Raise base Super Prestige point gain to the 1.01",
                        cost: new Decimal(16480),
                        currencyDisplayName: "Jewel Challenge Points",
                        currencyInternalName: "chall3points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 25) || hasUnlockedRow(4)
                        },
                },
                45: {
                        title: "Baron",
                        description: "Neutrino Autobuyers can buy ten times more",
                        cost: new Decimal(1624),
                        currencyDisplayName: "Joule Challenge Points",
                        currencyInternalName: "chall4points",
                        currencyLayer: "sp",
                        unlocked(){
                                return hasUpgrade("sp", 35) || hasUnlockedRow(4)
                        },
                },
                51: {
                        title: "Schwartz",
                        description: "Each Super Prestige upgrade in this row raises Incrementy gain to the 1.2",
                        cost: new Decimal("ee18200"),
                        unlocked(){
                                return hasUpgrade("p", 55) || hasUnlockedRow(4)
                        },
                },
                52: {
                        title: "Selberg",
                        description: "Neutrino Autobuyers buy 50x more",
                        cost: new Decimal("ee21300"),
                        unlocked(){
                                return hasUpgrade("sp", 51) || hasUnlockedRow(4)
                        },
                },
                53: {
                        title: "Kodaira",
                        description: "Add 3 to the limit of Incrementy Stamina per Super Prestige upgrade",
                        cost: new Decimal("ee24900"),
                        unlocked(){
                                return hasUpgrade("sp", 52) || hasUnlockedRow(4)
                        },
                }, 
                54: {
                        title: "Serre",
                        description: "Add 69 to the Incrementy Stamina Softcap Start",
                        cost: new Decimal("ee32450"),
                        unlocked(){
                                return hasUpgrade("sp", 53) || hasUnlockedRow(4)
                        },
                },
                55: {
                        title: "Quixotic",
                        description: "Add 5 to the Incrementy Stamina limit",
                        cost: new Decimal("ee38000"),
                        unlocked(){
                                return hasUpgrade("sp", 54) || hasUnlockedRow(4)
                        },
                },
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                return getBChallengeTotal() >= 40 || player.sp.best.gt(0) || hasUnlockedRow(4)
        },
        tabFormat: {
                "QoL": {
                        content: [
                                "main-display",
                                ["display-text", function(){
                                        return "You have done a total of " + formatWhole(player.sp.times) + " Super Prestige resets"
                                }],
                                ["display-text", function(){
                                        if (hasMilestone("sp", 5)) return ""
                                        return "You have gotten a total of " + formatWhole(player.sp.total) + " Super Prestige Points"
                                }],
                                ["display-text", function(){
                                        if (!hasUpgrade("sp", 12)) return "Super Prestige resets Shard and all prior layers"
                                        return "You are gaining " + format(layers.sp.getResetGain()) + " Super Prestige Points per second"
                                }],
                                ["display-text", function(){
                                        if (player.sp.times < 25 && hasMilestone("sp", 5)) return "Get 25 Super Prestige resets to continue progressing"
                                        return ""
                                }],
                                ["prestige-button", "", function (){ return hasUpgrade("sp", 12) ? {'display': 'none'} : {}}],
                                "milestones"
                        ],
                        unlocked(){
                                return true
                        },
                }, 
                "Obfuscations": {
                        content: [
                                ["display-text", function(){
                                        return "Each Challenge's Challenge Points are generated based on your Points"
                                }],
                                ["display-text", function(){
                                        if (inChallenge("sp", 11) || inChallenge("sp", 12) || inChallenge("sp", 21) || inChallenge("sp", 22)) {
                                                let gain = layers.sp.challenges.getAdditionalGain()[0]
                                                let a = "Leaving the challenge will give " + formatWhole(gain) + " Challenge Points"
                                                let b = ""
                                                if (gain.lt(1000)) {
                                                        let init = layers.sp.challenges.getPointGain()
                                                        if (inChallenge("sp", 11)) init = init.max(player.sp.chall1points)
                                                        if (inChallenge("sp", 12)) init = init.max(player.sp.chall2points)
                                                        if (inChallenge("sp", 21)) init = init.max(player.sp.chall3points)
                                                        if (inChallenge("sp", 22)) init = init.max(player.sp.chall4points)


                                                        let target = init.plus(1).div(100).plus(1).root(3).minus(1)

                                                        if (inChallenge("sp", 22) && target.gt(1) && !hasUpgrade("pi", 11)) target = Decimal.pow(100, target.minus(1)) 

                                                        let add = new Decimal(0)
                                                        if (inChallenge("sp", 11)) add = layers.sp.challenges[11].goal(true).log(10).log(2)
                                                        if (inChallenge("sp", 12)) add = layers.sp.challenges[12].goal(true).log(10).log(2)
                                                        if (inChallenge("sp", 21)) add = layers.sp.challenges[21].goal(true).log(10).log(2)
                                                        if (inChallenge("sp", 22)) add = layers.sp.challenges[22].goal(true).log(10).log(2)


                                                        let goal = Decimal.pow(10, Decimal.pow(2, target.plus(add)))
                                                        
                                                        b = " (next at " + format(goal) + ")"
                                                }
                                                return a + b
                                        }
                                        return "Enter a Challenge to gain Challenge Points"
                                }],
                                "blank",
                                "challenges",
                        ],
                        unlocked(){
                                return hasUpgrade("s", 55) && !hasUpgrade("pi", 32) && player.sp.times >= 25
                        },
                },
                "Upgrades": {
                        content: [
                                "main-resouce-display",
                                "upgrades"
                        ],
                        unlocked(){
                                return hasUpgrade("sp", 11) || player.sp.chall1points.gte(360) || hasUnlockedRow(4)
                        },
                }
        },
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 3 && layer != "pi") return

                //resource
                player.sp.points = new Decimal(0)
                player.sp.best = new Decimal(0)
                player.sp.total = new Decimal(0)

                if (layer == "pi") return
                let keep = []
                if (hasMilestone("o", 5) || hasMilestone("c", 5)) keep.push(11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45)
                if (hasMilestone("o", 6) || hasUpgrade("c", 12)) keep.push(51,52,53,54,55)
                
                player.sp.upgrades = filter(player.sp.upgrades, keep)
                if (hasMilestone("o", 5)) return 
                
                if (hasMilestone("c", 3)) {
                        player.sp.times = Math.min(player.sp.times, player.c.times)
                }
                else player.sp.times = 0
                
                if (!hasMilestone("c", 4)) player.sp.milestones = []
        },
})


addLayer("pi", {
        name: "π介子", 
        symbol: "π", 
        position: 0,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
                total: new Decimal(0),
                bestOnce: new Decimal(0),
                times: 0,
        }},
        color: "#EC8241",
        requires: Decimal.pow(10, 133).times(5), 
        resource: "π介子",
        baseAmount() {return player.sp.points}, 
        branches: ["sp"],
        type: "custom", 
        effect(){
                let amt = player.pi.bestOnce
                if (hasMilestone("pi", 4)) amt = amt.max(player.pi.points)
                let ret = amt.times(2).sqrt().floor()
                
                if (ret.gt(10)) ret = ret.log10().times(10)
                if (ret.gt(50)) ret = ret.times(2).log10().times(25)

                return ret.floor()
        },
        effectDescription(){
                let eff = layers.pi.effect()
                let a = "which increases the Incrementy Stamina softcap by " + formatWhole(eff)
                let b = ""
                if (!hasMilestone("pi", 4)) b = " (based on your best Pions in one reset)"
                let c = " (next at " 
                /*
                let ret = amt.times(2).sqrt().floor()
                
                if (ret.gt(10)) ret = ret.log10().times(10)
                if (ret.gt(50)) ret = ret.times(2).log10().times(25)
                */
                let r = eff.plus(1)
                if (r.gt(50)) r = Decimal.pow(10, r.div(25)).div(2)
                if (r.gt(10)) r = Decimal.pow(10, r.div(10))
                r = r.pow(2).div(2)
                r = r.ceil()

                return a + b + c + formatWhole(r) + ")."
        },
        getResetGain() {
                let amt = layers.pi.baseAmount()
                let pre = layers.pi.getGainMultPre()
                let exp = layers.pi.getGainExp()
                let pst = layers.pi.getGainMultPost()
                
                let ret = amt.div(5e132).max(1).log10().times(pre).pow(exp).times(pst)

                if (ret.gt(1e100) && !hasUpgrade("p", 52)) ret = ret.log10().pow(50)

                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                return ret.floor()
        },
        getGainExp(){
                let x = new Decimal(.2339)
                if (devSpeedUp) x = new Decimal(.25)
                if (hasUpgrade("pi", 14)) x = x.times(2)
                if (hasUpgrade("o", 12)) x = x.times(1.001)
                x = x.times(layers.o.buyables[12].effect())
                return x
        },
        getGainMultPre(){
                let x = new Decimal(1)
                return x
        },
        getGainMultPost(){
                let x = new Decimal(1)
                if (hasUpgrade("pi", 22)) x = x.times(1.8)
                if (hasUpgrade("pi", 24)) x = x.times(Decimal.sqrt(player.pi.upgrades.length).max(1))
                return x
        },
        prestigeButtonText(){
                let gain = layers.pi.getResetGain()
                let start = "Reset to gain " + formatWhole(gain) + " Pions<br>"
                let pre = layers.pi.getGainMultPre()
                let exp = layers.pi.getGainExp()
                let pst = layers.pi.getGainMultPost()
                let nextAt = "Next at " + format(Decimal.pow(10, gain.plus(1).div(pst).root(exp).div(pre)).times(5e132)) + " Super Prestige Points"
                if (gain.gt(1e6)) nextAt = ""
                return start + nextAt
        },
        canReset(){
                return layers.pi.getResetGain().gt(0) && !hasMilestone("pi", 5) && (player.sp.upgrades.length >= 20 || player.c.best.gt(0))
        },
        update(diff){
                player.pi.best = player.pi.best.max(player.pi.points)

                if (hasMilestone("pi", 5)) {
                        let x = layers.pi.getResetGain()
                        player.pi.points = player.pi.points.plus(x.times(diff))
                        player.pi.bestOnce = player.pi.bestOnce.max(x)
                }
        },
        milestones: {
                1: {
                        requirementDescription: "<b>Fore</b><br>Requires: 1 Pions in one reset", 
                        effectDescription: "Each milestone makes the Incrementy Stamina softcap start 2 later",
                        done(){
                                return player.pi.bestOnce.gte(1)
                        },
                },
                2: { 
                        requirementDescription: "<b>Four</b><br>Requires: 2 Pions in one reset", 
                        effectDescription: "Particle Buyable Autobuyers are 5x faster",
                        done(){
                                return player.pi.bestOnce.gte(2)
                        },
                },
                3: { 
                        requirementDescription: "<b>For</b><br>Requires: 6 Pions in one reset", 
                        effectDescription: "Double Super Prestige Point gain per Pion upgrade squared",
                        done(){
                                return player.pi.bestOnce.gte(6)
                        },
                },
                4: {
                        requirementDescription: "<b>Mantel</b><br>Requires: 24 Pions in one reset", 
                        effectDescription: "Make pion effect based on pions",
                        done(){
                                return player.pi.bestOnce.gte(24)
                        },
                },
                5: { 
                        requirementDescription: "<b>Mantle</b><br>Requires: 120 Pions in one reset", 
                        effectDescription: "You gain 100% of your pions on reset per second, and your best Pions per reset is likewise updated",
                        done(){
                                return player.pi.bestOnce.gte(120)
                        },
                },
        },
        upgrades:{
                rows: 4,
                cols: 4,
                11: {
                        title: "Bee",
                        description: "Remove the Joule Challenge points softcap",
                        cost: new Decimal(10),
                        unlocked(){
                                return hasMilestone("pi", 2) || hasUpgrade("pi", 11) || player.c.best.gt(0)
                        }
                },
                12: {
                        title: "Be",
                        description: "Each Pion upgrade multiplies Super Prestige Point gain by Joule challenge points",
                        cost: new Decimal(10),
                        effect(){
                                return Decimal.pow(player.sp.chall1points.plus(1), player.pi.upgrades.length)
                        },
                        unlocked(){
                                return hasUpgrade("pi", 11) || player.c.best.gt(0)
                        }
                },
                13: {
                        title: "Beat",
                        description: "Each Pion upgrade pushes the Incrementy Stamina Softcap back by 1",
                        cost: new Decimal(15),
                        unlocked(){
                                return hasUpgrade("pi", 12) || player.c.best.gt(0)
                        }
                },
                14: {
                        title: "Beet",
                        description: "Square the Pion gain formula",
                        cost: new Decimal(15),
                        unlocked(){
                                return hasUpgrade("pi", 13) || player.c.best.gt(0)
                        }
                },
                21: {
                        title: "Feat",
                        description: "Each Pion upgrade multiplies Super Prestige Point gain by Pions",
                        cost: new Decimal(100),
                        unlocked(){
                                return hasUpgrade("pi", 14) || player.c.best.gt(0)
                        }
                },
                22: {
                        title: "Feet",
                        description: "Each Pion upgrade makes Shards multiply Amoeba gain and multiply Pion gain by 1.8",
                        cost: new Decimal(120),
                        unlocked(){
                                return hasUpgrade("pi", 21) || player.c.best.gt(0)
                        }
                },
                23: {
                        title: "Levee",
                        description: "Each Pion milestone raises Jewel effect to the .8",
                        cost: new Decimal(200),
                        unlocked(){
                                return hasUpgrade("pi", 22) || player.c.best.gt(0)
                        }
                },
                24: {
                        title: "Levy",
                        description: "The square root of pion upgrades multiplies pion gain",
                        cost: new Decimal(200),
                        unlocked(){
                                return hasUpgrade("pi", 23) || player.c.best.gt(0)
                        }
                },
                31: {
                        title: "Scene",
                        description: "Neutrino autobuyers can buy 2x more",
                        cost: new Decimal(500),
                        unlocked(){
                                return hasUpgrade("pi", 24) || player.c.best.gt(0)
                        }
                },
                32: {
                        title: "Seen",
                        description: "You can no longer access or gain AM, A, E, M, Q, B or G or SP challenges but vastly buff the Incrementy gain formula",
                        cost: new Decimal(4321),
                        unlocked(){
                                return hasUpgrade("pi", 31) || player.c.best.gt(0)
                        },
                        onPurchase(){
                                player.sp.activeChallenge = undefined
                                player.am.activeChallenge = undefined
                                player.m.activeChallenge = undefined
                                player.b.activeChallenge = undefined
                                player.q.activeChallenge = undefined
                                let l = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45]
                                for (i = 0; i < 20; i++){
                                        if (!player.sp.upgrades.includes(l[i])) player.sp.upgrades.push(l[i])
                                }
                        }
                },
                33: {
                        title: "Steak",
                        description: "Pion upgrades after the first ten push back the Incrementy Stamina Maximum amount by 10",
                        cost: new Decimal(1e153),
                        unlocked(){
                                return hasUpgrade("pi", 32) || player.c.best.gt(0)
                        }
                },
                34: {
                        title: "Stake",
                        description: "Each Pion Upgrade raises Incrementy Gain to the 1.1",
                        cost: new Decimal(1e157),
                        unlocked(){
                                return hasUpgrade("pi", 33) || player.c.best.gt(0)
                        }
                },
                41: {
                        title: "Quire",
                        description: "Remove particle buyables",
                        cost: new Decimal(1e188),
                        unlocked(){
                                return hasUpgrade("pi", 34) || player.c.best.gt(0)
                        }
                },
                42: {
                        title: "Choir",
                        description: "Unlock new Particle upgrades",
                        cost: new Decimal(1e191),
                        unlocked(){
                                return hasUpgrade("pi", 41) || player.c.best.gt(0)
                        }
                },
                43: {
                        title: "Roth",
                        description: "You can buy 5 more Incrementy Stamina levels",
                        cost: new Decimal("e20800"),
                        unlocked(){
                                return hasUpgrade("sp", 55) || hasUpgrade("pi", 43) || (hasUpgrade("pi", 32) && player.o.best.gt(0)) || player.c.best.gt(0)
                        }
                },
                44: {
                        title: "Thom",
                        description: "Unlock Origin",
                        cost: new Decimal("e23000"),
                        unlocked(){
                                return hasUpgrade("pi", 43) || player.c.best.gt(0) || (hasUpgrade("pi", 32) && player.o.best.gt(0))
                        }
                },
        },
        row: 3, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                return player.sp.best.gt(1e132) || player.pi.best.gt(0) || hasUnlockedRow(4)
        },
        tabFormat: {
                "Milestones": {
                        content: [
                                "main-display",
                                ["prestige-button", "", function (){ return hasMilestone("pi", 5) ? {'display': 'none'} : {}}],
                                ["display-text", function(){
                                        if (!hasMilestone("pi", 5)) return "You have " + format(layers.sp.getResetGain()) + " Super Prestige Points"
                                        return "You are gaining " + format(layers.pi.getResetGain()) + " Pions per second"
                                }],
                                "milestones",
                        ],
                        unlocked(){
                                return true
                        },
                },
                "Upgrades": {
                        content: [
                                "main-resouce-display",
                                ["display-text", function(){
                                        if (!hasMilestone("pi", 5)) return ""
                                        return "You are gaining " + format(layers.pi.getResetGain()) + " Pions per second"
                                }],
                                "upgrades"
                        ],
                        unlocked(){
                                return true
                        },
                }
        },
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 3) return

                //resource
                player.pi.points = new Decimal(0)
                player.pi.best = new Decimal(0)
                player.pi.times = 0
                player.pi.total = new Decimal(0)
                player.pi.bestOnce = new Decimal(0)
                
                if (hasUpgrade("o", 21)) return
                let keep = []
                if (hasMilestone("c", 5)) keep.push(11,12,13,14,21,22,23,24)
                player.pi.upgrades = filter(player.pi.upgrades, keep)
                player.pi.milestones = []
        },
})


addLayer("o", {
        name: "Origin", 
        symbol: "O", 
        position: 0,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
                total: new Decimal(0),
                times: 0,
                time: 0,
                abtime: 0,
        }},
        color: "#79134A",
        requires: Decimal.pow(10, 25000), 
        resource: "Origins",
        baseAmount() {return player.pi.points}, 
        branches: ["pi"],
        type: "custom", 
        effect(){
                let amt = player.o.total
                let ret = amt.times(2).plus(1).pow(2)
                return ret
        },
        effectDescription(){
                let eff = layers.o.effect()
                let a = "which increases Tokens and Neutrino gain by " + format(eff) + " (based on total Origins)"

                return a + "."
        },
        getResetGain() {
                let amt = layers.o.baseAmount()
                let pre = layers.o.getGainMultPre()
                let exp = layers.o.getGainExp()
                let pst = layers.o.getGainMultPost()
                
                let ret = amt.max(10).log10().div(2.5).times(pre).pow(exp).minus(99).max(0).times(pst)

                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                return ret.floor()
        },
        getGainExp(){
                let x = new Decimal(.5)
                return x
        },
        getGainMultPre(){
                let x = new Decimal(1)
                x = x.times(layers.o.buyables[33].effect())
                return x
        },
        getGainMultPost(){
                let x = new Decimal(1)
                if (hasUpgrade("o", 21)) x = x.times(1.5)
                if (hasUpgrade("o", 23)) x = x.times(2)
                if (hasUpgrade("o", 24)) x = x.times(2)
                x = x.times(layers.o.buyables[23].effect())
                if (hasUpgrade("o", 34)) x = x.times(3)
                x = x.times(layers.f.effect())
                if (hasUpgrade("f", 12)) x = x.times(Decimal.pow(player.f.points.plus(1), player.f.upgrades.length))
                x = x.times(layers.f.methaneEffect())
                return x
        },
        prestigeButtonText(){
                let gain = layers.o.getResetGain()
                let start = "Reset to gain " + formatWhole(gain) + " Origins<br>"
                let pre = layers.o.getGainMultPre()
                let exp = layers.o.getGainExp()
                let pst = layers.o.getGainMultPost()
                let nextAt = "Next at " + format(Decimal.pow(10, gain.plus(1).div(pst).plus(99).root(exp).div(pre).times(2.5))) + " Pions"
                if (gain.gt(1e6)) nextAt = ""

                if (gain.gte(1)) {
                        let ps = gain.div(player.o.time || 1)
                        if (ps.lt(1000/60)) nextAt += "<br>" + format(ps.times(60)) + "/m"
                        else nextAt += "<br>" + format(ps) + "/s"
                }
                return start + nextAt
        },
        canReset(){
                return layers.o.getResetGain().gt(0) && hasUpgrade("pi", 44) 
        },
        update(diff){
                player.o.best = player.o.best.max(player.o.points)

                player.o.abtime += diff
                
                if (hasUpgrade("f", 33)) {
                        if (player.o.abtime > 1) {
                                layers.o.buyables[11].buy()
                                layers.o.buyables[12].buy()
                                layers.o.buyables[13].buy()
                                layers.o.buyables[21].buy()
                                layers.o.buyables[22].buy()
                                layers.o.buyables[23].buy()
                                layers.o.buyables[31].buy()
                                layers.o.buyables[32].buy()
                                layers.o.buyables[33].buy()
                                player.o.abtime += -1
                        }
                        if (player.o.abtime > 10) player.o.abtime = 10
                } else {
                        player.o.abtime = 0
                }

                player.o.time += diff

                if (hasUpgrade("o", 35)) {
                        let x = layers.o.getResetGain()
                        player.o.points = player.o.points.plus(x.times(diff))
                        player.o.total  = player.o.total.plus(x.times(diff))
                }
        },
        buyables: {
                rows: 3,
                cols: 3,
                11: {
                        title: "Incrementy Boost",
                        display(){
                                let additional = ""
                                let ex = layers.o.buyables[11].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.o.buyables[11]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: ^" + format(layers.o.buyables[11].effect(), 4) + " to Incrementy</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.o.buyables[11].cost()) + " Origins</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.o.buyables[11].effectBase(), 3) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("o", 11).plus(a)
                                let base1 = 2
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, exp2)
                        },
                        effectBase(){
                                let base = new Decimal(1.02)
                                if (hasUpgrade("o", 31)) base = base.plus(layers.o.buyables[11].total().times(.001))
                                if (hasUpgrade("o", 45)) base = base.plus(layers.o.buyables[32].total().times(.1 ))
                                return base
                        },
                        effect(){
                                let x = layers.o.buyables[11].total()
                                let base = layers.o.buyables[11].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.o.points.gte(layers.o.buyables[11].cost())
                        },
                        total(){
                                return getBuyableAmount("o", 11).plus(layers.o.buyables[11].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("o", 24)) ret = ret.plus(layers.o.buyables[12].total())
                                if (hasUpgrade("o", 32)) ret = ret.plus(layers.o.buyables[13].total())
                                if (hasUpgrade("o", 34)) ret = ret.plus(player.o.upgrades.length)
                                ret = ret.plus(layers.o.buyables[21].total())
                                ret = ret.plus(layers.o.buyables[31].total())
                                return ret
                        },
                        buy(){
                                let cost = layers.o.buyables[11].cost()
                                if (!layers.o.buyables[11].canAfford()) return
                                player.o.buyables[11] = player.o.buyables[11].plus(1)
                                player.o.points = player.o.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return true },
                },
                12: {
                        title: "Pion Boost",
                        display(){
                                let additional = ""
                                let ex = layers.o.buyables[12].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.o.buyables[12]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: ^" + format(layers.o.buyables[12].effect(), 4) + " to Pions</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.o.buyables[12].cost()) + " Origins</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.o.buyables[12].effectBase(), 3) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("o", 12).plus(a)
                                let base1 = 3
                                let exp2 = x.times(x)
                                return Decimal.pow(base1, exp2)
                        },
                        effectBase(){
                                let base = new Decimal(1.02)
                                if (hasUpgrade("o", 32)) base = base.plus(layers.o.buyables[12].total().times(.002))
                                if (hasUpgrade("f", 13)) base = base.plus(layers.o.buyables[33].total().times(player.f.upgrades.length).div(100))
                                base = base.plus(layers.f.nadphEffect())
                                return base
                        },
                        effect(){
                                let x = layers.o.buyables[12].total()
                                let base = layers.o.buyables[12].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.o.points.gte(layers.o.buyables[12].cost())
                        },
                        total(){
                                return getBuyableAmount("o", 12).plus(layers.o.buyables[12].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("o", 25)) ret = ret.plus(layers.o.buyables[13].total())
                                ret = ret.plus(layers.o.buyables[22].total())
                                ret = ret.plus(layers.o.buyables[32].total())
                                return ret
                        },
                        buy(){
                                let cost = layers.o.buyables[12].cost()
                                if (!layers.o.buyables[12].canAfford()) return
                                player.o.buyables[12] = player.o.buyables[12].plus(1)
                                player.o.points = player.o.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return hasUpgrade("o", 22) },
                },
                13: {
                        title: "Stamina Boost",
                        display(){
                                let additional = ""
                                let ex = layers.o.buyables[13].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.o.buyables[13]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: " + formatWhole(layers.o.buyables[13].effect()) + " Free Stamina Levels</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.o.buyables[13].cost()) + " Origins</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br> x" + (layers.o.buyables[13].total().gt(10) ? "*10" : "^2") +"</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("o", 13).plus(a)
                                let base1 = 4
                                let base2 = 1.5
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).ceil()
                        },
                        effectBase(){
                                let base = new Decimal(1.02)
                                return base
                        },
                        effect(){
                                let x = layers.o.buyables[13].total()
                                return Decimal.times(x, x.min(10))
                        },
                        canAfford(){
                                return player.o.points.gte(layers.o.buyables[13].cost())
                        },
                        total(){
                                return getBuyableAmount("o", 13).plus(layers.o.buyables[13].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                ret = ret.plus(layers.o.buyables[23].total())
                                ret = ret.plus(layers.o.buyables[33].total())
                                if (hasUpgrade("f", 31)) ret = ret.plus(layers.f.buyables[13].total())
                                if (devSpeedUp && layers.o.buyables[13].unlocked()) ret = ret.plus(1)
                                return ret
                        },
                        buy(){
                                let cost = layers.o.buyables[13].cost()
                                if (!layers.o.buyables[13].canAfford()) return
                                player.o.buyables[13] = player.o.buyables[13].plus(1)
                                player.o.points = player.o.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return hasUpgrade("o", 23) },
                },
                21: {
                        title: "Particle Boost",
                        display(){
                                let additional = ""
                                let ex = layers.o.buyables[21].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.o.buyables[21]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: ^" + format(layers.o.buyables[21].effect(), 4) + " Particle Gain</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.o.buyables[21].cost()) + " Origins</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.o.buyables[21].effectBase(), 3) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("o", 21).plus(a)
                                let base0 = 100
                                let base1 = 8
                                let base2 = 1.5
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0).ceil()
                        },
                        effectBase(){
                                let base = new Decimal(1.25)
                                if (hasUpgrade("o", 51)) base = base.plus(layers.o.buyables[23].total().div(10))
                                return base
                        },
                        effect(){
                                let x = layers.o.buyables[21].total()
                                let base = layers.o.buyables[21].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.o.points.gte(layers.o.buyables[21].cost())
                        },
                        total(){
                                return getBuyableAmount("o", 21).plus(layers.o.buyables[21].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("o", 42)) ret = ret.plus(layers.o.buyables[22].total())
                                ret = ret.plus(layers.o.buyables[31].total())
                                if (hasUpgrade("o", 51)) ret = ret.plus(layers.o.buyables[23].total())
                                return ret
                        },
                        buy(){
                                let cost = layers.o.buyables[21].cost()
                                if (!layers.o.buyables[21].canAfford()) return
                                player.o.buyables[21] = player.o.buyables[21].plus(1)
                                player.o.points = player.o.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return hasUpgrade("o", 31) },
                },
                22: {
                        title: "Super Prestige Boost",
                        display(){
                                let additional = ""
                                let ex = layers.o.buyables[22].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.o.buyables[22]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: ^" + format(layers.o.buyables[22].effect(), 4) + " Super Prestige Point gain</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.o.buyables[22].cost()) + " Origins</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.o.buyables[22].effectBase(), 3) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("o", 22).plus(a)
                                let base0 = 400
                                let base1 = 4
                                let base2 = 2
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0)
                        },
                        effectBase(){
                                let base = new Decimal(1.5)
                                
                                base = base.pow(layers.f.acetylcoaEffect())
                                return base
                        },
                        effect(){
                                let x = layers.o.buyables[22].total()
                                let base = layers.o.buyables[22].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.o.points.gte(layers.o.buyables[22].cost())
                        },
                        total(){
                                return getBuyableAmount("o", 22).plus(layers.o.buyables[22].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("o", 41)) ret = ret.plus(layers.o.buyables[23].total())
                                ret = ret.plus(layers.o.buyables[32].total())
                                if (hasUpgrade("o", 44)) ret = ret.plus(layers.o.buyables[31].total().times(3))
                                if (hasUpgrade("f", 23)) ret = ret.plus(layers.f.buyables[22].total())
                                return ret
                        },
                        buy(){
                                let cost = layers.o.buyables[22].cost()
                                if (!layers.o.buyables[22].canAfford()) return
                                player.o.buyables[22] = player.o.buyables[22].plus(1)
                                player.o.points = player.o.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return hasUpgrade("o", 31) },
                },
                23: {
                        title: "Origin Boost",
                        display(){
                                let additional = ""
                                let ex = layers.o.buyables[23].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.o.buyables[23]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: *" + format(layers.o.buyables[23].effect()) + " Origin gain</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.o.buyables[23].cost()) + " Origins</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.o.buyables[23].effectBase(), 3) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("o", 23).plus(a)
                                let base0 = 1000
                                let base1 = 8
                                let base2 = 2.5
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0)
                        },
                        effectBase(){
                                let base = new Decimal(2)
                                if (hasUpgrade("o", 43)) base = base.plus(layers.o.buyables[11].total().div(100))
                                return base
                        },
                        effect(){
                                let x = layers.o.buyables[23].total()
                                let base = layers.o.buyables[23].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.o.points.gte(layers.o.buyables[23].cost())
                        },
                        total(){
                                return getBuyableAmount("o", 23).plus(layers.o.buyables[23].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("o", 41)) ret = ret.plus(2)
                                ret = ret.plus(layers.o.buyables[33].total())
                                if (hasUpgrade("o", 43)) ret = ret.plus(layers.o.buyables[31].total())
                                if (devSpeedUp && layers.o.buyables[23].unlocked()) ret = ret.plus(1)
                                return ret
                        },
                        buy(){
                                let cost = layers.o.buyables[23].cost()
                                if (!layers.o.buyables[23].canAfford()) return
                                player.o.buyables[23] = player.o.buyables[23].plus(1)
                                player.o.points = player.o.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return hasUpgrade("o", 31) },
                },
                31: {
                        title: "Neutrino Boost",
                        display(){
                                let additional = ""
                                let ex = layers.o.buyables[31].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.o.buyables[31]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: ^" + format(layers.o.buyables[31].effect(), 4) + " Neutrino Gain</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.o.buyables[31].cost()) + " Origins</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.o.buyables[31].effectBase(), 3) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("o", 31).plus(a)
                                let base0 = 50e6
                                let base1 = 3
                                let base2 = 2
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0)
                        },
                        effectBase(){
                                let base = new Decimal(1.25)
                                return base
                        },
                        effect(){
                                let x = layers.o.buyables[31].total()
                                let base = layers.o.buyables[31].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.o.points.gte(layers.o.buyables[31].cost())
                        },
                        total(){
                                return getBuyableAmount("o", 31).plus(layers.o.buyables[31].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("o", 45)) ret = ret.plus(layers.o.buyables[32].total())
                                if (hasUpgrade("f", 11)) ret = ret.plus(layers.o.buyables[33].total())
                                return ret
                        },
                        buy(){
                                let cost = layers.o.buyables[31].cost()
                                if (!layers.o.buyables[31].canAfford()) return
                                player.o.buyables[31] = player.o.buyables[31].plus(1)
                                player.o.points = player.o.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return hasUpgrade("o", 43) },
                },
                32: {
                        title: "Shard Boost",
                        display(){
                                let additional = ""
                                let ex = layers.o.buyables[32].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.o.buyables[32]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: ^" + format(layers.o.buyables[32].effect(), 4) + " Shard gain</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.o.buyables[32].cost()) + " Origins</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.o.buyables[32].effectBase(), 3) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("o", 32).plus(a)
                                let base0 = 5e10
                                let base1 = 10
                                let base2 = 5
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0)
                        },
                        effectBase(){
                                let base = new Decimal(5)
                                return base
                        },
                        effect(){
                                let x = layers.o.buyables[32].total()
                                let base = layers.o.buyables[32].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.o.points.gte(layers.o.buyables[32].cost())
                        },
                        total(){
                                return getBuyableAmount("o", 32).plus(layers.o.buyables[32].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("o", 52)) ret = ret.plus(2)
                                if (hasUpgrade("o", 53)) ret = ret.plus(layers.o.buyables[33].total())
                                return ret
                        },
                        buy(){
                                let cost = layers.o.buyables[32].cost()
                                if (!layers.o.buyables[32].canAfford()) return
                                player.o.buyables[32] = player.o.buyables[32].plus(1)
                                player.o.points = player.o.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return hasUpgrade("o", 43) },
                },
                33: {
                        title: "Base Origin Boost",
                        display(){
                                let additional = ""
                                let ex = layers.o.buyables[33].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.o.buyables[33]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: *" + format(layers.o.buyables[33].effect()) + " Base Origins</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.o.buyables[33].cost()) + " Origins</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.o.buyables[33].effectBase(), 3) + "^x</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("o", 33).plus(a)
                                let base0 = 1e39
                                let base1 = 2
                                let base2 = 25
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0)
                        },
                        effectBase(){
                                let base = new Decimal(5)
                                let a = player.i.points.max(10).log10().max(10).log10().max(10).log10()
                                if (a.gt(5)) base = a
                                base = base.plus(layers.f.waterEffect())
                                return base
                        },
                        effect(){
                                let x = layers.o.buyables[33].total()
                                let base = layers.o.buyables[33].effectBase()
                                return Decimal.pow(base, x)
                        },
                        canAfford(){
                                return player.o.points.gte(layers.o.buyables[33].cost())
                        },
                        total(){
                                return getBuyableAmount("o", 33).plus(layers.o.buyables[33].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                if (hasUpgrade("o", 55)) ret = ret.plus(player.f.upgrades.length)
                                ret = ret.plus(layers.f.g6pEffect())
                                return ret
                        },
                        buy(){
                                let cost = layers.o.buyables[33].cost()
                                if (!layers.o.buyables[33].canAfford()) return
                                player.o.buyables[33] = player.o.buyables[33].plus(1)
                                player.o.points = player.o.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return hasUpgrade("o", 43) },
                },
        },
        upgrades:{
                rows: 5,
                cols: 5,
                11: {
                        title: "Ahlfors",
                        description: "Gain a free Incrementy Stamina level",
                        cost: new Decimal(1),
                        unlocked(){
                                return true
                        }
                },
                12: {
                        title: "Douglas",
                        description: "Multiply all higher row prestige resource gain exponents by 1.001",
                        cost: new Decimal(1),
                        unlocked(){
                                return hasUpgrade("o", 11) || player.c.best.gt(0)
                        }
                },
                13: {
                        title: "Grothendieck",
                        description: "Multiply Super Prestige gain and effect by 2 and gain 5x more SP resets",
                        cost: new Decimal(1),
                        unlocked(){
                                return hasUpgrade("o", 12) || player.c.best.gt(0)
                        }
                },
                14: {
                        title: "Baker",
                        description: "Each Origin reset allows you to keep two more Shard upgrades and gain a free Incrementy Stamina level",
                        cost: new Decimal(2),
                        unlocked(){
                                return hasUpgrade("o", 13) || player.c.best.gt(0)
                        }
                },
                15: {
                        title: "Hironaka",
                        description: "Get a free Incrementy Stamina level per Origin Upgrade",
                        cost: new Decimal(2),
                        unlocked(){
                                return hasUpgrade("o", 14) || player.c.best.gt(0)
                        }
                },
                21: {
                        title: "Novikov",
                        description: "Keep π upgrades, π milestones, I upgrades, and multiply Origin gain by 1.5",
                        cost: new Decimal(5),
                        unlocked(){
                                return hasUpgrade("o", 15) || player.c.best.gt(0)
                        }
                },
                22: {
                        title: "Mumford",
                        description: "Unlock another buyable and Incrementy autobuyers can buy 25x faster",
                        cost: new Decimal(5),
                        unlocked(){
                                return (hasUpgrade("o", 21) && getBuyableAmount("o", 11).gte(3))  || player.c.best.gt(0)
                        }
                },
                23: {
                        title: "Deligne",
                        description: "Unlock another buyable and double Origin gain",
                        cost: new Decimal(10),
                        unlocked(){
                                return (hasUpgrade("o", 22) && getBuyableAmount("o", 12).gte(2)) || player.c.best.gt(0)
                        }
                },
                24: {
                        title: "Fefferman",
                        description: "Pion Boost gives free Incrementy Boost levels and double Origin gain",
                        cost: new Decimal(25),
                        unlocked(){
                                return (hasUpgrade("o", 23) && getBuyableAmount("o", 13).gte(2)) || player.c.best.gt(0)
                        }
                },
                25: {
                        title: "Margulis",
                        description: "Stamina Boost gives free Pion Boost levels",
                        cost: new Decimal(50),
                        unlocked(){
                                return (hasUpgrade("o", 24) && getBuyableAmount("o", 13).gte(3) || getBuyableAmount("o", 12).gte(3)) || player.c.best.gt(0)
                        }
                },
                31: {
                        title: "Quillen",
                        description: "Unlock three Origin buyables and each Incrementy Boost buyable adds .001 to its base",
                        cost: new Decimal(200),
                        unlocked(){
                                return (hasUpgrade("o", 25) && getBuyableAmount("o", 13).gte(3) && getBuyableAmount("o", 12).gte(3)) || player.c.best.gt(0)
                        }
                },
                32: {
                        title: "Connes",
                        description: "Stamina Boost buyables give levels to Incrementy Boost and each Pion Boost buyable adds .002 to its base",
                        cost: new Decimal(200),
                        unlocked(){
                                return hasUpgrade("o", 31) || player.c.best.gt(0)
                        }
                },
                33: {
                        title: "Yau",
                        description: "Each Incrementy Boost buyable increases the Incrementy Stamina softcap start by one",
                        cost: new Decimal(250),
                        unlocked(){
                                return hasUpgrade("o", 32) || player.c.best.gt(0)
                        }
                },
                34: {
                        title: "Donaldson",
                        description: "Each Origin upgrade gives a free Incrementy Boost buyable and triple Origin gain",
                        cost: new Decimal(500),
                        unlocked(){
                                return (hasUpgrade("o", 33) && getBuyableAmount("o", 22).gte(1)) || player.c.best.gt(0)
                        }
                },
                35: {
                        title: "Faltings",
                        description: "Remove the ability to Prestige but gain 100% of Origins on prestige per second",
                        cost: new Decimal(2500),
                        unlocked(){
                                return (hasUpgrade("o", 34) && getBuyableAmount("o", 21).gte(2)) || player.c.best.gt(0)
                        }
                },
                41: {
                        title: "Freedman",
                        description: "Origin Boost gives free levels to Super Prestige Boost and gain two free Origin Boosts",
                        cost: new Decimal(4e5),
                        unlocked(){
                                return hasUpgrade("o", 35) || player.c.best.gt(0)
                        }
                },
                42: {
                        title: "Drinfeld",
                        description: "Super Prestige Boost gives free levels to Particle Boost and push the Incrementy Stamina softcap start back by 42",
                        cost: new Decimal(5e6),
                        unlocked(){
                                return hasUpgrade("o", 41) || player.c.best.gt(0)
                        }
                },
                43: {
                        title: "Mori",
                        description: "Unlock a third row of Origin Buyables and each Incrementy Boost buyable adds .01 to Origin Boost base",
                        cost: new Decimal(6e6),
                        unlocked(){
                                return hasUpgrade("o", 42) || player.c.best.gt(0)
                        }
                },
                44: {
                        title: "Jones",
                        description: "Neutrino Boost levels give three free levels to Super Prestige Boost and one to Origin Boost",
                        cost: new Decimal(2e7),
                        unlocked(){
                                return hasUpgrade("o", 43) || player.c.best.gt(0)
                        }
                },
                45: {
                        title: "Bourgain",
                        description: "Shard Boost gives free levels to Neutrino Boost and add .1 to the Incrementy Boost base",
                        cost: new Decimal(1e11),
                        unlocked(){
                                return hasUpgrade("o", 44) || player.c.best.gt(0)
                        }
                },
                51: {
                        title: "Witten",
                        description: "Origin Boost gives free levels to Particle Boost and add .1 to the base",
                        cost: new Decimal(5e19),
                        unlocked(){
                                return hasUpgrade("o", 45) || player.c.best.gt(0)
                        }
                },
                52: {
                        title: "Lions",
                        description: "Gain two free levels of Shard Boost and Neutrino Autobuyers can buy 100x more",
                        cost: new Decimal(1e24),
                        unlocked(){
                                return hasUpgrade("o", 51) || player.c.best.gt(0)
                        }
                },
                53: {
                        title: "Yoccoz",
                        description: "Base Origin buyables give free levels to Shard Boost",
                        cost: new Decimal(1.5e59),
                        unlocked(){
                                return hasUpgrade("o", 52) || player.c.best.gt(0)
                        }
                },
                54: {
                        title: "Zelmanov",
                        description: "Per Origin Boost Buyables cubed you can buy one more Incrementy Stamina level and unlock Fragments",
                        cost: new Decimal(2e145),
                        unlocked(){
                                return hasUpgrade("o", 53) || player.c.best.gt(0)
                        }
                },
                55: {
                        title: "Villani",
                        description: "Each Fragment upgrade gives a free Base Origin Boost",
                        cost: new Decimal("1e1550"),
                        unlocked(){
                                return hasUpgrade("o", 54) || player.c.best.gt(0)
                        }
                },
        },
        milestones: {
                0: {
                        requirementDescription: "<b>Hörmander</b><br>Requires: 1 total Origins", 
                        effectDescription: "Origin effect boosts Base Incrementy, autobuyers buy 10x more, and each Origin milestone raises Boson Challenge goals ^.98",
                        done(){
                                return player.o.total.gte(1)
                        },
                },
                1: {
                        requirementDescription: "<b>Milnor</b><br>Requires: 2 total Origins", 
                        effectDescription: "Origin effect boosts Antimatter and you always have autobuyers",
                        done(){
                                return player.o.total.gte(2)
                        },
                },
                2: {
                        requirementDescription: "<b>Atiyah</b><br>Requires: 3 total Origins", 
                        effectDescription: "Origin effect boosts Amoebas and total Origins multiply Shard gain",
                        done(){
                                return player.o.total.gte(3)
                        },
                },
                3: {
                        requirementDescription: "<b>Cohen</b><br>Requires: 5 total Origins", 
                        effectDescription(){
                                let a = "Origin effect boosts Matter and best Origins logarithmically boost Super Prestige Point gain, currently: "
                                let b = format(Decimal.add(3, player.o.times).ln())
                                return a + b
                        },
                        done(){
                                return player.o.total.gte(5)
                        },
                },
                4: {
                        requirementDescription: "<b>Smale</b><br>Requires: 8 total Origins", 
                        effectDescription: "Origin effect boosts Particles and keep Boson Challenge completions",
                        done(){
                                return player.o.total.gte(8)
                        },
                },
                5: {
                        requirementDescription: "<b>Thompson</b><br>Requires: 13 total Origins", 
                        effectDescription: "Origin effects Shards, keep the first four rows of Super Prestige upgrades, and Super Prestige times",
                        done(){
                                return player.o.total.gte(13)
                        },
                },
                6: {
                        requirementDescription: "<b>Bombieri</b><br>Requires: 21 total Origins", 
                        effectDescription: "Origin effects Super Prestige Points and keep the fifth row of Super Prestige upgrades",
                        done(){
                                return player.o.total.gte(21)
                        },
                }, 
        },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                return hasUpgrade("pi", 44) || hasUnlockedRow(4)
        },
        tabFormat: {
                "Upgrades": {
                        content: [
                                "main-display",
                                ["resource-display", "", function (){ return hasUpgrade("o", 35) ? {'display': 'none'} : {}}],
                                ["prestige-button", "", function (){ return hasUpgrade("o", 35) ? {'display': 'none'} : {}}],
                                ["display-text", function(){
                                        if (!hasUpgrade("o", 35)) return "You have " + format(player.pi.points) + " Pions"
                                        return "You are gaining " + format(layers.o.getResetGain()) + " Origins per second"
                                }],
                                "upgrades"
                        ],
                        unlocked(){
                                return true
                        },
                },
                "Buyables": {
                        content: [
                                "main-display",
                                ["display-text", function(){
                                        if (!hasUpgrade("o", 31)) return ""
                                        if (shiftDown && hasUpgrade("o", 35)) return "You are gaining " + format(layers.o.getResetGain()) + " Origins per second"
                                        return "Each Origin Buyable gives free levels to all above buyables"
                                }],
                                "buyables",
                        ],
                        unlocked(){
                                return true
                        },
                },
                "QoL": {
                        content: [
                                "main-display",
                                "milestones",
                        ],
                        unlocked(){
                                return true
                        },
                },
        },
        doReset(layer){
                if (false) console.log(layer)
                if (layers[layer].row <= 3) return
                player.o.time = 0
                if (layers[layer].row <= 4 && layer != "c") return

                //resource
                player.o.points = new Decimal(0)
                player.o.best = new Decimal(0)
                player.o.times = 0
                player.o.total = new Decimal(0)
                
                let keep = []
                j = Math.min(25, player.c.times)
                if (hasMilestone("c", 6)) {
                        keep = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45,51,52,53,54,55].slice(0, j)
                }
                player.o.upgrades = filter(player.o.upgrades, keep)

                let keep2 = []
                if (hasMilestone("c", 1)) keep2.push(0)
                player.o.milestones = filter(player.o.milestones, keep2)

                let resetBuyables = [11,12,13,21,22,23,31,32,33]
                for (let j = 0; j < resetBuyables.length; j++) {
                        player.o.buyables[resetBuyables[j]] = new Decimal(0)
                }
        },
})


addLayer("f", {
        name: "Fragment", 
        symbol: "F", 
        position: -1,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
                total: new Decimal(0),
                h: new Decimal(0),
                c: new Decimal(0),
                n: new Decimal(0),
                o: new Decimal(0),
                p: new Decimal(0),
                s: new Decimal(0),
                currentTime: 0,
                abTime: 0,
                molecules: {
                        water: new Decimal(0),
                        glucose: new Decimal(0),
                        ammonia: new Decimal(0),
                        atp: new Decimal(0),
                        methane: new Decimal(0),
                        nadph: new Decimal(0),
                        co2: new Decimal(0),
                        rubp: new Decimal(0),
                        g6p: new Decimal(0),
                        acetylcoa: new Decimal(0),
                        f6p: new Decimal(0),
                },
        }},
        color: "#41FFEC",
        requires: Decimal.pow(10, 147), 
        resource: "Fragments",
        baseAmount() {return player.o.best}, 
        branches: ["o"],
        type: "custom", 
        effect(){
                let amt = player.f.points
                let ret = amt.plus(10).log10().plus(9).log10()

                if (hasUpgrade("f", 22)) ret = ret.pow(Decimal.pow(player.f.upgrades.length, 2).max(1))

                return ret
        },
        effectDescription(){
                let eff = layers.f.effect()
                let a = "which increases Origin gain by " + format(eff)

                return a + "."
        },
        getResetGain() {
                let amt = layers.f.baseAmount()
                let pre = layers.f.getGainMultPre()
                let exp = layers.f.getGainExp()
                let pst = layers.f.getGainMultPost()
                
                let ret = amt.max(10).log10().div(14.7).log10().times(pre).max(1).pow(exp).sub(1).max(0).times(pst)

                if (hasMilestone("c", 1))  ret = doMilestoneC1Buff(ret)

                ret = ret.floor().max(0)

                if (hasUpgrade("c", 11)) {
                        if (ret.layer < 1e10) {
                                ret = Decimal.tetrate(ret, player.c.points.plus(1))
                                return ret
                        }
                        ret.layer += player.c.points.toNumber()
                }

                return ret
        },
        getGainExp(){
                let x = new Decimal(10)
                return x
        },
        getGainMultPre(){
                let x = new Decimal(1)
                if (devSpeedUp) x = x.times(1.1)
                return x
        },
        getGainMultPost(){
                let x = new Decimal(100)
                if (hasUpgrade("f", 15)) x = x.times(upgradeEffect("f", 15))
                x = x.times(layers.f.glucoseEffect())
                if (hasUpgrade("f", 21)) x = x.times(player.f.molecules.ammonia.plus(1))
                x = x.times(Decimal.pow(layers.f.co2Effect(), layers.o.buyables[33].total()))
                if (hasMilestone("c", 3)) x = x.times(layers.c.effect())
                return x
        },
        prestigeButtonText(){
                let gain = layers.f.getResetGain()
                let start = "Reset to gain " + formatWhole(gain) + " Fragments<br>"
                let pre = layers.f.getGainMultPre()
                let exp = layers.f.getGainExp()
                let pst = layers.f.getGainMultPost()
                let nextAt = "Next at " + format(Decimal.pow(10, Decimal.pow(10, gain.plus(1).div(pst).plus(1).root(exp).div(pre)).times(14.7))) + " Best Origins"
                if (gain.gt(1e6)) nextAt = ""
                return start + nextAt
        },
        canReset(){
                return layers.f.getResetGain().gt(0) && hasUpgrade("pi", 44) && player.f.currentTime >= 5 && (player.f.currentTime >= 30 || hasMilestone("c", 2))
        },
        update(diff){
                player.f.currentTime += diff
                player.f.abTime += diff
                
                if (hasUpgrade("f", 34)) {
                        if (player.f.abTime > 1) {
                                if (!hasUpgrade("f", 41)) layers.f.clickables[31].onClick()
                                if (hasMilestone("c", 6)){
                                        layers.f.clickables[11].onClick()
                                        layers.f.clickables[12].onClick()
                                        layers.f.clickables[13].onClick()
                                        layers.f.clickables[14].onClick()
                                        layers.f.clickables[15].onClick()
                                        layers.f.clickables[21].onClick()
                                        layers.f.clickables[22].onClick()
                                        layers.f.clickables[23].onClick()
                                        layers.f.clickables[24].onClick()
                                        layers.f.clickables[25].onClick()
                                }
                                player.f.abTime += -1
                                if (player.f.abTime > 10) player.f.abTime = 10 
                        }
                } else {
                        player.f.abTime = 0
                }

                if (hasUpgrade("f", 41)){
                        let t = layers.f.clickables.getMaximumPossible(31).times(diff).times(.01).max(0)
                        player.f.molecules.f6p = player.f.molecules.f6p.plus(t)
                }
                let y = layers.f.getResetGain()
                
                if (hasUpgrade("f", 24)) generatePoints("f", Decimal.times(diff, .01))
                if (hasUpgrade("f", 25)) generatePoints("f", Decimal.times(diff, .99))
                                
                if (true){
                        player.f.h  = player.f.h.plus( layers.f.buyables[11].effect().times(diff))
                        player.f.c  = player.f.c.plus( layers.f.buyables[12].effect().times(diff))
                        player.f.n  = player.f.n.plus( layers.f.buyables[13].effect().times(diff))
                        player.f.o  = player.f.o.plus( layers.f.buyables[21].effect().times(diff))
                        player.f.p  = player.f.p.plus( layers.f.buyables[22].effect().times(diff))
                        player.f.s  = player.f.s.plus( layers.f.buyables[23].effect().times(diff))
                }
                player.f.best = player.f.best.max(player.f.points)
        },
        upgrades:{
                rows: 5,
                cols: 5,
                11: {
                        title: "Borcherds",
                        description: "Base Origin Boost gives free levels to Neutrino Boost",
                        cost: new Decimal(10),
                        unlocked(){
                                return true
                        }
                },
                12: {
                        title: "Gowers",
                        description: "Each Fragment upgrade makes fragments multiply origin gain",
                        cost: new Decimal(2500),
                        unlocked(){
                                return hasUpgrade("f", 11) || player.c.best.gt(0)
                        }
                },
                13: {
                        title: "Kontsevich",
                        description: "Per Fragment upgrade per Base Origin Boost add .01 to the Pion Boost base",
                        cost: new Decimal(4000),
                        unlocked(){
                                return hasUpgrade("f", 12) || player.c.best.gt(0)
                        }
                },
                14: {
                        title: "McMullen",
                        description: "Unlock workers",
                        cost: new Decimal(2e4),
                        unlocked(){
                                return hasUpgrade("f", 13) || player.c.best.gt(0)
                        }
                },
                15: {
                        title: "Lafforgue",
                        description: "Double fragment gain per upgrade",
                        cost: new Decimal(1e4),
                        effect(){
                                return Decimal.pow(2, player.f.upgrades.length).pow(layers.f.rubpEffect())
                        },
                        unlocked(){
                                return hasUpgrade("f", 14) || player.c.best.gt(0)
                        }
                },
                21: {
                        title: "Voevodsky",
                        description: "Ammonia multiples Fragment gain",
                        cost: new Decimal(1e7),
                        unlocked(){
                                return hasUpgrade("f", 15) || player.c.best.gt(0)
                        }
                },
                22: {
                        title: "Okounkov",
                        description: "Raise fragement effect to the square of the Fragment upgrade amount and first row Workers do not cost Fragments",
                        cost: new Decimal(2.5e11),
                        unlocked(){
                                return hasUpgrade("f", 21) || player.c.best.gt(0)
                        }
                },
                23: {
                        title: "Perelman",
                        description: "Phosphorus Gatherers give free levels to Super Prestige Boost",
                        cost: new Decimal(1e13),
                        unlocked(){
                                return hasUpgrade("f", 22) || player.c.best.gt(0)
                        }
                },
                24: {
                        title: "Tao",
                        description: "Second row Workers do not cost Fragments and gain 1% of Fragments upon prestige each second",
                        cost: new Decimal(3e13),
                        unlocked(){
                                return hasUpgrade("f", 23) || player.c.best.gt(0)
                        }
                },
                25: {
                        title: "Werner",
                        description: "Remove the ability to Prestige but gain 99% of Fragments upon prestige each second",
                        cost: new Decimal(7.5e14),
                        unlocked(){
                                return hasUpgrade("f", 24) || player.c.best.gt(0)
                        }
                },
                31: {
                        title: "Lindenstrauss",
                        description: "Nitrogen Gatherers give free levels to Stamina Boost",
                        cost: new Decimal(7.5e16),
                        unlocked(){
                                return hasUpgrade("f", 25) || player.c.best.gt(0)
                        }
                },
                32: {
                        title: "Châu",
                        description: "Multiply worker effeciency by Fragment upgrades sqaured",
                        cost: new Decimal(1e20),
                        unlocked(){
                                return hasUpgrade("f", 31) || player.c.best.gt(0)
                        }
                },
                33: {
                        title: "Smirnov",
                        description: "Buy one Origin buyable per second and square Carbon Dioxide and NADPH base",
                        cost: new Decimal(1e29),
                        unlocked(){
                                return hasUpgrade("f", 32) || player.c.best.gt(0)
                        }
                },
                34: {
                        title: "Avila",
                        description: "Buy F6P once per second",
                        cost: new Decimal("4.1pt10"),
                        unlocked(){
                                return (hasUpgrade("f", 33) && player.i.points.gt(new Decimal("4pt10")) || hasUpgrade("f", 34)) || player.c.best.gt(0)
                        }
                },
                35: {
                        title: "Bhargava",
                        description: "Fragments multiply gatherer production",
                        cost: new Decimal("4.30103pt10"),
                        unlocked(){
                                return hasUpgrade("f", 34) || player.c.best.gt(0)
                        }
                },
                41: {
                        title: "Hairer",
                        description: "Gain 1% of your F6P upon click per second but disable Avila",
                        cost: new Decimal("149pt10"),
                        unlocked(){
                                return hasUpgrade("f", 35) || player.c.best.gt(0)
                        }
                },
                42: {
                        title: "Mirzakhani",
                        description: "Unlock Capsule and the ability to Capsule reset",
                        cost: new Decimal("1999pt10"),
                        unlocked(){
                                return hasUpgrade("f", 41) || player.c.best.gt(0)
                        }
                },
        },
        buyables: {
                rows: 3,
                cols: 3,
                allMult(){
                        let ret = new Decimal(1)
                        ret = ret.times(layers.f.atpEffect())
                        if (hasUpgrade("f", 32))  ret = ret.times(Decimal.pow(player.f.upgrades.length, 2).max(1))
                        if (hasUpgrade("f", 35))  ret = ret.times(player.f.points.plus(1))
                        if (hasMilestone("c", 3)) ret = ret.times(layers.c.effect())
                        return ret
                },
                11: {
                        title: "<h3 style='color: #A00000'>Hydrogen</h3> <h3>Gatherer</h3>",
                        display(){
                                let additional = ""
                                let ex = layers.f.buyables[11].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.f.buyables[11]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: " + format(layers.f.buyables[11].effect(), 4) + "/s</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.f.buyables[11].cost()) + " Fragments</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.f.buyables[11].perProduction(), 3) + "/s per worker</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("f", 11).plus(a)
                                let base0 = 5e3
                                let base1 = 1.1
                                let base2 = 1.001
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0).ceil()
                        },
                        perProduction(){
                                let base = new Decimal(1)
                                base = base.times(layers.f.buyables.allMult())
                                return base
                        },
                        effect(){
                                let x = layers.f.buyables[11].total()
                                let per = layers.f.buyables[11].perProduction()
                                return Decimal.times(per, x)
                        },
                        canAfford(){
                                return player.f.points.gte(layers.f.buyables[11].cost())
                        },
                        total(){
                                return getBuyableAmount("f", 11).plus(layers.f.buyables[11].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                return ret
                        },
                        buy(){
                                let cost = layers.f.buyables[11].cost()
                                if (!layers.f.buyables[11].canAfford()) return
                                player.f.buyables[11] = player.f.buyables[11].plus(1)
                                if (!hasUpgrade("f", 22)) player.f.points = player.f.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return true},
                },
                12: {
                        title: "<h3 style='color: #00A0A0'>Carbon</h3> <h3>Gatherer</h3>",
                        display(){
                                let additional = ""
                                let ex = layers.f.buyables[12].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.f.buyables[12]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: " + format(layers.f.buyables[12].effect(), 4) + "/s</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.f.buyables[12].cost()) + " Fragments</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.f.buyables[12].perProduction(), 3) + "/s per worker</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("f", 12).plus(a)
                                let base0 = 1e5
                                let base1 = 1.2
                                let base2 = 1.002
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0)
                        },
                        perProduction(){
                                let base = new Decimal(.2)
                                base = base.times(layers.f.buyables.allMult())
                                return base
                        },
                        effect(){
                                let x = layers.f.buyables[12].total()
                                let per = layers.f.buyables[12].perProduction()
                                return Decimal.times(per, x)
                        },
                        canAfford(){
                                return player.f.points.gte(layers.f.buyables[12].cost())
                        },
                        total(){
                                return getBuyableAmount("f", 12).plus(layers.f.buyables[12].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                return ret
                        },
                        buy(){
                                let cost = layers.f.buyables[12].cost()
                                if (!layers.f.buyables[12].canAfford()) return
                                player.f.buyables[12] = player.f.buyables[12].plus(1)
                                if (!hasUpgrade("f", 22)) player.f.points = player.f.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return true},
                },
                13: {
                        title: "<h3 style='color: #0000A0'>Nitrogen</h3> <h3>Gatherer</h3>",
                        display(){
                                let additional = ""
                                let ex = layers.f.buyables[13].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.f.buyables[13]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: " + format(layers.f.buyables[13].effect(), 4) + "/s</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.f.buyables[13].cost()) + " Fragments</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.f.buyables[13].perProduction(), 3) + "/s per worker</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("f", 13).plus(a)
                                let base0 = 3e6
                                let base1 = 1.3
                                let base2 = 1.003
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0)
                        },
                        perProduction(){
                                let base = new Decimal(.2)
                                base = base.times(layers.f.buyables.allMult())
                                return base
                        },
                        effect(){
                                let x = layers.f.buyables[13].total()
                                let per = layers.f.buyables[13].perProduction()
                                return Decimal.times(per, x)
                        },
                        canAfford(){
                                return player.f.points.gte(layers.f.buyables[13].cost())
                        },
                        total(){
                                return getBuyableAmount("f", 13).plus(layers.f.buyables[13].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                return ret
                        },
                        buy(){
                                let cost = layers.f.buyables[13].cost()
                                if (!layers.f.buyables[13].canAfford()) return
                                player.f.buyables[13] = player.f.buyables[13].plus(1)
                                if (!hasUpgrade("f", 22)) player.f.points = player.f.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return true},
                },
                21: {
                        title: "<h3 style='color: #00A000'>Oxygen</h3> <h3>Gatherer</h3>",
                        display(){
                                let additional = ""
                                let ex = layers.f.buyables[21].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.f.buyables[21]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: " + format(layers.f.buyables[21].effect(), 4) + "/s</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.f.buyables[21].cost()) + " Fragments</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.f.buyables[21].perProduction(), 3) + "/s per worker</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("f", 21).plus(a)
                                let base0 = 1e4
                                let base1 = 1.15
                                let base2 = 1.004
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0).ceil()
                        },
                        perProduction(){
                                let base = new Decimal(.5)
                                base = base.times(layers.f.buyables.allMult())
                                return base
                        },
                        effect(){
                                let x = layers.f.buyables[21].total()
                                let per = layers.f.buyables[21].perProduction()
                                return Decimal.times(per, x)
                        },
                        canAfford(){
                                return player.f.points.gte(layers.f.buyables[21].cost())
                        },
                        total(){
                                return getBuyableAmount("f", 21).plus(layers.f.buyables[21].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                return ret
                        },
                        buy(){
                                let cost = layers.f.buyables[21].cost()
                                if (!layers.f.buyables[21].canAfford()) return
                                player.f.buyables[21] = player.f.buyables[21].plus(1)
                                if (!hasUpgrade("f", 24)) player.f.points = player.f.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return true},
                },
                22: {
                        title: "<h3 style='font-size:100%;color: #A000A0'>Phosphorus</h3> <h3 style='font-size:100%'>Gatherer</h3>",
                        display(){
                                let additional = ""
                                let ex = layers.f.buyables[22].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.f.buyables[22]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: " + format(layers.f.buyables[22].effect(), 4) + "/s</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.f.buyables[22].cost()) + " Fragments</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.f.buyables[22].perProduction(), 3) + "/s per worker</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("f", 22).plus(a)
                                let base0 = 1e10
                                let base1 = 1.25
                                let base2 = 1.005
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0)
                        },
                        perProduction(){
                                let base = new Decimal(.1)
                                base = base.times(layers.f.buyables.allMult())
                                return base
                        },
                        effect(){
                                let x = layers.f.buyables[22].total()
                                let per = layers.f.buyables[22].perProduction()
                                return Decimal.times(per, x)
                        },
                        canAfford(){
                                return player.f.points.gte(layers.f.buyables[22].cost())
                        },
                        total(){
                                return getBuyableAmount("f", 22).plus(layers.f.buyables[22].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                return ret
                        },
                        buy(){
                                let cost = layers.f.buyables[22].cost()
                                if (!layers.f.buyables[22].canAfford()) return
                                player.f.buyables[22] = player.f.buyables[22].plus(1)
                                if (!hasUpgrade("f", 24)) player.f.points = player.f.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return true},
                },
                23: {
                        title: "<h3 style='color: #F0A000'>Sulfur</h3> <h3>Gatherer</h3>",
                        display(){
                                let additional = ""
                                let ex = layers.f.buyables[23].extra()
                                if (ex.gt(0)) additional = "+" + formatWhole(ex)

                                let start = "<b><h2>Amount</h2>: " + formatWhole(player.f.buyables[23]) + additional + "</b><br>"
                                let eff = "<b><h2>Effect</h2>: " + format(layers.f.buyables[23].effect(), 4) + "/s</b><br>"
                                let cost = "<b><h2>Cost</h2>: " + format(layers.f.buyables[23].cost()) + " Fragments</b><br>"
                                let eformula = "<b><h2>Effect formula</h2>:<br>" + format(layers.f.buyables[23].perProduction(), 3) + "/s per worker</b><br>"
                                let end = shiftDown ? eformula : "Shift to see details"
                                return "<br>" + start + eff + cost + end
                        },
                        cost(a){
                                let x = getBuyableAmount("f", 23).plus(a)
                                let base0 = 1e25
                                let base1 = 1.35
                                let base2 = 1.006
                                let exp2 = x.times(x)
                                return Decimal.pow(base2, exp2).times(Decimal.pow(base1, x)).times(base0)
                        },
                        perProduction(){
                                let base = new Decimal(.1)
                                base = base.times(layers.f.buyables.allMult())
                                return base
                        },
                        effect(){
                                let x = layers.f.buyables[23].total()
                                let per = layers.f.buyables[23].perProduction()
                                return Decimal.times(per, x)
                        },
                        canAfford(){
                                return player.f.points.gte(layers.f.buyables[23].cost())
                        },
                        total(){
                                return getBuyableAmount("f", 23).plus(layers.f.buyables[23].extra())
                        },
                        extra(){
                                let ret = new Decimal(0)
                                return ret
                        },
                        buy(){
                                let cost = layers.f.buyables[23].cost()
                                if (!layers.f.buyables[23].canAfford()) return
                                player.f.buyables[23] = player.f.buyables[23].plus(1)
                                if (!hasUpgrade("f", 24)) player.f.points = player.f.points.minus(cost)
                        },
                        buyMax(maximum){       
                                return
                        },
                        unlocked(){ return true},
                },
        },
        clickables:{
                rows: 5,
                cols: 5,
                getMaximumPossible(id, mode = "buy"){
                        let target
                        if (id == 11) {
                                target = player.f.h.div(2).min(player.f.o)
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        }
                        if (id == 12) {
                                target = player.f.h.div(12).min(player.f.o.div(6)).min(player.f.c.div(6))
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        }
                        if (id == 13) {
                                target = player.f.h.div(3).min(player.f.n)
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        }
                        if (id == 14) {
                                target = player.f.h.div(16).min(player.f.n.div(5)).min(player.f.p.div(3)).min(player.f.c.div(10)).min(player.f.o.div(13))
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        } // C10H16N5O13P3
                        if (id == 15) {
                                target = player.f.h.div(4).min(player.f.c.div(1))
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        }
                        if (id == 21) {
                                target = player.f.h.div(29).min(player.f.n.div(7)).min(player.f.p.div(3)).min(player.f.c.div(21)).min(player.f.o.div(17))
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        } // C21H29N7O17P3
                        if (id == 22) {
                                target = player.f.o.div(2).min(player.f.c.div(1))
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        }
                        if (id == 23) {
                                target = player.f.h.div(12).min(player.f.p.div(2)).min(player.f.c.div(5)).min(player.f.o.div(11))
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        } // C5H12O11P2
                        if (id == 24) {
                                target = player.f.h.div(13).min(player.f.p.div(1)).min(player.f.c.div(6)).min(player.f.o.div(9))
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        } // C6H13O9P
                        if (id == 25) {
                                target = player.f.h.div(38).min(player.f.p.div(3)).min(player.f.c.div(23)).min(player.f.o.div(17)).min(player.f.n.div(7)).min(player.f.s.div(1))
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        } // C23H38N7O17P3S
                        if (id == 31) {
                                target = player.f.h.div(13).min(player.f.p.div(1)).min(player.f.c.div(6)).min(player.f.o.div(9))
                                if (mode == "buy") return target.minus(1).div(10).plus(1).floor()
                        } // C6H13O9P

                        return new Decimal(0)
                },
                rowunlocked(n){
                        let data = layers.f.clickables
                        let x = [10*n+1,10*n+2,10*n+3,10*n+4,10*n+5]
                        for (i = 0; i < 5; i ++) {
                                if (data[x[i]] == undefined) continue
                                if (data[x[i]].unlocked() == true) return true
                        }
                        return false
                },
                11: {
                        title: "<h3 style='color: #303000'>Water</h3><br><h3 style='color: #A00000'>H</h3><sub>2</sub><h3 style='color: #00A000'>O</h3>",
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(11)

                                let a = "Purchase 10% of the max possible<br>(" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.water) + "<br>Water"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return true
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(11).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(11)

                                player.f.molecules.water = player.f.molecules.water.plus(target)
                                
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(2))
                                player.f.o = player.f.o.sub(target.times(1))
                        },
                },
                12: {
                        title: "<h3 style='color: #703000'>Glucose</h3><br><h3 style='color: #00A0A0'>C</h3><sub>6</sub><h3 style='color: #A00000'>H</h3><sub>12</sub><h3 style='color: #00A000'>O</h3><sub>6</sub>",
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(12)

                                let a = "Purchase 10% of the max possible<br>(" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.glucose) + "<br>Glucose"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return true
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(12).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(12)

                                player.f.molecules.glucose = player.f.molecules.glucose.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(12))
                                player.f.o = player.f.o.sub(target.times( 6))
                                player.f.c = player.f.c.sub(target.times( 6))
                        },
                },
                13: {
                        title: "<h3 style='color: #703070'>Ammonia</h3><br><h3 style='color: #0000A0'>N</h3><h3 style='color: #A00000'>H</h3><sub>3</sub>",
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(13)

                                let a = "Purchase 10% of the max possible<br>(" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.ammonia) + "<br>Ammonia"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return layers.f.buyables[13].total().gt(0) || player.c.best.gt(0)
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(13).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(13)

                                player.f.molecules.ammonia = player.f.molecules.ammonia.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(3))
                                player.f.o = player.f.o.sub(target.times(0))
                                player.f.c = player.f.c.sub(target.times(0))
                                player.f.n = player.f.n.sub(target.times(1))
                        },
                },
                14: {
                        title: "<h3 style='color: #6F0066'>ATP</h3><br><h3 style='color: #00A0A0'>C</h3><sub>10</sub><h3 style='color: #A00000'>H</h3><sub>16</sub><h3 style='color: #0000A0'>N</h3><sub>5</sub><h3 style='color: #00A000'>O</h3><sub>13</sub><h3 style='color: #A000A0'>P</h3><sub>3</sub>",
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(14)

                                let a = "Purchase 10% of the max possible<br>(" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.atp) + "<br>ATP"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return layers.f.buyables[22].total().gt(0) || player.c.best.gt(0)
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(14).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(14)

                                player.f.molecules.atp = player.f.molecules.atp.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(16))
                                player.f.o = player.f.o.sub(target.times(13))
                                player.f.c = player.f.c.sub(target.times(10))
                                player.f.n = player.f.n.sub(target.times(5))
                                player.f.p = player.f.p.sub(target.times(3))
                        },
                },
                15: {
                        title: "<h3 style='color: #6F0000'>Methane</h3><br><h3 style='color: #00A0A0'>C</h3><h3 style='color: #A00000'>H</h3><sub>4</sub>",
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(15)

                                let a = "Purchase 10% of the max possible<br>(" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.methane) + "<br>Methane"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return hasUpgrade("f", 22) || player.c.best.gt(0)
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(15).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(15)

                                player.f.molecules.methane = player.f.molecules.methane.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(4))
                                player.f.o = player.f.o.sub(target.times(0))
                                player.f.c = player.f.c.sub(target.times(1))
                                player.f.n = player.f.n.sub(target.times(0))
                                player.f.p = player.f.p.sub(target.times(0))
                        },
                },
                21: {
                        title: "<h3 style='color: #746F1C'>NADPH</h3><br><h3 style='color: #00A0A0'>C</h3><sub>21</sub><h3 style='color: #A00000'>H</h3><sub>29</sub><h3 style='color: #0000A0'>N</h3><sub>7</sub><h3 style='color: #00A000'>O</h3><sub>17</sub><h3 style='color: #A000A0'>P</h3><sub>3</sub>",
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(21)

                                let a = "Purchase 10% of the max possible<br>(" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.nadph) + "<br>NADPH"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return getBuyableAmount("f", 22).gte(28) || player.c.best.gt(0)
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(21).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(21)

                                player.f.molecules.nadph = player.f.molecules.nadph.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(20))
                                player.f.o = player.f.o.sub(target.times(17))
                                player.f.c = player.f.c.sub(target.times(21))
                                player.f.n = player.f.n.sub(target.times(8))
                                player.f.p = player.f.p.sub(target.times(3))
                        },
                },
                22: {
                        title() {
                                let inner = shiftDown ? "See Owe Too" : "Sea Oh Two"
                                return "<h3 style='color: #336000;font-size:100%'>" + inner + "</h3><br><h3 style='color: #00A0A0'>C</h3><h3 style='color: #00A000'>O</h3><sub>2</sub>"
                        },
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(22)

                                let a = "Purchase 10% of the max possible<br>(" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.co2) + "<br>Carbon Dioxide"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return getBuyableAmount("f", 21).gte(75) || player.c.best.gt(0)
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(22).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(22)

                                player.f.molecules.co2 = player.f.molecules.co2.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(0))
                                player.f.o = player.f.o.sub(target.times(2))
                                player.f.c = player.f.c.sub(target.times(1))
                                player.f.n = player.f.n.sub(target.times(0))
                                player.f.p = player.f.p.sub(target.times(0))
                        },
                },
                23: {
                        title() { // https://en.wikipedia.org/wiki/Ribulose_1,5-bisphosphate
                                return "<h3 style='color: #CC33FF'>RuBP</h3><br><h3 style='color: #00A0A0'>C</h3><sub>5</sub><h3 style='color: #A00000'>H</h3><sub>12</sub><h3 style='color: #00A000'>O</h3><sub>11</sub><h3 style='color: #A000A0'>P</h3><sub>2</sub>"
                        }, // C5H12O11P2
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(23)

                                let a = "Purchase 10% of the max possible<br>(" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.rubp) + "<br>RuBP"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return getBuyableAmount("f", 21).gte(75) || player.c.best.gt(0)
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(23).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(23)

                                player.f.molecules.rubp = player.f.molecules.rubp.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(12))
                                player.f.o = player.f.o.sub(target.times(11))
                                player.f.c = player.f.c.sub(target.times(5))
                                player.f.n = player.f.n.sub(target.times(0))
                                player.f.p = player.f.p.sub(target.times(2))
                        },
                },
                24: {
                        title() {
                                return "<h3 style='color: #46582E'>G6P</h3><br><h3 style='color: #00A0A0'>C</h3><sub>6</sub><h3 style='color: #A00000'>H</h3><sub>13</sub><h3 style='color: #00A000'>O</h3><sub>9</sub><h3 style='color: #A000A0'>P</h3>"
                        }, // C6H13O9P
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(24)

                                let a = "Purchase 10% of the max possible (" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.g6p) + "<br>G6P"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return getBuyableAmount("f", 11).gte(179) || player.c.best.gt(0)
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(24).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(24)

                                player.f.molecules.g6p = player.f.molecules.g6p.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(13))
                                player.f.o = player.f.o.sub(target.times(9))
                                player.f.c = player.f.c.sub(target.times(6))
                                player.f.n = player.f.n.sub(target.times(0))
                                player.f.p = player.f.p.sub(target.times(1))
                        },
                },
                25: {
                        title() { 
                                return "<h3 style='color: #3300CC;font-size: 100%'>Acetyl CoA</h3><br><h3 style='color: #00A0A0'>C</h3><sub>23</sub><h3 style='color: #A00000'>H</h3><sub>38</sub><h3 style='color: #0000A0'>N</h3><sub>7</sub><h3 style='color: #00A000'>O</h3><sub>17</sub><h3 style='color: #A000A0'>P</h3><sub>3</sub><h3 style='color: #F0A000'>S</h3>"
                        }, // C23H38N7O17P3S
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(25)

                                let a = "Purchase 10% of the max possible (" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.acetylcoa) + "<br>Acetyl CoA"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return getBuyableAmount("f", 23).gte(1) || player.c.best.gt(0)
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(25).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(25)

                                player.f.molecules.acetylcoa = player.f.molecules.acetylcoa.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(38))
                                player.f.o = player.f.o.sub(target.times(17))
                                player.f.c = player.f.c.sub(target.times(23))
                                player.f.n = player.f.n.sub(target.times(7))
                                player.f.p = player.f.p.sub(target.times(3))
                                player.f.s = player.f.s.sub(target.times(1))
                        },
                },
                31: {
                        title() { 
                                return "<h3 style='color: #00582E'>F6P</h3><br><h3 style='color: #00A0A0'>C</h3><sub>6</sub><h3 style='color: #A00000'>H</h3><sub>13</sub><h3 style='color: #00A000'>O</h3><sub>9</sub><h3 style='color: #A000A0'>P</h3>"
                        }, // C6H13O9P
                        display(){
                                let target = layers.f.clickables.getMaximumPossible(31)

                                let a = "Purchase 10% of the max possible (" + formatWhole(target) + ")"
                                let b = "You have " + formatWhole(player.f.molecules.f6p) + "<br>F6P"
                                return a + "<br><br>" + b
                        },
                        unlocked(){
                                return getBuyableAmount("f", 11).gte(243) || player.c.best.gt(0)
                        },
                        canClick(){
                                return layers.f.clickables.getMaximumPossible(31).gt(0)
                        },
                        onClick(){
                                let target = layers.f.clickables.getMaximumPossible(31)

                                player.f.molecules.f6p = player.f.molecules.f6p.plus(target)
                                if (target.gt(new Decimal("10pt3"))) return
                                player.f.h = player.f.h.sub(target.times(13))
                                player.f.o = player.f.o.sub(target.times(9))
                                player.f.c = player.f.c.sub(target.times(6))
                                player.f.n = player.f.n.sub(target.times(0))
                                player.f.p = player.f.p.sub(target.times(1))
                                player.f.s = player.f.s.sub(target.times(0))
                        },
                },
        },
        waterEffect(){
                let amt = player.f.molecules.water

                let exp = new Decimal(.5)
                exp = exp.times(layers.f.f6pEffect())

                let ret = amt.pow(exp)
                
                return ret
        },
        glucoseEffect(){
                let amt = player.f.molecules.glucose
                
                let exp = new Decimal(2)
                exp = exp.times(layers.f.f6pEffect())

                let ret = amt.times(5).plus(10).log10().pow(exp)

                return ret
        },
        ammoniaEffect(){
                let amt = player.f.molecules.ammonia

                let mult = new Decimal(100)
                mult = mult.times(layers.f.f6pEffect())

                let ret = amt.plus(100).log10().pow(5).minus(32).times(mult).floor()


                return ret.toNumber()
        },
        atpEffect(){
                let amt = player.f.molecules.atp

                let exp = new Decimal(2)
                exp = exp.times(layers.f.f6pEffect())
                exp = exp.times(layers.f.rubpEffect())

                let ret = amt.times(10).plus(10).log10().pow(exp)
                
                return ret
        },
        methaneEffect(){
                let amt = player.f.molecules.methane

                let a = amt.plus(10).log10()
                let ret = Decimal.pow(a, a).times(amt.plus(1))

                ret = ret.pow(layers.f.acetylcoaEffect())
                ret = ret.pow(layers.f.f6pEffect())

                return ret
        },
        nadphEffect(){
                let amt = player.f.molecules.nadph

                let mult = new Decimal(.5)
                mult = mult.times(layers.f.f6pEffect())

                let ret = amt.plus(1).log10().times(mult)

                if (hasUpgrade("f", 33)) ret = ret.pow(2)

                return ret
        },
        co2Effect(){
                let amt = player.f.molecules.co2

                let mult = new Decimal(.02)
                mult = mult.times(layers.f.f6pEffect())

                let ret = amt.plus(1).log10().times(mult).plus(1)
                
                if (hasUpgrade("f", 33)) ret = ret.pow(2)

                return ret
        },
        rubpEffect(){
                let amt = player.f.molecules.rubp

                let mult = new Decimal(.1)
                mult = mult.times(layers.f.f6pEffect())

                let ret = amt.div(1000).plus(1).log10().times(mult)

                return ret.plus(1)
        },
        g6pEffect(){
                let amt = player.f.molecules.g6p

                let exp = new Decimal(1/3)
                exp = exp.times(layers.f.f6pEffect())

                let ret = amt.div(1000).pow(exp).floor()

                return ret
        },
        acetylcoaEffect(){
                let amt = player.f.molecules.acetylcoa

                let exp = new Decimal(2)
                exp = exp.times(layers.f.f6pEffect())

                let ret = amt.plus(1).log10().pow(exp).plus(1)

                return ret
        },
        f6pEffect(){
                let amt = player.f.molecules.f6p

                let ret = amt.div(1e6).plus(1).log10().div(3).plus(1)

                return ret
        },
        row: 2, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                return hasUpgrade("o", 54) || player.f.best.gt(0) || player.c.best.gt(0)
        },
        tabFormat: {
                "Upgrades": {
                        content: [
                                "main-display",
                                ["resource-display", "", function (){ return hasUpgrade("f", 25) ? {'display': 'none'} : {}}],
                                ["prestige-button", "", function (){ return hasUpgrade("f", 25) ? {'display': 'none'} : {}}],
                                ["display-text", function(){
                                        if (!hasUpgrade("f", 25)) {
                                                if (hasMilestone("c", 2)) return "There is a five second cooldown for Prestiging (" + format(Math.max(0, 5 - player.f.currentTime)) + ")"
                                                return "There is a thirty second cooldown for Prestiging (" + format(Math.max(0, 30 - player.f.currentTime)) + ")"
                                        }
                                        return "You are gaining " + format(layers.f.getResetGain()) + " Fragments per second"
                                }],
                                "upgrades"
                        ],
                        unlocked(){
                                return true
                        },
                },
                "Workers": {
                        content: [
                                "main-display",
                                "buyables"
                        ],
                        unlocked(){
                                return hasUpgrade("f", 14) || player.c.best.gt(0)
                        },
                },
                "Molecules": {
                        content: [
                                ["display-text", function(){
                                        if (!shiftDown) return "Hold Shift to see element amounts"
                                        let a = `You have <h2 style='color: #41FFEC'>` + format(player.f.h, 4) + "</h2> <h3 style='color: #A00000'>Hydrogen</h3><br>"
                                        let b = `You have <h2 style='color: #41FFEC'>` + format(player.f.o, 4) + "</h2> <h3 style='color: #00A000'>Oxygen</h3><br>"
                                        let c = `You have <h2 style='color: #41FFEC'>` + format(player.f.c, 4) + "</h2> <h3 style='color: #00A0A0'>Carbon</h3><br>"
                                        let d = `You have <h2 style='color: #41FFEC'>` + format(player.f.n, 4) + "</h2> <h3 style='color: #0000A0'>Nitrogen</h3><br>"
                                        let e = `You have <h2 style='color: #41FFEC'>` + format(player.f.p, 4) + "</h2> <h3 style='color: #A000A0'>Phosphorus</h3><br>"
                                        let f = `You have <h2 style='color: #41FFEC'>` + format(player.f.s,4) + "</h2> <h3 style='color: #F0A000'>Sulfur</h3><br>"
                                        return a + b + c + d + e + f
                                }],
                                "clickables"
                        ],
                        unlocked(){
                                return hasUpgrade("f", 14) || player.c.best.gt(0)
                        },
                },
                "Resources": {
                        content: [
                                ["display-text", function(){
                                        return "Hold Shift to hide Elements and see full names of the Molecules"
                                }],
                                ["display-text", function(){
                                        if (shiftDown) return "Release Shift to see element amounts"
                                        let init = "<h1>Elements</h1><br>" 
                                        let a = `You have <h2 style='color: #41FFEC'>` + format(player.f.h, 4) + "</h2> <h3 style='color: #A00000'>Hydrogen</h3><br>"
                                        let b = `You have <h2 style='color: #41FFEC'>` + format(player.f.o, 4) + "</h2> <h3 style='color: #00A000'>Oxygen</h3><br>"
                                        let c = `You have <h2 style='color: #41FFEC'>` + format(player.f.c, 4) + "</h2> <h3 style='color: #00A0A0'>Carbon</h3><br>"
                                        let d = `You have <h2 style='color: #41FFEC'>` + format(player.f.n, 4) + "</h2> <h3 style='color: #0000A0'>Nitrogen</h3><br>"
                                        let e = `You have <h2 style='color: #41FFEC'>` + format(player.f.p, 4) + "</h2> <h3 style='color: #A000A0'>Phosphorus</h3><br>"
                                        let f = `You have <h2 style='color: #41FFEC'>` + format(player.f.s,4) + "</h2> <h3 style='color: #F0A000'>Sulfur</h3><br>"
                                        return init + a + b + c + d + e + f + "<br>"
                                }],
                                ["display-text", function(){
                                        return "<br><h1>Molecules</h1>" 
                                }],
                                ["display-text", function(){
                                        let names1 = ["Water", "Glucose", "Ammonia", 
                                                        "ATP", "Methane", "NADPH", 
                                                        "Carbon Dioxide", "RuBP", "G6P",
                                                        "Acetyl CoA", "F6P"]
                                        let names2 = ["Water", "Glucose", "Ammonia", 
                                                        "Adenosine Triphosphate", "Methane", "Nicotinamide Adenine Dinucleotide Phosphate",
                                                        "Carbon Dioxide", "Ribulose 1,5-Bisphosphate", "Glucose 6-phosphate",
                                                        "Acetyl Coenzyme A", "Fructose 6-Phosphate"]
                                        let names = shiftDown ? names2 : names1
                                        let a = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.water, 4)     + "</h2> <h3 style='color: #303000'>" + names[ 0] + "</h3> which gives +" + format(layers.f.waterEffect()) + " to Base Origin Boost Base<br>"
                                        let b = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.glucose, 4)   + "</h2> <h3 style='color: #703000'>" + names[ 1] + "</h3> which gives *" + format(layers.f.glucoseEffect()) + " Fragment gain<br>"
                                        let c = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.ammonia, 4)   + "</h2> <h3 style='color: #703070'>" + names[ 2] + "</h3> which pushes the Stamina softcap back by " + formatWhole(layers.f.ammoniaEffect()) + "<br>"
                                        let d = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.atp, 4)       + "</h2> <h3 style='color: #6F0066'>" + names[ 3] + "</h3> which multiplies worker effeciency by " + format(layers.f.atpEffect()) + "<br>"
                                        let e = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.methane, 4)   + "</h2> <h3 style='color: #6F0000'>" + names[ 4] + "</h3> which multiplies Origin gain by " + format(layers.f.methaneEffect()) + "<br>"

                                        let f = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.nadph, 4)     + "</h2> <h3 style='color: #746F1C'>" + names[ 5] + "</h3> which adds by +" + format(layers.f.nadphEffect()) + " to the Pion Boost base<br>"
                                        let g = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.co2, 4)       + "</h2> <h3 style='color: #336000'>" + names[ 6] + "</h3> which makes each Base Origin Boost multiply Fragment gain by " + format(layers.f.co2Effect(), 4) + " (total " + format(Decimal.pow(layers.f.co2Effect(), layers.o.buyables[33].total())) + ")<br>"
                                        let h = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.rubp, 4)      + "</h2> <h3 style='color: #CC33FF'>" + names[ 7] + "</h3> which raises the " + names[3] + " and Lafforgue effects ^" + format(layers.f.rubpEffect(), 4) + "<br>"
                                        let i = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.g6p, 4)       + "</h2> <h3 style='color: #46582E'>" + names[ 8] + "</h3> which gives " + formatWhole(layers.f.g6pEffect()) + " free Base Origin Boost base<br>"
                                        let j = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.acetylcoa, 4) + "</h2> <h3 style='color: #3300CC'>" + names[ 9] + "</h3> which powers Methane effect and Super Prestige Boost base ^" + format(layers.f.acetylcoaEffect(), 4) + "<br>"
                                        
                                        let k = `You have <h2 style='color: #41FFEC'>` + formatWhole(player.f.molecules.f6p, 4)       + "</h2> <h3 style='color: #00582E'>" + names[10] + "</h3> which buffs all previous effects to " + format(layers.f.f6pEffect(), 4) + " times the strength<br>"
                                        
                                        
                                        if (!layers.f.clickables.rowunlocked(2)) return a + b + c + d + e
                                        if (!layers.f.clickables.rowunlocked(3)) return a + b + c + d + e + f + g + h + i + j
                                        if (!layers.f.clickables.rowunlocked(4)) return a + b + c + d + e + f + g + h + i + j + k

                                        return a + b + c + d + e + f + g + h + i + j
                                }],
                        ],
                        unlocked(){
                                return hasUpgrade("f", 14) || player.c.best.gt(0)
                        },
                },
        },
        doReset(layer){
                if (false) console.log(layer)
                if (layer == "f") player.f.currentTime = 0
                if (layers[layer].row <= 2) return 
                

                //resource
                player.f.points = new Decimal(0)
                player.f.best = new Decimal(0)
                player.f.total = new Decimal(0)

                let keep = []
                if (hasMilestone("c", 4)) keep.push(33)
                if (!hasUpgrade("c", 11)) player.f.upgrades = filter(player.f.upgrades, keep)
                player.f.milestones = []

                let resetBuyables = [11,12,13,21,22,23]
                for (let j = 0; j < resetBuyables.length; j++) {
                        if (hasMilestone("c", 7)) break
                        player.f.buyables[resetBuyables[j]] = new Decimal(0)
                }

                player.f.h = new Decimal(0)
                player.f.c = new Decimal(0)
                player.f.n = new Decimal(0)
                player.f.o = new Decimal(0)
                player.f.p = new Decimal(0)
                player.f.s = new Decimal(0)
                
                let init = hasMilestone("c", 7) ? 1 : 0
                player.f.molecules = {
                        water: new Decimal(init),
                        glucose: new Decimal(init),
                        ammonia: new Decimal(init),
                        atp: new Decimal(init),
                        methane: new Decimal(init),
                        nadph: new Decimal(init),
                        co2: new Decimal(init),
                        rubp: new Decimal(init),
                        g6p: new Decimal(init),
                        acetylcoa: new Decimal(init),
                        f6p: new Decimal(init),
                }
        },
})

/*
next upgrade should tetrate all production ^^1.001 and 
give 10x incrementy gain

*/

addLayer("c", {
        name: "Capsules", 
        symbol: "C", 
        position: 1,
        startData() { return {
                unlocked: true,
		points: new Decimal(0),
                best: new Decimal(0),
                total: new Decimal(0),
                times: 0,
                time: 0,
        }},
        color: "#990000",
        requires: Decimal.pow(10, 25000), 
        resource: "Capsules",
        baseAmount() {return player.f.best}, 
        branches: ["f"],
        type: "custom", 
        effect(){
                let amt = player.c.best
                if (amt.eq(0)) return new Decimal(1)
                
                let ret = amt.sqrt().plus(1).tetrate(3).div(3)
                return ret
        },
        effectDescription(){
                let eff = layers.c.effect()
                let a = "which increases Super Prestige effect and gain by " + format(eff) + " (based on best Capsules)"

                return a + "."
        },
        getResetGain() {
                let amt = layers.c.baseAmount()
                let pre = layers.c.getGainMultPre()
                let exp = layers.c.getGainExp()
                let pst = layers.c.getGainMultPost()

                if (amt.layer < 2048) return new Decimal(0)
                
                let ret = new Decimal(amt.layer).log(2).div(11).times(pre).pow(exp).times(pst)

                if (hasUpgrade("c", 23)) {
                        if (ret.gt(10)) ret = Decimal.pow(10, ret.log10().pow(1.01))
                }

                return ret.floor()
        },
        getGainExp(){
                let x = new Decimal(1)
                if (hasMilestone("c", 4)) x = x.times(player.c.milestones.length)
                if (hasUpgrade("c", 12)) x = x.times(player.c.upgrades.length)
                if (devSpeedUp) x = x.times(1.01)
                return x
        },
        getGainMultPre(){
                let x = new Decimal(1)
                if (hasUpgrade("c", 24)) x = x.times(2)
                if (hasUpgrade("c", 25)) x = x.times(player.c.upgrades.length)
                if (hasUpgrade("c", 31)) x = x.times(2.18)
                return x
        },
        getGainMultPost(){
                let x = new Decimal(1)
                if (hasUpgrade("c", 21)) x = x.times(upgradeEffect("c", 21))
                if (hasUpgrade("c", 22)) x = x.times(Decimal.pow(2, player.c.upgrades.length))
                return x
        },
        prestigeButtonText(){
                let gain = layers.c.getResetGain()
                let start = "Reset to gain " + formatWhole(gain) + " Capsules<br>"
                let pre = layers.c.getGainMultPre()
                let exp = layers.c.getGainExp()
                let pst = layers.c.getGainMultPost()

                let x1 = gain.plus(1).div(pst).root(exp).div(pre).times(11)
                let x2 = Decimal.tetrate(10, Decimal.pow(2, x1))

                if (gain.gt(1e6)) return start

                let nextAt = "Next at " + format(x2) + " Fragments"

                if (gain.lt(2)) return start + nextAt

                let ps = gain.div(player.c.time || 1)

                if (ps.lt(1/60)) {
                        nextAt += " (" + format(ps.times(60)) + "/m)"
                } else {
                        nextAt += " (" + format(ps) + "/s)"
                }
                
                return start + nextAt
        },
        canReset(){
                return layers.c.getResetGain().gt(0) && hasUpgrade("f", 42) && layers.c.baseAmount().gte(layers.c.requires)
        },
        update(diff){
                player.c.best = player.c.best.max(player.c.points)
                player.c.time += diff

                if (hasUpgrade("c", 14)) {
                        let x = layers.c.getResetGain()
                        player.c.points = player.c.points.plus(x.times(diff))
                        player.c.total  = player.c.total.plus(x.times(diff))
                }
        },
        upgrades:{
                rows: 5,
                cols: 5,
                11: {
                        title: "Birkar",
                        description() {
                                if (shiftDown) a = "Fragment gain x -> x^^Capsules"
                                else a = "Buff fragment gain based on Capsules"
                                return a + " and keep Fragment upgrades"
                        },
                        cost: new Decimal(15),
                        unlocked(){
                                return hasMilestone("c", 7)
                        }
                },
                12: {
                        title: "Zermelo",
                        description: "Keep the last row of Super Prestige upgrades and raise Capsule gain to the number of Capsule upgrades",
                        cost: new Decimal(10),
                        unlocked(){
                                return hasUpgrade("c", 11)
                        }
                },
                13: {
                        title: "Fraenkel",
                        description: "Incrementy Autobuyers buy 20x more",
                        cost: new Decimal(25e3),
                        unlocked(){
                                return hasUpgrade("c", 12)
                        }
                },
                14: {
                        title: "Skolem",
                        description: "Remove the ability to Prestige but gain 100% of Capsules upon prestige each second",
                        cost: new Decimal(5e15),
                        unlocked(){
                                return hasUpgrade("c", 13)
                        }
                },
                15: {
                        title: "Hausdorff",
                        description: "Incrementy Autobuyers buy 20x more",
                        cost: new Decimal(1e29),
                        unlocked(){
                                return hasUpgrade("c", 14)
                        }
                },
                21: {
                        title: "Noether",
                        description: "Capsules boost Capsule gain",
                        cost: new Decimal(1e40),
                        effect(){
                                return player.c.points.plus(10).log10()
                        },
                        unlocked(){
                                return hasUpgrade("c", 15)
                        }
                },
                22: {
                        title: "Peano",
                        description: "Each Capsule upgrade doubles Capsule gain",
                        cost: new Decimal(1e55),
                        unlocked(){
                                return hasUpgrade("c", 21)
                        }
                },
                23: {
                        title: "Hilbert",
                        description: "Figalli effects Capsules as if you had one reset",
                        cost: new Decimal(5e71),
                        unlocked(){
                                return hasUpgrade("c", 22)
                        }
                }, 
                24: {
                        title: "Fermat",
                        description: "Double base Capsule gain",
                        cost: new Decimal(1e91),
                        unlocked(){
                                return hasUpgrade("c", 23)
                        }
                },
                25: {
                        title: "Ramanujan",
                        description: "Capsule upgrades multiply base Capsule gain",
                        cost: new Decimal(1e133),
                        unlocked(){
                                return hasUpgrade("c", 24)
                        }
                },
                31: {
                        title: "Endgame?",
                        description: "Unlock the ability to end the game and multiply base Capsule gain by 2.18",
                        cost: new Decimal(5e241),
                        unlocked(){
                                return hasUpgrade("c", 25)
                        }
                },
        },
        milestones: {
                1: {
                        requirementDescription: "<b>Figalli</b><br>Requires: 1 Capsule", 
                        effectDescription: "Each Capsule reset raises all previous layer production and token gain exponents ^1.01 and gain 3x more SP resets per reset",
                        done(){
                                return player.c.best.gte(1)
                        }, // hasMilestone("c", 1)
                },
                2: {
                        requirementDescription: "<b>Scholze</b><br>Requires: 2 Capsules", 
                        effectDescription: "Make the fragment cooldown 5 seconds, gain 5x more SP resets per reset, and Capsule effect effects tokens",
                        done(){
                                return player.c.best.gte(2)
                        }, // hasMilestone("c", 2)
                },
                3: {
                        requirementDescription: "<b>Venkatesh</b><br>Requires: 3 Capsules", 
                        effectDescription: "Start with one SP reset per Capsule reset and Capsule effect effects Fragments and gatherers",
                        done(){
                                return player.c.best.gte(3)
                        }, // hasMilestone("c", 3)
                },
                4: {
                        requirementDescription: "<b>Wiles</b><br>Requires: 4 Capsules", 
                        effectDescription: "Keep SP milestones and Smirnov and raise capsule gain to the number of Milestones",
                        done(){
                                return player.c.best.gte(4)
                        }, // hasMilestone("c", 4)
                },
                5: {
                        requirementDescription: "<b>Gödel</b><br>Requires: 6 Capsules", 
                        effectDescription: "Keep the first four rows of Super Prestige upgrades and the first two rows of Pion upgrades",
                        done(){
                                return player.c.best.gte(6)
                        }, // hasMilestone("c", 5)
                },
                6: {
                        requirementDescription: "<b>Hartogs</b><br>Requires: 9 Capsules", 
                        effectDescription: "Keep one Origin upgrade per Capsule reset and Avilia buys the first ten molecules too",
                        done(){
                                return player.c.best.gte(9)
                        }, // hasMilestone("c", 6)
                },
                7: {
                        requirementDescription: "<b>von Neumann</b><br>Requires: 13 Capsules", 
                        effectDescription: "Keep workers and start with one of each molecule",
                        done(){
                                return player.c.best.gte(13)
                        }, // hasMilestone("c", 7)
                },
        },
        row: 4, // Row the layer is in on the tree (0 is the first row)
        hotkeys: [
            //{key: "p", description: "Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
        ],
        layerShown(){
                return hasUpgrade("f", 42) || player.c.best.gt(0)
        },
        tabFormat: {
                "Upgrades": {
                        content: [
                                "main-display",
                                ["resource-display", "", function (){ return hasUpgrade("c", 14) ? {'display': 'none'} : {}}],
                                ["prestige-button", "", function (){ return hasUpgrade("c", 14) ? {'display': 'none'} : {}}],
                                ["display-text", function(){
                                        if (hasUpgrade("c", 14)) return ""
                                        return "Doing a Capsule reset resets Origins and everything above"
                                }],
                                ["display-text", function(){
                                        if (!hasUpgrade("c", 14)) {
                                                if (player.c.times < 25) return "You have done " + formatWhole(player.c.times) + " Capsule resets"
                                                return ""
                                        }
                                        return "You are gaining " + format(layers.c.getResetGain()) + " Capsules per second"
                                }],
                                "upgrades"
                        ],
                        unlocked(){
                                return true
                        },
                },
                "QoL": {
                        content: [
                                "main-display",
                                "milestones",
                        ],
                        unlocked(){
                                return true
                        },
                },
        },
        doReset(layer){
                if (false) console.log(layer)
                if (layer == "c") player.c.time = 0
                if (layers[layer].row <= 4) return

                //resource
                player.c.points = new Decimal(0)
                player.c.best = new Decimal(0)
                player.c.times = 0
                player.c.total = new Decimal(0)
        },
})

