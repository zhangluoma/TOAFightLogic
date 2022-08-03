function findNextActionJS(gameStatus, playerAction, intervalIds) {
    gameStatus = replaceStringWithInteger(gameStatus);
    playerAction = replaceStringWithInteger(playerAction);
    intervalIds = replaceStringWithInteger(intervalIds);
    if (gameStatus.nextTurnType == 0 || gameStatus.nextTurnType == 1) {
        findStatusActionInternal(gameStatus, playerAction, intervalIds);
    }else if(gameStatus.nextTurnType == 2){
        if (playerAction >= 100){
            findSpecialAbilityActionInternal(gameStatus, playerAction, intervalIds);
        } else if (playerAction > -1) {
            findPlayerActionInternal(gameStatus, playerAction, intervalIds);
        }else if(playerAction == -1){
            findSkipActionInternal(gameStatus, playerAction, intervalIds);
        }else{
            findDiscardActionInternal(gameStatus, playerAction, intervalIds);
        }
    }else{
        findEnemyActionInternal(gameStatus, playerAction, intervalIds);
    }
    return replaceIntegerWithString(gameStatus);
}

function isObject(val) {
    if (val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
}

function isBool(val){
  return typeof val === 'boolean'
}

function replaceStringWithInteger(toReplace){
    if(Array.isArray(toReplace)){
        var res = [];
        for(var i = 0; i < toReplace.length; i ++){
          res.push(replaceStringWithInteger(toReplace[i]));
        }
        return res;
      }else if(isObject(toReplace)){
        var res = {};
        for(var key in toReplace){
          if(toReplace.hasOwnProperty(key)){
            res[key] = replaceStringWithInteger(toReplace[key]);
          }
        }
        return res;
      }else if(isBool(toReplace)){
        return toReplace;
      }else{
        if(Number.isInteger(parseInt(toReplace)) && toReplace.length < 20){
            return parseInt(toReplace);
        }else{
            return toReplace;
        }
      }
}

function replaceIntegerWithString(toReplace){
    if(Array.isArray(toReplace)){
      var res = [];
      for(var i = 0; i < toReplace.length; i ++){
        res.push(replaceIntegerWithString(toReplace[i]));
      }
      return res;
    }else if(isObject(toReplace)){
      var res = {};
      for(var key in toReplace){
        if(toReplace.hasOwnProperty(key)){
          res[key] = replaceIntegerWithString(toReplace[key]);
        }
      }
      return res;
    }else if(isBool(toReplace)){
      return toReplace;
    }else{
        if(isFloat(toReplace)){
            toReplace = Math.round(toReplace);
        }
        return String(toReplace);
    }
}

function isFloat(num) {
    return typeof num === "number" && !Number.isInteger(num);
}

function initStatusExtra(){
    return {nextTurnTextInstanceGroup : [], thisTurnTextInstanceGroup : []};
}

function UpdateExtraForInitialStatus(gameStatus, intervalIds){
    gameStatus = replaceStringWithInteger(gameStatus);
    var innerState = constructInnerState(gameStatus.deckInfo, gameStatus.gauge, gameStatus.characterInfo, constructCharacterInfo(gameStatus.characterInfo.receiverBaseAttribute, gameStatus.characterInfo.casterBaseAttribute, gameStatus.characterInfo.receiverAttributes, gameStatus.characterInfo.casterAttributes, gameStatus.characterInfo.receiverEffects, gameStatus.characterInfo.casterEffects, gameStatus.characterInfo.receiverAbilityStatus, gameStatus.characterInfo.casterAbilityStatus, gameStatus.characterInfo.receiverEquip, gameStatus.characterInfo.casterEquip, gameStatus.characterInfo.receiverSpecial, gameStatus.characterInfo.casterSpecial));
    gameStatus.extra = initStatusExtra();
    prepareForNextGameStatus(generatePrepareForNextGameStatusInput(gameStatus, innerState.deckInfo, innerState.gauge, innerState.characterInfo, intervalIds, gameStatus.derivedEffects), gameStatus.extra.nextTurnTextInstanceGroup);
    return gameStatus;
}

function findDiscardActionInternal(gameStatus, playerAction, intervalIds){
    var innerState = constructInnerState(gameStatus.deckInfo, gameStatus.gauge, gameStatus.characterInfo, constructCharacterInfo(gameStatus.characterInfo.receiverBaseAttribute, gameStatus.characterInfo.casterBaseAttribute, gameStatus.characterInfo.receiverAttributes, gameStatus.characterInfo.casterAttributes, gameStatus.characterInfo.receiverEffects, gameStatus.characterInfo.casterEffects, gameStatus.characterInfo.receiverAbilityStatus, gameStatus.characterInfo.casterAbilityStatus, gameStatus.characterInfo.receiverEquip, gameStatus.characterInfo.casterEquip, gameStatus.characterInfo.receiverSpecial, gameStatus.characterInfo.casterSpecial));
    updateInnerState(innerState, gameStatus);
    var toBurn = - playerAction - 2;
    if(!AbilityOfClass(innerState.characterInfo.casterAbilityStatus.abilities[toBurn], 3)){
        throw "the card connot be discarded";
    }
    innerState.deckInfo.playerCards = playCardWithAbilityIndex(toBurn, innerState.deckInfo.playerCards);
    innerState.characterInfo.casterAttributes.action.actionPoint += 1;
    gameStatus.nextAvailableAbilities = getAvailableAbilities(innerState.deckInfo.playerCards, innerState.characterInfo);
    gameStatus.nextTurnType = 2;
    updateGameStatusWithInput(gameStatus, innerState);

    gameStatus.abilitySelection = playerAction;
    gameStatus.validAction = true;
    gameStatus.finished = innerState.characterInfo.casterAttributes.hp <= 0 || innerState.characterInfo.receiverAttributes.hp <= 0;
    gameStatus.gauge = innerState.gauge;
    gameStatus.characterInfo = innerState.characterInfo;
    gameStatus.deckInfo = innerState.deckInfo;
    gameStatus.nextSeed = getRandomIntFromNumber(gameStatus.nextSeed);
    return gameStatus;
}

function findStatusActionInternal(gameStatus, playerAction, intervalIds) {
    var innerState = constructInnerState(gameStatus.deckInfo, gameStatus.gauge, gameStatus.characterInfo, constructCharacterInfo(gameStatus.characterInfo.receiverBaseAttribute, gameStatus.characterInfo.casterBaseAttribute, gameStatus.characterInfo.receiverAttributes, gameStatus.characterInfo.casterAttributes, gameStatus.characterInfo.receiverEffects, gameStatus.characterInfo.casterEffects, gameStatus.characterInfo.receiverAbilityStatus, gameStatus.characterInfo.casterAbilityStatus, gameStatus.characterInfo.receiverEquip, gameStatus.characterInfo.casterEquip, gameStatus.characterInfo.receiverSpecial, gameStatus.characterInfo.casterSpecial));
    updateInnerState(innerState, gameStatus);

    //main part
    gameStatus.abilitySelection = gameStatus.nextAbilitySelection;
    gameStatus.validAction = true;
    gameStatus.finished = innerState.characterInfo.casterAttributes.hp <= 0 || innerState.characterInfo.receiverAttributes.hp <= 0;
    prepareForNextGameStatus(generatePrepareForNextGameStatusInput(gameStatus, innerState.deckInfo, innerState.gauge, innerState.characterInfo, intervalIds, gameStatus.derivedEffects), gameStatus.extra.nextTurnTextInstanceGroup);

    gameStatus.gauge = innerState.gauge;
    gameStatus.characterInfo = innerState.characterInfo;
    gameStatus.deckInfo = innerState.deckInfo;
    gameStatus.nextSeed = getRandomIntFromNumber(gameStatus.nextSeed);
}

function checkSkipped(effects){
    return effects.effectCatalogs.stuned;
}

function pickAbility(arg1, arg2){
    var characterInfo = JSON.parse(JSON.stringify(arg1));
    var cards = JSON.parse(JSON.stringify(arg2));
    if(cards.handSize == 0){
        return [-1, -1];
    }else{
        var toPickAbilityIndex = -1;
        var maxPointPick = -1;
        for(var index = 0; index < cards.handSize; index ++){
            var currPoint = characterInfo.casterAbilityStatus.abilities[cards.hand[index]].actionPoint;
            if(currPoint <= characterInfo.casterAttributes.action.actionPoint && currPoint > maxPointPick && 
            abilityRequirementSatisfied(characterInfo, characterInfo.casterAbilityStatus.abilities[cards.hand[index]])){
                toPickAbilityIndex = index;
                maxPointPick = currPoint;
            }
        }
        if(toPickAbilityIndex != -1){
            return [toPickAbilityIndex, cards.hand[toPickAbilityIndex]];
        }
        return [-1, -1];
    }
}

function playCard(arg1, arg2) {
    var indexToPlay = JSON.parse(JSON.stringify(arg1));
    var cards = JSON.parse(JSON.stringify(arg2));
    var cardId = cards.hand[indexToPlay];
    //cards.hand[indexToPlay] = cards.hand[cards.handSize - 1];
    updateHand(cards, indexToPlay, cards.hand[cards.handSize - 1]);
    cards.handSize -= 1;
    updateDiscarded(cards, cards.discardedSize, cardId);
    //cards.discarded[cards.discardedSize] = cardId;
    cards.discardedSize ++;
    return cards;
}

function playCardAndRemove(arg1, arg2) {
    var indexToPlay = JSON.parse(JSON.stringify(arg1));
    var cards = JSON.parse(JSON.stringify(arg2));
    var cardId = cards.hand[indexToPlay];
    //cards.hand[indexToPlay] = cards.hand[cards.handSize - 1];
    updateHand(cards, indexToPlay, cards.hand[cards.handSize - 1]);
    cards.handSize -= 1;
    return cards;
}

function applyEndTurnEffects(effects, ca, textInstanceGroup){
    var totalIronShield = 0;
    for(var i = 0; i < effects.valid.length; i ++){
        if(effects.valid[i]){
            totalIronShield += getExtraVal(effects.effectMap[i], 20) * (effects.extraStack[i] + 1);
        }
    }
    if(totalIronShield != 0){
        ca.shield += totalIronShield;
        textInstanceGroup.push(generateTextInstance(0, 0, totalIronShield, ca.isActive));
    }
}

function overrideCastInputWithInput(source, target) {
    overrideDeckInfo(source.deckInfo, target.deckInfo);
    overrideGauge(source.gauge, target.gauge);
    source.reversed = target.reversed;
    overrideCharacterInfo(source.characterInfo, target.characterInfo);
    source.abilityIndex = target.abilityIndex;
    //no need to override derived effects
    source.seed = target.seed;
}

function findEnemyActionInternal(gameStatus, playerAction, intervalIds){
    var innerState = constructInnerState(gameStatus.deckInfo, gameStatus.gauge, gameStatus.characterInfo, constructCharacterInfo(gameStatus.characterInfo.receiverBaseAttribute, gameStatus.characterInfo.casterBaseAttribute, gameStatus.characterInfo.receiverAttributes, gameStatus.characterInfo.casterAttributes, gameStatus.characterInfo.receiverEffects, gameStatus.characterInfo.casterEffects, gameStatus.characterInfo.receiverAbilityStatus, gameStatus.characterInfo.casterAbilityStatus, gameStatus.characterInfo.receiverEquip, gameStatus.characterInfo.casterEquip, gameStatus.characterInfo.receiverSpecial, gameStatus.characterInfo.casterSpecial));
    updateInnerState(innerState, gameStatus);

    //PVELibrary.refreshStatus(innerState.gauge, innerState.characterInfo);
    //enemy turn
    var sRes = checkSkipped(innerState.reversedInfo.casterEffects) ? [-1, -1] : pickAbility(innerState.reversedInfo, innerState.deckInfo.enemyCards);
    var toPickInHand = sRes[0];
    var abilityToPick = sRes[1];
    //innerState = PVELibraryInnerLogic.ProcessInnerLogic(innerState, toPickInHand, abilityToPick, gameStatus.derivedEffects, gameStatus.nextSeed);
    
    if(toPickInHand != -1){
        var castInput = generateCastAbilityInput(innerState.deckInfo, innerState.gauge, true, innerState.reversedInfo, abilityToPick, gameStatus.derivedEffects, gameStatus.nextSeed);
        overrideCastInputWithInput(castInput, castAbility(innerState.reversedInfo, castInput, gameStatus.extra.thisTurnTextInstanceGroup));
        if(AbilityOfClass(innerState.reversedInfo.casterAbilityStatus.abilities[abilityToPick], 4)){
            innerState.deckInfo.enemyCards = playCardAndRemove(toPickInHand, innerState.deckInfo.enemyCards);
        }else{
            innerState.deckInfo.enemyCards = playCard(toPickInHand, innerState.deckInfo.enemyCards);
        }
        innerState.characterInfo.receiverEffects.specialCounter[2] ++;
    }else{
        var special5 = getCharacterSpecialAbilityById(innerState.characterInfo.receiverSpecial, 5);
        if(special5.id != 0 && innerState.characterInfo.receiverEffects.specialCounter[2] == innerState.characterInfo.receiverEffects.specialCounter[3]){
            var applyInput = generateApplyEffectOnCharacterInput(innerState.characterInfo.receiverAttributes, innerState.characterInfo.receiverAttributes, innerState.characterInfo.receiverEffects, innerState.characterInfo.receiverEffects, special5.effect, gameStatus.derivedEffects, gameStatus.nextSeed, 1);
            overrideApplyEffect(applyInput, applyEffectOnCharacter(undefined, applyInput, gameStatus.extra.thisTurnTextInstanceGroup));
        }
        applyEndTurnEffects(innerState.characterInfo.receiverEffects, innerState.characterInfo.receiverAttributes, gameStatus.extra.thisTurnTextInstanceGroup);
        //innerState = PVELibraryInnerLogic.runDiscardLogicForEenemy(innerState, gameStatus.derivedEffects, gameStatus.nextSeed);
    }

    if(toPickInHand != -1){
        gameStatus.nextTurnType = 3;
        updateGameStatusWithInput(gameStatus, innerState);
    }else{
        prepareForNextGameStatus(generatePrepareForNextGameStatusInput(gameStatus, innerState.deckInfo, innerState.gauge, innerState.characterInfo, intervalIds, gameStatus.derivedEffects), gameStatus.extra.nextTurnTextInstanceGroup);
    }
    gameStatus.abilitySelection = abilityToPick;
    gameStatus.validAction = true;
    gameStatus.finished = innerState.characterInfo.casterAttributes.hp <= 0 || innerState.characterInfo.receiverAttributes.hp <= 0;

    gameStatus.gauge = innerState.gauge;
    gameStatus.characterInfo = innerState.characterInfo;
    gameStatus.deckInfo = innerState.deckInfo;
    gameStatus.nextSeed = getRandomIntFromNumber(gameStatus.nextSeed);
}

function findSkipActionInternal(gameStatus, playerAction, intervalIds){
    var innerState = constructInnerState(gameStatus.deckInfo, gameStatus.gauge, gameStatus.characterInfo, constructCharacterInfo(gameStatus.characterInfo.receiverBaseAttribute, gameStatus.characterInfo.casterBaseAttribute, gameStatus.characterInfo.receiverAttributes, gameStatus.characterInfo.casterAttributes, gameStatus.characterInfo.receiverEffects, gameStatus.characterInfo.casterEffects, gameStatus.characterInfo.receiverAbilityStatus, gameStatus.characterInfo.casterAbilityStatus, gameStatus.characterInfo.receiverEquip, gameStatus.characterInfo.casterEquip, gameStatus.characterInfo.receiverSpecial, gameStatus.characterInfo.casterSpecial));
    updateInnerState(innerState, gameStatus);
    var special5 = getCharacterSpecialAbilityById(innerState.characterInfo.casterSpecial, 5);
    if(special5.id != 0 && innerState.characterInfo.casterEffects.specialCounter[2] == innerState.characterInfo.casterEffects.specialCounter[3]){
        var applyInput = generateApplyEffectOnCharacterInput(innerState.characterInfo.casterAttributes, innerState.characterInfo.casterAttributes, innerState.characterInfo.casterEffects, innerState.characterInfo.casterEffects, special5.effect, gameStatus.derivedEffects, gameStatus.nextSeed, 1);
        overrideApplyEffect(applyInput, applyEffectOnCharacter(undefined, applyInput, gameStatus.extra.thisTurnTextInstanceGroup));
    }
    applyEndTurnEffects(innerState.characterInfo.casterEffects, innerState.characterInfo.casterAttributes, gameStatus.extra.thisTurnTextInstanceGroup);
    prepareForNextGameStatus(generatePrepareForNextGameStatusInput(gameStatus, innerState.deckInfo, innerState.gauge, innerState.characterInfo, intervalIds, gameStatus.derivedEffects), gameStatus.extra.nextTurnTextInstanceGroup);
    gameStatus.abilitySelection = playerAction;
    gameStatus.validAction = true;
    gameStatus.finished = innerState.characterInfo.casterAttributes.hp <= 0 || innerState.characterInfo.receiverAttributes.hp <= 0;
    gameStatus.gauge = innerState.gauge;
    gameStatus.characterInfo = innerState.characterInfo;
    gameStatus.deckInfo = innerState.deckInfo;
    gameStatus.nextSeed = getRandomIntFromNumber(gameStatus.nextSeed);
    //FightLogic.GameStatusV2 memory simulatedNextStart = PVELibrary2.beforeNewTurnStartExternal(gameStatus);
    return gameStatus;
}

function findPlayerActionInternal(gameStatus, playerAction, intervalIds){
    var innerState = constructInnerState(gameStatus.deckInfo, gameStatus.gauge, gameStatus.characterInfo, constructCharacterInfo(gameStatus.characterInfo.receiverBaseAttribute, gameStatus.characterInfo.casterBaseAttribute, gameStatus.characterInfo.receiverAttributes, gameStatus.characterInfo.casterAttributes, gameStatus.characterInfo.receiverEffects, gameStatus.characterInfo.casterEffects, gameStatus.characterInfo.receiverAbilityStatus, gameStatus.characterInfo.casterAbilityStatus, gameStatus.characterInfo.receiverEquip, gameStatus.characterInfo.casterEquip, gameStatus.characterInfo.receiverSpecial, gameStatus.characterInfo.casterSpecial));
    updateInnerState(innerState, gameStatus);
    if(!(playerAction > -1)){
        throw "wrong action";
    }
    if(checkSkipped(innerState.characterInfo.casterEffects)){
        throw "player is stuned";
    }
    if(innerState.characterInfo.casterAbilityStatus.abilities[playerAction].passive){
        throw "invalid ability";
    }
    if(!abilityRequirementSatisfied(innerState.characterInfo, innerState.characterInfo.casterAbilityStatus.abilities[playerAction])){
        throw "ability condition not satisfied";
    }
    if(!(innerState.characterInfo.casterAttributes.action.actionPoint - innerState.characterInfo.casterAbilityStatus.abilities[playerAction].actionPoint >= 0)){
        throw "not enough action point";
    }
    //players turn
    var castInput = generateCastAbilityInput(innerState.deckInfo, innerState.gauge, false, innerState.characterInfo, playerAction, gameStatus.derivedEffects, gameStatus.nextSeed);
    overrideCastInputWithInput(castInput, castAbility(gameStatus.characterInfo, castInput, gameStatus.extra.thisTurnTextInstanceGroup));
    if(AbilityOfClass(innerState.characterInfo.casterAbilityStatus.abilities[playerAction], 4)){
        innerState.deckInfo.playerCards = playCardWithAbilityIndexAndRemove(playerAction, innerState.deckInfo.playerCards);
    }else{
        innerState.deckInfo.playerCards = playCardWithAbilityIndex(playerAction, innerState.deckInfo.playerCards);
    }
    innerState.characterInfo.casterEffects.specialCounter[2] ++;
    gameStatus.nextAvailableAbilities = getAvailableAbilities(innerState.deckInfo.playerCards, innerState.characterInfo);
    gameStatus.nextTurnType = 2;
    updateGameStatusWithInput(gameStatus, innerState);

    gameStatus.abilitySelection = playerAction;
    gameStatus.validAction = true;
    gameStatus.finished = innerState.characterInfo.casterAttributes.hp <= 0 || innerState.characterInfo.receiverAttributes.hp <= 0;
    gameStatus.gauge = innerState.gauge;
    gameStatus.characterInfo = innerState.characterInfo;
    gameStatus.deckInfo = innerState.deckInfo;
    gameStatus.nextSeed = getRandomIntFromNumber(gameStatus.nextSeed);
    //FightLogic.GameStatusV2 memory simulatedNextStart = PVELibrary2.beforeNewTurnStartExternal(gameStatus);
    return gameStatus;
}

function playCardWithAbilityIndex(arg1, arg2){
    var abilityIndexToPlay = JSON.parse(JSON.stringify(arg1));
    var cards = JSON.parse(JSON.stringify(arg2));
    var cardId = abilityIndexToPlay;
    var indexToPlay = -1;
    for(var i = 0; i < cards.handSize; i ++){
        if(cards.hand[i] == abilityIndexToPlay){
            indexToPlay = i;
            break;
        }
    }
    if(indexToPlay < 0){
        throw "not valid card to play";
    }
    updateHand(cards, indexToPlay, cards.hand[cards.handSize - 1]);
    cards.handSize -= 1;
    updateDiscarded(cards, cards.discardedSize, cardId);
    cards.discardedSize ++;
    return cards;
}

function playCardWithAbilityIndexAndRemove(arg1, arg2){
    var abilityIndexToPlay = JSON.parse(JSON.stringify(arg1));
    var cards = JSON.parse(JSON.stringify(arg2));
    var cardId = abilityIndexToPlay;
    var indexToPlay = -1;
    for(var i = 0; i < cards.handSize; i ++){
        if(cards.hand[i] == abilityIndexToPlay){
            indexToPlay = i;
            break;
        }
    }
    if(indexToPlay < 0){
        throw "not valid card to play";
    }
    updateHand(cards, indexToPlay, cards.hand[cards.handSize - 1]);
    cards.handSize -= 1;
    return cards;
}

function overrideGauge(source, target){
    source.mainCharacterGauge = target.mainCharacterGauge;
    source.enemyGauge = target.enemyGauge;
}

function overrideCharacterInfo(source, target){
    overrideAttribute(source.casterBaseAttribute, target.casterBaseAttribute);
    overrideAttribute(source.receiverBaseAttribute, target.receiverBaseAttribute);
    overrideAttribute(source.casterAttributes, target.casterAttributes);
    overrideAttribute(source.receiverAttributes, target.receiverAttributes);
    overrideEffectsOnCharacter(source.casterEffects, target.casterEffects);
    overrideEffectsOnCharacter(source.receiverEffects, target.receiverEffects);
    //source.casterAbilityStatus = target.casterAbilityStatus;
    //source.receiverAbilityStatus = target.receiverAbilityStatus;
    source.casterEquip = target.casterEquip;
    source.receiverEquip = target.receiverEquip;
    source.casterSpecial = target.casterSpecial;
    source.receiverSpecial = target.receiverSpecial;
}

function generateTextInstance(type, hpDelta, shieldDelta, onPlayer){
    return {"iType" : type, "hpDelta" : hpDelta, "shieldDelta" : shieldDelta, "onPlayer" : onPlayer};
}

function castAbility(mutableCharacterInfo, arg1, textInstanceGroup){
    var input = JSON.parse(JSON.stringify(arg1));
    syncGaugeWithGauge(input.characterInfo, input.reversed, input.gauge);
    var ab = input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex];
    runConditionRelated(generateTriggerCondition(ab.triggerType, ab.triggerAttr, ab.triggerOperator, ab.triggerVal), input.characterInfo);
    var executionTime = 1;
    var flags = Array(2);
    //is combo
    flags[0] = AbilityOfClass(input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex], 0);
    //is swift
    flags[1] = AbilityOfClass(input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex], 2);
    if(flags[0] || flags[1]){
        executionTime += input.characterInfo.receiverEffects.specialCounter[0];
        if(flags[0]){
            input.characterInfo.receiverEffects.specialCounter[0] = 0;
        }
    }
    if(input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].actionPoint == -1){
        executionTime *= input.characterInfo.casterAttributes.action.actionPoint;
        input.characterInfo.casterAttributes.action.actionPoint = 0;
    }else{
        input.characterInfo.casterAttributes.action.actionPoint -= input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].actionPoint;
    }
    for(var i = 0 ; i < executionTime; i ++){
        if(input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].selfTarget){
            applyAbilityEffect(mutableCharacterInfo.casterAbilityStatus.abilities[input.abilityIndex].selfEffect, input.characterInfo.casterAttributes, input.characterInfo.casterAttributes, input.characterInfo.casterEffects, input.characterInfo.casterEffects, input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].selfEffect, input.derivedEffects, input.seed, 1, textInstanceGroup);
            triggerBonusCardAbility(input.deckInfo, input.reversed, input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].selfEffect, input.abilityIndex, input.characterInfo);
            overrideDeckInfo(input.deckInfo, triggerDrawCardAbility(input.deckInfo, input.reversed, input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].selfEffect, input.seed));
        }
        if(input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].enemyTarget){
            applyAbilityEffect(mutableCharacterInfo.casterAbilityStatus.abilities[input.abilityIndex].targetEffect, input.characterInfo.casterAttributes, input.characterInfo.receiverAttributes, input.characterInfo.casterEffects, input.characterInfo.receiverEffects, input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].targetEffect, input.derivedEffects, input.seed, 1, textInstanceGroup);
            overrideDeckInfo(input.deckInfo, triggerDrawCardAbility(input.deckInfo, input.reversed, input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].targetEffect, input.seed));
        }
        var special = getCharacterSpecialAbilityById(input.characterInfo.casterSpecial, 1);
        if(special.id != 0 && input.characterInfo.casterAbilityStatus.abilities[input.abilityIndex].actionPoint == special.attributes[1]){
            input.characterInfo.casterAttributes.action.actionPoint += special.attributes[2];
            if(input.characterInfo.casterAttributes.action.actionPoint > input.characterInfo.casterAttributes.action.actionPointMax){
                input.characterInfo.casterAttributes.action.actionPoint = input.characterInfo.casterAttributes.action.actionPointMax;
            }
        }
    }
    syncGaugeWithCharacterInfo(input.characterInfo, input.reversed, input.gauge);
    refreshStatus(input.gauge, input.characterInfo);
    return input;
}

