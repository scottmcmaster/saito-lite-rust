
  //
  // Allies
  //
  // are by definition major powers as opposed minor / activated powers, although 
  // if you ask areAllies() or areEnemies() on combinations of faction names that 
  // include minor-activated powers like scotland or genoa these functions will 
  // politely let you know if those minor-powers are activated to an ally or enemy
  //

  returnAllies(faction) { 
    let f = [];
    let io = this.returnImpulseOrder();
    for (let i = 0; i < io.length; i++) {
      if (io[i] !== faction) {
        if (this.areAllies(faction, io[i])) { f.push(io[i]); }
      }
    }
    if (this.areAllies(faction, "genoa")) { f.push("genoa"); }
    if (this.areAllies(faction, "venice")) { f.push("venice"); }
    if (this.areAllies(faction, "hungary")) { f.push("hungary"); }
    if (this.areAllies(faction, "scotland")) { f.push("scotland"); }
    return f;
  }

  returnEnemies(faction) { 
    let f = [];
    let io = this.returnImpulseOrder();
    for (let i = 0; i < io.length; i++) {
      if (io[i] !== faction) {
        if (this.areEnemies(faction, io[i])) { f.push(io[i]); }
      }
    }
    return f;
  }

  areAllies(faction1, faction2) {
    try { if (this.game.state.diplomacy[faction1][faction2].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.diplomacy[faction2][faction1].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 1; } } catch (err) {}
    if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
      let f1cp = this.returnControllingPower(faction1);
      let f2cp = this.returnControllingPower(faction2);
      try { if (this.game.state.diplomacy[f2cp][f1cp].allies == 1) { return 1; } } catch (err) {}
      try { if (this.game.state.diplomacy[f1cp][f2cp].allies == 1) { return 1; } } catch (err) {}
      try { if (this.game.state.diplomacy[f2cp][f1cp].allies == 1) { return 1; } } catch (err) {}
    }
    return 0;
  }

  areEnemies(faction1, faction2) {
    try { if (this.game.state.diplomacy[faction1][faction2].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.diplomacy[faction2][faction1].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 0; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 0; } } catch (err) {}
    if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
      let f1cp = this.returnControllingPower(faction1);
      let f2cp = this.returnControllingPower(faction2);
      try { if (this.game.state.diplomacy[f1cp][f2cp].enemies == 1) { return 1; } } catch (err) {}
      try { if (this.game.state.diplomacy[f2cp][f1cp].enemies == 1) { return 1; } } catch (err) {}
    }
    return 0;
  }

  setActivatedPower(faction, activated_power) {
    if (!this.game.state.activated_powers[faction].includes(activated_power)) { 
      this.game.state.activated_powers[faction].push(activated_power);
    }
  }

  unsetActivatedPower(faction, activated_power) {
    if (this.game.state.activated_powers[faction1].includes(activated_power)) {
      let x = [];
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
        if (this.game.state.activated_powers[faction][i] !== activated_power) {
          x.push(this.game.state.activated_powers[faction][i]);
        }
      }
      this.game.state.activated_powers[faction] = x;
    }
  }


  setAllies(faction1, faction2, amp=1) {

    try { this.game.state.diplomacy[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].enemies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction1][faction2].allies = 1; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].allies = 1; } catch (err) {}

    //
    // in the 2P game, Hapsburgs are an activated power for the Papacy
    //
    if (this.game.state.events.schmalkaldic_league == 1 && this.game.players.length == 2 && (faction1 == "papacy" || faction1 == "hapsburg") && (faction1 == "hapsburg" || faction2 == "papacy")) {
      if (!this.game.state.activated_powers["papacy"].includes("hapsburg")) {
        this.setActivatedPower("papacy", "hapsburg");
      }
    }


    if (amp == 1) {
      if (this.isMinorPower(faction1)) {
        if (!this.isMinorPower(faction2)) {
  	  this.activateMinorPower(faction2, faction1);
        }
      }
      if (this.isMinorPower(faction2)) {
        if (!this.isMinorPower(faction1)) {
	  this.activateMinorPower(faction1, faction2);
        }
      }
    }

    this.displayWarBox();

  }

  unsetAllies(faction1, faction2, amp=1) {
    try { this.game.state.diplomacy[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].allies = 0; } catch (err) {}

    if (this.game.players.length == 2) { if (faction1 === "hapsburg" && faction2 === "papacy") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Papacy must remain allied in 2P game after Schmalkaldic League formed");
      }
    } } 
    if (this.game.players.length == 2) { if (faction2 === "hapsburg" && faction1 === "papacy") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Papacy must remain allied in 2P game after Schmalkaldic League formed");
      }
    } }


    //
    // remove activated powers if set
    //
    try {
      this.unsetActivatePower(faction1, faction2);
      this.unsetActivatePower(faction2, faction1);
    } catch (err) {}


    if (amp == 1) {
      if (this.isMinorPower(faction1)) {
        if (!this.isMinorPower(faction2)) {
  	  this.activateMinorPower(faction2, faction1);
        }
      }
      if (this.isMinorPower(faction2)) {
        if (!this.isMinorPower(faction1)) {
	  this.activateMinorPower(faction1, faction2);
        }
      }
    }

    this.displayWarBox();

  }

  setEnemies(faction1, faction2) {
    try { this.game.state.diplomacy[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].allies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction1][faction2].enemies = 1; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].enemies = 1; } catch (err) {}

    this.displayWarBox();

  }

  unsetEnemies(faction1, faction2) {

    if (this.game.players.length == 2) { if (faction1 === "hapsburg" && faction2 === "protestant") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Protestants must remain at war in 2P variant");
      }
    } }
    if (this.game.players.length == 2) { if (faction2 === "hapsburg" && faction1 === "protestant") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Protestants must remain at war in 2P variant");
      }
    } }
    if (this.game.players.length == 2) { if (faction1 === "papacy" && faction2 === "protestant") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Papacy and Protestants must remain at war in 2P variant");
      }
    } }
    if (this.game.players.length == 2) { if (faction2 === "papacy" && faction1 === "protestant") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Papacy and Protestants must remain at war in 2P variant");
      }
    } }


    try { this.game.state.diplomacy[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].enemies = 0; } catch (err) {}

    this.displayWarBox();

  }


  returnPlayerCommandingFaction(defender) {

    //
    // by default factions control themselves
    //

    //
    // maybe this is a minor power controlled by a larger one
    //
    if (defender == "venice" || defender == "independent" || defender == "genoa" || defender == "scotland" || defender == "hungary") {
      defender = this.returnControllingPower(defender);
    }         

    //
    // defender now controlling power or itself
    //
    for (let p = 0; p < this.game.players.length; p++) {

      //
      // does player command this faction
      //
      let player_factions = this.returnPlayerFactions((p+1));
      let i_command_this_faction = false;
      for (let i = 0; i < player_factions.length; i++) { 
	if (player_factions[i] === defender) { return (p+1); }
        if (this.game.state.activated_powers[player_factions[i]].includes(defender)) { return (p+1); }
        for (let z = 0; z < this.game.state.activated_powers[player_factions[i]]; z++) {
          if (this.game.state.activated_powers[player_factions[i]][z] === defender) { return (p+1); }
        }
      }
    }

    //
    // no-one controls this faction
    //
    return 0;

  }