function triggerDrawCardAbility(arg1, arg2, arg3, seed) {
    var deckInfo = JSON.parse(JSON.stringify(arg1));
    var reversed = JSON.parse(JSON.stringify(arg2));
    var effects = JSON.parse(JSON.stringify(arg3));
    for(var i = 0; i < effects.length; i ++){
        var cards = reversed ? deckInfo.enemyCards : deckInfo.playerCards;
        var effect = effects[i];
        var index = checkExtraKey(effect, 0);
        if(index != -1){
            var cardsToDraw = effect.instantEffect.extraVals[index] * effect.instantEffect.instances;
            var target = drawCards(cardsToDraw, cards, seed);
            if(reversed){
                deckInfo.enemyCards = target;
            }else{
                deckInfo.playerCards = target;
            }
        }
    }
    return deckInfo;
}

function findAbilityChildren(abilityStatus, abilityIndex){
    var abilityRelation = abilityStatus.abilityRelation;
    var index = 0;
    for(var i = 0; i < abilityRelation.length; i ++){
        if(abilityRelation[i].parent == abilityIndex){
            return abilityRelation[i].child;
        }
    }
    return -1;
}

function addCardInHand(arg1, targetCardIndex){
    var card = JSON.parse(JSON.stringify(arg1));
    updateHand(card, card.handSize, targetCardIndex);
    card.handSize ++;
    return card;
}

function triggerBonusCardAbility(deckInfo, reversed, effects, abilityIndex, characterInfo) {
    for(var i = 0; i < effects.length; i ++){
        var effect = effects[i];
        if(effect.gainCardEffect.valid){
            var childrenIndex = findAbilityChildren(characterInfo.casterAbilityStatus, abilityIndex);
            if(childrenIndex == -1){
                return;
            }
            var bonusAbility = characterInfo.casterAbilityStatus.bonusAbilities[childrenIndex];
            var oldAbilities = characterInfo.casterAbilityStatus.abilities;
            characterInfo.casterAbilityStatus.abilities = Array(oldAbilities.length + effect.gainCardEffect.count);
            for(var i = 0; i < oldAbilities.length; i ++){
                characterInfo.casterAbilityStatus.abilities[i] = oldAbilities[i];
            }
            for(var i = oldAbilities.length; i < characterInfo.casterAbilityStatus.abilities.length; i ++){
                characterInfo.casterAbilityStatus.abilities[i] = bonusAbility;
            }
            for(var j = oldAbilities.length; j < characterInfo.casterAbilityStatus.abilities.length; j ++){
                if(reversed){
                    deckInfo.enemyCards = addCardInHand(deckInfo.enemyCards, j);
                }else{
                    deckInfo.playerCards = addCardInHand(deckInfo.playerCards, j);
                }
            }
            break;
        }
    }
}

function applyAbilityEffect(mutableEffect, caster, receiver, effectOnCaster, effectOnReceiver, abilityEffects, derivedEffects, seed, executionTime, textInstanceGroup) {
    for(var i = 0; i < abilityEffects.length; i ++){
        if(abilityEffects[i].targetSelf){
            var applyInput = generateApplyEffectOnCharacterInput(caster, receiver, effectOnCaster, effectOnReceiver, abilityEffects[i], derivedEffects, seed, executionTime);
            overrideApplyEffect(applyInput, applyEffectOnCharacter(mutableEffect[i], applyInput, textInstanceGroup));
        }else{
            var applyInput = generateApplyEffectOnCharacterInput(caster, caster, effectOnCaster, effectOnReceiver, abilityEffects[i], derivedEffects, seed, executionTime);
            overrideApplyEffect(applyInput, applyEffectOnCharacter(mutableEffect[i], applyInput, textInstanceGroup));
        }
    }
}

function findSpecialAbilityActionInternal(gameStatus, playerAction, intervalIds) {
    var innerState = constructInnerState(gameStatus.deckInfo, gameStatus.gauge, gameStatus.characterInfo, constructCharacterInfo(gameStatus.characterInfo.receiverBaseAttribute, gameStatus.characterInfo.casterBaseAttribute, gameStatus.characterInfo.receiverAttributes, gameStatus.characterInfo.casterAttributes, gameStatus.characterInfo.receiverEffects, gameStatus.characterInfo.casterEffects, gameStatus.characterInfo.receiverAbilityStatus, gameStatus.characterInfo.casterAbilityStatus, gameStatus.characterInfo.receiverEquip, gameStatus.characterInfo.casterEquip, gameStatus.characterInfo.receiverSpecial, gameStatus.characterInfo.casterSpecial));
    updateInnerState(innerState, gameStatus);

    var specialIndex = findSpecialIndex(innerState.characterInfo.casterSpecial, playerAction, innerState.characterInfo.casterAttributes.action.actionPoint);
    applySpecialEffectV2(innerState.characterInfo.casterSpecial[specialIndex], innerState.characterInfo, gameStatus.derivedEffects, gameStatus.extra.thisTurnTextInstanceGroup);
    gameStatus.nextAvailableAbilities = getAvailableAbilities(innerState.deckInfo.playerCards, innerState.characterInfo);
    gameStatus.nextTurnType = 2;
    updateGameStatusWithInput(gameStatus, innerState);

    gameStatus.abilitySelection = playerAction;
    gameStatus.validAction = true;
    gameStatus.finished = innerState.characterInfo.casterAttributes.hp <= 0 || innerState.characterInfo.receiverAttributes.hp <= 0;
    gameStatus.gauge = innerState.gauge;
    gameStatus.characterInfo = innerState.characterInfo;
    gameStatus.deckInfo = innerState.deckInfo;
    gameStatus.nextSeed = getRandomIntFromNumber(gameStatus.nextSeed);
    return gameStatus;
}

function updateGameStatusWithInput(gameStatus, innerState) {
    gameStatus.nextIsFirstAction = false;
    gameStatus.nextActionGauge = innerState.gauge;
    gameStatus.deckInfo = innerState.deckInfo;
    gameStatus.casterEffectsNextStart = innerState.characterInfo.casterEffects;
    gameStatus.receiverEffectsNextStart = innerState.characterInfo.receiverEffects;
    gameStatus.casterAttributeNextStart = innerState.characterInfo.casterAttributes;
    gameStatus.receiverAttributeNextStart = innerState.characterInfo.receiverAttributes;
    gameStatus.deckInfoNextStart = innerState.deckInfo;
}

function applySpecialEffectV2(special, characterInfo, derivedEffects, textInstanceGroup) {
    if(special.id != 0){
        var specialOnTarget = special.onTarget;
        runConditionRelated(generateTriggerCondition(special.triggerType, special.triggerAttr, special.triggerOperator, special.triggerVal), characterInfo);
        var applyInput = generateApplyEffectOnCharacterInput(characterInfo.casterAttributes, specialOnTarget ? characterInfo.receiverAttributes : characterInfo.casterAttributes, characterInfo.casterEffects, specialOnTarget ? characterInfo.receiverEffects : characterInfo.casterEffects, special.effect, derivedEffects, 0, 1);
        overrideApplyEffect(applyInput, applyEffectOnCharacter(undefined, applyInput, textInstanceGroup));
    }
}

function runConditionRelated(triggerCondition, characterInfo){
    removeCounterFromCaster(triggerCondition, characterInfo);
    removeEffectStackFromCaster(triggerCondition, characterInfo);
}

function removeCounterFromCaster(triggerCondition, characterInfo) {
    if(triggerCondition.triggerType == 3){
        for(var i = 0; i < triggerCondition.triggerAttr.length; i ++){
            characterInfo.casterEffects.specialCounter[triggerCondition.triggerAttr[i]] -= triggerCondition.triggerVal[i];
        }
    }
}

function removeEffectStackFromCaster(triggerCondition, characterInfo) {
    if(triggerCondition.triggerType == 4){
        for(var i = 0; i < triggerCondition.triggerAttr.length; i ++){
            removeStackFromEffect(characterInfo.casterEffects, triggerCondition.triggerAttr[i], triggerCondition.triggerVal[i]);
        }
    }
}

function removeStackFromEffect(effects, effectNameId, stackNumber){
    for(var i = 0; i < effects.valid.length; i ++){
        if(effects.valid[i] && effects.effectMap[i].effectNameId == effectNameId){
            if(effects.extraStack[i] <= stackNumber - 1){
                effects.valid[i] = false;
            }else{
                effects.extraStack[i] -= stackNumber;
            }
        }
    }
}

function findSpecialIndex(specialAbilities, targetCommandId, currentAP){
    var specialIndex = -1;
    for(var i = 0; i < specialAbilities.length; i ++){
        if(specialAbilities[i].commandId == targetCommandId){
            specialIndex = i;
            break;
        }
    }
    if(specialIndex == -1){
        throw 'special action is not available';
    }
    if(currentAP < specialAbilities[specialIndex].cost){
        throw 'not enough ap to cast special';
    }
    return specialIndex;
}

function constructInnerState(deckInfo, gauge, characterInfo, reversedInfo) {
    return { "deckInfo": deckInfo, "gauge": gauge, "characterInfo": characterInfo, "reversedInfo": reversedInfo };
}

function constructCharacterInfo(casterBaseAttribute, receiverBaseAttribute, casterAttributes, receiverAttributes, casterEffects, receiverEffects, casterAbilityStatus, receiverAbilityStatus, casterEquip, receiverEquip, casterSpecial, receiverSpecial) {
    return { "casterBaseAttribute": casterBaseAttribute, "receiverBaseAttribute": receiverBaseAttribute, "casterAttributes": casterAttributes, "receiverAttributes": receiverAttributes, "casterEffects": casterEffects, "receiverEffects": receiverEffects, "casterAbilityStatus": casterAbilityStatus, "receiverAbilityStatus": receiverAbilityStatus, "casterEquip": casterEquip, "receiverEquip": receiverEquip, "casterSpecial": casterSpecial, "receiverSpecial": receiverSpecial };
}

function generateAggregatedInput(attributeBase, effects){
    return { "attributeBase" : attributeBase, "effects" : effects};
}

function generateCharacterAttribute(maxHP, hp, physicalDamageResistanceFactor, fireDamageResistanceFactor, 
    iceDamageResistanceFactor,
    ligtenningDamageResistanceFactor, physicalDamageMultiplierFactor, magicDamageMultiplierFactor, baseAttack,
    evasionFactor, speed, shield, isActive, action){
    return { "maxHP" : maxHP, "hp" : hp, "physicalDamageResistanceFactor" : physicalDamageResistanceFactor, "fireDamageResistanceFactor" : fireDamageResistanceFactor,
        "iceDamageResistanceFactor" : iceDamageResistanceFactor,
        "ligtenningDamageResistanceFactor" : ligtenningDamageResistanceFactor,
        "physicalDamageMultiplierFactor" : physicalDamageMultiplierFactor,
        "magicDamageMultiplierFactor" : magicDamageMultiplierFactor,
        "baseAttack" : baseAttack,
        "evasionFactor" : evasionFactor,
        "speed" : speed,
        "shield" : shield,
        "isActive" : isActive,
        "action" : action
    };
}

function generateAction(actionPoint,
    actionPointMax,
    maxCard,
    gaugeVal,
    actionGain,
    maxSouls){
    return { "actionPoint" : actionPoint,
        "actionPointMax" : actionPointMax,
        "maxCard" : maxCard,
        "gaugeVal" : gaugeVal,
        "actionGain" : actionGain,
        "maxSouls" : maxSouls
    }
}

function generatePrepareForNextGameStatusInput(gameStatus, deckInfo, gauge, characterInfo, intervalIds, derivedEffects){
    return {"gameStatus" : gameStatus,
        "deckInfo" : deckInfo,
        "gauge" : gauge,
        "characterInfo" : characterInfo,
        "intervalIds" : intervalIds,
        "derivedEffects" : derivedEffects
    };
}

function generateFindNextActionPointAndRemoveExpiredEffectInput(gauge, characterInfo, deckInfo, nextAvailables, derivedEffects, seed){
    return {"gauge" : gauge,
        "characterInfo" : characterInfo,
        "deckInfo" : deckInfo,
        "nextAvailables" : nextAvailables,
        "derivedEffects" : derivedEffects,
        "seed" : seed
    }
}

function generateFindNextActionPointAndRemoveExpiredEffectOutput(actionTarget, gauge, characterInfo, deckInfo, nextAvailables){
    return {"actionTarget" : actionTarget,
        "gauge" : gauge,
        "characterInfo" : characterInfo,
        "deckInfo" : deckInfo,
        "nextAvailables" : nextAvailables
    }
}

function generateActionTarget(player, index){
    return {"player" : player, "index" : index};
}

function generateGauge(mainCharacterGauge, enemyGauge){
    return {"mainCharacterGauge" : mainCharacterGauge, "enemyGauge" : enemyGauge};
}

function generateSpecialAbilityEntry(id, attributes, effect, onTarget, commandId, cost, triggerType, triggerAttr, triggerOperator, triggerVal){
    return {"id" : id,
        "attributes" : attributes,
        "effect" : effect,
        "onTarget" : onTarget,
        "commandId" : commandId,
        "cost" : cost,
        "triggerType" : triggerType,
        "triggerAttr" : triggerAttr,
        "triggerOperator" : triggerOperator,
        "triggerVal" : triggerVal
    }
}

function generateApplyEffectOnCharacterInput(caster, receiver, effectOnCaster, effectOnReceiver, effect, 
    derivedEffects, seed, executionTime){
    return {"caster" : caster,
        "receiver" : receiver,
        "effectOnCaster" : effectOnCaster,
        "effectOnReceiver" : effectOnReceiver,
        "effect" : effect,
        "derivedEffects" : derivedEffects,
        "seed" : seed,
        "executionTime" : executionTime
    }
}

function generateApplyInstantEffectOutput(caster, receiver, effectOnCaster, effectOnReceiver){
    return {"caster" : caster,
        "receiver" : receiver,
        "effectOnCaster" : effectOnCaster,
        "effectOnReceiver" : effectOnReceiver
    }
}

function generateApplyEffectOnCharacterOutput(caster, receiver, effectOnCaster, effectOnReceiver, effect, seed){
    return {"caster" : caster,
        "receiver" : receiver,
        "effectOnCaster" : effectOnCaster,
        "effectOnReceiver" : effectOnReceiver,
        "effect" : effect,
        "seed" : seed
    }
}

function generateExecuteInstantEffectInput(ownerEffect, otherEffects, ownerAttributes, otherSideAttribute, index, seed, ignoreCaster){
    return {"ownerEffect" : ownerEffect,
        "otherEffects" : otherEffects,
        "ownerAttributes" : ownerAttributes,
        "otherSideAttribute" : otherSideAttribute,
        "index" : index,
        "seed" : seed,
        "ignoreCaster" : ignoreCaster
    }
}

function generateInstantEffectInput(effectOnCaster, effectOnReceiver, effect, stack, seed, ignoreCasterAttributes, executionTime){
    return {"effectOnCaster" : effectOnCaster,
        "effectOnReceiver" : effectOnReceiver,
        "effect" : effect,
        "stack" : stack,
        "seed" : seed,
        "ignoreCasterAttributes" : ignoreCasterAttributes,
        "executionTime" : executionTime
    }
}

function generateUpdateEffectInnerState(nextAvailables, executeUpdate, reversed){
    return {"nextAvailables" : nextAvailables, "executeUpdate" : executeUpdate, "reversed" : reversed}
}

function generateEffectResolveOutput(casterAttributes, receiverAttributes, casterEffects, receiverEffects){
    return {"casterAttributes" : casterAttributes, "receiverAttributes" : receiverAttributes, "casterEffects" : casterEffects, "receiverEffects" : receiverEffects}
}

function generateEffectResolutionInput(casterSpecial, receiverSpecial, casterAttributes, receiverAttributes, casterEffects, receiverEffects, derivedEffects, intervalId){
    return {"casterSpecial" : casterSpecial, 
        "receiverSpecial" : receiverSpecial,
        "casterAttributes" : casterAttributes,
        "receiverAttributes" : receiverAttributes,
        "casterEffects" : casterEffects,
        "receiverEffects" : receiverEffects,
        "derivedEffects" : derivedEffects,
        "intervalId" : intervalId
    };
}

function generateTriggerCondition(triggerType, triggerAttr, triggerOperator, triggerVal){
    return {"triggerType" : triggerType, "triggerAttr" : triggerAttr, "triggerOperator" : triggerOperator, "triggerVal" : triggerVal};
}

function generateUpdateEffectsAtStartOfTurnOutput(characterInfo, deckInfo, nextAvailables){
    return {"characterInfo" : characterInfo, "deckInfo" : deckInfo, "nextAvailables" : nextAvailables};
}

function generateEffect(effectCatalogId, effectNameId, modifierEffect, instantEffect, enchancedEffect, gainCardEffect, specialEffect, extraData,
    initialExtraStack, targetSelf, duration, durationType, stackReductionType, dispellable){
    return {
        "effectCatalogId" : effectCatalogId,
        "effectNameId" : effectNameId,
        "modifierEffect" : modifierEffect,
        "instantEffect" : instantEffect,
        "enchancedEffect" : enchancedEffect,
        "gainCardEffect" : gainCardEffect,
        "specialEffect" : specialEffect,
        "extraData" : extraData,
        "initialExtraStack" : initialExtraStack,
        "targetSelf" : targetSelf,
        "duration" : duration,
        "durationType" : durationType,
        "stackReductionType" : stackReductionType,
        "dispellable" : dispellable
    };
}

function generateModiferEffect(maxHpDelta, maxHpModifierFactorDelta, baseAttackDelta, physicalDamageModifierDelta, magicDamageModifierDelta, physicalDamageResistanceDelta, fireDamageResistanceDelta, 
    iceDamageResistanceDelta, lightenningDamageResistanceDelta, evasionDelta, speedDelta, extraKeys, extraVals){
    return {
        "maxHpDelta" : maxHpDelta,
        "maxHpModifierFactorDelta" : maxHpModifierFactorDelta,
        "baseAttackDelta" : baseAttackDelta,
        "physicalDamageModifierDelta" : physicalDamageModifierDelta,
        "magicDamageModifierDelta" : magicDamageModifierDelta,
        "physicalDamageResistanceDelta" : physicalDamageResistanceDelta,
        "fireDamageResistanceDelta" : fireDamageResistanceDelta,
        "iceDamageResistanceDelta" : iceDamageResistanceDelta,
        "lightenningDamageResistanceDelta" : lightenningDamageResistanceDelta,
        "evasionDelta" : evasionDelta,
        "speedDelta" : speedDelta,
        "extraKeys" : extraKeys,
        "extraVals" : extraVals
    };
}

function generateInstantEffect(hpDelta, hpRatioDelta, actionDelta, progressDelta, shieldDelta, damage, baseDamageRatio, damageType, instances, special, specialIndex, specialDelta, dispellCount, extraKeys, extraVals, extraOperators){
    return {
        "hpDelta" : hpDelta,
        "hpRatioDelta" : hpRatioDelta,
        "actionDelta" : actionDelta,
        "progressDelta" : progressDelta,
        "shieldDelta" : shieldDelta,
        "shieldDelta" : shieldDelta,
        "damage" : damage,
        "baseDamageRatio" : baseDamageRatio,
        "damageType" : damageType,
        "instances" : instances,
        "special" : special,
        "specialIndex" : specialIndex,
        "specialDelta" : specialDelta,
        "dispellCount" : dispellCount,
        "extraKeys" : extraKeys,
        "extraVals" : extraVals,
        "extraOperators" : extraOperators
    };
}

function generateEnchancedEffect(triggerProbability, enchancedEffectCatalogId, enchancedEffectNameId){
    return {
        "triggerProbability" : triggerProbability,
        "enchancedEffectCatalogId" : enchancedEffectCatalogId,
        "enchancedEffectNameId" : enchancedEffectNameId
    }
}

function generateGainCardEffect(valid, bonusAbilityCid, bonusAbilityLevel, bonusType, count){
    return {
        "valid" : valid,
        "bonusAbilityCid" : bonusAbilityCid,
        "bonusAbilityLevel" : bonusAbilityLevel,
        "bonusType" : bonusType,
        "count" : count
    }
}

function generateSpecialEffect(valid, reflection, rType, lifesteal){
    return {
        "valid" : valid,
        "reflection" : reflection,
        "rType" : rType,
        "lifesteal" : lifesteal
    }
}

function generateCastAbilityInput(deckInfo, gauge, reversed, characterInfo, abilityIndex, derivedEffects, seed){
    return {
        "deckInfo" : deckInfo,
        "gauge" : gauge,
        "reversed" : reversed,
        "characterInfo" : characterInfo,
        "abilityIndex" : abilityIndex,
        "derivedEffects" : derivedEffects,
        "seed" : seed
    }
}
function updateInnerState(innerState, gameStatus){
    gameStatus.currentTurnType = gameStatus.nextTurnType;
    gameStatus.nextAvailableAbilities = [];
    innerState.deckInfo = gameStatus.deckInfoNextStart;
    innerState.gauge = gameStatus.nextActionGauge;
    if(gameStatus.extra != undefined){
        gameStatus.extra.thisTurnTextInstanceGroup = gameStatus.extra.nextTurnTextInstanceGroup;
        gameStatus.extra.nextTurnTextInstanceGroup = [];
    }else{
        gameStatus.extra = initStatusExtra();
    }
    overrideAttribute(gameStatus.characterInfo.casterAttributes, gameStatus.casterAttributeNextStart);
    overrideAttribute(gameStatus.characterInfo.receiverAttributes, gameStatus.receiverAttributeNextStart);
    overrideEffectsOnCharacter(gameStatus.characterInfo.casterEffects, gameStatus.casterEffectsNextStart);
    overrideEffectsOnCharacter(gameStatus.characterInfo.receiverEffects, gameStatus.receiverEffectsNextStart);
    innerState.characterInfo = gameStatus.characterInfo;
    innerState.reversedInfo = constructCharacterInfo(innerState.characterInfo.receiverBaseAttribute, innerState.characterInfo.casterBaseAttribute, innerState.characterInfo.receiverAttributes, innerState.characterInfo.casterAttributes, innerState.characterInfo.receiverEffects, innerState.characterInfo.casterEffects, innerState.characterInfo.receiverAbilityStatus, innerState.characterInfo.casterAbilityStatus, innerState.characterInfo.receiverEquip, innerState.characterInfo.casterEquip, innerState.characterInfo.receiverSpecial, innerState.characterInfo.casterSpecial);
    refreshStatus(innerState.gauge, innerState.characterInfo);
}

function prepareForNextGameStatus(input, textInstanceGroup) {
    output = findNextActionPointAndRemoveExpiredEffect(generateFindNextActionPointAndRemoveExpiredEffectInput(input.gauge, input.characterInfo, input.deckInfo, input.gameStatus.nextAvailableAbilities, input.derivedEffects, getRandomIntFromNumber(input.gameStatus.nextSeed)), input.intervalIds, textInstanceGroup);
    updateNextTurnGameStatus(input.gameStatus, input.deckInfo, output.actionTarget, output.characterInfo, output.gauge);
    input.gameStatus.casterEffectsNextStart = output.characterInfo.casterEffects;
    input.gameStatus.receiverEffectsNextStart = output.characterInfo.receiverEffects;
    input.gameStatus.casterAttributeNextStart = output.characterInfo.casterAttributes;
    input.gameStatus.receiverAttributeNextStart = output.characterInfo.receiverAttributes;
    input.gameStatus.deckInfoNextStart = output.deckInfo;
    input.gameStatus.nextAvailableAbilities = output.nextAvailables;
    input.gameStatus.nextAbilitySelection = output.actionTarget.index;
}

function updateNextTurnGameStatus(gameStatusToUpdate, currentDeck, nextActionTarget, tempCharacterInfo, nextGauge){
    if(nextActionTarget.index == -1){
        if(nextActionTarget.player){
            gameStatusToUpdate.nextTurnType = 2;
        }else{
            gameStatusToUpdate.nextTurnType = 3;
        }
        gameStatusToUpdate.nextIsFirstAction = true;
    }else{
        gameStatusToUpdate.nextTurnType = nextActionTarget.player ? 0 : 1;
        gameStatusToUpdate.nextIsFirstAction = false;
    }
    gameStatusToUpdate.nextActionGauge = nextGauge; 
}

function MurmurHash3(string) {
    let i = 0;
    for (i, hash = 1779033703 ^ string.length; i < string.length; i++) {
        let bitwise_xor_from_character = hash ^ string.charCodeAt(i);
        hash = Math.imul(bitwise_xor_from_character, 3432918353);
        hash = hash << 13 | hash >>> 19;
    } return () => {
       // Return the hash that you can use as a seed
        hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
        hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
        return (hash ^= hash >>> 16) >>> 0;
    }
}

function getRandomIntFromNumber(number){
    return MurmurHash3(number.toString())();
}

function getRandomSeededMinMax(min, max, seed){
    return min + parseInt(seed) % (max - min + 1);
}

function overrideAttribute(source, target){
    source.maxHP = target.maxHP;
    source.hp = target.hp;
    source.physicalDamageResistanceFactor = target.physicalDamageResistanceFactor;
    source.fireDamageResistanceFactor = target.fireDamageResistanceFactor;
    source.iceDamageResistanceFactor = target.iceDamageResistanceFactor;
    source.ligtenningDamageResistanceFactor = target.ligtenningDamageResistanceFactor;

    source.physicalDamageMultiplierFactor = target.physicalDamageMultiplierFactor;
    source.magicDamageMultiplierFactor = target.magicDamageMultiplierFactor;

    source.baseAttack = target.baseAttack;
    source.evasionFactor = target.evasionFactor;
    source.speed = target.speed;
    source.shield = target.shield;
    source.isActive = target.isActive;
    source.action.actionPoint = target.action.actionPoint;
    source.action.actionPointMax = target.action.actionPointMax;
    source.action.maxCard = target.action.maxCard;
    source.action.gaugeVal = target.action.gaugeVal;
    source.action.actionGain = target.action.actionGain;
}

function overrideEffectsOnCharacter(source, target){
    source.effectMap = target.effectMap;
    source.duration = target.duration;
    source.durationType = target.durationType;
    source.valid = target.valid;
    source.ownerId = target.ownerId;
    source.effectCatalogs.damageImmume = target.effectCatalogs.damageImmume;
    source.effectCatalogs.ignited = target.effectCatalogs.ignited;
    source.effectCatalogs.stuned = target.effectCatalogs.stuned;
    source.effectCatalogs.poisoned = target.effectCatalogs.poisoned;
    source.specialCounter = target.specialCounter;
    source.extraStack = target.extraStack;
    source.val = target.val;
    source.key = target.key;
}

function refreshStatus(gauge, characterInfo){
    syncGaugeWithGauge(characterInfo, false, gauge);
    refreshStatusWithoutGauge(characterInfo);
    syncGaugeWithCharacterInfo(characterInfo, false, gauge);
}

function syncGaugeWithGauge(cinfo, reversed, gauge){
    if(reversed){
        cinfo.casterAttributes.action.gaugeVal = gauge.enemyGauge;
        cinfo.receiverAttributes.action.gaugeVal = gauge.mainCharacterGauge;
    }else{
        cinfo.casterAttributes.action.gaugeVal = gauge.mainCharacterGauge;
        cinfo.receiverAttributes.action.gaugeVal = gauge.enemyGauge;
    }
}

function refreshStatusWithoutGauge(characterInfo) {
    var playerInput = generateAggregatedInput(characterInfo.casterBaseAttribute, characterInfo.casterEffects);
    var enemyInput = generateAggregatedInput(characterInfo.receiverBaseAttribute, characterInfo.receiverEffects);
    var playerNewAttribute = calculateAggregatedAttributesInFight(playerInput, enemyInput);
    var enemyNewAttribute = calculateAggregatedAttributesInFight(enemyInput, playerInput);
    updateExistingAttribute(characterInfo.casterAttributes, playerNewAttribute);
    updateExistingAttribute(characterInfo.receiverAttributes, enemyNewAttribute);
    updateExistingEffectCatalogs(characterInfo.casterEffects);
    updateExistingEffectCatalogs(characterInfo.receiverEffects);
}

function calculateAggregatedAttributesInFight(arg1, arg2){
    var characterInput = JSON.parse(JSON.stringify(arg1));
    var enemyInput = JSON.parse(JSON.stringify(arg2));
    applyAttributeDelta(characterInput.attributeBase, calculateEffectAttributes(characterInput.attributeBase, characterInput.effects, enemyInput.attributeBase, enemyInput.effects));
    capOnLimitValues(characterInput.attributeBase);
    return characterInput.attributeBase;
}

function applyAttributeDelta(attr1, attr2){
    attr1.maxHP += attr2.maxHP;
    attr1.baseAttack += attr2.baseAttack;
    attr1.speed += attr2.speed;
    attr1.physicalDamageResistanceFactor = attr1.physicalDamageResistanceFactor * attr2.physicalDamageResistanceFactor / 10000;
    attr1.fireDamageResistanceFactor = attr1.fireDamageResistanceFactor * attr2.fireDamageResistanceFactor / 10000;
    attr1.iceDamageResistanceFactor = attr1.iceDamageResistanceFactor * attr2.iceDamageResistanceFactor / 10000;
    attr1.ligtenningDamageResistanceFactor = attr1.ligtenningDamageResistanceFactor * attr2.ligtenningDamageResistanceFactor / 10000;
    attr1.physicalDamageMultiplierFactor = attr1.physicalDamageMultiplierFactor * attr2.physicalDamageMultiplierFactor / 10000;
    attr1.magicDamageMultiplierFactor = attr1.magicDamageMultiplierFactor * attr2.magicDamageMultiplierFactor / 10000;
    attr1.evasionFactor += attr2.evasionFactor;
    attr1.action.actionPointMax += attr2.action.actionPointMax;
    attr1.action.maxCard += attr2.action.maxCard;
    attr1.action.maxSouls += attr2.action.maxSouls; 
}

function getEmptyAttribute(){
    return generateCharacterAttribute(0, 0, 10000, 10000, 10000, 10000, 10000, 10000, 0, 0, 0, 0, true, generateAction(0, 0, 0, 0, 0, 0));
}

function calculateEffectAttributes(arg1, arg2, arg3, arg4) {
    var playerBaseAttributes = JSON.parse(JSON.stringify(arg1));
    var effectsOnCharacter = JSON.parse(JSON.stringify(arg2));
    var enemyBaseAttributes = JSON.parse(JSON.stringify(arg3));
    var effectsOnEnemy = JSON.parse(JSON.stringify(arg4));
    var attribute = getEmptyAttribute();
    var effectiveEffect = Array(effectsOnCharacter.effectMap.length + effectsOnEnemy.effectMap.length);
    var stackNumber = Array(effectiveEffect.length).fill(0);
    var count = 0;
    for(var index = 0; index < effectsOnCharacter.effectMap.length; index ++){
        if(!effectsOnCharacter.valid[index] || !effectsOnCharacter.effectMap[index].targetSelf){
            continue;
        }
        effectiveEffect[count] = effectsOnCharacter.effectMap[index];
        stackNumber[count] = effectsOnCharacter.extraStack[index] + 1;
        count ++;
    }
    for(var index = 0; index < effectsOnEnemy.effectMap.length; index ++){
        if(!effectsOnEnemy.valid[index] || effectsOnEnemy.effectMap[index].targetSelf){
            continue;
        }
        effectiveEffect[count] = effectsOnEnemy.effectMap[index];
        stackNumber[count] = effectsOnEnemy.extraStack[index] + 1;
        count ++;
    }
    for(var index = 0; index < count; index ++){
        var effect = effectiveEffect[index];
        //max ap change
        var stack = stackNumber[index];
        var ti = checkModiferExtraKey(effect, 1);
        if(ti != -1){
            attribute.action.actionPointMax += (stack * effect.modifierEffect.extraVals[ti]);
        }
        //max card
        ti = checkModiferExtraKey(effect, 0);
        if(ti != -1){
            attribute.action.maxCard += (stack * effect.modifierEffect.extraVals[ti]);
        }
        for(var c = 0; c < stack; c ++){
            if(effect.modifierEffect.physicalDamageResistanceDelta != 0){
                attribute.physicalDamageResistanceFactor = attribute.physicalDamageResistanceFactor * (10000 - effect.modifierEffect.physicalDamageResistanceDelta) / 10000;
            }
            if(effect.modifierEffect.fireDamageResistanceDelta != 0){
                attribute.fireDamageResistanceFactor = attribute.fireDamageResistanceFactor * (10000 - effect.modifierEffect.fireDamageResistanceDelta) / 10000;
            }
            if(effect.modifierEffect.iceDamageResistanceDelta != 0){
                attribute.iceDamageResistanceFactor = attribute.iceDamageResistanceFactor * (10000 - effect.modifierEffect.iceDamageResistanceDelta) / 10000;
            }
            if(effect.modifierEffect.lightenningDamageResistanceDelta != 0){
                attribute.ligtenningDamageResistanceFactor = attribute.ligtenningDamageResistanceFactor * (10000 - effect.modifierEffect.lightenningDamageResistanceDelta) / 10000;
            }
        }
        if(effect.modifierEffect.maxHpModifierFactorDelta != 0){
            attribute.maxHP += stack * playerBaseAttributes.maxHP * effect.modifierEffect.maxHpModifierFactorDelta / 10000;
        }
        if(effect.modifierEffect.evasionDelta != 0){
            attribute.evasionFactor += stack * effect.modifierEffect.evasionDelta;
        }
        if(effect.modifierEffect.maxHpDelta != 0){
            attribute.maxHP += stack * effect.modifierEffect.maxHpDelta;
        }
        if(effect.modifierEffect.baseAttackDelta != 0){
            attribute.baseAttack += stack * effect.modifierEffect.baseAttackDelta;
        }
        if(effect.modifierEffect.speedDelta != 0){
            attribute.speed += stack * effect.modifierEffect.speedDelta;
        }
        if(effect.modifierEffect.physicalDamageModifierDelta != 0){
            attribute.physicalDamageMultiplierFactor += stack * effect.modifierEffect.physicalDamageModifierDelta;
        }
        if(effect.modifierEffect.magicDamageModifierDelta != 0){
            attribute.magicDamageMultiplierFactor += stack * effect.modifierEffect.magicDamageModifierDelta;
        }
    }
    if(attribute.physicalDamageMultiplierFactor < 0){
        attribute.physicalDamageMultiplierFactor = 0;
    }
    if(attribute.magicDamageMultiplierFactor < 0){
        attribute.magicDamageMultiplierFactor = 0;
    }
    return attribute;
}

function checkModiferExtraKey(effect, key){
    for(var i = 0; i < effect.modifierEffect.extraKeys.length; i ++){
        if(effect.modifierEffect.extraKeys[i] == key){
            return i;
        }
    }
    return -1;
}

function capOnLimitValues(attributes){
    attributes.baseAttack = minCapVal(attributes.baseAttack, 0);
    attributes.speed = minCapVal(attributes.speed, 1);
    attributes.action.actionPointMax = minCapVal(attributes.action.actionPointMax, 0);
    attributes.action.maxCard = minCapVal(attributes.action.maxCard, 0);
    attributes.action.maxSouls = minCapVal(attributes.action.maxSouls, 0);
    attributes.maxHP = minCapVal(attributes.maxHP, 1);
}

function minCapVal(val, minVal){
    return val < minVal ? minVal : val;
}

function updateExistingAttribute(current, newAttribute){
    current.maxHP = newAttribute.maxHP;
    current.physicalDamageResistanceFactor = newAttribute.physicalDamageResistanceFactor;
    current.fireDamageResistanceFactor = newAttribute.fireDamageResistanceFactor;
    current.iceDamageResistanceFactor = newAttribute.iceDamageResistanceFactor;
    current.ligtenningDamageResistanceFactor = newAttribute.ligtenningDamageResistanceFactor;
    current.physicalDamageMultiplierFactor = newAttribute.physicalDamageMultiplierFactor;
    current.magicDamageMultiplierFactor = newAttribute.magicDamageMultiplierFactor;
    current.baseAttack = newAttribute.baseAttack;
    current.evasionFactor = newAttribute.evasionFactor;
    current.speed = newAttribute.speed;
    current.action.actionPointMax = newAttribute.action.actionPointMax;
    current.action.maxCard = newAttribute.action.maxCard;
    current.action.maxSouls = newAttribute.action.maxSouls;
    current.isActive = newAttribute.isActive;
}

function updateExistingEffectCatalogs(effect) {
    effect.effectCatalogs.damageImmume = false;
    effect.effectCatalogs.ignited = false;
    effect.effectCatalogs.stuned = false;
    effect.effectCatalogs.poisoned = false;
    for(var i = 0; i < effect.valid.length; i ++){
        if(!effect.valid[i]){
            continue;
        }
        if(effect.effectMap[i].effectCatalogId == 2){
            effect.effectCatalogs.damageImmume = true;
        }else if(effect.effectMap[i].effectCatalogId == 4){
            effect.effectCatalogs.ignited = true;
        }else if(effect.effectMap[i].effectCatalogId == 5){
            effect.effectCatalogs.stuned = true;
        }else if(effect.effectMap[i].effectCatalogId == 6){
            effect.effectCatalogs.poisoned = true;
        }
    }
}

function syncGaugeWithCharacterInfo(cinfo, reversed, gauge) {
    if(reversed){
        gauge.mainCharacterGauge = cinfo.receiverAttributes.action.gaugeVal;
        gauge.enemyGauge = cinfo.casterAttributes.action.gaugeVal;
    }else{
        gauge.mainCharacterGauge = cinfo.casterAttributes.action.gaugeVal;
        gauge.enemyGauge = cinfo.receiverAttributes.action.gaugeVal;
    }
}

function findNextActionPointAndRemoveExpiredEffect(input, intervalIds, textInstanceGroup){
    var output = {};
    output.actionTarget = findNextActionPointAndRemoveExpiredEffectInternal(input, intervalIds, textInstanceGroup);
    output.gauge = input.gauge;
    output.characterInfo = input.characterInfo;
    output.nextAvailables = input.nextAvailables;
    output.deckInfo = input.deckInfo;
    return output;
}

function overrideApplyEffect(input, output) {
    overrideEffectsOnCharacter(input.effectOnCaster, output.effectOnCaster);
    overrideEffectsOnCharacter(input.effectOnReceiver, output.effectOnReceiver);
    overrideAttribute(input.caster, output.caster);
    overrideAttribute(input.receiver, output.receiver);
    input.effect = output.effect;
    input.seed = output.seed;
}

function resolveSpecialAbility3(characterInfo, derivedEffects, seed, textInstanceGroup){
    var casterSpecial3 = getCharacterSpecialAbilityById(characterInfo.casterSpecial, 3);
    if(casterSpecial3.id != 0){
        if(characterInfo.casterAttributes.shield == 0){
            var applyInput = generateApplyEffectOnCharacterInput(characterInfo.casterAttributes, characterInfo.casterAttributes, characterInfo.casterEffects, characterInfo.casterEffects, casterSpecial3.effect, derivedEffects, seed, 1);
            overrideApplyEffect(applyInput, applyEffectOnCharacter(undefined, applyInput, textInstanceGroup));
        }else{
            removeEffectOnCharacter(characterInfo.casterEffects, casterSpecial3.effect);
        }
    }
}

function getExtraKeyForModifierEffect(effect, key){
    for(var i = 0; i < effect.modifierEffect.extraKeys.length; i ++){
        if(effect.modifierEffect.extraKeys[i] == key){
            return effect.modifierEffect.extraVals[i];
        }
    }
    return -1;
}

function applyEffectOnCharacter(mutableEffect, arg1, textInstanceGroup){
    var input = JSON.parse(JSON.stringify(arg1));
    if(input.effect.duration == 0){
        var output = applyInstantEffectOnCharacter(mutableEffect, input.caster, input.receiver, generateInstantEffectInput(input.effectOnCaster, input.effectOnReceiver, input.effect, 1, input.seed, false, input.executionTime), textInstanceGroup);
        overrideAttribute(input.caster, output.caster);
        overrideAttribute(input.receiver, output.receiver);
        overrideEffectsOnCharacter(input.effectOnCaster, output.effectOnCaster);
        overrideEffectsOnCharacter(input.effectOnReceiver, output.effectOnReceiver);
    }else if(input.effect.duration > 0){
        //use instant effect extra key for duration effect check
        if(!shouldBeExcuted(input.caster, input.receiver, input.effect.instantEffect)){
            return generateApplyEffectOnCharacterOutput(input.caster, input.receiver, input.effectOnCaster, input.effectOnReceiver, input.effect, input.seed);
        }
        for(var i = 0; i < input.effectOnReceiver.valid.length; i ++){
            if(input.effectOnReceiver.valid[i] && input.effectOnReceiver.effectMap[i].effectNameId == input.effect.effectNameId){
                input.effectOnReceiver.durationType[i] = input.effect.durationType;
                if(input.effect.durationType == 0){
                    if(input.effect.duration * 10000000 - 1 > input.effectOnReceiver.duration[i]){
                        input.effectOnReceiver.duration[i] = input.effect.duration * 10000000 + input.effectOnReceiver.duration[i] % 10000000;
                    }
                }else{
                    input.effectOnReceiver.duration[i] = input.effect.duration;
                }
                input.effectOnReceiver.extraStack[i] += ((input.effect.initialExtraStack + 1) * input.executionTime);
                if(input.effectOnReceiver.extraStack[i] >= input.effect.extraData){
                    //settle special effect
                    var specialType = getExtraKeyForModifierEffect(input.effect, 10);
                    if(specialType != -1){
                        //stun and remove all stack
                        input.effectOnReceiver.valid[i] = false;
                        var newInput = generateApplyEffectOnCharacterInput(input.caster, input.receiver, input.effectOnCaster, input.effectOnReceiver, input.derivedEffects[specialType], input.derivedEffects, input.seed, 1);
                        overrideApplyEffect(newInput, applyEffectOnCharacter(undefined, newInput, textInstanceGroup));
                    }else{
                        input.effectOnReceiver.extraStack[i] = input.effect.extraData;
                    }
                }
                return generateApplyEffectOnCharacterOutput(input.caster, input.receiver, input.effectOnCaster, input.effectOnReceiver, input.effect, input.seed);
            }
        }
        for(var i = 0; i < input.effectOnReceiver.valid.length; i ++){
            if(!input.effectOnReceiver.valid[i]){
                input.effectOnReceiver.valid[i] = true;
                input.effectOnReceiver.effectMap[i] = input.effect;
                input.effectOnReceiver.durationType[i] = input.effect.durationType;
                if(input.effect.durationType == 0){
                    //-500 is just to make sure that it is a open interval
                    input.effectOnReceiver.duration[i] = input.effect.duration * 10000000 - 30;
                }else{
                    input.effectOnReceiver.duration[i] = input.effect.duration;
                }
                input.effectOnReceiver.ownerId[i] = input.caster.isActive ? 0 : 1;
                input.effectOnReceiver.extraStack[i] = ((input.effect.initialExtraStack + 1) * input.executionTime) - 1;
                if(input.effectOnReceiver.extraStack[i] > input.effect.extraData){
                    input.effectOnReceiver.extraStack[i] = input.effect.extraData;
                }
                return generateApplyEffectOnCharacterOutput(input.caster, input.receiver, input.effectOnCaster, input.effectOnReceiver, input.effect, input.seed);
            }
        }
    }
    return generateApplyEffectOnCharacterOutput(input.caster, input.receiver, input.effectOnCaster, input.effectOnReceiver, input.effect, input.seed);
}

function applyDamage(realDamage, caster, receiver, effectOnCaster, effectOnReceiver, damageType, subGroup){
    var damageAfterShield = realDamage;
    if(receiver.shield >= realDamage){
        receiver.shield -= realDamage;
        damageAfterShield = 0;
        subGroup.push(generateTextInstance(damageType, 0, realDamage, receiver.isActive));
    }else{
        damageAfterShield -= receiver.shield;
        receiver.shield = 0;
        subGroup.push(generateTextInstance(damageType, -damageAfterShield, -receiver.shield, receiver.isActive));
    }
    if(damageAfterShield > 0){
        resolveReflection(caster, receiver, effectOnReceiver, subGroup);
    }
    receiver.hp -= damageAfterShield;
    if(damageAfterShield > 0){
        updateSoulVal(damageAfterShield, caster, effectOnCaster);
        resolveLifesteal(damageAfterShield, caster, effectOnCaster, subGroup);
    }
    if(receiver.hp < 0){
        receiver.hp = 0;
    }
    settleEffectInstanceDuration(effectOnReceiver, 2);
    settleEffectInstanceDuration(effectOnCaster, 1);
    removeEffectStackBasedOnType(effectOnReceiver, 2);
    removeEffectStackBasedOnType(effectOnCaster, 1);
}

function settleEffectInstanceDuration(effects, durationType){
    if(durationType == 0){
        return;
    }
    for(var i = 0; i < effects.valid.length; i ++){
        if(effects.valid[i] && effects.durationType[i] == durationType){
            if(effects.duration[i] >= 1){
                effects.duration[i] --;
            }
            if(effects.duration[i] == 0){
                effects.valid[i] = false;
            }
        }
    }
}

function removeEffectStackBasedOnType(effects, removalType) {
    for(var i = 0; i < effects.valid.length; i ++){
        if(effects.valid[i] && effects.effectMap[i].stackReductionType == removalType){
            if(effects.extraStack[i] == 0){
                effects.valid[i] = false;
            }else{
                effects.extraStack[i] --;
            }
        }
    }
}

function updateSoulVal(damage, caster, effectOnCaster) {
    effectOnCaster.specialCounter[5] += damage;
    if(effectOnCaster.specialCounter[5] >= caster.action.maxSouls){
        effectOnCaster.specialCounter[5] = caster.action.maxSouls;
    }
}

function resolveLifesteal(damage, caster, effectOnCaster, textInstanceSubGroup){
    for(var i = 0; i < effectOnCaster.valid.length; i ++){
        if(effectOnCaster.valid[i] && effectOnCaster.effectMap[i].specialEffect.valid){
            var lifestealAmount = damage * effectOnCaster.effectMap[i].specialEffect.lifesteal * (effectOnCaster.extraStack[i] + 1) / 10000;
            if(damage > 0 && lifestealAmount == 0){
                lifestealAmount = 1;
            }
            var preHP = caster.hp;
            caster.hp += lifestealAmount;
            if(caster.hp > caster.maxHP){
                caster.hp = caster.maxHP;
            }
            if(caster.hp > preHP){
                textInstanceSubGroup.push(generateTextInstance(-1, caster.hp - preHP, 0, caster.isActive));
            }
        }
    }
}

function resolveReflection(caster, receiver, effectOnReceiver, textInstanceSubGroup){
    for(var i = 0; i < effectOnReceiver.valid.length; i ++){
        if(effectOnReceiver.valid[i] && effectOnReceiver.effectMap[i].specialEffect.valid){
            var reflectionDamage = effectOnReceiver.effectMap[i].specialEffect.reflection * (effectOnReceiver.extraStack[i] + 1);
            if(reflectionDamage > 0){
                textInstanceSubGroup.push(generateTextInstance(effectOnReceiver.effectMap[i].specialEffect.rType, -reflectionDamage, 0, caster.isActive));
            }
            if(caster.hp > reflectionDamage){
                caster.hp -= reflectionDamage;
            }else{
                caster.hp = 0;
            }
        }
    }
}

function applyInstantEffectOnCharacter(mutableEffect, arg1, arg2, arg3, textInstanceGroup){
    var caster = JSON.parse(JSON.stringify(arg1));
    var receiver = JSON.parse(JSON.stringify(arg2));
    var input = JSON.parse(JSON.stringify(arg3));
    var ti = 0;
    if(shouldBeExcuted(caster, receiver, input.effect.instantEffect)){
        var totalExecutionTime = input.executionTime * input.effect.instantEffect.instances;
        var subGroup = [];
        for(var i = 0; i < totalExecutionTime; i ++){
            if(input.effect.instantEffect.shieldDelta != 0 || input.effect.instantEffect.damage != 0 || input.effect.instantEffect.hpRatioDelta!= 0 || input.effect.instantEffect.hpDelta!= 0 || input.effect.instantEffect.baseDamageRatio != 0 || input.effect.instantEffect.actionDelta != 0 || input.effect.instantEffect.progressDelta != 0){
                if(!input.effectOnReceiver.effectCatalogs.damageImmume && (input.effect.instantEffect.damage != 0 || input.effect.instantEffect.baseDamageRatio != 0)){
                    //apply damage
                    var realDamage = calculateEffectDamage(caster, receiver, input.effectOnReceiver, input.effect, input.ignoreCasterAttributes) * input.stack;
                    applyDamage(realDamage, caster, receiver, input.effectOnCaster, input.effectOnReceiver, input.effect.instantEffect.damageType, subGroup);
                }
                if(input.effect.instantEffect.progressDelta * input.stack != 0){
                    receiver.action.gaugeVal -= (input.effect.instantEffect.progressDelta * input.stack);
                    if(receiver.action.gaugeVal > 9999999){
                        receiver.action.gaugeVal = 9999999;
                    }else if(receiver.action.gaugeVal < 0){
                        receiver.action.gaugeVal = 0;
                    }
                }
                if(input.effect.instantEffect.actionDelta != 0){
                    receiver.action.actionPoint += (input.effect.instantEffect.actionDelta * input.stack);
                    if(receiver.action.actionPoint < 0){
                        receiver.action.actionPoint = 0;
                    }
                }
                //apply shield
                if(input.effect.instantEffect.shieldDelta != 0){
                    var originalShield = receiver.shield;
                    receiver.shield += (input.effect.instantEffect.shieldDelta * input.stack);
                    if(receiver.shield < 0){
                        receiver.shield = 0;
                    }
                    if(receiver.shield != originalShield){
                        subGroup.push(generateTextInstance(0, 0, receiver.shield - originalShield, receiver.isActive));
                    }
                }
                //apply hp change
                var originalHP = receiver.hp;
                if(input.effect.instantEffect.hpDelta != 0){
                    receiver.hp += (input.effect.instantEffect.hpDelta * input.stack);
                }
                if(receiver.hp < 0){
                    receiver.hp = 0;
                }else if(receiver.hp > receiver.maxHP){
                    receiver.hp = receiver.maxHP;
                }
                if(input.effect.instantEffect.hpRatioDelta != 0){
                    receiver.hp += (input.effect.instantEffect.hpRatioDelta * (receiver.maxHP - receiver.hp) / 10000);
                }
                if(receiver.hp < 0){
                    receiver.hp = 0;
                }else if(receiver.hp > receiver.maxHP){
                    receiver.hp = receiver.maxHP;
                }
                if(receiver.hp != originalHP){
                    subGroup.push(generateTextInstance(-1, receiver.hp - originalHP, 0, receiver.isActive));
                }
            }
            if(input.effect.instantEffect.special){
                input.effectOnReceiver.specialCounter[input.effect.instantEffect.specialIndex] += (input.effect.instantEffect.specialDelta * input.stack);
                if(input.effectOnReceiver.specialCounter[input.effect.instantEffect.specialIndex] < 0){
                    input.effectOnReceiver.specialCounter[input.effect.instantEffect.specialIndex] = 0;
                }
            }
            if(input.effect.instantEffect.dispellCount != 0){
                for(var j = 0; j < input.effect.instantEffect.dispellCount * input.stack; j ++){
                    dispellOne(caster, receiver, input.effectOnReceiver);
                }
            }
            ti = checkExtraKey(input.effect, 1);
            if(ti != -1){
                receiver.action.actionPoint += (input.effect.instantEffect.extraVals[ti]);
                if(receiver.action.actionPoint < 0){
                    receiver.action.actionPoint = 0;
                }
            }
            ti = checkExtraKey(input.effect, 2);
            if(ti != -1){
                input.effectOnReceiver.specialCounter[3] = getRandomSeededMinMax(1, 6, input.seed + 1521);
            }
        }
        if(input.effect.effectCatalogId == 8){
            ti = (input.effectOnCaster.specialCounter[3] - 4);
            if(ti < 0){
                ti = -ti;
            }
            ti += 1;
            for(var i = 0; i <  ti; i ++){
                applyDamage(calculatePhysicalDamage(2, 0, caster, receiver, input.ignoreCasterAttributes) * input.stack, caster, receiver, input.effectOnCaster, input.effectOnReceiver, 0, textInstanceGroup);
            }
            input.effectOnCaster.specialCounter[3] = 100;
        }
        if(mutableEffect != undefined){
            var damageDelta = getExtraVal(mutableEffect, 2000 + 0);
            if(damageDelta != -1){
                mutableEffect.instantEffect.damage += damageDelta;
            }
        }
        if(subGroup.length > 0){
            textInstanceGroup.push(subGroup);
        }
    }
    return generateApplyInstantEffectOutput(caster, receiver, input.effectOnCaster, input.effectOnReceiver);
}

function calculatePhysicalDamage(damage, damageRatio, caster, receiver, ignoreCasterAttributes){
    if(ignoreCasterAttributes){
        return damage * receiver.physicalDamageResistanceFactor / 10000;
    }else{
        return ((damage + caster.baseAttack) * caster.physicalDamageMultiplierFactor / 10000) * receiver.physicalDamageResistanceFactor / 10000;
    }
}

function isOfSameReferenceWithCaster(caster, receiver){
    return caster.isActive == receiver.isActive;
}

function isOfSameReference(ownerId, other){
    return ownerId == 0 && other.isActive || ownerId == 1 && !other.isActive;
}

function dispellOne(caster, receiver, effectOnReceiver){
    var dispellDebuff = isOfSameReferenceWithCaster(caster, receiver);
    for(var i = 0; i < effectOnReceiver.valid.length; i ++){
        if(!effectOnReceiver.valid[i] || !effectOnReceiver.effectMap[i].dispellable){
            continue;
        }
        if(dispellDebuff && !isOfSameReference(effectOnReceiver.ownerId[i], receiver) || !dispellDebuff && isOfSameReference(effectOnReceiver.ownerId[i], receiver)){
            effectOnReceiver.valid[i] = false;
            break;
        }
    }
}

function getExtraVal(effect, key){
    var index = checkExtraKey(effect, key);
    if(index == -1){
        return 0;
    }else{
        return effect.instantEffect.extraVals[index];
    }
}

function checkExtraKey(effect, key){
    for(var i = 0; i < effect.instantEffect.extraKeys.length; i ++){
        if(effect.instantEffect.extraKeys[i] == key){
            return i;
        }
    }
    return -1;
}

function findBleedingStack(effects){
    return findStackNumber(effects, 15);
}

function findStackNumber(effects, effectNameId){
    var index = findTargetEffectWithNameId(effects, effectNameId);
    if(index == -1){
        return 0;
    }else{
        return effects.extraStack[index] + 1;
    }
}

function findTargetEffectWithNameId(effects, targetNameId){
    for(var i = 0; i < effects.valid.length; i ++){
        if(effects.valid[i] && effects.effectMap[i].effectNameId == targetNameId){
            return i;
        }
    }
    return -1;
}

function getExtraOperator(effect, key) {
    var index = checkExtraKey(effect, key);
    if(index == -1){
        return 0;
    }else{
        return effect.instantEffect.extraOperators[index];
    }
}

function calculateEffectDamage(caster, receiver, effectsOnReceiver, effect, ignoreCasterAttributes){
    var preTaxDamage = 0;
    var resist = receiver.physicalDamageResistanceFactor;
    var bleedingMultiplier = getExtraVal(effect, 3);
    if(bleedingMultiplier != 0){
        bleedingMultiplier *= findBleedingStack(effectsOnReceiver);
    }
    var extraMultiplier = 0;
    for(var i = 0; i < effectsOnReceiver.valid.length; i ++){
        if(!effectsOnReceiver.valid[i]){
            continue;
        }
        var sNumber = getExtraOperator(effect, effectsOnReceiver.effectMap[i].effectNameId + 1000) == 0 ? effectsOnReceiver.extraStack[i] + 1 : 1;
        extraMultiplier += (getExtraVal(effect, effectsOnReceiver.effectMap[i].effectNameId + 1000) * sNumber);
    }

    if(effect.instantEffect.damageType == 0){
        preTaxDamage = ignoreCasterAttributes ? effect.instantEffect.damage : (effect.instantEffect.damage + caster.baseAttack) * caster.physicalDamageMultiplierFactor / 10000;
    }else{
        preTaxDamage = ignoreCasterAttributes ? effect.instantEffect.damage : (effect.instantEffect.damage + caster.baseAttack) * caster.magicDamageMultiplierFactor / 10000;
    }
    preTaxDamage = preTaxDamage * (10000 + bleedingMultiplier + extraMultiplier) / 10000;
    preTaxDamage -= receiver.evasionFactor;
    if(preTaxDamage < 0){
        preTaxDamage = 0;
    }
    if(effect.instantEffect.damageType == 1){
        //fire
        if(effectsOnReceiver.effectCatalogs.ignited){
            preTaxDamage = preTaxDamage * 15000 / 10000;
        }
        resist = receiver.fireDamageResistanceFactor;
    }else if(effect.instantEffect.damageType == 2){
        //ice
        resist = receiver.iceDamageResistanceFactor;
    }else if(effect.instantEffect.damageType == 3){
        //lightenning
        resist = receiver.ligtenningDamageResistanceFactor;
    }else if(effect.instantEffect.damageType == 4){
        resist = 10000;
    }
    return (preTaxDamage * resist / 10000);
}

function shouldBeExcuted(caster, receiver, ie){
    for(var i = 0; i < ie.extraKeys.length; i ++){
        if(ie.extraKeys[i] == 100 && !resolve(ie.extraOperators[i], caster.hp * 10000 / caster.maxHP, ie.extraVals[i])){
            return false;
        }else if(ie.extraKeys[i] == 101 && !resolve(ie.extraOperators[i], receiver.hp * 10000 / receiver.maxHP, ie.extraVals[i])){
            return false;
        }
    }
    return true;
}

function getCharacterSpecialAbilityById(arg1, arg2){
    var abilityEntries = JSON.parse(JSON.stringify(arg1));
    var specialId = JSON.parse(JSON.stringify(arg2));
    for(var i = 0; i < abilityEntries.length; i ++){
        if(abilityEntries[i].id == specialId){
            return abilityEntries[i];
        }
    }
    return generateSpecialAbilityEntry(0, [], getEmptyEffect(), false, 0, 0, 0, [], [], []);
}

function getEmptyEffect(){
    return generateEffect(0, 0, generateModiferEffect(0,0,0,0,0,0,0,0,0,0,0, [], []), generateInstantEffect(0,0,0,0,0,0,0,0,0, false, 0, 0, 0, [], [], []), generateEnchancedEffect(0,0,0), generateGainCardEffect(false, 0, 0, 0, 0), generateSpecialEffect(false, 0, 0, 0), 0, 0, true, 0, 0, 0, true);
}

function executeInstantEffect(input, textInstanceGroup) {
    var effect = input.ownerEffect.effectMap[input.index];
    var target = effect.targetSelf ? input.ownerAttributes : input.otherSideAttribute;
    var effectArray = Array(2);
    effectArray[0] = effect.targetSelf ? input.ownerEffect : input.otherEffects;
    effectArray[1] = isOfSameReference(input.ownerEffect.ownerId[input.index], input.ownerAttributes) ? input.ownerEffect : input.otherEffects;
    var output = applyInstantEffectOnCharacter(undefined, input.ownerEffect.characterAttributes[input.ownerEffect.ownerId[input.index]], target, generateInstantEffectInput(effectArray[1], effectArray[0], effect, input.ownerEffect.extraStack[input.index] + 1, input.seed, input.ignoreCaster, 1), textInstanceGroup);
    overrideAttribute(input.ownerEffect.characterAttributes[input.ownerEffect.ownerId[input.index]], output.caster);
    overrideAttribute(target, output.receiver);
    overrideEffectsOnCharacter(effectArray[1], output.effectOnCaster);
    overrideEffectsOnCharacter(effectArray[0], output.effectOnReceiver);
}

function findNextActionPointAndRemoveExpiredEffectInternal(input, intervalIds, textInstanceGroup){
    resolveSpecialAbility3(input.characterInfo, input.derivedEffects, input.seed, textInstanceGroup);
    //FightLogicBasic.resolveSpecialEffectsForHPBased(input.characterInfo.casterSpecial, input.characterInfo, false, input.derivedEffects);
    //FightLogicBasic.resolveSpecialEffectsForHPBased(input.characterInfo.receiverSpecial, input.characterInfo, true, input.derivedEffects);
    var mainSpeed = input.characterInfo.casterAttributes.speed;
    var enemySpeed = input.characterInfo.receiverAttributes.speed;
    var actionTarget = generateActionTarget(true, -1);
    var minActionTimeLeft = (input.gauge.mainCharacterGauge + 1) / mainSpeed;
    for(var i = 0; i < input.characterInfo.casterEffects.valid.length; i ++){
        if(input.characterInfo.casterEffects.valid[i] && input.characterInfo.casterEffects.durationType[i] == 0 && input.characterInfo.casterEffects.duration[i] != -10000000){
            if((input.characterInfo.casterEffects.duration[i] % 10000000 + 1) / mainSpeed < minActionTimeLeft){
                actionTarget.player = true;
                actionTarget.index = i;
                minActionTimeLeft = (input.characterInfo.casterEffects.duration[i] % 10000000 + 1) / mainSpeed;
            }
        }
    }
    for(var i = 0; i < input.characterInfo.receiverEffects.valid.length; i ++){
        if(input.characterInfo.receiverEffects.valid[i] && input.characterInfo.receiverEffects.durationType[i] == 0 && input.characterInfo.receiverEffects.duration[i] != -10000000){
            if((input.characterInfo.receiverEffects.duration[i] % 10000000 + 1) / enemySpeed < minActionTimeLeft){
                actionTarget.player = false;
                actionTarget.index = i;
                minActionTimeLeft = (input.characterInfo.receiverEffects.duration[i] % 10000000 + 1) / enemySpeed;
            }
        }
    }
    if((input.gauge.enemyGauge + 1) / enemySpeed < minActionTimeLeft){
        actionTarget.player = false;
        actionTarget.index = -1;
        minActionTimeLeft = (input.gauge.enemyGauge + 1) / enemySpeed;
    }
    if(actionTarget.index != -1){
        //excuteEffect;
        syncGaugeWithGauge(input.characterInfo, false, input.gauge);
        if(actionTarget.player){
            executeInstantEffect(generateExecuteInstantEffectInput(input.characterInfo.casterEffects, input.characterInfo.receiverEffects, input.characterInfo.casterAttributes, input.characterInfo.receiverAttributes, actionTarget.index, input.seed, true), textInstanceGroup);
        }else{
            executeInstantEffect(generateExecuteInstantEffectInput(input.characterInfo.receiverEffects, input.characterInfo.casterEffects, input.characterInfo.receiverAttributes, input.characterInfo.casterAttributes, actionTarget.index, input.seed, true), textInstanceGroup);
        }
        syncGaugeWithCharacterInfo(input.characterInfo, false, input.gauge);
    }
    //ensure minActionRequired is ceiling value;
    minActionTimeLeft += 1;
    //remove effects when expired.
    for(var i = 0; i < input.characterInfo.casterEffects.valid.length; i ++){
        if(input.characterInfo.casterEffects.valid[i] && input.characterInfo.casterEffects.durationType[i] == 0 && input.characterInfo.casterEffects.duration[i] != -10000000){
            if((actionTarget.index != i || !actionTarget.player) && parseInt(input.characterInfo.casterEffects.duration[i] / 10000000) != parseInt((input.characterInfo.casterEffects.duration[i] - (minActionTimeLeft * mainSpeed)) / 10000000)){
                input.characterInfo.casterEffects.duration[i] = parseInt((input.characterInfo.casterEffects.duration[i] / 10000000) * 10000000);
            }else{
                input.characterInfo.casterEffects.duration[i] -= (minActionTimeLeft * mainSpeed);
            }
            if(input.characterInfo.casterEffects.duration[i] < 0){
                input.characterInfo.casterEffects.valid[i] = false;
            }
        }
    }

    for(var i = 0; i < input.characterInfo.receiverEffects.valid.length; i ++){
        if(input.characterInfo.receiverEffects.valid[i] && input.characterInfo.receiverEffects.durationType[i] == 0 && input.characterInfo.receiverEffects.duration[i] != -10000000){
            if((actionTarget.index != i || actionTarget.player) && parseInt(input.characterInfo.receiverEffects.duration[i] / 10000000) != parseInt((input.characterInfo.receiverEffects.duration[i] - (minActionTimeLeft * enemySpeed)) / 10000000)){
                input.characterInfo.receiverEffects.duration[i] = parseInt((input.characterInfo.receiverEffects.duration[i] / 10000000) * 10000000);
            }else{
                input.characterInfo.receiverEffects.duration[i] -= (minActionTimeLeft * enemySpeed);
            }
            if(input.characterInfo.receiverEffects.duration[i] < 0){
                input.characterInfo.receiverEffects.valid[i] = false;
            }
        }
    }

    if((actionTarget.index != - 1 || !actionTarget.player) && input.gauge.mainCharacterGauge - (minActionTimeLeft * mainSpeed) < 0){
        input.gauge.mainCharacterGauge = 0;
    }else{
        input.gauge.mainCharacterGauge -= (minActionTimeLeft * mainSpeed);
    }
    if((actionTarget.index != - 1 || actionTarget.player) && input.gauge.enemyGauge - (minActionTimeLeft * enemySpeed) < 0){
        input.gauge.enemyGauge = 0;
    }else{
        input.gauge.enemyGauge -= (minActionTimeLeft * enemySpeed);
    }
    if(input.gauge.mainCharacterGauge < 0){
        input.gauge.mainCharacterGauge += 10000000;
    }
    if(input.gauge.enemyGauge < 0){
        input.gauge.enemyGauge += 10000000;
    }
    //you cant make any attribute change in this method!
    currOut = updateEffectsAtStartOfTurn(actionTarget.index, actionTarget.player, input.characterInfo, intervalIds, input.deckInfo, input.derivedEffects, input.seed, textInstanceGroup);
    overrideEffectsOnCharacter(input.characterInfo.casterEffects, currOut.characterInfo.casterEffects);
    overrideEffectsOnCharacter(input.characterInfo.receiverEffects, currOut.characterInfo.receiverEffects);
    overrideAttribute(input.characterInfo.casterAttributes, currOut.characterInfo.casterAttributes);
    overrideAttribute(input.characterInfo.receiverAttributes, currOut.characterInfo.receiverAttributes);
    overrideDeckInfo(input.deckInfo, currOut.deckInfo);
    input.nextAvailables = currOut.nextAvailables;
    
    return actionTarget;
}

function overrideDeckInfo( deckInfo, toOverride) {
    deckInfo.playerCards = toOverride.playerCards;
    deckInfo.enemyCards = toOverride.enemyCards;
}

function discardEmpherialCards(onPlayer, onDiscarded, deckInfo, characterInfo, startingIndex){
    var abilityStatus = onPlayer ? characterInfo.casterAbilityStatus : characterInfo.receiverAbilityStatus;
    var cards = onPlayer ? deckInfo.playerCards : deckInfo.enemyCards;
    var targets = onDiscarded ? cards.discarded : cards.hand;
    var size = onDiscarded ? cards.discardedSize : cards.handSize;
    for(var i = startingIndex; i < size; i ++){
        var ability = abilityStatus.abilities[targets[i]];
        //ability class 1 is empherial
        if(AbilityOfClass(ability, 1)){
            var old = abilityStatus.abilities;
            abilityStatus.abilities = Array(old.length - 1);
            for(var j = 0; j < targets[i]; j ++){
                abilityStatus.abilities[j] = old[j];
            }
            for(var j = targets[i]; j < abilityStatus.abilities.length; j ++){
                abilityStatus.abilities[j] = old[j + 1];
            }
            var CardsAfterRemoval;
            if(onDiscarded){
                CardsAfterRemoval = removeCardInDiscarded(cards, targets[i]);
            }else{
                CardsAfterRemoval = removeCardInHand(cards, targets[i]);
            }
            if(onPlayer){
                deckInfo.playerCards = CardsAfterRemoval;
            }else{
                deckInfo.enemyCards = CardsAfterRemoval;
            }
            return [i, false];
        }
    }
    return [0, true];
}

function removeCardInHand(arg1, arg2){
    var card = JSON.parse(JSON.stringify(arg1));
    var targetCardIndex = JSON.parse(JSON.stringify(arg2));

    var startIndex = 0;
    while(card.hand[startIndex] != targetCardIndex && startIndex < card.handSize){
        if(card.hand[startIndex] > targetCardIndex){
            card.hand[startIndex] --;
        }
        startIndex ++;
    }
    for(var i = startIndex; i < card.handSize -1; i ++){
        card.hand[i] = card.hand[i + 1];
        if(card.hand[i] > targetCardIndex){
            card.hand[i] --;
        }
    }
    for(var i = 0; i < card.deckSize; i ++){
        if(card.deck[i] > targetCardIndex){
            card.deck[i] --;
        }
    }
    for(var i = 0; i < card.discardedSize; i ++){
        if(card.discarded[i] > targetCardIndex){
            card.discarded[i] --;
        }
    }
    card.handSize -= 1;
    return card;
}

function removeCardInDiscarded(arg1, arg2) {
    var card = JSON.parse(JSON.stringify(arg1));
    var targetCardIndex = JSON.parse(JSON.stringify(arg2));
    var startIndex = 0;
    while(card.discarded[startIndex] != targetCardIndex && startIndex < card.discardedSize){
        if(card.discarded[startIndex] > targetCardIndex){
            card.discarded[startIndex] --;
        }
        startIndex ++;
    }
    for(var i = startIndex; i < card.discardedSize -1; i ++){
        card.discarded[i] = card.discarded[i + 1];
        if(card.discarded[i] > targetCardIndex){
            card.discarded[i] --;
        }
    }
    for(var i = 0; i < card.deckSize; i ++){
        if(card.deck[i] > targetCardIndex){
            card.deck[i] --;
        }
    }
    for(var i = 0; i < card.handSize; i ++){
        if(card.hand[i] > targetCardIndex){
            card.hand[i] --;
        }
    }
    card.discardedSize -= 1;
    return card;
}

function AbilityOfClass(ability, targetClass){
    for(var index = 0; index < ability.abilityClass.length; index ++){
        if(ability.abilityClass[index] == targetClass){
            return true;
        }
    }
    return false;
}

function discardAllEphemeralCards(onCharacter, deckInfo, characterInfo){
    var startingIndex = 0;
    var finished = false;
    while(!finished){
        var r = discardEmpherialCards(onCharacter, false, deckInfo, characterInfo, startingIndex);
        startingIndex = r[0];
        finished = r[1];
    }
    startingIndex = 0;
    finished = false;
    while(!finished){
        var r = discardEmpherialCards(onCharacter, true, deckInfo, characterInfo, startingIndex);
        startingIndex = r[0];
        finished = r[1];
    }
}

function discardAllEphemeralCardsExternal(arg1, arg2, arg3) {
    var onCharacter = JSON.parse(JSON.stringify(arg1));
    var deckInfo = JSON.parse(JSON.stringify(arg2));
    var characterInfo = JSON.parse(JSON.stringify(arg3));
    discardAllEphemeralCards(onCharacter, deckInfo, characterInfo);
    return deckInfo;
}

function findCardsInHandNotToDiscard(hands, handSize, abilities){
    res = Array(handSize);
    for(var i = 0; i < res.length; i ++){
        res[i] = -1;
    }
    var count = 0;
    for(var i = 0; i < handSize; i ++){
        var ab = abilities[hands[i]];
        if(AbilityOfClass(ab, 5)){
            res[count] = hands[i];
            count ++;
        }
    }
    return res;
}

function drawCardsToLimit(arg1, seed){
    var card = JSON.parse(JSON.stringify(arg1));
    if(card.handLimit <= card.handSize){
        return card;
    }
    return drawCards(card.handLimit - card.handSize, card, seed);
}

function updateHand(card, index, val) {
    if(index >= card.hand.length){
        extendHandSize(card, index - card.hand.length + 1);
    }
    card.hand[index] = val;
}

function extendHandSize(card, delta) {
    var temp = card.hand;
    card.hand = Array(temp.length + delta).fill(0);
    for(var i = 0; i < temp.length; i ++){
        card.hand[i] = temp[i];
    }
}

function drawCards(numberToDraw, arg2, seed){
    var card = JSON.parse(JSON.stringify(arg2));
    if(numberToDraw <= card.deckSize){
        for(var i = card.handSize; i < card.handSize + numberToDraw; i ++){
            updateHand(card, i, card.deck[card.deckSize + card.handSize - 1 - i]);
        }
        card.handSize += numberToDraw;
        card.deckSize -= numberToDraw;
    }else{
        var additionNumbersToDraw = numberToDraw - card.deckSize;
        card = drawCards(card.deckSize, card, seed);
        if(card.discardedSize == 0){
            return card;
        }else{
            shuffleDiscard(card, seed);
            putDiscardToDeck(card);
            var amountToDraw = additionNumbersToDraw > card.deckSize ? card.deckSize : additionNumbersToDraw;
            card = drawCards(amountToDraw, card, seed);
        }
    }
    return card;
}

function shuffle(vals, seed){
    for(var index = vals.length - 1; index > 0; index --){
        seed = getRandomIntFromNumber(seed);
        var target = getRandomSeededMinMax(0, index, seed);
        var temp = vals[index];
        vals[index] = vals[target];
        vals[target] = temp;
    }
    return vals;
}

function shuffleDiscard(card, seed){
    shuffle(card.discarded, seed, card.discardedSize);
}

function extendDeckSize(card, delta) {
    var temp = card.deck;
    card.deck = Array(temp.length + delta).fill(0);
    for(var i = 0; i < temp.length; i ++){
        card.deck[i] = temp[i];
    }
}

function putDiscardToDeck(card){
    for(var i = 0; i < card.discardedSize; i ++){
        var index = i + card.deckSize;
        if(index >= card.deck.length){
            extendDeckSize(card, 1);
        }
        updateDeck(card, i + card.deckSize, card.discarded[i]);
    }
    card.deckSize += card.discardedSize;
    card.discardedSize = 0;
}

function updateDeck(card, index, val) {
    if(index >= card.deck.length){
        extendDeckSize(card, index - card.deck.length + 1);
    }
    card.deck[index] = val;
}

function updateEffectsAtStartOfTurn(arg1, arg2, arg3, arg4, arg5, arg6, seed, textInstanceGroup){
    var targetIndex = JSON.parse(JSON.stringify(arg1));
    var player = JSON.parse(JSON.stringify(arg2));
    var characterInfo = JSON.parse(JSON.stringify(arg3));
    var intervalId = JSON.parse(JSON.stringify(arg4));
    var deckInfo = JSON.parse(JSON.stringify(arg5));
    var derivedEffects = JSON.parse(JSON.stringify(arg6));
    innerState = generateUpdateEffectInnerState([], false, false);
    if(targetIndex == - 1 && player){
        innerState.executeUpdate = true;
    }else if(targetIndex == - 1 && !player){
        innerState.executeUpdate = true;
        innerState.reversed = true;
    }
    if(innerState.executeUpdate){
        var o = resolveStartTurnEffects(characterInfo, derivedEffects, intervalId, seed, innerState.reversed, textInstanceGroup);
        characterInfo.casterAttributes = o.casterAttributes;
        characterInfo.receiverAttributes = o.receiverAttributes;
        characterInfo.casterEffects = o.casterEffects;
        characterInfo.receiverEffects = o.receiverEffects;
        overrideDeckInfo(deckInfo, discardAllEphemeralCardsExternal(!innerState.reversed, deckInfo, characterInfo));
        var cardToUse =  !innerState.reversed ? deckInfo.playerCards : deckInfo.enemyCards;
        var targetAS = !innerState.reversed ? characterInfo.casterAbilityStatus : characterInfo.receiverAbilityStatus;
        cardToUse = discardHandsExceptFor(cardToUse, findCardsInHandNotToDiscard(cardToUse.hand, cardToUse.handSize, targetAS.abilities));
        cardToUse = drawCardsToLimit(cardToUse, seed);
        if(!innerState.reversed){
            var special4 = getCharacterSpecialAbilityById(characterInfo.casterSpecial, 4);
            if(isFirstTurn(cardToUse) && special4.id != 0){
                cardToUse = drawCards(special4.attributes[1], cardToUse, seed);
            }
            innerState.nextAvailables = getAvailableAbilities(cardToUse, characterInfo);
            deckInfo.playerCards = cardToUse;
        }else{
            var special4 = getCharacterSpecialAbilityById(characterInfo.receiverSpecial, 4);
            if(isFirstTurn(cardToUse) && special4.id != 0){
                cardToUse = drawCards(special4.attributes[1], cardToUse, seed);
            }
            deckInfo.enemyCards = cardToUse;
        }
    }
    return generateUpdateEffectsAtStartOfTurnOutput(characterInfo, deckInfo, innerState.nextAvailables);
}

function getAvailableAbilities(arg1, arg2){
    var cards = JSON.parse(JSON.stringify(arg1));
    var characterInfo = JSON.parse(JSON.stringify(arg2));
    if(characterInfo.casterEffects.effectCatalogs.stuned){
        return Array(0);
    }
    var count = 0;
    for(var index = 0; index < cards.handSize; index ++){
        var currAbility = characterInfo.casterAbilityStatus.abilities[cards.hand[index]];
        if(characterInfo.casterAbilityStatus.abilities[cards.hand[index]].actionPoint <= characterInfo.casterAttributes.action.actionPoint && 
            abilityRequirementSatisfiedTriggerAsInput(characterInfo, generateTriggerCondition(currAbility.triggerType, currAbility.triggerAttr, currAbility.triggerOperator, currAbility.triggerVal))){
            count ++;
        }
    }
    for(var index = 0; index < characterInfo.casterSpecial.length; index ++){
        if(characterInfo.casterSpecial[index].commandId != 0 && characterInfo.casterSpecial[index].cost <= characterInfo.casterAttributes.action.actionPoint &&
            abilityRequirementSatisfiedTriggerAsInput(characterInfo, generateTriggerCondition(characterInfo.casterSpecial[index].triggerType, characterInfo.casterSpecial[index].triggerAttr, characterInfo.casterSpecial[index].triggerOperator, characterInfo.casterSpecial[index].triggerVal))
        ){
            count ++;
        }
    }
    result = Array(count).fill(0);
    var i = 0;
    for(var index = 0; index < cards.handSize; index ++){
        var currAbility = characterInfo.casterAbilityStatus.abilities[cards.hand[index]];
        if(characterInfo.casterAbilityStatus.abilities[cards.hand[index]].actionPoint <= characterInfo.casterAttributes.action.actionPoint && 
            abilityRequirementSatisfiedTriggerAsInput(characterInfo, generateTriggerCondition(currAbility.triggerType, currAbility.triggerAttr, currAbility.triggerOperator, currAbility.triggerVal))){
            result[i++] = cards.hand[index];
        }
    }
    for(var index = 0; index < characterInfo.casterSpecial.length; index ++){
        if(characterInfo.casterSpecial[index].commandId != 0 && characterInfo.casterSpecial[index].cost <= characterInfo.casterAttributes.action.actionPoint &&
            abilityRequirementSatisfiedTriggerAsInput(characterInfo, generateTriggerCondition(characterInfo.casterSpecial[index].triggerType, characterInfo.casterSpecial[index].triggerAttr, characterInfo.casterSpecial[index].triggerOperator, characterInfo.casterSpecial[index].triggerVal))
        ){
            result[i++] = characterInfo.casterSpecial[index].commandId;
        }
    }
    return result;
}

function resolve(operator, left, right){
    if(operator == 0){
        return left == right;
    }else if(operator == 1){
        return left >= right;
    }else{
        return right >= left;
    }
}

function abilityRequirementSatisfied(characterInfo, ability){
    return abilityRequirementSatisfiedTriggerAsInput(characterInfo, generateTriggerCondition(ability.triggerType, ability.triggerAttr, ability.triggerOperator, ability.triggerVal));
}

function abilityRequirementSatisfiedTriggerAsInput(arg1, arg2){
    var characterInfo = JSON.parse(JSON.stringify(arg1));
    var triggerCondition = JSON.parse(JSON.stringify(arg2));
    var attribute = characterInfo.casterAttributes;
    if(triggerCondition.triggerType == 1){
        for(var i = 0; i < triggerCondition.triggerAttr.length; i ++){
            if(triggerCondition.triggerAttr[i] == 0 && !resolve(triggerCondition.triggerOperator[i], attribute.hp * 10000 / attribute.maxHP, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 1 && !resolve(triggerCondition.triggerOperator[i], attribute.hp, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 2 && !resolve(triggerCondition.triggerOperator[i], attribute.physicalDamageResistanceFactor, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 3 && !resolve(triggerCondition.triggerOperator[i], attribute.fireDamageResistanceFactor, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 4 && !resolve(triggerCondition.triggerOperator[i], attribute.iceDamageResistanceFactor, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 5 && !resolve(triggerCondition.triggerOperator[i], attribute.ligtenningDamageResistanceFactor, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 6 && !resolve(triggerCondition.triggerOperator[i], attribute.physicalDamageMultiplierFactor, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 7 && !resolve(triggerCondition.triggerOperator[i], attribute.magicDamageMultiplierFactor, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 8 && !resolve(triggerCondition.triggerOperator[i], attribute.baseAttack, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 9 && !resolve(triggerCondition.triggerOperator[i], attribute.evasionFactor, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 10 && !resolve(triggerCondition.triggerOperator[i], attribute.speed, triggerCondition.triggerVal[i])){
                return false;
            }else if(triggerCondition.triggerAttr[i] == 11 && !resolve(triggerCondition.triggerOperator[i], attribute.shield, triggerCondition.triggerVal[i])){
                return false;
            }
        }
    }else if(triggerCondition.triggerType == 2){
        for(var i = 0; i < triggerCondition.triggerAttr.length; i ++){
            var onSelf = triggerCondition.triggerAttr[i] == 0;
            if(!hasTargetEffect(characterInfo, onSelf, triggerCondition.triggerVal[i])){
                return false;
            }
        }
    }else if(triggerCondition.triggerType == 3){
        for(var i = 0; i < triggerCondition.triggerAttr.length; i ++){
            if(!resolve(triggerCondition.triggerOperator[i], characterInfo.casterEffects.specialCounter[uint16(triggerCondition.triggerAttr[i])], triggerCondition.triggerVal[i])){
                return false;
            }
        }
    }else if(triggerCondition.triggerType == 4){
        for(var i = 0; i < triggerCondition.triggerAttr.length; i ++){
            if(!resolveEffectCondition(characterInfo.casterEffects, triggerCondition.triggerAttr[i], triggerCondition.triggerVal[i], triggerCondition.triggerOperator[i])){
                return false;
            }
        }
    }
    return true;
}

function resolveEffectCondition(effects, effectNameId, requiredStack, operator) {
    for(var i = 0; i < effects.valid.length; i ++){
        if(effects.valid[i] && effects.effectMap[i].effectNameId == effectNameId){
            if(operator == 0 && effects.extraStack[i] + 1 == requiredStack){
                return true;
            }else if(operator == 1 && effects.extraStack[i] + 1 >= requiredStack){
                return true;
            }else if(effects.extraStack[i] + 1 <= requiredStack){
                return true;
            }
        }
    }
    return false;
}

function hasTargetEffect(characterInfo, onSelf, effectCatalogId){
    var effects = onSelf ? characterInfo.casterEffects : characterInfo.receiverEffects;
    for(var i = 0; i < effects.valid.length; i ++){
        if(effects.valid[i] == false){
            continue;
        }
        if(effects.effectMap[i].effectCatalogId == effectCatalogId){
            return true;
        }
    }
    return false;
}

function isFirstTurn(card) {
    return card.handSize == 0 && card.discardedSize == 0;
}

function toBeKept(abilityIndex, keepedAbilityIndex){
    for(var i = 0; i < keepedAbilityIndex.length; i ++){
        if(abilityIndex == keepedAbilityIndex[i]){
            return true;
        }
    }
    return false;
}

function updateDiscarded(card, index, val) {
    if(index >= card.discarded.length){
        extendDiscardSize(card, index - card.discarded.length + 1);
    }
    card.discarded[index] = val;
}

function extendDiscardSize(card, delta){
    var temp = card.discarded;
    card.discarded = Array(temp.length + delta).fill(0);
    for(var i = 0; i < temp.length; i ++){
        card.discarded[i] = temp[i];
    }
}

function discardHandsExceptFor(arg1, arg2){
    var card = JSON.parse(JSON.stringify(arg1));
    var keepedAbilityIndex = JSON.parse(JSON.stringify(arg2));
    var toDiscard = 0;
    for(var i = 0; i < card.handSize; i ++){
        if(!toBeKept(card.hand[i], keepedAbilityIndex)){
            updateDiscarded(card, i + card.discardedSize, card.hand[i]);
            toDiscard ++;
        }
    }
    var toKeepSize = card.handSize - toDiscard;
    for(var i = 0; i < toKeepSize; i ++){
        card.hand[i] = keepedAbilityIndex[i];
    }
    card.discardedSize += toDiscard;
    card.handSize = toKeepSize;
    return card;
}

function resolveStartTurnEffects(arg1, arg2, arg3, seed, reversed, textInstanceGroup){
    var characterInfo = JSON.parse(JSON.stringify(arg1));
    var derivedEffects = JSON.parse(JSON.stringify(arg2));
    var intervalId = JSON.parse(JSON.stringify(arg3));
    var r = resolveSpecialEffects(generateEffectResolutionInput(characterInfo.casterSpecial, characterInfo.receiverSpecial, characterInfo.casterAttributes, characterInfo.receiverAttributes, characterInfo.casterEffects, characterInfo.receiverEffects, derivedEffects, intervalId), reversed, seed, textInstanceGroup);
    characterInfo.casterAttributes = r.casterAttributes;
    characterInfo.receiverAttributes = r.receiverAttributes;
    characterInfo.casterEffects = r.casterEffects;
    characterInfo.receiverEffects = r.receiverEffects;
    if(!reversed){
        characterInfo.casterAttributes.action.actionPoint = characterInfo.casterAttributes.action.actionPointMax;
    }else{
        characterInfo.receiverAttributes.action.actionPoint = characterInfo.receiverAttributes.action.actionPointMax;
    }
    //FightLogicBasic.resetCounterForSpecial5ForCaster(characterInfo, seed);
    //FightLogicBasic.applySpecialEffectWithId(characterInfo.receiverSpecial, characterInfo.receiverEffects, characterInfo.receiverEffects, characterInfo.receiverAttributes, characterInfo.receiverAttributes, derivedEffects, 6);
    /*for(uint i =0 ; i < intervalId.length; i ++){
        FightLogicBasic.updateIntervalEffectCounterAndApplyIfZero(characterInfo.casterSpecial, characterInfo, false, derivedEffects, intervalId[i]);
    }*/
    //FightLogicBasic.refreshStatusWithoutGauge(characterInfo);
    var refreshOuput = refreshStatusBeforeTurn(characterInfo.casterBaseAttribute, characterInfo.receiverBaseAttribute, characterInfo.casterEffects, characterInfo.receiverEffects);
    updateExistingAttribute(characterInfo.casterAttributes, refreshOuput.casterAttributes);
    updateExistingAttribute(characterInfo.receiverAttributes, refreshOuput.receiverAttributes);
    return generateEffectResolveOutput(characterInfo.casterAttributes, characterInfo.receiverAttributes, refreshOuput.casterEffects, refreshOuput.receiverEffects);
}

function refreshStatusBeforeTurn(arg1, arg2, arg3, arg4){
    var casterBaseAttr = JSON.parse(JSON.stringify(arg1));
    var receiverBaseAttr = JSON.parse(JSON.stringify(arg2));
    var casterEffects = JSON.parse(JSON.stringify(arg3));
    var receiverEffects = JSON.parse(JSON.stringify(arg4));
    var playerInput = generateAggregatedInput(casterBaseAttr, casterEffects);
    var enemyInput = generateAggregatedInput(receiverBaseAttr, receiverEffects);
    var playerNewAttribute = calculateAggregatedAttributesInFight(playerInput, enemyInput);
    var enemyNewAttribute = calculateAggregatedAttributesInFight(enemyInput, playerInput);
    updateExistingEffectCatalogs(casterEffects);
    updateExistingEffectCatalogs(receiverEffects);
    return generateEffectResolveOutput(playerNewAttribute, enemyNewAttribute, casterEffects, receiverEffects);
}

function resolveSpecial2(input, reversed){
    var special2 = getCharacterSpecialAbilityById(reversed ? input.receiverSpecial : input.casterSpecial, 2);
    if(special2.id != 0){
        if(!reversed){
            input.casterAttributes.shield = input.casterAttributes.shield * special2.attributes[1] / 10000;
        }else{
            input.receiverAttributes.shield = input.receiverAttributes.shield * special2.attributes[1] / 10000;
        }
    }else{
        if(!reversed){
            input.casterAttributes.shield = 0;
        }else{
            input.receiverAttributes.shield = 0;
        }
    }
}


function resolveSpecialEffects(arg1, reversed, seed, textInstanceGroup){
    var input = JSON.parse(JSON.stringify(arg1));
    resolveSpecial2(input, reversed);
    //resolve hp based
    var casterAttributes = reversed ? input.receiverAttributes : input.casterAttributes;
    for(var i = 0; i < (reversed ? input.receiverSpecial : input.casterSpecial).length; i ++){
        var special = (reversed ? input.receiverSpecial : input.casterSpecial)[i];
        var receiverEffects = reversed ? (special.onTarget ? input.casterEffects : input.receiverEffects) : (special.onTarget ? input.receiverEffects : input.casterEffects);
        if(special.attributes.length >= 4 && special.attributes[3] == 1000){
            var stackNumber = 0;
            var startHP = casterAttributes.maxHP * special.attributes[4]/ 10000;
            var endHP = casterAttributes.maxHP * special.attributes[5]/ 10000;
            if(casterAttributes.hp < endHP){
                stackNumber = special.attributes[6];
            }else if(casterAttributes.hp <= startHP){
                stackNumber = (startHP - casterAttributes.hp) * 10000 * special.attributes[6] / ((startHP - endHP) * 10000);
            }
            clearEffect(special.effect.effectNameId, receiverEffects);
            for(var j = 0; j < stackNumber; j ++){
                if(special.id != 0){
                    var applyInput = generateApplyEffectOnCharacterInput(reversed ? input.receiverAttributes : input.casterAttributes, reversed ? (special.onTarget ? input.casterAttributes : input.receiverAttributes): (special.onTarget ? input.receiverAttributes : input.casterAttributes), reversed ? input.receiverEffects : input.casterEffects, reversed ? (special.onTarget ? input.casterEffects : input.receiverEffects) : (special.onTarget ? input.receiverEffects : input.casterEffects), special.effect, input.derivedEffects, 0, 1);
                    overrideApplyEffect(applyInput, applyEffectOnCharacter(undefined, applyInput, textInstanceGroup));
                }
            }
        }else{
            continue;
        }
    }
    return updateIntervalEffectCounterAndApplyIfZero(reversed ? input.receiverSpecial : input.casterSpecial, input, reversed, input.derivedEffects, input.intervalId, seed, textInstanceGroup);
}

function updateIntervalEffectCounterAndApplyIfZero(arg1, arg2, arg3, arg4, arg5, arg6, textInstanceGroup){
    var abilityEntries = JSON.parse(JSON.stringify(arg1));
    var input = JSON.parse(JSON.stringify(arg2));
    var reversed = JSON.parse(JSON.stringify(arg3));
    var derivedEffects = JSON.parse(JSON.stringify(arg4));
    var intervalId = JSON.parse(JSON.stringify(arg5));
    var seed = JSON.parse(JSON.stringify(arg6));
    //reset counter for special 5(dice)
    resetCounterForSpecial5(input, reversed, seed);
    if(!reversed){
        applySpecialEffectWithId(input.receiverSpecial, input.receiverEffects, input.receiverEffects, input.receiverAttributes, input.receiverAttributes, input.derivedEffects, 6, textInstanceGroup);
    }else{
        applySpecialEffectWithId(input.casterSpecial, input.casterEffects, input.casterEffects, input.casterAttributes, input.casterAttributes, input.derivedEffects, 6, textInstanceGroup);
    }

    for(var i =0 ; i < intervalId.length; i ++){
        var special = getCharacterSpecialAbilityById(abilityEntries, intervalId[i]);
        if(special.id != 0){
            var specialKey = special.attributes[3];
            var resetVal = special.attributes[4];
            if(increaseValForKeyInEffects(reversed ? input.receiverEffects : input.casterEffects, specialKey, resetVal)){
                applySpecialEffect(special, reversed ? input.receiverEffects : input.casterEffects, reversed ? (special.onTarget ? input.casterEffects : input.receiverEffects) : (special.onTarget ? input.receiverEffects : input.casterEffects), reversed ? input.receiverAttributes : input.casterAttributes, reversed ? (special.onTarget ? input.casterAttributes : input.receiverAttributes): (special.onTarget ? input.receiverAttributes : input.casterAttributes), derivedEffects, textInstanceGroup);
            }
        }
    }
    return generateEffectResolveOutput(input.casterAttributes, input.receiverAttributes, input.casterEffects, input.receiverEffects);
}

function applySpecialEffect(special, casterEffects, receiverEffects, casterAttributes, receiverAttributes, derivedEffects, textInstanceGroup) {
    if(special.id != 0){
        var applyInput = generateApplyEffectOnCharacterInput(casterAttributes, receiverAttributes, casterEffects, receiverEffects, special.effect, derivedEffects, 0, 1);
        overrideApplyEffect(applyInput, applyEffectOnCharacter(undefined, applyInput, textInstanceGroup));
    }
}

function increaseValForKeyInEffects(effects, key, resetVal){
    var index = getIndexForKeyInEffects(effects, key);
    if(index == -1){
        return false;
    }else if(index == -2){
        insertKey(effects, key);
        return true;
    }
    effects.val[index] ++;
    if(effects.val[index] >= resetVal){
        effects.val[index] = 0;
        return true;
    }else{
        return false;
    }
}

function insertKey(effects, key) {
    for(var i = 0; i < effects.key.length; i ++){
        if(effects.key[i] == 0){
            effects.key[i] = key;
            effects.val[i] = 0;
            break;
        }
    }
}

function getIndexForKeyInEffects(effects, key) {
    var hasEmpty = false;
    for(var i = 0; i < effects.key.length; i ++){
        if(effects.key[i] == 0){
            hasEmpty = true;
        }else if(effects.key[i] == key){
            return i;
        }
    }
    if(hasEmpty){
        return -2;
    }else{
        return -1;
    }
}

function applySpecialEffectWithId(abilityEntries, casterEffects, receiverEffects,  casterAttributes,  receiverAttributes,  derivedEffects, id, textInstanceGroup) {
    var special = getCharacterSpecialAbilityById(abilityEntries, id);
    if(special.id != 0){
        var applyInput = generateApplyEffectOnCharacterInput(casterAttributes, receiverAttributes, casterEffects, receiverEffects, special.effect, derivedEffects, 0, 1);
        overrideApplyEffect(applyInput, applyEffectOnCharacter(undefined, applyInput, textInstanceGroup));
    }
}

function resetCounterForSpecial5(input, reversed, seed){
    var casterSpecial5 = getCharacterSpecialAbilityById(reversed ? input.receiverSpecial : input.casterSpecial, 5);
    if(casterSpecial5.id != 0){
        if(!reversed){
            input.casterEffects.specialCounter[3] = getRandomSeededMinMax(1, 6, seed);
            input.casterEffects.specialCounter[2] = 0;
        }else{
            input.receiverEffects.specialCounter[3] = getRandomSeededMinMax(1, 6, seed);
            input.receiverEffects.specialCounter[2] = 0;
        }
    }
}

function clearEffect(effectNameId, effectOnCharacter){
    for(var i = 0; i < effectOnCharacter.valid.length; i ++){
        if(effectOnCharacter.valid[i] && effectOnCharacter.effectMap[i].effectNameId != 0 && effectOnCharacter.effectMap[i].effectNameId == effectNameId){
            effectOnCharacter.valid[i] = false;
        }
    }
}