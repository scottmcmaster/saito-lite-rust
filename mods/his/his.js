const GameTemplate = require('../../lib/templates/gametemplate');
const DebateOverlay = require('./lib/ui/overlays/debate');
const TreatiseOverlay = require('./lib/ui/overlays/treatise');
const FactionOverlay = require('./lib/ui/overlays/faction');
const ReligiousOverlay = require('./lib/ui/overlays/religious');
const CouncilOfTrentOverlay = require('./lib/ui/overlays/council-of-trent');
const ReformationOverlay = require('./lib/ui/overlays/reformation');
const MovementOverlay = require('./lib/ui/overlays/movement');
const DietOfWormsOverlay = require('./lib/ui/overlays/diet-of-worms');
const FieldBattleOverlay = require('./lib/ui/overlays/field-battle');
const SchmalkaldicOverlay = require('./lib/ui/overlays/schmalkaldic');
const AssaultOverlay = require('./lib/ui/overlays/siege');
const ThesesOverlay = require('./lib/ui/overlays/theses');
const DebatersOverlay = require('./lib/ui/overlays/debaters');
const UnitsOverlay = require('./lib/ui/overlays/units');
const WelcomeOverlay = require('./lib/ui/overlays/welcome');
const WinterOverlay = require('./lib/ui/overlays/winter');
const DeckOverlay = require('./lib/ui/overlays/deck');
const MenuOverlay = require('./lib/ui/overlays/menu');
const LanguageZoneOverlay = require('./lib/ui/overlays/language-zone');

const HISRules = require('./lib/core/rules.template');
const HISOptions = require('./lib/core/advanced-options.template');
const HISingularOption = require('./lib/core/options.template');

const JSON = require('json-bigint');



//////////////////
// CONSTRUCTOR  //
//////////////////
class HereIStand extends GameTemplate {

  constructor(app) {

    super(app);

    this.app             = app;

    this.name  		 = "HereIStand";
    this.gamename        = "Here I Stand";
    this.slug		 = "his";
    this.description     = `Here I Stand is a boardgame based on the military, political and religious conflicts within Europe at the outbreak of the Protestant Reformation (1517-1555). Each player controls one or more major powers that dominated Europe: the Ottoman Empire, the Hapsburgs, England, France, the Papacy and the Protestant states.`;
    this.publisher_message = `Here I Stand is published by GMT Games. This module is made available under an open source license provided by GMT Games that permits usage provided that at least one player per game has purchased a copy of the game. Support GMT Games: <a href="https://www.gmtgames.com/p-917-here-i-stand-500th-anniversary-reprint-edition-2nd-printing.aspx">purchase</a>`;
    this.categories      = "Games Boardgame Strategy";

    this.interface = 1; // graphical interface

    //
    // ui components
    //
    this.debate_overlay = new DebateOverlay(this.app, this);      // theological debates
    this.treatise_overlay = new TreatiseOverlay(this.app, this);  // publish treatise
    this.religious_overlay = new ReligiousOverlay(this.app, this);  // religious conflict sheet
    this.faction_overlay = new FactionOverlay(this.app, this);  // faction sheet
    this.diet_of_worms_overlay = new DietOfWormsOverlay(this.app, this);  // diet of worms
    this.council_of_trent_overlay = new CouncilOfTrentOverlay(this.app, this);  // council of trent
    this.theses_overlay = new ThesesOverlay(this.app, this);  // 95 theses
    this.reformation_overlay = new ReformationOverlay(this.app, this);  // reformations and counter-reformations
    this.language_zone_overlay = new LanguageZoneOverlay(this.app, this);  // language zone selection
    this.debaters_overlay = new DebatersOverlay(this.app, this);  // language zone selection
    this.schmalkaldic_overlay = new SchmalkaldicOverlay(this.app, this);  // schmalkaldic league
    this.assault_overlay = new AssaultOverlay(this.app, this);  // siege
    this.field_battle_overlay = new FieldBattleOverlay(this.app, this);  // field battles
    this.movement_overlay = new MovementOverlay(this.app, this);  // unit movement
    this.welcome_overlay = new WelcomeOverlay(this.app, this);  // hello world
    this.deck_overlay = new DeckOverlay(this.app, this);  // overlay to show cards
    this.menu_overlay = new MenuOverlay(this.app, this);  // players doing stuff
    this.winter_overlay = new WinterOverlay(this.app, this);
    this.units_overlay = new UnitsOverlay(this.app, this);

    //
    // this sets the ratio used for determining
    // the size of the original pieces
    //
    this.boardWidth  = 5100;

    //
    // newbie mode
    //
    this.confirm_moves = 1;

    //
    // "showcard" popups
    //
    this.useCardbox = 1;

    //
    //
    // players
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 6;

  }


  returnSingularGameOption(){
    return HISSingularOption();
  }

  returnAdvancedOptions() {
    return HISOptions();
  }

  returnGameRulesHTML(){
    return HISRules();
  }


  ////////////////
  // initialize //
  ////////////////
  initializeGame(game_id) {

    //
    // check user preferences to update interface, if text
    //
    if (this.app?.options?.gameprefs) {
      if (this.app.options.gameprefs.his_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    }

    //
    // re-fill status and log
    //
    if (this.game.status != "") { this.updateStatus(this.game.status); }

    //
    // initialize game objects
    //
    this.factions = {};

    this.units = {};
    this.army = {};
    this.navy = {};
    this.reformers = {};
    this.debaters = {};
    this.explorers = {};
    this.conquistadors = {};
    this.wives = {};

    this.deck = this.returnDeck();
    this.diplomatic_deck = this.returnDiplomaticDeck();



    this.importFaction('faction2', {
      id		:	"faction2" ,
      key		:	"england" ,
      name		: 	"England",
      nickname		: 	"England",
      img		:	"england.png",
      admin_rating	:	1,
      capitals		:	["london"],
      cards_bonus	:	1,
      marital_status    :       0,
      returnCardsSaved  :       function(game_mod) {

        let base = 0;

        if (game_mod.game.state.leaders.henry_viii == 1) { base += 1; }
        if (game_mod.game.state.leaders.edward_vi == 1) { base += 1; }
        if (game_mod.game.state.leaders.mary_i == 1) { base += 1; }
        if (game_mod.game.state.leaders.elizabeth_i == 1) { base += 2; }

        return base;

      },
      returnCardsDealt  :	function(game_mod) {

        let kc = game_mod.returnNumberOfKeysControlledByFaction("england");
        let base = 0;

	switch (kc) {
	  case 1: { base = 1; break; }
	  case 2: { base = 1; break; }
	  case 3: { base = 2; break; }
	  case 4: { base = 2; break; }
	  case 5: { base = 3; break; }
	  case 6: { base = 3; break; }
	  case 7: { base = 4; break; }
	  case 8: { base = 4; break; }
	  case 9: { base = 5; break; }
	  case 10: { base = 5; break; }
	  case 11: { base = 6; break; }
	  case 12: { base = 6; break; }
	  default: { base = 1; break; }
	}

	// bonuses based on leaders
	if (game_mod.game.state.leaders.henry_viii == 1) { base += 1; }
	if (game_mod.game.state.leaders.edward_vi == 1) { base += 0; }
	if (game_mod.game.state.leaders.mary_i == 1) { base += 0; }
	if (game_mod.game.state.leaders.elizabeth_i == 1) { base += 2; }

	// TODO - bonus for home spaces under protestant control
	return base;

      },
      calculateBonusVictoryPoints  :	function(game_mod) {
        return this.bonus_vp;
      },
      calculateSpecialVictoryPoints  :	function(game_mod) {
        return this.special_vp;
      },
      calculateBaseVictoryPoints  :	function(game_mod) {

        let kc = game_mod.returnNumberOfKeysControlledByFaction("england");
        let base = this.vp;

	switch (kc) {
	  case 1: { base += 3; break; }
	  case 2: { base += 5; break; }
	  case 3: { base += 7; break; }
	  case 4: { base += 9; break; }
	  case 5: { base += 11; break; }
	  case 6: { base += 13; break; }
	  case 7: { base += 15; break; }
	  case 8: { base += 17; break; }
	  default: { base += 17; break; }
	}

	return base;

      },
    });
 


    this.importFaction('faction3', {
      id		:	"faction3" ,
      key		: 	"france",
      name		: 	"France",
      nickname		: 	"France",
      capitals          :       ["paris"],
      admin_rating	:	1,
      img		:	"france.png",
      cards_bonus	:	1,
      returnCardsSaved  :       function(game_mod) {

        let base = 0;

        if (game_mod.game.state.leaders.francis_i == 1) { base += 1; }
        if (game_mod.game.state.leaders.henry_ii == 1) { base += 1; }

        return base;

      },
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("france");
        let base = this.vp; 
       
        switch (kc) {
          case 1: { base = 1; break; }
          case 2: { base = 1; break; }
          case 3: { base = 1; break; }
          case 4: { base = 2; break; }
          case 5: { base = 2; break; }
          case 6: { base = 3; break; }
          case 7: { base = 3; break; }
          case 8: { base = 4; break; }
          case 9: { base = 4; break; }
          case 10: { base = 5; break; }
          case 11: { base = 6; break; }
          case 12: { base = 6; break; }
          default: { base = 0; break; }
        }

        // bonuses based on leaders
        if (game_mod.game.state.leaders.francis_i == 1) { base += 1; }        
        if (game_mod.game.state.leaders.henry_ii == 1) { base += 0; }        

        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateBaseVictoryPoints  : function(game_mod) {

        let kc = game_mod.returnNumberOfKeysControlledByFaction("france");
        let base = 0;
        
        switch (kc) {
          case 1: { base += 2; break; }
          case 2: { base += 4; break; }
          case 3: { base += 6; break; }
          case 4: { base += 8; break; }
          case 5: { base += 10; break; }
          case 6: { base += 12; break; }
          case 7: { base += 14; break; }
          case 8: { base += 16; break; }
          case 9: { base += 18; break; }
          case 10: { base += 20; break; }
        } 
        
        return base;
        
      },
      calculateBonusVictoryPoints  :    function(game_mod) {
        return 0;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {
	return game_mod.game.state.french_chateaux_vp;
      },
    });
 



    this.importFaction('faction7', {
      id		:	"faction7" ,
      key		:	"genoa" ,
      name		: 	"Genoa",
      nickname		: 	"Genoa",
    });
 


    this.importFaction('faction1', {
      id		:	"faction1" ,
      key		: 	"hapsburg",
      name		: 	"Hapsburg",
      nickname		: 	"Hapsburg",
      capitals          :       ["valladolid","vienna"],
      img		:	"hapsburgs.png",
      admin_rating	:	2,
      cards_bonus	:	0,
      returnCardsSaved  :       function(game_mod) {
 
        let base = 0;

        if (game_mod.game.state.leaders.charles_v == 1) { base += 2; }

        return base;

        return base; 

      },
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("hapsburg");
        let base = 0;
        
        switch (kc) {
          case 1: { base = 1; break; }
          case 2: { base = 2; break; }
          case 3: { base = 2; break; }
          case 4: { base = 3; break; }
          case 5: { base = 3; break; }
          case 6: { base = 4; break; }
          case 7: { base = 4; break; }
          case 8: { base = 5; break; }
          case 9: { base = 5; break; }
          case 10: { base = 6; break; }
          case 11: { base = 6; break; }
          case 12: { base = 7; break; }
          case 13: { base = 7; break; }
          default: { base = 0; break; }
        }

        if (game_mod.game.state.leaders.charles_v == 1) { base += 0; }
       
        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateBaseVictoryPoints  : function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("hapsburg");
        let base = this.vp;
        
        switch (kc) {
          case 1: { base += 2; break; }
          case 2: { base += 3; break; }
          case 3: { base += 4; break; }
          case 4: { base += 5; break; }
          case 5: { base += 6; break; }
          case 6: { base += 7; break; }
          case 7: { base += 8; break; }
          case 8: { base += 9; break; }
          case 9: { base += 10; break; }
          case 10: { base += 11; break; }
          case 11: { base += 12; break; }
          case 12: { base += 13; break; }
          case 13: { base += 14; break; }
        } 
        
        return base;

      },
      calculateBonusVictoryPoints  :    function(game_mod) {
        return this.bonus_vp;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {
        return this.special_vp;
      },
    });
 



    this.importFaction('faction8', {
      id                :       "faction8" ,
      key               :       "hungary" ,
      name              :       "Hungary",
      nickname          :       "Hungary",
    });



    this.importFaction('faction11', {
      id                :       "faction11" ,
      key               :       "independent" ,
      name              :       "Independent",
      nickname          :       "Independent",
    });



    this.importFaction('faction5', {
      id		:	"faction5" ,
      key		: 	"ottoman",
      name		: 	"Ottoman Empire",
      nickname		: 	"Ottoman",
      capitals          :       ["istanbul"],
      img		:	"ottoman.png",
      admin_rating	:	2,
      cards_bonus	:	0,
      returnCardsSaved  :       function(game_mod) {

        let base = 0;

        if (game_mod.game.state.leaders.suleiman == 1) { base += 2; }

        return base;

      },
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("england");
        let base = 0;
        
        switch (kc) {
          case 1: { base = 2; break; }
          case 2: { base = 2; break; }
          case 3: { base = 3; break; }
          case 4: { base = 3; break; }
          case 5: { base = 4; break; }
          case 6: { base = 4; break; }
          case 7: { base = 5; break; }
          case 8: { base = 5; break; }
          case 9: { base = 6; break; }
          case 10: { base = 6; break; }
          default: { base = 0; break; }
        }

        if (game_mod.game.state.leaders.suleiman == 1) { base += 0; }        
       
        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateBaseVictoryPoints  : function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("ottoman");
        let base = this.vp;
        
        switch (kc) {
          case 1: { base += 2; break; }
          case 2: { base += 4; break; }
          case 3: { base += 6; break; }
          case 4: { base += 8; break; }
          case 5: { base += 10; break; }
          case 6: { base += 12; break; }
          case 7: { base += 14; break; }
          case 8: { base += 16; break; }
          case 9: { base += 18; break; }
          case 10: { base += 20; break; }
        } 
        
        return base;

      },
      calculateBonusVictoryPoints  :    function(game_mod) {
        return this.bonus_vp;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {
        return this.special_vp;
      },
    });
 



    this.importFaction('faction4', {

      id		:	"faction4" ,
      key		: 	"papacy",
      name		: 	"Papacy",
      nickname		: 	"Papacy",
      capitals          :       ["rome"],
      img		:	"papacy.png",
      admin_rating	:	0,
      cards_bonus	:	0,
      returnCardsSaved  :       function(game_mod) {
 
        let base = 0;

        if (game_mod.game.state.leaders.leo_x == 1) { base += 0; }
        if (game_mod.game.state.leaders.clement_vii == 1) { base += 1; }
        if (game_mod.game.state.leaders.paul_iii == 1) { base += 1; }
        if (game_mod.game.state.leaders.julius_iii == 1) { base += 0; }

        return base; 

      },
      returnCardsDealt  :       function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("england");
        let base = 0;
        
        switch (kc) {
          case 1: { base = 2; break; }
          case 2: { base = 3; break; }
          case 3: { base = 3; break; }
          case 4: { base = 4; break; }
          case 5: { base = 4; break; }
          case 6: { base = 4; break; }
          default: { base = 0; break; }
        }

        if (game_mod.game.state.leaders.leo_x == 1) { base += 0; }
        if (game_mod.game.state.leaders.clement_vii == 1) { base += 0; }
        if (game_mod.game.state.leaders.paul_iii == 1) { base += 1; }
        if (game_mod.game.state.leaders.julius_iii == 1) { base += 1; }       

        // TODO - bonus for home spaces under protestant control
        return base;

      },
      calculateBaseVictoryPoints  : function(game_mod) {
        
        let kc = game_mod.returnNumberOfKeysControlledByFaction("papacy");
        let base = this.vp;
        
        switch (kc) {
          case 1: { base += 2; break; }
          case 2: { base += 4; break; }
          case 3: { base += 6; break; }
          case 4: { base += 8; break; }
          case 5: { base += 10; break; }
          case 6: { base += 12; break; }
        } 
        
        return base;

      },
      calculateBonusVictoryPoints  :    function(game_mod) {
        return 0;
      },
      calculateSpecialVictoryPoints  :  function(game_mod) {

	// protestant spaces track
	let base = game_mod.returnProtestantSpacesTrackVictoryPoints().papacy;

        // burned protestant debaters
        for (let i = 0; i < game_mod.game.state.burned.length; i++) {
          let bd = game_mod.game.state.burned[i];
          if (game_mod.debaters[bd]) {
            if (game_mod.debaters[bd].faction == "papacy") {
              base += game_mod.debaters[bd].power;
            }
          }
        }

	// saint peters cathedral
 	base += game_mod.game.state.saint_peters_cathedral['vp'];

        return base;

      },
    });
 



    this.importFaction('faction6', {
      id		:	"faction6" ,
      key		: 	"protestant",
      name		: 	"Protestants",
      nickname		: 	"Protestants",
      capitals		:	[] ,
      img		:	"protestant.png",
      admin_rating	:	2,
      cards_bonus	:	0,
      returnCardsDealt  :       function(game_mod) {
        
	let base = 4; 

        let kc = game_mod.returnNumberOfElectoratesControlledByProtestants();
        if (kc > 4) { base += 1; }

        if (game_mod.game.state.leaders.luther == 1) { base += 0; }

	return base;        

      },
      returnCardsSaved  :       function(game_mod) {

	if (game_mod.game.state.leaders.luther == 1) { return 1; }
      
	return 0;
      },

      calculateBaseVictoryPoints  : function(game_mod) {
	// 2 VP for every electorate that is under Protesant religious + political control
        let base = 0;
        base += (2 * game_mod.returnNumberOfProtestantElectorates());        
        return base;
      },

      calculateBonusVictoryPoints  :    function(game_mod) {
	// + VP from disgraced papal debaters
	let bonus_vp_points = 0;
	bonus_vp_points += game_mod.game.state.papal_debaters_disgraced_vp;
	bonus_vp_points += game_mod.game.state.protestant_war_winner_vp;
        return bonus_vp_points;
      }
,
      calculateSpecialVictoryPoints  :  function(game_mod) {

	// protestant spaces track
        let base = game_mod.returnProtestantSpacesTrackVictoryPoints().protestant;

	// burned papal debaters
	for (let i = 0; i < game_mod.game.state.burned.length; i++) {
	  let bd = game_mod.game.state.burned[i];
	  if (game_mod.debaters[bd]) {
	    if (game_mod.debaters[bd].faction == "papacy") {
	      base += game_mod.debaters[bd].power;
	    }
	  }
	}
	
	// 1 VP for each full bible translation
        if (game_mod.game.state.translations['full']['german'] == 10) { base++; }
        if (game_mod.game.state.translations['full']['french'] == 10) { base++; }
        if (game_mod.game.state.translations['full']['english'] == 10) { base++; }

        return base;
      },
    });
 



    this.importFaction('faction10', {
      id                :       "faction10" ,
      key               :       "scotland" ,
      name              :       "Scotland",
      nickname          :       "Scotland",
    });



    this.importFaction('faction9', {
      id                :       "faction9" ,
      key               :       "venice" ,
      name              :       "Venice",
      nickname          :       "Venice",
    });



    this.importArmyLeader('suleiman', {
      type		:	"suleiman" ,
      name		: 	"Suleiman",
      personage		:	true,
      army_leader	:	true,
      img		:	"Suleiman.svg",
      battle_rating	:	2,
      command_value	:	10,
    });
 
    this.importArmyLeader('ibrahim-pasha', {
      type		:	"ibrahim-pasha" ,
      name		: 	"Ibrahim Pasha",
      personage		:	true,
      army_leader	:	true,
      img		:	"Ibrahim.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
  
    this.importArmyLeader('charles-v', {
      type		:	"charles-v" ,
      name		: 	"Charles V",
      personage		:	true,
      army_leader	:	true,
      img		:	"Charles_V.svg",
      battle_rating	:	2,
      command_value	:	10,
    });
 
    this.importArmyLeader('duke-of-alva', {
      type		:	"duke-of-alva" ,
      name		: 	"Duke of Alva",
      personage		:	true,
      army_leader	:	true,
      img		:	"Duke_of_Alva.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
    this.importArmyLeader('ferdinand', {
      type		:	"ferdinand" ,
      name		: 	"Ferdinand",
      personage		:	true,
      army_leader	:	true,
      img		:	"Ferdinand.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
    this.importArmyLeader('henry-viii', {
      type		:	"henry-viii" ,
      name		: 	"Henry VIII",
      personage		:	true,
      army_leader	:	true,
      img		:	"Henry_VIII.svg",
      battle_rating	:	1,
      command_value	:	8,
    });
 
    this.importArmyLeader('charles-brandon', {
      type		:	"charles-brandon" ,
      name		: 	"Charles Brandon",
      personage		:	true,
      army_leader	:	true,
      img		:	"Brandon.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
    this.importArmyLeader('francis-i', {
      type		:	"francis-i" ,
      name		: 	"Francis I",
      personage		:	true,
      army_leader	:	true,
      img		:	"Francis_I.svg",
      battle_rating	:	1,
      command_value	:	8,
    });

    this.importArmyLeader('henry-ii', {
      type		:	"henry-ii" ,
      name		: 	"Henry II",
      personage		:	true,
      army_leader	:	true,
      img		:	"Henry_II.svg",
      battle_rating	:	0,
      command_value	:	8,
    });
 
    this.importArmyLeader('montmorency', {
      type		:	"montmorency" ,
      name		: 	"Montmorency",
      personage		:	true,
      army_leader	:	true,
      img		:	"Montmorency.svg",
      battle_rating	:	1,
      command_value	:	6,
    });
 
    this.importArmyLeader('andrea-doria', {
      type		:	"andrea-doria" ,
      name		: 	"Andrea Doria",
      personage		:	true,
      army_leader	:	true,
      img		:	"Andrea_Doria.svg",
      battle_rating	:	2,
      command_value	:	0,
    });

    this.importArmyLeader('maurice-of-saxony', {
      type		:	"maurice-of-saxony" ,
      name		: 	"Maurice of Saxony",
      personage		:	true,
      army_leader	:	true,
      img		:	"Maurice_Protestant.svg", // "Maurice_Hapsburg.svg"
      battle_rating	:	1,
      command_value	:	6,
    });

    this.importArmyLeader('dudley', {
      type              :       "dudley" ,
      name              :       "Dudley",
      personage         :       true,
      army_leader       :       true,
      img               :       "Dudley.svg",
      battle_rating     :       0,
      command_value     :       6,
    });

    this.importArmyLeader('john-frederick', {
      type              :       "john-frederick" ,
      name              :       "John Frederick",
      personage         :       true,
      army_leader       :       true,
      img               :       "John_Frederick.svg",
      battle_rating     :       0,
      command_value     :       6,
    });

    this.importArmyLeader('philip-hesse', {
      type              :       "philip-hesse" ,
      name              :       "Philip Hesse",
      personage         :       true,
      army_leader       :       true,
      img               :       "Philip_Hesse.svg",
      battle_rating     :       0,
      command_value     :       6,
    });

    this.importArmyLeader('renegade', {
      type              :       "renegade" ,
      name              :       "Renegade Leader",
      personage         :       true,
      army_leader       :       true,
      img               :       "Renegade.svg",
      battle_rating     :       1,
      command_value     :       6,
    });



/************************

Habsburg conquistadores:
1. Pizarro 3
2. Montejo 2
3. Cortez 4
4. Cordova 1
5. Coronado 1

************************/

      this.importConquistador('orellana', {
           type              :       "orellana",
           name              :       "Hector Rodrigo Enriquez Orellana",
           personage         :       true,
           img               :       "Orellana.svg",
      });

      this.importConquistador('magellan', {
           type              :       "magellan" ,
           name              :       "Ferdinand Magellan",
           personage         :       true,
           img               :       "Magellan.svg",
      });

      this.importConquistador('leon', {
           type              :       "leon" ,
           name              :       "Leon",
           personage         :       true,
           img               :       "Leon.svg",
      });

      this.importConquistador('narvaez', {
           type              :       "narvaez" ,
           name              :       "Sofia Narvaez",
           personage         :       true,
           img               :       "Narvaez.svg",
      });

      this.importConquistador('de-vaca', {
           type              :       "de-vaca" ,
           name              :       "Cabeza De Vaca",
           personage         :       true,
           img               :       "De_Vaca.svg",
      });

      this.importConquistador('de-soto', {
           type              :       "de-soto" ,
           name              :       "DeSoto",
           personage         :       true,
           img               :       "DeSoto.svg",
      });





      /***** Hapsburg Conquistadors *****/

      this.importConquistador('pizarro', {
           type              :       "pizarro" ,
           name              :       "Francisco Pizarro",
           personage         :       true,
           img               :       "Pizarro.svg",
      });

      // Montejo

      this.importConquistador('cordova', {
           type              :       "cordova" ,
           name              :       "Neisa Cordova",
           personage         :       true,
           img               :       "Cordova.svg",
      });

      this.importConquistador('coronado', {
           type              :       "coronado" ,
           name              :       "Francisco Vázquez de Coronado",
           personage         :       true,
           img               :       "Coronado.svg",
      });

      this.importConquistador('cortez', {
           type              :       "cortez" ,
           name              :       "Hernan Cortes",
           personage         :       true,
           img               :       "Cortez.svg",
      });



    ////////////////
    // PROTESTANT //
    ////////////////
    this.importDebater('luther-debater', {
      type		:	"luther-debater" ,
      name		: 	"Martin Luther",
      img		:	"LutherDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	4,
      ability		:	"Bonus CP for translation in German zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_german_language_zone") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'luther-debater', html : `<li class="option" id="luther-debater">Martin Luther +1 Bonus CP</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone" && his_self.canPlayerCommitDebater("protestant", "luther-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 && 
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tluther-debater");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tgerman");
          his_self.endTurn();
        } 
        return 0; 
      },
    });
    this.importDebater('melanchthon-debater', {
      type		:	"melanchthon-debater" ,
      name		: 	"Philip Melanchthon",
      img		:	"MelanchthonDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"Bonus CP for translation in German zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_german_language_zone") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'melanchthon-debater', html : `<li class="option" id="melanchthon-debater">Melanchthon +1 Bonus CP</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone"  && his_self.canPlayerCommitDebater("protestant", "melanchthon-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 && 
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_german_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tmelanchthon-debater");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tgerman");
          his_self.endTurn();
        } 
        return 0; 
      },
    });






    this.importDebater('zwingli-debater', {
      type		:	"zwingli-debater" ,
      name		: 	"Ulrich Zwingli",
      img		:	"ZwingliDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Zurich" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'zwingli-debater', html : `<li class="option" id="zwingli-debater">Ulrich Zwingli +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "zwingli-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["zurich","basel","innsbruck","strasburg","besancon","geneva","trent","salzburg","augsburg"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("ulrich_zwingli");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "ulrich_zwingli") {
	  his_self.commitDebater("protestant", "zwingli-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["zurich","basel","innsbruck","strasburg","besancon","geneva","trent","salzburg","augsburg"];
	}
        return 1;
      }
    });

    this.importDebater('bucer-debater', {
      type		:	"bucer-debater" ,
      name		: 	"Martin Bucer",
      img		:	"BucerDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Strasburg" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'bucer-debater', html : `<li class="option" id="bucer-debater">Martin Bucer +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "bucer-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["strasburg","zurich","basel","geneva","dijon","besancon","stdizier","metz","liege","trier","mainz","nuremberg","worms","augsburg"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("martin_bucer");
	  his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "martin_bucer") {
	  his_self.commitDebater("protestant", "bucer-debater");
	  his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["strasburg","zurich","basel","geneva","dijon","besancon","stdizier","metz","liege","trier","mainz","nuremberg","worms","augsburg"];
	  his_self.game.queue.splice(qe, 1);
	  return 1;
	}
        return 1;
      }
    });
    this.importDebater('oekolampadius-debater', {
      type		:	"oekolampadius-debater" ,
      name		: 	"Johannes Oekolampadius",
      img		:	"OekolampadiusDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 for Reformation attempts within 2 spaces of Basel" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'oekolampadius-debater', html : `<li class="option" id="oekolampadius-debater">Johannes Oekolampadius +1 Bonus</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation"  && his_self.canPlayerCommitDebater("protestant", "oekolampadius-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["basel","zurich","innsbruck","strasburg","besancon","geneva","turin","grenoble","lyon","dijon","metz"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("oekolampadius");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "oekolampadius") {
	  his_self.commitDebater("protestant", "oekolampdius-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["basel","zurich","innsbruck","strasburg","besancon","geneva","turin","grenoble","lyon","dijon","metz"];
	}
        return 1;
      }
    });



    this.importDebater('bullinger-debater', {
      type		:	"bullinger-debater" ,
      name		: 	"Heinrich Bullinger",
      img		:	"BullingerDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Insert in 2nd round of debate in any Language Zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player) {
        if (menu === "debate") {
          return { faction : "protestant" , event : 'bullinger-debater', html : `<li class="option" id="bullinger-debater">substitute Bullinger</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "debate" && his_self.canPlayerCommitDebater("protestant", "bullinger-debater")) {
	  if (his_self.game.state.theological_debate.round === 2) {
            if (faction === "protestant") {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu === "debate") {
	  if (his_self.game.state.theological_debate.attacker === "papacy") {
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater\tbullinger-debater");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater_power\t2");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater_bonus\t2");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tround2_defender_debater\tbullinger-debater");
	  } else {
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tattacker_debater\tbullinger-debater");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tdefender_debater_power\t2");
            his_self.addMove("SETVAR\tstate\tevents\ttheological_debate\tround2_attacker_debater\tbullinger-debater");
	  }
          his_self.endTurn();
        }
        return 0;
      },

    });


    this.importDebater('carlstadt-debater', {
      type		:	"carlstadt-debater" ,
      name		: 	"Andreas Carlstadt",
      img		:	"CarlstadtDebater.svg",
      language_zone	:	"german" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"Target 3 German spaces with Treatise, unrest if fails" ,
      committed		: 	0,
      //
      // implemented in his-player, since provides +1 bonus target for publish treastise in German zone
      //
    });





    ////////////
    // PAPACY //
    ////////////
    this.importDebater('cajetan-debater', {
      type		:	"cajetan-debater" ,
      name		: 	"Thomas Cajetan",
      img		:	"CajetanDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	1 ,
      ability		:	"Target 3 spaces with burn books" ,
      committed		: 	0,
      //
      // ability implemented in his-player.js burnBooks
      //
    });
    this.importDebater('caraffa-debater', {
      type		:	"caraffa-debater" ,
      name		: 	"Carlo Caraffa",
      img		:	"CaraffaDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"Target 3 spaces in any zone with burn books" ,
      committed		: 	0,
      //
      // ability implemented in his-player.js burnBooks
      //
    });


    this.importDebater('eck-debater', {
      type		:	"eck-debater" ,
      name		: 	"Johann Eck",
      img		:       "EckDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die in Debate Attacks" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic
      //
    });
    this.importDebater('gardiner-debater', {
      type		:	"gardiner-debater" ,
      name		: 	"Stephen Gardiner",
      img		:	"GardinerDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die in debate in English zone if attacker" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic
      //
    });

    this.importDebater('aleander-debater', {
      type		:	"aleander-debater" ,
      name		: 	"Hieronymus Aleander",
      img		:       "AleanderDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"If concludes debate, winner flips an extra space" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic - note, can benefit protestants too
      //
    });

    this.importDebater('campeggio-debater', {
      type		:	"campeggio-debater" ,
      name		: 	"Lorenzo Campeggio",
      img		:	"CampeggioDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"Roll die after debate loss; if 5 or 6 result is ignored" ,
      committed		: 	0,
      //
      // implemented in his-gameloop in debate logic
      //
    });





    this.importDebater('loyola-debater', {
      type		:	"loyola-debater" ,
      name		: 	"Ignatius Loyola",
      img		:	"LoyolaDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	4 ,
      ability		:	"Found Jesuit University for only 2 CP" ,
      committed		: 	0,
      //
      // implemented in his-player -- foundJesuitUniversityWithLoyola
      //
    });

    this.importDebater('pole-debater', {
      type		:	"pole-debater" ,
      name		: 	"Reginald Pole",
      img		:	"PoleDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die for Papacy if at Council of Trent" ,
      committed		: 	0,
    });

    this.importDebater('tetzel-debater', {
      type		:	"tetzel-debater" ,
      name		: 	"Johann Tetzel ",
      img		:	"TetzelDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	1 ,
      ability		:	"1 CP to Saint Peters with Burn Books" ,
      committed		: 	0,
      //
      // implemented in his_player
      //
    });






    this.importDebater('canisius-debater', {
      type		:	"canisius-debater" ,
      name		: 	"Peter Canisius",
      img		:	"CanisiusDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+1 die for Counter-Reformation attempts within 2 spaces of Regensburg" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "catholic_counter_reformation") {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'canisius-debater', html : `<li class="option" id="canisius-debater">Peter Canisius +1 Roll</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "catholic_counter_reformation" && his_self.canPlayerCommitDebater("papacy", "canisius-debater")) {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player && ["regensburg","prague","vienna","linz","graz","salzburg","innsbruck","augsburg","worms","nuremberg","leipzig","mainz","kassal"].includes(spacekey)) {
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "catholic_counter_reformation") {
          his_self.addMove("peter_canisius");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] === "peter_canisius") {
	  his_self.commitDebater("papacy", "canisius-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_catholic_counter_reformation_bonus++;
	  his_self.game.state.tmp_catholic_counter_reformation_bonus_spaces = ["regensburg","prague","vienna","linz","graz","salzburg","innsbruck","augsburg","worms","nuremberg","leipzig","mainz","kassal"];
        }
        return 1;
      }
    });





    this.importDebater('contarini-debater', {
      type		:	"contarini-debater" ,
      name		: 	"Gasparo Contarini",
      img		:	"ContariniDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	2 ,
      ability		:	"+1 die for Counter-Reformations within 2 spaces of Charles V" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "catholic_counter_reformation") {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'contarini-debater', html : `<li class="option" id="contarini-debater">Gasparo Contarini +1 Roll</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "catholic_counter_reformation" && his_self.canPlayerCommitDebater("papacy", "contarini-debater")) {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
	    let cx = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	    if (cx) {
	      let targets = [];
	      if (his_self.spaces[cx]) {
	        targets.push(cx);

	        for (let i = 0; i < his_self.spaces[cx].neighbours.length; i++) {

		  let x = his_self.spaces[cx].neighbours[i];
		  if (!targets.includes(x)) { targets.push(x); }

	          for (let ii = 0; ii < his_self.spaces[x].neighbours.length; ii++) {
		    let y = his_self.spaces[x].neighbours[ii];
		    if (!targets.includes(y)) { targets.push(y); }
	  	  }
	        }
	      }
	      if (targets.includes(spacekey)) {
                return 1;
              }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "catholic_counter_reformation") {
          his_self.addMove("gasparo_contarini");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] === "gasparo_contarini") {
	  his_self.commitDebater("papacy", "contarini-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_catholic_counter_reformation_bonus++;

          let cx = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
          if (his_self.spaces[cx]) {
            let targets = [];
            targets.push(cx);

            for (let i = 0; i < his_self.spaces[cx].neighbours.length; i++) {

              let x = his_self.spaces[cx].neighbours[i];
              if (!targets.includes(x)) { targets.push(x); }

              for (let ii = 0; ii < his_self.spaces[x].neighbours.length; ii++) {
                let y = his_self.spaces[x].neighbours[ii];
                if (!targets.includes(y)) { targets.push(y); }
              }
            }
          }

          his_self.game.state.tmp_catholic_counter_reformation_bonus_spaces = targets;
        }
        return 1;
      }
    });

    this.importDebater('faber-debater', {
      type		:	"faber-debater" ,
      name		: 	"Peter Faber",
      img		:	"FaberDebater.svg",
      language_zone	:	"any" ,
      faction		:	"papacy" ,
      power		:	3 ,
      ability		:	"+2 die for Counter-Reformations against an Electorate" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "catholic_counter_reformation") {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'faber-debater', html : `<li class="option" id="faber-debater">Peter Faber +1 Roll</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "catholic_counter_reformation" && his_self.canPlayerCommitDebater("papacy", "faber-debater")) {
          let p = his_self.returnPlayerOfFaction("papacy");
          if (p === his_self.game.player) {
	    if (["augsburg","trier","cologne","wittenberg","mainz","brandenburg"].includes(spacekey)) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "catholic_counter_reformation") {
          his_self.addMove("peter_faber");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "peter_faber") {
	  his_self.commitDebater("papacy", "faber-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_catholic_counter_reformation_bonus++;
	  his_self.game.state.tmp_catholic_counter_reformation_bonus_spaces = ["augsburg","trier","cologne","wittenberg","mainz","brandenburg"];
        }
        return 1;
      }
    });






    ////////////
    // FRENCH //
    ////////////
    this.importDebater('calvin-debater', {
      type		:	"calvin-debater" ,
      name		: 	"John Calvin",
      img		:	"CalvinDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	4 ,
      ability		:	"Target 3 French-speaking spaces with a treatise" ,
      committed		: 	0,
      //
      // implemented in his-player
      //
    });

    this.importDebater('cop-debater', {
      type		:	"cop-debater" , 
     name		: 	"Nicolas Cop",
      img		:	"CopDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation attempts within 2 spaces of Paris" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'cop-debater', html : `<li class="option" id="cop-debater">Nicholas Cop +1 Roll</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "cop-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player && ["paris","stdizier","dijon","orleans","rouen","boulogne","stquentin","calais","brussels","metz","besancon","lyon","tours","nantes"].includes(spacekey)) {
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("nicholas_cop");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "nicholas_cop") {
          his_self.commitDebater("protestant", "cop-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["paris","stdizier","dijon","orleans","rouen","boulogne","stquentin","calais","brussels","metz","besancon","lyon","tours","nantes"];
        }
        return 1;
      }
    });

    this.importDebater('farel-debater', {
      type		:	"farel-debater" ,
      name		: 	"William Farel",
      img		:	"FarelDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation attempts within 2 spaces of Geneva" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'farel-debater', html : `<li class="option" id="farel-debater">William Farel +1 Roll</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "farel-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player && ["geneva","besancon","basel","strasburg","zurich","metz","dijon","lyon","orleans","limoges","avignon","grenoble","turin","milan","pavia","genoa"].includes(spacekey)) {
           return 1;
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("william_farel");
          his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "william_farel") {
          his_self.commitDebater("protestant", "farel-debater");
          his_self.game.queue.splice(qe, 1);
          his_self.game.state.tmp_protestant_reformation_bonus++;
          his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["geneva","besancon","basel","strasburg","zurich","metz","dijon","lyon","orleans","limoges","avignon","grenoble","turin","milan","pavia","genoa"];
        }
        return 1;
      }

    });

    this.importDebater('olivetan-debater', {
      type		:	"olivetan-debater" ,
      name		: 	"Pierre Robert Olivetan",
      img		:	"OlivetanDebater.svg",
      language_zone	:	"french" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"Bonus CP for translation in French Zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_french_language_zone") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'olivetan-debater', html : `<li class="option" id="olivetan-debater">Olivetan +1 Bonus CP</li>` };
          }
        } 
        return {};
      },  
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_french_language_zone"  && his_self.canPlayerCommitDebater("protestant", "olivetan-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 && 
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_french_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tolivetan-debater");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tfrench");
          his_self.endTurn();
          his_self.updateStatus("acknowledge");
        } 
        return 0; 
      },
    });





    /////////////
    // ENGLISH //
    /////////////
    this.importDebater('cranmer-debater', {
      type		:	"cranmer-debater" ,
      name		: 	"Thomas Cranmer",
      img		:	"CranmerDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"+1 die for Reformation within 2 spaces of London" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'cranmer-debater', html : `<li class="option" id="cranmer-debater">Thomas Cranmer +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "cranmer-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["london","portsmouth","norwich","plymouth","bristol","wales","shrewsbury","carlisle","york","lincoln"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("thomas_cranmer");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "thomas_cranmer") {
	  his_self.commitDebater("protestant", "cranmer-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["london","portsmouth","norwich","plymouth","bristol","wales","shrewsbury","carlisle","york","lincoln"];
	}
        return 1;
      }
    });

    this.importDebater('wishart-debater', {
      type		:	"wishart-debater" ,
      name		: 	"George Wishart",
      img		:	"WishartDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"+1 die for Reformation attempts in Scotland" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'wishart-debater', html : `<li class="option" id="wishart-debater">George Wishart +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "wishart-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["stirling","glasgow","edinburgh"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("george_wishart");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "george_wishart") {
	  his_self.commitDebater("protestant", "wishart-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["stirling","glasgow","edinburgh"];
	}
        return 1;
      }
    });

    this.importDebater('latimer-debater', {
      type		:	"latimer-debater" ,
      name		: 	"Hugh Latimer",
      img		:	"LatimerDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	1 ,
      ability		:	"+1 die for Reformation attempts in England" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'latimer-debater', html : `<li class="option" id="latimer-debater">Hugh Latimer +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "latimer-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("hugh_latimer");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "hugh_latimer") {
	  his_self.commitDebater("protestant", "latimer-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich"];
	}
        return 1;
      }
    });

    this.importDebater('knox-debater', {
      type		:	"knox-debater" ,
      name		: 	"John Knox",
      img		:	"KnoxDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	3 ,
      ability		:	"+1 die for Reformation Attempts in England or Scotland" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "protestant_reformation") {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player) {
            return { faction : extra , event : 'knox-debater', html : `<li class="option" id="knox-debater">John Knox +1 Roll</li>` };
          }
        } 
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "protestant_reformation" && his_self.canPlayerCommitDebater("protestant", "knox-debater")) {
	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (p === his_self.game.player && ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich","glasgow","edinburgh","stirling"].includes(spacekey)) { 
           return 1;
          }
        }
        return 0;
      },  
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "protestant_reformation") {
          his_self.addMove("john_knox");
          his_self.endTurn();
        } 
        return 0; 
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "john_knox") {
	  his_self.commitDebater("protestant", "knox-debater");
	  his_self.game.queue.splice(qe, 1);
	  his_self.game.state.tmp_protestant_reformation_bonus++;
	  his_self.game.state.tmp_protestant_reformation_bonus_spaces = ["carlisle","berwick","york","lincoln","shrewsbury","wales","bristol","plymouth","portsmouth","london","norwich","glasgow","edinburgh","stirling"];
	}
        return 1;
      }
    });


    this.importDebater('tyndale-debater', {
      type		:	"tyndale-debater" ,
      name		: 	"William Tyndale",
      img		:	"TyndaleDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Bonus CP for translation in English zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_english_language_zone") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'tyndale-debater', html : `<li class="option" id="tyndale-debater">William Tyndale +1 Bonus CP</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone"  && his_self.canPlayerCommitDebater("protestant", "tyndale-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      }, 
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\ttyndale-debater");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tenglish");
          his_self.endTurn();
        }
        return 0;
      },
    });

    this.importDebater('coverdale-debater', {
      type		:	"coverdale-debater" ,
      name		: 	"Myles Coverdale",
      img		:	"CoverdaleDebater.svg",
      language_zone	:	"english" ,
      faction		:	"protestant" ,
      power		:	2 ,
      ability		:	"Bonus CP for translation in English zone" ,
      committed		: 	0,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "translation_english_language_zone") {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            return { faction : extra , event : 'coverdale-debater', html : `<li class="option" id="coverdale-debater">Myles Coverdale +1 Bonus CP</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone"  && his_self.canPlayerCommitDebater("protestant", "coverdale-debater")) {
          let p = his_self.returnPlayerOfFaction("protestant");
          if (p === his_self.game.player) {
            if (his_self.game.state.players_info[player-1].tmp_debaters_committed_reformation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_translation == 0 &&
              his_self.game.state.players_info[player-1].tmp_debaters_committed_counter_reformation == 0) {
                return 1;
            }
          }
        }
        return 0;
      }, 
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "translation_english_language_zone") {
          his_self.addMove("insert_before_counter_or_acknowledge\tcommit\tprotestant\tcoverdale-debater");
          his_self.addMove("insert_before_counter_or_acknowledge\ttranslation\tenglish");
          his_self.endTurn();
        }
        return 0;
      },
    });


      /***** English Explorers *****/

      this.importExplorer('chancellor', {
           type              :       "chancellor" ,
           name              :       "Chancellor",
           personage         :       true,
           img               :       "Chancellor.svg",
      });

      this.importExplorer('willoughby', {
           type              :       "willoughby" ,
           name              :       "Katherine Willoughby",
           personage         :       true,
           img               :       "Willoughby.svg",
      });

      this.importExplorer('rut', {
           type              :       "rut" ,
           name              :       "John Rut",
           personage         :       true,
           img               :       "Rut.svg",
      });



      /***** French Explorers *****/

      this.importExplorer('cartier', {
           type              :       "cartier" ,
           name              :       "Jacques Cartier",
           personage         :       true,
           img               :       "Cartier.svg",
      });

      this.importExplorer('roberval', {
           type              :       "roberval" ,
           name              :       "Jean-François de La Rocque de Roberval",
           personage         :       true,
           img               :       "Roberval.svg",
      });

      this.importExplorer('verrazano', {
           type              :       "verrazano" ,
           name              :       "Giovanni da Verrazano" ,
           personage         :       true,
           img               :       "Verrazano.svg",
      });



      /***** Hapsburg Explorers *****/

      this.importExplorer('orellana', {
           type              :       "orellana",
           name              :       "Hector Rodrigo Enriquez Orellana",
           personage         :       true,
           img               :       "Orellana.svg",
      });

      this.importExplorer('magellan', {
           type              :       "magellan" ,
           name              :       "Ferdinand Magellan",
           personage         :       true,
           img               :       "Magellan.svg",
      });

      this.importExplorer('leon', {
           type              :       "leon" ,
           name              :       "Leon",
           personage         :       true,
           img               :       "Leon.svg",
      });

      this.importExplorer('narvaez', {
           type              :       "narvaez" ,
           name              :       "Sofia Narvaez",
           personage         :       true,
           img               :       "Narvaez.svg",
      });

      this.importExplorer('de-vaca', {
           type              :       "de-vaca" ,
           name              :       "Cabeza De Vaca",
           personage         :       true,
           img               :       "De_Vaca.svg",
      });

      this.importExplorer('de-soto', {
           type              :       "de-soto" ,
           name              :       "DeSoto",
           personage         :       true,
           img               :       "DeSoto.svg",
      });



    this.importNavyLeader('barbarossa', {
      type		:	"barbarossa" ,
      name		: 	"Barbarossa",
      personage		:	true,
      navy_leader	:	true,
      img		:	"Barbarossa.svg",
      battle_rating	:	2,
      piracy_rating	:	1,
    });
 
    this.importNavyLeader('dragut', {
      type		:	"dragut" ,
      name		: 	"Dragut",
      personage		:	true,
      navy_leader	:	true,
      img		:	"Dragut.svg",
      battle_rating	:	1,
      piracy_rating	:	2,
    });
 
    this.importNavyLeader('andrea-dorea', {
      type		:	"andrea-dorea" ,
      name		: 	"Andrea Dorea",
      personage		:	true,
      navy_leader	:	true,
      img		:	"Andrea_Dorea.svg",
      battle_rating	:	2,
      piracy_rating	:	0,
    });
 


      this.importReformer('calvin-reformer', {
           type              :       "calvin-reformer" ,
           name              :       "John Calvin",
           reformer          :       true,
           img               :       "CalvinReformer.svg",
	   spacekey	     :	     "geneva",
      });

      this.importReformer('cranmer-reformer', {
           type              :       "cranmer-reformer" ,
           name              :       "Thomas Cranmer ",
           reformer          :       true,
           img               :       "CranmerReformer.svg",
	   spacekey	     :	     "london",
      });

      this.importReformer('luther-reformer', {
           type              :       "luther-reformer" ,
           name              :       "Martin Luther",
           reformer          :       true,
           img               :       "LutherReformer.svg",
	   spacekey	     :	     "wittenberg",
      });

      this.importReformer('zwingli-reformer', {
           type              :       "zwingli-reformer" ,
           name              :       "Huldrych Zwingli",
           reformer          :       true,
           img               :       "ZwingliReformer.svg",
	   spacekey	     :	     "zurich",
      });


    this.importUnit('regular', {
      type		:	"regular" ,
      name		: 	"Regular",
    });
 
    this.importUnit('mercenary', {
      type		:	"mercenary" ,
      name		: 	"Mercenary",
    });
 
    this.importUnit('cavalry', {
      type		:	"cavalry" ,
      name		: 	"Cavalry",
    });
 
    this.importUnit('squadron', {
      type		:	"squadron" ,
      name		: 	"Squadron" ,
      land_or_sea	:	"sea" ,
    });

    this.importUnit('corsair', {
      type		:	"corsair" ,
      name		: 	"Corsair" ,
      land_or_sea	:	"sea" ,
    });

    this.importUnit('debater', {
      type		:	"debater" ,
      name		: 	"Debater",
      debater		:	true,
    });
 
    this.importUnit('reformer', {
      type		:	"reformer" ,
      name		: 	"Reformer",
      reformer		:	true,
    });
 





    this.importWife('anne-boleyn', {
      type		:	"anne-boleyn" ,
      name		: 	"Anne Boleyn",
      personage		:	true,
      img		:	"AnneBoleyn.svg",
    });

    this.importWife('anne-cleves', {
      type		:	"anne-cleves" ,
      name		: 	"Anne Cleves",
      personage		:	true,
      img		:	"AnneCleves.svg",
    });

    this.importWife('catherine-aragon', {
      type		:	"catherine-aragon" ,
      name		: 	"Catherine Aragon",
      personage		:	true,
      img		:	"CatherinAragon.svg",
    });

    this.importWife('jane-seymour', {
      type		:	"jane-seymour" ,
      name		: 	"Jane Seymour",
      personage		:	true,
      img		:	"JaneSeymour.svg",
    });

    this.importWife('katherine-parr', {
      type		:	"katherine-parr" ,
      name		: 	"Katherine Parr",
      personage		:	true,
      img		:	"KatherineParr.svg",
    });

    this.importWife('kathryn-howard', {
      type		:	"kathryn-howard" ,
      name		: 	"Kathryn Howard",
      personage		:	true,
      img		:	"KathrynHoward.svg",
    });


    let first_time_running = 0;

    //
    // initialize
    //
    if (!this.game.state) {

      first_time_running = 1;
      this.game.state = this.returnState();
      this.game.state.players_info = this.returnPlayers(this.game.players.length);
      this.game.spaces = this.returnSpaces();
      this.game.navalspaces = this.returnNavalSpaces();

console.log("PLAYERS INFO: " + JSON.stringify(this.game.state.players_info));

console.log("\n\n\n\n");
console.log("---------------------------");
console.log("---------------------------");
console.log("------ INITIALIZE GAME ----");
console.log("---------------------------");
console.log("---------------------------");
console.log("---------------------------");
console.log("DECK: " + this.game.options.deck);
console.log("\n\n\n\n");

      this.updateStatus("<div class='status-message' id='status-message'>Generating the Game</div>");

      //
      // Game Queue
      //
      this.game.queue.push("round");
      this.game.queue.push("READY");

      let deck2 = JSON.parse(JSON.stringify(this.deck));
      delete deck2['001'];
      delete deck2['002'];
      delete deck2['003'];
      delete deck2['004'];
      delete deck2['005'];
      delete deck2['006'];
      delete deck2['007'];
      delete deck2['008'];

//      this.game.queue.push("DECK\t1\t"+JSON.stringify(deck2));
     this.game.queue.push("DECK\t1\t"+JSON.stringify({})); 
     this.game.queue.push("init");

    }

    //
    // attach events to spaces
    //
    this.spaces = {};
    for (let key in this.game.spaces) {
      this.spaces[key] = this.importSpace(this.game.spaces[key], key);
    }

    //
    // add initial units
    //
    if (first_time_running == 1) {

      //
      // 1517 scenario
      //
      if (this.game.state.scenario == "1517") {

        //
        // 2P variant
        //
        if (this.game.players.length == 2) {

	  // OTTOMAN
          this.addRegular("ottoman", "istanbul", 1);
          this.addRegular("ottoman", "edirne");
          this.addRegular("ottoman", "salonika", 1);
          this.addRegular("ottoman", "athens", 1);
	  this.addRegular("ottoman", "buda", 1);
	  this.addRegular("ottoman", "belgrade", 1);

	  // HAPSBURG
          this.addRegular("hapsburg", "seville", 1);
          this.addRegular("hapsburg", "barcelona", 1);
          this.addRegular("hapsburg", "navarre", 1);
          this.addRegular("hapsburg", "tunis", 1);
          this.controlSpace("hapsburg", "tunis", 1);
          this.addRegular("hapsburg", "naples", 2);
          this.addNavalSquadron("hapsburg", "naples", 2);
          this.addRegular("hapsburg", "besancon", 1);
          this.addRegular("hapsburg", "brussels", 1);
          this.addRegular("hapsburg", "vienna", 4);
          this.addRegular("hapsburg", "antwerp", 3);
	  this.addRegular("hapsburg", "valladolid");


	  // ENGLAND
          this.addRegular("england", "london", 1);
          this.addRegular("england", "calais", 1);
          this.addRegular("england", "york", 1);
          this.addRegular("england", "bristol", 1);

	  // FRANCE
          this.addRegular("france", "paris", 1);
          this.addRegular("france", "rouen", 1);
          this.addRegular("france", "bordeaux", 1);
          this.addRegular("france", "lyon", 1);
          this.addRegular("france", "marseille", 1);
          this.addNavalSquadron("france", "marseille", 1);
          this.addRegular("france", "milan", 2);

	  // PAPACY
          this.addRegular("papacy", "rome", 1);
          this.addNavalSquadron("papacy", "rome", 1);
          this.addRegular("papacy", "ravenna", 1);
	
	  // PROTESTANT
	
	  // VENICE
          this.addRegular("venice", "venice", 2);
          this.addNavalSquadron("venice", "venice", 3);
          this.addRegular("venice", "corfu", 1);
          this.addRegular("venice", "candia", 1);
	
	  // GENOA
          this.addNavyLeader("genoa", "genoa", "andrea-doria");
          this.addNavalSquadron("genoa", "genoa", 1);
          this.addRegular("genoa", "genoa", 2);
	
	  // SCOTLAND
          this.addRegular("scotland", "edinburgh", 1);
	
	  // INDEPENDENT
          this.addRegular("independent", "rhodes", 1);
          this.addRegular("independent", "metz", 1);
          this.addRegular("independent", "florence", 1);
	
	  // DEBATERS
	  this.addDebater("papacy", "eck-debater");
	  this.addDebater("papacy", "campeggio-debater");
	  this.addDebater("papacy", "aleander-debater");
	  this.addDebater("papacy", "tetzel-debater");
	  this.addDebater("papacy", "cajetan-debater");

	  this.addDebater("protestant", "luther-debater");
	  this.addDebater("protestant", "melanchthon-debater");
	  this.addDebater("protestant", "bucer-debater");
	  this.addDebater("protestant", "carlstadt-debater");

	  // CUSTOMIZED CONTROL
	  this.controlSpace("hapsburg", "prague");
	  this.controlSpace("hapsburg", "brunn");
	  this.controlSpace("hapsburg", "breslau");
	  this.controlSpace("ottoman", "buda");
	  this.controlSpace("ottoman", "belgrade");
	  this.controlSpace("ottoman", "ragusa");

	  this.setAllies("hungary", "hapsburg");

	} else {

	  // OTTOMAN
          this.addArmyLeader("ottoman", "istanbul", "suleiman");
          this.addArmyLeader("ottoman", "istanbul", "ibrahim-pasha");
          this.addRegular("ottoman", "istanbul", 7);
          this.addCavalry("ottoman", "istanbul", 1);
          this.addNavalSquadron("ottoman", "istanbul", 1);
          this.addRegular("ottoman", "edirne");
          this.addRegular("ottoman", "salonika", 1);
          this.addNavalSquadron("ottoman", "salonika", 1);
          this.addRegular("ottoman", "athens", 1);
          this.addNavalSquadron("ottoman", "athens", 1);

	  // HAPSBURG
	  this.addArmyLeader("hapsburg", "valladolid", "charles-v");
	  this.addArmyLeader("hapsburg", "valladolid", "duke-of-alva");
          this.addRegular("hapsburg", "seville", 1);
          this.addNavalSquadron("hapsburg", "seville", 1);
          this.addRegular("hapsburg", "barcelona", 1);
          this.addNavalSquadron("hapsburg", "barcelona", 1);
          this.addRegular("hapsburg", "navarre", 1);
          this.addRegular("hapsburg", "tunis", 1);
          this.addRegular("hapsburg", "naples", 2);
          this.addNavalSquadron("hapsburg", "naples", 2);
          this.addRegular("hapsburg", "besancon", 1);
          this.addRegular("hapsburg", "brussels", 1);
	  this.addArmyLeader("hapsburg", "vienna", "ferdinand");
          this.addRegular("hapsburg", "vienna", 4);
          this.addRegular("hapsburg", "antwerp", 3);

	  // ENGLAND
          this.addArmyLeader("england", "london", "henry-viii");
          this.addArmyLeader("england", "london", "charles-brandon");
          this.addRegular("england", "london", 3);
          this.addNavalSquadron("england", "london", 1);
          this.addNavalSquadron("england", "portsmouth", 1);
          this.addRegular("england", "calais", 2);
          this.addRegular("england", "york", 1);
          this.addRegular("england", "bristol", 1);

	  // FRANCE
          this.addArmyLeader("france", "paris", "francis-i");
          this.addArmyLeader("france", "paris", "montmorency");
          this.addRegular("france", "paris", 4);
          this.addRegular("france", "rouen", 1);
          this.addNavalSquadron("france", "rouen", 1);
          this.addRegular("france", "bordeaux", 2);
          this.addRegular("france", "lyon", 1);
          this.addRegular("france", "marseille", 1);
          this.addNavalSquadron("france", "marseille", 1);
          this.addRegular("france", "milan", 2);

	  // PAPACY
          this.addRegular("papacy", "rome", 1);
          this.addNavalSquadron("papacy", "rome", 1);
          this.addRegular("papacy", "ravenna", 1);
	
	  // PROTESTANT
	
	  // VENICE
          this.addRegular("venice", "venice", 2);
          this.addNavalSquadron("venice", "venice", 3);
          this.addRegular("venice", "corfu", 1);
          this.addRegular("venice", "candia", 1);
	
	  // GENOA
          this.addNavyLeader("genoa", "genoa", "andrea-doria");
          this.addNavalSquadron("genoa", "genoa", 1);
          this.addRegular("genoa", "genoa", 2);
	
	  // SCOTLAND
          this.addRegular("scotland", "edinburgh", 3);
          this.addNavalSquadron("scotland", "edinburgh", 1);
	
	  // INDEPENDENT
          this.addRegular("independent", "rhodes", 1);
          this.addRegular("independent", "metz", 1);
          this.addRegular("independent", "florence", 1);
	
	  // DEBATERS
	  this.addDebater("papacy", "eck-debater");
	  this.addDebater("papacy", "campeggio-debater");
	  this.addDebater("papacy", "aleander-debater");
	  this.addDebater("papacy", "tetzel-debater");
	  this.addDebater("papacy", "cajetan-debater");

	  this.addDebater("protestant", "luther-debater");
	  this.addDebater("protestant", "melanchthon-debater");
	  this.addDebater("protestant", "bucer-debater");
	  this.addDebater("protestant", "carlstadt-debater");

	}

      }

      //
      // 1532 scenario
      //
      if (this.game.state.scenario === "1532") {

      }

      if (this.game.state.scenario === "tournament") {

      }

    }

    //
    // and show the board
    //
    this.displayBoard();

  }



  render(app) {

    if (this.browser_active == 0) { return; }

    super.render(app);

    let game_mod = this;

    //
    //
    //
    if (!this.game.state) {
      this.game.state = this.returnState();
    }

    //
    // preload images
    //
    this.preloadImages();


    // required here so menu will be proper
    try {
      if (this.app.options.gameprefs.hereistand_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    } catch (err) {}

    this.menu.addMenuOption("game-game", "Game");
    let initial_confirm_moves = "Newbie Mode"; 
    if (this.confirm_moves == 1) {
      initial_confirm_moves = "Expert Mode"; 
    }
    this.menu.addSubMenuOption("game-game", {
      text : initial_confirm_moves,
      id : "game-confirm",
      class : "game-confirm",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	if (game_mod.confirm_moves == 0) {
	  game_mod.confirm_moves = 1;
          game_mod.saveGamePreference('his_expert_mode', 0);
	  window.location.reload();	
	} else {
	  game_mod.confirm_moves = 0;
          game_mod.saveGamePreference('his_expert_mode', 1);
	  window.location.reload();	
	}
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Log",
      id : "game-log",
      class : "game-log",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.log.toggleLog();
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.handleStatsMenu();
      }
    });
    this.menu.addMenuOption("game-info", "Info");
    this.menu.addSubMenuOption("game-info", {
      text: "Units",
      id: "game-units",
      class: "game-units",
      callback: function(app, game_mod){
	game_mod.menu.hideSubMenus();
        game_mod.units_overlay.render();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text: "Faction Cards",
      id: "game-faction-cards",
      class: "game-faction-cards",
      callback: function(app, game_mod){
        game_mod.menu.showSubSubMenu("game-faction-cards");
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text: "Action Cards",
      id: "game-cards",
      class: "game-cards",
      callback: function(app, game_mod){
        game_mod.menu.showSubSubMenu("game-cards");
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text: "Diplomatic Cards",
      id: "game-diplomatic",
      class: "game-diplomatic",
      callback: function(app, game_mod){
        game_mod.menu.showSubSubMenu("game-diplomatic");
      }
    });
    this.menu.addSubMenuOption("game-diplomatic", {
      text : "My Hand",
      id : "game-my-dhand",
      class : "game-my-dhand",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("dhand");
      }
    });
    this.menu.addSubMenuOption("game-diplomatic", {
      text : "All Cards",
      id : "game-all-diplomatic",
      class : "game-add-diplomatic",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("diplomatic");
      }
    });
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "Papacy",
      id : "game-papacy-cards",
      class : "game-papacy-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("papacy") == game_mod.game.player) {
          game_mod.deck_overlay.render("hand");
	  return;
	}
        game_mod.deck_overlay.render("papacy");
      }
    });
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "Protestant",
      id : "game-protestant-cards",
      class : "game-protestant-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("protestant") == game_mod.game.player) {
          game_mod.deck_overlay.render("hand");
	  return;
	}
        game_mod.deck_overlay.render("protestant");
      }
    });
if (this.game.players.length > 2) {
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "England",
      id : "game-england-cards",
      class : "game-england-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("england") == game_mod.game.player) {
          game_mod.deck_overlay.render("hand");
	  return;
	}
        game_mod.deck_overlay.render("england");
      }
    });
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "France",
      id : "game-france-cards",
      class : "game-france-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("france") == game_mod.game.player) {
          game_mod.deck_overlay.render("hand");
	  return;
	}
        game_mod.deck_overlay.render("france");
      }
    });
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "Hapsburg",
      id : "game-hapsburg-cards",
      class : "game-hapsburg-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("hapsburg") == game_mod.game.player) {
          game_mod.deck_overlay.render("hand");
	  return;
	}
        game_mod.deck_overlay.render("hapsburg");
      }
    });
    this.menu.addSubMenuOption("game-faction-cards", {
      text : "Ottoman",
      id : "game-ottoman-cards",
      class : "game-ottoman-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
	if (game_mod.returnPlayerOfFaction("ottoman") == game_mod.game.player) {
          game_mod.deck_overlay.render("hand");
	  return;
	}
        game_mod.deck_overlay.render("ottoman");
      }
    });
}
    this.menu.addSubMenuOption("game-cards", {
      text : "My Hand",
      id : "game-my-hand",
      class : "game-my-hand",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("hand");
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Discards",
      id : "game-discards",
      class : "game-discards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("discards");
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "All Cards",
      id : "game-all-cards",
      class : "game-all-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("all");
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Unplayed",
      id : "game-unplayed-cards",
      class : "game-unplayed-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("unplayed");
      }
    });
    this.menu.addSubMenuOption("game-cards", {
      text : "Removed",
      id : "game-removed-cards",
      class : "game-removed-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.deck_overlay.render("removed");
      }
    });

    this.menu.addSubMenuOption("game-info", {
      text : "Field Battle",
      id : "game-field-battle",
      class : "game-field_battle",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.field_battle_overlay.renderFortification();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "Religion",
      id : "game-religious-conflict",
      class : "game-religious-conflict",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.religious_overlay.render();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "Debaters",
      id : "game-debaters",
      class : "game-debaters",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.displayDebaters();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "Explorers",
      id : "game-explorers",
      class : "game-explorers",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.displayExplorers();
      }
    });
    this.menu.addSubMenuOption("game-info", {
      text : "Conquistadors",
      id : "game-conquistadors",
      class : "game-conquistadors",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.displayConquistadors();
      }
    });

    this.menu.addMenuOption("game-factions", "Factions");
    this.menu.addSubMenuOption("game-factions", {
      text : "Hapsburgs",
      id : "game-hapsburgs",
      class : "game-hapsburgs",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("hapsburg");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "England",
      id : "game-england",
      class : "game-england",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("england");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "France",
      id : "game-france",
      class : "game-france",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("france");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Ottoman Empire",
      id : "game-ottoman",
      class : "game-ottoman",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("ottoman");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Protestants",
      id : "game-protestants",
      class : "game-protestants",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("protestant");
      }
    });
    this.menu.addSubMenuOption("game-factions", {
      text : "Papacy",
      id : "game-papacy",
      class : "game-papacy",
      callback : function(app, game_mod) {
        game_mod.faction_overlay.render("papacy");
      }
    });

    this.menu.addChatMenu();
    this.menu.render();
    this.log.render();
    this.cardbox.render();

    //
    // add card events -- text shown and callback run if there
    //
    this.cardbox.addCardType("showcard", "", null);
    this.cardbox.addCardType("card", "select", this.cardbox_callback);
    if (app.browser.isMobileBrowser(navigator.userAgent)) {
      this.cardbox.skip_card_prompt = 0;
    }

    //
    // position cities / spaces / etc
    //
    let spaces = this.returnSpaces();
    for (let key in spaces) {
      if (spaces.hasOwnProperty(key)) {
	try {
	  let obj = document.getElementById(key);
	  obj.style.top = spaces[key].top + "px";
	  obj.style.left = spaces[key].left + "px";
        } catch (err) {
	}
      }
    }

    //
    // position pregnancy chart
    //
    let pregnancies = this.returnPregnancyChart();
    for (let key in pregnancies) {
      if (pregnancies.hasOwnProperty(key)) {
	try {
          let idname = "pregnancy"+key;
	  let obj = document.getElementById(idname);
	  obj.style.top = pregnancies[key].top + "px";
	  obj.style.left = pregnancies[key].left + "px";
        } catch (err) {
	}
      }
    }

    //
    // position diplomacy chart
    //
    let d = this.returnDiplomacyTable();
    for (let key in d) {
      if (d.hasOwnProperty(key)) {
	try {
          for (let key2 in d[key]) {
	    divname = key + "_" + key2;
	    let obj = document.getElementById(divname);
	    obj.style.top = d[key][key2].top + "px";
	    obj.style.left = d[key][key2].left + "px";
	  }
        } catch (err) {
	}
      }
    }
    this.game.diplomacy = d;



    //
    // position electorate display
    //
    let elec = this.returnElectorateDisplay();
    for (let key in elec) {
      if (elec.hasOwnProperty(key)) {
        try {
          let obj = document.getElementById(`ed_${key}`);
          obj.style.top = elec[key].top + "px";
          obj.style.left = elec[key].left + "px";
        } catch (err) {
        }
      }
    }



    try {

      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        //this.hammer.render();
      } else {
	let his_self = this;
        this.sizer.render();
        this.sizer.attachEvents('#gameboard');
	//
	// sizer makes draggable 
	//
        //$('#gameboard').draggable({
	//  stop : function(event, ui) {
	//    his_self.saveGamePreference((his_self.returnSlug()+"-board-offset"), ui.offset);
	//  }
	//});
	//
      }

    } catch (err) {}

    this.hud.render();

    this.displayBoard();

  }





  popup(card) {

    let c = null;
    if (!c && this.game.deck[0]) { c = this.game.deck[0].cards[card]; }
    if (!c && this.game.deck[1]) { c = this.game.deck[1].cards[card]; }
    if (!c && this.debaters) { 
      c = this.debaters[card];
      if (c) { return `<span class="showcard ${card}" id="${card}">${c.name}</span>`; }
    }
    if (!c) {
      // catches Here I Stand -- first event before DEAL
      let x = this.returnDeck();
      if (x[card]) { c = x[card]; }
    }
    if (c) { 
      if (c.name) {
        return `<span class="showcard ${card}" id="${card}">${c.name}</span>`;
      }
    }
    return `<span class="showcard ${card}" id="${card}">${card}</span>`;
  }

  returnNewCardsForThisTurn(turn = 1) {

    let deck = this.returnDeck();
    let new_deck = {};

    for (let key in deck) {
      if (key != "001" && key != "002" && key != "003" && key != "004" && key != "005" && key != "006" && key != "007" && key != "008") {
        if (deck[key].turn === turn) {
	  new_deck[key] = deck[key];
        }
      }
    }

    return new_deck;

  }

  returnNewDiplomacyCardsForThisTurn(turn = 1) {

    let deck = this.returnDiplomaticDeck();
    let new_deck = {};

    for (let key in deck) {
      if (deck[key].turn === turn) {
        new_deck[key] = deck[key];
      }
    }

    if (turn == (this.game.state.events.schmalkaldic_league_round+1)) {
        new_deck['213'] = deck['213'];
        new_deck['214'] = deck['214'];
        new_deck['215'] = deck['215'];
        new_deck['216'] = deck['216'];
        new_deck['217'] = deck['217'];
        new_deck['218'] = deck['218'];
        new_deck['219'] = deck['219'];
    }

    return new_deck;

  }

  returnDiplomaticDeck() {

    let deck = {};

    deck['201'] = { 
      img : "cards/HIS-201.svg" , 
      name : "Andrea Doria" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	if (faction === "papacy") {

          let f = his_self.returnAllyOfMinorPower("genoa");
	  if (f != "papacy") {
            his_self.deactivateMinorPower(f, "genoa");
            his_self.activateMinorPower("papacy", "genoa");
	    his_self.updateLog("Papacy allies with Genoa");
	  } else {
	    his_self.game.queue.push("andrea_dorea_placement\tpapacy");
	  }

	}

	if (faction === "protestant") {

          let f = his_self.returnAllyOfMinorPower("genoa");
	  if (f != "france") {
            his_self.deactivateMinorPower(f, "genoa");
            his_self.activateMinorPower("france", "genoa");
	    his_self.updateLog("France allies with Genoa");
	  } else {
	    his_self.game.queue.push("andrea_dorea_placement\tprotestant");
	  }

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "andrea_doria_placement") {

	  let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

          his_self.game.queue.splice(qe, 1);

	  if (player == his_self.game.player) {
          his_self.playerSelectSpaceWithFilter(

            "Select Genoa Home Space for 4 Regulars",

            function(space) {
              if (space.home == "genoa") { return 1; }
	      return 0;
            },

            function(spacekey) {
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.endTurn();
            }, 

	    null, 

	    true

          );
	  } else {
	    this.updateStatus("Genoa adding 4 Regulars");
	  }

          return 0;
        }
	return 1;
      }
    }
    deck['202'] = { 
      img : "cards/HIS-202.svg" , 
      name : "French Constable Invades" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.setEnemies("france", "papacy");

	let p = his_self.returnPlayerOfFaction("protestant");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select French-Controlled Space for Invasion Force",

            function(space) {
	      if (his_self.isSpaceControlled(space, "france")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("french_constable_invades\t"+spacekey);
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\tmontmorency");
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            },

	    null ,

	    true 
          );

          return 0;

	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "french_constable_invades") {

	  let spacekey = mv[1];
          his_self.game.queue.splice(qe, 1);

	  //
	  // 2P game, so france get activated under protestant control
	  //
	  his_self.addMove("set_activated_powers\tprotestant\tfrance");
	  his_self.addMove("declare_war\tpapacy\tfrance");


 	  let msg = "Additional Military Support:";
          let html = '<ul>';
          html += '<li class="option" id="squadron">1 squadron in French home port</li>';
          html += '<li class="option" id="mercenaries">2 more mercenaries in '+spacekey+'</li>';
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");
	    if (action === "squadron") {

              his_self.playerSelectSpaceWithFilter(

                "Select French Home Port",

                function(space) {
                  if (space.ports.length > 0 && space.home == "france") {
                    return 1;
                  }
                },

                function(spacekey) {
		  his_self.updateStatus("French build squadrons in" + his_self.returnSpaceName(spacekey));
                  his_self.addMove("build\tland\tfrench\t"+"squadron"+"\t"+spacekey);
                  his_self.endTurn();
                },

		null ,

		true

              );
	    }
	    if (action === "mercenaries") {
	      his_self.updateStatus("French add mercenaries in" + his_self.returnSpaceName(spacekey));
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
	    }

	  });

	  return 0;
	}

        return 1;

      },
    }
    deck['203'] = { 
      img : "cards/HIS-203.svg" , 
      name : "Corsair Raid" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	let opponent_faction = "protestant";
	if (faction === "protestant") { opponent_faction = "papacy"; }

	let d1 = his_self.rollDice(6);
	let d2 = his_self.rollDice(6);
	let d3 = his_self.rollDice(6);
	let d4 = his_self.rollDice(6);

	let hits = 0;

	if (d1 >= 5) { hits++; }
	if (d2 >= 5) { hits++; }
	if (d3 >= 5) { hits++; }
	if (d4 >= 5) { hits++; }

	his_self.updateLog(`${his_self.popup('203')} rolls ` + hits + " hits ["+d1+","+d2+","+d3+","+d4+"]");

        if (his_self.game.player == p) {
	  for (let i = hits-1; i >= 0; i--) {
	    his_self.addMove("corsair_raid\t"+opponent_faction+"\t"+(i+1));
	  }
	  his_self.addMove(`NOTIFY\t${his_self.popup('203')} rolls ${hits} hits`);
	  his_self.endTurn();
	}
	
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "corsair_raid") {

	  // faction is victim
	  let faction = mv[1];
	  let num = parseInt(mv[2]);

	  if (num == 1) { num == "1st"; }
	  if (num == 2) { num == "2nd"; }
	  if (num == 3) { num == "3rd"; }
	  if (num == 4) { num == "4th"; }

	  let player = his_self.returnPlayerOfFaction(faction);

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player == player) {

 	    let msg = "Corsair Raid: "+num+" hit:";
            let html = '<ul>';
            html += '<li class="option" id="discard">discard card</li>';
            html += '<li class="option" id="eliminate">eliminate squadron</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

  	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action === "eliminate") {

                his_self.playerSelectSpaceOrNavalSpaceWithFilter(

                  `Select Space to Remove Naval Squadron` ,

 	          function(space) {
		    if (faction === "papacy") {
		      for (let key in space.units) {
		        if (key === "papacy" || his_self.isAlliedMinorPower(key, "papacy")) {
		  	  for (let i = 0; i < space.units[key].length; i++) {
			    if (space.units[key][i].type === "squadron") { return 1; }
		          }
		        }
		      }
		    }
		    if (faction === "protestant") {
		      for (let key in space.units) {
		        if (key === "france" || key === "ottoman") {
		  	  for (let i = 0; i < space.units[key].length; i++) {
			    if (space.units[key][i].type === "squadron") { return 1; }
		          }
		        }
		      }
		    }
	            return 0;
                  },

                  function(spacekey) {

		    let land_or_sea = "land";
		    let space = null;

	            if (his_self.game.navalspaces[spacekey]) {
		      land_or_sea = "sea";
		      space = his_self.game.navalspaces[spacekey];
	            } else {
		      space = his_self.game.spaces[spacekey];
	            }

		    if (faction === "papacy") {
		      for (let key in space.units) {
		        if (key === "papacy" || his_self.isAlliedMinorPower(key, "papacy")) {
		  	  for (let i = 0; i < space.units[key].length; i++) {
			    if (space.units[key][i].type === "squadron") {
  	    		      $('.option').off();
			      his_self.updateStatus("Papacy removes squadron");
          	  	      his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction+"\t"+"squadron"+"\t"+spacekey+"\t"+his_self.game.player);
          	  	      his_self.addMove("NOTIFY\tPapacy removes squadron from "+his_self.returnSpaceName(spacekey));
          	  	      his_self.endTurn();
			      return 0;
			    }
		          }
		        }
		      }
		    }

		    if (faction === "protestant") {
		      for (let key in space.units) {
		        if (key === "france" || key === "ottoman") {
			  for (let i = 0; i < space.units[key].length; i++) {
			    if (space.units[key][i].type === "squadron") {
  	    		      $('.option').off();
			      his_self.updateStatus("Protestants remove squadron");
          	  	      his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction+"\t"+"squadron"+"\t"+spacekey+"\t"+his_self.game.player);
          	  	      his_self.addMove("NOTIFY\tProtestant removes squadron from "+his_self.returnSpaceName(spacekey));
          	  	      his_self.endTurn();
			      return 0;
			    }
		          }
		        }
		      }
		    }

  	    	    $('.option').off();
		    his_self.updateStatus("No Squadrons Available to Remove");
	            his_self.addMove("NOTIFY\tNo Squadrons Available to Remove");
		    his_self.endTurn();
		    return 0;
		  },

		  null,

		  true

                );

	      }

	      if (action === "discard") {
		his_self.addMove("discard_random\t"+faction);
          	his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " discards card");
		his_self.endTurn();
	      }

	    });
	  }
	  return 0;
	}
        return 1;
      }
    }
    deck['204'] = { 
      img : "cards/HIS-204.svg" , 
      name : "Diplomatic Marriage" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player == p) {

	  let mp = his_self.returnMinorPowers();
	  let ca = [];
	  let cd = [];

	  for (let i = 0; i < mp.length; i++) {
	    if (his_self.canFactionActivateMinorPower(faction, mp[i])) {
	      if (his_self.returnAllyOfMinorPower(mp[i]) == faction) {
	        ca.push(mp[i]);
	      } else {
	        cd.push(mp[i]);
	      }
	    }
	  }
	
	  let msg = 'Activate or De-activate a Minor Power?';
    	  let html = '<ul>';
	  for (let i = 0; i < ca.length; i++) {
            html += `<li class="option" id="${ca[i]}">activate ${ca[i]}</li>`;
	  }
	  for (let i = 0; i < cd.length; i++) {
            html += `<li class="option" id="${cd[i]}">deactivate ${cd[i]}</li>`;
	  }
          html += `<li class="option" id="skip">skip</li>`;
          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");

	    if (action === "skip") { his_self.endTurn(); return 0; }

	    if (ca.includes(action)) {
	      his_self.addMove("activate_minor_power\t"+faction+"\t"+action);
	    } else {
	      his_self.addMove("deactivate_minor_power\t"+faction+"\t"+action);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['205'] = { 
      img : "cards/HIS-205.svg" , 
      name : "Diplomatic Pressure" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	if (faction === "papacy") {
	  his_self.game.queue.push("diplomatic_pressure_reveal\tpapacy\tprotestant");
	}

	if (faction === "protestant") {
	  his_self.game.queue.push("diplomatic_pressure_reveal\tprotestant\tpapacy");
	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "diplomatic_pressure_reveal") {

          let faction_taking = mv[1];
          let faction_giving = mv[2];

          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);

          if (his_self.game.player === p2) {
	    if (faction_taking === "protestant") {
              his_self.addMove("diplomatic_pressure_results_protestant\t"+JSON.stringify(his_self.game.deck[1].hand));
	    } else {
              his_self.addMove("diplomatic_pressure_results_papacy\t"+JSON.stringify(his_self.game.deck[1].hand));
	    }
            his_self.endTurn();
          }

          his_self.game.queue.splice(qe, 1);
          return 0;
	}


        if (mv[0] === "diplomatic_pressure_results_papacy") {

          let cards = JSON.parse(mv[1]);

          his_self.game.queue.splice(qe, 1);
	  // also remove protestant card (which is next)
          his_self.game.queue.splice(qe, 1);
	  
	  if (his_self.game.player === his_self.returnPlayerOfFaction("papacy")) {

   	    let msg = "Choose Protestant Card:";
            let html = '<ul>';
	    for (let i = 0; i < cards.length; i++) {
              html += `<li class="option showcard" id="${cards[i]}">${his_self.game.deck[1].cards[cards[i]].name}</li>`;
	    }
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

  	    $('.option').off();
	    $('.option').on('click', function () {
  	      $('.option').off();
	      let action = $(this).attr("id");
              his_self.addMove("diplomacy_card_event\tprotestant\t"+action);
              his_self.addMove("discard_diplomacy_card\tprotestant\t"+action);
	      his_self.addMove("DEAL\t2\t"+(his_self.returnPlayerOfFaction("protestant"))+"\t1");
	      his_self.addMove("NOTIFY\tPapacy selects "+his_self.popup(action));
	      his_self.endTurn();
	    });

  	  }

          return 0;
        }

        if (mv[0] === "diplomatic_pressure_swap_cards") {

	  let papacy_card = mv[1];
	  let protestant_card = mv[2];

	  if (his_self.returnPlayerOfFaction("papacy") == his_self.game.player) {
	    for (let i = 0; i < his_self.game.deck[1].hand.length; i++) {
	      if (his_self.game.deck[1].hand[i] == papacy_card) {
		his_self.game.deck[1].hand.splice(i, 1);
	      }
	    }
	    his_self.game.deck[1].hand.push(protestant_card);
	  }
	  if (his_self.returnPlayerOfFaction("protestant") == his_self.game.player) {
	    for (let i = 0; i < his_self.game.deck[1].hand.length; i++) {
	      if (his_self.game.deck[1].hand[i] == protestant_card) {
		his_self.game.deck[1].hand.splice(i, 1);
	      }
	    }
	    his_self.game.deck[1].hand.push(papacy_card);
	  }

          his_self.game.queue.splice(qe, 1);

	  return 1;

	}

        if (mv[0] === "diplomatic_pressure_results_protestant") {

          let cards = JSON.parse(mv[1]);

 	  let msg = "Papal Card is "+his_self.popup(cards[0]);
          let html = '<ul>';
          html += `<li class="option" id="discard">discard ${his_self.game.deck[1].cards[cards[0]].name}</li>`;
          html += `<li class="option" id="swap">swap ${his_self.game.deck[1].cards[cards[0]].name}</li>`;
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

  	    $('.option').off();
	    let action = $(this).attr("id");

	    if (action === "discard") {
	      his_self.addMove("DEAL\t2\t"+(his_self.returnPlayerOfFaction("protestant"))+"\t1");
              his_self.addMove("discard_diplomacy_card\tpapacy\t"+cards[0]);
	      his_self.addMove("NOTIFY\tProtestants discard "+his_self.popup(cards[0]));
	      his_self.endTurn();
	    }

	    if (action === "swap") {
	      his_self.addMove("diplomatic_pressure_swap_cards\t"+cards[0]+"\t"+his_self.game.deck[1].hand[0]);
	      his_self.addMove("NOTIFY\tProtestants swap Diplomacy Cards");
	      his_self.endTurn();
	    }

	  });

          his_self.game.queue.splice(qe, 1);
          return 0;
	}

        return 1;

      },
    }
    deck['206'] = { 
      img : "cards/HIS-206.svg" , 
      name : "French Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.setEnemies("france", "papacy");

	let p = his_self.returnPlayerOfFaction("protestant");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select French-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "france")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("french_invasion\t"+spacekey);
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
	      if (his_self.game.state.leaders.francis_i) {
                his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\tfrancis-i");
              } else {
		his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\thenry-ii");
              }
	      his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            },

	    null,

	    true 

          );

	}

        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "french_invasion") {

	  let spacekey = mv[1];
          his_self.game.queue.splice(qe, 1);

	  //
	  // 2P card, so french get activated under protestant control
	  //
	  his_self.addMove("set_activated_powers\tprotestant\tfrance");
	  his_self.addMove("declare_war\tpapacy\tfrance");

	  let player = his_self.returnPlayerOfFaction("protestant");
	  if (his_self.game.player == player) {

 	    let msg = "Choose Option:";
            let html = '<ul>';
            html += '<li class="option" id="squadron">1 squadron in French home port</li>';
            html += '<li class="option" id="mercenaries">2 more mercenaries in '+spacekey+'</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");
	      if (action === "squadron") {

                his_self.playerSelectSpaceWithFilter(

                  "Select French Home Port",

                  function(space) {
                    if (space.ports.length > 0 && space.home == "france") {
                      return 1;
                    }
                  },

                  function(spacekey) {
		    his_self.updateStatus("French add Squadrons in " + his_self.returnSpaceName(spacekey));
                    his_self.addMove("build\tland\tfrance\t"+"squadron"+"\t"+spacekey);
                    his_self.addMove("build\tland\tfrance\t"+"squadron"+"\t"+spacekey);
                    his_self.endTurn();
                  },

		  null,

		  true

                );
	      }
	      if (action === "mercenaries") {
                his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
                his_self.endTurn();
	      }
	    });
	  } else {
	    his_self.updateLog("Protestants playing " + his_self.popup("206"));
	  }
	  return 0;
	}

        return 1;

      },
    }
    deck['207'] = { 
      img : "cards/HIS-207.svg" , 
      name : "Henry Petitions for Divorce" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");
	if (his_self.game.player == p) {

          let msg = his_self.popup("207") + " played for Diplomatic Event";
          let html = '<ul>';
          html += '<li class="option" id="grant">Grant Divorce</li>';
          html += '<li class="option" id="refuse">Refuse Divorce</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let action = $(this).attr("id");
            $('.option').off();

	    if (action === "grant") {
	      his_self.updateStatus("Papacy grants divorce...");
	      his_self.addMove("player_call_theological_debate\tpapacy");
	      his_self.addMove("henry_petitions_for_divorce_grant");
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+faction);
              his_self.addMove(`DEAL\t1\t${p}\t1`);
	      his_self.endTurn();
	    }

	    if (action === "refuse") {
	      his_self.updateStatus("Papacy refuses divorce...");
	      his_self.addMove("henry_petitions_for_divorce_refuse\t3");
	      his_self.addMove("henry_petitions_for_divorce_refuse\t2");
	      his_self.addMove("henry_petitions_for_divorce_refuse\t1");
	      his_self.endTurn();
	    }

	  });
	}

	return 0;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "henry_petitions_for_divorce_grant") {

          his_self.game.queue.splice(qe, 1);
	  his_self.game.state.events.henry_petitions_for_divorce_grant = 1;

	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (his_self.game.player == p) {

            his_self.playerSelectSpaceWithFilter(

              "Select Hapsburg-Controlled Italian Space" ,

              (space) => {
                if (his_self.isSpaceControlled(space.key, "hapsburg") && space.language === "italian") { return 1; }
		return 0;
	      },

              (spacekey) => {
                his_self.addMove("build\tland\tpapacy\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\tpapacy\t"+"mercenary"+"\t"+spacekey);
	        his_self.endTurn();
	      },

    	      null ,

	      true
    
	    );

	  } else {
	    his_self.updateStatus("Protestants selecting Italian space for reinforcements");
	  }

	  return 0;
	}


        if (mv[0] === "henry_petitions_for_divorce_refuse") {

          his_self.game.queue.splice(qe, 1);

	  let num = parseInt(mv[1]);

	  if (num == 1) { num = "1st"; }
	  if (num == 2) { num = "2nd"; }
	  if (num == 3) { num = "3rd"; }

	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player == player) {
            his_self.playerSelectSpaceWithFilter(

              `Select Hapsburg-Controlled Space to add ${num} Regular` ,

              function(space) {
	        if (space.type == "electorate" && his_self.game.state.events.schmalkaldic_league == 0) { return 0; }
                if (his_self.isSpaceControlled(space.key, "hapsburg")) { return 1; }
	        return 0;
              },

              function(spacekey) {
                his_self.addMove("build\tland\thapsburg\tregular\t"+spacekey);
          	his_self.endTurn();
              },

              null, 

	      true

	    );
	  }

	  return 0;
	}
	return 1;
      }
    }
    deck['208'] = { 
      img : "cards/HIS-208.svg" , 
      name : "Knights of St. John" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	his_self.game.queue.push("knights-of-saint-john\t"+faction);
	his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
        his_self.game.queue.push(`DEAL\t1\t${p}\t1`);

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "knights-of-saint-john") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (player == his_self.game.player) {

            let fhand_idx = his_self.returnFactionHandIdx(player, faction);
            let c = his_self.game.deck[0].fhand[fhand_idx][his_self.game.deck[0].fhand[fhand_idx].length-1];
	    let card = his_self.game.deck[0].cards[c];
	    let ops = card.ops;

	    his_self.addMove("build_saint_peters_with_cp\t"+ops);
	    his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" pulls "+his_self.popup(c)+ " "+ops+" CP");
	    his_self.endTurn();

	  }

	  return 0;
        }

	return 1;	
      }
    }
    deck['209'] = { 
      img : "cards/HIS-209.svg" , 
      name : "Plague" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } , 
      onEvent : function(his_self, faction) {
	his_self.game.queue.push("plague\t"+faction+"\t3");
	his_self.game.queue.push("plague\t"+faction+"\t2");
	his_self.game.queue.push("plague\t"+faction+"\t1");
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "plague") {

console.log("hitting plague in loop...");

	  let faction = mv[1];
	  let num = parseInt(mv[2]);
	  let player = his_self.returnPlayerOfFaction(faction);
	  let opponent_faction = "protestant";
	  if (faction === "protestant") { opponent_faction = "papacy"; }

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player != player) { return 0; }

	  if (num == 1) { num = "1st"; }
	  if (num == 2) { num = "2nd"; }
	  if (num == 3) { num = "3rd"; }

console.log("about to select space or naval space with filter...");

          his_self.playerSelectSpaceOrNavalSpaceWithFilter(

            `Select Space to Remove ${num} Unit` ,

            function(space) {
	      let anything_here = false;
	      for (let key in space.units) {
		if (space.units[key].length > 0) {
		  for (let z = 0; z < space.units[key].length; z++) {
		    let u = space.units[key][z];
		    if (u.type === "regular") { return 1; }
		    if (u.type === "mercenary") { return 1; }
		    if (u.type === "cavalry") { return 1; }
		    if (u.type === "corsair") { return 1; }
		    if (u.type === "squadron") { return 1; }
		  }
		}
	      }
	      return 0;
            },

            function(spacekey) {

console.log("plague select space done: " + spacekey);

	      let land_or_sea = "land";
	      let space = null;

	      if (his_self.game.navalspaces[spacekey]) {
		land_or_sea = "sea";
		space = his_self.game.navalspaces[spacekey];
	      } else {
		space = his_self.game.spaces[spacekey];
	      }
	   
	      if (space == null) {
		alert("ERROR: not sure where you clicked - reload to continue");
		return 1;
	      }
	      
   	      let msg = "Choose Faction to Destroy Unit:";
              let html = '<ul>';
	      let u = 0;
              if (space.units["hapsburg"].length) { u++; html += '<li class="option" id="hapsburg">hapsburgs</li>'; }
              if (space.units["france"].length) { u++; html += '<li class="option" id="france">france</li>'; }
              if (space.units["england"].length) { u++; html += '<li class="option" id="england">england</li>'; }
              if (space.units["papacy"].length) { u++; html += '<li class="option" id="papacy">papacy</li>'; }
              if (space.units["protestant"].length) { u++; html += '<li class="option" id="protestant">protestant</li>'; }
              if (space.units["ottoman"].length) { u++; html += '<li class="option" id="ottoman">ottoman</li>'; }
              if (space.units["hungary"].length) { u++; html += '<li class="option" id="hungary">hungary</li>'; }
              if (space.units["venice"].length) { u++; html += '<li class="option" id="venice">venice</li>'; }
              if (space.units["scotland"].length) { u++; html += '<li class="option" id="scotland">scotland</li>'; }
              if (space.units["genoa"].length) { u++; html += '<li class="option" id="genoa">genoa</li>'; }
              if (space.units["independent"].length) { u++; html += '<li class="option" id="independent">independent</li>'; }
    	      html += '</ul>';

console.log("about to update status with options");

              his_self.updateStatusWithOptions(msg, html);

   	      $('.option').off();
	      $('.option').on('click', function () {

console.log("in parent click function in plague...");
   	        $('.option').off();

	        let faction_to_destroy = $(this).attr("id");
   	        let msg = "Destroy Which Unit: ";
                let unittypes = [];
		let unit_destroyed = 0;
                let html = '<ul>';
		let du = -1;
                for (let i = 0; i < space.units[faction_to_destroy].length; i++) {
                  if (space.units[faction_to_destroy][i].command_value == 0) {
		    if (!unittypes.includes(space.units[faction_to_destroy][i].unittype)) {
		      if (du == -1) { du = i; } else { du = -2; }
  		      html += `<li class="option nonskip" id="${space.units[faction_to_destroy][i].type}">${space.units[faction_to_destroy][i].type}</li>`;
		      unittypes.push(space.units[faction_to_destroy][i].unittype);
		    }
		  }
		}
  		html += `<li class="option" id="skip">skip</li>`;
    	        html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

   	        $('.option').off();
	        $('.option').on('click', function () {

console.log("in click function from plague...");

   	          $('.option').off();
	          let unittype = $(this).attr("id");
		  if (unit_destroyed == 1) { return; }	
		  unit_destroyed = 1;

		  if (unittype === "skip") {
          	    his_self.endTurn();
		    return 0;
		  }

          	  his_self.removeUnit(faction_to_destroy, spacekey, unittype);
		  his_self.displaySpace(spacekey);
		  if (num === "3rd") { 
		    his_self.updateStatus("submitted");
		    his_self.addMove("discard_random\t"+opponent_faction);
		  }

		  console.log("!!!");
		  console.log("!!! plague unit removal");
		  console.log("!!!");
          	  console.log("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	  his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	  his_self.endTurn();
		});

		// auto-submit if only 1 choice
		if (du > -1) { 

console.log("du is > -1 so autoclick nonskip");

$('.nonskip').click(); }

              });

	      // auto-submit if only 1 choice
	      if (u == 1) {

console.log("u is 1 so autoclick option");

 $('.option').click(); 

console.log("done u=1 autoclick");
}

	    },

            null, 

	    true

	  );

          return 0;

	}

	return 1;
      },
    }
    deck['210'] = { 
      img : "cards/HIS-210.svg" , 
      name : "Shipbuilding" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } , 
      onEvent(his_self, faction) {
        his_self.game.queue.push("shipbuilding_diplomacy_event\t"+faction);
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
    
        if (mv[0] == "shipbuilding_diplomacy_event") {
    
          his_self.game.queue.splice(qe, 1);
                        
          let faction = mv[1];
          let player = his_self.returnPlayerOfFaction(faction);
                    
          if (his_self.game.player === player) { 
    
            if (faction === "papacy") {

              //
              // pick port under Papal control
              //
              his_self.playerSelectSpaceWithFilter(

                "Select Space to add 2 Squadrons" ,

                  (space) => {
                    if (his_self.isSpaceControlled(space.key, "papacy")) {
		      if (space.ports.length > 0) {
			return 1;
		      }
		    }
		    return 0;
		  },

                  (spacekey) => {
                    let space = his_self.game.spaces[spacekey];
                    his_self.addMove("build\tland\tpapacy\t"+"squadron"+"\t"+spacekey);
                    his_self.addMove("build\tland\tpapacy\t"+"squadron"+"\t"+spacekey);
		    his_self.endTurn();
		  },

		  null ,

		  true
    
	      );

            }       
    
            if (faction === "protestant") {
                        
              let msg = "Add 2 Naval Squadrons Where?";
              let html = '<ul>';
              html += '<li class="option" id="french">French - Marseille</li>';
              html += '<li class="option" id="hapsburg">Hapsburg - Naples</li>';
              html += '<li class="option" id="ottoman">Ottoman - any home port</li>';
              html += '<li class="option" id="skip">skip</li>';
              html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {

                let action = $(this).attr("id");

		if (action === "skip") {
		  his_self.addMove("Protestants do not build any squadrons");
		  his_self.endTurn();
		}

		if (action === "hapsburg") {
                  his_self.addMove("build\tland\thapsburg\t"+"squadron"+"\tnaples");
                  his_self.addMove("build\tland\thapsburg\t"+"squadron"+"\tnaples");
		  his_self.endTurn();
		}

		if (action === "french") {
                  his_self.addMove("build\tland\tfrance\t"+"squadron"+"\tmarseille");
                  his_self.addMove("build\tland\tfrance\t"+"squadron"+"\tmarseille");
		  his_self.endTurn();
		}

		if (action === "ottoman") {
                  //
                  // pick any Ottoman home port
                  //
                  his_self.playerSelectSpaceWithFilter(

                    "Select Ottoman-Controlled Home Port to add 2 Squadrons" ,

                    (space) => {
                      if (his_self.isSpaceControlled(space.key, "ottoman")) {
		        if (space.ports.length > 0) {
			  return 1;
		        }
		      }
		      return 0;
		    },

                    (spacekey) => {
                      let space = his_self.game.spaces[spacekey];
                      his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
                      his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
		      his_self.endTurn();
		    },

		    null ,

		    true
    
	          );

		}

              });

            }

          }
	  return 0;

	}
	return 1;
      },
    }
    deck['211'] = { 
      img : "cards/HIS-211.svg" , 
      name : "Spanish Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let controlling_power = "papacy";

	//
	// prior to League formation
	//
	if (his_self.game.state.events.schmalkaldic_league != 1) {
	  controlling_power = "protestant";
	  his_self.setEnemies("papacy","hapsburg");
	}

	let controlling_player = his_self.returnPlayerOfFaction(controlling_power);

	//
	// remember who controls the invasion
	//
	his_self.game.state.events.spanish_invasion = controlling_power;

	//
	// controlling power gets 1 card
	//
        his_self.game.queue.push(`DEAL\t1\t${controlling_player}\t1`);
	his_self.game.queue.push("spanish_invasion_land\t"+controlling_player+"\t"+controlling_power);

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "spanish_invasion_land") {

          his_self.game.queue.splice(qe, 1);

	  let controlling_player = parseInt(mv[1]);
	  let controlling_power = mv[2];

	  if (his_self.game.player === controlling_player) {

  	    //
	    // 2P card, so french get activated under protestant control
	    //
	    his_self.addMove("set_activated_powers\t"+controlling_power+"\thapsburg");
	    his_self.addMove("declare_war\t"+controlling_power+"\thapsburg");

            his_self.playerSelectSpaceWithFilter(

              "Select Hapsburg-Controlled Space for Invasion Force",

              function(space) {
	        if (his_self.isSpaceControlled(space, "hapsburg")) { return 1; }
	        return 0;
              },

              function(spacekey) {

	        //
	        // move Duke of Alva, add regulars
	        //
                let ak = his_self.returnSpaceOfPersonage("hapsburg", "duke-of-alva");
                let ak_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "duke-of-alva", ak);
          
                his_self.addMove("spanish_invasion_naval\t"+controlling_player+"\t"+spacekey);
		if (ak_idx == -1) {
                  his_self.addMove("add_army_leader" + "\t" + "hapsburg" + "\t" + spacekey + "\t" + "duke-of-alva");
		} else {
                  his_self.addMove("moveunit" + "\t" + "hapsburg" + "\t" + "land" + "\t" + ak + "\t" + ak_idx + "\t" + "land" + "\t" + spacekey);
		}
	        his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
	        his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
	        his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
	        his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
                his_self.endTurn();
              },

	      null,

	      true

            );
	  }

          return 0;

	}
        if (mv[0] == "spanish_invasion_naval") {

          his_self.game.queue.splice(qe, 1);

	  let controlling_player = parseInt(mv[1]);
	  let land_spacekey = mv[2];

	  if (his_self.game.player === controlling_player) {

            let msg = "Add Additional Units:";
            let html = '<ul>';
            html += '<li class="option" id="squadron">Naval Squadron</li>';
            html += '<li class="option" id="mercenaries">+2 Mercenaries</li>';
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              let action = $(this).attr("id");
              $('.option').off();

	      if (action === "squadron") {

                his_self.playerSelectSpaceWithFilter(

                  "Select Hapsburg-Controlled Port for Squadron",

                  function(space) {
	            if (his_self.isSpaceControlled(space, "hapsburg") && space.home == "hapsburg" && space.ports.length > 0) { return 1; }
	            return 0;
                  },

                  function(spacekey) {
                    his_self.addMove("build\tland\thapsburg\t"+"squadron"+"\t"+spacekey);
                    his_self.endTurn();
		  },

		  null ,

		  true
                );
	      }

	      if (action === "mercenaries") {
	        his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+land_spacekey);
	        his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+land_spacekey);
		his_self.endTurn();
	      }

            });
	  }

	  return 0;

	}

	return 1;
      },
    }
    deck['212'] = { 
      img : "cards/HIS-212.svg" , 
      name : "Venetian Alliance" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let ally = his_self.returnAllyOfMinorPower("venice");

	if (ally == "") {
	  his_self.activateMinorPower("papacy", "venice");
	}
	if (ally == "hapsburg") {
	  his_self.deactivateMinorPower("hapsburg", "venice");
	}
        if (ally === "papacy") {
	  his_self.game.queue.push("venetian_alliance_placement");
	}

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "venetian_alliance_placement") {

          his_self.game.queue.splice(qe, 1);
	  if (his_self.game.player == his_self.returnPlayerOfFaction("papacy")) {  
            his_self.playerSelectSpaceWithFilter(

              "Select Papal-Controlled Port not under Siege",

              function(space) {
	        if (his_self.isSpaceControlled(space, "papacy") && space.ports.length > 0 && !space.besieged) { return 1; }
	        return 0;
              },

              function(spacekey) {
	        his_self.addMove("build\tland\tvenice\t"+"regular"+"\t"+spacekey);
                his_self.addMove("build\tland\tvenice\t"+"squadron"+"\t"+spacekey);
                his_self.addMove("build\tland\tvenice\t"+"squadron"+"\t"+spacekey);
                his_self.endTurn();
              }
            );
            return 0;
          } else {
	    his_self.updateStatus("Papacy executing " + his_self.popup("212"));
	  }

	  return 0;
	}

	return 1;

      },

    }
    deck['213'] = { 
      img : "cards/HIS-213.svg" , 
      name : "Austrian Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; }, 
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select Hapsburg-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "hapsburg")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"papacy");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tpapacy\t"+spacekey+"\tferdinand");
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

	}

        return 0;
      },
    }
    deck['214'] = { 
      img : "cards/HIS-214.svg" , 
      name : "Imperial Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select Hapsburg-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "hapsburg")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"papacy");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tpapacy\t"+spacekey+"\tcharles-v");
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

	}

        return 0;
      },
    }
    deck['215'] = { 
      img : "cards/HIS-215.svg" , 
      name : "Machiavelli" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let vp = his_self.calculateVictoryPoints();
	let winner = "protestant";

	if (vp["protestant"].vp > vp["papacy"].vp) { winner = "papacy"; }
	if (vp["protestant"].vp == vp["papacy"].vp) { winner = faction; }

	//
	// TODO -- cannot pick an invasion card played earlier this turn
	//
        let msg = "Select Invasion Card:";
        let html = '<ul>';
        html += '<li class="option" id="ottoman">Ottoman Invasion</li>';
        html += '<li class="option" id="imperial">Imperial Invasion</li>';
        html += '<li class="option" id="austrian">Austrian Invasion</li>';
        html += '<li class="option" id="spanish">Spanish Invasion</li>';
        html += '<li class="option" id="french">French Invasion</li>';
        html += '<li class="option" id="constable">French Constable Invades</li>';
        html += '</ul>';

        his_self.updateStatusWithOptions(msg, html);

        $('.option').off();
        $('.option').on('click', function () {

          let action = $(this).attr("id");

          let card = "";

	  if (action === "ottoman") {
            card = "216";
	  }

	  if (action === "imperial") {
            card = "214";
	  }

	  if (action === "austrian") {
            card = "213";
	  }

	  if (action === "spanish") {
            card = "211";
	  }

	  if (action === "french") {
            card = "206";
	  }

	  if (action === "constable") {
            card = "202";
	  }

	  his_self.addMove("reshuffle_diplomacy_deck");
	  his_self.addMove("diplomacy_card_event\t"+winner+"\t"+card);
	  his_self.endTurn();

	});

        return 0;
      },
    }
    deck['216'] = { 
      img : "cards/HIS-216.svg" , 
      name : "Ottoman Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");
	his_self.setEnemies("ottoman", "papacy");

	if (his_self.game.player == p) {

  	  //
	  // 2P card, so ottoman get activated under protestant control
	  //
	  his_self.addMove("set_activated_powers\tprotestant\tottoman");
	  his_self.addMove("declare_war\tpapacy\tottoman");

          his_self.playerSelectSpaceWithFilter(

            `Select Ottoman-Controlled Port for ${his_self.popup("216")}`,

            function(space) {
	      if (his_self.isSpaceControlled(space, "ottoman") && space.ports.length > 0) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tottoman\t"+spacekey+"\tsuleiman");
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.endTurn();
            },

	    null,

	    true 

          );

	}

        return 0;
      },
    }
    deck['217'] = { 
      img : "cards/HIS-217.svg" , 
      name : "Secret Protestant Circle" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");
	let d = his_self.rollDice(6);

	if (d <= 3) {
	  his_self.game.queue.push("secret_protestant_circle\tspanish");
	  his_self.game.queue.push("secret_protestant_circle\titalian");
	} else {
	  his_self.game.queue.push("secret_protestant_circle\titalian");
	}

        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "secret_protestant_circle") {

	  let zone = mv[1];
	  let player = his_self.returnPlayerOfFaction("protestant");
	  if (player === his_self.game.player) {

            his_self.playerSelectSpaceWithFilter(

              "Select Space to Convert Protestant" ,

              function(space) {
                if (space.language === zone) { return 1; }
	        return 0;
              },

              function(spacekey) {
                his_self.addMove("convert\t"+spacekey+"\tprotestant");
                his_self.endTurn();
              }
            );
	  }
	  
          his_self.game.queue.splice(qe, 1);
          return 0;
        }
	return 1;
      }
    }
    deck['218'] = { 
      img : "cards/HIS-218.svg" , 
      name : "Siege of Vienna" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let lockdown = ["regensburg","salzburg","linz","prague","breslau","brunn","vienna","graz","trieste","agram","pressburg","buda"];
	for (let i = 0; i < lockdown.length; i++) {
	  for (let z = 0; z < his_self.game.spaces[lockdown[i]].units["hapsburg"].length; z++) {
	    his_self.game.spaces[lockdown[i]].units["hapsburg"][z].locked = 1;
	  }
	  for (let z = 0; z < his_self.game.spaces[lockdown[i]].units["hungary"].length; z++) {
	    his_self.game.spaces[lockdown[i]].units["hungary"][z].locked = 1;
	  }
	}

	let spaces = his_self.returnSpacesWithFilter(
          function(spacekey) {
            if (his_self.returnFactionLandUnitsInSpace("papacy", spacekey)) { return true; }
            if (his_self.returnFactionLandUnitsInSpace("hungary", spacekey)) { return true; }
	    return false;
	  }
	);

	his_self.game.queue.push("siege_of_vienna\t"+faction+"\t2");
	his_self.game.queue.push("siege_of_vienna\t"+faction+"\t1");

        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "siege_of_vienna") {

	  let faction = mv[1];
	  let num = parseInt(mv[2]);
	  let player = his_self.returnPlayerOfFaction(faction);

	  let lockdown = ["regensburg","salzburg","linz","prague","breslau","brunn","vienna","graz","trieste","agram","pressburg","buda"];

	  if (player == his_self.game.player) {

 	    let msg = `${his_self.popup("218")}: remove unit #${num}:`;
            let html = '<ul>';
            html += '<li class="option" id="hapsburg">remove hapsburg unit</li>';
            html += '<li class="option" id="hungary">remove hungarian unit</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);


   	    $('.option').off();
	    $('.option').on('click', function () {

	      let action = $(this).attr("id");

	      if (action === "hapsburg") {

                let spaces = his_self.returnSpacesWithFilter(
                  function(spacekey) {
	            if (!lockdown.includes(spacekey)) { return false; }
                    if (his_self.returnFactionLandUnitsInSpace("hapsburg", spacekey)) { return true; }
                    return false;
                  } 
                );

                his_self.playerSelectSpaceWithFilter(

                  "Select Space to Remove Unit" ,

                  function(space) {
                    if (spaces.includes(space.key)) { return 1; }
	            return 0;
                  },

                  function(spacekey) {

		    let has_mercenary = false;
		    let has_regular = false;
		    let has_cavalry = false;

		    for (let i = 0; i < his_self.game.spaces[spacekey].units["hapsburg"].length; i++) {
		      if (his_self.game.spaces[spacekey].units["hapsburg"][i].type === "mercenary") { has_mercenary = true; }
		      if (his_self.game.spaces[spacekey].units["hapsburg"][i].type === "regular") { has_regular = true; }
		      if (his_self.game.spaces[spacekey].units["hapsburg"][i].type === "cavalry") { has_cavalry = true; }
		    }

   	            let msg = "Choose Unit to Destroy:";
                    let html = '<ul>';
                    if (has_regular) { html += '<li class="option" id="regular">hapsburg regular</li>'; }
                    if (has_mercenary) { html += '<li class="option" id="mercenary">hapsburg mercenary</li>'; }
                    if (has_cavalry) { html += '<li class="option" id="cavalry">hapsburg cavalry</li>'; }
    	            html += '</ul>';

                    his_self.updateStatusWithOptions(msg, html);

   	            $('.option').off();
	            $('.option').on('click', function () {

		      let unittype = $(this).attr("id");
          	      his_self.removeUnit("hapsburg", spacekey, unittype);
		      his_self.displaySpace(spacekey);
          	      his_self.addMove("remove_unit\tland\thapsburg\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	      his_self.endTurn();
		    });
                  },

		  null, 

		  true
                );

              } // end hapsburg


	      if (action === "hungary") {

                let spaces = his_self.returnSpacesWithFilter(
                  function(spacekey) {
	            if (!lockdown.includes(spacekey)) { return false; }
                    if (his_self.returnFactionLandUnitsInSpace("hungary", spacekey)) { return true; }
                    return false;
                  } 
                );

                his_self.playerSelectSpaceWithFilter(

                  "Select Space to Remove Unit" ,

                  function(space) {
                    if (spaces.includes(space.key)) { return 1; }
	            return 0;
                  },

                  function(spacekey) {

		    let has_mercenary = false;
		    let has_regular = false;
		    let has_cavalry = false;

		    for (let i = 0; i < his_self.game.spaces[spacekey].units["hungary"].length; i++) {
		      if (his_self.game.spaces[spacekey].units["hungary"][i].type === "mercenary") { has_mercenary = true; }
		      if (his_self.game.spaces[spacekey].units["hungary"][i].type === "regular") { has_regular = true; }
		      if (his_self.game.spaces[spacekey].units["hungary"][i].type === "cavalry") { has_cavalry = true; }
		    }

   	            let msg = "Choose Unit to Destroy:";
                    let html = '<ul>';
                    if (has_regular) { html += '<li class="option" id="regular">hungarian regular</li>'; }
                    if (has_mercenary) { html += '<li class="option" id="mercenary">hungarian mercenary</li>'; }
                    if (has_cavalry) { html += '<li class="option" id="cavalry">hungarian cavalry</li>'; }
    	            html += '</ul>';

                    his_self.updateStatusWithOptions(msg, html);

   	            $('.option').off();
	            $('.option').on('click', function () {

		      let unittype = $(this).attr("id");
          	      his_self.removeUnit("hungary", spacekey, unittype);
		      his_self.displaySpace(spacekey);
          	      his_self.addMove("remove_unit\tland\thungary\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	      his_self.endTurn();
		    });
                  },

		  null, 

		  true
                );

              } // end hapsburg
            });

	  } // player

          his_self.game.queue.splice(qe, 1);
          return 0;

	} // siege_of_vienna

	return 1;
      }
    }
    deck['219'] = { 
      img : "cards/HIS-219.svg" , 
      name : "Spanish Inquisition" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	if (faction === "papacy") {
	  his_self.game.queue.push("spanish_inquisition_reveal");
	}

	if (faction === "protestant") {
	  his_self.game.queue.push("request_reveal_hand\tprotestant\tpapacy");
	  his_self.game.queue.push("NOTIFY\tProtestants play Spanish Inquisition");
   	}

        return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "spanish_inquisition_reveal") {

          if (his_self.game.player === his_self.returnPlayerOfFaction("protestant")) {
            his_self.addMove("spanish_inquisition_results\t"+JSON.stringify(his_self.game.deck[1].hand));
            his_self.endTurn();
          }

          his_self.game.queue.splice(qe, 1);
          return 0;
	}


        if (mv[0] === "spanish_inquisition_results") {

          let cards = JSON.parse(mv[2]);

          his_self.game.queue.splice(qe, 1);
	  // remove protestant play 
          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player === his_self.returnPlayerOfFaction("papacy")) {


   	    let msg = "Choose Protestant Card to Discard:";
            let html = '<ul>';
	    for (let i = 0; i < cards.length; i++) {
              html += `<li class="option" id="${i}">${his_self.game.deck[1].cards[cards[i]].name}</li>`;
	    }
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

  	    $('.option').off();
	    $('.option').on('click', function () {

  	      $('.option').off();
	      let action = $(this).attr("id");

	      let chosen_card = action;
	      let unchosen_card = "";
	      for (let i = 0; i < cards.length; i++) { if (cards[i] != action) { unchosen_card = cards[i]; } }

              his_self.addMove("diplomacy_card_event\tprotestant\t"+unchosen_card);
              his_self.addMove("discard_diplomacy_card\tprotestant\t"+chosen_card);
	      his_self.addMove("DEAL\t2\t"+(his_self.returnPlayerOfFaction("protestant"))+"\t1");
	      his_self.addMove("NOTIFY\tPapacy selects "+his_self.game.deck[1].cards[action].name+" to discard");
	      his_self.endTurn();

	    });

  	  }

          return 0;
        }

        return 1;

      },
    }

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;

  }


  removeCardFromGame(card) {
    if (!this.game.state.removed.includes(card)) { this.game.state.removed.push(card); }
    try { delete this.game.deck[0].cards[card]; } catch (err) {}
    try { delete this.game.deck[0].discards[card]; } catch (err) {}
  }


  returnDeck() {

    var deck = {};

    /// HOME CARDS
    deck['001'] = { 
      img : "cards/HIS-001.svg" , 
      name : "Janissaries" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "ottoman" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_field_battle_hits_assignment") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('001')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '001', html : `<li class="option" id="001">janissaries (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "pre_field_battle_hits_assignment") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('001')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "pre_field_battle_hits_assignment") {
          his_self.addMove("janissaries");
	  his_self.endTurn();
	  his_self.updateStatus("acknowledge");
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "janissaries") {

          his_self.game.queue.splice(qe, 1);
	  his_self.updateLog("Ottoman Empire plays "+his_self.popup('001'));
	  his_self.game.state.field_battle.attacker_rolls += 5;
	  his_self.game.state.field_battle.attacker_results.push(his_self.rollDice(6));

	  return 1;

        }

	return 1;

      },
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {
	alert("Not implemented");
      },

    }
    deck['002'] = { 
      img : "cards/HIS-002.svg" , 
      name : "Holy Roman Emperor" ,
      ops : 5 ,
      turn : 1 , 
      type : "normal" ,
      faction : "hapsburg" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        if (his_self.isBesieged("hapsburg", "charles-v")) { return 0; }
        if (his_self.isCaptured("hapsburg", "charles-v")) { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let ck = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	let ak = his_self.returnSpaceOfPersonage("hapsburg", "duke-of-alva");
	let ck_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "charles-v", ck);
	let ak_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "duke-of-alva", ak);
	
        his_self.playerSelectSpaceWithFilter(

	  "Select Destination for Charles V: ",

	  function(space) {
		if (
		  space.home === "hapsburg" &&
		  !his_self.isSpaceControlled(space, "hapsburg")
	        ) {
		  return 1;
	        }
		return 0;
	  },

	  function(spacekey) {

		if (ak === ck && ak !== "") {

		  let msg = "Move Duke of Alva with Charles V?";
    		  let html = '<ul>';
        	  html += '<li class="option" id="yes">yes</li>';
        	  html += '<li class="option" id="no">no</li>';
    		  html += '</ul>';

    		  his_self.updateStatusWithOptions(msg, html);

	          $('.option').off();
	          $('.option').on('click', function () {
	            let action = $(this).attr("id");
		    if (action === "yes") {
		      his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		      his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ak_key + "\t" + ak_idx + "\t" + "land" + spacekey);
		      his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ck_key + "\t" + ck_idx + "\t" + "land" + spacekey);
		      his_self.endTurn();
		    } else {
		      his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		      his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ck_key + "\t" + ck_idx + "\t" + "land" + spacekey);
		      his_self.endTurn();
		    }
		  });

		} else {
		  his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		  his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ck_key + "\t" + ck_idx + "\t" + "land" + spacekey);
		  his_self.endTurn();
		}

	  },

	  null

	);

        return 0;
      },
    }
    deck['003'] = { 
      img : "cards/HIS-003.svg" , 
      name : "Six Wives of Henry VIII" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "england" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['004'] = { 
      img : "cards/HIS-004.svg" , 
      name : "Patron of the Arts" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "french" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.leaders.francis_i == 1) {
	  if (!his_self.isCaptured("france", "francis-i")) { return 1; }
	}
	return 0;
      },
      onEvent : function(his_self, faction) {
	his_self.game.queue.push("patron-of-the-arts");
	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "patron-of-the-arts") {

          his_self.game.queue.splice(qe, 1);

	  let roll = his_self.rollDice(6);

	  his_self.updateLog("France rolls " + roll + " for "+his_self.popup('004'));

	  if (his_self.isSpaceControlled("milan", "france")) {
	    his_self.updateLog("French control Milan - roll adjusted to 6");
	    roll = 6;
	  };

	  //
	  // France wins 1 VP
	  //
	  if (roll >= 3) {
	    if (his_self.game.state.french_chateaux_vp < 6) {
	      his_self.updateLog("France gains 1VP from "+his_self.popup('004'));
	      his_self.game.state.french_chateaux_vp++;
              his_self.displayVictoryPoints();
	    }
	  }

          return 1;

        }

	return 1;
      },
    }
    if (this.game.players.length == 2) {
      deck['005'] = { 
        img : "cards/HIS-005.svg" , 
        name : "Papal Bull" ,
        ops : 4 ,
        turn : 1 ,
        type : "normal" ,
        faction : "papacy" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
        canEvent : function(his_self, faction) {
	  return 1;
        },
        onEvent : function(his_self, faction) {

	  let papacy = his_self.returnPlayerOfFaction("papacy");

	  if (papacy == his_self.game.player) {

            let msg = "Excommunicate Protestant Reformer:";
	    let reformer_exists = 0;
            let html = '<ul>';
	    for (let key in his_self.reformers) {
	      let s = his_self.returnSpaceOfPersonage("protestant", key);
	      if (s) {
	        reformer_exists = 1;
                html += `<li class="option" id="${key}">${his_self.reformers[key].name}</li>`;
	      }
	    }
	
	    if (reformer_exists == 0) {

              let msg = "Convene Theological Debate?";
              let html = '<ul>';
              html += `<li class="option" id="yes">yes</li>`;
              html += `<li class="option" id="no">no</li>`;
	      html += '</ul>';
              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {
		
                let action2 = $(this).attr("id");
	        his_self.updateStatus("submitting...");

		if (action2 === "yes") {
		  his_self.playerCallTheologicalDebate(his_self, his_self.game.player, "papacy");
		  return;
		}

		// no
	        his_self.updateLog("No excommunicable Protestant reformers exist");
	        his_self.endTurn();
		return;

	      });

	      return;
	    }

	    html += '</ul>';
            his_self.updateStatusWithOptions(msg, html);
  
            $('.option').off();
            $('.option').on('click', function () {
              let selected_reformer = $(this).attr("id");
	      his_self.addEndMove("excommunicate_reformer\t"+selected_reformer);

              let msg = "Convene Theological Debate?";
              let html = '<ul>';
              html += `<li class="option" id="yes">yes</li>`;
              html += `<li class="option" id="no">no</li>`;
	      html += '</ul>';
              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {
		
                let action2 = $(this).attr("id");

		if (action2 === "yes") {
		  his_self.excommunicateReformer(selected_reformer);
		  his_self.playerCallTheologicalDebate(his_self, his_self.game.player, "papacy");
		  return;
		}

		// no
	        his_self.updateLog("No excommunicable Protestant reformers exist");
	        his_self.endTurn();
		return;

	      });

	    });

	    return 0;

          } else {
	    his_self.updateStatus("Papacy playing "+his_self.popup("005"));
	  }

	  return 0;
	},
      }
    } else {
      deck['005'] = { 
        img : "cards/HIS-005-2P.svg" , 
        name : "Papal Bull" ,
        ops : 4 ,
        turn : 1 ,
        type : "normal" , 
        faction : "papacy" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
        canEvent : function(his_self, faction) {
	  return 1;
        },
        onEvent : function(his_self, faction) {

	  let papacy = his_self.returnPlayerOfFaction("papacy");

	  if (papacy == his_self.game.player) {

            let msg = "Select Protestant Reformer:";
	    let reformer_exists = 0;
            let html = '<ul>';
	    for (let key in his_self.reformers) {
	      let s = his_self.returnSpaceOfPersonage("protestant", key);
	      if (s) {
		reformer_exists = 1;
                html += `<li class="option" id="${key}">${his_self.reformers[key].name}</li>`;
	      }
	    }

	    if (reformer_exists == 0) {
	      his_self.updateLog("No excommunicable Protestant reformers exist");
	      his_self.endTurn();
	      return;
	    }

	    html += '</ul>';
            his_self.updateStatusWithOptions(msg, html);
  
            $('.option').off();
            $('.option').on('click', function () {
              let selected_reformer = $(this).attr("id");
	      his_self.addMove("excommunicate_reformer\t"+selected_reformer);
	      his_self.endTurn();
	    });

	    return 0;

          }

	  return 0;
	},
      }
    }
    deck['006'] = { 
      img : "cards/HIS-006.svg" , 
      name : "Leipzig Debate" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" , 
      faction : "papacy" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");

        his_self.game.state.tmp_papacy_may_specify_debater = 1;
        his_self.game.state.tmp_papacy_may_specify_protestant_debater_unavailable = 1;

	if (his_self.game.player === p) {

          let msg = "Select Language Zone for Theological Debate:";
          let html = '<ul>';

          if (his_self.returnDebatersInLanguageZone("german", "protestant")) { 
            html += '<li class="option" style="" id="german">German</li>';
          }
          if (his_self.returnDebatersInLanguageZone("french", "france")) { 
            html += '<li class="option" style="" id="french">French</li>';
          }
          if (his_self.returnDebatersInLanguageZone("english", "france")) { 
            html += '<li class="option" style="" id="english">English</li>';
          }
          html += '</ul>';

	  //
  	  // show visual language zone selector
  	  //
  	  his_self.language_zone_overlay.render();

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let language_zone = $(this).attr("id");

            let msg = "Target Committed or Uncommitted Protestant?";
            let html = '<ul>';
            if (1 <= his_self.returnDebatersInLanguageZone(language_zone, "protestant", 0)) {
              html += '<li class="option" id="uncommitted">Uncommitted</li>';
            }
            if (1 <= his_self.returnDebatersInLanguageZone(language_zone, "protestant", 1)) {
              html += '<li class="option" id="committed">Committed</li>';
            }
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              let is_committed = $(this).attr("id");
	      if (is_committed == "uncommitted") { is_committed = 1; } else { is_committed = 0; }

              let msg = "Leigzip Debate Format?";
              let html = '<ul>';
              html += '<li class="option" id="select">Pick My Debater</li>';
	      // or prohibit uncommitted debaters
              if (1 < his_self.returnDebatersInLanguageZone(language_zone, "protestant", is_committed)) {
                html += '<li class="option" id="prohibit">Prohibit Protestant Debater</li>';
              }
              html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);
  
              $('.option').off();
              $('.option').on('click', function () {

                let opt = $(this).attr("id");

	        if (opt === "select") {

                  let msg = "Select Uncommitted Papal Debater:";
                  let html = '<ul>';
		  for (let i = 0; i < his_self.game.state.debaters.length; i++) {
		    let d = his_self.game.state.debaters[i];
		    if (d.faction === "papacy" && d.committed === 0) {
            	      html += `<li class="option" id="${d.type}">${d.name}</li>`;
		    }
		  }
		  html += '</ul>';
                  his_self.updateStatusWithOptions(msg, html);
  
                  $('.option').off();
                  $('.option').on('mouseover', function() {
                    let action2 = $(this).attr("id");
                    if (his_self.debaters[action2]) {
                      his_self.cardbox.show(action2);
                    }
                  });
                  $('.option').on('mouseout', function() {
                    let action2 = $(this).attr("id");
                    if (his_self.debaters[action2]) {
                      his_self.cardbox.hide(action2);
                    }
                  });
                  $('.option').on('click', function () {
                    his_self.language_zone_overlay.hide();
                    let selected_papal_debater = $(this).attr("id");
	            his_self.addMove("theological_debate");
        	    his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
        	    his_self.addMove("RESETCONFIRMSNEEDED\tall");
	            his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"uncommitted\t" + selected_papal_debater);
		    his_self.endTurn();
		  });
	
	        } else {

                  let msg = "Prohibit Protestant Debater:";
                  let html = '<ul>';
		  for (let i = 0; i < his_self.game.state.debaters.length; i++) {
		    let d = his_self.game.state.debaters[i];
		    if (d.faction !== "papacy" && d.language_zone === language_zone && d.committed == is_committed) {
            	      html += `<li class="option" id="${i}">${d.name}</li>`;
		    }
		  }
		  html += '</ul>';
                  his_self.updateStatusWithOptions(msg, html);
  
                  $('.option').off();
                  $('.option').on('click', function () {
                    his_self.language_zone_overlay.hide();
                    let prohibited_protestant_debater = $(this).attr("id");
	            his_self.addMove("theological_debate");
        	    his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
        	    his_self.addMove("RESETCONFIRMSNEEDED\tall");
	 	    if (is_committed == 0) {
	              his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"uncommitted\t\t"+prohibited_protestant_debater);
		    } else {
	              his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"committed\t\t"+prohibited_protestant_debater);
		    }
		    his_self.endTurn();
		  });
	
	        }

	      });
	    });
	  });

	} else {
	  his_self.updateStatus("Papacy calling Theological Debate");
	}

	return 0;
      },

    }

    deck['007'] = { 
      img : "cards/HIS-007.svg" , 
      name : "Here I Stand" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "protestant" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
       
	let cards_available = 0;
        for (let key in his_self.game.deck[0].discards) { cards_available++; }
        if (cards_available == 0) { return 0; }

	if (his_self.game.state.leaders.luther == 1) { return 1; }
	if (Object.keys(his_self.game.deck[0].discards).length > 0) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (his_self.game.player === p) {

	  let msg = "Retrieve Card from Discard Pile: ";
          let html = '<ul>';
	  for (let key in his_self.game.deck[0].discards) {
	    if (parseInt(key) > 9) {
              html += `<li class="option" id="${key}">${his_self.game.deck[0].cards[key].name}</li>`;
	    }
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
          $('.option').on('mouseover', function() {
            let action2 = $(this).attr("id");
            his_self.cardbox.show(action2);
          });
          $('.option').on('mouseout', function() {
            let action2 = $(this).attr("id");
            his_self.cardbox.hide(action2);
          });
	  $('.option').on('click', function () {

	    $('.option').off();
	    let card = $(this).attr("id");

	    let msg = "Play or Hold Card? ";
            let html = '<ul>';
            html += '<li class="option" id="play">play card</li>';
            html += '<li class="option" id="hold">hold card</li>';
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action == "play") {

		his_self.addMove("card\tprotestant\t"+action);
		his_self.addMove("discard\tprotestant\t007");
		his_self.endTurn();

	      } else {

		his_self.addMove("discard\tprotestant\t007");
		his_self.addMove("here_i_stand_event\t"+card);
		his_self.endTurn();

	      }

	    });
	  });
	} else {
	  his_self.updateStatus("Protestants retrieving card: " + his_self.popup("007"));
	}

	return 0;
      },
      menuOption  :       function(his_self, menu, player) {
        if (menu === "debate") {
          return { faction : "protestant" , event : '007', html : `<li class="option" id="007">Here I Stand (assign Luther)</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "debate") {
	  // Wartburg stops Luther
	  if (his_self.game.state.events.wartburg == 1) { return 0; }
	  if (his_self.game.state.leaders.luther == 1) {
	    if (his_self.game.state.theological_debate.round1_attacker_debater == "luther-debater") { return 0; }
	    if (his_self.game.state.theological_debate.round1_defender_debater == "luther-debater") { return 0; }
	    if (his_self.game.state.theological_debate.round2_attacker_debater == "luther-debater") { return 0; }
	    if (his_self.game.state.theological_debate.round2_defender_debater == "luther-debater") { return 0; }
	    if (player === his_self.returnPlayerOfFaction("protestant")) {
	      if (his_self.canPlayerPlayCard("protestant", "007")) { return 1; }
	    }
	  }
	}
	return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu === "debate") {
	  his_self.addMove("discard\tprotestant\t007");
	  his_self.addMove("NOTIFY\t"+his_self.popup("007") + ": Luther enters Theological Debate");
	  his_self.addMove("here_i_stand_response");
	  his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "here_i_stand_event") {

          his_self.game.queue.splice(qe, 1);

	  //
	  // first option not implemented
	  //
          let card = mv[1];

	  if (his_self.game.deck[0].discards[card]) {

	    let p = his_self.returnPlayerOfFaction("protestant");

	    //
	    // player returns to hand
	    //
	    if (his_self.game.player === p) {
              let fhand_idx = his_self.returnFactionHandIdx(p, "protestant");
	      his_self.game.deck[0].fhand[fhand_idx].push(card);
	    }

	    //
	    // everyone removes from discards
	    //
	    delete his_self.game.deck[0].discards[card];

	  }

	  return 1;
	}

        if (mv[0] === "here_i_stand_response") {

          his_self.game.queue.splice(qe, 1);

	  his_self.updateLog("Protestants trigger " + his_self.popup("007"));
	  his_self.game.queue.push("ACKNOWLEDGE\tProtestants swap Martin Luther into debate");
	  his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");

	  //
	  // second option -- only possible if Wartburg not in-play
	  //
	  if (his_self.game.state.events.wartburg == 0) {

	    //
	    // existing protestant debater is committed, but de-activated (bonus does not apply)
	    //
	    for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	      let d = his_self.game.state.debaters[i];
	      if (his_self.game.state.theological_debate.attacker === "papacy") {
	        if (his_self.game.state.theological_debate.round == 1) {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round1_defender_debater) {
	  	    his_self.commitDebater("protestant", d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        } else {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round2_defender_debater) {
		    his_self.commitDebater("protestant", d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        }
	      } else {
	        if (his_self.game.state.theological_debate.round == 1) {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round1_attacker_debater) {
		    his_self.commitDebater("protestant", d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        } else {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round2_attacker_debater) {
		    his_self.commitDebater("protestant", d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        }
	      }
	    }

	    let is_luther_committed = 0;
	    for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	      if (his_self.game.state.debaters[i].key === "luther-debater") {
		if (his_self.game.state.debaters[i].committed == 1) { is_luther_committed = 1; }
	      }
	    }
	    for (let i = 0; i < his_self.game.state.excommunicated.length; i++) {
	      if (his_self.game.state.excommunicated[i].debater) {
	        if (his_self.game.state.excommunicated[i].debater.type === "luther-debater") {
		  if (his_self.game.state.excommunicated[i].committed == 1) { is_luther_committed = 1; }
	        }
	      }
	    }

	    if (his_self.game.state.theological_debate.attacker === "papacy") {
	      if (his_self.game.state.theological_debate.round == 1) {
                his_self.game.state.theological_debate.round1_defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater_power = 4;
                his_self.game.state.theological_debate.defender_debater_bonus = 1;
		if (is_luther_committed == 0) {
                  his_self.game.state.theological_debate.defender_debater_bonus++;
		}
	      } else {
                his_self.game.state.theological_debate.round2_defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater_power = 4;
                his_self.game.state.theological_debate.defender_debater_bonus = 1;
		if (is_luther_committed == 0) {
                  his_self.game.state.theological_debate.defender_debater_bonus++;
		}
	      }
	    } else {
	      if (his_self.game.state.theological_debate.round == 1) {
                his_self.game.state.theological_debate.round1_attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater_power = 4;
                his_self.game.state.theological_debate.attacker_debater_bonus = 3;
	      } else {
                his_self.game.state.theological_debate.round2_attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater_power = 4;
                his_self.game.state.theological_debate.attacker_debater_bonus = 3;
	      }
	    }
	  }

	  // re-render debate overlay with luther there
          his_self.debate_overlay.render(his_self.game.state.theological_debate);
          his_self.displayTheologicalDebater(his_self.game.state.theological_debate.attacker_debater, true);
          his_self.displayTheologicalDebater(his_self.game.state.theological_debate.defender_debater, false);

	  return 1;

        }

	return 1;
      },
    }
    // 95 Theses
    deck['008'] = { 
      img : "cards/HIS-008.svg" , 
      name : "Luther's 95 Theses" ,
      ops : 0 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeck : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	// set player to protestant
	player = his_self.returnPlayerOfFaction("protestant");

	let players_to_go = [];
	for (let i = 1; i < his_self.game.players.length; i++) {
	  if (i != his_self.returnPlayerOfFaction("protestant")) {
	    players_to_go.push(i);
	  }
	}

	// protestant gets 2 roll bonus at start
	his_self.game.state.tmp_protestant_reformation_bonus = 1;
	his_self.game.state.tmp_protestant_reformation_bonus_spaces = [];
	his_self.game.state.tmp_catholic_reformation_bonus = 0;
	his_self.game.state.tmp_catholic_reformation_bonus_spaces = [];
	his_self.game.state.tmp_reformations_this_turn = [];
	his_self.game.state.wittenberg_electoral_bonus = 1;

	his_self.game.queue.push("hide_overlay\ttheses");
        his_self.game.queue.push("counter_or_acknowledge\tThe Reformation has begun!");
        his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
	his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("STATUS\tProtestants selecting reformation targets...\t"+JSON.stringify(players_to_go));
	his_self.game.queue.push("show_overlay\ttheses");
        his_self.convertSpace("protestant", "wittenberg");
        his_self.convertSpace("protestant", "wittenberg");
        his_self.addUnit("protestant", "wittenberg", "regular");
        his_self.addUnit("protestant", "wittenberg", "regular");
        his_self.addReformer("protestant", "wittenberg", "luther-reformer");
        his_self.displaySpace("wittenberg");

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "catholic_counter_reformation") {

          let player = parseInt(mv[1]);
          if (his_self.returnPlayerOfFaction(mv[1])) { player = his_self.returnPlayerOfFaction(mv[1]); }
          let language_zone = "german";
	  if (mv[2]) { language_zone = mv[2]; }

	  his_self.game.queue.splice(qe, 1);

	  let target_spaces = his_self.countSpacesWithFilter(
	    function(space) {
	      if (
	        space.religion === "protestant" &&
	        (space.language === language_zone || language_zone == "all") &&
	        !his_self.game.state.tmp_counter_reformations_this_turn.includes(space.key) &&
	        ( 
		  his_self.isSpaceAdjacentToReligion(space, "catholic")
		  ||
		  space.university == 1
		  ||
		  his_self.doesSpaceContainCatholicReformer(space)
	        )
	      ) {
	        return 1;
	      }
	      return 0;
	    }
	  );

	  //
	  // no valid reformation targets
	  //
	  if (target_spaces == 0) {
	    his_self.updateStatus("No valid counter-reformation targets"); 
	    his_self.updateLog("No valid counter-reformation targets"); 
	    his_self.game.queue.splice(qe, 1);
	    return 1;
	  }


	  if (his_self.game.player == player) {
	    if (target_spaces > 0) {

	    if (language_zone != "all" && language_zone != "") {
	      his_self.theses_overlay.render(language_zone);
	    } else {
	      his_self.theses_overlay.render();
	    }

            his_self.playerSelectSpaceWithFilter(

	      "Select Counter-Reformation Attempt",

	      //
	      // protestant spaces adjacent to catholic 
	      //
	      function(space) {
		if (
		  space.religion === "protestant" &&
		  (space.language === language_zone || language_zone == "all") &&
		  !his_self.game.state.tmp_counter_reformations_this_turn.includes(space.key) &&
		  his_self.isSpaceAdjacentToReligion(space, "catholic")
	        ) {
		  return 1;
	        }
		return 0;
	      },

	      //
	      // launch counter_reformation
	      //
	      function(spacekey) {
	  	his_self.updateStatus("Counter-Reformation attempt: "+his_self.returnSpaceName(spacekey));
		his_self.addMove("counter_reformation\t"+spacekey+"\t"+language_zone);
		let name = his_self.game.spaces[spacekey].name;
		his_self.addMove("counter_or_acknowledge\tCounter-Reformation Attempt: "+his_self.returnSpaceName(spacekey)+"\tcatholic_counter_reformation\t"+name);
                his_self.addMove("RESETCONFIRMSNEEDED\tall");
		his_self.endTurn();
	      },

	      null, // cancel func

	      1     // permit board clicks

	    );
	    } else {
	      his_self.addMove("counter_or_acknowledge\tCatholic Counter-Reformation - no valid targets");
              his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      his_self.endTurn();
	    }
	  } else {
	    his_self.updateStatus("Catholic Counter-Reformation in Process");
	  }

          return 0;

        }

        if (mv[0] == "protestant_reformation") {

console.log("#");
console.log("#");
console.log("REOFMRAITON BONUS ROLLS: " + his_self.game.state.tmp_protestant_reformation_bonus);
console.log("#");
console.log("#");

          let player = parseInt(mv[1]);
          if (his_self.returnPlayerOfFaction(mv[1])) { player = his_self.returnPlayerOfFaction(mv[1]); }
          let language_zone = "german";
	  if (mv[2]) { language_zone = mv[2]; }

	  his_self.game.queue.splice(qe, 1);

	  let target_spaces = his_self.countSpacesWithFilter(
	    function(space) {
	      if (
		space.religion === "catholic" &&
		!his_self.game.state.tmp_reformations_this_turn.includes(space.key) &&
		(space.language === language_zone || language_zone == "all") &&
		(
			his_self.isSpaceAdjacentToProtestantReformer(space, "protestant")
			||
			his_self.isSpaceAdjacentToReligion(space, "protestant")
			||
			his_self.doesSpaceContainProtestantReformer(space)
			||
			his_self.isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space)
		)
	      ) {
	        return 1;
	      }
	      return 0;
	    }
	  );

	  //
	  // no valid reformation targets
	  //
	  if (target_spaces == 0) {
	    his_self.updateStatus("No valid reformation targets"); 
	    his_self.updateLog("No valid reformation targets"); 
	    his_self.game.queue.splice(qe, 1);
	    return 1;
	  }

	  if (his_self.game.player == player) {
	    if (target_spaces > 0) {

	      if (language_zone != "all" && language_zone != "") {
	        his_self.theses_overlay.render(language_zone);
	      } else {
	        his_self.theses_overlay.render();
	      }

              his_self.playerSelectSpaceWithFilter(

	        "Select Reformation Target",

	        //
	        // catholic spaces adjacent to protestant 
	        //
	        function(space) {
	  	  if (
		    space.religion === "catholic" &&
		    !his_self.game.state.tmp_reformations_this_turn.includes(space.key) &&
		    (space.language === language_zone || language_zone == "all") &&
		    (
			his_self.isSpaceAdjacentToProtestantReformer(space, "protestant")
			||
			his_self.isSpaceAdjacentToReligion(space, "protestant")
			||
			his_self.doesSpaceContainProtestantReformer(space)
			||
			his_self.isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space)
		    )
	          ) {
		    return 1;
	          }
		  return 0;
	        },

	        //
	        // launch reformation
	        //
	        function(spacekey) {
	  	  his_self.addMove("reformation\t"+spacekey+"\t"+language_zone);
		  his_self.addMove("counter_or_acknowledge\tProtestant Reformation Attempt in "+his_self.returnSpaceName(spacekey)+"\tprotestant_reformation\t"+spacekey);
        	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  	  his_self.updateStatus("Reformation attempt in "+his_self.returnSpaceName(spacekey));
		  his_self.endTurn();
	        },
	        null ,
	        1     // permit board clicks
	      );
	    } else {
	      his_self.addMove("counter_or_acknowledge\tProtestant Reformation - no valid targets");
              his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      his_self.updateStatus("No Valid Targets");
	      his_self.endTurn();
	    }
	  } else {
	    his_self.updateStatus("Protestant Reformation...");
	  }
          return 0;
        }
	return 1;
      }
    }
    deck['009'] = { 
      img : "cards/HIS-009.svg" , 
      name : "Barbary Pirates" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	// algiers space is now in play
	his_self.game.spaces['algiers'].home = "ottoman";
	his_self.game.spaces['algiers'].political = "ottoman";
	his_self.addRegular("ottoman", "algiers", 2);
	his_self.addCorsair("ottoman", "algiers", 2);
	his_self.game.state.events.barbary_pirates = 1;
	his_self.game.state.events.ottoman_piracy_enabled = 1;
	his_self.game.state.events.ottoman_corsairs_enabled = 1;

	return 1;
      },

    }
    deck['010'] = { 
      img : "cards/HIS-010.svg" , 
      name : "Clement VII" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.leo_x = 0;
	his_self.game.state.leaders.clement_vii = 1;
	return 1;
      },
    }
    deck['011'] = { 
      img : "cards/HIS-011.svg" , 
      name : "Defender of the Faith" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let papacy = his_self.returnPlayerOfFaction("papacy");

	if (faction === "england") {
	  let faction_hand_idx = his_self.returnFactionHandIdx(player, "england");   
 	  his_self.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+his_self.game.state.players_info[player-1].factions[faction_hand_idx]);
	  his_self.game.queue.push(`DEAL\t1\t${player}\t1`);
        }
	// three counter-reformation attempts
	his_self.game.queue.push(`hide_overlay\tburn_books`);
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push(`catholic_counter_reformation\tpapacy\tall`);
	his_self.game.queue.push(`catholic_counter_reformation\tpapacy\tall`);
	his_self.game.queue.push(`catholic_counter_reformation\tpapacy\tall`);
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	return 1;
      },
    }
    deck['012'] = { 
      img : "cards/HIS-012.svg" , 
      name : "Master of Italy" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { 

	let f = {};
	if (!f[his_self.game.spaces['genoa'].political]) { f[his_self.game.spaces['genoa'].political] = 1; }
	else { f[his_self.game.spaces['genoa'].political]++ }

	for (let key in f) {
	  if (f[key] >= 4) {
	    return 1;
	  }
	  if (f[key] == 3) {
	    return 1;
	  }
	  if (f[key] == 2) {
	    return 1;
	  }
	}

	return 0;
      } ,
      onEvent : function(his_self, faction) {

	let f = {};
	if (!f[his_self.game.spaces['genoa'].political]) { f[his_self.game.spaces['genoa'].political] = 1; }
	else { f[his_self.game.spaces['genoa'].political]++ }

	for (let key in f) {
	  if (f[key] >= 4) {
	    his_self.gainVictoryPoints(faction, 3);
	  }
	  if (f[key] == 3) {
	    his_self.gainVictoryPoints(faction, 2);
	  }
	  if (f[key] == 2) {
	    let faction_hand_idx = his_self.returnFactionHandIdx(player, key);
 	    his_self.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+his_self.game.state.players_info[player-1].factions[faction_hand_idx]);
	    his_self.game.queue.push(`DEAL\t1\t${player}\t1`);
	  }
	}

	his_self.displayVictoryTrack();

      }
    }
    if (this.game.players.length == 2) {
      deck['013'] = { 
        img : "cards/HIS-013-2P.svg" , 
        name : "Schmalkaldic League" ,
        ops : 2 ,
        turn : 1 ,
        type : "mandatory" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
        canEvent : function(his_self, faction) {
	  if (his_self.game.state.round >= 2 && his_self.returnNumberOfProtestantSpacesInLanguageZone("all") >= 12) {
	    return 1; 
	  }
	  return 0;
	},
        onEvent : function(his_self, faction) {
          his_self.game.state.events.schmalkaldic_league_round = his_self.game.state.round;
          his_self.game.state.events.schmalkaldic_league = 1;
	  his_self.schmalkaldic_overlay.render();
          his_self.setEnemies("protestant","papacy");
          his_self.setEnemies("protestant","hapsburg");
          his_self.setAllies("papacy","hapsburg");
	  // protestant home + political spaces
	  for (let key in his_self.game.spaces) {
	    s = his_self.game.spaces[key];
	    if (s.language == "german") { 
	      s.home = "protestant"; 
	      if (s.religion == "protestant") {
		s.political = "protestant";
	      }
	    }
	  }
	  for (let i = 0; i < his_self.game.state.activated_powers["protestant"].length; i++) {
	    if (his_self.game.state.activated_powers["protestant"][i] === "hapsburg") {
	      his_self.game.state.activated_powers["protestant"].splice(i, 1);
	      his_self.game.state.events.spanish_invasion = "";
	    }
	  }
          his_self.game.state.activated_powers["papacy"].push("hapsburg");
	  his_self.displayBoard();
	  return 1;
        }
      }
    } else {
      deck['013'] = { 
        img : "cards/HIS-013.svg" , 
        name : "Schmalkaldic League" ,
        ops : 2 ,
        turn : 1 ,
        type : "mandatory" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
        onEvent : function(his_self, faction) {
          his_self.setEnemies("protestant","papacy");
          his_self.setEnemies("protestant","hapsburg");
          his_self.setAllies("papacy","hapsburg");
          his_self.game.state.events.schmalkaldic_league_round = his_self.game.state.round;
          his_self.game.state.events.schmalkaldic_league = 1;
	  // protestant home + political spaces
	  for (let key in his_self.game.spaces) {
	    s = his_self.game.spaces[key];
	    if (s.language == "german") { 
	      s.home = "protestant"; 
	      if (s.religion == "protestant") {
		s.political = "protestant";
	      }
	    }
	  }
	  his_self.displayBoard();
	  return 1;
        }
      }
    }
    deck['014'] = { 
      img : "cards/HIS-014.svg" , 
      name : "Paul III" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.leo_x = 0;
	his_self.game.state.leaders.clement_vii = 0;
	his_self.removeCardFromGame('010'); // remove clement vii
	his_self.game.state.leaders.paul_iii = 1;
	return 1;
      },
    }
    deck['015'] = { 
      img : "cards/HIS-015.svg" , 
      name : "Society of Jesus" ,
      ops : 2 ,
      turn : 5 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	let papacy = his_self.returnPlayerOfFaction("papacy");
	if (his_self.game.player === papacy) {
    	  his_self.playerSelectSpaceWithFilter(
      	    "Select Catholic-Controlled Space for First Jesuit University",
      	    function(space) {
              if (space.religion === "catholic" && space.university != 1) { return 1; }
              return 0; 
            },          
            function(destination_spacekey) {
    	      his_self.playerSelectSpaceWithFilter(
      	        "Select Catholic-Controlled Space for Second Jesuit University",
       	        function(space) {
                  if (space.key != destination_spacekey && space.religion === "catholic" && space.university != 1) { return 1; }
                  return 0; 
                },
                function(second_spacekey) {
                  his_self.addMove("found_jesuit_university\t"+second_spacekey);
                  his_self.addMove("found_jesuit_university\t"+destination_spacekey);
	          his_self.addMove("SETVAR\tstate\tevents\tpapacy_may_found_jesuit_universities\t1");
                  his_self.endTurn();
	        }
	      );
	    }
	  );
        }
	return 0;
      },    
    }
    deck['016'] = { 
      img : "cards/HIS-016.svg" , 
      name : "Calvin" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.game.state.leaders['luther'] = 0;
	his_self.game.state.leaders['calvin'] = 1;

	let x = his_self.returnSpaceOfPersonage("protestant", "luther-reformer");
	let y = his_self.returnIndexOfPersonageInSpace("protestant", "luther-reformer", x);

	if (y > -1) {
	  his_self.game.spaces[x].units["protestant"].splice(y, 1);
	}

	for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	  if (his_self.game.state.debaters[i].type === "luther-debater") {
	    his_self.game.state.debaters.splice(i, 1);
	  }
	}

	his_self.updateLog("Luther dies and is replaced by Calvin");

	return 0;
      }
    }
    deck['017'] = { 
      img : "cards/HIS-017.svg" , 
      name : "Council of Trent" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	his_self.game.state.council_of_trent = {};
	his_self.game.state.council_of_trent.papacy = {};
	his_self.game.state.council_of_trent.protestants = {};

	his_self.game.queue.push("hide_overlay\tcouncil_of_trent");
	his_self.game.queue.push("council_of_trent_results");
	his_self.game.queue.push("show_overlay\tcouncil_of_trent");
	his_self.game.queue.push("council_of_trent_protestants");
	his_self.game.queue.push("show_overlay\tcouncil_of_trent");
	his_self.game.queue.push("council_of_trent_papacy");
	his_self.game.queue.push("show_overlay\tcouncil_of_trent");

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "council_of_trent_add_debaters") {

          his_self.game.queue.splice(qe, 1);
	  
	  let faction = mv[1];
	  let debaters = mv[2];

	  if (faction === "papacy") {
	    his_self.game.state.council_of_trent.papacy.debaters = JSON.parse(debaters);
	  } else {
	    his_self.game.state.council_of_trent.protestants.debaters = JSON.parse(debaters);
	  }

	  return 1;

	}

        if (mv[0] === "council_of_trent_papacy") {

          his_self.game.queue.splice(qe, 1);
	  his_self.council_of_trent_overlay.render("papacy");

	  return 0;

	}

        if (mv[0] === "council_of_trent_results") {

          his_self.game.queue.splice(qe, 1);
	  //
	  // this adds stuff to the queue -- so we pass through
	  //
	  his_self.council_of_trent_overlay.render("results");

	  return 1;

	}

        if (mv[0] === "council_of_trent_protestants") {

          his_self.game.queue.splice(qe, 1);
	  his_self.council_of_trent_overlay.render("protestant");

	  return 0;

        }

	return 1;
      },
    }
    deck['018'] = { 
      img : "cards/HIS-018.svg" , 
      name : "Dragut" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	// barbarossa dies, replaced by Dragut
	let s = his_self.returnSpaceOfPersonage("ottoman", "barbarossa");
	if (s != "") {
	  let idx = his_self.returnIndexOfPersonageInSpace("ottoman", "barbarossa", s);
	  if (idx > -1) {
	    his_self.game.spaces[s].units["ottoman"].splice(idx, 1);
	    his_self.addNavyLeader("ottoman", s, "dragut");
	  }	  
	}

	return 1;
      },
    }
    deck['019'] = { 
      img : "cards/HIS-019.svg" , 
      name : "Edward VI" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      onEvent : function(his_self, faction) {

	his_self.game.state.leaders.edward_vi = 1;
	his_self.game.state.leaders.henry_viii = 0;

	let placed = 0;

        // henry_viii dies, replaced by dudley
        let s = his_self.returnSpaceOfPersonage("england", "henry_viii");
        if (s != "") {
          let idx = his_self.returnIndexOfPersonageInSpace("england", "henry_viii", s);
          if (idx > -1) {
            his_self.game.spaces[s].units["england"].splice(idx, 1);
            his_self.addArmyLeader("england", s, "dudley");
	    placed = 1;
          } 
        }
        
	if (placed == 0) {
          his_self.addArmyLeader("england", "london", "dudley");
	}

	return 1;
      },
    }

    deck['020'] = { 
      img : "cards/HIS-020.svg" , 
      name :"Henry II" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	his_self.game.state.leaders.francis_i = 0;
	his_self.game.state.leaders.henry_ii = 1;
	let placed = 0;

        // francis_i dies replaced by henry_ii
        let s = his_self.returnSpaceOfPersonage("france", "francis_i");
        if (s != "") {
          let idx = his_self.returnIndexOfPersonageInSpace("france", "francis_i", s);
          if (idx > -1) {
            his_self.game.spaces[s].units["france"].splice(idx, 1);
            his_self.addArmyLeader("france", s, "henry_ii");
	    placed = 1;
          } 
        }
        
	if (placed == 0) {
          his_self.addArmyLeader("france", "paris", "henry_ii");
	}

	return 1;
      },
    }
    deck['021'] = { 
      img : "cards/HIS-021.svg" , 
      name : "Mary I" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.edward_vi = 0;
	his_self.game.state.leaders.mary_i = 1;

	his_self.removeCardFromGame('019'); // remove edward_vi if still in deck

	let placed = 0;
	if (his_self.game.state.leaders.henry_viii == 1) {

	  his_self.game.state.leaders.henry_viii = 0; 

          // mary_i replaces edward_vi or henry_viii
          let s = his_self.returnSpaceOfPersonage("england", "henry_viii");
          if (s != "") {
            let idx = his_self.returnIndexOfPersonageInSpace("england", "henry_viii", s);
            if (idx > -1) {
              his_self.game.spaces[s].units["england"].splice(idx, 1);
              his_self.addArmyLeader("england", s, "dudley");
	      placed = 1;
            } 
          }

	  if (placed == 0) {
            his_self.addArmyLeader("france", "paris", "henry_ii");
	  }
	}

	return 1;
      },
    }
    deck['022'] = { 
      img : "cards/HIS-022.svg" , 
      name : "Julius III" ,
      ops : 2 ,
      turn : 7 ,
      type : "mandatory" ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.leo_x = 0;
	his_self.game.state.leaders.clement_vii = 0;
	his_self.game.state.leaders.paul_iii = 0;
	his_self.game.state.leaders.julius_iii = 1;
	his_self.removeCardFromGame('010');
	his_self.removeCardFromGame('014');
	return 1;
      },
    }
    deck['023'] = { 
      img : "cards/HIS-023.svg" , 
      name : "Elizabeth I" ,
      ops : 2 ,
      turn : 0 ,
      type : "mandatory" ,
      canEvent : function(his_self, faction) { return 1; },
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.henry_viii = 0;
	his_self.game.state.leaders.edward_vi = 0;
	his_self.game.state.leaders.mary_i = 0;
	his_self.game.state.leaders.elizabeth_i = 1;
	his_self.removeCardFromGame('019');
	his_self.removeCardFromGame('021');
	return 1;
      },
    }
    deck['024'] = { 
      img : "cards/HIS-024.svg" , 
      name : "Arquebusiers" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('024')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }

          return { faction : f , event : '024', html : `<li class="option" id="024">arquebusiers (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('024')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          player = his_self.returnPlayerOfFaction(faction);
	  player.tmp_roll_bonus = 2;
        }
        return 1;
      },
    }
    deck['025'] = { 
      img : "cards/HIS-025.svg" , 
      name : "Field Artillery" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('025')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '025', html : `<li class="option" id="025">field artillery (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('025')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          player = his_self.returnPlayerOfFaction(faction);
	  player.tmp_roll_bonus = 2;
	  if (faction === "france" || faction === "ottoman") {
	    player.tmp_roll_bonus = 3;
	  }
        }
        return 1;
      },
    }
    deck['026'] = { 
      img : "cards/HIS-026.svg" , 
      name : "Mercenaries Bribed" ,
      ops : 3 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('026')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  if (f === "ottoman") { return {}; }
          return { faction : f , event : '026', html : `<li class="option" id="026">mercenaries bribed (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('026')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  alert("Mercenaries Bribed...");
        }
        return 1;
      },
    }
    deck['027'] = { 
      img : "cards/HIS-027.svg" , 
      name : "Mercenaries Grow Restless" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_assault_hits_roll") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('027')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '027', html : `<li class="option" id="027">mercenaries grow restless (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "pre_assault_hits_roll") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('027')) {
	      let assault_spacekey = "";
	      if (his_self.game.state.assault) {
	        if (his_self.game.state.assault.spacekey) {
	          if (his_self.isSpaceControlled(his_self.game.state.assault.spacekey, faction)) {
                    return 1;
	 	  }
	 	}
	      }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_assault_hits_roll") {
	  his_self.addMove(`mercenaries_grow_restless\t${faction}`);
  	  his_self.addMove(`discard\t${faction}\t027`);
	  his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "mercenaries_grow_restless") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  his_self.updateLog(his_self.returnFactionName(faction) + " triggers " + his_self.popup("027"));

          let player = his_self.returnPlayerOfFaction(faction);
	  let space = his_self.game.spaces[his_self.game.state.assault.spacekey];
	  let attacker_land_units_remaining = 0;
	  let defender_land_units_remaining = 0;
	  for (let f in his_self.game.state.assault.faction_map) {
            if (his_self.game.state.assault.faction_map[f] === his_self.game.state.assault.attacker_faction) {
	      for (let z = 0; z < space.units[f].length; z++) {
		if (space.units[f][z].type === "mercenary") {
		  space.units[f].splice(z, 1);
		  z--;
		} else {
		  if (space.units[f][z].type === "cavalry" || space.units[f][z].type === "regular") {
		    attacker_land_units_remaining++;
		  }
		}
	      }
            }       
            if (his_self.game.state.assault.faction_map[f] === his_self.game.state.assault.defender_faction) {
	      for (let z = 0; z < space.units[f].length; z++) {
		let u = space.units[f][z];
	        if (u.type === "mercenary" || u.type === "regular" || u.type === "cavalry") {
		  defender_land_units_remaining++;
		}
	      }
	    }
          }

	  if (defender_land_units_remaining > attacker_land_units_remaining) {

	    //
	    // remove rest of assault
	    //
	    for (let i = his_self.game.queue.length-1; i > 0 ; i--) {
	      let lmv = his_self.game.queue[i].split("\t");
	      if (!(lmv[0].indexOf("assault") == 0 || lmv[0].indexOf("counter") == 0 || lmv[0].indexOf("RESETC") == 0 || lmv[0].indexOf("RESOLVE") == 0 || lmv[0].indexOf("discard") == 0)) {
		break;
	      } else {
	        if (lmv[0].indexOf("RESOLVE") == 0 || lmv[0].indexOf("discard") == 0) {

	        } else {
		  his_self.game.queue.splice(i, 1);
	        }
	      }
	    }

	    his_self.game.queue.push("break_siege");
	    his_self.game.queue.push("hide_overlay\tassault");
    	    his_self.game.queue.push(`discard\t${faction}\t027`);

	  //
	  // assault may continue -- this will take us back to the acknowledge menu
	  //
	  } else {

	    //
	    // remove rest of assault
	    //
	    for (let i = his_self.game.queue.length-1; i > 0 ; i--) {
	      let lmv = his_self.game.queue[i].split("\t");
	      if (!(lmv[0].indexOf("discard") == 0 || lmv[0].indexOf("continue") == 0 || lmv[0].indexOf("play") == 0)) {
		his_self.game.queue.splice(i, 1);
	      } else {
		break;
	      }
	    }

	    his_self.game.queue.push(`assault\t${his_self.game.state.assault.attacker_faction}\t${his_self.game.state.assault.spacekey}`);
	    his_self.game.queue.push("hide_overlay\tassault");
    	    his_self.game.queue.push(`discard\t${faction}\t027`);

	  }

	}


        return 1;
      }
    }
    deck['028'] = { 
      img : "cards/HIS-028.svg" , 
      name : "Siege Mining" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "assault") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('028')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  let am_i_attacker = false;
	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("assault") == 0) {
	      let lmv = lqe.split("\t");
	      if (lmv[0] === "assault") {
		if (f === lmv[1]) { am_i_attacker = true; }
	      }
	    }
	  }
	  if (am_i_attacker) {
            return { faction : f , event : '028', html : `<li class="option" id="028">siege mining (${f})</li>` };
	  }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "assault" && his_self.game.player === his_self.game.state.active_player) {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('028')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "assault") {
          his_self.addMove(`siege_mining`);
          his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "siege_mining") {
          his_self.game.queue.splice(qe, 1);
	  his_self.game.state.players_info[his_self.game.state.active_player-1].tmp_roll_bonus = 3;
alert("enabled siege mining: " + his_self.game.state.active_player-1 + " -- " + JSON.stringify(his_self.game.state.players_info[his_self.game.state.active_player-1].tmp_roll_bonus));
	}
        return 1;
      }
    }
    deck['029'] = { 
      img : "cards/HIS-029.svg" , 
      name : "Surprise Attack" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "assault") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '029', html : `<li class="option" id="029">surprise attack (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          player = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.state.active_player === player) {
	    player.tmp_roll_first = 1;
	  }
        }
        return 1;
      },
    }
    deck['030'] = { 
      img : "cards/HIS-030.svg" , 
      name : "Tercios" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('030')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '030', html : `<li class="option" id="030">tercois (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('030')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  alert("tercois is complicated...");
        }
        return 1;
      },
    }
    deck['031'] = { 
      img : "cards/HIS-031.svg" , 
      name : "Foul Weather" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "move" || menu == "assault" || menu == "piracy") {

	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }

          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('031')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '031', html : `<li class="option" id="031">foul weather (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "move" || menu == "assault" || menu == "piracy") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('031')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "move" || menu == "assault" || menu == "piracy") {
	  his_self.addMove(`foul_weather\t${player}\t${faction}`);
  	  his_self.addMove("discard\t"+faction+"\t"+"031");
  	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "foul_weather") {

          let player = mv[1];
          let faction = mv[2];
          his_self.game.queue.splice(qe, 1);

	  his_self.displayModal(his_self.returnFactionName(faction) + " triggers Foul Weather");

	  his_self.updateLog(his_self.returnFactionName(faction) + " triggers " + his_self.popup("031"));
	  his_self.game.state.events.foul_weather = 1;

	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    if (his_self.game.queue[i].indexOf("continue") == -1) {
	      his_self.game.queue.splice(i, 1);
	    } else {
	      break;
	    }
	  }

	  return 1;

        }

	return 1;
      }
    }
    deck['032'] = { 
      img : "cards/HIS-032.svg" , 
      name : "Gout" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "move" || menu == "assault") {
	  let f = "";
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }

	  if (f == "") { return {}; }

	  let includes_army_leader = false;

	  if (menu == "assault") {
	    for (let i = his_self.game.queue.length-1; i > 0; i--) {
	      let lqe = his_self.game.queue[i];
	      if (lqe.indexOf("assault") == 0) {
		let lmv = lqe.split("\t");
		if (lmv[0] === "assault") {
		  let faction = lmv[1];
		  let source = lmv[2];
		  let unit_idx = -1;
		  let space = his_self.game.spaces[source];
		  for (let i = 0; i < space.units[faction].length; i++) {
		    if (space.units[faction][i].army_leader) {
		      includes_army_leader = true;
		    }
		  }
		}
	      }
	    }
	  }

	  if (menu == "move") {
	    for (let i = his_self.game.queue.length-1; i > 0; i--) {
	      let lqe = his_self.game.queue[i];
	      if (lqe.indexOf("move") == 0) {
		let lmv = lqe.split("\t");
		if (lmv[0] === "move") {
		  let faction = lmv[1];
		  let source = lmv[3];
		  let unit_idx = parseInt(lmv[5]);
		  let unit = his_self.game.spaces[source].units[faction][unit_idx];
		  if (unit.army_leader) {
		    includes_army_leader = true;
		  }
		}
	      }
	    }
	  }

	  if (includes_army_leader) {
            return { faction : f , event : '032', html : '<li class="option" id="032">play gout</li>' };
	  } 
       }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "move" || menu == "assault") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
	if (menu === "assault") {

	  let faction = null;
	  let source = null;
	  let unit_idx = null;

	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("assault") == 0) {
	      let lmv = lqe.split("\t");
	      faction = lmv[1];
	      source = lmv[2];
	      if (lmv[0] === "assault") {
	        let space = his_self.game.spaces[source];
	        for (let i = 0; i < space.units[faction].length; i++) {
	          if (space.units[faction][i].army_leader) {
	            unit_idx = i;
	          }
	        }
	      }
	      break;
	    }
	  }

	  if (faction == null || source == null || unit_idx == null) { his_self.endTurn(); return 0; }
  	  his_self.addMove(`discard\t${faction}\t032`);
          his_self.addMove(`gout\t${faction}\t${source}\t${unit_idx}`);
          his_self.endTurn();

	}


        if (menu === "move") {

	  let faction = null;
	  let source = null;
	  let unit_idx = null;

	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("move") == 0) {
	      let lmv = lqe.split("\t");
	      if (lmv[0] === "move") {
		faction = lmv[1];
		source = lmv[3];
		unit_idx = parseInt(lmv[5]);
		break;
	      }
	    }
	  }

	  if (faction == null || source == null || unit_idx == null) { his_self.endTurn(); return 0; }
  	  his_self.addMove(`discard\t${faction}\t032`);
          his_self.addMove(`gout\t${faction}\t${source}\t${unit_idx}`);
          his_self.endTurn();

        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "gout") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let source = mv[2];
	  let unit_idx = parseInt(mv[3]);

	  his_self.displayModal(his_self.returnFactionname(faction) + " triggers Foul Weather");

	  his_self.game.spaces[source].units[faction][unit_idx].gout = true;
	  his_self.updateLog(his_self.game.spaces[source].units[faction][unit_idx].name + " has come down with gout");
          his_self.game.queue.splice(qe, 1);

	  //
	  // "lose 1 CP"
	  //
	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("continue") != 0 && lqe.indexOf("play") != 0) {
	      his_self.game.queue.splice(i, 1);
	    } else {
	      break;
	    }
	  }
	  return 1;

	}

        return 1;
      }
    }
    deck['033'] = { 
      img : "cards/HIS-033.svg" , 
      name : "Landsknechts" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {
        his_self.game.queue.push("landsknechts\t"+faction);
	return 1;
      },
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {

	  let f = "";

	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('033')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

          return { faction : f , event : '033', html : `<li class="option" id="033">landsknechts (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('033')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  if (faction == "ottoman" || faction == "france") {
	  } else {
            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, faction, 
	      function(space) {
		if (!his_self.isSpaceUnderSiege(space.key)) { return 0; }
		if (his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 1; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	        return 0;
	      } ,
	      null ,
	      null ,
	      true
	    );
	  }
	}
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "landsknechts") {

          let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == player) {

	    if (faction === "hapsburg") {
              his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, "hapsburg",
	        function(space) {
	  	  if (his_self.isSpaceUnderSiege(space.key)) { return 0; }
		  if (his_self.returnFactionLandUnitsInSpace("hapsburg", space.key)) { return 1; }
		  if (his_self.returnFriendlyLandUnitsInSpace("hapsburg", space.key)) { return 1; }
	        } ,
	        null ,
	        null ,
	        true
	      );
	    } else {
	      if (faction === "ottoman") {
                his_self.playerRemoveUnitsInSpaceWithFilter("mercenary", 2, faction,
	          function(space) {
		    for (let key in space.units) {
		      for (let i = 0; i < space.units[key].length; i++) {
		        if (space.units[key][i].type === "mercenary") { return 1; }
		      }
		    }
	          } ,
	          null ,
	          null ,
	          true
	        );
	      } else {
                his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 2, faction,
	          function(space) {
		    if (his_self.isSpaceUnderSiege(space.key)) { return 0; }
		    if (his_self.returnFactionLandUnitsInSpace(faction, space.key)) { return 1; }
		    if (his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 1; }
		    return 0;
	          } ,
	          null ,
	          null ,
	          true
	        );
	      }
	    }
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " playing Landsknechts");
	  }

          his_self.game.queue.splice(qe, 1);
	  return 0;

        }

	return 1;
      },
    }
    deck['034'] = { 
      img : "cards/HIS-034.svg" , 
      name : "Professional Rowers" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['035'] = { 
      img : "cards/HIS-035.svg" , 
      name : "Siege Artillery" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_assault_hits_assignment") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('035')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  if (f != "") {
            return { faction : f , event : '035', html : `<li class="option" id="028">siege artillery (${f})</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "pre_assault_hits_assignment") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('035')) {
	      let assault_spacekey = his_self.game.state.assault.spacekey;
	      let attacker_faction = his_self.game.state.assault.attacker_faction;
	      if (4 >= his_self.returnHopsToFortifiedHomeSpace(assault_spacekey, attacker_faction)) {
		return 1;
	      }
              return 0;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "assault") {
          his_self.addMove(`siege_artillery`);
          his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "siege_artillery") {

          his_self.game.queue.splice(qe, 1);

	  //
	  // three extra hits
	  //
	  his_self.game.state.assault.attacker_rolls += 2;
          for (let i = 0; i < 2; i++) {
            let res = his_self.rollDice(6);
            his_self.game.state.assault.attacker_results.push(res);
            if (res >= 5) { his_self.game.state.assault.attacker_hits++; }
          }

          his_self.game.queue.push("counter_or_acknowledge\tUpdated Assault Results (post Siege Artillery)");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
          his_self.game.queue.push("assault_show_hits_render");

	}
        return 1;
      }
    }
    deck['029'] = { 
      img : "cards/HIS-029.svg" , 
      name : "Surprise Attack" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "assault") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '029', html : `<li class="option" id="029">surprise attack (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          player = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.state.active_player === player) {
	    player.tmp_roll_first = 1;
	  }
        }
        return 1;
      },
    }
    deck['036'] = { 
      img : "cards/HIS-036.svg" , 
      name : "Swiss Mercenaries" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {
	let num = 2;
	let f = faction;
	if (faction == "france" || faction == "ottoman") { num = 4; f = "france"; }
        his_self.game.queue.push("swiss_mercenaries\t"+f+"\t"+num);
	return 1;
      },
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  let f = "";

	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('036')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

          return { faction : f , event : '036', html : `<li class="option" id="036">swiss mercenaries (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('036')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  if (faction == "ottoman" || faction == "france") {
	  } else {
            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, faction, 
	      function(space) {
		if (!his_self.isSpaceUnderSiege(space.key)) { return 0; }
		if (!his_self.returnFriendlyLandUnitsInSpace("france", space.key)) { return 0; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	      } ,
	      null ,
	      null ,
	      true
	    );
	  }
	}
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "swiss_mercenaries") {

          let faction = mv[1];
          let num = parseInt(mv[2]);
          his_self.game.queue.splice(qe, 1);

	  let player = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == player) {

            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", num, faction,
	      function(space) {
		if (his_self.isSpaceUnderSiege(space.key)) { return 0; }
		if (his_self.returnFactionLandUnitsInSpace(faction, space.key)) { return 1; }
		if (his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 1; }
	        return 0;
	      } ,
	      null ,
	      null ,
	      true
	    );
	  }
	  return 0;
        }

	return 1;
      },
    }
    deck['037'] = { 
      img : "cards/HIS-037.svg" , 
      name : "The Wartburg" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player, card="") {

        if (menu == "event") {

	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }

	  let p = his_self.returnPlayerOfFaction();

          if (his_self.game.state.leaders.luther !== 1) { return {}; }
          if (card === "") { return {}; }
          if (!his_self.game.deck[0]) { return {}; }

	  //
	  // card evented
	  //
	  let cardobj = his_self.game.deck[0].cards[card];

	  //
	  // cannot cancel non-papal home cards
	  //
	  if (card === "001" || card == "002" || card == "003" || card == "004") { return {}; }

	  //
	  // cannot cancel these three types of cards
	  //
	  if (cardobj.type === "response") { return {}; }
	  if (cardobj.type === "mandatory") { return {}; }
	  if (cardobj.type === "combat") { return {}; }

          return { faction : "protestant" , event : '037', html : `<li class="option" id="037">wartburg (protestant)</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "event") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('037')) {
	      if (his_self.returnPlayerOfFaction("protestant") == his_self.game.player) {
 		return 1;
	      }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "event") {
	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
          his_self.addMove("NOTIFY\tWartburg Evented");
          his_self.addMove("wartburg");
          his_self.addMove("discard\tprotestant\t037");
          his_self.addMove("commit\tprotestant\tluther-debater");
	  his_self.endTurn();
	  his_self.updateStatus("wartburg acknowledge");
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "wartburg") {

          his_self.game.queue.splice(qe, 1);

	  his_self.displayModal("Protestants cancel event with the Wartburg");

	  his_self.updateStatus(his_self.popup("037") + " triggered");
	  his_self.game.state.events.wartburg = 1;
	  his_self.commitDebater("protestant", "luther-debater", 0);
	  his_self.updateLog(his_self.popup("037") + " triggered");

	  //
	  // remove event from execution and end player turn
	  //
	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lmv = his_self.game.queue[i].split("\t");
	    if (lmv[0] !== "remove" && lmv[0] !== "discard" && lmv[0] !== "round" && lmv[0] !== "play") {
	      his_self.game.queue.splice(i, 1);
	    } else {
	      if (lmv[0] === "round" || lmv[0] === "play") {
	        i = -1;
		break;
	      }
	    }
	  }

	  return 1;

        }

	return 1;
      },
    }
    deck['038'] = { 
      img : "cards/HIS-038.svg" , 
      name : "Halley's Comet" ,
      ops : 2 ,
      turn : 3 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu != "" && menu != "pre_spring_deployment") {

	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }

          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('038')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '038', html : `<li class="option" id="038">halley's comet (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu != "" && menu != "pre_spring_deployment") {
	  if (!his_self.game.deck) { return 0; }
	  if (!his_self.game.deck[0]) { return 0; }
	  if (!his_self.game.deck[0].fhand) { return 0; }
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('038')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu != "" && menu != "pre_spring_deployment") {
  	  his_self.addMove("event\t"+faction+"\t038");
  	  his_self.addMove("discard\t"+faction+"\t038");
	  his_self.endTurn();
        }
        return 0;
      },
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction(faction);

	if (player == his_self.game.player) {

	  let msg = "Target which Power?";
	  let html = '<ul>';

	  if (faction != "protestant") { html += '<li class="option" id="protestant">Protestant</li>'; }
	  if (faction != "papacy") { html += '<li class="option" id="papacy">Papacy</li>'; }
	  if (his_self.game.players.length > 2) {
	    if (faction != "england") { html += '<li class="option" id="england">England</li>'; }
	    if (faction != "france") { html += '<li class="option" id="france">France</li>'; }
	    if (faction != "hapsburg") { html += '<li class="option" id="hapsburg">Haspburg</li>'; }
	    if (faction != "ottoman") { html += '<li class="option" id="ottoman">Ottoman</li>'; }
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let target_faction = $(this).attr("id");

  	    let msg = "Force Power to Discard or Skip Turn?";
	    let html = '<ul>';
	    html += '<li class="option" id="discard">discard random card</li>';
	    html += '<li class="option" id="skip">skip next turn</li>';
	    html += '<ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      his_self.updateStatus("submitted");

	      if (action === "discard") {
                his_self.addMove("discard_random\t"+target_faction);
		his_self.endTurn();
	      }

	      if (action === "skip") {
                his_self.addMove("skip_next_impulse\t"+target_faction);
		his_self.endTurn();
	      }

	    });
	  });

          return 0;

        }

	return 0;
      },
    }
    deck['039'] = { 
      img : "cards/HIS-039.svg" , 
      warn : ["papacy"] ,
      name : "Augsburg Confession" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	if (his_self.isCommitted("melanchthon-debater")) { return 0; }
 	return 1;
      } ,
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction(faction);

	if (his_self.isCommitted("melanchthon-debater")) { return 1; }
	his_self.game.state.events.augsburg_confession = true;
	his_self.commitDebater("papacy", "melanchton-debater", 0); // 0 = no bonus

	return 1;
      },
    }
    deck['040'] = { 
      img : "cards/HIS-040.svg" , 
      name : "MachiaveIIi: The Prince" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	if (player == his_self.game.player) {

	  let powers = his_self.returnImpulseOrder();
	  let msg = "Declare War on which Power?";

          let html = '<ul>';
	  for (let i = 0; i < powers.length; i++) {
            html += '<li class="option" id="${powers[i]}">${powers[i]}</li>';
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");

            his_self.addMove("ops\t"+faction+"\t"+"040"+"\t"+2);
            his_self.addMove("declare_war\t"+faction+"\t"+action);
	    his_self.endTurn();

	  });

          return 0;

        }

	return 1;
      },
    }

    deck['041'] = { 
      img : "cards/HIS-041.svg" , 
      name : "Marburg Colloquy" ,
      warn : ["papacy"] ,
      ops : 5 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { 
	if (
	  (his_self.isCommitted("luther-debater") != 1 || his_self.isCommitted("melanchthon-debater"))
	  &&
	  (his_self.isCommitted("zwingli-debater") != 1 || his_self.isCommitted("oekolampadius-debater"))
	) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction("protestant");
	if (his_self.game.player === player) {

	  let msg = "Commit which Debaters?";
          let html = '<ul>';
	  if (his_self.isCommitted("luther-debater") != 1) {
	    if (his_self.isCommitted("zwingli-debater") != 1) {
              html += '<li class="option" id="lz">Luther and Zwingli</li>';
	    }
	    if (his_self.isCommitted("oekolampadius-debater") != 1) {
              html += '<li class="option" id="lo">Luther and Oekolampadius</li>';
	    }
	  }
	  if (his_self.isCommitted("melanchthon-debater") != 1) {
	    if (his_self.isCommitted("zwingli-debater") != 1) {
              html += '<li class="option" id="mz">Melanchthon and Zwingli</li>';
	    }
	    if (his_self.isCommitted("oekolampadius-debater") != 1) {
              html += '<li class="option" id="mo">Melanchthon Oekolampadius</li>';
	    }
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");
	    let refs = 0;

            his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");

	    if (action !== "lz") {
	      his_self.addMove("commit\tprotestant\tluther-debater");
	      his_self.addMove("commit\tprotestant\tzwingli-debater");
	      refs = 7;
	    }
	    if (action !== "lo") {
	      his_self.addMove("commit\tprotestant\tluther-debater");
	      his_self.addMove("commit\tprotestant\toekolampadius-debater");
	      refs = 6;
	    }
	    if (action !== "mz") {
	      his_self.addMove("commit\tprotestant\tzwingli-debater");
	      his_self.addMove("commit\tprotestant\tmalanchthon-debater");
	      refs = 6;
	    }
	    if (action !== "mo") {
	      his_self.addMove("commit\tprotestant\toekolampadius-debater");
	      his_self.addMove("commit\tprotestant\tmalanchthon-debater");
	      refs = 5;
	    }

	    for (let i = 0; i < refs; i++) {
              his_self.prependMove("protestant_reformation\t"+player+"\tall");
	    }
	
            his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	    his_self.endTurn();

	  });
	}
	return 0;
      },
    }
    deck['042'] = { 
      img : "cards/HIS-042.svg" , 
      name : "Roxelana" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['043'] = { 
      img : "cards/HIS-043.svg" , 
      name : "Zwingli Dons Armor" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction("protestant");
	let targets = ["zurich","innsbruck","salzberg","linz","graz","regensburg","augsburg","nuremberg","worms","basel","geneva","turin","grenoble","lyon","besancon","dijon","metz","strasburg"];

	//
	// we all remove the reformer
	//
	his_self.removeReformer("protestant", "zurich", "zwingli-reformer");
	his_self.removeDebater("protestant", "zwingli-debater");

	if (player == his_self.game.player) {

	  let msg = "Remove 1 Catholic Land Unit?";
	  let viable_targets = 0;
          let html = '<ul>';
	  for (let i = 0; i < targets.length; i++) {
	    if (his_self.hasCatholicLandUnits(targets[i])) {
	      viable_targets++;
              html += `<li class="option" id="${targets[i]}">${targets[i]}</li>`;
	    }
	  }
	  if (viable_targets == 0) {
            html += '<li class="option" id="skip">skip</li>';
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");

	    if (action != "skip") {

	      his_self.endTurn();

	    } else {

	      let catholic_land_units = his_self.returnCatholicLandUnitsInSpace(action);
	      let msg = "Remove which Unit?";
              let html = '<ul>';
	      for (let i = 0; i < catholic_land_units.length; i++) {
	        let u = his_self.game.spaces[action].units[catholic_land_units[i].faction][catholic_land_units[i].unit_idx];
                html += '<li class="option" id="${catholic_land_units[i].faction}_${catholic_land_units[i].unit_idx}">${catholic_land_units[i].faction} - ${u.type}</li>';
	      }

    	      his_self.updateStatusWithOptions(msg, html);

	      $('.option').off();
	      $('.option').on('click', function () {
	        $('.option').off();
	        let x = $(this).attr("id").split("_");
		his_self.addMove("destroy_unit_by_index\t"+x[0]+"\t"+action+"\t"+"\t"+x[1]);
		his_self.endTurn();            
	      });

	    }
	  });

          return 0;

        }

	return 0;
      },
    }
    deck['044'] = { 
      img : "cards/HIS-044.svg" , 
      name : "Affair of the Placards" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { if (!his_self.isCommitted("cop-debater")) { return 0; } return 1; } ,
      onEvent : function(his_self, faction) {

	if (his_self.isCommitted("cop-debater")) { return 1; }

	his_self.commitDebater("protestant", "cop-debater", 0); // no bonus

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("NOTIFY\t"+his_self.popup("044"));

	return 1;
      },
    }
    deck['045'] = { 
      img : "cards/HIS-045.svg" , 
      name : "Calvin Expelled" ,
      ops : 1 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

        let obj = {};
        obj.faction = "protestant";
	obj.space = "geneva";
	obj.reformer = his_self.reformers["calvin-reformer"];
        let target = his_self.returnSpaceOfPersonage("protestant", "calvin-reformer");

	if (target) {
  	  for (let i = 0; i < his_self.game.spaces[target].units["protestant"].length; i++) {
	    if (his_self.game.spaces[target].units["protestant"][i].type == "calvin-reformer") {
              obj.reformer = his_self.game.state.spaces[target].units["protestant"][idx];
	      his_self.game.spaces[target].units["protestant"].splice(i, 1);
	    }
	  }
	}

	his_self.removeDebater("protestant", "calvin-debater");
        his_self.game.state.reformers_removed_until_next_round.push(obj);

	his_self.displaySpace(target);

        return 1;
      },
    }
    deck['046'] = { 
      img : "cards/HIS-046.svg" , 
      name : "Calvin's Insitutes" ,
      ops : 5 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { if (!his_self.isCommitted("calvin-debater")) { return 1; } return 0; } ,
      onEvent : function(his_self, faction) {

	if (his_self.isCommitted("calvin-debater")) { return 1; }

	his_self.commitDebater("protestant", "calvin-debater", 0); // no bonus

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.addMove("SETVAR\tstate\tevents\tcalvins_institutions\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.addMove("SETVAR\tstate\tevents\tcalvins_institutions\t1");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("LOG\tCalvin's Institutes");

	return 1;
      },
    }
    deck['047'] = { 
      img : "cards/HIS-047.svg" , 
      name : "Copernicus" ,
      ops : 6 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

        let home_spaces = his_self.returnSpacesWithFilter(
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].home === faction) {
	    }
	  }
	);

	let total = home_spaces.length;
	let count = 0;
	let double_vp = 0;

	for (let i = 0; i < home_spaces.length; i++) {
	  if (his_self.game.spaces[home_spaces[i]].religion === "protestant") { count++; }
	}

	if (count >= (total/2)) {
	  double_vp = 1;
	}

	//
	//
	//
	if (double_vp == 1) {

	  // faction will gain when counted
	  his_self.game.state.events.copernicus = faction;
	  his_self.game.state.events.copernicus_vp = 2;
	  his_self.displayVictoryTrack();

	} else {

	  his_self.game.state.events.copernicus = faction;
	  his_self.game.state.events.copernicus_vp = 2;

	  let p = his_self.returnPlayerOfFaction(faction);

	  //
	  // player processes and adds move / ends turn
	  //
	  if (his_self.game.player == p) {

	    let msg = "Which would you prefer?";
    	    let html = '<ul>';
                html += '<li class="option" id="draw">draw 1 card</li>';
                html += '<li class="option" id="discard">protestants discard</li>';
    		html += '</ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {
	      let action = $(this).attr("id");

	      if (action === "draw") {

	 	//	
	 	// deal a card	
	 	//
	        let cardnum = 1;

                his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+faction);
                his_self.addMove("DEAL\t1\t"+p+"\t"+(cardnum));
		his_self.endTurn();

	      } else {

                his_self.addMove("discard_random\tprotestant");
		his_self.endTurn();

	      }
	    });

	  }
	}

	return 0;

      },

    }
    deck['048'] = { 
      img : "cards/HIS-048.svg" , 
      name : "Galleons" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['049'] = { 
      img : "cards/HIS-049.svg" , 
      name : "Huguenot Raiders" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['050'] = { 
      img : "cards/HIS-050.svg" , 
      name : "Mercator's Map" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['051'] = { 
      img : "cards/HIS-051.svg" , 
      name : "Michael Servetus" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.updateLog(his_self.returnFactionName(faction) + " +1 VP from Michael Servetus");
	his_self.game.state.events.michael_servetus = faction;
	his_self.game.queue.push("discard_random\tprotestant");

	return 1;

      }
    }
    deck['052'] = { 
      img : "cards/HIS-052.svg" , 
      name : "Michelangelo" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let x = his_self.rollDice(6);
	let y = his_self.rollDice(6);

	his_self.updateLog("Papacy rolls "+x+" and "+y);

	his_self.game.queue.push("build_saint_peters_with_cp\t"+(x+y));

        return 1;
          
      },
    }
    deck['053'] = { 
      img : "cards/HIS-053.svg" , 
      name : "Plantations" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['054'] = { 
      img : "cards/HIS-054.svg" , 
      name : "Potosi Silver Mines " ,
      ops : 3 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['055'] = { 
      img : "cards/HIS-055.svg" , 
      name : "Jesuit Education" ,
      ops : 3 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { if (his_self.game.state.events.society_of_jesus) { return 1; } return 0; } ,
      onEvent : function(his_self, faction) {
	if (his_self.game.state.events.society_of_jesus) { his_self.game.queue.push("jesuit_education"); }
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "jesuit_education") {

	  if (!his_self.game.state.events.society_of_jesus) { return 1; }

          his_self.game.queue.splice(qe, 1);
	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player == player) {

	    his_self.playerSelectSpaceWithFilter(
	      "Select Catholic Space for 1st Jesuit University",
	      function(space) { if (space.religion === "catholic" && space.university != 1) { return 1; } return 0; },
	      function(spacekey) {

		let s = his_self.game.spaces[spacekey].university = 1;
		his_self.displaySpace(s);
		his_self.addMove("jesuit_university\t"+spacekey);

	        his_self.playerSelectSpaceWithFilter(
	          "Select Catholic Space for 2nd Jesuit University",
	          function(space) { if (space.religion === "catholic" && space.university != 1) { return 1; } return 0; },
	          function(spacekey) {

		    let s = his_self.game.spaces[spacekey].university = 1;
		    his_self.displaySpace(s);
		    his_self.addMove("jesuit_university\t"+spacekey);
		    his_self.endTurn();
		  },
		  null,
		  true
		);

	      },
	      null ,
	      true
	    );

	  } else {
	    his_self.updateStatus("Papacy building Jesuit Universities");
	  }

	  return 0;

        }
        return 1;
      }


    }
    deck['056'] = { 
      img : "cards/HIS-056.svg" , 
      warn : ["protestant"] ,
      name : "Papal Inquistion" ,
      ops : 5 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	if (his_self.isCommitted("caraffe-debater")) { return 1; }

	his_self.commitDebater("papacy", "caraffe-debater", 0); // no bonus
	his_self.addMove("papal_inquisition_card_draw");
	his_self.addMove("papal_inquisition_target_player");
	his_self.addMove("papal_inquisition_convert_spaces");
	his_self.endTurn();

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "papal_inquisition_convert_spaces") {

	  let player = his_self.returnPlayerOfFaction("papacy");
          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player === player) {

	    his_self.playerSelectSpaceWithFilter(
	      "Select Protestant Space to Convert",
	      function(space) { if (space.language === "italian" && space.religion === "protestant") { return 1; } return 0; },
	      function(spacekey) {
		his_self.addMove("convert\t"+spacekey+"\tcatholic");

	        his_self.playerSelectSpaceWithFilter(
	          "Select Protestant Space to Convert",
	          function(space) { if (space.language === "italian" && space.religion === "protestant") { return 1; } return 0; },
	          function(spacekey) {
		    his_self.addMove("convert\t"+spacekey+"\tcatholic");
		    his_self.endTurn();
		  },
		  null,
		  true
		);
	      },
	      null ,
	      true
	    );

	  } else {
	    his_self.updateStatus("Papal Inquisition - Religion Conversion");
	  }

	  return 0;

	}

        if (mv[0] == "papal_inquisition_target_player") {

          his_self.game.queue.splice(qe, 1);
	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player == player) {

 	    let msg = "Choose Player to Reveal Cards:";
            let html = '<ul>';
            html += '<li class="option" id="protestant">Protestant</li>';
            if (his_self.game.players.length > 2) { html += '<li class="option" id="england">England</li>'; }
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

              his_self.addMove("papal_inquisition_draw_card\t"+action);
              his_self.addMove("request_reveal_hand\tpapacy\t"+action);
              his_self.endTurn();

	    });
	  } else {
	    his_self.updateStatus("Papal Inquisition - Selecting Target");
	  }

	  return 0;

	}

        if (mv[0] == "papal_inquisition_draw_card") {

	  let target = mv[1];
	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player === player) {

            his_self.game.queue.splice(qe, 1);

 	    let msg = "Choose Action:";
            let html = '<ul>';
            html += '<li class="option" id="draw">draw ${target} card</li>';
            html += '<li class="option" id="recover">recover from discard pile</li>';
            html += '<li class="option" id="debate">initiate debate +2 dice</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action === "draw") {
                his_self.addMove("pull_card\tpapacy\t"+target);
                his_self.endTurn();
	      }
	      if (action === "recover") {
                his_self.addMove("papal_inquisition_recover_discard");
                his_self.endTurn();
	      }
	      if (action === "debate") {
                his_self.addMove("papal_inquisition_debate");
                his_self.endTurn();
	      }
	    });
	  } else {
	    his_self.updateStatus("Papal Inquisition - Follow-Up Action");
	  }

	  return 0;

	}

        if (mv[0] == "papal_inquisition_recover_discard") {

	  let player = his_self.returnPlayerOfFaction("papacy");

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player == player) {

            let msg = "Retrieve Card from Discard Pile: ";
            let html = '<ul>';
            for (let key in his_self.game.deck[0].discards) {
              html += `<li class="option" id="${key}">${his_self.game.deck[0].cards[key].name}</li>`;
            }
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {
              $('.option').off();
              let card = $(this).attr("id");
              his_self.addMove("papal_inquisition_recover_card\t"+card);
              his_self.endTurn();
            });

	  } else {
	    his_self.updateStatus("Papal Inquisition - Recovering Card");
	  }

	  return 0;
        }

        if (mv[0] == "papal_inquisition_recover_card") {

          let card = mv[1];

          if (his_self.game.deck[0].discards[card]) {

            let p = his_self.returnPlayerOfFaction("papacy");

            //
            // player returns to hand
            //
            if (his_self.game.player === p) {
              let fhand_idx = his_self.returnFactionHandIdx(p, faction);
              his_self.game.deck[0].fhand[fhand_idx].push(card);
            }

            //
            // everyone removes from discards
            //
            delete his_self.game.deck[0].discards[card];

          }

	  return 1;

	}

        if (mv[0] == "papal_inquisition_debate") {

          his_self.game.queue.splice(qe, 1);
	  his_self.game.state.events.papal_inquisition_debate_bonus = 1;
	  his_self.game.queue.push("SETVAR\tstate\tevents\tpapal_inquisition_debate_bonus\t0");
	  his_self.game.queue.push("papal_inquisition_call_theological_debate");
	  return 1;

	}
        if (mv[0] == "papal_inquisition_call_theological_debate") {

          his_self.game.queue.splice(qe, 1);
	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player == player) {
	    his_self.playerCallTheologicalDebate(his_self, player, "papacy");
	  } else {
	    his_self.updateStatus("Papacy calling Theological Debate");
	  }
 
	  return 0;

        }

      return 1;

      }
    }
    deck['057'] = { 
      img : "cards/HIS-057.svg" , 
      name : "Philip of Hesse's Bigamy" ,
      ops : 2 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.queue.push("philip_of_hesse_bigamy");
	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "remove_philip_of_hesse") {

	  let ph = his_self.returnSpaceOfPersonage("protestant", "philip-hesse");
	  his_self.removeArmyLeader("protestant", ph, "philip-hesse");
	  his_self.displaySpace(ph);
	  his_self.updateLog("Philip of Hesse removed from game");
          his_self.game.queue.splice(qe, 1);

	  return 1;

	}


        if (mv[0] == "philip_of_hesse_bigamy") {

          his_self.game.queue.splice(qe, 1);
	  let player = his_self.returnPlayerOfFaction("protestant");

	  if (his_self.game.player === player) {

 	    let msg = "Choose Action: ";
            let html = '<ul>';
            html += '<li class="option" id="discard">discard card</li>';
            html += '<li class="option" id="hesse">remove Philip of Hesse</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action === "hesse") {
		his_self.addMove("remove_philip_of_hesse");
		his_self.endTurn();
	      }

	      if (action === "discard") {
		his_self.addMove("discard_random\tprotestant");
		his_self.endTurn();
	      }

	    });
	  } else {
	    his_self.updateStatus("Protestants - Philip of Hesse's Bigamy");
	  }

	  return 0;

	}

        return 1;

      }
    }
    deck['058'] = { 
      img : "cards/HIS-058.svg" , 
      warn : ["protestant"] ,
      name : "Spanish Inquisition" ,
      ops : 5 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['059'] = { 
      img : "cards/HIS-059.svg" , 
      name : "Lady Jane Grey" ,
      ops : 3 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['060'] = { 
      img : "cards/HIS-060.svg" , 
      warn : ["ottoman","england","france","papacy"] ,
      name : "Maurice of Saxony" ,
      ops : 4 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (
	     faction === "hapsburg" || 
	     faction === "protestant" || 
	       (
		 faction === "papacy" && 
	  	 his_self.game.players.length == 2 && 
		 his_self.game.state.events.schmalkaldic_league == 1
	       )
	) { return 1; } return 0; 
      } ,
      onEvent : function(his_self, faction) {

	his_self.playerSelectSpaceWithFilter(
	  "Select Fortified Space for Maurice of Saxony" ,
	  function(space) {
	    if (his_self.isSpaceControlled(space.key, faction) && his_self.isSpaceFortified(space.key)) {
	      return 1;
	    }
	    return 0;
	  },
	  function(spacekey) {
	    his_self.addMove("maurice_of_saxony\t"+faction+"\t"+spacekey);
	    his_self.endTurn();
	  },
	  null,
	  true
	);

	return 0;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "maurice-of-saxony") {

	  let faction = mv[1];
	  let spacekey = mv[2];

          for (let i = 0; i < this.game.players.length; i++) {
            let p = this.game.state.players_info[i];
            for (let z = 0; z < p.captured.length; z++) {
	      if (p.captured[z].type == "maurice-of-saxony") {
		p.captured[z].splice(z, 1);
	      }
	    }
          }

          his_self.game.queue.splice(qe, 1);
          let ms = his_self.returnSpaceOfPersonage(his_self.game.state.events.maurice_of_saxony, "maurice-of-saxony");

	  if (his_self.game.state.events.maurice_of_saxony != "" || ms != "") {

	    let current_owner = his_self.game.state.events.maurice_of_saxony;
            let ms = his_self.returnSpaceOfPersonage(his_self.game.state.events.maurice_of_saxony, "maurice-of-saxony");

	    let loop_length = his_self.game.spaces[ms].units[current_owner].length;
	    for (let i = 0; i < loop_length; i++) {
	      let u = his_self.game.spaces[ms].units[current_owner][i];
	      if (u.type === "mercenary" || u.type === "maurice-of-saxony") {
	        his_self.game.spaces[spacekey].units[faction].push(u);
	        his_self.game.spaces[ms].units[current_owner].splice(i, 1);
		i--;
	        loop_length = his_self.game.spaces[ms].units[current_owner].length;
		if (u.type === "maurice-of-saxony") {
		  u.img = "Maurice_Hapsburg.svg";
		  if (faction === "protestant") {
		    u.img = "Maurice_Protestant.svg";
		  }
		}
	      }
	    }

	  } else {

	    his_self.addArmyLeader(faction, spacekey, "maurice-of-saxony");
            let ms = his_self.returnSpaceOfPersonage(his_self.game.state.events.maurice_of_saxony, "maurice-of-saxony");
	    let ms_idx = his_self.returnIndexOfPersonageInSpace(faction, "maurice-of-saxony", ms);
	    let u = his_self.game.spaces[ms].units[faction][ms_idx];
	    u.img = "Maurice_Hapsburg.svg";
	    if (faction === "protestant") { u.img = "Maurice_Protestant.svg"; }

	  }
	
	  his_self.game.state.events.maurice_of_saxony = faction;
	  return 1;

	}

	return 1;
      }
    }
    deck['061'] = { 
      img : "cards/HIS-061.svg" , 
      warn : ["protestant"] ,
      name : "Mary Defies Council" ,
      ops : 1 ,
      turn : 7 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("catholic_counter_reformation\tpapacy\tengland");
	his_self.game.queue.push("catholic_counter_reformation\tpapacy\tengland");
	his_self.game.queue.push("catholic_counter_reformation\tpapacy\tengland");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	return 1;
      },
    }
    deck['062'] = { 
      img : "cards/HIS-062.svg" , 
      name : "Book of Common Prayer" ,
      warn : ["papacy"] ,
      ops : 2 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { if (his_self.isDebaterCommitted("cranmer-debater")) { return 1; } return 0; } ,
      onEvent : function(his_self, faction) {

	let d = his_self.rollDice(6);

        if (d == 3 || d == 4) {
	  his_self.game.queue.push("player_add_unrest\t"+faction+"\tenglish\tcatholic");
	}        
        if (d == 5) {
	  his_self.game.queue.push("player_add_unrest\t"+faction+"\tenglish\tcatholic");
	} 
        if (d == 6) {
	  for (let spacekey in his_self.game.spaces) {
	    if (his_self.game.spaces[spacekey].language == "english" && his_self.game.spaces[spacekey].religion == "catholic") {
	      his_self.game.queue.push("unrest\t"+spacekey);
	    }
          }
	}

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	return 1;
      },
    }
    deck['063'] = { 
      img : "cards/HIS-063.svg" , 
      name : "Dissolution of the Monasteries" ,
      ops : 4 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("discard_random\tpapacy");

	return 1;
      }
    }
    deck['064'] = { 
      img : "cards/HIS-064.svg" , 
      name : "Pilgrimage of Grace" ,
      ops : 3 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player === player) {

	    let already_selected = [];

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

		his_self.endTurn();

	   }, null, true);
	   }, null, true);
	   }, null, true);
	   }, null, true);
	   }, null, true);

	} else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("064"));
	}

	   return 0;
      },
    }
    deck['065'] = { 
      img : "cards/HIS-065.svg" , 
      warn : ["papacy"] ,
      name : "A Mighty Fortress" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.isDebaterCommitted("luther-debater")) { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	player = his_self.returnPlayerOfFaction("protestant");

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("commit\tprotestant\tluther-debater");

	return 1;
      },
    }
    deck['066'] = { 
      img : "cards/HIS-066.svg" , 
      name : "Akinji Raiders" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {

	let enemies = his_self.returnEnemies("ottoman");
	let neighbours = [];
	let spaces = his_self.returnSpacesWithFilter(
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].units["ottoman"].length > 0) {
	      for (let z = 0; z < his_self.game.spaces[spacekey].units["ottoman"].length; z++) {
	        if (his_self.game.spaces[spacekey].units["ottoman"][z].type === "cavalry") {
	          if (his_self.isSpaceControlled(spacekey, "ottoman")) {
		    return 1;
		  }
	        }
	      }
	    }
	  }
        );

	//
	// two hops !
	//
	for (let i = 0; i < spaces.length; i++) {
	  let s = his_self.game.spaces[spaces[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	  }
	}
	for (let i = 0; i < neighbours.length; i++) {
	  let s = his_self.game.spaces[neighbours[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    if (his_self.isSpaceControlled(s.neighbours[ii], "ottoman")) {
	      if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	    }
	  }
	}

	//
	// enemy control any of these neighbours?
	//
	for (let i = 0; i < neighbours.length; i++) {
	  for (let ii = 0; ii < enemies.length; ii++) {
	    if (his_self.isSpaceControlled(neighbours[i], enemies[ii])) {
	      return 1;
	    }
	  }
	}

	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	let target_which_faction = [];

	if (his_self.game.player == p) {

	  let enemies = his_self.returnEnemies("ottoman");
	  let neighbours = [];
	  let spaces = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.game.spaces[spacekey].units["ottoman"].length > 0) {
	      for (let z = 0; z < his_self.game.spaces[spacekey].units["ottoman"].length; z++) {
	        if (his_self.game.spaces[spacekey].units["ottoman"][z].type === "cavalry") {
	          if (his_self.isSpaceControlled(spacekey, "ottoman")) {
	  	    return 1;
		  }
	        }     
	      }
	    }
	  });

	  //
	  // two hops !
	  //
	  for (let i = 0; i < spaces.length; i++) {
	    let s = his_self.game.spaces[spaces[i]];
	    for (let ii = 0; ii < s.neighbours.length; ii++) {
	      if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	    }
	  }
	  for (let i = 0; i < neighbours.length; i++) {
	    let s = his_self.game.spaces[neighbours[i]];
	    for (let ii = 0; ii < neighbours.length; ii++) {
	      if (his_self.isSpaceControlled(neighbours[ii], "ottoman")) {
	        if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	      }
	    }
	  }

	  //
	  // enemy control any of these neighbours?
	  //
	  for (let i = 0; i < neighbours.length; i++) {
	    for (let ii = 0; ii < enemies.length; ii++) {
	      if (his_self.isSpaceControlled(neighbours[i], enemies[ii])) {
	        if (!target_which_faction.includes(enemies[ii])) { target_which_faction.push(enemies[ii]); }
	      }
	    }
	  }
	}

        let msg = "Steal Random Card from Which Faction?";
        let html = '<ul>';
        for (let i = 0; i < target_which_faction.length; i++) {
           html += '<li class="option" id="${target_which_faction}">${target_which_faction[i]}</li>';
	}
	html += '</ul>';

    	his_self.updateStatusWithOptions(msg, html);

	$('.option').off();
	$('.option').on('click', function () {

	  let action = $(this).attr("id");
	  his_self.addMove("pull_card\tottoman\t"+action);
          his_self.endTurn();

	});

        return 0;
      }
    }
    deck['067'] = { 
      img : "cards/HIS-067.svg" , 
      warn : ["protestant"] ,
      name : "Anabaptists" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {
          if (0 == his_self.playerSelectSpaceWithFilter(

	    "Select First Space to Convert", 

	    function(space) {
	      if (space.religion == "protestant" && his_self.isOccupied(space) == 0 && !his_self.isElectorate(space)) {
		return 1;
	      }
	      return 0;
	    },

	    function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let first_choice = space.key;

              if (0 == his_self.playerSelectSpaceWithFilter(

	        "Select Second Space to Convert", 

	        function(space2) {
	          if (space2.religion == "protestant" && his_self.isOccupied(space2) == 0 && !his_self.isElectorate(space2) && space2.key != first_choice) {
		    return 1;
	          }
	          return 0;
	        },

	        function(second_choice) {

		  his_self.addMove("convert\t"+second_choice+"\tcatholic");
		  his_self.addMove("convert\t"+first_choice+"\tcatholic");
		  his_self.endTurn();

	        },

		null , 

		true 
	      )) { 
	        his_self.updateStatus("No acceptable targets for Anabaptists");
	        his_self.endTurn();
	      };
	    } ,

	    null ,

	    true 
	  )) {
	    his_self.updateStatus("No acceptable targets for Anabaptists");
	    his_self.endTurn();
	  };
	} else {
	  his_self.updateStatus("Papacy playing "+his_self.popup("067"));
	}
	return 0;
      }
    }
    deck['068'] = { 
      img : "cards/HIS-068.svg" , 
      name : "Andrea Doria" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("genoa");
	if (faction !== f) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("genoa");
	his_self.deactivateMinorPower(f, "genoa");
	his_self.activateMinorPower(faction, "genoa");
	return 1;
      },
    }
    deck['069'] = { 
      img : "cards/HIS-069.svg" , 
      name : "Auld Alliance" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("scotland");
        if (faction === "france") {
	  return 1;
	}
        if (faction === "england" && f !== "") {
	  return 1;
	} 
	return 0;
      },
      onEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("scotland");
	if (faction === "england") {
 	  if (f !== "") {
	    his_self.deactivateMinorPower(f, "scotland");
	  }
	}
	if (faction === "france") {
	  if (f == "") {
	    his_self.activateMinorPower(faction, "scotland");
	  } else {
	    if (f === "france") {


	      let p = his_self.returnPlayerOfFaction("france");
	      if (p === his_self.game.player) {

	        //
	        // add upto 3 new French regulars in any Scottishhome space under French control that isnot under siege.
	        //
   	        his_self.playerSelectSpaceWithFilter(

	  	  "Select Unbesieged Scottish Home Space Under French Control", 

		  function(space) {
		    if (space.home == "scotland") {
		      if (his_self.isSpaceControlled(space, "france")) {
		        if (!space.besieged) {
		          return 1;
		        }
		      }
		    }
		  },

		  function(spacekey) {
	            his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
	            his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
	            his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
		    his_self.endTurn();
		  }
	        );

		return 0;

	      } else {
		return 0;
	      }
	    } else {
	      his_self.deactivateMinorPower(f, "scotland");
	    }
	  }
	}
	return 1;
      },
    }
    deck['070'] = { 
      img : "cards/HIS-070.svg" , 
      name : "Charles Bourbon" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league != 1) { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (p == his_self.game.player) {

	  his_self.playerSelectSpaceWithFilter(

	    "Select Unbesieged Space You Control",

	    function(space) {
	      // 2P must be German or Iralian space
	      if (his_self.game.players.length == 2) { if (space.language != "italian" && space.language != "german") { return false; } }
	      if (space.besieged) { return 0; }
	      if (his_self.isSpaceControlled(space, faction)) { return 1; }
	      return 0;
	    },

	    function(spacekey) {
	      let space = his_self.game.spaces[spacekey];
	      his_self.addMove("add_army_leader\t"+faction+"\t"+spacekey+"\t"+"renegade");
              his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
	      his_self.endTurn();
	    },

	    null,

	    true 

	  );
	} else {
	  his_self.updateStatus(his_self.popup("070") + " entering play");
	}

	return 0;
      },
    }
    deck['071'] = { 
      img : "cards/HIS-071.svg" , 
      name : "City State Rebels" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.players.length == 2) {
	  if (his_self.game.state.events.schmalkaldic_league && space.political == "hapsburg") { return 1; }
	  return 0;
	}
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (p == his_self.game.player) {

	  his_self.playerSelectSpaceWithFilter(

	    "Select Occupied Territory",

	    function(space) {

	      // 2P game - may be played against electorate under Hapsburg Control
	      if (his_self.game.players.length == 2) {
		if (his_self.game.state.events.schmalkaldic_league) { if (space.type == "electorate" && ((space.political == "protestant" && space.home == "hapsburg") || (space.political == "hapsburg" && space.home == "protestant"))) { if (his_self.returnFactionLandUnitsInSpace("haspburg", space.key)) { return 1; } } }
	      }

	      // captured key
	      if (space.home === "independent" && (space.political !== space.home && space.political !== "" && space.political)) { return 1; }

	      // captured non-allied home
	      if (space.home !== space.political && space.political !== "") {
		if (!space.besieged) {
	          if (!his_self.areAllies(space.home, space.political)) { 
		    if (space.home !== "" && space.political !== "") { return 1; }
		  }
	        }
	      }

	      // electorate under hapsburg control
	      if (his_self.game.state.events.schmalkaldic_league == 1) {
		if (his_self.isElectorate(space.key)) {
		  if (his_self.isSpaceControlled(space.key, "hapsburg")) { return 1; }
		}
	      }

	      return 0;
	    },

	    function(spacekey) {
	      his_self.addMove("city-state-rebels\t"+faction+"\t"+spacekey);
	      his_self.endTurn();
	    },

	    null,

	    true

	  );
	} else {
	  his_self.updateStatus("Opponent playing " + his_self.popup("071"));
	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "city-state-rebels") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let respondent = his_self.returnFactionControllingSpace(spacekey);

          his_self.game.queue.splice(qe, 1);

          his_self.updateLog(his_self.returnFactionName(faction) + " plays " + his_self.popup("071") + " against " + spacekey);

	  let hits = 0;
	  for (let i = 0; i < 5; i++) {
	    let roll = his_self.rollDice(6);
	    if (roll >= 5) {
	      hits++;
	    }
	  }

	  //
	  // TODO, return zero and add choice of unit removal, for now remove army before navy
	  //
	  let p = his_self.returnPlayerOfFaction(respondent);

console.log("HITS: " + hits);

	  if (his_self.game.player == p) {
	    his_self.addMove("finish-city-state-rebels\t"+faction+"\t"+respondent+"\t"+spacekey);
	    his_self.playerAssignHits(faction, spacekey, hits, 1);
	  }
	  
	  return 0;
        }


	if (mv[0] === "finish-city-state-rebels") {

	  let faction    = mv[1];
	  let respondent = mv[2];
	  let spacekey   = mv[3];
	  let space      = his_self.game.spaces[spacekey];

	  // do land or naval units remain
	  let anything_left = 0; 
	  for (let i = 0; i < space.units[respondent].length; i++) {
	    if (!space.units[respondent][i].personage) { anything_left = 1; }
	  }

	  if (!anything_left) {
            for (let i = 0; i < space.units[f].length; i++) {
              his_self.captureLeader(faction, respondent, spacekey, space.units[f][i]);
              space.units[f].splice(i, 1);
              i--;
            }
          }

	  let who_gets_control = his_self.returnAllyOfMinorPower(space.home);
	  space.political = who_gets_control;

	  // add 1 regular - to home minor ally if needed
          his_self.addRegular(space.home, space.key, 1);

	  return 1;
	}

	return 1;

      },
    }
    deck['072'] = { 
      img : "cards/HIS-072.svg" , 
      name : "Cloth Price Fluctuate" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	if (his_self.isSpaceControlled("calais", "england") && his_self.isSpaceControlled("antwerp", "hapsburg")) {

          let p1 = his_self.returnPlayerOfFaction("england");
          let p2 = his_self.returnPlayerOfFaction("hapsburg");

          his_self.game.queue.push("cloth-prices-fluctuate-option1\t"+faction);

          his_self.game.queue.push("hand_to_fhand\t1\t"+p1+"\t"+"england");
          his_self.game.queue.push("DEAL\t1\t"+p1+"\t"+1);

          his_self.game.queue.push("hand_to_fhand\t1\t"+p2+"\t"+"hapsburg");
          his_self.game.queue.push("DEAL\t1\t"+p2+"\t"+1);

	} else {

          his_self.game.queue.push("cloth-prices-fluctuate-option2\t"+faction);

	}
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "cloth-prices-fluctuate-option1") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);

	  if (faction === "ottoman") {

	    //
	    // place 2 cavalry in home space not under siege
	    //
	    his_self.playerSelectSpaceWithFilter(
	      "Select Home Space not under Siege",
	      function(space) {
	        if (space.besieged) { return 0; }
	        if (his_self.isSpaceControlled(space, faction)) { return 1; }
	        return 0;
	      },
	      function(spacekey) {
	        let space = his_self.game.spaces[spacekey];
                his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
	        his_self.endTurn();
	      }
	    );

	  } else {

	    //
	    // place 2 mercenaries in home space not under siege
	    //
	    his_self.playerSelectSpaceWithFilter(
	      "Select Home Space not under Siege",
	      function(space) {
	        if (space.besieged) { return 0; }
	        if (his_self.isSpaceControlled(space, faction)) { return 1; }
	        return 0;
	      },
	      function(spacekey) {
	        let space = his_self.game.spaces[spacekey];
                his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
	        his_self.endTurn();
	      }
	    );
	  }
        }


        if (mv[0] == "cloth-prices-fluctuate-option2") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let f = his_self.returnFactionControllingSpace("antwerp");
	  if (f === "") { f = his_self.game.spaces["antwerp"].home; }

	  // f discards a card
          his_self.addMove("discard_random\t"+f);

	  //
	  // add unrest
	  //
          his_self.playerSelectSpaceWithFilter(
	    "Add Unrest",
	    function(space) {
	      if (space.key == "antwerp") { return 1; }
	      if (space.key == "brussels") { return 1; }
	      if (space.key == "amsterdam") { return 1; }
	      if (space.language == "italian") { return 1; }
	      if (space.home == "hapsburg" && space.language == "italian") { return 1; }
	      if (space.home == "hapsburg" && space.language == "german") { return 1; }
	      return 0;
	    },
	    function(unrest_spacekey1) {
              his_self.addMove("unrest\t"+unrest_spacekey1);
              his_self.playerSelectSpaceWithFilter(
  	        "Add Unrest",
	        function(space) {
	          if (space.key == unrest_spacekey1) { return 1; }
	          if (space.key == "antwerp") { return 1; }
	          if (space.key == "brussels") { return 1; }
	          if (space.key == "amsterdam") { return 1; }
	          if (space.language == "italian") { return 1; }
	          if (space.home == "hapsburg" && space.language == "italian") { return 1; }
	          if (space.home == "hapsburg" && space.language == "german") { return 1; }
	        return 0;
	        },
	        function(unrest_spacekey2) {
                  his_self.addMove("unrest\t"+unrest_spacekey2);
	          his_self.endTurn();
	        }
              );
	    }
          );
	  return 0;
	}

	return 1;

      },
    }
    deck['073'] = { 
      img : "cards/HIS-073.svg" , 
      name : "Diplomatic Marriage" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player == 0) {

	  let mp = his_self.returnMinorPowers();
	  let ca = [];
	  let cd = [];

	  for (let i = 0; i < mp.length; i++) {
	    if (his_self.canFactionActivateMinorPower(faction, mp[i])) {
	      if (his_self.returnAllyOfMinorPower(mp[i]) == faction) {
	        ca.push(mp[i]);
	      } else {
	        cd.push(mp[i]);
	      }
	    }
	  }
	
    	  let html = '<ul>';
	  for (let i = 0; i < ca.length; i++) {
            html += `<li class="option" id="${ca[i]}">activate ${ca[i]}</li>`;
	  }
	  for (let i = 0; i < cd.length; i++) {
            html += `<li class="option" id="${cd[i]}">deactivate ${cd[i]}</li>`;
	  }
          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");
	    if (ca.includes(action)) {
	      his_self.addMove("activate_minor_power\t"+faction+"\t"+action);
	    } else {
	      his_self.addMove("deactivate_minor_power\t"+faction+"\t"+action);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['074'] = { 
      img : "cards/HIS-074.svg" , 
      name : "Diplomatic Overture" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player == 0) {

	  // deal 2 cards to faction
	  his_self.game_queue.push("diplomatic-overturn\t"+faction);
          his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
          his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
          his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
          his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "diplomatic-overturn") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == p) {

	    his_self.playerSelectFactionWithFilter(
	      "Select Faction to Give Card",
	      function(f) { if (f !== faction) { return 1; } },
	      function(recipient) {
 	        his_self.playerFactionSelectCardWithFilter(
	          faction,
	          "Select Card to Give Away",
	          function(card) { return 1; },
	          function(card) {
                    his_self.addMove("give_card\t"+recipient+"\t"+faction+"\t"+card);
	  	    his_self.endTurn();
	          }
	        );
	      }
	    );
	  }
	  return 0;
	}
	return 1;
      },
    }
    deck['075'] = { 
      img : "cards/HIS-075.svg" , 
      name : "Erasmus" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	if (his_self.game.state.round < 3) {

	  let player = his_self.returnPlayerOfFaction("protestant");

          his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	} else {

	  let player = his_self.returnPlayerOfFaction("papacy");   

          his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	}

	return 1;
      },
    }
    deck['076'] = { 
      img : "cards/HIS-076.svg" , 
      name : "Foreign Recruits" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { if (faction == "protestant") { return 0; } return 1; },
      onEvent : function(his_self, faction) {

	his_self.updateStatus(his_self.returnFactionName(faction) + " playing "+ his_self.popup("076"));
	let player = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player == player) {
  	  his_self.playerPlayOps("", faction, 4, "build");
	}

	return 0;
      },
    }
    deck['077'] = { 
      img : "cards/HIS-077.svg" , 
      name : "Card" ,
      ops : "Fountain of Youth" ,
      turn : 2 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['078'] = { 
      img : "cards/HIS-078.svg" , 
      warn : ["papacy"] ,
      name : "Frederick the Wise" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");

	//
	// protestants get wartburg card if in discards
	//
        if (his_self.game.deck[0].discards["037"]) {
	  his_self.game.deck[0].cards["037"] = his_self.game.deck[0].discards["037"];
	  delete his_self.game.deck[0].discards["037"];
	  if (his_self.game.player == p) {
            let fhand_idx = his_self.returnFactionHandIdx(p, "protestant");
	    his_self.game.deck[0].fhand[fhand_idx].push("037");
	  }
	}

	//
	// protestants can convert german-language space closest to wittenberg
	//
	his_self.game.queue.push("frederick_the_wise\t2");
	his_self.game.queue.push("frederick_the_wise\t1");
	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "frederick_the_wise") {

          his_self.game.queue.splice(qe, 1);
	  let faction = "protestant";
	  let num = mv[1];

	  res = his_self.returnNearestSpaceWithFilter(
	    "wittenberg",
	    function(spacekey) {
	      if (his_self.game.spaces[spacekey].religion == "catholic" && his_self.game.spaces[spacekey].language == "german") { return 1; }
	      return 0;
	    },
	    function(propagation_filter) {
	      return 1;
	    },
	    0,
	    1,
	  );

	  //
	  // if no options, skip
	  //
	  if (res.length <= 0) { 
	    his_self.updateLog("No viable spaces for Frederick the Wise");
	    return 1;
	  }

	  //
	  // otherwise pick closest space
	  //
	  if (his_self.game.player == his_self.returnPlayerOfFaction("protestant")) {
 	    his_self.playerSelectSpaceWithFilter(
  	      "Select Towns to Convert Protestant: ",
	      (space) => {
	        for (let i = 0; i < res.length; i++) { if (space.key == res[i].key) { return 1; } }
	        return 0;
	      },
	      (spacekey) => {
	        his_self.addMove("convert" + "\t" + spacekey + "\t" + "protestant");
	        his_self.endTurn();
	      },
	      null,
	      true
	    );
	  } else {
	    his_self.updateStatus(his_self.returnFactionName("protestant") + " playing " + his_self.popup("078"));
	  }

	  return 0;

	}

	return 1;
      }
    }
    deck['079'] = { 
      img : "cards/HIS-079.svg" , 
      name : "Fuggers" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
        his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
        his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
        his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
	his_self.game.state.events.fuggers = faction;

	return 1;
      },
    }
    deck['080'] = { 
      img : "cards/HIS-080.svg" , 
      name : "Gabelle Revolt" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player == p) {

	  let space1 = "";
	  let space2 = "";

          his_self.playerSelectSpaceWithFilter(
	    "Select 1st Unoccupied French Home Space: ",
	    function(space) {
	      if (
		space.home === "france" &&
		!his_self.isOccupied(space)
	      ) {
		return 1;
	      }
	      return 0;
	    },
	    function(spacekey) {

	      space1 = spacekey;

              his_self.playerSelectSpaceWithFilter(
	        "Select 1st Unoccupied French Home Space: ",
	        function(space) {
	          if (
	  	    space.home === "france" &&
	  	    space.key != space1 &&
		    !his_self.isOccupied(space)
	          ) {
		    return 1;
	          }
	          return 0;
	        },
		function(spacekey2) {

		  space2 = spacekey2;
		  his_self.addMove("unrest\t"+space1);
		  his_self.addMove("unrest\t"+space2);
		  his_self.endTurn();

		}
	      );
	    },
	  );
        }

        return 0;
      },
    }
    deck['081'] = { 
      img : "cards/HIS-081.svg" , 
      name : "Indulgence Vendor" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	his_self.game.queue.push("indulgence-vendor\t"+faction);
	his_self.game.queue.push("pull_card\t"+faction+"\tprotestant");

        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "indulgence-vendor") {

	  let faction = mv[1];
  
          his_self.game.queue.splice(qe, 1);

	  let p = his_self.returnPlayerOfFaction(faction);
          let fhand_idx = his_self.returnFactionHandIdx(p, faction);
	  let card = his_self.game.state.last_pulled_card;
	  let ops = his_self.game.deck[0].cards[card].ops;

  	  his_self.game.queue.push("show_overlay\tfaction\tpapacy");
	  for (let i = 0; i < ops; i++) {
  	    his_self.game.queue.push("build_saint_peters");
	  }

  	  his_self.game.queue.push("discard\t"+faction+"\t"+card);

	  return 1;

        }

	return 1;

      },
    }
    deck['082'] = { 
      img : "cards/HIS-082.svg" , 
      name : "Janissaries Rebel" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let at_war = false;
	let f = his_self.returnImpulseOrder();
	for (let i = 0; i < f.length; i++) {
	  if (f[i] !== "ottoman") {
	    if (his_self.areEnemies(f[1], "ottoman")) {
	      at_war = true;
	    }
	  }
	}

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.game.spaces[spacekey].home !== "ottoman") { return 0; }
	    if (his_self.game.spaces[spacekey].unrest) { return 0; }
	    if (his_self.isOccupied(his_self.game.spaces[spacekey])) { return 0; }
	    return 1;
	  });

	  let spaces_to_select = 4;
	  if (at_war) { spaces_to_select = 2; }

	  his_self.playerSelectOptions(res, spaces_to_select, false, (selected) => {
	    alert("SELECTED SPACES FOR UNREST: " + JSON.stringify(selected));
	    for (let i = 0; i < selected.length; i++) {
	      his_self.addMove("unrest\t"+selected[i]);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['083'] = { 
      img : "cards/HIS-083.svg" , 
      name : "John Zapolya" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	//
	//
	//
	if (his_self.game.spaces["buda"].besieged) {

	} else {

	  //
	  //
	  //
	  if (his_self.game.spaces["buda"].political === "" || his_self.game.spaces["buda"].political === "hungary") {
	    his_self.addRegular("hungary", "buda", 4);
	  } else {
	    his_self.addRegular(his_self.game.spaces["buda"].political, "buda", 4);
	  }
	}

	return 1;
      },
    }
    deck['084'] = { 
      img : "cards/HIS-084.svg" , 
      name : "Julia Gonzaga" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.events.barbary_pirates) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {
alert("NOT IMPLEMENTED: need to connect this with actual piracy for hits-scoring");
	his_self.game.state.events.julia_gonzaga_activated = 1;
	his_self.game.state.events.julia_gonzaga = "ottoman";

	return 1;
      },
    }
    deck['085'] = { 
      img : "cards/HIS-085.svg" , 
      name : "Katherina Bora" ,
      warn : ["papacy"] ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (!his_self.isDebaterCommitted("luther-debater")) {
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	//
	// protestant player gets 5 Reformation Attempts
	//
	let p = his_self.returnPlayerOfFaction("protestant");

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	//
	// and commit luther
	//
	his_self.commitDebater("protestant", "luther-debater");
	  
	return 1;
      },
    }
    deck['086'] = { 
      img : "cards/HIS-086.svg" , 
      name : "Knights of St. John" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['087'] = { 
      img : "cards/HIS-087.svg" , 
      name : "Mercenaries Demand Pay" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	//
	// protestant player gets 5 Reformation Attempts
	//
	let p = his_self.returnPlayerOfFaction(faction);

	if (his_self.game.player == p) {

	  // pick a faction
  	  his_self.playerSelectFactionWithFilter(

	    "Select Faction to Target: ",

	    function(f) {
	      if (f !== faction) { return 1; }
	      return 0;
	    },

	    function (target) {
	      his_self.addMove("mercendaries-demand-pay\t"+target+"\t"+faction);
	      ahis_self.endTurn();
	    }
	  );
	}
	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "mercenaries-demand-pay") {

          his_self.game.queue.splice(qe, 1);

	  let target = mv[1];
	  let faction = mv[2];
	  let player = his_self.returnPlayerOfFaction(target);

	  his_self.displayModal(his_self.returnFactionName(faction) + " plays Mercenaries Demand Pay");

	  if (player == his_self.game.player) {

            his_self.playerFactionSelectCardWithFilter(

	      target,

	      "Select Card to Discard: ",

	      function(card) {
		let c = his_self.game.deck[0].cards[card];
	        if (c.type === "mandatory") { return 0; }
		return 1;
	      },

	      function(card) {

		let c = his_self.game.deck[0].cards[card].ops;	      

  	  	his_self.game.queue.push("discard\t"+faction+"\t"+card);

		let retained = 2;
		if (c == 2) { retained = 4; }
		if (c == 3) { retained = 6; }
		if (c == 4) { retained = 10; }
		if (c >= 5) {
		  his_self.endTurn();
		  return;
		}

		//
		// player must discard down to N (retained) mercenaries
		//
		his_self.playerRetainUnitsWithFilter(
		  target,
		  function(spacekey, unit_idx) {
		    if (his_self.game.spaces[spacekey].units[target][unit_idx].type == "mercenary") { return 1; }
		    return 0;
		  },
		  retained
		);
	      }
	    );
	  }
	  return 0;
        }
	return 1;
      }
    }
    deck['088'] = { 
      img : "cards/HIS-088.svg" , 
      name : "Peasants' War" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        let res = his_self.returnSpacesWithFilter(function(spacekey) {
	  if (his_self.isOccupied(spacekey)) { return 0; }
	  if (his_self.game.spaces[spacekey].language == "german") { return 1; }
	  return 0;
	});
	if (res.length > 0) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.isOccupied(spacekey)) { return 0; }
	    if (his_self.game.spaces[spacekey].language == "german") { return 1; }
	    return 0;
	  });


	  let spaces_to_select = 5;
	  if (res.length < 5) { spaces_to_select = res.length; }
	  for (let i = 0; i < spaces_to_select; i++) {
	    his_self.addMove("peasants_war\t"+faction+"\t"+(5-i));
	  }
	  his_self.endTurn();

	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "peasants_war") {

          his_self.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let num = mv[2];

	  if (his_self.game.player == his_self.returnPlayerOfFaction(faction)) {

	    //
	    // pick unit on map with player land units and select one to remove
	    //
 	    his_self.playerSelectSpaceWithFilter(

	      `Select Space to Add Unrest / #${num}`,

	      (space) => {
	        if (his_self.isOccupied(space.key)) { return 0; }
	        if (his_self.game.spaces[space.key].language == "german") { return 1; }
	        return 0;
	      },

	      (spacekey) => {
      		his_self.addMove("unrest\t"+spacekey);
		his_self.endTurn();
	      },

	      null,

	      true

	    );
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("088"));
	  }
  
	  return 0;

	}

	return 1;
      }
    }
    deck['089'] = { 
      img : "cards/HIS-089.svg" , 
      name : "Pirate Haven" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['090'] = { 
      img : "cards/HIS-090.svg" , 
      warn : ["papacy"] ,
      name : "Printing Press" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

        his_self.game.state.printing_press_active = 1;

	let p = his_self.returnPlayerOfFaction(faction);

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	return 1;
      },
    }
    deck['091'] = { 
      img : "cards/HIS-091.svg" , 
      name : "Ransom" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	for (let i = 0; i < his_self.game.state.players_info.length; i++) {
	  for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
	    return 1;
	  } 	
	}	
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

  	  //
	  // list of all captured leaders
	  //
	  let captured_leaders = [];
	  let options = [];

	  for (let i = 0; i < his_self.game.state.players_info.length; i++) {
	    for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
	      captured_leaders.push({ leader : his_self.game.state.players_info[i].captured[ii].type , player : i , idx : ii });
	      options.push(his_self.game.state.players_info[i].captured[ii].type);
	    } 	
	  }	

	  his_self.playerSelectOptions("Select a Captured Leader: ", options, false, (selected) => {
	    if (selected.length == 0) {
	      his_self.endTurn();
	      return;
	    }
	    his_self.addMove("random\t"+selected[0]);
	  });

	}

	return 0;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "ransom_placement") {

          his_self.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let spacekey = mv[2];

	  if (his_self.game.state.ransomed_leader != null) {
	    his_self.game.spaces[spacekey].units[faction].push(his_self.game.state.ransomed_leader);
	    his_self.game.state.ransomed_leader = null;
	  } 

	  return 1;

	}

        if (mv[0] == "ransom") {

          his_self.game.queue.splice(qe, 1);

	  his_self.game.state.ransomed_leader = null;
	  let ransomed_leader_type = mv[1];
	  let ransomed_leader = null;

	  for (let i = 0; i < his_self.game.state.players_info.length; i++) {
	    for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
	      if (his_self.game.state.players_info[i].captured[ii].type == ransomed_leader_type) {
	        randomed_leader = his_self.game.state.players_info[i].captured[ii];
		his_self.game.state.players_info[i].captured.splice(ii, 1);
	      }
	    } 	
	  }	

	  if (ransomed_leader === null) { return; }

	  let player = his_self.returnPlayerOfFaction(ransomed_leader.owner);
	  if (player == his_self.game.player) {

            his_self.playerFactionSelectSpaceWithFilter(

	      ransomed_leader.owner,

	      "Select Fortified Home Space: ",

	      function(spacekey) {
		if (his_self.game.spaces[spacekey].type == "fortress" && his_self.game.spaces[spacekey].home == ransomed_leader.owner) {
		  return 1;
		}
		return 0;
	      },

	      function(space) {
		his_self.addMove("ransom_placement\t"+ransomed_leader.owner+"\t"+space.key);
		his_self.endTurn();
	      }
	    );
	  }
	  return 0;
        }
	return 1;
      }
    }
    deck['092'] = { 
      img : "cards/HIS-092.svg" , 
      warn : ["ottoman"] ,
      name : "Revolt in Egypt" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent(his_self, faction) {
        return 1;
      },
      onEvent(his_self, faction) {

        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);

        his_self.game.state.events.revolt_in_egypt = 1;

	his_self.game.queue.push("revolt_in_egypt");

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "revolt_in_egypt_placement") {

          his_self.game.queue.splice(qe, 1);

	  let faction = "ottoman";
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player === p) {

	    his_self.playerSelectUnitsWithFilterFromSpacesWithFilter(

		faction,

		(space) => {
		  return his_self.returnFactionLandUnitsInSpace(faction, space);
		},

		(unit) => {
		  if (unit.type == "mercentary") { return 1; };
		  if (unit.type == "cavalry") { return 1; };
		  if (unit.type == "regular") { return 1; };
		  return 0;
		},

		3,

		true,

		(selected) => {
		  for (let i = 0; i < selected.length; i++) {
		    his_self.addMove(	"build" + "\t" +
					"land" + "\t" + 
					selected[i].type + "\t" +
					"egypt" + "\t" );
		    his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					"england" + "\t" +
					selected[i].type + "\t" +
					selected[i].spacekey );
		  }
		  his_self.endTurn();
		}
	    );
	  }
	  return 0;
	}
        return 1;
      }

    }
    deck['093'] = { 
      img : "cards/HIS-093.svg" , 
      name : "Revolt in Ireland" ,
      warn : ["england"] ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent(his_self, faction) {
        return 1;
      },
      onEvent(his_self, faction) {

        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);

        his_self.game.state.events.revolt_in_ireland = 1;

	if (faction === "france" || faction === "hapsburg") {
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player == p) {
	    his_self.addMove("revolt_in_ireland_placement");
	    his_self.addMove("revolt_in_ireland_bonus_resistance\t"+faction);
	    his_self.endTurn();
	  }
	  return 0;
	}

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "revolt_in_ireland_bonus_resistance") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  let p = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player === p) {

            let msg = "Remove 1 Land Unit to Fortify Irish Resistance?";
            let html = '<ul>';
            html += '<li class="option" id="yes">yes</li>';
            html += '<li class="option" id="no">no</li>';
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              let action = $(this).attr("id");

              if (action === "yes") {
		
		//
		// pick unit on map with player land units and select one to remove
		//
 	 	his_self.playerSelectSpaceWithFilter(

		  "Select Space to Remove 1 Land Unit",

		  (space) => { return his_self.returnFactionLandUnitsInSpace(faction, space.key); },

		  (spacekey) => {
		    
      		    let opts = his_self.returnFactionLandUnitsInSpace(faction, spacekey);
		    let space = his_self.game.spaces[spacekey];

            	    let msg = "Remove which Land Unit?";
            	    let html = '<ul>';

		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "cavalry") {
   	                html += '<li class="option" id="${i}">cavalry</li>';
			break;
		      }
		    }
		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "regular") {
   	                html += '<li class="option" id="${i}">regular</li>';
			break;
		      }
		    }
		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "mercenary") {
   	                html += '<li class="option" id="${i}">mercenary</li>';
			break;
		      }
		    }

            	    html += '</ul>';


            	    his_self.updateStatusWithOptions(msg, html);

	            $('.option').off();
        	    $('.option').on('click', function () {

	              let action = $(this).attr("id");

		      his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					faction + "\t" +
					space.units[faction][i].type + "\t" +
					space.key );
		      his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" removes unit from " + space.key);
		      his_self.endTurn();

		    });
		  },
		);
		return 0;
	      }
              if (action === "no") {
		his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" does not support Irish rebels");
		his_self.endTurn();
	      }
	    });
	  }
	  return 0;
        }


        if (mv[0] == "revolt_in_ireland_placement") {

          his_self.game.queue.splice(qe, 1);

	  let faction = "england";
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player === p) {

	    his_self.playerSelectUnitsWithFilterFromSpacesWithFilter(

		faction,

		(space) => {
		  return his_self.returnFactionLandUnitsInSpace(faction, space);
		},

		(unit) => {
		  if (unit.type == "mercentary") { return 1; };
		  if (unit.type == "cavalry") { return 1; };
		  if (unit.type == "regular") { return 1; };
		  return 0;
		},

		4,

		true,

		(selected) => {

		  for (let i = 0; i < selected.length; i++) {
		    his_self.addMove(	"build" + "\t" +
					"land" + "\t" + 
					selected[i].type + "\t" +
					"ireland" + "\t" );
		    his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					"england" + "\t" +
					selected[i].type + "\t" +
					selected[i].spacekey );
		    his_self.addMove("remove_unit\t");
		  }
		  his_self.endTurn();
		}
	    );
	  }
	  return 0;
	}
        return 1;
      }
    }
    deck['094'] = { 
      img : "cards/HIS-094.svg" , 
      name : "Revolt of the Communeros" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.game.spaces[spacekey].language == "spanish") { return 1; }
	    return 0;
	  });

	  let spaces_to_select = 3;

	  his_self.playerSelectOptions(res, spaces_to_select, false, (selected) => {
	    alert("SELECTED SPACES FOR UNREST: " + JSON.stringify(selected));
	    for (let i = 0; i < selected.length; i++) {
	      his_self.addMove("unrest\t"+selected[i]);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['095'] = { 
      img : "cards/HIS-095.svg" , 
      warn : ["papacy"] ,
      name : "Sack of Rome" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['096'] = { 
      img : "cards/HIS-096.svg" , 
      name : "Sale of Moluccas" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['097'] = { 
      img : "cards/HIS-097.svg" , 
      name : "Scots Raid" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['098'] = { 
      img : "cards/HIS-098.svg" , 
      name : "Search for Cibola" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['099'] = { 
      img : "cards/HIS-099.svg" , 
      name : "Sebastian Cabot" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['100'] = { 
      img : "cards/HIS-100.svg" , 
      name : "Shipbuilding" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (faction == "protestant") { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {
	return 0;
      },
    }
    deck['101'] = { 
      img : "cards/HIS-101.svg" , 
      name : "Smallpox" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['102'] = { 
      img : "cards/HIS-102.svg" , 
      name : "Spring Preparations" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 0; },
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_spring_deployment") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('102')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '102', html : `<li class="option" id="102">spring preparations (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "pre_spring_deployment") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('102')) {
	      if (his_self.returnPlayerOfFaction("protestant") == his_self.game.player && his_self.game.players.length == 2) { 
 		return 0;
	      }
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_spring_deployment") {
	  if (his_self.game.player === player) {
            his_self.addMove("spring_preparations\t"+faction);
	    his_self.endTurn();
	  }
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "spring_preparations") {

          let faction = mv[1];

          his_self.game.state.spring_deploy_across_passes.push(faction);
          his_self.game.state.spring_deploy_across_seas.push(faction);
          his_self.game.state.events.spring_preparations = faction;

          his_self.game.queue.splice(qe, 1);
          return 1;

        }

	return 1;

      },
    }
    deck['103'] = { 
      img : "cards/HIS-103.svg" , 
      name : "Threat to Power" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

	  let msg = "Target Which Minor Army Leader?";
          let html = '<ul>';
          html += '<li class="option" id="brandon">Charles Brandon</li>';
          html += '<li class="option" id="duke">Duke of Alva</li>';
          html += '<li class="option" id="montmorency">Montmorency</li>';
          html += '<li class="option" id="pasha">Ibrahim Pasha</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

            $('.option').off();
	    let action = $(this).attr("id");

	    his_self.addMove("threat_to_power\t"+action);
	    his_self.endTurn();


	  });
	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "threat_to_power") {

	  let leader = mv[1];
	  let faction = "";

	  if (leader === "brandon") 	{ leader = "charles-brandon"; faction = "england"; }
	  if (leader === "duke") 	{ leader = "duke-of-alva"; faction = "hapsburg"; }
	  if (leader === "montmorency") { leader = "montmorency"; faction = "france"; }
	  if (leader === "pasha") 	{ leader = "ibrahim-pasha"; faction = "ottoman"; }

	  let r = his_self.rollDice(6);

	  let idx = -1;
	  let s = his_self.returnSpaceOfPersonage(faction, leader);
	  if (s) { idx = his_self.returnIndexOfPersonageInSpace(faction, leader, s); }

	  //
	  // removed from game
	  //
	  if (r >= 4) {

	    s.units[faction].splice(idx, 1);
	    his_self.displaySpace(s.key);

	  //
	  // temporarily removed from game
	  //
	  } else {

            if (s !== "") {
              idx = his_self.returnIndexOfPersonageInSpace(faction, reformer, s);
            }

            let obj = {};
            obj.space = s;
            obj.faction = faction;
            obj.leader = his_self.game.state.spaces[s].units[faction][idx];

            if (idx != -1) {
              s.units[faction].splice(idx, 1);
            }

            his_self.game.state.military_leaders_removed_until_next_round.push(obj);

	    his_self.displaySpace(s.key);

            return 1;

	  }
        }

	return 1;
      }
    }
    deck['104'] = { 
      img : "cards/HIS-104.svg" , 
      name : "Trace Italienne" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.events.schmalkaldic_league != 1 && faction == "protestant") { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          his_self.playerSelectSpaceWithFilter(

            "Select Space to Fortify" ,

            function(space) {
              if (space.type != "fortress" && space.type != "electorate" && space.type != "key") { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.updateStatus("selected...");
	      let s = his_self.game.spaces[spacekey];
	      if (s.home === "independent" && s.political === "") {
	      } else {
		let controller = s.political;
		if (controller == "") { controller = s.home; }
		if (controller == "") { controller = "independent"; }
                his_self.addMove("build\tland\t"+controller+"\t"+"regular"+"\t"+spacekey);
	      }
              his_self.addMove("fortify\t"+spacekey);
	      his_self.endTurn();
            },

	    null,

	    true

          );
        } else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("104"));;
	}

        return 0;
      },
    }
    deck['105'] = { 
      img : "cards/HIS-105.svg" , 
      name : "Treachery!" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	let spaces_under_siege = his_self.countSpacesWithFilter(
	  function(space) {
	    if (
	      space.besieged > 0
	    ) {
	      return 1;
	    }
	    return 0;
	  }
	);
	if (spaces_under_siege > 0) {
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          his_self.playerSelectSpaceWithFilter(

            "Select Space Under Siege:" ,

            function(space) {
              if (space.besieged > 0) { return 1; }
	      return 0;
            },

            function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let attacker = "";

console.log("TESTING: " + JSON.stringify(space.units));

	      for (let key in space.units) {
		for (let i = 0; i < space.units[key].length; i++) {
		  if (space.units[key][i].besieged == 0) {
		    attacker = space.units[key][i].owner;
		    if (attacker == "protestant" || attacker == "papacy" || attacker == "hapsburg" || attacker == "ottoman" || attacker == "england" || attacker == "france") { break; }
		  }
		}
	      }

	      if (attacker != "") {
                his_self.addMove("treachery\t"+attacker+"\t"+spacekey);
	        his_self.addMove("assault\t"+attacker+"\t"+spacekey);
                his_self.endTurn();
	      } else {
                his_self.addMove("NOTIFY\t"+his_self.popup("105") + " cannot find attacker in siege");
                his_self.endTurn();
	      }
            }
          );

          return 0;
        }
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "treachery") {

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let defender = "";

	  let defenders = [];
	  let space = his_self.game.spaces[spacekey];

	  let total_attackers = 0;
	  let total_defenders = 0;

	  for (let key in space.units) {
	    if (space.units[key].length > 0) {
	      if (space.units[key][0].besieged > 0) {
		total_defenders += his_self.returnFactionLandUnitsInSpace(key, spacekey);
		defenders.push(key);
	      }
	      if (space.units[key][0].besieged == 0) {
		total_attackers += his_self.returnFactionLandUnitsInSpace(key, spacekey);
	      }
	    }
	  }

	  if (total_defenders < total_attackers) {
	    his_self.game.queue.push(`control\t${attacker}\t${spacekey}`);
	    his_self.updateLog(his_self.popup("105") + " - besiegers capture defenders and control space");
	    for (let i = 0; i < defenders.length; i++) {
	      his_self.game.queue.push(`purge_units_and_capture_leaders\t${defenders[i]}\t${attacker}\t${spacekey}`);
	    }
	  }

          his_self.game.queue.splice(qe, 1);
	  
	}

        return 1;
      },
    }
    deck['106'] = { 
      img : "cards/HIS-106.svg" , 
      name : "Unpaid Mercenaries" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	let spaces_with_mercenaries = his_self.countSpacesWithFilter(
	  function(space) {
	    for (let key in space.units) {
	      for (let i = 0; i < space.units[key].length; i++) {
		if (space.units[key][i].type == "mercenary") { return 1; }
	      }
	    }
	    return 0;
	  }
	);
	if (spaces_with_mercenaries > 0) { 
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          his_self.playerSelectSpaceWithFilter(

            "Select Space With Unpaid Mercenaries" ,

            function(space) {
	      for (let key in space.units) {
	        for (let i = 0; i < space.units[key].length; i++) {
	  	  if (space.units[key][i].type == "mercenary") { return 1; }
	        }
	      }
	      return 0;
            },

            function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let factions = [];

	      for (let key in space.units) {
		for (let i = 0; i < space.units[key].length; i++) {
		  if (space.units[key][i].type == "mercenary") {
		    if (!factions.includes(key)) {
		      factions.push(key);
		    }
		  }
		}
	      }

	      if (factions.length > 0) {

 	        let msg = "Choose Faction to Lose Mercenaries:";
                let html = '<ul>';
	        for (let i = 0; i < factions.length; i++) {
                  html += `<li class="option" id="${factions[i]}">${factions[i]}</li>`;
		}
    	        html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

 		$('.option').off();
	  	$('.option').on('click', function () {

 		  $('.option').off();
	    	  let action = $(this).attr("id");

		  for (let z = his_self.game.spaces[spacekey].units[action].length-1; z >= 0; z--) {
		    his_self.addMove(`destroy_unit_by_index\t${action}\t${spacekey}\t${z}`);
		  }
		  his_self.endTurn();
		});

	      } else {
		for (let z = his_self.game.spaces[spacekey].units[factions[0]].length-1; z >= 0; z--) {
		  his_self.addMove(`destroy_unit\t${factions[0]}\t${spacekey}\t${z}`);
		}
		his_self.endTurn();
	      }
            }
          );

          return 0;
        }
      },
    }
    deck['107'] = { 
      img : "cards/HIS-107.svg" , 
      name : "Unsanitary Camp" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          his_self.playerSelectSpaceWithFilter(

            "Select Space With Land Units" ,

            function(space) {
	      for (let key in space.units) {
	        if (his_self.returnFactionLandUnitsInSpace(key, space.key) > 0) { return 1; }
	      }
	      return 0;
            },

            function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let factions = [];

	      for (let key in space.units) {
	        if (his_self.returnFactionLandUnitsInSpace(key, space.key) > 0) { factions.push(key); }
	      }

	      if (factions.length > 0) {

 	        let msg = "Choose Faction to Suffer Losses:";
                let html = '<ul>';
	        for (let i = 0; i < factions.length; i++) {
                  html += `<li class="option" id="${factions[i]}">${factions[i]}</li>`;
		}
    	        html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

 		$('.option').off();
	  	$('.option').on('click', function () {

 		  $('.option').off();
	    	  let action = $(this).attr("id");

		  let total_units = 0;
		  let regular_units = 0;
		  let total_to_delete = 0;
		  let regulars_to_delete = 0;
		  let nonregulars_to_delete = 0;

		  for (let z = his_self.game.spaces[spacekey].units[action].length-1; z >= 0; z--) {
		    let u = his_self.game.spaces[spacekey].units[action][z];
		    if (u.type == "regular") { regular_units++; }
		    if (u.type == "cavalry" || u.type == "regular" || u.type == "mercenary") { total_units++; }
		  }

		  total_to_delete = Math.ceil(total_units/3);
		  regulars_to_delete = Math.ceil(total_to_delete/2);
		  nonregulars_to_delete = total_to_delete - regulars_to_delete;
		
		  for (let z = his_self.game.spaces[spacekey].units[action].length-1; z >= 0; z--) {
		    let u = his_self.game.spaces[spacekey].units[action][z];
		    if (u.type == "regular" && regulars_to_delete > 0) {
		      his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		      regulars_to_delete--;
		    }
		    if (u.type != "regular" && nonregulars_to_delete > 0) {
		      his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		      nonregulars_to_delete--;
		    }
		  }
		  his_self.endTurn();
		});

	      } else {

		let action = factions[0];
		let total_units = 0;
		let regular_units = 0;
		let total_to_delete = 0;
		let regulars_to_delete = 0;
		let nonregulars_to_delete = 0;

		for (let z = his_self.game.spaces[spacekey].units[action].length-1; z >= 0; z--) {
		  let u = his_self.game.spaces[spacekey].units[action][z];
		  if (u.type == "regular") { regular_units++; }
		  if (u.type == "cavalry" || u.type == "regular" || u.type == "mercenary") { total_units++; }
		}

		total_to_delete = Math.ceil(total_units/3);
		regulars_to_delete = Math.ceil(total_to_delete/2);
		nonregulars_to_delete = total_to_delete - regulars_to_delete;
		
		for (let z = his_self.game.spaces[spacekey].units[action].length-1; z >= 0; z--) {
		  let u = his_self.game.spaces[spacekey].units[action][z];
		  if (u.type == "regular" && regulars_to_delete > 0) {
		    his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		  }
		  if (u.type != "regular" && nonregulars_to_delete > 0) {
		    his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		    nonregulars_to_delete--;
		  }
		}
		his_self.endTurn();
	      }
            },

	    null,

	    true
          );

        } else {
	  his_self.updateLog(his_self.returnFactionName(faction) + " playing " + his_self.popup("107"));
	}
        return 0;
      },
    }
    deck['108'] = { 
      img : "cards/HIS-108.svg" , 
      name : "Venetian Alliance" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['109'] = { 
      img : "cards/HIS-109.svg" , 
      name : "Venetian Informant" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_spring_deployment") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('109')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '109', html : `<li class="option" id="109">venetian informant (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "pre_spring_deployment") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('109')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_spring_deployment") {
	  if (his_self.game.player === player) {
            his_self.addMove("discard\t"+faction+"\t109");
            his_self.addMove("venetian_informant\t"+faction);
	    his_self.endTurn();
	  }
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "show_hand") {
        
          let faction_taking = mv[1];
          let faction_giving = mv[2];
          
          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);
          
          if (his_self.game.player == p2) {
            let fhand_idx = his_self.returnFactionHandIdx(p2, faction_giving);
            his_self.addMove("share_hand\t"+faction_taking+"\t"+faction_giving+"\t"+JSON.stringify(his_self.game.deck[0].fhand[fhand_idx]));
            his_self.endTurn();
          }

          his_self.game.queue.splice(qe, 1);
          return 0;

        }


        if (mv[0] === "share_hand") {
        
          let faction_taking = mv[1];
          let faction_giving = mv[2];
          let cards = JSON.parse(mv[3]);
          
          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);
          
          if (his_self.game.player == p1) {

	    for (let i = 0; i < cards.length; i++) {
	      his_self.updateLog(his_self.returnFactionName(faction_giving) + ": " + his_self.popup(cards[i]));
	    }
          }

          his_self.game.queue.splice(qe, 1);
          return 1;

        }


        if (mv[0] == "venetian_informant") {

	  let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (player == his_self.game.player) {

	    let powers = his_self.returnImpulseOrder();
	    let msg = "View which Faction Cards?";

            let html = '<ul>';
	    for (let i = 0; i < powers.length; i++) {
	      if (powers[i] != faction && his_self.returnPlayerOfFaction(powers[i]) > 0) {
                html += `<li class="option" id="${powers[i]}">${his_self.returnFactionName(powers[i])}</li>`;
	      }
	    }
            html += '</ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {
	      $('.option').off();
	      let action = $(this).attr("id");
	      his_self.addMove("show_hand\t"+faction+"\t"+action);
	      his_self.endTurn();
	    });

	  }

          his_self.game.queue.splice(qe, 1);
	  return 0;


        }

	return 1;

      },
    }
    deck['110'] = { 
      img : "cards/HIS-110.svg" , 
      name : "War in Persia" ,
      warn : ["ottoman"] ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent(his_self, faction) {
        return 1;
      },
      onEvent(his_self, faction) {

        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);

        his_self.game.state.events.war_in_persia = 1;

	his_self.game.queue.push("war_in_persia_placement");

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "war_in_persia_placement") {

          his_self.game.queue.splice(qe, 1);

	  let faction = "ottoman";
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player === p) {

	    his_self.playerSelectUnitsWithFilterFromSpacesWithFilter(

		faction,

		(space) => {
		  return his_self.returnFactionLandUnitsInSpace(faction, space);
		},

		(unit) => {
		  if (unit.type == "mercentary") { return 1; };
		  if (unit.type == "cavalry") { return 1; };
		  if (unit.type == "regular") { return 1; };
		  return 0;
		},

		5,

		true,

		(selected) => {
		  for (let i = 0; i < selected.length; i++) {
		    his_self.addMove(	"build" + "\t" +
					"land" + "\t" + 
					selected[i].type + "\t" +
					"persia" + "\t" );
		    his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					"england" + "\t" +
					selected[i].type + "\t" +
					selected[i].spacekey );
		  }
		  his_self.endTurn();
		}
	    );
	  }
	  return 0;
	}
        return 1;
      }
    }
    deck['111'] = { 
      img : "cards/HIS-111.svg" , 
      name : "Colonial Governor/Native Uprising" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['112'] = { 
      img : "cards/HIS-112.svg" , 
      name : "Thomas More" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['113'] = { 
      img : "cards/HIS-113.svg" , 
      name : "Imperial Coronation" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) {
	let s = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	if (s) { if (s.language == "italian") { return 1; } }
	return 0;
      },
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let s = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	if (s) {
	  if (s.language == "italian") {

    	    let hp = his_self.returnPlayerOfFaction("hapsburg");
  	    let pf = his_self.returnPlayerOfFaction(faction);

	    his_self.game.queue.push("hand_to_fhand\t1\t"+hf+"\t"+"hapsburg");
            his_self.game.queue.push(`DEAL\t1\t${hf}\t1`);
	    if (faction !== "hapsburg") {
	      his_self.game.queue.push("hand_to_fhand\t1\t"+pf+"\t"+faction);
              his_self.game.queue.push(`DEAL\t1\t${pf}\t1`);
	    }
	  }
	}

	return 1;
      },
    }
    deck['114'] = { 
      img : "cards/HIS-114.svg" , 
      name : "La Forets's Embassy in Istanbul" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { if (his_self.areAllies("ottoman", "france")) { return 1; } return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	if (his_self.areAllies("ottoman", "france")) {

  	  let fp = his_self.returnPlayerOfFaction("france");
  	  let op = his_self.returnPlayerOfFaction("ottoman");

	  his_self.game.queue.push("hand_to_fhand\t1\t"+op+"\t"+"ottoman");
          his_self.game.queue.push(`DEAL\t1\t${op}\t1`);
	  his_self.game.queue.push("hand_to_fhand\t1\t"+op+"\t"+"france");
          his_self.game.queue.push(`DEAL\t1\t${fp}\t1`);
	
	}

	return 1;
      },
    }
    deck['115'] = { 
      img : "cards/HIS-115.svg" , 
      name : "Thomas Cromwell" ,
      ops : 3 ,
      turn : 4 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['116'] = { 
      img : "cards/HIS-116.svg" , 
      name : "Rough Wooing" ,
      ops : 3 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }


    //
    // cards removed from 2P game
    //
    delete deck["001"];
    delete deck["002"];
    delete deck["003"];
    delete deck["004"];
    delete deck["009"];
    delete deck["018"];
    delete deck["030"];
    delete deck["034"];
    delete deck["040"];
    delete deck["042"];
    delete deck["048"];
    delete deck["049"];
    delete deck["050"];
    delete deck["053"];
    delete deck["054"];
    delete deck["058"];
    delete deck["059"];
    delete deck["066"];
    delete deck["068"];
    delete deck["069"];
    delete deck["072"];
    delete deck["073"];
    delete deck["074"];
    delete deck["077"];
    delete deck["080"];
    delete deck["082"];
    delete deck["083"];
    delete deck["084"];
    delete deck["086"];
    delete deck["087"];
    delete deck["089"];
    delete deck["092"];
    delete deck["093"];
    delete deck["094"];
    delete deck["096"];
    delete deck["097"];
    delete deck["098"];
    delete deck["099"];
    delete deck["100"];
    delete deck["101"];
    delete deck["103"];
    delete deck["108"];
    delete deck["110"];

    //
    // TO REQUIRES CODING
    //
    delete deck["095"];
    delete deck["112"];
    delete deck["115"];
    delete deck["116"];

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
      if (!deck[key].warn) { deck[key].warn = []; }
    }









    return deck;

  }



  returnSpaceName(spacekey) {
    if (this.game.spaces[spacekey]) { return this.game.spaces[spacekey].name; }
    if (this.game.navalspaces[spacekey]) { return this.game.navalspaces[spacekey].name; }
    return spacekey;
  }

  resetBesiegedSpaces() {
    for (let space in this.game.spaces) {
      if (space.besieged == 2) { space.besieged = 1; }
    }
  }
  resetLockedTroops() {
    for (let space in this.game.spaces) {
      for (let f in this.game.spaces[space].units) {
        for (let z = 0; z < this.game.spaces[space].units[f].length; z++) {
          this.game.spaces[space].units[f][z].locked = false;
        }
      }
    }
  }

  addUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 1;
  }

  removeUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 0;
  }

  hasProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["england"].length; i++) {
      let unit = space.units["england"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["france"].length; i++) {
      let unit = space.units["france"][i];
      if (unit.reformer) { return true; }
    }
    return false;
  }


  hasProtestantLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    //
    // only protestant units count
    //
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.type == "regular" || unit.type == "mercenary") { return true; }
    }

    //
    // unless Edward VI or Elizabeth I are on the throne
    //
    if (this.game.state.leaders.edward_vi == 1 || this.game.state.leaders.elizabeth_i == 1) {

      //
      // then british mercenaries and regulars count
      //
      for (let i = 0; i < space.units["england"].length; i++) {
        let unit = space.units["england"][i];
        if (unit.type == "regular" || unit.type == "mercenary") { return true; }
      }

      //
      // or Scottish ones if Scotland is allied to England
      //
      if (this.areAllies("england", "scotland")) {
        for (let i = 0; i < space.units["scotland"].length; i++) {
          let unit = space.units["scotland"][i];
          if (unit.type == "regular" || unit.type == "mercenary") { return true; }
        }
      }

    }

    return false;

  }

  returnCatholicLandUnitsInSpace(space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let units = [];

    for (let f in space.units) {
      if (f != "protestant" && f != "ottoman") {
	if (f == "england" && (this.game.state.leaders.edward_vi != 1 || this.game.state.leaders.elizabeth_i != 1)) {
          for (let z = 0; z < space.units[f].length; z++) {
	    let u = space.units[f][z];
	    if (u.type === "regular" || u.type === "mercenary" || u.type === "cavalry") { units.push({ faction : f , unit_idx : z }); }
	  }
	} else {
          for (let z = 0; z < space.units[f].length; z++) {
	    let u = space.units[f][z];
	    if (u.type === "regular" || u.type === "mercenary" || u.type === "cavalry") { units.push({ faction : f , unit_idx : z }); }
	  }
	}
      }
    }

    return units;

  }

  hasCatholicLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (f != "protestant" && f != "ottoman") {

	if (f == "england" && (this.game.state.leaders.edward_vi != 1 || this.game.state.leaders.elizabeth_i != 1)) {
          if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	} else {
          if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	}
      }
    }

    return false;
  }

  isSpaceFriendly(space, faction) {
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return true; }
    return this.areAllies(cf, faction);
  }

  isSpaceHostile(space, faction) {
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return false; }
    return this.areEnemies(cf, faction);
  }

  isSpaceControlled(space, faction) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == "") { return true; }

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == faction) { return true; }

    // independent (gray) spaces seized by the power.
    if (space.home === "independent" && space.political === faction) { return true; }

    // home spaces of other powers seized by the power.
    if (space.home !== faction && space.political === faction) { return true; }

    // home spaces of allied minor powers. 
    if (space.home !== faction && this.isAlliedMinorPower(space.home, faction)) { return true; }

    return false;
  }

  isSpaceFortified(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.type === "electorate" || space.type === "key" || space.type === "fortress") { return true; }
    return false;
  }

  returnHopsToFortifiedHomeSpace(source, faction) {
    let his_self = this;
    try { if (this.game.spaces[source]) { source = this.game.spaces[source]; } } catch (err) {}
    return this.returnHopsBetweenSpacesWithFilter(source, function(spacekey) {
      if (his_self.isSpaceFortified(his_self.game.spaces[spacekey])) {
	if (his_self.isSpaceControlled(spacekey, faction)) {
	  if (his_self.game.spaces[spacekey].home === faction) {
	    return 1;
	  }
	}
      }
      return 0;
    });
  }
  returnHopsToDestination(source, destination) {
    try { if (this.game.spaces[source]) { destination = this.game.spaces[source]; } } catch (err) {}
    try { if (this.game.spaces[destination]) { destination = this.game.spaces[destination]; } } catch (err) {}
    return this.returnHopsBetweenSpacesWithFilter(source, function(spacekey) {
      if (spacekey === destination.key) { return 1; }
      return 0;  
    });
  }

  returnHopsBetweenSpacesWithFilter(space, filter_func) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let map = {};
    let sources = [];
    let hop = 0;

    let addHop = function(sources, hop) {

      hop++;
      
      let new_neighbours = [];

      for (let i = 0; i < sources.length; i++) {
	for (let z = 0; z < his_self.game.spaces[sources[i]].neighbours.length; z++) {
	  let sourcekey = his_self.game.spaces[sources[i]].neighbours[z];
	  if (!map[sourcekey]) {
	    map[sourcekey] = 1;
	    new_neighbours.push(sourcekey);

	    //
	    // if we have a hit, it's this many hops!
	    //
	    if (filter_func(sourcekey)) { return hop; }
	  }
	}
      }

      if (new_neighbours.length > 0) {
	return addHop(new_neighbours, hop);
      } else {
	return 0;
      }

    }

    return addHop(space.neighbours, 0);   

  }

  //
  // similar to above, except it can cross a sea-zone
  //
  isSpaceConnectedToCapitalSpringDeployment(space, faction) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};
    let transit_passes = 0;
    let hostile_sea_passes = 0;

    if (this.game.state.spring_deploy_across_seas.includes(faction)) {
      hostile_sea_passes = 1;
    }
    if (this.game.state.spring_deploy_across_passes.includes(faction)) {
      transit_passes = 1;
    }

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      },

      // transit passes? 0
      transit_passes,

      // transit seas? 1
      1,
     
      // faction? optional
      faction,

      // already crossed sea zone optional
      0 
    );

    return 1;
  }

  isSpaceAdjacentToReligion(space, religion) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.neighbours.length; i++) {
      if (this.game.spaces[space.neighbours[i]].religion === religion) {
	return true;
      }
    }
    return false;
  }

  isSpaceAdjacentToProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let z = 0; z < space.neighbours.length; z++) {
      if (this.doesSpaceContainProtestantReformer(space.neighbours[z])) { return true; }
    }
    return false;
  }

  // either in port or in adjacent sea
  returnNumberOfSquadronsProtectingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let number_of_squadrons_in_port = 0;
    let number_of_squadrons_at_sea = 0;

    //
    // in port
    //
    for (let f in space.units) {
      for (let i = 0; i < space.units[f].length; i++) {
        if (space.units[f][i].type == "squadron") {
	  if (space.units[f][i].besieged != 0) { number_of_squadrons_in_port++; }
	}
      }
    }

console.log("SQUADRONS IN SPACE: " + number_of_squadrons_in_port);

    //
    // adjacent sea
    //
console.log("SPACE PORTS: " + JSON.stringify(space.ports));

    for (let p = 0; p < space.ports.length; p++) {

      let sea = this.game.navalspaces[space.ports[p]];

console.log("SEA: " + JSON.stringify(sea));

      for (let f in sea.units) {

	// faction at sea is friendly to port space controller
	if (this.isSpaceFriendly(space, f)) {
	  for (let i = 0; i < sea.units[f].length; i++) {
	    if (sea.units[f][i].type == "squadron") {
	      number_of_squadrons_at_sea++;
	    }
	  }
	}
      }
    }

console.log("SQUADRONS AT SEA: " + number_of_squadrons_at_sea);

    return (number_of_squadrons_in_port + number_of_squadrons_at_sea);

  }
  doesSpaceContainProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      if (space.units["protestant"][i].reformer == true) { return true; }
    }
    return false;
  }

  doesSpaceContainCatholicReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["papacy"].length; i++) {
      if (space.units["papacy"][i].reformer == true) { return true; }
    }
    return false;
  }

  isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let seas = [];
    for (let i = 0; i < space.ports.length; i++) {
      if (!seas.includes(space.ports[i])) { seas.push(space.ports[i]); }
    }
    for (let s in this.game.spaces) {
      let sp = this.game.spaces[s];
      if (sp.religion == "protestant" && sp.ports.length > 0) {
	for (let z = 0; z < sp.ports.length; z++) {
	  if (seas.includes(sp.ports[z])) { return true; }
	}
      }
    }  
    return false;
  }


  returnSpacesWithFilter(filter_func) {
    let spaces = [];
    for (let spacekey in this.game.spaces) {
      if (filter_func(spacekey) == 1) { spaces.push(spacekey); }
    }
    return spaces;
  }

  isSpaceFactionCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let capitals = this.returnCapitals(faction);
    for (let i = 0; i < capitals.length; i++) {
      if (capitals[i] === space.key) { return true; }
    }
    return false;
  }

  isSpaceInUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.unrest == 1) { return true; }
    return false;
  }

  isSpaceUnderSiege(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.besieged > 0) { return true; }
    return false;
  }

  isSpaceConnectedToCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      }
    );

    return 1;
  }










  returnFactionControllingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let factions = this.returnImpulseOrder(); 
    for (let i = 0; i < factions.length; i++) {
      if (this.isSpaceControlled(space, factions[i])) { return factions[i]; }
    }
    if (space.political) { return space.political; }
    return space.home;
  }



  returnSpaceOfPersonage(faction, personage) {
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i]) {
	    if (this.game.spaces[key].units[faction][i].type === personage) {
  	      return key;
            }
          }
        }
      }
    }
    return "";
  }

  returnIndexOfPersonageInSpace(faction, personage, spacekey="") {
    if (spacekey === "") { return -1; }
    if (!this.game.spaces[spacekey]) { return -1; }
    for (let i = 0; i < this.game.spaces[spacekey].units[faction].length; i++) {
      if (this.game.spaces[spacekey].units[faction][i].type === personage) {
        return i;
      }
    }
    return -1;
  }

  returnNavalTransportDestinations(faction, space, ops) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let viable_destinations = [];
    let viable_navalspaces = [];
    let options = [];
    let ops_remaining = ops-1;    

    for (let i = 0; i < space.ports.length; i++) {
      if (this.doesFactionHaveNavalUnitsInSpace(faction, space.ports[i])) {
	viable_navalspaces.push({key : space.ports[i] , ops_remaining : ops_remaining});
      }
    }

    //
    // TODO check for blocking fleet
    //
    while (ops_remaining > 1) {
      ops_remaining--;
      for (let i = 0; i < viable_navalspaces.length; i++) {
	for (let z = 0; z < this.game.navalspaces[viable_navalspaces[i].key].neighbours.length; z++) {
          if (this.doesFactionHaveNavalUnitsInSpace(faction, space.ports[i])) {
	    let ns = this.game.navalspaces[viable_navalspaces[i].key].neighbours[z];
	    let already_included = 0;
	    for (let z = 0; z < viable_navalspaces.length; z++) {
	      if (viable_navalspaces[z].key == ns) { already_included = 1; }
	    }
	    if (already_included == 0) {
	      viable_navalspaces.push({ key : ns , ops_remaining : ops_remaining });
	    }
	  }
	}
      }
    }

    //
    //
    //
    for (let i = 0; i < viable_navalspaces.length; i++) {
      let key = viable_navalspaces[i].key;
      for (let z = 0; z < this.game.navalspaces[key].ports.length; z++) {      
	let port = this.game.navalspaces[key].ports[z];
	if (port != space.key) {
	  viable_destinations.push({ key : port , cost : (ops - ops_remaining)});
	}
      }
    }

    return viable_destinations;

  }


  returnFactionNavalUnitsToMove(faction) {

    let units = [];

    //
    // include minor-activated factions
    //
    let fip = [];
        fip.push(faction);
    if (this.game.state.activated_powers[faction]) {
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
        fip.push(this.game.state.activated_powers[faction][i]);
      }
    }

    //
    // if this is the 2P game, include any major activated units
    //
    if (this.game.players.length == 2) { 
      if (this.areAllies(faction, "hapsburg") && faction != "hapsburg") { fip.push("hapsburg"); }
      if (this.areAllies(faction, "protestant") && faction != "protestant") { fip.push("protestant"); }
      if (this.areAllies(faction, "france") && faction != "france") { fip.push("france"); }
      if (this.areAllies(faction, "england") && faction != "england") { fip.push("england"); }
      if (this.areAllies(faction, "papacy") && faction != "papacy") { fip.push("papacy"); }
      if (this.areAllies(faction, "ottoman") && faction != "ottoman") { fip.push("ottoman"); }
    }

    //
    // find units
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.spaces) {

	//
	// we only care about units in ports
	//
	if (this.game.spaces[key].ports) {
	if (this.game.spaces[key].ports.length > 0) {
	  let ships = [];
	  let leaders = [];
	  for (let z = 0; z < this.game.spaces[key].units[fip[i]].length; z++) {

	    //
	    // only add leaders if there is a ship in port
	    //
	    let u = this.game.spaces[key].units[fip[i]][z];
	    u.idx = z;
	    if (u.land_or_sea === "sea") {
	      if (u.navy_leader == true) {
		leaders.push(u);
	      } else {
		ships.push(u);
	      }
	    }
	  }

	  //
	  // add and include location
	  //
	  if (ships.length > 0) {
	    for (let y = 0; y < ships.length; y++) {
	      ships[y].spacekey = key;
	      units.push(ships[y]);
	    }
	    for (let y = 0; y < leaders.length; y++) {
	      leaders[y].spacekey = key;
	      units.push(leaders[y]);
	    }
	  }
	}
        }
      }
    }

    //
    // add ships and leaders out-of-port
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.navalspaces) {
	for (let z = 0; z < this.game.navalspaces[key].units[fip[i]].length; z++) {
	  this.game.navalspaces[key].units[fip[i]][z].spacekey = key;
	  units.push(this.game.navalspaces[key].units[fip[i]][z]);
	}
      }
    }

    return units;
  }








  returnNearestFriendlyFortifiedSpaces(faction, space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

if (space.key === "agram") {
  console.log(space.type + " -- " + space.fortified);
}

    if (space.type == "fortress" || space.type == "electorate" || space.type == "key" || space.fortified == 1) { return [space]; }

if (faction == "venice") {
  console.log("getting res for: " + space.key);
}

    let original_spacekey = space.key;
    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // fortified spaces
      function(spacekey) {
        if (his_self.isSpaceFortified(his_self.game.spaces[spacekey])) {
console.log(spacekey + " -- is fortified");
	  if (his_self.isSpaceControlled(spacekey, faction)) {
console.log("and controlled");
	    return 1;
	  }
	  if (his_self.isSpaceFriendly(spacekey, faction)) {
console.log("and friendly");
	    return 1;
	  }
	}
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	if (spacekey == original_spacekey) { return 1; }
	return 0;
      }
    );

    return res;

  }


  returnNearestFactionControlledPorts(faction, space) {
    try { if (this.game.navelspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestNavalSpaceOrPortWithFilter(

      space.key,

      // ports
      function(spacekey) {
        if (his_self.game.spaces[spacekey]) {
	  if (his_self.isSpaceControlled(space, faction)) {
	    return 1;
	  }
	}
        return 0;
      },

      // route through this
      function(spacekey) {	
        if (his_self.game.spaces[spacekey]) { return 0; }
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	return 1;
      }
    );

    return res;

  }


  canFactionRetreatToSpace(faction, space, attacker_comes_from_this_space="") {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.spaces[attacker_comes_from_this_space]) { attacker_comes_from_this_space = this.game.spaces[attacker_comes_from_this_space]; } } catch (err) {}
    if (space === attacker_comes_from_this_space) { return 0; }
    if (this.isSpaceInUnrest(space) == 1) { return 0; }
    if (this.isSpaceFriendly(space, faction) == 1) { return 1; }
    return 0;
  }

  canFactionRetreatToNavalSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    return 1;
  }

  convertSpace(religion, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.religion = religion;
    this.displayBoard();
  }

  controlSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.political = faction;
    space.occupier = faction;
  }


  returnDefenderFaction(attacker_faction, space) {
    // called in combat, this finds whichever faction is there but isn't allied to the attacker
    // or -- failing that -- whichever faction is recorded as occupying the space.
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      let luis = this.returnFactionLandUnitsInSpace(f, space.key);
      if (luis > 0) {
        if (!this.areAllies(attacker_faction, f) && f !== attacker_faction) {
	  return f;
	}
      }
    }
    return this.returnFactionOccupyingSpace(space);
  }

  returnFactionOccupyingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.occupier != "" && space.occupier != undefined && space.occupier != "undefined" && space.occupier != 'undefined') { 
      // whoever had units here first
      if (space.units[space.occupier]) {
        if (space.units[space.occupier].length > 0) {
          return space.occupier; 
        }
      }
    }
    // or whoever has political control
    if (space.political != "") { return space.political; }
    // or whoever has home control
    if (space.owner != -1) { return space.owner; }
    return space.home;
  }

  returnFriendlyLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "regular") { luis++; }
      if (space.units[faction][i].type === "mercenary") { luis++; }
      if (space.units[faction][i].type === "cavalry") { luis++; }
    }
    return luis;
  }

  returnFactionLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "regular") { luis++; }
      if (space.units[faction][i].type === "mercenary") { luis++; }
      if (space.units[faction][i].type === "cavalry") { luis++; }
    }
    return luis;
  }

  returnFactionSeaUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "squadron") { luis++; }
      if (space.units[faction][i].type === "corsair") { luis++; }
    }
    return luis;
  }

  doesOtherFactionHaveNavalUnitsInSpace(exclude_faction, key) {
    if (this.game.spaces[key]) {
      for (let f in this.game.spaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.spaces[key].units[faction]) {
            for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
              if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
    }
    if (this.game.navalspaces[key]) {
      for (let f in this.game.navalspaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.navalspaces[key].units[faction]) {
            for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
              if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
    }
    return 0;
  }

  doesFactionHaveNavalUnitsInSpace(faction, key) {
    if (this.game.spaces[key]) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
          if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    if (this.game.navalspaces[key]) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
          if (this.game.navalspaces[key].units[faction][i].type === "squadron" || this.game.navalspaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    return 0;
  }

  doesFactionHaveNavalUnitsOnBoard(faction) {
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
	  return 1;
	}
      }
    }
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i].land_or_sea === "sea") {
	    return 1;
	  }
	}
      }
    }
    return 0;
  }

  returnFactionMap(space, faction1, faction2) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let faction_map = {};

    for (let f in space.units) {
      if (this.returnFactionLandUnitsInSpace(f, space)) {
        if (f == faction1) {
          faction_map[f] = faction1;
        } else {
          if (f == faction2) {
            faction_map[f] = faction2;
          } else {
            if (this.areAllies(f, faction1)) {
              faction_map[f] = faction1;
            }
            if (this.areAllies(f, faction2)) {
              faction_map[f] = faction2;
            }
          }
        }
      }
    }
    return faction_map;
  }

  returnHomeSpaces(faction) {

    let spaces = [];

    for (let i in this.game.spaces) {
      if (this.game.spaces[i].home === faction) { spaces.push(i); }
    }

    return spaces;

  }

  //
  // transit seas calculates neighbours across a sea zone
  //
  // if transit_seas and faction is specified, we can only cross if
  // there are no ports in a zone with non-faction ships.
  //
  returnNeighbours(space, transit_passes=1, transit_seas=0, faction="") {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (transit_seas == 0) {
      if (transit_passes == 1) {
        return space.neighbours;
      }
      let neighbours = [];
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];      
        if (!space.pass.includes[x]) {
  	  neighbours.push(x);
        }
      }
      return neighbours;
    } else {

      let neighbours = [];

      if (transit_passes == 1) {
        neighbours = JSON.parse(JSON.stringify(space.neighbours));
      } else {
        for (let i = 0; i < space.neighbours.length; i++) {
          let x = space.neighbours[i];  
          if (!space.pass.includes[x]) {
            neighbours.push(x);
          }
        }
      }

      //
      // any ports ?
      //
      if (space.ports) {
        if (space.ports.length > 0) {
	  for (let i = 0; i < space.ports.length; i++) {
	    let navalspace = this.game.navalspaces[space.ports[i]];
	    let any_unfriendly_ships = false;
	    if (navalspace.ports) {
	      if (faction != "") {
	        for (let z = 0; z < navalspace.ports.length; z++) {
	          if (this.doesOtherFactionHaveNavalUnitsInSpace(faction, navalspace.ports[z])) {
		    if (this.game.state.events.spring_preparations != faction) {
		      any_unfriendly_ships = true;
		    }
		  }
	        }
	      }
              for (let z = 0; z < navalspace.ports.length; z++) {
	        if (!neighbours.includes(navalspace.ports[z]) && any_unfriendly_ships == false) {
	          neighbours.push(navalspace.ports[z]);
	        };
	      }
	    }
 	  }
        }
      }
      return neighbours;
    }
  }


  //
  // only calculates moves from naval spaces, not outbound from ports
  //
  returnNavalNeighbours(space, transit_passes=1) {
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let neighbours = [];
    for (let i = 0; i < space.ports.length; i++) {
      let x = space.ports[i];
      neighbours.push(x);
    }
    for (let i = 0; i < space.neighbours.length; i++) {
      let x = space.neighbours[i];
      neighbours.push(x);
    }

    return neighbours;
  }




  //
  // returns adjacent naval and port spaces
  //
  returnNavalAndPortNeighbours(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let key = space.key;
    let neighbours = [];

    //
    // ports add only naval spaces
    //
    if (this.game.spaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
    }

    //
    // naval spaces add ports
    //
    if (this.game.navalspaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];
        neighbours.push(x);
      }
    }

    return neighbours;
  }


  //
  // returns both naval and port movement options
  //
  returnNavalMoveOptions(spacekey) {

    let neighbours = [];

    if (this.game.navalspaces[spacekey]) {
      for (let i = 0; i < this.game.navalspaces[spacekey].neighbours.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].neighbours[i]);
      }
      for (let i = 0; i < this.game.navalspaces[spacekey].ports.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].ports[i]);
      }
    } else {
      if (this.game.spaces[spacekey]) {
        for (let i = 0; i < this.game.spaces[spacekey].ports.length; i++) {
	  neighbours.push(this.game.spaces[spacekey].ports[i]);
        }
      }
    }

    return neighbours;
  }


  //
  // find the nearest destination.
  //
  returnNearestNavalSpaceOrPortWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNavalNeighbours(sourcekey);

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }



    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	  if (searched_spaces[key]) {
	    // we've searched for this before
	  } else {
	    searched_spaces[key] = { hops : (hops+1) , key : key };
	  }
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.navalspaces[key].neighbours.length; i++) {
	      if (searched_spaces[this.game.navalspaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[this.game.navalspaces[key].neighbours[i]] = { hops : (hops+1) , key : this.game.navalspaces[key].neighbours[i] };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) {
	continue_searching = 0;
	for (let newkey in pending_spaces) {
	  if (pending_spaces[newkey]) { continue_searching = 1; }
	}
      }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  //
  // find the nearest destination.
  //
  // transit_eas = filters on spring deploment criteria of two friendly ports on either side of the zone + no uncontrolled ships in zone
  //
  returnNearestSpaceWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1, transit_passes=0, transit_seas=0, faction="", already_crossed_sea_zone=0) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNeighbours(sourcekey, transit_passes, transit_seas, faction);

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }

    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	  if (searched_spaces[key]) {
	    // we've searched for this before
	  } else {
	    searched_spaces[key] = { hops : (hops+1) , key : key };
	  }
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.spaces[key].neighbours.length; i++) {
	      if (searched_spaces[this.game.spaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[this.game.spaces[key].neighbours[i]] = { hops : (hops+1) , key : this.game.spaces[key].neighbours[i] };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) {
	continue_searching = 0;
	for (let newkey in pending_spaces) {
	  if (pending_spaces[newkey]) { continue_searching = 1; }
	}
      }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  isSpaceElectorate(spacekey) {
    if (spacekey === "augsburg") { return true; }
    if (spacekey === "mainz") { return true; }
    if (spacekey === "trier") { return true; }
    if (spacekey === "cologne") { return true; }
    if (spacekey === "wittenberg") { return true; }
    if (spacekey === "brandenburg") { return true; }
    return false;
  }

  returnNumberOfCatholicElectorates() {
    let controlled_keys = 0;
    if (!this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfProtestantElectorates() {
    let controlled_keys = 0;
    if (this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByCatholics() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "catholic") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByProtestants() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "protestant") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByFaction(faction) {
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByPlayer(player_num) {
    let faction = this.game.state.players_info[player_num-1].faction;
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }

  returnNumberOfCatholicSpacesInLanguageZone(language="") {  
    let catholic_spaces = 0;
    for (let key in this.game.spaces) {
      if ((this.game.spaces[key].unrest == 1 && this.game.spaces[key].religion == "protestant") || this.game.spaces[key].religion === "catholic") {
	if (language == "" || this.game.spaces[key].language == language) {
	  catholic_spaces++;
	}
      }
    }
    return catholic_spaces;
  }

  returnNumberOfProtestantSpacesInLanguageZone(language="") {  
    let protestant_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant" && this.game.spaces[key].unrest == 0) {
	if (language == "all" || language == "" || this.game.spaces[key].language == language) {
	  protestant_spaces++;
	}
      }
    }
    return protestant_spaces;
  }


  returnNavalSpaces() {

    let seas = {};

    seas['irish'] = {
      top : 875 ,
      left : 900 ,
      name : "Irish Sea" ,
      ports : ["glasgow"] ,
      neighbours : ["biscay","north","channel"] ,
    }
    seas['biscay'] = {
      top : 1500 ,
      left : 1400 ,
      name : "Bay of Biscay" ,
      ports : ["brest", "nantes", "bordeaux", "corunna" ] ,
      neighbours : ["irish","channel","atlantic"] ,
    }
    seas['atlantic'] = {
      top : 2700 ,
      left : 850 ,
      name : "Atlantic Ocean" ,
      ports : ["gibraltar" , "seville" , "corunna"] ,
      neighbours : ["biscay"] ,
    }
    seas['channel'] = {
      top : 1020 ,
      left : 1450 ,
      name : "English Channel" ,
      ports : ["brest", "plymouth", "portsmouth", "rouen", "bolougne", "calais" ] ,
      neighbours : ["irish","biscay","north"] ,
    }
    seas['north'] = {
      top : 200 ,
      left : 2350 ,
      name : "North Sea" ,
      ports : ["london", "norwich", "berwick", "edinburgh", "calais", "antwerp", "amsterdam", "bremen", "hamburg" ] ,
      neighbours : ["irish","channel","baltic"] ,
    }
    seas['baltic'] = {
      top : 50 ,
      left : 3150 ,
      name : "Baltic Sea" ,
      ports : ["lubeck", "stettin" ] ,
      neighbours : ["north"] ,
    }
    seas['gulflyon'] = {
      top : 1930 ,
      left : 2430 ,
      name : "Gulf of Lyon" ,
      ports : ["cartagena", "valencia", "palma", "barcelona" , "marseille", "nice" , "genoa", "bastia" ] ,
      neighbours : ["barbary","tyrrhenian"] ,
    }
    seas['barbary'] = {
      top : 2330 ,
      left : 2430 ,
      name : "Barbary Coast" ,
      ports : ["gibraltar", "oran", "cartagena", "algiers" , "tunis", "cagliari" , "palma" ] ,
      neighbours : ["gulflyon","tyrrhenian","ionian","africa"] ,
    }
    seas['tyrrhenian'] = {
      top : 2260 ,
      left : 3300 ,
      name : "Tyrrhenian Sea" ,
      ports : ["genoa" , "bastia" , "rome" , "naples" , "palermo" , "caliari" , "messina" ] ,
      neighbours : ["barbary","gulflyon"] ,
    }
    seas['africa'] = {
      top : 2770 ,
      left : 4200 ,
      name : "North African Coast" ,
      ports : ["tunis" , "tripoli" , "malta" , "candia" , "rhodes" ] ,
      neighbours : ["ionian","barbary","aegean"] ,
    }
    seas['aegean'] = {
      top : 2470 ,
      left : 4450 ,
      name : "Aegean Sea" ,
      ports : ["rhodes" , "candia" , "coron" , "athens" , "salonika" , "istanbul" ] ,
      neighbours : ["black","africa","ionian"] ,
    }
    seas['ionian'] = {
      top : 2390 ,
      left : 3750 ,
      name : "Ionian Sea" ,
      ports : ["malta" , "messina" , "coron", "lepanto" , "corfu" , "taranto" ] ,
      neighbours : ["black","aegean","adriatic"] ,
    }
    seas['adriatic'] = {
      top : 1790 ,
      left : 3400 ,
      name : "Adriatic Sea" ,
      ports : ["corfu" , "durazzo" , "scutari" , "ragusa" , "trieste" , "venice" , "ravenna" , "ancona" ] ,
      neighbours : ["ionian"] ,
    }
    seas['black'] = {
      top : 1450 ,
      left : 4750 ,
      name : "Black Sea" ,
      ports : ["istanbul" , "varna" ] ,
      neighbours : ["aegean"] ,
    }

    for (let key in seas) {
      seas[key].units = {};
      seas[key].units['england'] = [];
      seas[key].units['france'] = [];
      seas[key].units['hapsburg'] = [];
      seas[key].units['ottoman'] = [];
      seas[key].units['papacy'] = [];
      seas[key].units['protestant'] = [];
      seas[key].units['venice'] = [];
      seas[key].units['genoa'] = [];
      seas[key].units['hungary'] = [];
      seas[key].units['scotland'] = [];
      seas[key].units['independent'] = [];
      seas[key].key = key;
    }

    return seas;
  }

  returnSpaceName(key) {
    if (this.game.spaces[key]) { return this.game.spaces[key].name; }
    if (this.game.navalspaces[key]) { return this.game.navalspaces[key].name; }
    return "Unknown";
  }


  returnSpacesInUnrest() {
    let spaces_in_unrest = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].unrest == 1) { spaces_in_unrest.push(key); }
    }
    return spaces_in_unrest;
  }

  returnSpacesWithFactionInfantry(faction) {
    let spaces_with_infantry = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction].length > 0) {
        spaces_with_infantry.push(key);
      }
    }
    return spaces_with_infantry;
  }

  returnSpaces() {

    let spaces = {};

    spaces['stirling'] = {
      top: 70,
      left: 1265,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["glasgow","edinburgh"],
      language: "english",
      type: "fortress"
    }
    spaces['glasgow'] = {
      top: 225,
      left: 1285,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["stirling","edinburgh","carlisle"],
      language: "english",
      type: "town"
    }
    spaces['edinburgh'] = {
      top: 125,
      left: 1420,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["stirling","carlisle","berwick"],
      language: "english",
      type: "key"
    }
    spaces['berwick'] = {
      top: 183,
      left: 1572,
      home: "england",
      political: "england",
      ports: ["north"],
      neighbours: ["edinburgh","carlisle","york"],
      language: "english",
      religion: "catholic",
      type: "town"
    }
    spaces['carlisle'] = {
      top: 276,
      left: 1447,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["glasgow","berwick","york","shrewsbury"],
      language: "english",
      type: "town"
    }
    spaces['york'] = {
      top: 375,
      left: 1595,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["berwick","carlisle","shrewsbury","lincoln"],
      language: "english",
      type: "key"
    }
    spaces['wales'] = {
      top: 633,
      left: 1398,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["shrewsbury","bristol"],
      language: "english",
      type: "town"

    }
    spaces['shrewsbury'] = {
      top: 521,
      left: 1535,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["wales","carlisle","york","london","bristol"],
      language: "english",
      type: "town"
    }
    spaces['lincoln'] = {
      top: 531,
      left: 1706,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["london","york"],
      language: "english",
      type: "town"
    }
    spaces['norwich'] = {
      top: 538,
      left: 1896,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["north"],
      neighbours:["london"],
      language: "english",
      type: "town"
    }
    spaces['bristol'] = {
      top: 688,
      left: 1554,
      home: "england",
      political: "england",
      religion: "catholic",
      language: "english",
      ports: ["irish"],
      neighbours: ["shrewsbury","wales","plymouth","portsmouth","london"],
      type: "key"
    }
    spaces['london'] = {
      top: 706,
      left: 1785,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["norwich","lincoln","bristol","portsmouth","shrewsbury"],
      language: "english",
      type: "key"
    }
    spaces['plymouth'] = {
      top: 898,
      left: 1398,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["bristol","portsmouth"],
      language: "english",
      type: "town"
    }
    spaces['portsmouth'] = {
      top: 821,
      left: 1661,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["channel"],
      neighbours: ["plymouth","bristol","london"],
      language: "english",
      type: "town"
    }
    spaces['calais'] = {
      top: 745,
      left: 2022,
      home: "england",
      political: "england",
      religion: "catholic",
      ports:["north"], 
      neighbours: ["boulogne","brussels","antwerp"],
      language: "french",
      type: "key"
    }

    spaces['boulogne'] = {
      top: 880,
      left: 1955,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["channel"],
      neighbours: ["calais","rouen","paris","stquentin"],
      language: "french",
      type: "town"
    }
    spaces['stquentin'] = {
      name: "St. Quentin",
      top: 933,
      left: 2093,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stdizier","paris","boulogne"],
      type: "town"
    }
    spaces['stdizier'] = {
      name: "St. Dizier",
      top: 1043,
      left: 2205,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stquentin","paris","dijon","metz"],
      language: "french",
      type: "town"
    }
    spaces['paris'] = {
      top: 1063,
      left: 2009,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","boulogne","stquentin","stdizier","dijon","orleans"],
      language: "french",
      type: "key"
    }
    spaces['rouen'] = {
      top: 1000,
      left: 1805,
      home: "france",
      political: "france",
      ports: ["channel"],
      religion: "channelc",
      neighbours: ["boulogne","paris","tours","nantes"],
      language: "french",
      type: "key"
    }
    spaces['orleans'] = {
      top: 1217,
      left: 2018,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["paris","tours","dijon","lyon"],
      language: "french",
      type: "town"
    }
    spaces['dijon'] = {
      top: 1205,
      left: 2204,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["stdizier","paris","orleans","lyon","besancon"],
      type: "town"
    }
    spaces['limoges'] = {
      top: 1398,
      left: 1975,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["tours","bordeaux","lyon"],
      language: "french",
      type: "town"
    }
    spaces['tours'] = {
      top: 1277,
      left: 1849,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","nantes","bordeaux","limoges","orleans"],
      language: "french",
      type: "town"
    }
    spaces['nantes'] = {
      top: 1310,
      left: 1650,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["biscay"],
      neighbours: ["brest","rouen","tours","bordeaux"],
      language: "french",
      type: "town"
    }
    spaces['brest'] = {
      top: 1173,
      left: 1409,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["channnel","biscay"],
      neighbours: ["nantes"],
      language: "french",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["biscay"],
      neighbours: ["navarre", "nantes","tours","limoges"],
      pass: ["navarre"],
      language: "french",
      type: "key"
    }
    spaces['lyon'] = {
      top: 1445,
      left: 2312,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["avignon","limoges","orleans","dijon","geneva","grenoble"],
      language: "french",
      type: "key"
    }
    spaces['grenoble'] = {
      top: 1590,
      left: 2437,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["turin","lyon","geneva"],
      pass: ["turin"],
      language: "french",
      type: "town"
    }
    spaces['avignon'] = {
      top: 1645,
      left: 2292,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["barcelona","toulouse","lyon","marseille"],
      pass: ["barcelona"],
      language: "french",
      type: "town"
    }
    spaces['marseille'] = {
      top: 1781,
      left: 2390,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["lyon"],
      neighbours: ["avignon","nice"],
      language: "french",
      type: "key"
    }
    spaces['toulouse'] = {
      top: 1740,
      left: 1990,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["barcelona","bordeaux","avignon"],
      pass: ["barcelona"],
      language: "french",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["nantes","tours","limoges","toulouse"],
      language: "french",
      type: "key"
    }

    spaces['munster'] = {
      top: 537,
      left: 2500,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["bremen","kassel","cologne","amsterdam"],
      language: "german",
      type: "town"
    }
    spaces['bremen'] = {
      top: 422,
      left: 2595,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["north"],
      neighbours:["munster","brunswick","hamburg"],
      language: "german",
      type: "town"
    }
    spaces['hamburg'] = {
      top: 345,
      left: 2758,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["bremen","brunswick","lubeck"],
      language: "german",
      type: "town"
    }
    spaces['lubeck'] = {
      top: 258,
      left: 2985,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["baltic"],
      neighbours: ["hamburg","magdeburg","brandenburg","stettin"],
      language: "german",
      type: "town"
    }
    spaces['stettin'] = {
      top: 310,
      left: 3214,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["baltic"],
      neighbours: ["lubeck","brandenburg"],
      language: "german",
      type: "town"
    }
    spaces['brandenburg'] = {
      top: 467,
      left: 3080,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["stettin","lubeck","magdeburg","wittenberg","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['wittenberg'] = {
      top: 610,
      left: 3133,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["brandenburg","magdeburg","leipzig","prague","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['magdeburg'] = {
      top: 536,
      left: 2935,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["lubeck","brandenburg","wittenberg","erfurt","brunswick"],
      language: "german",
      type: "town"
    }
    spaces['brunswick'] = {
      top: 568,
      left: 2722,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["bremen","hamburg","magdeburg","kassel"],
      language: "german",
      type: "town"
    }
    spaces['cologne'] = {
      top: 726,
      left: 2500,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["munster","mainz","liege"],
      language: "german",
      type: "electorate"
    }
    spaces['kassel'] = {
      top: 714,
      left: 2665,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["munster","brunswick","erfurt","nuremberg","mainz"],
      language: "german",
      type: "town"
    }
    spaces['erfurt'] = {
      top: 750,
      left: 2824,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["magdeburg","kassel","leipzig"],
      language: "german",
      type: "town"
    }
    spaces['leipzig'] = {
      top: 690,
      left: 2983,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["wittenberg","prague","nuremberg","erfurt"],
      language: "german",
      type: "town"
    }
    spaces['regensburg'] = {
      top: 956,
      left: 3033,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["nuremberg","augsburg","salzburg","linz"],
      language: "german",
      type: "town"
    }
    spaces['salzburg'] = {
      top: 1108,
      left: 3147,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["graz","linz","regensburg","augsburg","innsbruck"],
      pass: ["graz"],
      language: "german",
      type: "town"
    }
    spaces['augsburg'] = {
      top: 1084,
      left: 2864,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["innsbruck","worms","nuremberg","regensburg","salzburg"],
      pass: ["innsbruck"],
      language: "german",
      type: "electorate"
    }
    spaces['nuremberg'] = {
      top: 930,
      left: 2837,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["augsburg","worms","mainz","kassel","leipzig","regensburg"],
      language: "german",
      type: "town"
    }
    spaces['mainz'] = {
      top: 872,
      left: 2668,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["trier","cologne","kassel","nuremberg","worms"],
      language: "german",
      type: "electorate"
    }
    spaces['trier'] = {
      top: 897,
      left: 2521,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["liege","metz","mainz"],
      language: "german",
      type: "electorate"
    }
    spaces['strasburg'] = {
      top: 1070,
      left: 2578,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["metz","besancon","basel","worms"],
      language: "german",
      type: "town"
    }
    spaces['worms'] = {
      top: 1009,
      left: 2704,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["strasburg","mainz","nuremberg","augsburg"],
      language: "german",
      type: "town"
    }
    spaces['navarre'] = {
      top: 1814,
      left: 1702,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["zaragoza","bilbao"],
      language: "spanish",
      type: "key"
    }
    spaces['bilbao'] = {
      top: 1825,
      left: 1533,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["corunna","valladolid","zaragoza","navarre"],
      language: "spanish",
      type: "town"
    }
    spaces['corunna'] = {
      top: 1870,
      left: 1015,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["biscay","atlantic"],
      neighbours: ["bilbao","valladolid"],
      language: "spanish",
      type: "town"
    }
    spaces['valladolid'] = {
      top: 2058,
      left: 1394,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["corunna","bilbao","madrid"],
      language: "spanish",
      type: "key"
    }
    spaces['zaragoza'] = {
      top: 2025,
      left: 1777,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["navarre","bilbao","madrid","barcelona"],
      language: "spanish",
      type: "town"
    }
    spaces['barcelona'] = {
      top: 2062,
      left: 2106,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["toulouse","avignon","zaragoza","valencia"],
      pass: ["toulouse","avignon"],
      language: "spanish",
      type: "key"
    }
    spaces['palma'] = {
      top: 2266,
      left: 2211,
      home: "hapsburg",
      political: "",
      ports: ["gulflyon","barbary"],
      neighbours: ["cartagena","cagliari"],
      language: "other",
      religion: "catholic",
      type: "town"
    }
    spaces['madrid'] = {
      top: 2236,
      left: 1550,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["cordoba","valladolid","zaragoza","valencia"],
      language: "spanish",
      type: "town"
    }
    spaces['valencia'] = {
      top: 2333,
      left: 1871,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["cartagena","madrid","barcelona"],
      language: "spanish",
      type: "town"
    }
    spaces['cartagena'] = {
      top: 2593,
      left: 1830,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","barbary"],
      neighbours: ["granada","valencia"],
      language: "spanish",
      type: "town"
    }
    spaces['granada'] = {
      top: 2657,
      left: 1558,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["cordoba","gibraltar","cartagena"],
      language: "spanish",
      type: "town"
    }
    spaces['seville'] = {
      top: 2642,
      left: 1319,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["atlantic"],
      neighbours: ["cordoba","gibraltar"],
      language: "spanish",
      type: "key"
    }
    spaces['cordoba'] = {
      top: 2530,
      left: 1446,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["madrid","seville","granada"],
      language: "spanish",
      type: "town"
    }
    spaces['gibraltar'] = {
      top: 2814,
      left: 1374,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["atlantic","barbary"],
      neighbours: ["seville","granada"],
      language: "spanish",
      type: "fortress"
    }
    spaces['oran'] = {
      top: 2822,
      left: 1902,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['algiers'] = {
      top: 2656,
      left: 2275,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['tunis'] = {
      top: 2599,
      left: 2945,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["barbary","africa"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['cagliari'] = {
      top: 2320,
      left: 2828,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports:["tyrrhenian","barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['palermo'] = {
      top: 2421,
      left: 3260,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["messina"],
      language: "italian",
      type: "town"
    }
    spaces['messina'] = {
      top: 2429,
      left: 3475,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian","ionian"],
      neighbours: ["palermo","naples","taranto"],
      language: "italian",
      type: "town"
    }
    spaces['cerignola'] = {
      top: 1915,
      left: 3426,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["taranto","ancona","rome"],
      language: "italian",
      type: "town"
    }
    spaces['taranto'] = {
      top: 2080,
      left: 3597,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["ionian"],
      neighbours: ["cerignola","naples","messina"],
      language: "italian",
      type: "town"
    }
    spaces['naples'] = {
      top: 2087,
      left: 3358,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["rome","taranto","messina"],
      language: "italian",
      type: "key"
    }
    spaces['malta'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["ionian","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['vienna'] = {
      top: 1020,
      left: 3474,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["brunn","linz","graz","pressburg"],
      language: "german",
      type: "key"
    }
    spaces['linz'] = {
      top: 1045,
      left: 3288,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["prague","regensburg","salzburg","vienna"],
      language: "german",
      type: "town"
    }
    spaces['graz'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["salzburg","vienna","mohacs","agram","trieste"],
      pass: ["salzburg"],
      language: "german",
      type: "town"
    }
    spaces['trieste'] = {
      top: 1392,
      left: 3257,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["graz","agram","zara","venice"],
      language: "italian",
      type: "town"
    }
    spaces['innsbruck'] = {
      top: 1170,
      left: 3016,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["augsburg","trent","zurich","salzburg"],
      pass: ["augsburg","trent"],
      language: "german",
      type: "town"
    }
    spaces['tripoli'] = {
      top: 3030,
      left: 3316,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['candia'] = {
      top: 2670,
      left: 4484,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["aegean","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['rhodes'] = {
      top: 2524,
      left: 4730,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["aegean","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['corfu'] = {
      top: 2210,
      left: 3868,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['coron'] = {
      top: 2510,
      left: 4146,
      home: "",
      political: "",
      religion: "other",
      ports:["ionian","aegean"],
      neighbours: ["athens"],
      language: "other",
      type: "town"
    }
    spaces['athens'] = {
      top: 2346,
      left: 4286,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["aegean"],
      neighbours: ["larissa","lepanto","coron"],
      language: "other",
      type: "key"
    }
    spaces['lepanto'] = {
      top: 2320,
      left: 4057,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["ionian"],
      neighbours: ["larissa","athens"],
      language: "other",
      type: "town"
    }
    spaces['larissa'] = {
      top: 2184,
      left: 4130,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["durazzo","lepanto","athens","salonika"],
      pass: ["durazzo"],
      language: "other",
      type: "town"
    }
    spaces['salonika'] = {
      top: 2010,
      left: 4164,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["larissa","edirne"],
      language: "other",
      type: "key"
    }
    spaces['durazzo'] = {
      top: 2040,
      left: 3844,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["adriatic"],
      neighbours: ["larissa","scutari"],
      pass: ["larissa"],
      language: "other",
      type: "town"
    }
    spaces['scutari'] = {
      top: 1860,
      left: 3819,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["adriatic"],
      neighbours: ["nezh","ragusa","durazzo"],
      pass: ["nezh"],
      language: "other",
      type: "fortress"
    }
    spaces['edirne'] = {
      top: 1840,
      left: 4532,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["varna","istanbul","salonika","sofia",],
      language: "other",
      type: "key"
    }
    spaces['istanbul'] = {
      top: 1890,
      left: 4775,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["black","aegean"],
      neighbours: ["edirne","varna"],
      language: "other",
      type: "key"
    }
    spaces['varna'] = {
      top: 1620,
      left: 4653,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["black"],
      neighbours: ["bucharest","edirne","istanbul"],
      language: "other",
      type: "town"
    }
    spaces['bucharest'] = {
      top: 1430,
      left: 4459,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nicopolis","varna"],
      language: "other",
      type: "town"
    }
    spaces['nicopolis'] = {
      top: 1570,
      left: 4336,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["szegedin","sofia","bucharest","belgrade"],
      pass: ["szegedin","sofia"],
      language: "other",
      type: "town"
    }
    spaces['sofia'] = {
      top: 1765,
      left: 4275,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nicopolis","nezh","edirne"],
      pass: ["nicopolis"],
      language: "other",
      type: "town"
    }
    spaces['nezh'] = {
      top: 1652,
      left: 4070,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["scutari","belgrade","sofia"],
      pass: ["scutari"],
      language: "other",
      type: "town"
    }


    spaces['belgrade'] = {
      top: 1450,
      left: 3894,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["ragusa","szegedin","mohacs","agram","nezh","nicopolis"],
      pass: ["ragusa"],
      language: "other",
      type: "key"
    }
    spaces['szegedin'] = {
      top: 1268,
      left: 3846,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["nicopolis","buda","belgrade"],
      pass: ["nicopolis"],
      language: "other",
      type: "town"
    }
    spaces['mohacs'] = {
      top: 1353,
      left: 3710,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["buda","graz","agram","belgrade"],
      language: "other",
      type: "town"
    }
    spaces['graz'] = {
      top: 1208,
      left: 3374,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["vienna","mohacs","agram","trieste"],
      language: "german",
      type: "town"
    }
    spaces['agram'] = {
      top: 1373,
      left: 3460,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["zara","graz","trieste","belgrade","mohacs"],
      pass: ["zara"],
      language: "other",
      type: "town"
    }
    spaces['buda'] = {
      top: 1104,
      left: 3746,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["pressburg","mohacs","szegedin"],
      language: "other",
      type: "key"
    }
    spaces['pressburg'] = {
      top: 1080,
      left: 3613,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["vienna","buda"],
      language: "other",
      type: "town"
    }
    spaces['brunn'] = {
      top: 840,
      left: 3526,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["breslau","prague","vienna"],
      language: "other",
      type: "town"
    }
    spaces['breslau'] = {
      top: 640,
      left: 3466,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["brandenburg","wittenberg","brunn"],
      language: "other",
      type: "town"
    }
    spaces['prague'] = {
      top: 785,
      left: 3230,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["wittenberg","leipzig","linz"],
      language: "other",
      type: "key"
    }
    spaces['amsterdam'] = {
      top: 546,
      left: 2244,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["antwerp","munster"],
      language: "other",
      type: "town"
    }
    spaces['antwerp'] = {
      top: 669,
      left: 2168,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["antwerp","liege","brussels","calais"],
      language: "other",
      type: "key"
    }
    spaces['brussels'] = {
      top: 823,
      left: 2201,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["antwerp","calais","stquentin","stdizier","liege"],
      language: "french",
      type: "fortress"
    }
    spaces['liege'] = {
      top: 783,
      left: 2351,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["cologne","trier","metz","brussels","antwerp"],
      language: "french",
      type: "town"
    }
    spaces['metz'] = {
      top: 995,
      left: 2384,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["liege","trier","strasburg","besancon","stdizier"],
      language: "french",
      type: "key"
    }
    spaces['besancon'] = {
      top: 1169,
      left: 2390,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["metz","dijon","geneva","basel","strasburg"],
      language: "french",
      type: "fortress"
    }
    spaces['basel'] = {
      top: 1211,
      left: 2558,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["strasburg","besancon","geneva","zurich"],
      language: "german",
      type: "town"
    }
    spaces['zurich'] = {
      top: 1216,
      left: 2712,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["basel","innsbruck"],
      language: "german",
      type: "town"
    }
    spaces['geneva'] = {
      top: 1367,
      left: 2474,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["basel","besancon","lyon","turin","grenoble"],
      pass: ["turin"],
      language: "french",
      type: "town"
    }
    spaces['milan'] = {
      top: 1373,
      left: 2746,
      home: "independent",
      political: "france",
      religion: "catholic",
      neighbours: ["trent","modena","pavia","turin"],
      language: "italian",
      type: "key"
    }
    spaces['trent'] = {
      top: 1310,
      left: 2933,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["innsbruck","milan","modena","venice"],
      pass: ["innsbruck"],
      language: "italian",
      type: "town"
    }
    spaces['modena'] = {
      top: 1486,
      left: 2951,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["trent","milan","pavia","florence","ravenna","venice"],
      language: "italian",
      type: "town"
    }
    spaces['pavia'] = {
      top: 1505,
      left: 2800,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["milan","turin","genoa","modena"],
      language: "italian",
      type: "town"
    }
    spaces['turin'] = {
      top: 1530,
      left: 2585,
      home: "independent",
      political: "france",
      religion: "catholic",
      neighbours: ["milan","pavia","geneva","grenoble","genoa"],
      pass: ["grenoble","geneva"],
      language: "italian",
      type: "town"
    }
    spaces['nice'] = {
      top: 1733,
      left: 2580,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["genoa","marseille"],
      pass: ["genoa"],
      language: "french",
      type: "town"
    }
    spaces['florence'] = {
      top: 1642,
      left: 2976,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["modena","genoa","siena"],
      language: "italian",
      type: "key"
    }
    spaces['siena'] = {
      top: 1805,
      left: 2988,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["genoa","florence","rome"],
      language: "italian",
      type: "town"
    }
    spaces['bastia'] = {
      top: 1829,
      left: 2784,
      home: "genoa",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","tyrrhenian"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['genoa'] = {
      top: 1626,
      left: 2726,
      home: "genoa",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","tyrrhenian"],
      neighbours: ["nice","pavia","turin","modena","siena"],
      pass: ["nice"],
      language: "italian",
      type: "key"
    }
    spaces['rome'] = {
      top: 1924,
      left: 3125,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["siena","ancona","cerignola","naples"],
      language: "italian",
      type: "key"
    }
    spaces['ancona'] = {
      top: 1754,
      left: 3238,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["ravenna","rome","cerignola"],
      language: "italian",
      type: "town"
    }
    spaces['ravenna'] = {
      top: 1596,
      left: 3130,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["venice","modena","ancona"],
      language: "italian",
      type: "key" 
    }
    spaces['venice'] = {
      top: 1399,
      left: 3086,
      home: "venice",
      political: "",
      religion: "catholic",
      ports:["adriatic"],
      neighbours: ["trent","modena","ravenna","trieste"],
      language: "italian",
      type: "key"
    }
    spaces['zara'] = {
      top: 1571,
      left: 3374,
      home: "venice",
      political: "",
      religion: "catholic",
      neighbours: ["agram","ragusa","trieste"],
      pass: ["agram"],
      language: "other",
      type: "town"
    }
    spaces['ragusa'] = {
      top: 1750,
      left: 3660,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["belgrade","zara","scutari"],
      pass: ["belgrade"],
      language: "italian",
      type: "town"
    }

    //
    // foreign war cards are spaces
    //
    spaces['egypt'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }
    spaces['ireland'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }
    spaces['persia'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }

    for (let key in spaces) {
      spaces[key].units = {};
      spaces[key].units['england'] = [];
      spaces[key].units['france'] = [];
      spaces[key].units['hapsburg'] = [];
      spaces[key].units['ottoman'] = [];
      spaces[key].units['papacy'] = [];
      spaces[key].units['protestant'] = [];
      spaces[key].units['venice'] = [];
      spaces[key].units['genoa'] = [];
      spaces[key].units['hungary'] = [];
      spaces[key].units['scotland'] = [];
      spaces[key].units['independent'] = [];
      spaces[key].university = 0;
      spaces[key].unrest = 0;
      if (!spaces[key].ports) { spaces[key].ports = []; }
      if (!spaces[key].pass) { spaces[key].pass = []; }
      if (!spaces[key].name) { spaces[key].name = key.charAt(0).toUpperCase() + key.slice(1); }
      if (!spaces[key].key) { spaces[key].key = key; }
      if (!spaces[key].besieged) { spaces[key].besieged = 0; }
      if (!spaces[key].besieged_factions) { spaces[key].besieged_factions = []; }
    }

    return spaces;

  }


  isOccupied(space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    for (let key in space.units) {
      if (space.units[key].length > 0) { return 1; }
    }

    return 0;
  }

  isElectorate(spacekey) {

    try { if (spacekey.key) { spacekey = spacekey.key; } } catch (err) {}

    if (spacekey === "augsburg") { return 1; }
    if (spacekey === "trier") { return 1; }
    if (spacekey === "cologne") { return 1; }
    if (spacekey === "wittenberg") { return 1; }
    if (spacekey === "mainz") { return 1; }
    if (spacekey === "brandenburg") { return 1; }
    return 0;
  }

  //
  // import space attaches events / functions to spaces if they do not exist
  //
  importSpace(obj, key) {

    let his_self = this;

    obj.key = key;

    if (obj.name == null)               { obj.name = "Unknown"; }
    if (obj.owner == null)              { obj.owner = -1; }          
    if (obj.type == null)               { obj.type = "town"; }     
    if (obj.debaters == null)           { obj.debaters = []; }     
    if (obj.returnView == null)		{ 

      obj.returnView = function () {

	let html = '<div class="space_view" id="">';

	let home = obj.home;
	let religion = obj.religion;
	let political = obj.political;
	let language = obj.language;
	if (!political) { political = obj.home; }

	if (political == "genoa" || political == "venice" || political == "scotland" || political == "hungary" || political == "independent") { his_self.game.state.board[political] = his_self.returnOnBoardUnits(political); } else {
	  if (home == "genoa" || home == "venice" || home == "scotland" || home == "hungary" || home == "independent") { his_self.game.state.board[home] = his_self.returnOnBoardUnits(home); }
	}

	html += `
	  <div class="space_name">${obj.name}</div>
	  <div class="space_properties">
	    <div class="religion"><div class="${religion}" style="background-image: url('${his_self.returnReligionImage(religion)}')"></div><div class="label">${religion} religion</div></div>
	    <div class="political"><div class="${political}" style="background-image: url('${his_self.returnControlImage(political)}')"></div><div class="label">${political} control</div></div>
	    <div class="language"><div class="${language}" style="background-image: url('${his_self.returnLanguageImage(language)}')"></div><div class="label">${language} language</div></div>
	    <div class="home"><div class="${home}" style="background-image: url('${his_self.returnControlImage(home)}')"></div><div class="label">${home} home</div></div>
	  </div>
	  <div class="space_units">
	`;

        for (let key in obj.units) {
	  html += his_self.returnArmyTiles(key, obj.key);
	  html += his_self.returnMercenaryTiles(key, obj.key);
	  html += his_self.returnPersonagesTiles(key, obj.key);
	  html += his_self.returnNavalTiles(key, obj.key);
        }

        for (let f in this.units) {
	  if (this.units[f].length > 0) {
            for (let i = 0; i < this.units[f].length; i++) {
	      let b = "";
	      if (this.units[f][i].besieged) { b = ' (besieged)'; }
	      html += `<div class="space_unit">${f} - ${this.units[f][i].type} ${b}</div>`;
	    }
	  }
	}

	html += `</div>`;
	html += `</div>`;

	return html;

      };

    }

    return obj;

  }


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



  isMajorPower(power) {
    if (power === "france" || power === "hapsburg" || power === "england" || power === "protestant" || power === "ottoman" || power === "papacy") { return true; }
    return false;
  }

  isMinorPower(power) {
    if (power === "genoa" || power === "hungary" || power === "scotland" || power === "venice") { return 1; }
    return 0;
  }

  isAlliedMinorPower(mp, faction) {
    if (faction === this.returnAllyOfMinorPower(mp)) { return true; }
    return false;
  }

  returnMinorPowers() {
    return ["genoa", "hungary", "scotland", "venice"];
  }

  returnControllingPower(power) {
    return this.returnAllyOfMinorPower(power);
  }

  returnAllyOfMinorPower(power) {
    if (!this.game.state.minor_activated_powers.includes(power)) { return power; }
    for (let key in this.game.state.activated_powers) {
      if (this.game.state.activated_powers[key].includes(power)) {
	return key;
      }
    }
    return power;
  }

  activateMinorPower(faction, power) {
    if (this.returnAllyOfMinorPower(power) != power) {
      this.deactivateMinorPower(this.returnAllyOfMinorPower(power), power);
    }
    this.setAllies(faction, power, 0);
    this.game.state.activated_powers[faction].push(power);
    this.game.state.minor_activated_powers.push(power);
  }

  deactivateMinorPower(faction, power) {
    this.unsetAllies(faction, power, 0);
    for (let key in this.game.state.activated_powers) {
      for (let i = 0; i < this.game.state.activated_powers[key].length; i++) {
        if (this.game.state.activated_powers[key][i] === power) {
  	  this.game.state.activated_powers[key].splice(i, 1);
        }
      }
    }
    for (let i = 0; i < this.game.state.minor_activated_powers.length; i++) {
      if (this.game.state.minor_activated_powers[i] === power) {
	this.game.state.minor_activated_powers.splice(i, 1);
      }
    }
  }

  canFactionDeactivateMinorPower(faction, power) {
    if (power == "genoa") { return 1; }
    if (power == "scotland") { return 1; }
    if (power == "venice") { return 1; }
    return 0;
  }

  canFactionActivateMinorPower(faction, power) {
    if (power == "genoa") {
      if (faction == "france") { return 1; }
      if (faction == "hapsburg") { return 1; }
      if (faction == "papacy") { return 1; }
    }
    if (power == "hungary") {
      if (faction == "hapsburg") { return 1; }
    }
    if (power == "scotland") {
      if (faction == "france") { return 1; }
      if (faction == "england") { return 1; }
    }
    if (power == "venice") {
      if (faction == "france") { return 1; }
      if (faction == "hapsburg") { return 1; }
      if (faction == "papacy") { return 1; }
    }
    return 0;
  }

  isMinorActivatedPower(power) {
    for (let i = 0; i < this.game.state.minor_activated_powers.length; i++) {
      if (power === this.game.state.minor_activated_powers[i]) {
	return 1;
      }
    }
    return 0;
  }

  isMinorUnactivatedPower(power) {
    if (power === "genoa" && this.isMinorActivatedPower(power) != 1) { return 1; }
    if (power === "scotland" && this.isMinorActivatedPower(power) != 1) { return 1; }
    if (power === "hungary" && this.isMinorActivatedPower(power) != 1) { return 1; }
    if (power === "venice" && this.isMinorActivatedPower(power) != 1) { return 1; }
    return 0;
  }


  onNewImpulse() {
    //
    // remove foul weather
    //
    this.game.state.events.foul_weather = 0;
    this.game.state.spring_deploy_across_passes = [];
    this.game.state.spring_deploy_across_seas = [];
    this.game.state.events.spring_preparations = "";
    this.game.state.events.henry_petitions_for_divorce_grant = 0;
    this.game.state.spaces_assaulted_this_turn = [];

    //
    // reset impulse commits
    //
    this.game.state.debater_committed_this_impulse = {};
    

    //
    // remove gout
    //
    if (this.game.state.events.gout != 0) {
      for (let i in this.game.spaces) {
	let space = this.game.spaces[i];
        for (let f in space.units) {
          for (let z = space.units[f].length-1;  z >= 0; z--) {
	    space.units[f][z].gout = false; 
  	  }
        }
      }
      this.game.state.events.gout = 0;    
    }

    //
    // remove temporary bonuses and modifiers
    //
    this.game.state.events.augsburg_confession = false;


  }

  onNewRound() {

    //
    // reset impulse commits
    //
    this.game.state.debater_committed_this_impulse = {};
    this.game.state.spaces_assaulted_this_turn = [];
    this.game.state.printing_press_active = 0;

    this.game.state.tmp_reformations_this_turn = [];
    this.game.state.tmp_counter_reformations_this_turn = [];
    this.game.state.tmp_protestant_translation_bonus = 0;
    this.game.state.tmp_protestant_reformation_modifier = 0;
    this.game.state.tmp_protestant_reformation_bonus = 0;
    this.game.state.tmp_protestant_reformation_bonus_spaces = [];
    this.game.state.tmp_catholic_reformation_modifier = 0;
    this.game.state.tmp_catholic_reformation_bonus = 0;
    this.game.state.tmp_catholic_reformation_bonus_spaces = [];
            
    this.game.state.tmp_protestant_counter_reformation_modifier = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus_spaces = [];
    this.game.state.tmp_catholic_counter_reformation_modifier = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus_spaces = [];
    this.game.state.tmp_papacy_may_specify_debater = 0;
    this.game.state.tmp_papacy_may_specify_protestant_debater_unavailable = 0;
        
    //
    // allow stuff to move again
    //
    this.resetLockedTroops();

  }


  returnLoanedUnits() {
    for (let i in this.game.spaces) {
      space = this.game.spaces[i];
      for (let f in space.units) {
        for (let z = space.units[f].length-1;  z >= 0; z--) {
	  let unit = space.units[f][z];
	  if (unit.loaned != false) {
	    let lender = unit.loaned;
	    space.units[f].splice(z, 1);
	    space.units[lender].push(unit);
	  }
        }
      }
    }
    for (let i in this.game.navalspaces) {
      space = this.game.navalspaces[i];
      for (let f in space.units) {
        for (let z = space.units[f].length-1;  z >= 0; z--) {
	  let unit = space.units[f][z];
	  if (unit.loaned != false) {
	    let lender = unit.loaned;
	    space.units[f].splice(z, 1);
	    space.units[lender].push(unit);
	  }
        }
      }
    }
  }

  isCaptured(faction, unittype) {
    for (let i = 0; i < this.game.players.length; i++) {
      let p = this.game.state.players_info[i];
      if (p.captured.includes(unittype)) { return 1; }
    }
    return 0;
  }
  isSpaceBesieged(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.besieged == 1 || space.besieged == 2 || space.besieged == true) { return true; }
    return false;
  }
  isBesieged(faction, unittype) {
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].besieged) {
	for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i].type == unittype) {
	    if (this.game.spaces[key].units[faction][i].besieged == true) {
	      return 1;
	    }
	  }
	}
      }
    }
    return 0;
  }



  captureLeader(winning_faction, losing_faction, space, unit) {
    if (unit.personage == false && unit.army_leader == false && unit.navy_leader == false && unit.reformer == false) { return; }
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let p = this.returnPlayerOfFaction(winning_faction);
    let unitjson = JSON.stringify(unit);
    for (let z = 0; z < p.captured.length; z++) {
      if (JSON.stringify(p.captured[z]) === unitjson) { return; }
    }
    p.captured.push(unit);
  }

  captureNavalLeader(winning_faction, losing_faction, space, unit) {
    if (unit.personage == false && unit.army_leader == false && unit.navy_leader == false && unit.reformer == false) { return; }
    this.game.state.naval_leaders_lost_at_sea.push(unit);
  }

  isPersonageOnMap(faction, personage) {
    for (let s in this.game.spaces) {
      if (this.game.spaces[s].units[faction].length > 0) {
	for (let i = 0; i < this.game.spaces[s].units[faction].length; i++) {
	  let unit = this.game.spaces[s].units[faction][i];
	  if (unit.key === personage) { return unit; }
	}
      }
    }
    return null;
  }

  addUnit(faction, space, type) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.newUnit(faction, type));
    this.updateOnBoardUnits();
  }

  removeUnit(faction, space, type) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let i = space.units[faction].length - 1; i >= 0; i--) {
      if (space.units[faction][i].type === type) {
        this.updateLog(this.returnFactionName(faction) + " removes " + type + " in " + space.name);
	space.units[faction].splice(i, 1);
        this.updateOnBoardUnits();
	return;
      }
    }
  }

  isLandUnit(unit) {
    if (unit.type === "regular") { return 1; }
    if (unit.type === "mercenary") { return 1; }
    if (unit.type === "cavalry") { return 1; }
    return 0;
  }

  addRegular(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "regular"));
    }
    this.updateOnBoardUnits();
  }

  addMercenary(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "mercenary"));
    }
    this.updateOnBoardUnits();
  }

  addCavalry(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "cavalry"));
    }
    this.updateOnBoardUnits();
  }

  addNavalSquadron(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "squadron"));
    }
    this.updateOnBoardUnits();
  }

  addCorsair(faction, space, num=1) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < num; i++) {
      space.units[faction].push(this.newUnit(faction, "corsair"));
    }
  }

  //
  // figure out how many base points people have
  //
  calculateVictoryPoints() {

    let factions = {};

    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let ii = 0; ii < this.game.state.players_info[i].factions.length; ii++) {
        factions[this.game.state.players_info[i].factions[ii]] = {
	  faction : this.game.state.players_info[i].factions[ii] ,
	  vp_base : 0 ,
	  vp_bonus : 0 ,
	  vp_special : 0 ,
	  vp : 0 ,
	  keys : 0 ,
	  religious : 0 ,
	  victory : 0,	  
	  details : "",
	};
      }
    }
    //
    // let factions calculate their VP
    //
    for (let f in factions) {
      factions[f].vp_base = this.factions[f].calculateBaseVictoryPoints(this);
      factions[f].vp_bonus = this.factions[f].calculateBonusVictoryPoints(this);
      factions[f].vp_special = this.factions[f].calculateSpecialVictoryPoints(this);
      factions[f].vp = (factions[f].vp_base + factions[f].vp_bonus + factions[f].vp_special);
    }

    //
    // calculate keys controlled
    //
    for (let f in factions) {
      factions[f].keys = this.returnNumberOfKeysControlledByFaction(f);
      if (f === "protestant") {
	factions[f].religious = this.returnNumberOfProtestantSpacesInLanguageZone();
      }
    }

    //
    // military victory
    //
    if (factions['hapsburg']) {
      if (factions['hapsburg'].keys >= this.game.state.autowin_hapsburg_keys_controlled) {
        factions['hapsburg'].victory = 1;
        factions['hapsburg'].details = "military victory";
      }
    }
    if (factions['ottoman']) {
      if (factions['ottoman'].keys >= this.game.state.autowin_ottoman_keys_controlled) {
        factions['ottoman'].victory = 1;
        factions['ottoman'].details = "military victory";
      }
    }
    if (factions['france']) {
      if (factions['france'].keys >= this.game.state.autowin_france_keys_controlled) {
        factions['france'].victory = 1;
        factions['france'].details = "military victory";
      }
    }
    if (factions['england']) {
      if (factions['england'].keys >= this.game.state.autowin_england_keys_controlled) {
        factions['england'].victory = 1;
        factions['england'].details = "military victory";
      }
    }
    if (factions['papacy']) {
      if (factions['papacy'].keys >= this.game.state.autowin_papacy_keys_controlled) {
        factions['papacy'].victory = 1;
        factions['papacy'].details = "military victory";
      }
    }

    //
    // religious victory
    //
    if (factions['protestant']) {
      if (factions['protestant'].religious >= 50) {
        factions['papacy'].victory = 1;
        factions['papacy'].details = "religious victory";
      }
    }

    //
    // PROCESS BONUS VP
    //
    //• Copernicus (2 VP) or Michael Servetus (1 VP) event
    if (this.game.state.events.michael_servetus) {
      factions[this.game.state.events.michael_servetus].vp_special++;
      factions[this.game.state.events.michael_servetus].vp++;
    }
    if (this.game.state.events.copernicus) {
      factions[this.game.state.events.copernicus].vp_special += this.game.state.events.copernicus_vp;
      factions[this.game.state.events.copernicus].vp += this.game.state.events.copernicus_vp;
    }

    //
    //• Bible translation completed (1 VP for each language)    ***
    // protestant faction class
    //• Protestant debater burned (1 per debate rating)         ***
    // protestant faction class
    //• Papal debater disgraced (1 per debate rating)           ***
    // protestant faction class



    //• Successful voyage of exploration
    //• Successful voyage of conquest
    //• JuliaGonzaga(1VP)followed by successful Ottoman piracy in Tyrrhenian Sea
    //• War Winner marker received during Peace Segment
    //• Master of Italy VP marker received during Action Phase


    //
    // domination victory (5 more vp than everyone else
    //
    let max_vp = 0;
    let runner_up_vp = 0;
    let lead_required = 5;
    let domination_round = 5;
    if (this.game.players.length == 2) { lead_required = 8; domination_round = 4; }

    let leaders = [];
    for (let key in factions) {
      if (factions[key].vp == max_vp) {
        leaders.push(key);
      }
      if (factions[key].vp > max_vp) {
	runner_up_vp = max_vp;
	max_vp = factions[key].vp;
	leaders = [];
        leaders.push(key);
      }
      if (max_vp >= (runner_up_vp+lead_required) && this.game.state.round >= domination_round) {
	if (leaders.length == 1) {
	  factions[leaders[0]].victory = 1;
	  factions[leaders[0]].reason = "Domination Victory";
	}
      }
    }

    //
    // final victory if round 9
    //
    if (this.game.state.round >= 9) {
      for (let i = 0; i < leaders.length; i++) {
	factions[leaders[0]].victory = 1;
	factions[leaders[0]].reason = "Final Victory";
      }
    }


    return factions;

  }


  //
  // faction is papacy or (anything), since debaters aren't really owned by factions outside
  // papcy and protestants, even if they are tagged as would be historically appropriate
  //
  returnDebatersInLanguageZone(language_zone="german", faction="papacy", committed=-1) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].language_zone === language_zone || this.game.state.debaters[i].language_zone === "any") {
        if (this.game.state.debaters[i].faction === faction || (faction != "papacy" && this.game.state.debaters[i].faction != "papacy")) {
          if (this.game.state.debaters[i].committed === committed || committed == -1) {
	    num++;
          }
        }
      }
    }
    return num;
  }


  returnImpulseOrder() {
    return ["ottoman","hapsburg","england","france","papacy","protestant"];
  }

  returnNumberOfUncommittedDebaters(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].owner === faction && this.game.state.debaters[i].committed == 0) {
	num++;
      }
    }
    return num;
  }

  returnNumberOfCommittedDebaters(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].owner === faction && this.game.state.debaters[i].committed == 1) {
	num++;
      }
    }
    return num;
  }

  returnNumberOfUncommittedExplorers(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].owner === faction && this.game.state.explorers[i].committed == 0) {
	num++;
      }
    }
    return num;
  }

  returnNumberOfCommittedExplorers(faction) {
    let num = 0;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].owner === faction && this.game.state.explorers[i].committed == 1) {
	num++;
      }
    }
    return num;
  }

  /////////////////////
  // Core Game State //
  /////////////////////
  returnState() {

    let state = {};

    state.skip_counter_or_acknowledge = 0; // don't skip

    state.scenario = "1517";
    if (this.game.options.scenario) { state.scenario = this.game.options.scenario; }
    state.round = 0;
    state.players = [];
    state.events = {};
    state.removed = []; // removed cards
    state.spaces_assaulted_this_turn = [];
    state.board_updated = new Date().getTime();
    state.board = {}; // units on board

    state.diplomacy = this.returnDiplomacyAlliance();

    // whose turn is it? (attacker)
    state.active_player = -1;

    // which ones are activated
    state.minor_activated_powers = [];

    state.naval_leaders_lost_at_sea = [];

    state.debater_committed_this_impulse = {};

    state.cards_left = {};

    state.activated_powers = {};
    state.activated_powers['ottoman'] = [];
    state.activated_powers['hapsburg'] = [];
    state.activated_powers['france'] = [];
    state.activated_powers['england'] = [];
    state.activated_powers['papacy'] = [];
    state.activated_powers['protestant'] = [];
    // following for safety
    state.activated_powers['venice'] = [];
    state.activated_powers['scotland'] = [];
    state.activated_powers['genoa'] = [];
    state.activated_powers['hungary'] = [];
    state.activated_powers['independent'] = [];

    state.translations = {};
    state.translations['new'] = {};
    state.translations['new']['german'] = 0;
    state.translations['new']['french'] = 0;
    state.translations['new']['english'] = 0;
    state.translations['full'] = {};
    state.translations['full']['german'] = 0;
    state.translations['full']['french'] = 0;
    state.translations['full']['english'] = 0;

    state.protestant_war_winner_vp = 0;

    state.saint_peters_cathedral = {};
    state.saint_peters_cathedral['state'] = 0;
    state.saint_peters_cathedral['vp'] = 0;    

    state.papal_debaters_disgraced_vp = 0;
    state.protestant_debaters_burned_vp = 0;

    state.events.michael_servetus = "";  // faction that gets VP
    state.events.copernicus = "";        // faction that gets VP
    state.events.copernicus_vp = 0;     // 1 or 2 VP

    state.french_chateaux_vp = 0;

    state.tmp_reformations_this_turn = [];
    state.tmp_counter_reformations_this_turn = [];
    state.tmp_protestant_reformation_modifier = 0;
    state.tmp_protestant_reformation_bonus = 0;
    state.tmp_protestant_reformation_bonus_spaces = [];
    state.tmp_catholic_reformation_modifier = 0;
    state.tmp_catholic_reformation_bonus = 0;
    state.tmp_catholic_reformation_bonus_spaces = [];

    state.tmp_protestant_counter_reformation_modifier = 0;
    state.tmp_protestant_counter_reformation_bonus = 0;
    state.tmp_protestant_counter_reformation_bonus_spaces = [];
    state.tmp_catholic_counter_reformation_modifier = 0;
    state.tmp_catholic_counter_reformation_bonus = 0;
    state.tmp_catholic_counter_reformation_bonus_spaces = [];
    state.tmp_papacy_may_specify_debater = 0;
    state.tmp_papacy_may_specify_protestant_debater_unavailable = 0;

    state.tmp_bonus_protestant_translation_german_zone = 0;
    state.tmp_bonus_protestant_translation_french_zone = 0;
    state.tmp_bonus_protestant_translation_english_zone = 0;
    state.tmp_bonus_papacy_burn_books = 0;

    state.skip_next_impulse = [];

    //
    // foreign wars
    //
    state.events.war_in_persia = 0;
    state.events.revolt_in_ireland = 0;
    state.events.revolt_in_egypt = 0;


    state.augsburg_electoral_bonus = 0;
    state.mainz_electoral_bonus = 0;
    state.trier_electoral_bonus = 0;
    state.cologne_electoral_bonus = 0;
    state.wittenberg_electoral_bonus = 0;
    state.brandenburg_electoral_bonus = 0;

    state.autowin_hapsburg_keys_controlled = 14;
    state.autowin_ottoman_keys_controlled = 11;
    state.autowin_papacy_keys_controlled = 7;
    state.autowin_france_keys_controlled = 11;
    state.autowin_england_keys_controlled = 9;

    state.reformers_removed_until_next_round = [];
    state.military_leaders_removed_until_next_round = [];
    state.excommunicated_factions = {};
    state.excommunicated = [];
    state.burned = [];
    state.debaters = [];
    state.explorers = [];
    state.conquistadors = [];


    state.leaders = {};
    state.leaders.francis_i = 1;
    state.leaders.henry_viii = 1;
    state.leaders.charles_v = 1;
    state.leaders.suleiman = 1;
    state.leaders.leo_x = 1;
    state.leaders.luther = 1
    state.leaders.clement_vii = 0;
    state.leaders.paul_iii = 0;
    state.leaders.edward_vi = 0;
    state.leaders.henry_ii = 0;
    state.leaders.mary_i = 0;
    state.leaders.julius_iii = 0;
    state.leaders.elizabeth_i = 0;
    state.leaders.calvin = 0;

    state.spring_deploy_across_seas = [];
    state.spring_deploy_across_passes = [];

    state.events.maurice_of_saxony = "";
    state.events.ottoman_piracy_enabled = 0;
    state.events.ottoman_corsairs_enabled = 0;
    state.events.papacy_may_found_jesuit_universities = 0;
    state.events.schmalkaldic_league = 0;
    state.events.edward_vi_born = 0;
    state.events.wartburg = 0;

    return state;

  }

  excommunicateFaction(faction="") {
    this.game.state.excommunicated_faction[faction] = 1;
    return;
  }

  excommunicateReformer(reformer="") {

    if (reformer == "") { return; }
    if (!this.returnSpaceOfPersonage("protestant", reformer)) { return; }

    //
    // debater
    //
    let debater = reformer.replace("-reformer", "-debater");
    let faction = "protestant";
    let s = this.returnSpaceOfPersonage("protestant", reformer);
    let idx = -1;

    if (s === "") { faction = "england"; s = this.returnSpaceOfPersonage("england", reformer); }
    if (s === "") { faction = "france"; s = this.returnSpaceOfPersonage("france", reformer); }

    if (s !== "") {
      idx = this.returnIndexOfPersonageInSpace(faction, reformer, s);
    }

    let obj = {};
    obj.space = s;
    obj.faction = faction;
    obj.idx = idx;
    obj.reformer = this.game.spaces[s].units[faction][idx];

    //
    // remove reformer
    //
    if (idx != -1) {
      this.game.spaces[s].units[faction].splice(idx, 1);
    }

    //
    // remove debater
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key === debater) {
        obj.debater = this.game.state.debaters[i];
        this.game.state.debaters.splice(i, 1);
      }
    }

    //
    // add to excommunicated list
    //
    this.game.state.excommunicated.push(obj);

    return;

  }

  restoreDebaters() {

    for (let i = 0; i < this.game.state.debaters.length; i++) {
      this.game.state.debaters[i].committed = 0;
    }

  }

  restoreReformers() {

    for (let i = 0; i < this.game.state.reformers_removed_until_next_round.length; i++) {
      if (obj.reformer) {

        let leader = obj.reformer;
	let s = obj.space;
        let faction = obj.faction;

	if (reformer) {
	  if (s) {
	    if (faction) {
	      this.game.spaces[s].units[faction].push(reformer);
	    }
	  }
	}
      }
    }

  }
  restoreMilitaryLeaders() {

    for (let i = 0; i < this.game.state.military_leaders_removed_until_next_round.length; i++) {
      if (obj.leader) {

        let leader = obj.leader;
	let s = obj.space;
        let faction = obj.faction;

	if (leader) {
	  if (s) {
	    if (faction) {
	      this.game.spaces[s].units[faction].push(leader);
	    }
	  }
	}
      }
    }

  }

  unexcommunicateReformers() {

    for (let i = 0; i < this.game.state.excommunicated.length; i++) {

      let obj = this.game.state.excommunicated[i];

      if (obj.reformer) {

        let reformer = obj.reformer;
	let debater = obj.debater;
	let s = obj.space;
        let faction = obj.faction;

	if (reformer) {
	  if (s) {
	    if (faction) {
	      this.game.spaces[s].units[faction].push(reformer);
	    }
	  }
	}

	if (debater) {
	  this.game.state.debaters.push(debater);
	}

	this.displaySpace(s);

        this.game.state.excommunicated.splice(i, 1);
        i--;

      }
    }

  }



  returnPregnancyChart() {

    let chart = {};

    chart['1'] = {
      top : 1307,
      left : 4075,
    }

    chart['2'] = {
      top : 1220,
      left : 4075,
    }

    chart['3'] = {
      top : 1135,
      left : 4075,
    }

    chart['4'] = {
      top : 1051,
      left : 4075,
    }

    chart['5'] = {
      top : 963,
      left : 4075,
    }

    chart['1'] = {
      top : 850,
      left : 4075,
    }

    return chart;

  }

  returnColonies() {

    let colonies = {};

    colonies['1'] = {
      top : 1007,
      left : 55
    }
    colonies['2'] = {
      top : 1120,
      left : 55
    }
    colonies['3'] = {
      top : 1232,
      left : 55
    }
    colonies['4'] = {
      top : 1344,
      left : 55
    }
    colonies['5'] = {
      top : 1456,
      left : 55
    }
    colonies['6'] = {
      top : 1530,
      left : 55
    }
    colonies['7'] = {
      top : 1680,
      left : 55
    }

    return colonies;

  }


  returnNewWorld() {

    let nw = {};

    nw['greatlakes'] = {
      top : 1906 ,
      left : 280,
      vp : 1
    }
    nw['stlawrence'] = {
      top : 1886 ,
      left : 515,
      vp : 1
    }
    nw['mississippi'] = {
      top : 2075 ,
      left : 280 ,
      vp : 1
    }
    nw['aztec'] = {
      top : 2258 ,
      left : 168 ,
      vp : 2
    }
    nw['maya'] = {
      top : 2300 ,
      left : 302 ,
      vp : 2
    }
    nw['amazon'] = {
      top : 2536 ,
      left : 668 ,
      vp : 2
    }
    nw['inca'] = {
      top : 2660 ,
      left : 225,
      vp : 2
    }
    nw['circumnavigation'] = {
      top : 2698,
      left : 128,
      vp : 3
    }
    nw['pacificstrait'] = {
      top : 2996 ,
      left : 486 ,
      vp : 1
    }


    return nw;

  }


  returnConquest() {

    let conquest = {};

    conquest['1'] = {
      top : 1007,
      left : 178
    }
    conquest['2'] = {
      top : 1120,
      left : 178
    }
    conquest['3'] = {
      top : 1232,
      left : 178
    }
    conquest['4'] = {
      top : 1344,
      left : 178
    }
    conquest['5'] = {
      top : 1456,
      left : 178
    }
    conquest['6'] = {
      top : 1530,
      left : 178
    }
    conquest['7'] = {
      top : 1680,
      left : 178
    }

    return conquest;

  }

  returnVictoryPointTrack() {

    let track = {};

    track['0'] = {
      top : 2912,
      left : 2025
    }
    track['1'] = {
      top : 2912,
      left : 2138
    }
    track['2'] = {
      top : 2912,
      left : 2252
    }
    track['3'] = {
      top : 2912,
      left : 2366
    }
    track['4'] = {
      top : 2912,
      left : 2480
    }
    track['5'] = {
      top : 2912,
      left : 2594
    }
    track['6'] = {
      top : 2912,
      left : 2708
    }
    track['7'] = {
      top : 2912,
      left : 2822
    }
    track['8'] = {
      top : 2912,
      left : 2936
    }
    track['9'] = {
      top : 2912,
      left : 3050
    }
    track['10'] = {
      top : 3026,
      left : 884
    }
    track['11'] = {
      top : 3026,
      left : 998
    }
    track['12'] = {
      top : 3026,
      left : 1112
    }
    track['13'] = {
      top : 3026,
      left: 1226,
    }
    track['14'] = {
      top : 3026,
      left : 1340
    }
    track['15'] = {
      top : 3026,
      left : 1454
    }
    track['16'] = {
      top : 3026,
      left : 1569
    }
    track['17'] = {
      top : 3026,
      left : 1682
    }
    track['18'] = {
      top : 3026,
      left : 1796
    }
    track['19'] = {
      top : 3026,
      left : 1910
    }
    track['20'] = {
      top : 3026,
      left : 2024
    }
    track['21'] = {
      top : 3026,
      left : 2138
    }
    track['22'] = {
      top : 3026,
      left : 2252
    }
    track['23'] = {
      top : 3026,
      left : 2366
    }
    track['24'] = {
      top : 3026,
      left : 2480
    }
    track['25'] = {
      top : 3026,
      left : 2594
    }
    track['26'] = {
      top : 3026,
      left : 2708
    }
    track['27'] = {
      top : 3026,
      left : 2822
    }
    track['28'] = {
      top : 3026,
      left : 2936
    }
    track['29'] = {
      top : 3026,
      left : 3050
    }

    return track;
  }


  returnElectorateDisplay() {

    let electorates = {};

    electorates['augsburg'] = {
      top: 190,
      left: 3380,
    }
    electorates['trier'] = {
      top: 190,
      left: 3510,
    }
    electorates['cologne'] = {
      top: 190,
      left: 3642,
    }
    electorates['wittenberg'] = {
      top: 376,
      left: 3380,
    }
    electorates['mainz'] = {
      top: 376,
      left: 3510,
    }
    electorates['brandenburg'] = {
      top: 376,
      left: 3642,
    }

    return electorates;

  }


  returnDiplomacyAlliance() {

    let diplomacy 		= {};
    diplomacy["ottoman"] 	= {
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["england"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["france"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["papacy"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["protestant"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["hapsburg"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["venice"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["genoa"] 		= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["hungary"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
      scotland 		: { allies : 0 , enemies : 0 } ,
    };
    diplomacy["scotland"] 	= {
      ottoman 		: { allies : 0 , enemies : 0 } ,
      england 		: { allies : 0 , enemies : 0 } ,
      france  		: { allies : 0 , enemies : 0 } ,
      papacy  		: { allies : 0 , enemies : 0 } ,
      protestant 	: { allies : 0 , enemies : 0 } ,
      hapsburg 		: { allies : 0 , enemies : 0 } ,
      venice 		: { allies : 0 , enemies : 0 } ,
      genoa 		: { allies : 0 , enemies : 0 } ,
    };

    return diplomacy;
  }

  returnDiplomacyTable() {

    let diplomacy 		= {};
    diplomacy["ottoman"] 	= {};
    diplomacy["england"] 	= {};
    diplomacy["france"] 	= {};
    diplomacy["papacy"] 	= {};
    diplomacy["protestant"] 	= {};
    diplomacy["hapsburg"] 	= {};

    diplomacy["ottoman"]["hapsburg"] = {
        top 	:	170 ,
        left	:	4128 ,
    }
    diplomacy["hapsburg"]["ottoman"] = {
        top 	:	170 ,
        left	:	4128 ,
    }
    diplomacy["ottoman"]["england"] = {
        top 	:	170 ,
        left	:	4222 ,
    }
    diplomacy["england"]["ottoman"] = {
        top 	:	170 ,
        left	:	4222 ,
    }
    diplomacy["ottoman"]["france"] = {
        top 	:       170 ,
        left	:	4310 ,
    }
    diplomacy["france"]["ottoman"] = {
        top 	:       170 ,
        left	:	4310 ,
    }
    diplomacy["ottoman"]["papacy"] = {
        top 	:	170 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["ottoman"] = {
        top 	:	170 ,
        left	:	4400 ,
    }
    diplomacy["ottoman"]["protestant"] = {
        top 	:	170 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["ottoman"] = {
        top 	:	170 ,
        left	:	4490 ,
    }
    diplomacy["ottoman"]["genoa"] = {
        top 	:	170 ,
        left	:	4580 ,
    }
    diplomacy["ottoman"]["hungary"] = {
        top 	:	170 ,
        left	:	4670 ,
    }
    diplomacy["ottoman"]["scotland"] = {
        top 	:	170 ,
        left	:	4760 ,
    }
    diplomacy["ottoman"]["venice"] = {
        top 	:	170 ,
        left	:	4851 ,
    }

    diplomacy["hapsburg"]["england"] = {
        top 	:	260 ,
        left	:	4220 ,
    }
    diplomacy["england"]["hapsburg"] = {
        top 	:	260 ,
        left	:	4220 ,
    }
    diplomacy["hapsburg"]["france"] = {
        top 	:	260 ,
        left	:	4310 ,
    }
    diplomacy["france"]["hapsburg"] = {
        top 	:	260 ,
        left	:	4310 ,
    }
    diplomacy["hapsburg"]["papacy"] = {
        top 	:	260 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["hapsburg"] = {
        top 	:	260 ,
        left	:	4400 ,
    }
    diplomacy["hapsburg"]["protestant"] = {
        top 	:	260 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["hapsburg"] = {
        top 	:	260 ,
        left	:	4490 ,
    }
    diplomacy["hapsburg"]["genoa"] = {
        top 	:	260 ,
        left	:	4580 ,
    }
    diplomacy["hapsburg"]["hungary"] = {
        top 	:	260 ,
        left	:	4670 ,
    }
    diplomacy["hapsburg"]["scotland"] = {
        top 	:	260 ,
        left	:	4760 ,
    }
    diplomacy["hapsburg"]["venice"] = {
        top 	:	260 ,
        left	:	4851 ,
    }


    diplomacy["england"]["france"] = {
        top 	:	350 ,
        left	:	4310 ,
    }
    diplomacy["france"]["england"] = {
        top 	:	350 ,
        left	:	4310 ,
    }
    diplomacy["england"]["papacy"] = {
        top 	:	350 ,
        left	:	4400 ,
    }
    diplomacy["papacy"]["england"] = {
        top 	:	350 ,
        left	:	4400 ,
    }
    diplomacy["england"]["protestant"] = {
        top 	:	350 ,
        left	:	4490 ,
    }
    diplomacy["protestant"]["england"] = {
        top 	:	350 ,
        left	:	4490 ,
    }
    diplomacy["england"]["genoa"] = {
        top 	:	350 ,
        left	:	4580 ,
    }
    diplomacy["england"]["hungary"] = {
        top 	:	350 ,
        left	:	4670 ,
    }
    diplomacy["england"]["scotland"] = {
        top 	:	350 ,
        left	:	4760 ,
    }
    diplomacy["england"]["venice"] = {
        top 	:	350 ,
        left	:	4851 ,
    }

    diplomacy["france"]["papacy"] = {
        top     :       440 ,
        left    :       4400 ,    
    }
    diplomacy["papacy"]["france"] = {
        top     :       440 ,
        left    :       4400 ,    
    }
    diplomacy["france"]["protestant"] = {
        top     :       440 ,
        left    :       4490 ,    
    }
    diplomacy["protestant"]["france"] = {
        top     :       440 ,
        left    :       4490 ,    
    }
    diplomacy["france"]["genoa"] = {
        top     :       440 ,
        left    :       4580 ,    
    }
    diplomacy["france"]["hungary"] = {
        top     :       440 ,
        left    :       4670 ,    
    }
    diplomacy["france"]["scotland"] = {
        top     :       440 ,
        left    :       4760 ,    
    }
    diplomacy["france"]["venice"] = {
        top     :       440 ,
        left    :       4851 ,    
    }


    diplomacy["papacy"]["protestant"] = {
        top     :       530 ,
        left    :       4490 ,    
    }
    diplomacy["protestant"]["papacy"] = {
        top     :       530 ,
        left    :       4490 ,    
    }
    diplomacy["papacy"]["genoa"] = {
        top     :       530 ,
        left    :       4580 ,    
    }
    diplomacy["papacy"]["hungary"] = {
        top     :       530 ,
        left    :       4670 ,    
    }
    diplomacy["papacy"]["scotland"] = {
        top     :       530 ,
        left    :       4760 ,    
    }
    diplomacy["papacy"]["venice"] = {
        top     :       530 ,
        left    :       4851 ,    
    }

    diplomacy["protestant"]["genoa"] = {
        top     :       620 ,
        left    :       4580 ,    
    }
    diplomacy["protestant"]["hungary"] = {
        top     :       620 ,
        left    :       4670 ,    
    }
    diplomacy["protestant"]["scotland"] = {
        top     :       620 ,
        left    :       4760 ,    
    }
    diplomacy["protestant"]["venice"] = {
        top     :       530 ,
        left    :       4851 ,    
    }

    return diplomacy;

  }




  returnEventObjects() {

    let z = [];

    //
    // factions in-play
    //
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.factions[this.game.state.players_info[i].faction] != undefined) {
        z.push(this.factions[this.game.state.players_info[i].faction]);
      }
    }


    //
    // cards in the deck can modify gameloop
    //
    for (let key in this.deck) {
      z.push(this.deck[key]);
    }
    for (let key in this.diplomatic_deck) {
      z.push(this.diplomatic_deck[key]);
    }

    //
    // debaters have bonuses which modify gameplay
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      let d = this.game.state.debaters[i];
      let key = d.type;
      z.push(this.debaters[key]);
    }

    return z;

  }



  addEvents(obj) {

    ///////////////////////
    // game state events //
    ///////////////////////
    //
    // these events run at various points of the game. They are attached to objs
    // on object initialization, so that the objects can have these events 
    // triggered at various points of the game automatically.
    //
    //
    // 
    // 1 = fall through, 0 = halt game
    //
    if (obj.onCommit == null) {
      obj.onCommit = function(his_self, faction) { return 1; } // 1 means fall through
    }
    if (obj.onEvent == null) {
      obj.onEvent = function(his_self, player) { return 1; } // 1 means fall-through / no-stop
    }
    if (obj.canEvent == null) {
      obj.canEvent = function(his_self, faction) { return 0; } // 0 means cannot event
    }
    if (obj.handleGameLoop == null) {
      obj.handleGameLoop = function(his_self, qe, mv) { return 1; } // 1 means fall-through / no-stop
    }





    //
    // functions for convenience
    //
    if (obj.removeFromDeck == null) {
      obj.removeFromDeck = function(his_self, player) { return 0; } 
    }
    if (obj.menuOptionTriggers == null) {
      obj.menuOptionTriggers = function(his_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOption == null) {
      obj.menuOption = function(his_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOptionActivated == null) {
      obj.menuOptionActivated = function(his_self, stage, player, faction) { return 0; }
    }

    return obj;

  }




  //
  // Core Game Logic
  //
  async handleGameLoop() {

    let his_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

        let qe = this.game.queue.length-1;
        let mv = this.game.queue[qe].split("\t");
	let z = this.returnEventObjects();
        let shd_continue = 1;

console.log("QUEUE: " + JSON.stringify(this.game.queue));
console.log("MOVE: " + mv[0]);

	//
	// entry point for every round in the game
	//
        if (mv[0] === "round") {

	  this.game.state.round++;

this.updateLog(`###############`);
this.updateLog(`### Round ${this.game.state.round} ###`);
this.updateLog(`###############`);

	  this.game.state.cards_left = {};

	  this.onNewRound();
	  this.restoreReformers();
	  this.restoreMilitaryLeaders();
	  this.unexcommunicateReformers();

	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    this.resetPlayerRound((i+1));
          }

	  this.game.queue.push("victory_determination_phase");
	  this.game.queue.push("new_world_phase");
	  this.game.queue.push("winter_phase");
	  this.game.queue.push("counter_or_acknowledge\tThe Advent of Winter\twinter_phase");
	  this.game.queue.push("show_overlay\twinter");
	  this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  this.game.queue.push("action_phase");
	  this.game.queue.push("spring_deployment_phase");
	  this.game.queue.push("counter_or_acknowledge\tSpring Deployment is about to Start\tpre_spring_deployment");
	  this.game.queue.push("diplomacy_phase");




	  //
	  // start the game with the Protestant Reformation
	  //
	  if (this.game.state.round == 1) {

if (this.game.state.scenario == "is_testing") {
  this.game.queue.push("is_testing");
} else {
  this.game.queue.push("hide_overlay\tdiet_of_worms");
  this.game.queue.push("diet_of_worms");
  this.game.queue.push("show_overlay\tdiet_of_worms");
}

	    //
	    // cards dealt before diet of worms
	    //
	    this.game.queue.push("card_draw_phase");
if (this.game.state.scenario != "is_testing") {
	    this.game.queue.push("event\tprotestant\t008");
}

	  } else {

	    this.game.queue.push("card_draw_phase");

	    //
	    // round 2 - zwingli in zurich
	    //
	    if (this.game.state.round == 2) {
	      this.addDebater("protestant", "oekolampadius-debater");
	      this.addDebater("protestant", "zwingli-debater");
	      this.addReformer("protestant", "zurich", "zwingli-reformer");
	      this.addDebater("papacy", "contarini-debater");
	    }

	    //
	    // round 3
	    //
	    if (this.game.state.round == 3) {
	      this.addDebater("protestant", "bullinger-debater");
	    }

	    //
	    // round 4 - calvin in genoa
	    //
	    if (this.game.state.round == 4) {
	      this.addDebater("protestant", "farel-debater");
	      this.addDebater("protestant", "cop-debater");
	      this.addDebater("protestant", "olivetan-debater");
	      this.addDebater("protestant", "calvin-debater");
	      this.addReformer("protestant", "genoa", "calvin-reformer");
	    }

	    //
	    // round 5 - cranmer in london
	    //
	    if (this.game.state.round == 5) {
	      this.addDebater("protestant", "cranmer-debater");
	      this.addDebater("protestant", "latimer-debater");
	      this.addDebater("protestant", "coverdale-debater");
	      this.addReformer("protestant", "genoa", "cranmer-reformer");
	      this.addDebater("papacy", "pole-debater");
	      this.addDebater("papacy", "caraffa-debater");
	    }

	    //
	    // round 6 - maurice of saxony
	    //
	    if (this.game.state.round == 6) {
	      this.addDebater("protestant", "wishart-debater");
	      this.addDebater("protestant", "knox-debater");
	      this.game.queue.push("protestants-place-maurice-of-saxony-round-six");
	      this.addDebater("papacy", "loyola-debater");
	      this.addDebater("papacy", "faber-debater");
	      this.addDebater("papacy", "canisius-debater");
	    }

	    //
	    // round 7
	    //
	    if (this.game.state.round == 7) {
	      this.addDebater("papacy", "gardiner-debater");
	    }

	  }

	  //
	  // show all - will only trigger for relevant faction
	  //
	  if (this.game.state.round == 1) {
	    this.game.queue.push("show_overlay\twelcome\tprotestant");
	    this.game.queue.push("show_overlay\twelcome\tpapacy");
	    this.game.queue.push("show_overlay\twelcome\tengland");
	    this.game.queue.push("show_overlay\twelcome\tfrance");
	    this.game.queue.push("show_overlay\twelcome\thapsburg");
	    this.game.queue.push("show_overlay\twelcome\tottoman");
	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  } else {

	    //
	    // TESTING
	    //
	    //this.updateStatus("Game Over");
	    //return 0;

	  }

          return 1;
        }

        if (mv[0] == "init") {
          this.game.queue.splice(qe, 1);
	  return 1;
        }

	if (mv[0] === "halt") {
	  return 0;
	}

	if (mv[0] === "show_overlay") {

	  //
	  // hide any cardbox
	  //
	  this.cardbox.hide();

	  this.displayElectorateDisplay();
	  if (mv[1] === "welcome") { 
	    let faction = mv[2];
	    let player = this.returnPlayerOfFaction(faction);
	    if (this.game.player === player) { 
	      this.welcome_overlay.render(faction); 
	      this.game.queue.push("hide_overlay\twelcome");
	      if (faction == "protestant") { this.game.queue.push("counter_or_acknowledge\tYou are the Protestants"); }
	      if (faction == "papacy") { this.game.queue.push("counter_or_acknowledge\tYou are the Papacy"); }
	      if (faction == "hapsburg") { this.game.queue.push("counter_or_acknowledge\tYou are the Hapsburgs"); }
	      if (faction == "ottoman") { this.game.queue.push("counter_or_acknowledge\tYou are the Ottomans"); }
	      if (faction == "france") { this.game.queue.push("counter_or_acknowledge\tYou are the French"); }
	      if (faction == "england") { this.game.queue.push("counter_or_acknowledge\tYou are the English"); }
	    }
	  }
	  if (mv[1] === "theses") { this.theses_overlay.render(); }
	  if (mv[1] === "diet_of_worms") { this.diet_of_worms_overlay.render(); }
	  if (mv[1] === "council_of_trent") { this.council_of_trent_overlay.render(); }
	  if (mv[1] === "winter") { this.winter_overlay.render(); }
	  if (mv[1] === "faction") { this.faction_overlay.render(mv[2]); }
	  if (mv[1] === "zoom") {
	    let lz = mv[2];
	    this.theses_overlay.render(lz);
          }
	  if (mv[1] === "burn_books") {
	    let lz = mv[2];
	    this.theses_overlay.render(lz);
          }
	  if (mv[1] === "publish_treatise") {
	    let lz = mv[2];
	    this.theses_overlay.render(lz);
          }
	  if (mv[1] === "theological_debate_and_debaters") { 
	    this.debate_overlay.render(his_self.game.state.theological_debate); 
            this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
            this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);
	  }
	  if (mv[1] === "theological_debate") { this.debate_overlay.render(his_self.game.state.theological_debate); }
	  if (mv[1] === "field_battle") {
	    if (mv[2] === "post_field_battle_attackers_win") { this.field_battle_overlay.attackersWin(his_self.game.state.field_battle); }
	    if (mv[2] === "post_field_battle_defenders_win") { this.field_battle_overlay.defendersWin(his_self.game.state.field_battle); }
	  }
          this.game.queue.splice(qe, 1);
	  return 1;
	}
	if (mv[0] === "hide_overlay") {
	  this.displayElectorateDisplay();
	  if (mv[1] === "winter") { this.winter_overlay.pushHudUnderOverlay(); this.winter_overlay.hide(); }
	  if (mv[1] === "welcome") { this.welcome_overlay.pushHudUnderOverlay(); this.welcome_overlay.hide(); }
	  if (mv[1] === "faction") { this.faction_overlay.hide(); }
	  if (mv[1] === "theses") { this.theses_overlay.hide(); }
	  if (mv[1] === "zoom") { this.theses_overlay.hide(); }
	  if (mv[1] === "burn_books") { this.theses_overlay.hide(); }
	  if (mv[1] === "publish_treatise") { this.theses_overlay.hide(); }
	  if (mv[1] === "diet_of_worms") { this.diet_of_worms_overlay.hide(); }
	  if (mv[1] === "council_of_trent") { this.council_of_trent_overlay.hide(); }
	  if (mv[1] === "theological_debate") { this.debate_overlay.pushHudUnderOverlay(); this.debate_overlay.hide(); }
	  if (mv[1] === "field_battle") { this.field_battle_overlay.hide(); }
	  if (mv[1] === "siege") { this.assault_overlay.hide(); }
	  if (mv[1] === "assault") { this.assault_overlay.hide(); }
          this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "cards_left") {

          let faction = mv[1];
          let cards_left = parseInt(mv[2]);
	  this.game.state.cards_left[faction] = cards_left;

          this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "pass") {
 
          let faction = mv[1];
          let cards_left = parseInt(mv[2]);
	  let player = this.returnPlayerOfFaction(faction);
	  this.game.state.cards_left[faction] = cards_left;

          for (let z = 0; z < this.game.state.players_info[player-1].factions.length; z++) {
	    if (this.game.state.players_info[player-1].factions[z] == faction) {
	      this.game.state.players_info[player-1].factions_passed[z] = true;
	    }
	  }

	  this.updateLog(faction + " passes");

          this.game.queue.splice(qe, 1);
	  return 1;
	}

	if (mv[0] === "build") {

	  let land_or_sea = mv[1];
	  let faction = mv[2];
	  let unit_type = mv[3];
	  let spacekey = mv[4];
          let player_to_ignore = parseInt(mv[5]);

	  this.updateLog(this.returnFactionName(faction) + " builds " + unit_type + " in " + this.returnSpaceName(spacekey), true);

	  if (this.game.player != player_to_ignore) {
	    if (land_or_sea === "land") {
	      this.game.spaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	    }
	    if (land_or_sea === "sea") {
	      this.game.navalspaces[spacekey].units[faction].push(this.newUnit(faction, unit_type));
	    }
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "activate_minor_power") {

	  let faction = mv[1];
	  let power = mv[2];

	  this.activateMinorPower(faction, power);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "deactivate_minor_power") {

	  let faction = mv[1];
	  let power = mv[2];

	  this.deactivateMinorPower(faction, power);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "remove_unit") {

	  let land_or_sea = mv[1];
	  let faction = mv[2];
	  let unit_type = mv[3];
	  let spacekey = mv[4];
          let player_to_ignore = parseInt(mv[5]);

	  if (this.game.player != player_to_ignore) {
	    if (land_or_sea === "land") {
	      this.removeUnit(faction, spacekey, unit_type);
	    }
	    if (land_or_sea === "sea") {
	      this.removeUnit(faction, spacekey, unit_type);
	    }
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] === "winter_attrition") {

	  let faction = mv[1];
	  let spacekey = mv[2];

	  this.game.spaces[spacekey].units[faction] = [];

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


	if (mv[0] === "retreat_to_winter_spaces") {

	  let moves = [];

	  this.game.queue.splice(qe, 1);

	  for (let i in this.game.spaces) {
	    for (let key in this.game.spaces[i].units) {
	      if (this.game.spaces[i].units[key].length > 0) {
	        let space = this.game.spaces[i];
		// && clause permits Hapsburgs in Tunis for instance
		if (!this.isSpaceFortified(space) || ((key != "protestant" && !this.isSpaceElectorate(space.key) && this.game.state.events.schmalkaldic_league != 1) && this.returnPlayerOfFaction(key) > 0 && !this.isSpaceControlled(i, key))) {
		  let res = this.returnNearestFriendlyFortifiedSpaces(key, space);

		  //
		  // 2P has to happen automatically
		  //
		  if (this.game.players.length == 2 && (key != "protestant" && key != "papacy")) {
		    if (res.length == 0) {
		      this.game.spaces[i].units[key] = [];
		      this.displaySpace(i);
		    } else {
		      if (res.length > 0) {
	                this.autoResolveWinterRetreat(key, space.key);
		      } else {
		        this.game.spaces[i].units[key] = [];
		        this.displaySpace(i);
		      }
		    }
		  } else {

	    	    let res = this.returnNearestFriendlyFortifiedSpaces(key, i);

		    let no_loc = false;
		    if (!res) { no_loc = true; }		  
		    if (res.length == 0) { no_loc = true; }		  

		    if (no_loc) {
		      // DELETE ALL UNITS INSTEAD OF ATTRITION IN 2P
		      if (this.game.players.length == 2) {
		        this.game.spaces[i].units[key] = [];
			this.displaySpace(i);
		      } else {
		        moves.push("winter_attrition\t"+key+"\t"+space.key);
		      }
		    } else {
		      if (res.length > 1) {
		        moves.push("retreat_to_winter_spaces_player_select\t"+key+"\t"+space.key);
		      } else {
	                this.autoResolveWinterRetreat(key, space.key);
		      }
		    }
		  }

		  //
		  // if the space is besieged undo that, and un-besiege defenders
		  //
		  if (space.besieged > 0) {
		    space.besieged = 0;
		    for (let key in this.game.spaces[i].units) {
		      for (let ii = 0; ii < this.game.spaces[i].units[key].length; ii++) {
			this.game.spaces[i].units[key][ii].besieged = 0;
		      }
		    }
		  }

		}
	      }
	    }
	  }

	  //
	  // prevents in-memory differences in processing resulting in a different
	  // queue order, resulting in divergent game processing.
	  //
	  moves.sort();
	  for (let i = 0; i < moves.length; i++) {
	    this.game.queue.push(moves[i]);
	  }

	  return 1;
        }


	if (mv[0] === "retreat_to_winter_spaces_player_select") {

	  this.game.queue.splice(qe, 1);

	  let x = this.returnPlayerOfFaction(mv[1]);

	  if (this.game.player === x) {
	    this.playerResolveWinterRetreat(mv[1], mv[2]);
	    return 0;
	  } else {
	    this.updateStatus(this.returnFactionName(mv[1]) + " handling winter retreat from " + this.returnSpaceName(mv[2]));
	    if (x > 0) { return 0; }
	  }

	  //
	  // non-player controlled factions skip winter retreat
	  //
	  return 1;

        }

        if (mv[0] === "protestants-place-maurice-of-saxony-round-six") {

	  this.game.queue.splice(qe, 1);

	  let player = this.returnPlayerOfFaction("protestant");

	  if (this.game.player === player) {

            if (0 == his_self.playerSelectSpaceWithFilter(

              "Select Protestant Electorate for Maurice of Saxony",

              function(space) {
                if (space.type == "electorate" && space.political == "protestant") { return 1; }
  	        return 0;
              },

              function(spacekey) {
                his_self.addMove("add_army_leader\tprotestant\t"+spacekey+"\tmaurice-of-saxony");
                his_self.endTurn();
              },

	      null,

	      true

            )) {
	      his_self.addMove("NOTIFY\tNo valid electorates for Maurice of Saxony to enter - skipping");
	      his_self.endTurn();
	    };

	  } else {
	    this.updateStatus("Protestants placing Maurice of Saxony");
	  }

	  return 0;

	}

	if (mv[0] === "retreat_to_winter_spaces_resolve") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let from = mv[2];
	  let to = mv[3];

          for (let i = this.game.spaces[from].units[faction].length-1; i >= 0; i--) {
	    this.game.spaces[to].units[faction].push(this.game.spaces[from].units[faction][i]);
	    this.game.spaces[from].units[faction].splice(i, 1);
	  }

	  this.displaySpace(from);
	  this.displaySpace(to);

	  return 1;

        }




	if (mv[0] === "retreat_to_winter_ports") {

	  let moves = [];

	  this.game.queue.splice(qe, 1);

	  for (let i in this.game.navalspaces) {
	    for (let key in this.game.navalspaces[i].units) {
	      if (this.game.navalspaces[i].units[key].length > 0) {
	        let space = this.game.navalspaces[i];
		let res = this.returnNearestFactionControlledPorts(key, space);
		moves.push("retreat_to_winter_ports_player_select\t"+key+"\t"+space.key);
	      }
	    }
	  }

	  //
	  // prevents in-memory differences in processing resulting in a different
	  // queue order, resulting in divergent game processing.
	  //
	  moves.sort();
	  for (let i = 0; i < moves.length; i++) {
	    this.game.queue.push(moves[i]);
	  }

	  return 1;
        }


	if (mv[0] === "retreat_to_winter_ports_player_select") {

	  this.game.queue.splice(qe, 1);

	  let x = this.returnPlayerOfFaction(mv[1]);

	  if (this.game.player === x) {
	    this.playerResolvePortsWinterRetreat(mv[1], mv[2]);
	  } else {
	    this.updateStatus(this.returnFactionName(mv[1]) + " winter port retreat from " + this.returnSpaceName(mv[2]));
	  }

	  return 0;

        }


	if (mv[0] === "retreat_to_winter_ports_resolve") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let from = mv[2];
	  let to = mv[3];

          for (let i = this.game.navalspaces[from].units[faction].length-1; i >= 0; i--) {
	    this.game.spaces[to].units[faction].push(this.game.navalspaces[from].units[faction][i]);
	    this.game.navalspaces[from].units[faction].splice(i, 1);
	  }

	  this.displayNavalSpace(from);
	  this.displaySpace(to);

	  return 1;

        }

	if (mv[0] === "add_army_leader") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let type = mv[3];

	  this.addArmyLeader(faction, spacekey, type);

    	  this.game.queue.splice(qe, 1);

	  return 1;
	}

	if (mv[0] === "add_navy_leader") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let type = mv[3];

	  this.addNavyLeader(faction, spacekey, type);

    	  this.game.queue.splice(qe, 1);

	  return 1;
	}



	if (mv[0] === "is_testing") {

	  // moar debaters
          //this.addDebater("protestant", "bullinger-debater");
          //this.addDebater("protestant", "oekolampadius-debater");
          //this.addDebater("protestant", "zwingli-debater");
          //this.addDebater("papacy", "caraffa-debater");
          //this.addDebater("papacy", "gardiner-debater");
          //this.addDebater("papacy", "loyola-debater");
          //this.addDebater("papacy", "pole-debater");
          //this.addDebater("papacy", "canisius-debater");
          //this.addDebater("papacy", "contarini-debater");
          //this.addDebater("papacy", "faber-debater");
    	  //this.addDebater("papacy", "bucer-debater");
    	  //this.addDebater("protestant", "aleander-debater");
    	  //this.addDebater("protestant", "campeggio-debater");

   

          this.addMercenary("papacy", "siena", 4);
          this.addArmyLeader("papacy", "siena", "renegade");
          this.addRegular("papacy", "linz", 4);
          this.addRegular("papacy", "ravenna", 2);
          this.addUnrest("graz");

    	  this.activateMinorPower("papacy", "venice");

    	  this.convertSpace("protestant", "nuremberg");
    	  this.convertSpace("protestant", "graz");
    	  this.controlSpace("protestant", "graz");
    	  this.addRegular("protestant", "worms", 3);
    	  this.convertSpace("protestant", "worms", 3);
    	  this.addRegular("protestant", "graz", 3);
    	  this.addRegular("venice", "trieste", 4);
    	  this.addRegular("venice", "agram", 4);

    	  this.addRegular("venice", "venice", 1);
    	  this.addNavalSquadron("venice", "venice", 1);
    	  this.addNavalSquadron("papacy", "rome", 1);

	  this.addRegular("hapsburg", "naples", 4);
	  this.addNavalSquadron("hapsburg", "naples", 2);
	

	  this.controlSpace("france", "ragusa");
	  this.addRegular("france", "ragusa", 1);
	  this.addNavalSquadron("france", "ragusa", 4); 

    	  this.convertSpace("protestant", "mainz");
    	  this.convertSpace("protestant", "worms");
    	  this.convertSpace("protestant", "kassel");
    	  this.convertSpace("protestant", "regensberg");
    	  this.convertSpace("protestant", "munster");

	  this.controlSpace("papacy", "siena");
	  this.addMercenary("papacy", "siena", 1);
	  this.addMercenary("papacy", "siena", 1);
	  this.addMercenary("papacy", "siena", 1);
	  this.addRegular("papacy", "siena", 1);

	  this.setAllies("protestant", "france");
	  this.setEnemies("papacy", "france");
	  this.setActivatedPower("protestant", "france");
	  this.addRegular("france","milan", 1);
	  this.controlSpace("france", "trent");
	  this.addRegular("france","trent", 1);
	  this.addRegular("france","trent", 1);
	  this.addRegular("france","trent", 1);
	  this.addRegular("france","trent", 1);
	  this.addRegular("france","trent", 1);
	  this.addArmyLeader("france", "trent", "montmorency");


    	  this.game.spaces['graz'].type = 'key';
    	  this.game.spaces['graz'].occupier = 'protestant';


console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("#");
console.log("player 1:");
console.log(JSON.stringify(this.game.state.players_info[0].factions));
console.log("player 2:");
console.log(JSON.stringify(this.game.state.players_info[1].factions));

    	  this.game.queue.splice(qe, 1);

	  return 1;
	}


        
        if (mv[0] === "reshuffle_diplomacy_deck") {
          
          this.game.queue.splice(qe, 1);
          
          //
          // DECKRESTORE copies backed-up back into deck
          //
          this.game.queue.push("SHUFFLE\t2");
          this.game.queue.push("DECKRESTORE\t");
          
          for (let i = this.game.state.players_info.length; i > 0; i--) {
            this.game.queue.push("DECKENCRYPT\t2\t"+(i));
          } 
          for (let i = this.game.state.players_info.length; i > 0; i--) {
            this.game.queue.push("DECKXOR\t2\t"+(i));
          }
          
          //
          // re-add discards
          //  
          let discards = {};
          for (let i in this.game.deck[1].discards) {
            discards[i] = this.game.deck[1].cards[i];
            delete this.game.deck[1].cards[i];
          } 
          this.game.deck[1].discards = {};
        
          //  
          // our deck for re-shuffling
          //
          let reshuffle_cards = {};
          for (let key in discards) { reshuffle_cards[key] = discards[key]; }

console.log("----------------------------");
console.log("---SHUFFLING IN DISCARDS ---");
console.log("----------------------------");
console.log("DIPLO DECK RESHUFFLE: " + JSON.stringify(reshuffle_cards));

          this.game.queue.push("DECK\t2\t"+JSON.stringify(reshuffle_cards));

          // backup any existing DECK #2
          this.game.queue.push("DECKBACKUP\t2");

        }

        if (mv[0] === "diplomacy_card_event") {

	  let faction = mv[1];
	  let card = mv[2];

          this.updateLog(this.returnFactionName(faction) + " triggers " + this.popup(card));

	  this.game.queue.splice(qe, 1);

          let lqe = qe-1;
          if (lqe >= 0) {
            let lmv = this.game.queue[lqe].split("\t");
            if (lmv[0] == "diplomacy_card_event") {
	      this.game.queue.splice(lqe, 1);
	    }
	  }

	  if (!this.diplomatic_deck[card].onEvent(this, faction)) { return 0; }

	  return 1;

	}


        if (mv[0] === "event") {

	  let faction = mv[1];
	  let card = mv[2];

	  this.game.queue.splice(qe, 1);

          this.updateLog(this.returnFactionName(faction) + " triggers " + this.popup(card));

	  if (!this.deck[card].onEvent(this, faction)) { return 0; }

	  return 1;
	}


        if (mv[0] === "card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayCard(card, p, faction);
	  }

	  return 0;

	}

        if (mv[0] === "ops") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];
	  let opsnum = parseInt(mv[3]);
 
          this.updateLog(this.returnFactionName(faction) + " plays " + this.popup(card) + " for ops");

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayOps(card, faction, opsnum);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " playing ops");
	  }

	  return 0;

	}

	if (mv[0] === "moveunit") {

	  let faction   = mv[1];
	  let from_type = mv[2];
	  let from_key  = mv[3];
	  let from_idx  = mv[4];
	  let to_type   = mv[5];
	  let to_key    = mv[6];

	  let unit_to_move;

	  this.game.queue.splice(qe, 1);

	  if (from_type === "sea") {
	    unit_to_move = this.game.navalspaces[from_key].units[faction][from_idx];
	  }
	  if (from_type === "land") {
	    unit_to_move = this.game.spaces[from_key].units[faction][from_idx];
	  }

	  if (to_type === "sea") {
	    this.game.navalspaces[to_key].units[faction].push(unit_to_move);
	  }
	  if (to_type === "land") {
	    this.game.spaces[to_key].units[faction].push(unit_to_move);
	  }

	  return 1;

	}

        if (mv[0] === "lock") {

	  let faction = mv[1];
	  let source = mv[2];

	  this.game.queue.splice(qe, 1);

	  for (let i = 0; i < this.game.spaces[source].units[faction].length; i++) {
	    this.game.spaces[source].units[faction][i].locked = true;
	  }

          return 1;

        }


        if (mv[0] === "move") {

	  let faction = mv[1];
	  let movetype = mv[2];
	  let source = mv[3];
	  let destination = mv[4];
	  let unitidx = parseInt(mv[5]);
	  let skip_avoid_battle = parseInt(mv[6]);

	  this.game.queue.splice(qe, 1);

	  if (movetype === "sea") {

	    //
	    // source = land, destination = sea
	    //
	    if (this.game.spaces[source] && this.game.navalspaces[destination]) {
	      let unit_to_move = this.game.spaces[source].units[faction][unitidx];
 	      unit_to_move.already_moved = 1;
              this.game.navalspaces[destination].units[faction].push(unit_to_move);
              this.game.spaces[source].units[faction].splice(unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displaySpace(source);
	      this.displayNavalSpace(destination);
	    }

	    //
	    // source = sea, destination = sea
	    //
	    if (this.game.navalspaces[source] && this.game.navalspaces[destination]) {
	      let actual_unitidx = 0;
	      for (let i = 0; i < this.game.navalspaces[source].units[faction].length; i++) {
		if (this.game.navalspaces[source].units[faction][i].idx === unitidx) {
		  actual_unitidx = i;
		};
	      }

	      let unit_to_move = this.game.navalspaces[source].units[faction][actual_unitidx];
 	      unit_to_move.already_moved = 1;
              this.game.navalspaces[destination].units[faction].push(unit_to_move);
              this.game.navalspaces[source].units[faction].splice(actual_unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displayNavalSpace(source);
	      this.displayNavalSpace(destination);
	    }

	    //
	    // source = sea, destination = land
	    //
	    if (this.game.navalspaces[source] && this.game.spaces[destination]) {

	      let actual_unitidx = 0;
	      for (let i = 0; i < this.game.navalspaces[source].units[faction].length; i++) {
		if (this.game.navalspaces[source].units[faction][i].idx === unitidx) {
		  actual_unitidx = i;
		};
	      }

	      let unit_to_move = this.game.navalspaces[source].units[faction][actual_unitidx];
 	      unit_to_move.already_moved = 1;
              this.game.spaces[destination].units[faction].push(unit_to_move);
              this.game.navalspaces[source].units[faction].splice(actual_unitidx, 1);
	      this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	      this.displayNavalSpace(source);
	      this.displaySpace(destination);
	    }

	    //
	    // do we have a jolly sea battle?
	    //
            let space;
	    if (this.game.spaces[destination]) {
	      space = this.game.spaces[destination];
	    }
	    if (this.game.navalspaces[destination]) {
	      space = this.game.navalspaces[destination];
	    }

            let anyone_else_here = 0;

            let lqe = qe-1;
            if (lqe >= 0) {
              let lmv = this.game.queue[lqe].split("\t");
              if (lmv[0] == "naval_interception_check") {
                for (let f in space.units) {
                  if (space.units[f].length > 0 && f != faction) {
                    anyone_else_here = 1;
                  }
                  if (f !== faction && space.units[f].length > 0 && !this.areAllies(f, faction)) {
                    if (lqe-1 >= 0) {
                      // added in reverse order
                      if (skip_avoid_battle != 1) {
                        this.game.queue.splice(lqe, 0, "naval_retreat_check\t"+faction+"\t"+destination+"\t"+source);
                      }
                      this.game.queue.splice(lqe, 0, "RESETCONFIRMSNEEDED\tall");
                      this.game.queue.splice(lqe, 0, "counter_or_acknowledge\tNaval Battle is about to begin in "+destination + "\tnaval_battle");
                      this.game.queue.splice(lqe, 0, "naval_battle\t"+space.key+"\t"+faction);
                    }
                  }
                }
              } else {
                //
                // we only update the occupier of the space if the next move is not a "move"
                // as we require interception check to find out if there are units here already.
                //
                if (lmv[0] !== "move") {
                  if (anyone_else_here == 0) {
                    space.occupier = faction;
                  }
                }
              }
            }
	  }


	  if (movetype === "land") {

	    let unit_to_move = this.game.spaces[source].units[faction][unitidx];
 	    unit_to_move.already_moved = 1;
            this.game.spaces[destination].units[faction].push(unit_to_move);
            this.game.spaces[source].units[faction].splice(unitidx, 1);
	    this.updateLog(this.returnFactionName(faction)+" moves "+unit_to_move.name+" from " + this.returnSpaceName(source) + " to " + this.returnSpaceName(destination));
	    this.displaySpace(source);
	    this.displaySpace(destination);

	    //
	    // if this space contains two non-allies, field-battle or siege must occur
	    //
	    let space = this.game.spaces[destination];
	    let anyone_else_here = 0;

	    let lqe = qe-1;
	    if (lqe >= 0) {
	      let lmv = this.game.queue[lqe].split("\t");
	      if (lmv[0] == "interception_check") {
	        for (let f in space.units) {
	          if (space.units[f].length > 0 && f != faction) {
		    anyone_else_here = 1;
	          }
	          if (f !== faction && space.units[f].length > 0 && !this.areAllies(f, faction)) {
		    if (lqe-1 >= 0) {
		      // added in reverse order
		      if (skip_avoid_battle != 1) {
	                this.game.queue.splice(lqe, 0, "retreat_check\t"+faction+"\t"+destination+"\t"+source);
	                this.game.queue.splice(lqe, 0, "fortification_check\t"+faction+"\t"+destination+"\t"+source);
		      }
	              this.game.queue.splice(lqe, 0, "field_battle\t"+space.key+"\t"+faction);
	            }
	          }
	        }
	      } else {
		//
		// we only update the occupier of the space if the next move is not a "move"
		// as we require interception check to find out if there are units here already.
		//
		if (lmv[0] !== "move") {
	          if (anyone_else_here == 0) {
	            space.occupier = faction;
		  }
		}
	      }
	    }

	    this.displaySpace(source);
	    this.displaySpace(destination);

	  }

          return 1;
	}


        if (mv[0] === "fortification_check") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];

	  his_self.game.state.attacker_comes_from_this_spacekey = mv[3];

	  let space = this.game.spaces[spacekey];

	  if (space.type !== "key" && space.type !== "fortress") {
	    return 1;
	  }

	  //
	  // whoever is being attacked can retreat into the fortification if they
	  // have 4 or less land units
	  //
	  for (f in this.factions) {
	    if (f !== attacker && this.isSpaceControlled(spacekey, f)) {

	      let fluis = this.returnFactionLandUnitsInSpace(f, spacekey);

	      if (fluis == 0) {
		//
		// no troops - skip
		//
	      } else {

	        if (fluis > 4) {

		  // must land battle

	        } else {

		  if (this.isMinorPower(f)) {

		    if (this.isMinorUnactivatedPower(f)) {

		      //
		      // auto-handled -- we retreat for siege
		      //
		      this.game.queue.push("fortification\t"+attacker+"\t"+f+"\t"+spacekey);

		    } else {

		      //
 		      // major power decides
		      //
		      let cf = "";
		      let mp = f;

		      if (this.game.state.activated_powers['ottoman'].includes(f)) { cf = "ottoman"; }
		      if (this.game.state.activated_powers['hapsburg'].includes(f)) { cf = "hapsburg"; }
		      if (this.game.state.activated_powers['france'].includes(f)) { cf = "france"; }
		      if (this.game.state.activated_powers['england'].includes(f)) { cf = "england"; }
		      if (this.game.state.activated_powers['papacy'].includes(f)) { cf = "papacy"; }
		      if (this.game.state.activated_powers['protestant'].includes(f)) { cf = "protestant"; }

		      let cp = this.returnPlayerOfFaction(cf);

		      this.game.queue.push("player_evaluate_fortification"+"\t"+attacker+"\t"+cp+"\t"+mp+"\t"+spacekey);

		    }

	          } else {

		    //
		    // major or independent power - some player decides
		    //
		    let cp = this.returnPlayerOfFaction(f);
		    if (cp != 0) {
		      this.game.queue.push("player_evaluate_fortification"+"\t"+attacker+"\t"+cp+"\t"+f+"\t"+spacekey);
		    } else {

	              //
		      // independent key
	              //
	              // non-player controlled, minor power or independent, so auto-handle
	              //
	              // If there are 4 or fewer land units in a space, they will always withdraw into
	              // the fortifications and try to withstand a siege if their space is entered.
	              // if there are 5 or more land units,they will hold their ground and fight a field
	              // battle. If they lose that field battle, do not retreat their units from the
	              // space as usual. Instead, they retain up to 4 units which withdraw into the
	              // fortifications; all other land units in excess of 4 are eliminated.
	              //
	              // fortify everything
	              //
	              for (let i = 0; i < space.units[f].length; i++) {
	                his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+f+"\t"+JSON.stringify(space.units[f][i]));
	              }
		    }
	          }
	        }
	      }

	    } else {

	      //
	      // no land units (skip)
	      //

	    }
	  }

          return 1;

	}

        if (mv[0] === "post_field_battle_player_evaluate_fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let spacekey = mv[4];
          let space = this.game.spaces[spacekey];

	  //
	  // if this is not a fortified space, clear and continue
	  //
	  if (space.type !== "fortress" && space.type !== "electorate" && space.type !== "key") {
	    return 1;
	  }

	  //
	  // otherwise, we have to evaluate fortifying
	  //
	  if (this.game.player == player) {
	    this.field_battle_overlay.renderFortification(this.game.state.field_battle);
	    this.playerEvaluateFortification(attacker, faction, spacekey);
	  } else {
	    if (this.isPlayerControlledFaction(faction)) {
	      this.field_battle_overlay.renderFortification(this.game.state.field_battle);
	      this.field_battle_overlay.updateinstructions(faction + " considering fortification");
	      this.updateStatus(this.returnFactionName(faction) + " considering fortification");
	    } else {

	      //
	      // non-player controlled, minor power or independent, so auto-handle
	      //
	      // If there are 4 or fewer land units in a space, they will always withdraw into
	      // the fortifications and try to withstand a siege if their space is entered.
	      // if there are 5 or more land units,they will hold their ground and fight a field
	      // battle. If they lose that field battle, do not retreat their units from the
	      // space as usual. Instead, they retain up to 4 units which withdraw into the
	      // fortifications; all other land units in excess of 4 are eliminated.
      	      //
      	      // this only runs after we have had a battle, so we fortify everything if we still
	      // exist.
      	      //
	      //
	      // fortify everything
	      //
	      for (let i = 0; i < space.units[faction].length; i++) {
	        his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+faction+"\t"+JSON.stringify(space.units[faction][i]));
	      }
	      return 1;
	    }
	  }

          return 0;

	}

        if (mv[0] === "player_evaluate_fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let spacekey = mv[4];
	  let space = this.game.spaces[spacekey];

	  if (this.game.player == player) {
	    this.playerEvaluateFortification(attacker, faction, spacekey);
	  } else {
	    if (this.isPlayerControlledFaction(faction)) {
	      this.updateStatus(this.returnFactionName(faction) + " considering fortification");
	    } else {
	      //
	      // non-player controlled, minor power or independent, so auto-handle
	      //
	      // If there are 4 or fewer land units in a space, they will always withdraw into
	      // the fortifications and try to withstand a siege if their space is entered.
	      // if there are 5 or more land units,they will hold their ground and fight a field
	      // battle. If they lose that field battle, do not retreat their units from the
	      // space as usual. Instead, they retain up to 4 units which withdraw into the
	      // fortifications; all other land units in excess of 4 are eliminated.
      	      //
      	      // this only runs after we have had a battle, so we fortify everything if we still
	      // exist.
      	      //
	      //
	      // fortify everything
	      //
	      for (let i = 0; i < space.units[faction].length; i++) {
	        his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+faction+"\t"+JSON.stringify(space.units[faction][i]));
	      }
	      return 1;
	    }
	  }

          return 0;

	}



	if (mv[0] === "fortify_unit") {

	  this.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let faction = mv[2];
	  let units = JSON.parse(mv[3]);
	  let space = this.game.spaces[spacekey];

          space.besieged = 2; // 2 = cannot attack this round
          space.besieged_factions.push(faction);
	  for (let i = 0; i < space.units[faction].length; i++) {
	    space.units[faction][i].besieged = 1;
	  }

	  return 1;

        }


        if (mv[0] === "fortification") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let faction = mv[2];
	  let spacekey = mv[3];
	  let space = this.game.spaces[spacekey];

	  let faction_map = this.returnFactionMap(space, attacker, faction);
	  let player = this.returnPlayerOfFaction(faction);

console.log("REMOVING EVERYTHING BEFORE FIELD BATTLE");

	  // OCT 7 -- removing as this causes problems
	  // queue is just emptied totally when France invades Venice
	  // in testing.
	  //for (let i = this.game.queue.length-1; i >= 0; i--) {
	  //  let lmv = this.game.queue[i].split("\t");
	    //
	    // remove everything before field_battle
	    //
	  //  if (lmv[0] !== "field_battle") {
	  //    this.game.queue.splice(i, 1);
	  //  } else {
	  //    break;
	  //  }
	  //}

	  if (this.game.player === player) {
	    this.playerFortifySpace(faction, attacker, spacekey);
	  } else {
	    if (this.isPlayerControlledFaction(faction)) {
	      this.updateStatus(this.returnFactionName(faction) + " handling retreat into fortification");
	    } else {
	      //
	      // non-player controlled, minor power or independent, so auto-handle
	      //
	      // If there are 4 or fewer land units in a space, they will always withdraw into
	      // the fortifications and try to withstand a siege if their space is entered.
	      // if there are 5 or more land units,they will hold their ground and fight a field
	      // battle. If they lose that field battle, do not retreat their units from the
	      // space as usual. Instead, they retain up to 4 units which withdraw into the
	      // fortifications; all other land units in excess of 4 are eliminated.
      	      //
	      if (space.units[faction].length <= 4) {
		// fortify everything
		for (let i = 0; i < space.units[faction].length; i++) {
		  his_self.game.queue.push("fortify_unit\t"+spacekey+"\t"+faction+"\t"+JSON.stringify(space.units[faction][i]));
		}
	      } else {
		//
		// go into field battle
		//
	      }
	      return 1;
	    }
	  }

          return 0;

	}



	if (mv[0] === "break_siege") {

	  this.game.queue.splice(qe, 1);

	  let faction_map      = his_self.game.state.assault.faction_map;
	  let attacker_faction = his_self.game.state.assault.attacker_faction;
	  let defender_faction = his_self.game.state.assault.defender_faction;
	  let spacekey         = his_self.game.state.assault.spacekey;
	  let space 	       = his_self.game.spaces[spacekey];
	  let neighbours       = space.neighbours;

	  //
	  // remove siege record from units/space
	  //
	  space.besieged = 0;
	  for (let f in space.units) {
	    for (let i = 0; i < space.units[f].length; i++) {
	      space.units[f][i].besieged = 0;
	    }
	  }
	  this.displaySpace(spacekey);


	  for (let zz = 0; zz < neighbours.length; zz++) {
            let fluis = this.canFactionRetreatToSpace(attacker_faction, neighbours[zz]);
	    if (fluis) {
              this.game.queue.push("player_evaluate_break_siege_retreat_opportunity\t"+attacker_faction+"\t"+spacekey);
	      zz = neighbours.length+1;
	    }
	  }

	  return 1;

	}


        if (mv[0] === "retreat_check") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  his_self.game.state.attacker_comes_from_this_spacekey = mv[3];
	  let space = this.game.spaces[spacekey];
	  let neighbours = this.returnNeighbours(spacekey, 0); // 0 cannot intercept across passes
	  let attacking_player = this.returnPlayerOfFaction(attacker);

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let can_faction_retreat = 0;
	    let player_of_faction = this.returnPlayerOfFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction > 0) {
  	      if (io[i] !== attacker) {
	        let units_in_space = this.returnFactionLandUnitsInSpace(io[i], spacekey);
	        if (units_in_space > 0) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
	            let fluis = this.canFactionRetreatToSpace(io[i], neighbours[zz], attacker_comes_from_this_spacekey);
	            if (fluis > 0) {
	              this.game.queue.push("player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+io[i]);
		      zz = neighbours.length;
	            }
	          }
	        }
	      }
	    }

	    for (let zz = 0; zz < this.game.state.activated_powers[io[i]].length; zz++) {
	      let ap = this.game.state.activated_powers[io[i]][zz];
	      if (ap != attacker) {
	        let units_in_space = this.returnFactionLandUnitsInSpace(ap, spacekey);
	        if (units_in_space > 0) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
	            let fluis = this.canFactionRetreatToSpace(ap, neighbours[zz], attacker_comes_from_this_spacekey);
	            if (fluis > 0) {
		      this.game.queue.push("player_evaluate_retreat_opportunity\t"+attacker+"\t"+spacekey+"\t"+attacker_comes_from_this_spacekey+"\t"+ap);
		      zz = neighbours.length;
	            }
	          }
	        }
	      }
	    }
	  }

          return 1;

	}





        if (mv[0] === "player_evaluate_break_siege_retreat_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];

	  let player_factions = this.returnPlayerFactions(this.game.player)

	  if (player_factions.includes(attacker) || this.returnPlayerCommandingFaction(attacker) == this.game.player) {
	    this.playerEvaluateBreakSiegeRetreatOpportunity(attacker, spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(attacker) + " considering retreat");
	  }

	  return 0;

	}



        if (mv[0] === "player_evaluate_retreat_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_comes_from_this_spacekey = mv[3];
	  let defender = mv[4];

	  let player_factions = this.returnPlayerFactions(this.game.player)

	  if (player_factions.includes(defender) || this.returnPlayerCommandingFaction(defender) == this.game.player) {
	    this.playerEvaluateRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_spacekey, defender);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering retreat");
	  }

	  return 0;

	}


	if (mv[0] === "naval_retreat") {

	  let faction = mv[1];
	  let source_spacekey = mv[2];
	  let destination_spacekey = mv[3];

	  let source;
	  if (this.game.spaces[source_spacekey]) { source = this.game.spaces[source_spacekey]; }
	  if (this.game.navalspaces[source_spacekey]) { source = this.game.navalspaces[source_spacekey]; }

	  let destination;
	  if (this.game.spaces[destination_spacekey]) { source = this.game.spaces[destination_spacekey]; }
	  if (this.game.navalspaces[destination_spacekey]) { source = this.game.navalspaces[destination_spacekey]; }

	  for (let i = source.units[faction].length-1; i >= 0; i--) {
	    if (source.units[faction][i].land_or_sea == "sea" || source.units[faction][i].land_or_sea == "both") {
	      destination.units[faction].push(source.units[faction][i]);
	      source.units[faction].splice(i, 1);
	    }
	  }

	  this.displaySpace(source_spacekey);
	  this.displayNavalSpace(source_spacekey);
	  this.displaySpace(destination_spacekey);
	  this.displayNavalSpace(destination_spacekey);

	  return 1;

	}



        if (mv[0] === "retreat") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let from = mv[2];
	  let to = mv[3];

	  let source = this.game.spaces[from];
	  let destination = this.game.spaces[to];

	  for (let i = 0; i < source.units[faction].length; i++) {
	    source.units[faction][i].locked = true;
	    destination.units[faction].push(source.units[faction][i]);
	  }

	  source.units[faction] = [];
	  this.displaySpace(from);
	  this.displaySpace(to);

          return 1;

	}


        if (mv[0] === "naval_battle_hits_assignment") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let hits_to_assign = parseInt(mv[2]);
	  let space = mv[3];

	  let player = this.returnPlayerOfFaction(faction);
	  if (player > 0) {
	    if (this.game.player === player) {
	      this.playerAssignNavalHits(faction, space, hits_to_assign);
	    } else {
	      this.updateStatus(this.returnFactionName(faction) + " assigning hits [ " + hits_to_assigns + " ]");
	    }
	  } else {
	    return 1;
	  }

	  return 0;
	}




        if (mv[0] === "interception_check") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let includes_cavalry = parseInt(mv[3]);

	  let space = this.game.spaces[spacekey];
	  let neighbours = this.returnNeighbours(spacekey, 0); // 0 cannot intercept across passes

	  let attacking_player = this.returnPlayerOfFaction(faction);

	  let already_asked = [];

	  let io = this.returnImpulseOrder();
	  for (let i = io.length-1; i>= 0; i--) {
	    let player_of_faction = this.returnPlayerOfFaction(io[i]);
	    if (player_of_faction != attacking_player && player_of_faction != 0) {
  	      if (io[i] !== faction) {
	        for (let zz = 0; zz < neighbours.length; zz++) {
	          let fluis = this.returnFactionLandUnitsInSpace(io[i], neighbours[zz]);
	          if (fluis > 0) {
		    if (!already_asked.includes((io[i]+neighbours[zz]))) {
	              this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+includes_cavalry+"\t"+io[i]+"\t"+neighbours[zz]);
	  	      already_asked.push((io[i]+neighbours[zz]));
		    }
	          }
	        }
	      }
	    }

	    for (let zzz = 0; zzz < this.game.state.activated_powers[io[i]].length; zzz++) {
	      let ap = this.game.state.activated_powers[io[i]][zzz];
	      if (ap != faction && !already_asked.includes(ap)) {
	        for (let zz = 0; zz < neighbours.length; zz++) {
	          let fluis = this.returnFactionLandUnitsInSpace(ap, neighbours[zz]);
	          if (fluis > 0) {
		    if (!already_asked.includes((ap+neighbours[zz]))) {
	              this.game.queue.push("player_evaluate_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"0"+"\t"+ap+"\t"+neighbours[zz]);
	  	      already_asked.push((ap+neighbours[zz]));
	            }
	          }
	        }
	      }
	    }
	  }
          return 1;
	}


        if (mv[0] === "naval_interception_check") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];

	  let neighbours = this.returnNavalAndPortNeighbours(spacekey);
	  let attacking_player = this.returnPlayerOfFaction(faction);

	  //
	  // interception at port is not possible
	  //
	  if (this.game.spaces[spacekey]) {
	    console.log("INTERCEPTIONS INVOLVING PORTS NOT SUPPORTED YET");
	  }

	  //
	  //
	  //
	  if (this.game.navalspaces[spacekey]) {

	    let io = this.returnImpulseOrder();
	    for (let i = io.length-1; i>= 0; i--) {
	      let player_of_faction = this.returnPlayerOfFaction(io[i]);
	      if (player_of_faction != attacking_player && player_of_faction != 0) {
  	        if (io[i] !== faction) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
	            let fluis = this.returnFactionSeaUnitsInSpace(io[i], neighbours[zz]);
	            if (fluis > 0) {
	              this.game.queue.push("player_evaluate_naval_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"\t"+io[i]+"\t"+neighbours[zz]);
	            }
	          }
	        }
	      }

	      for (let z = 0; z < this.game.state.activated_powers[io[i]].length; z++) {
	        let ap = this.game.state.activated_powers[io[i]][z];
	        if (ap != faction) {
	          for (let zz = 0; zz < neighbours.length; zz++) {
	            let fluis = this.returnFactionSeaUnitsInSpace(ap, neighbours[zz]);
	            if (fluis > 0) {
	              this.game.queue.push("player_evaluate_naval_interception_opportunity\t"+faction+"\t"+spacekey+"\t"+"\t"+ap+"\t"+neighbours[zz]);
	            }
	          }
	        }
	      }
	    }
	  }
          return 1;
	}


        if (mv[0] === "player_evaluate_naval_interception_opportunity") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let defender = mv[3];
	  let defender_spacekey = mv[4];

          let controller_of_defender = this.returnPlayerCommandingFaction(defender);
                
          if (controller_of_defender == 0) { return 1; }
            
          if (this.game.player == controller_of_defender) {
	    this.playerEvaluateNavalInterceptionOpportunity(attacker, spacekey, defender, defender_spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering naval interception from " + this.returnSpaceName(defender_spacekey));
	  }

	  return 0;

	}


        if (mv[0] === "player_evaluate_interception_opportunity") {

	  this.game.queue.splice(qe, 1);

	  if (defender === "protestant" && this.game.state.events.schmalkaldic_league != 1) {
	    return 1;
	  }

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_includes_cavalry = mv[3];
	  let defender = mv[4];
	  let defender_spacekey = mv[5];
	  let controller_of_defender = this.returnPlayerCommandingFaction(defender);

console.log("defender is: " + mv[4]);
console.log("player controlling defender? " + controller_of_defender);
console.log("i am player: " + this.game.player);

	  if (controller_of_defender == 0) { return 1; }

	  if (this.game.player == controller_of_defender) {
	    this.playerEvaluateInterceptionOpportunity(attacker, spacekey, attacker_includes_cavalry, defender, defender_spacekey);
	  } else {
	    this.updateStatus(this.returnFactionName(defender) + " considering interception from " + this.returnSpaceName(defender_spacekey));
	  }

	  return 0;

	}


        if (mv[0] === "intercept") {

	  this.game.queue.splice(qe, 1);

	  //
	  // in case we had it open to intercept
	  //
	  this.movement_overlay.hide();

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let attacker_includes_cavalry = parseInt(mv[3]);
	  let defender = mv[4];
	  let defender_spacekey = mv[5];
	  let units_to_move_idx = JSON.parse(mv[6]);
	  let units_to_move = [];

	  //
	  // load actual units to examine them for cavalry, leaders
	  //
	  let s = this.game.spaces[defender_spacekey];
          for (let i = 0; i < units_to_move_idx.length; i++) {
	    units_to_move.push(s.units[defender][units_to_move_idx[i]]);
	  }

	  if (units_to_move.length == 0) {
	    this.updateLog("no units sent to intercept...");
	    return 1;
	  }

	  let hits_on = 9;
	  let defender_has_cavalry = 0;
	  let defender_highest_battle_rating = 0;

	  for (let i = 0; i < units_to_move.length; i++) {
	    if (units_to_move[i].type === "cavalry") { defender_has_cavalry = 1; }
	    if (units_to_move[i].battle_rating > defender_highest_battle_rating) {
	      defender_highest_battle_rating = units_to_move[i].battle_rating;
	    }
	  }

	  this.updateLog(this.returnFactionName(defender) + " moves to intercept from " + this.returnSpaceName(defender_spacekey));

	  if (attacker === "ottoman" && attacker_includes_cavalry) {
	    this.updateLog("Ottoman +1 cavalry bonus");
	    hits_on++;
	  }
	  if (defender === "ottoman" && defender_has_cavalry) {
	    this.updateLog("Ottoman -1 cavalry bonus");
	    hits_on--;
	  }
	  if (defender_highest_battle_rating > 0) {
	    this.updateLog(this.returnFactionName(defender) + " gains " + defender_highest_battle_rating + " bonus from formation leader");
	  }

	  let d1 = this.rollDice(6);
	  let d2 = this.rollDice(6);
	  let dsum = d1+d2;

	  this.updateLog("Interception roll #1: " + d1);
	  this.updateLog("Interception roll #2: " + d2);

//
// IS_TESTING
//
//this.updateLog("IS_TESTING - HITS ON 2");
//hits_on = 2;

	  if (dsum >= hits_on) {

	    this.updateLog("SUCCESS");

	    //
	    // insert at end of queue by default
	    //
	    let index_to_insert_moves = this.game.queue.length-1;

	    //
	    // BUT NO OTHER POWER CAN INTERCEPT, SO CLEAN OUT GAME QUEUE
	    //
	    for (let i = this.game.queue.length-1; i >= 0; i--) {
	      let lqe = this.game.queue[i];
	      let lmv = lqe.split("\t");
	      if (lmv[0] !== "player_evaluate_interception_opportunity") {
	        index_to_insert_moves = i;
		break;
	      } else {
	        if (lmv[4] !== defender) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		}
	      }
	    }

console.log("2. insert index: " + index_to_insert_moves);

	    //
	    // SUCCESS - move and continue to evaluate interception opportunities
	    //
	    for (let i = units_to_move_idx.length-1; i >= 0; i--) {
	      let m = "move\t"+defender+"\tland\t"+defender_spacekey+"\t"+spacekey+"\t"+units_to_move_idx[i]+"\t"+1; // 1 = skip avoid battle
	      his_self.game.queue.splice((index_to_insert_moves+1), 0, m);
	    }
	    let m = "lock\t"+defender+"\t"+spacekey; // 1 = skip avoid battle
	    his_self.game.queue.splice((index_to_insert_moves+1), 0, m);
	    his_self.game.queue.splice((index_to_insert_moves+1), 0, ("field_battle\t"+spacekey+"\t"+attacker));

	  } else {
	    this.updateLog("FAILURE");
	  }

	  return 1;

	}




        if (mv[0] === "naval_intercept") {

	  this.game.queue.splice(qe, 1);

	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let defender = mv[3];
	  let defender_spacekey = mv[4];
	  let units_to_move_idx = JSON.parse(mv[5]);
	  let units_to_move = [];

	  //
	  // load actual units to examine them for squadrons, corsairs, navy leaders
	  //
	  let s;
	  if (this.game.spaces[defender_spacekey]) {
	    s = this.game.spaces[defender_spacekey];
	  }
	  if (this.game.navalspaces[defender_spacekey]) {
	    s = this.game.navalspaces[defender_spacekey];
	  }

          for (let i = 0; i < units_to_move_idx.length; i++) {
	    units_to_move.push(s.units[defender][units_to_move_idx[i]]);
	  }

	  if (units_to_move.length == 0) {
	    this.updateLog("no units sent to intercept...");
	    return 1;
	  }

	  let hits_on = 9;
	  let defender_highest_battle_rating = 0;

	  for (let i = 0; i < units_to_move.length; i++) {
	    if (units_to_move[i].battle_rating > defender_highest_battle_rating) {
	      defender_highest_battle_rating = units_to_move[i].battle_rating;
	    }
	  }

	  this.updateLog(this.returnFactionName(defender) + " navy moves to intercept from " + this.returnSpaceName(defender_spacekey));
	  if (defender_highest_battle_rating > 0) {
	    this.updateLog(this.returnFactionName(defender) + " gains " + defender_highest_battle_rating + " bonus from navy leader");
	  }

	  let d1 = this.rollDice(6);
	  let d2 = this.rollDice(6);
	  let dsum = d1+d2;

	  this.updateLog("Interception roll #1: " + d1);
	  this.updateLog("Interception roll #2: " + d2);

	  // IS_TESTING
	  if (dsum >= hits_on) {

	    this.updateLog("SUCCESS");

	    //
	    // insert at end of queue by default
	    //
	    let index_to_insert_moves = this.game.queue.length-1;

	    //
	    // BUT NO OTHER POWER CAN INTERCEPT, SO CLEAN OUT GAME QUEUE FOR THIS DESTINATION
	    //
	    for (let i = this.game.queue.length-1; i >= 0; i--) {
	      let lqe = this.game.queue[i];
	      let lmv = lqe.split("\t");
	      if (lmv[0] !== "player_evaluate_naval_interception_opportunity") {
	        index_to_insert_moves = i;
		break;
	      } else {
	        if (lmv[2] != spacekey) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		  i--; // queue is 1 shorter
	          index_to_insert_moves = i;
		  break;
		}
	        if (lmv[3] !== defender) {
		  this.game.queue.splice(i, 1); // remove 1 at i
		  i--; // queue is 1 shorter
	        }
	      }
	    }


	    //
	    // SUCCESS - move and continue to evaluate interception opportunities
	    //
	    for (let i = 0; i < units_to_move_idx.length; i++) {
	      let m = "move\t"+defender+"\tsea\t"+defender_spacekey+"\t"+spacekey+"\t"+units_to_move_idx[i+"\t"+1]; // 1 = skip avoid battle
	      his_self.game.queue.splice(index_to_insert_moves, 0, m);
	    }

	  } else {
	    this.updateLog("FAILURE");
	  }

	  return 1;

	}


        if (mv[0] === "diet_of_worms") {

	  let game_self = this;

          game_self.game.queue.push("resolve_diet_of_worms");

	  //
	  // flip hapsburg card from deck if 2-player game
	  //
	  if (game_self.game.players.length == 2) {
	    // hapsburg card goes to pool
            game_self.game.queue.push("POOLDEAL\t1\t1\t1"); // deck 1
            game_self.game.queue.push("POOL\t1"); // deck 1
	  }

          //
          // remove mandatory events from both hands
	  //
	  let x = [];
	  for (let i = 0; i < this.game.deck[0].fhand[0].length; i++) {
	    if (this.game.deck[0].cards[this.game.deck[0].fhand[0][i]].type === "mandatory") {} else { x.push(this.game.deck[0].fhand[0][i]); }
	  }

          this.updateStatusAndListCards("Pick your Card for the Diet of Worms", x);
          this.attachCardboxEvents(async function(card) {

            game_self.updateStatus("You picked: " + game_self.deck[card].name);

            let hash1 = game_self.app.crypto.hash(card);    // my card
            let hash2 = game_self.app.crypto.hash(Math.random().toString());  // my secret
            let hash3 = game_self.app.crypto.hash(hash2 + hash1);             // combined hash

	    let privateKey = await game_self.app.wallet.getPrivateKey();

            let card_sig = game_self.app.crypto.signMessage(card, privateKey);
            let hash2_sig = game_self.app.crypto.signMessage(hash2, privateKey);
            let hash3_sig = game_self.app.crypto.signMessage(hash3, privateKey);

            game_self.game.spick_card = card;
            game_self.game.spick_hash = hash2;

            game_self.addMove("SIMULTANEOUS_PICK\t"+game_self.game.player+"\t"+hash3+"\t"+hash3_sig);
            game_self.endTurn();

          });

	  this.game.queue.splice(qe, 1);
          return 0;
        }

	if (mv[0] === "resolve_diet_of_worms") {

	  this.game.queue.splice(qe, 1);

	  let protestant = this.returnPlayerOfFaction("protestant");
	  let papacy = this.returnPlayerOfFaction("papacy");
	  let protestant_arolls = [];
	  let papacy_arolls = [];

	  let all_players_but_protestant = [];
	  let all_players_but_papacy = [];
          for (let i = 1; i <= this.game.players.length; i++) {
	    if (i != protestant) { all_players_but_protestant.push(i); }
	    if (i != papacy) { all_players_but_papacy.push(i); }
	  }

	  let protestant_card = this.game.deck[0].cards[this.game.state.sp[protestant-1]];
	  let papacy_card = this.game.deck[0].cards[this.game.state.sp[papacy-1]];
	  let hapsburg_card = this.game.pool[0].hand[0];

	  //
	  // show card in overlay
	  //
	  this.diet_of_worms_overlay.addCardToCardfan(this.game.state.sp[protestant-1], "protestant");
	  this.diet_of_worms_overlay.addCardToCardfan(this.game.state.sp[papacy-1], "catholic");
	  this.diet_of_worms_overlay.addCardToCardfan(hapsburg_card, "catholic");

	  //
	  // discard the selected cards
	  //
	  this.game.queue.push("discard\tprotestant\t"+this.game.state.sp[protestant-1]);
	  this.game.queue.push("discard\tpapacy\t"+this.game.state.sp[papacy-1]);
	  this.game.queue.push("discard\tall\t"+hapsburg_card);

	  //
	  // 3. roll protestant dice: The Protestant player adds 4 to the CP value of his card.
	  // This total represents the number of dice he now rolls. Each roll of a “5” or a “6”
	  // is considered to be a hit.
	  //
	  // 4. roll papal and Hapsburg dice: The Papal player rolls a num- ber of dice equal to
	  // the CP value of his card. The Hapsburg player does the same. Each roll of a “5” or a
	  // “6” is considered to be a hit. These two powers combine their hits into a Catholic total.
	  //
	  // 5. protestant victory: If the number of Protestant hits exceeds the number of Catholic
	  // hits, the Protestant power flips a number of spaces equal to the number of extra hits he
	  // rolled to Protestant influence. All spaces flipped must be in the German language zone.
	  // Spaces flipped must be adjacent to another Protestant space; spaces that were just
	  // flipped in this step can be used as the required adjacent Protestant space.
	  //
	  // 6. Catholic Victory: If the number of Catholic hits exceeds the number of Protestant hits,
	  // the Papacy flips a number of spaces equal to the number of extra hits he rolled to Catholic
	  // influence. All spaces flipped must be in the German language zone. Spaces flipped must be
	  // adjacent to another Catholic space; spaces that were just flipped in this step can be used
	  // as the required adjacent Catholic space.
	  //

	  let protestant_rolls = protestant_card.ops + 4;
	  let protestant_hits = 0;

	  for (let i = 0; i < protestant_rolls; i++) {
	    let x = this.rollDice(6);
	    protestant_arolls.push(x);
	    if (x >= 5) { protestant_hits++; }
	  }

	  let papacy_rolls = papacy_card.ops;
	  let papacy_hits = 0;

	  for (let i = 0; i < papacy_rolls; i++) {
	    let x = this.rollDice(6);
	    papacy_arolls.push(x);
	    if (x >= 5) { papacy_hits++; }
	  }

	  //
	  // TODO: do the hapsburgs get rolls in the 2P game?
	  //
	  // yes -- card pulled from top of deck, or 2 if mandatory event pulled
	  // in which case the event is ignored.
	  //
 	  if (this.game.deck[0].cards[hapsburg_card].type != "mandatory") {
	    for (let i = 0; i < this.game.deck[0].cards[hapsburg_card].ops; i++) {
	      papacy_rolls++;
	      let x = this.rollDice(6);
	      papacy_arolls.push(x);
	      if (x >= 5) { papacy_hits++; }
	    }
	  } else {
	    for (let i = 0; i < 2; i++) {
	      papacy_rolls++;
	      let x = this.rollDice(6);
	      papacy_arolls.push(x);
	      if (x >= 5) { papacy_hits++; }
	    }
	  }

	  if (protestant_hits > papacy_hits) {
	    this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "protestant" , difference : (protestant_hits - papacy_hits) , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	    this.game.queue.push("hide_overlay\ttheses");
	    let total_conversion_attempts = protestant_hits - papacy_hits;
	    for (let i = 1; i <= total_conversion_attempts && i <= this.returnNumberOfCatholicSpacesInLanguageZone(); i++) {
	      this.game.queue.push("select_for_protestant_conversion\tprotestant\tgerman");
	    }
  	    this.game.queue.push("STATUS\tProtestants selecting towns to convert...\t"+JSON.stringify(all_players_but_protestant));
  	    this.game.queue.push("show_overlay\ttheses");
  	    this.game.queue.push("counter_or_acknowledge\tProtestants win Diet of Worms");
  	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  } else {
	    if (protestant_hits < papacy_hits) {
	      this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "papacy" , difference : (papacy_hits - protestant_hits) , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	      this.game.queue.push("hide_overlay\ttheses");
	      let total_conversion_attempts = papacy_hits - protestant_hits;
	      for (let i = 1; i <= total_conversion_attempts && i <= this.returnNumberOfProtestantSpacesInLanguageZone(); i++) {
	        this.game.queue.push("select_for_catholic_conversion\tpapacy\tgerman");
	      }
  	      this.game.queue.push("STATUS\tPapacy selecting towns to convert...\t"+JSON.stringify(all_players_but_papacy));
  	      this.game.queue.push("show_overlay\ttheses");
  	      this.game.queue.push("counter_or_acknowledge\tPapacy wins Diet of Worms");
  	      this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    } else {
  	      //
              // report results
              //
	      this.updateLog("Diet of Worms ends in tie.");
	      this.diet_of_worms_overlay.showResults({ protestant_hits : protestant_hits , papacy_hits : papacy_hits , winner : "none" , difference : 0 , protestant_rolls : protestant_arolls , papacy_rolls : papacy_arolls });
  	      this.game.queue.push("counter_or_acknowledge\tDiet of Worms ends in a Stalemate");
  	      this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    }
	  }

          return 1;

	}

	//
	// this does not auto-remove, it needs to be preceded by a RESETCONFIRMSNEEDED
	// for however many people need to have the opportunity to counter or acknowledge.
	//
	if (mv[0] === "insert_before_counter_or_acknowledge") {

          this.game.queue.splice(qe, 1);

	  let insert = "";
	  for (let i = 1; i < mv.length; i++) {
	    if (i > 1) { insert += "\t"; }
	    insert += mv[i];
	  }

	  for (let i = this.game.queue.length-1; i >= 0; i--) {
	    let lqe = this.game.queue[i];
	    let lmv = lqe.split("\t");
	    if (lmv[0] === "counter_or_acknowledge") {
	      this.game.queue.splice(i, 0, insert);
	      i = 0;
	    }
	  }

	  return 1;

        }


	//
	// this bit of code is complicated, because it stops and starts game-flow but selecively.
	//
	// exists to be removed by counter_or_acknowledge
	if (mv[0] === "halted") {
	  return 0;
	}
	if (mv[0] === "counter_or_acknowledge") {

	  //
	  // hide any cardbox
	  //
	  this.cardbox.hide();

	  //
	  // if i have already confirmed, we only splice and pass-through if everyone else has confirmed
	  // otherwise we will set ack to 0 and return 0 which halts execution. so we should never clear 
	  // splice anything out except here...
	  //
	  if (this.game.confirms_needed[this.game.player-1] == 0) {

	    let ack = 1;

	    for (let i = 0; i < this.game.confirms_needed.length; i++) {
	      if (this.game.confirms_needed[i] >= 1) { ack = 0; }
	    }
	    //
	    // if everyone has returned, splice out counter_or_acknowledge
 	    // and continue to the 
	    //
	    if (ack == 1) { 
	      this.game.queue.splice(qe, 1);
	    }

	    this.updateStatus("acknowledged");
	    return ack;
	  }

	  //
	  // if we get this far i have not confirmed and others may or may
	  // not have confirmed, but we want at least to check to see wheter
	  // i need to....
	  //

	  let msg = mv[1];
	  let stage = mv[2];
	  let extra = "";
	  if (mv[3]) { extra = mv[3]; }

	  //
	  // this is run when players have the opportunity to counter
	  // or intercede in a move made by another player. we cannot
	  // automatically handle without leaking information about
	  // game state, so we let players determine themselves how to
	  // handle. if they are able to, they can respond. if not they
	  // click acknowledge and the msg counts as notification of an
	  // important game development.
	  //
	  let his_self = this;

	  let html = '<ul>';

	  let menu_index = [];
	  let menu_triggers = [];
	  let attach_menu_events = 0;

    	  html += '<li class="option" id="ok">acknowledge</li>';

          let z = this.returnEventObjects();
	  for (let i = 0; i < z.length; i++) {
            if (z[i].menuOptionTriggers(this, stage, this.game.player, extra) == 1) {
              let x = z[i].menuOption(this, stage, this.game.player, extra);
              html += x.html;
	      z[i].faction = x.faction; // add faction
	      menu_index.push(i);
	      menu_triggers.push(x.event);
	      attach_menu_events = 1;
	    }
	  }
	  html += '</ul>';

	  //
	  // skipping, and no options for active player -- skip completely
	  //
	  if (this.game.state.skip_counter_or_acknowledge == 1) {
	    if (attach_menu_events == 0) {
	      //
	      // replaces so we do not sent 2x
	      //
	      his_self.game.queue[his_self.game.queue.length-1] = "halted";
	      his_self.game.confirms_needed[his_self.game.player-1] = 1;
              his_self.addMove("RESOLVE\t"+his_self.publicKey);
              his_self.endTurn();
	      his_self.updateStatus("skipping acknowledge...");
	      return 0;
	    }
	  }

	  this.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('mouseover', function() {
            let action2 = $(this).attr("id");
	    if (his_self.debaters[action2]) {
	      his_self.cardbox.show(action2);
	    }
	    if (his_self.game.deck[0].cards[action2]) {
	      his_self.cardbox.show(action2);
	    }
          });
	  $('.option').on('mouseout', function() {
            let action2 = $(this).attr("id");
	    if (his_self.debaters[action2]) {
	      his_self.cardbox.hide(action2);
	    }
	    if (his_self.game.deck[0].cards[action2]) {
	      his_self.cardbox.hide(action2);
	    }
	  });
          $('.option').on('click', async function () {

            let action2 = $(this).attr("id");

	    //
	    // prevent blocking
	    //
	    his_self.cardbox.hide();

            //
            // events in play
            //
            if (attach_menu_events == 1) {
              for (let i = 0; i < menu_triggers.length; i++) {
                if (action2 == menu_triggers[i]) {
                  $(this).remove();
		  his_self.updateStatus("acknowledged...");
	          // manually add, to avoid re-processing
	          if (his_self.game.confirms_needed[his_self.game.player-1] == 1) {
	            //his_self.game.confirms_needed[his_self.game.player-1] = 2;
                    his_self.prependMove("RESOLVE\t"+his_self.publicKey);
		    z[menu_index[i]].menuOptionActivated(his_self, stage, his_self.game.player, z[menu_index[i]].faction);
                  }
                  return 0;
                }
              }
            }

            if (action2 == "ok") {
	      //
	      // this ensures we clear regardless of choice
	      //
	      // manually add, to avoid re-processing
	      if (his_self.game.confirms_needed[his_self.game.player-1] == 1) {
	        //his_self.game.confirms_needed[his_self.game.player-1] = 2;
                his_self.prependMove("RESOLVE\t"+his_self.publicKey);
	        his_self.updateStatus("acknowledged");
                await his_self.endTurn();
              }
	      return 0;
            }

          });

	  return 0;

	}



	if (mv[0] === "naval_battle") {

          this.game.queue.splice(qe, 1);

	  this.game.state.naval_battle = {};

	  //
	  // count units
	  //
          let calculate_units = function(faction) {
	    let rolls = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type === "squadron") { rolls += 1; }
	      if (space.units[faction][i].type === "corsair") { rolls += 1; }
	    }
	    return rolls;
          }
	  //
	  // calculate rolls
	  //
          let calculate_rolls = function(faction) {
	    let rolls = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type === "squadron") { rolls += 2; }
	      if (space.units[faction][i].type === "corsair") { rolls += 1; }
	    }
	    return rolls;
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_rating = function(faction) {
	    let highest_battle_rating = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_rating > 0) {
	        if (highest_battle_rating < space.units[faction][i].battle_rating) {
		  highest_battle_rating = space.units[faction][i].battle_rating;
		}
	      }
	    }
	    return highest_battle_rating;
          }

	  //
	  // this is run when a naval battle starts. players have by now
	  // interceded or played cards that allow them to respond to the
	  // movement, including retreat into a fortress if available. as
	  // such, this handles the conflict.
	  //
	  let his_self = this;
	  let space;
	  if (this.game.spaces[mv[1]]) { space = this.game.spaces[mv[1]]; }
	  if (this.game.navalspaces[mv[1]]) { space = this.game.navalspaces[mv[1]]; }
	  let attacker = mv[2];
	  let stage = "naval_battle";

	  //
	  // ok -- who the hell is here?
	  //
	  // an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);


	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnFactionMap(space, attacker_faction, defender_faction);

	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {
console.log("1: " + f);
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
console.log("2: " + f);
	      let fp = his_self.returnPlayerOfFaction(f);
	      let p = {};
	      if (fp > 0) { p = his_self.game.state.players_info[fp-1]; }
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p && ap) {
	        if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) {
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	          }
		}
	      }
	    }
	    if (f !== defender_faction && faction_map[f] === defender_faction) {
	      let fp = his_self.returnPlayerOfFaction(f);
	      if (fp > 0) {
  	        let p = {};
	        if (fp > 0) { let p = his_self.game.state.players_info[fp-1]; }
	        let dp = his_self.game.state.players_info[defender_player-1];
	        if (p && dp) {
	          if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	          if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	          if (p.tmp_roll_modifiers.length > 0) {
	      	    for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	              dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	            }
	          }
	        }
	      }
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any
	  // bonuses that affect combat will have been copied over to those players
	  //

	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
	  let attacker_units = 0;
          let defender_units = 0;
	  let defender_port_bonus = 0;
	  if (this.game.spaces[mv[1]]) { defender_port_bonus++; defender_rolls++; }

	  let attacker_highest_battle_rating = 0;
	  let defender_highest_battle_rating = 0;

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {
	      attacker_units += calculate_units(f);
	      attacker_rolls += calculate_rolls(f);
	      if (calculate_highest_battle_rating(f) > attacker_highest_battle_rating) {
		attacker_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {
	      defender_units += calculate_units(f);
	      defender_rolls += calculate_rolls(f);
	      if (calculate_highest_battle_rating(f) > defender_highest_battle_rating) {
		defender_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	  }

	  if (his_self.game.state.players_info[attacker_player-1].tmp_roll_bonus) {
  	    attacker_rolls += parseInt(attacker_player.tmp_roll_bonus);
	  }
	  if (his_self.game.state.players_info[defender_player-1].tmp_roll_bonus) {
            defender_rolls += parseInt(defender_player.tmp_roll_bonus);
	  }

console.log("#");
console.log("# rolls: ");
console.log("# " + attacker_rolls + " / " + defender_rolls);
console.log("#");

	  //
	  // "professional rowers" may be played after dice are rolled, so we roll the dice
	  // now and break ("naval_battle_continued" afterwards...
	  //
	  let attacker_results = [];
	  let defender_results = [];
	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let res = this.rollDice(6);
	    attacker_results.push(res);
	    if (res >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let res = this.rollDice(6);
	    defender_results.push(res);
	    if (res >= 5) { defender_hits++; }
	  }

	  //
	  // PRINT OUT INFO TO LOG
	  //
	  this.updateLog("Attackers: " + attacker_rolls + " in total rolls");
	  for (let i = 0; i < attacker_results.length; i++) {
	    this.updateLog(" ... rolls: " + attacker_results[i]);
          }
	  this.updateLog("Defenders: " + defender_rolls + " in total rolls");
	  for (let i = 0; i < defender_results.length; i++) {
	    this.updateLog(" ... rolls: " + defender_results[i]);
          }

	  //
	  // things get messy and conditional now, because Professional Rowers may
	  // be played to modify dice rolls.
	  //
	  // we handle this by saving the "state" of the battle and pushing
	  // execution back to the game queue.
	  //

	  //
	  // save battle state
	  //
	  his_self.game.state.naval_battle.attacker_units = attacker_units;
	  his_self.game.state.naval_battle.defender_units = defender_units;
	  his_self.game.state.naval_battle.attacker_rolls = attacker_rolls;
	  his_self.game.state.naval_battle.defender_rolls = defender_rolls;
	  his_self.game.state.naval_battle.attacker_results = attacker_results;
	  his_self.game.state.naval_battle.defender_results = defender_results;
	  his_self.game.state.naval_battle.attacker_faction = attacker_faction;
	  his_self.game.state.naval_battle.defender_faction = defender_faction;
	  his_self.game.state.naval_battle.faction_map = faction_map;

	  his_self.game.queue.push(`naval_battle_continue\t${mv[1]}`);
	  his_self.game.queue.push(`counter_or_acknowledge\tNaval Battle Hits Assigmentt\tnaval_battle_hits_assignment`);
	  his_self.game.queue.push(`RESETCONFIRMSNEEDED\tall`);

	  return 1;

        }





	if (mv[0] === "field_battle") {

	  //
	  // people are still moving stuff in
	  //
	  if (qe > 0) {
	    let lmv = "";
	    for (let i = qe-1; i > 0; i--) {
	      lmv = this.game.queue[i].split("\t");
	      if (lmv[0] === "field_battle" && lmv[1] == mv[1]) {
          	this.game.queue.splice(qe, 1);
		return 1;
	      }
	    }
	  }
 
          this.game.queue.splice(qe, 1);

	  //
	  // we will create this object dynamically
	  //
	  this.game.state.field_battle = {};

	  //
	  // calculate rolls
	  //
          let calculate_rolls = function(faction) {
	    let rolls = 0;
	    let units = [];
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].personage == false) {
		if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	          rolls++;
		  units.push(space.units[faction][i].type);
	        }
	      }
	    }
	    return { rolls : rolls , units : units };
          }
	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_rating = function(faction) {
	    let highest_battle_rating = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_rating > 0) {
	        if (highest_battle_rating < space.units[faction][i].battle_rating) {
		  highest_battle_rating = space.units[faction][i].battle_rating;
		}
	      }
	    }
	    return highest_battle_rating;
          }
          let modify_rolls = function(player, roll_array) {
	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                }
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                }
              }
            }
	    return modified_rolls;
          }

	  //
	  // this is run when a field battle starts. players have by now
	  // interceded or played cards that allow them to respond to the
	  // movement, including retreat into a fortress if available. as
	  // such, the rest of this function moves to to handle the on-the-
	  // ground conflict.
	  //
	  let his_self = this;
	  let space = this.game.spaces[mv[1]];
	  let attacker = mv[2];
	  let stage = "field_battle";


	  //
	  // the first thing we check is whether the land units that control the space have
	  // withdrawn into fortifications, as if that is the case then land battle is avoided
	  //
	  if (space.besieged == 2) {
	    this.updateLog("Field Battle avoided by defenders withdrawing into fortifications");
	    this.game.queue.push("counter_or_acknowledge\tField Battle avoided by defenders retreating into fortification\tsiege");
	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    // besieged will become 1 and start of next impulse

	    //
	    // and redraw
	    //
	    this.displaySpace(space.key);

	    return 1;
	  }

	  //
	  // otherwise -- who the hell is here?
	  //
	  // an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);

	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnFactionMap(space, attacker_faction, defender_faction);

	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker)-1];
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p && ap) {
	        if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) {
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	          }
	        }
	      }
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	      let dp = his_self.game.state.players_info[defender_player-1];
	      if (p && dp) {
	        if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) {
	  	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	          }
	        }
	      }
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any
	  // bonuses that affect combat will have been copied over to those players
	  //
	  // we can how start building the field_battle object, which will contain
	  // the information, die rolls, modified die rolls, needed to carry out the
	  // conflict.
	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
	  let attacker_units = [];
	  let defender_units = ['defender'];
	  let attacker_units_faction = [];
	  let defender_units_faction = [defender_faction];
	  let attacker_highest_battle_rating = 0;
	  let defender_highest_battle_rating = 0;
	  let attacker_highest_battle_rating_figure = "";
	  let defender_highest_battle_rating_figure = "";

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {

	      let x = calculate_rolls(f);
	      attacker_rolls += x.rolls;
	      attacker_units.push(...x.units);
	      for (let i = 0; i < x.rolls; i++) { attacker_units_faction.push(f); }
	      if (calculate_highest_battle_rating(f) > attacker_highest_battle_rating) {
		attacker_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {

	      let x = calculate_rolls(f);
	      defender_rolls += x.rolls;
	      defender_units.push(...x.units);
	      for (let i = 0; i < x.rolls; i++) { defender_units_faction.push(f); }

	      if (calculate_highest_battle_rating(f) > defender_highest_battle_rating) {
		defender_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	  }

	  //
	  // add rolls for highest battle ranking
	  //
	  for (let z = 0; z < attacker_highest_battle_rating; z++) {
	    attacker_rolls++;
	  }
	  for (let z = 0; z < defender_highest_battle_rating; z++) {
	    defender_rolls++;
	  }

console.log("ATTACKER HIGHEST BATTLE RANKING: " + attacker_highest_battle_rating);
console.log("DEFENDER HIGHEST BATTLE RANKING: " + defender_highest_battle_rating);


	  //
	  // add bonus rolls
	  //
	  if (attacker_player.tmp_roll_bonus) {
  	    attacker_rolls += parseInt(attacker_player.tmp_roll_bonus);
	  }
	  if (defender_player.tmp_roll_bonus) {
            defender_rolls += parseInt(defender_player.tmp_roll_bonus);
	  }

	  //
	  // logic forks depending on if any of the players can "go first". in order to
	  // simplify our implementation we are going to roll the dice now and then apply
	  // the hits either simultaneously or in sequence so that we don't need to re-
	  // implement the above.
	  //
	  let attacker_results = [];
	  let defender_results = [];
	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let res = this.rollDice(6);
	    attacker_results.push(res);
	    if (res >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let res = this.rollDice(6);
	    defender_results.push(res);
	    if (res >= 5) { defender_hits++; }
	  }

	  //
	  // modify rolls as needed
	  //
	  let attacker_modified_rolls = attacker_results;
	  let defender_modified_rolls = attacker_results;
  	  if (his_self.game.state.field_battle.attacker_player > 0) {
	    attacker_modified_rolls = modify_rolls(his_self.game.state.players_info[his_self.game.state.field_battle.attacker_player-1], attacker_results);
	  }
  	  if (his_self.game.state.field_battle.defender_player > 0) {
 	    defender_modified_rolls = modify_rolls(his_self.game.state.players_info[his_self.game.state.field_battle.defender_player-1], defender_results);
	  }

	  for (let i = 0; i < attacker_modified_rolls; i++) {
	    if (attacker_modified_rolls[i] >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_modified_rolls; i++) {
	    if (defender_modified_rolls[i] >= 5) { defender_hits++; }
	  }

	  //
	  // we have now rolled all of the dice that we need to roll at this stage
	  // and the results have been pushed into the field_battle object. but there
	  // is still the possibility that someone might want to intervene...
	  //
	  // things get extra messy and conditional now, because Ottomans may play
	  // Janissaries and Suprise Attack may change the order in which players
	  // remove units (and hits!) in the resolution of the battle.
	  //
	  // we handle this by saving the "state" of the battle and pushing
	  // execution back to the game queue via counter/acknowledge. those independent
	  // functions can then manipulate the field_battle object directly before
	  // permitting it to fall-through..
	  //

	  //
	  // save battle state
	  //
          his_self.game.state.field_battle.spacekey = mv[1];
	  his_self.game.state.field_battle.attacker_units = attacker_units;
	  his_self.game.state.field_battle.defender_units = defender_units;
	  his_self.game.state.field_battle.attacker_units_faction = attacker_units_faction;
	  his_self.game.state.field_battle.defender_units_faction = defender_units_faction;
	  his_self.game.state.field_battle.attacker_rolls = attacker_rolls;
	  his_self.game.state.field_battle.defender_rolls = defender_rolls;
	  his_self.game.state.field_battle.attacker_modified_rolls = attacker_modified_rolls;
	  his_self.game.state.field_battle.defender_modified_rolls = defender_modified_rolls;
	  his_self.game.state.field_battle.attacker_hits = attacker_hits;
	  his_self.game.state.field_battle.defender_hits = defender_hits;
	  his_self.game.state.field_battle.attacker_units_destroyed = [];
	  his_self.game.state.field_battle.defender_units_destroyed = [];
	  his_self.game.state.field_battle.attacker_results = attacker_results;
	  his_self.game.state.field_battle.defender_results = defender_results;
	  his_self.game.state.field_battle.attacker_faction = attacker_faction;
	  his_self.game.state.field_battle.defender_faction = defender_faction;
	  his_self.game.state.field_battle.attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
	  his_self.game.state.field_battle.defender_player = his_self.returnPlayerOfFaction(defender_faction);
	  his_self.game.state.field_battle.attacker_highest_battle_rating = attacker_highest_battle_rating;
	  his_self.game.state.field_battle.defender_highest_battle_rating = defender_highest_battle_rating;
	  his_self.game.state.field_battle.defender_hits_first = 0;
	  his_self.game.state.field_battle.attacker_hits_first = 0;
	  his_self.game.state.field_battle.defender_hits_first = 0;
	  his_self.game.state.field_battle.faction_map = faction_map;

	  let ap = {};
	  let dp = {};

	  if (attacker_player > 0) { ap = this.game.state.players_info[attacker_player-1]; }
	  if (defender_player > 0) { dp = this.game.state.players_info[defender_player-1]; }

	  //
	  // ottomans may play Janissaries, and some players may attack before each other, so
	  // we take conditional action and move to COUNTER_OR_ACKNOWLEDGE based on the details
	  // of how the battle should execute. the most important division is if one player
	  // "goes first" in which case they knock away from potential hits from the other
	  // side.
	  //
	  his_self.game.queue.push(`field_battle_continue\t${mv[1]}`);

	  if (ap.tmp_roll_first == 1 && dp.tmp_roll_first != 1) {
	    his_self.game.state.field_battle.attacker_hits_first = 1;
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.defender_faction);
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.attacker_faction);
	  } else if (ap.tmp_roll_first != 1 && dp.tmp_roll_first == 1) {
	    his_self.game.state.field_battle.defender_hits_first = 1;
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.attacker_faction);
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.defender_faction);
	  } else {
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.attacker_faction);
	    his_self.game.queue.push("field_battle_assign_hits\t"+his_self.game.state.field_battle.defender_faction);
	  }


	  //
	  // this should stop execution while we are looking at the pre-field battle overlay
	  //
	  his_self.game.queue.push("field_battle_assign_hits_render");
	  his_self.game.queue.push("counter_or_acknowledge\tField Battle is about to begin in "+space.name + "\tpre_field_battle_hits_assignment");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");


          his_self.field_battle_overlay.renderPreFieldBattle(his_self.game.state.field_battle);
          his_self.field_battle_overlay.pullHudOverOverlay();

	  return 1;

        }


        if (mv[0] === "field_battle_assign_hits") {

	  //
	  // major powers may assign hits completely to minor allies, but they have
	  // to split hits, with a random roll used to determine who takes the extra
	  // hit ON DEFENSE. the active power assigns hits independently to any land
	  // units who attack.
	  //
	  let his_self = this;
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
	  let space = this.game.spaces[this.game.state.field_battle.spacekey];

console.log("field battle assign hits: player commanding faction is: " + player);


          this.game.queue.splice(qe, 1);

	  //
	  // we auto-assign the hits to independent, non-player controlled units
	  // this function handles that.
	  //
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;
	    let faction_map = his_self.game.state.field_battle.faction_map;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in his_self.game.state.faction_map) {
	      if (faction_map[f] === faction) {
	    	max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(f, space);
	      }
	    }

	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }

	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) {
		  if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0) {

		//
		// assign hits to allies
		//
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "mercenary"; }
		        if (zzz == 1) { cannon_fodder = "regular"; }
		        if (zzz == 2) { cannon_fodder = "cavalry"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {

			    //
			    // and remove from field battle unit
			    //
		            if (faction === his_self.game.state.field_battle_attacker_faction) {
			      for (let z = 0; z < his_self.game.state.field_battle.attacker_units.length; z++) {
			        let u = his_self.game.state.field_battle.attacker_units[z];
			        if (u.type === cannon_fodder) {
			          if (!his_self.game.state.field_battle.attacker_units_destroyed.includes(z)) {
			            his_self.game.state.field_battle.attacker_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }
		            if (faction === his_self.game.state.field_battle_defender_faction) {
			      for (let z = 0; z < his_self.game.state.field_battle.defender_units.length; z++) {
			        let u = his_self.game.state.field_battle.defender_units[z];
			        if (u.type === cannon_fodder) {
			          if (!his_self.game.state.field_battle.defender_units_destroyed.includes(z)) {
			            his_self.game.state.field_battle.defender_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }

		  	    space.units[f].splice(i, 1);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = 1000000;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();

		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);

		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 3; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "mercenary"; }
                    if (zzz == 1) { cannon_fodder = "regular"; }
                    if (zzz == 2) { cannon_fodder = "cavalry"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {

			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " killed");
                        space.units[selected_faction].splice(ii, 1);
	  		his_self.game.state.field_battle.attacker_units_destroyed = [];
	  		his_self.game.state.field_battle.defender_units_destroyed = [];

                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction land unit next
		  //
		  targets.splice(selected_target-1, 1);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }


	  //
	  // auto-assign hits to independent entities
	  //
	  if (player == 0) {
	    if (faction === this.game.state.field_battle.attacker_faction) {
	      assign_hits(faction, this.game.state.field_battle.defender_hits);
	    } else {
	      assign_hits(faction, this.game.state.field_battle.attacker_hits);
	    }

            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.updateInstructions("Independent Hits Assigned");

	    return 1;
	  }

	  //
	  // no hits assignment if no hits
	  //
	  //
	  if (faction === this.game.state.field_battle.attacker_faction) {
	    if (this.game.state.field_battle.defender_hits == 0) { return 1; }
	  } else {
	    if (this.game.state.field_battle.attacker_hits == 0) { return 1; }
	  }

	  //
	  // if we hit this point we need manual intervention to assign the hits.
	  // the attacker can assign hits however they prefer if others join them
	  // in the attack, but if two major powers share defense then the hits
	  // are divided evenly among them.
	  //
          let hits_to_assign = this.game.state.field_battle.attacker_hits;
          let defending_factions = [];
          let defending_factions_count = 0;
          let defending_major_powers = 0;
          let defending_factions_hits = [];
	  for (let f in this.game.state.field_battle.faction_map) {
	    if (this.game.state.field_battle.faction_map[f] === this.game.state.field_battle.defender_faction) {
	      if (this.isMajorPower(f)) {
	        defending_factions.push(f);
                defending_factions_hits.push(0);
	      }
	    }
	  }

	  //
	  // every gets shared hits
	  //
	  while (hits_to_assign > defending_factions_hits.length) {
	    for (let i = 0; i < defending_factions_hits.length; i++) { defending_factions_hits[i]++; }
	    hits_to_assign -= defending_factions_hits.length;
	  }

	  //
	  // randomly assign remainder
	  //
	  let already_punished = [];
	  for (let i = 0; i < hits_to_assign; i++) {
	    let unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    while (already_punished.includes(unlucky_faction)) {
	      unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    }
	    defending_factions_hits[unlucky_faction]++;
	    already_punished.push(unlucky_faction);
	  }


	  //
	  // defending major powers
	  //
	  if (defending_major_powers > 0 && this.game.state.field_battle.faction_map[faction] === this.game.state.field_battle.defender_faction) {
	    for (let i = 0; i < defending_factions_hits.length; i++) {
  	      this.game.queue.push(`field_battle_manually_assign_hits\t${defending_factions[i]}\t${defending_factions_hits[i]}`);
	    }
	    return 1;
	  }

console.log("DEFENDING FACTIONS: " + defending_factions);
console.log("FM: " + JSON.stringify(this.game.state.field_battle.faction_map));
console.log("player: " + player + " -- " + this.game.player);

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
console.log("going into render field battle!");
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.assignHits(his_self.game.state.field_battle, faction);
	  } else {
console.log("else!");
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
	    his_self.updateStatus(this.returnFactionName(faction) + " Assigning Hits");
            his_self.field_battle_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

	  return 0;

	}





        if (mv[0] === "assault_assign_hits") {

	  //
	  // major powers may assign hits completely to minor allies, but they have
	  // to split hits, with a random roll used to determine who takes the extra
	  // hit ON DEFENSE. the active power assigns hits independently to any land
	  // units who attack.
	  //
	  let his_self = this;
	  let faction = mv[1];
	  let player = this.returnPlayerCommandingFaction(faction);
	  let space = this.game.spaces[this.game.state.assault.spacekey];

          this.game.queue.splice(qe, 1);

	  //
	  // we auto-assign the hits to independent, non-player controlled units
	  // this function handles that.
	  //
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;
	    let faction_map = his_self.game.state.assault.faction_map;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in faction_map) {
	      if (faction_map[f] === faction) {
	    	max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(f, space);
	      }
	    }

	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }

	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) {
		  if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0) {

		//
		// assign hits to allies
		//
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "mercenary"; }
		        if (zzz == 1) { cannon_fodder = "regular"; }
		        if (zzz == 2) { cannon_fodder = "cavalry"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {

			    //
			    // and remove from field battle unit
			    //
		            if (faction === his_self.game.state.assault_attacker_faction) {
			      for (let z = 0; z < his_self.game.state.assault.attacker_units.length; z++) {
			        let u = his_self.game.state.assault.attacker_units[z];
			        if (u.type === cannon_fodder) {
			          if (!his_self.game.state.assault.attacker_units_destroyed.includes(z)) {
			            his_self.game.state.assault.attacker_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }
		            if (faction === his_self.game.state.assault_defender_faction) {
			      for (let z = 0; z < his_self.game.state.assault.defender_units.length; z++) {
			        let u = his_self.game.state.assault.defender_units[z];
			        if (u.type === cannon_fodder) {
			          if (!his_self.game.state.assault.defender_units_destroyed.includes(z)) {
			            his_self.game.state.assault.defender_units_destroyed.push(z);
				    z = 100000;
				  }
			        }
			      }
			    }

		  	    space.units[f].splice(i, 1);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = 1000000;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

console.log("HOW MANY HITS TO ASSIGN: " + hits_to_assign);

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();

		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);

		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 3; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "mercenary"; }
                    if (zzz == 1) { cannon_fodder = "regular"; }
                    if (zzz == 2) { cannon_fodder = "cavalry"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {

			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " killed");
                        space.units[selected_faction].splice(ii, 1);
	  		his_self.game.state.assault.attacker_units_destroyed = [];
	  		his_self.game.state.assault.defender_units_destroyed = [];

                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction land unit next
		  //
		  targets.splice(selected_target-1, 1);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  } // end of assign_hits() <-- auto-assignment function

console.log("WHO IS IN CHARGE OF DEFENDER: " + player);

	  //
	  // auto-assign hits to independent entities
	  //
	  if (player == 0) {

	    if (faction === this.game.state.assault.attacker_faction) {
	      assign_hits(faction, this.game.state.assault.defender_hits);
	    } else {
	      assign_hits(faction, this.game.state.assault.attacker_hits);
	    }

            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
            his_self.assault_overlay.updateInstructions("Independent Hits Assigned");
	    his_self.assault_overlay.pullHudOverOverlay();

	    return 1;
	  }

	  //
	  // no hits assignment if no hits
	  //
	  //
	  if (faction === this.game.state.assault.attacker_faction) {
	    if (this.game.state.assault.defender_hits == 0) { return 1; }
	  } else {
	    if (this.game.state.assault.attacker_hits == 0) { return 1; }
	  }

console.log("we have made it this far!");

	  //
	  // if we hit this point we need manual intervention to assign the hits.
	  // the attacker can assign hits however they prefer if others join them
	  // in the attack, but if two major powers share defense then the hits
	  // are divided evenly among them.
	  //
          let hits_to_assign = this.game.state.assault.attacker_hits;
	  if (faction === this.game.state.assault.attacker_faction) {
            hits_to_assign = this.game.state.assault.defender_hits;
	  }

          let defending_factions = [];
          let defending_factions_count = 0;
          let defending_major_powers = 0;
          let defending_factions_hits = [];
	  let major_power = false;
	  for (let f in this.game.state.assault.faction_map) {
	    if (this.game.state.assault.faction_map[f] === faction) {
	      if (this.isMajorPower(f)) {
	        defending_factions.push(f);
                defending_factions_hits.push(0);
		major_power = true;
		defending_major_powers++;
	      } else {
	        defending_factions.push(f);
                defending_factions_hits.push(0);
	      }
	    }
	  }


console.log("we have made it this far 2!");
console.log("hta: " + hits_to_assign + " -- " + defending_factions_hits.length);
	  //
	  // every gets shared hits
	  //
	  if (defending_factions_hits.length > 0) {
	    while (major_power == true && hits_to_assign > defending_factions_hits.length) {
console.log("loop: " + hits_to_assign + " -- " + defending_factions_hits.length);
	      for (let i = 0; i < defending_factions_hits.length; i++) { defending_factions_hits[i]++; }
	      hits_to_assign -= defending_factions_hits.length;
	    }
	  }

console.log("we have made it this far 3!");
console.log("hta2: " + hits_to_assign + " -- " + defending_factions_hits.length);

	  //
	  // randomly assign remainder
	  //
	  let already_punished = [];
	  for (let i = 0; i < hits_to_assign; i++) {
	    let unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    while (already_punished.includes(unlucky_faction)) {
	      unlucky_faction = this.rollDice(defending_factions_hits.length)-1;
	    }
	    defending_factions_hits[unlucky_faction]++;
	    already_punished.push(unlucky_faction);
	  }

console.log("Defending Factions: "+ JSON.stringify(defending_factions));

console.log("we have made it this far 2!");
	  //
	  // defending major powers
	  //
//	  for (let i = 0; i < defending_factions_hits.length; i++) {
//  	    this.game.queue.push(`assault_manually_assign_hits\t${defending_factions[i]}\t${defending_factions_hits[i]}`);
//	  }
//	  return 1;

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
console.log("assign hits 1");
            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
console.log("assign hits to faction: " + faction);
            his_self.assault_overlay.assignHits(his_self.game.state.assault, faction);
	  } else {
console.log("assign hits 2");
            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
	    his_self.updateStatus(this.returnFactionName(faction) + " Assigning Hits");
            his_self.assault_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

console.log("assign hits 3");

	  return 0;

	}

        //
        // variant of above when major powers have to split hits assignments
        //
	if (mv[0] === "field_battle_manually_assign_hits") {

	  let his_self = this;
	  let faction = mv[1];
	  let hits = parseInt(mv[2]);
	  let player = this.returnPlayerOfFaction(faction);
	  let space = this.game.spaces[this.game.state.field_battle.spacekey];

          this.game.queue.splice(qe, 1);

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.assignHitsManually(his_self.game.state.field_battle, faction, hits);
	  } else {
            his_self.field_battle_overlay.renderFieldBattle(his_self.game.state.field_battle);
            his_self.field_battle_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

	  return 0;
        }

        //
        // variant of above when major powers have to split hits assignments
        //
	if (mv[0] === "assault_manually_assign_hits") {

	  let his_self = this;
	  let faction = mv[1];
	  let hits = parseInt(mv[2]);
	  let player = this.returnPlayerOfFaction(faction);
	  let space = this.game.spaces[this.game.state.assault.spacekey];

          this.game.queue.splice(qe, 1);

	  //
	  // otherwise assign hits directly
	  //
	  if (player == this.game.player) {
            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
            his_self.assault_overlay.assignHitsManually(his_self.game.state.assault, faction, hits);
	  } else {
            his_self.assault_overlay.renderAssault(his_self.game.state.assault);
            his_self.assault_overlay.updateInstructions(this.returnFactionName(faction) + " Assigning Hits");
	  }

	  return 0;
        }

        if (mv[0] === "assault_show_hits_render") {
          this.game.queue.splice(qe, 1);
          this.assault_overlay.render(his_self.game.state.assault);
          this.assault_overlay.pullHudOverOverlay();
          return 1;
        }
          

	if (mv[0] === "assault_assign_hits_render") {
          this.game.queue.splice(qe, 1);
          this.assault_overlay.pushHudUnderOverlay();
          this.assault_overlay.render(his_self.game.state.assault);
	  return 1;
	}

	if (mv[0] === "field_battle_assign_hits_render") {
          this.game.queue.splice(qe, 1);
          this.field_battle_overlay.render(his_self.game.state.field_battle);
	  return 1;
	}


 	if (mv[0] === "siege_destroy_unit") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_type = mv[3];

          this.game.queue.splice(qe, 1);

	  let space = this.game.spaces[spacekey];
	  let unit_destroyed = false;

	  for (let i = 0; i < space.units[faction].length && unit_destroyed == false; i++) {
	    if (space.units[faction][i].type === unit_type) {
	      if (this.game.state.assault.faction_map[faction] === this.game.state.assault.attacker_faction) {
		for (let z = 0; z < this.game.state.assault.attacker_units_units.length; z++) {
		  if (this.game.state.assault.attacker_units_units[z].type === space.units[faction][i].type) {
		    if (!this.game.state.assault.attacker_units_destroyed.includes(z)) {
		      this.game.state.assault.attacker_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      } else {
		for (let z = 0; z < this.game.state.assault.defender_units_units.length; z++) {
		  if (this.game.state.assault.defender_units_units[z].type === space.units[faction][i].type) {
		    if (!this.game.state.assault.defender_units_destroyed.includes(z)) {
		      this.game.state.assault.defender_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      }
	      space.units[faction].splice(i, 1);
	      unit_destroyed = true;
	    }
	  }

	  return 1;

	}

 	if (mv[0] === "field_battle_destroy_unit") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_type = mv[3];

          this.game.queue.splice(qe, 1);

	  let space = this.game.spaces[spacekey];
	  let unit_destroyed = false;

	  for (let i = 0; i < space.units[faction].length && unit_destroyed == false; i++) {
	    if (space.units[faction][i].type === unit_type) {
	      if (this.game.state.field_battle.faction_map[faction] === this.game.state.field_battle.attacker_faction) {
		for (let z = 0; z < this.game.state.field_battle.attacker_units.length; z++) {
		  if (this.game.state.field_battle.attacker_units[z] === space.units[faction][i].type) {
		    if (!this.game.state.field_battle.attacker_units_destroyed.includes(z)) {
		      this.game.state.field_battle.attacker_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      } else {
		for (let z = 0; z < this.game.state.field_battle.defender_units.length; z++) {
		  if (this.game.state.field_battle.defender_units[z].type === space.units[faction][i].type) {
		    if (!this.game.state.field_battle.defender_units_destroyed.includes(z)) {
		      this.game.state.field_battle.defender_units_destroyed.push(z);
		      z = 100000;
		    }
		  }
		}
	      }
	      space.units[faction].splice(i, 1);
	      unit_destroyed = true;
	    }
	  }

	  return 1;

	}


	if (mv[0] === "field_battle_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space = this.game.spaces[mv[1]];


	  //
	  // hits assignment happens here
	  //
	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.field_battle.attacker_modified_rolls));
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.field_battle.defender_modified_rolls));
	  his_self.updateLog("Attacker Hits: " + his_self.game.state.field_battle.attacker_hits);
	  his_self.updateLog("Defender Hits: " + his_self.game.state.field_battle.defender_hits);

	  this.field_battle_overlay.renderFieldBattle(this.game.state.field_battle);

	  //
	  // who won ?
	  //
	  let winner = his_self.game.state.field_battle.defender_faction;
	  if (his_self.game.state.field_battle.attacker_hits > his_self.game.state.field_battle.defender_hits) {
	    winner = his_self.game.state.field_battle.attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
          his_self.game.state.field_battle.attacker_land_units_remaining = his_self.game.state.field_battle.attacker_units.length - his_self.game.state.field_battle.defender_hits;
	  his_self.game.state.field_battle.defender_land_units_remaining = his_self.game.state.field_battle.defender_units.length - his_self.game.state.field_battle.attacker_hits;

	  if (his_self.game.state.field_battle.attacker_land_units_remaining == 0 && his_self.game.state.field_battle.defender_land_units_remaining == 0) {
	    if (his_self.game.state.field_battle.attacker_rolls > his_self.game.state.field_battle.defender_rolls) {
	      his_self.updateLog("Attacker adds 1 regular");
	      his_self.addRegular(his_self.game.state.field_battle.attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 regular");
	      his_self.addRegular(his_self.game.state.field_battle.defender_faction, space);
	    }
	  }

	  //
	  // capture stranded leaders
	  //
	  if (his_self.game.state.field_battle.attacker_land_units_remaining == 0) {
	    for (let f in his_self.game.state.field_battle.faction_map) {
	      if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(his_self.game.state.field_battle.defender_faction, his_self.game.state.field_battle.attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (his_self.game.state.field_battle.defender_land_units_remaining == 0) {
	    for (let f in his_self.game.state.field_battle.faction_map) {
	      if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(his_self.game.state.field_battle.attacker_faction, his_self.game.state.field_battle.defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

//	  this.updateLog("Winner: "+this.returnFactionName(winner));
//	  this.updateLog("Attacker Units Remaining: "+his_self.game.state.field_battle.attacker_land_units_remaining);
//	  this.updateLog("Defender Units Remaining: "+his_self.game.state.field_battle.efender_land_units_remaining);

          //
          // conduct retreats
          //
          if (winner === his_self.game.state.field_battle.defender_faction) {

	    this.game.queue.push("show_overlay\tfield_battle\tpost_field_battle_defenders_win");

            for (let f in his_self.game.state.field_battle.faction_map) {
              let can_faction_retreat = 0;
              if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.attacker_faction) {
                for (let z = 0; z < space.neighbours.length; z++) {
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], "");
                  if (fluis > 0) {
                    can_faction_retreat = 1;
                  }
                }
                if (can_faction_retreat == 1) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
                  this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+f+"\t"+space.key);
                }
	        if (can_faction_retreat == 0) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
	        }
              }
            }
          }
          if (winner === his_self.game.state.field_battle.attacker_faction) {

	    this.game.queue.push("show_overlay\tfield_battle\tpost_field_battle_attackers_win");

            for (let f in his_self.game.state.field_battle.faction_map) {
              let can_faction_retreat = 0;
              if (his_self.game.state.field_battle.faction_map[f] === his_self.game.state.field_battle.defender_faction) {
                for (let z = 0; z < space.neighbours.length; z++) {
                  let fluis = this.canFactionRetreatToSpace(f, space.neighbours[z], his_self.game.state.attacker_comes_from_this_spacekey);
                  if (fluis > 0) {
                    can_faction_retreat = 1;
                  }
                }
                if (can_faction_retreat == 1) {
                  this.game.queue.push("purge_units_and_capture_leaders\t"+f+"\t"+his_self.game.state.field_battle.attacker_faction+"\t"+space.key);
                  this.game.queue.push("post_field_battle_player_evaluate_retreat\t"+f+"\t"+space.key);
                }
              }
            }
            this.game.queue.push("post_field_battle_player_evaluate_fortification\t"+his_self.game.state.field_battle.attacker_faction+"\t"+his_self.returnPlayerOfFaction(his_self.game.state.field_battle.defender_faction)+"\t"+his_self.game.state.field_battle.defender_faction+"\t"+space.key);
          }

          //
          // redisplay
          //
          his_self.displaySpace(space.key);

	  //
	  // show field battle overlay
	  //
          his_self.field_battle_overlay.renderPostFieldBattle(his_self.game.state.field_battle);
          his_self.field_battle_overlay.pullHudOverOverlay();


          return 1;

        }


 	if (mv[0] === "destroy_unit_by_type") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_type = mv[3];

	  if (this.game.spaces[spacekey]) {
	    for (let i = 0; i < this.game.spaces[spacekey].units[faction].length; i++) {
	      if (this.game.spaces[spacekey].units[faction][i].type === unit_type) {
	        this.game.spaces[spacekey].units[faction].splice(i, 1);
		i = this.game.spaces[spacekey].units[faction].length + 10;
		break;
	      }
	    }
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);

          this.game.queue.splice(qe, 1);
	  return 1;

        }
 	if (mv[0] === "destroy_unit_by_index") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let unit_idx = parseInt(mv[3]);

console.log("spacekey: " + spacekey);

	  if (this.game.spaces[spacekey]) {
	    this.game.spaces[spacekey].units[faction].splice(unit_idx, 1);
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displaySpace(spacekey);

          this.game.queue.splice(qe, 1);
	  return 1;

	}

 	if (mv[0] === "destroy_units") {

          this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let units_to_destroy = JSON.parse(mv[3]);

	  let space;

	  if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }

	  units_to_destroy.sort();
	  if (units_to_destroy[0] < units_to_destroy[units_to_destroy.length-1]) {
	    units_to_destroy.reverse();
	  }

	  //
	  // remove from max to minimum to avoid index-out-of-array errors
	  //
	  for (let i = 0; i < units_to_destroy.length; i++) {
	    space.units[faction].splice(i, 1);
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displayBoard();

	  return 1;

	}




 	if (mv[0] === "destroy_naval_units") {

          this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let units_to_destroy = JSON.parse(mv[3]);

	  let space;

	  if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }
	  if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }

	  units_to_destroy.sort();
	  if (units_to_destroy[0] < units_to_destroy[units_to_destroy.length-1]) {
	    units_to_destroy.reverse();
	  }

	  //
	  // remove from max to minimum to avoid index-out-of-array errors
	  //
	  for (let i = 0; i < units_to_destroy.length; i++) {
	    space.units[faction].splice(i, 1);
	  }

	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
	  this.displayBoard();

	  return 1;

	}


	if (mv[0] === "naval_battle_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space;
	  if (this.game.spaces[mv[1]]) {
	    space = this.game.spaces[mv[1]];
	  }
	  if (this.game.navalspaces[mv[1]]) {
	    space = this.game.navalspaces[mv[1]];
	  }


	  //
	  // calculate hits
	  //
          let modify_rolls = function(player, roll_array) {
	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                }
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                }
              }
            }
	    return modified_rolls;
          }
          let calculate_hits = function(player, roll_array) {
            let hits = 0;
            for (let i = 0; i < roll_array.length; i++) {
              if (roll_array[i] >= 5) {
                hits++;
              }
            }
            return hits;
          }
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in faction_map) {
	      if (faction_map[f] === faction) {
	    	max_possible_hits_assignable += his_self.returnFactionSeaUnitsInSpace(f, space);
	      }
	    }

	    //
	    //
	    //
	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }


	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) {
		  if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0) {

		//
		// assign hits to allies
		//
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 2; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "corsair"; }
		        if (zzz == 1) { cannon_fodder = "squadron"; }

  	     	        for (let i = 0; i < space.units[f].length; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {
		  	    space.units[f].splice(i, 1);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = 1000000;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionSeaUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();

		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);

		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 2; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "corsair"; }
                    if (zzz == 1) { cannon_fodder = "squadron"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {
			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " sunk");
                        space.units[selected_faction].splice(ii, 1);
                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction sea units next
		  //
		  targets.splice(selected_target-1, 1);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }

	  let faction_map      = his_self.game.state.naval_battle.faction_map;
	  let attacker_faction = his_self.game.state.naval_battle.attacker_faction;
	  let defender_faction = his_self.game.state.naval_battle.defender_faction;
          let attacker_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	  let attacker_results = his_self.game.state.naval_battle.attacker_results;
	  let defender_results = his_self.game.state.naval_battle.defender_results;
	  let attacker_rolls   = his_self.game.state.naval_battle.attacker_rolls;
	  let defender_rolls   = his_self.game.state.naval_battle.defender_rolls;
	  let attacker_units   = his_self.game.state.naval_battle.attacker_units;
	  let defender_units   = his_self.game.state.naval_battle.defender_units;

	  let winner	       = defender_faction;
	  let attacker_hits    = 0;
	  let defender_hits    = 0;

	  //
	  // assign hits simultaneously
	  //
	  his_self.game.state.naval_battle.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	  his_self.game.state.naval_battle.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	  attacker_hits = calculate_hits(attacker_player, attacker_results);
	  defender_hits = calculate_hits(defender_player, defender_results);
	  assign_hits(defender_player, attacker_hits);
	  assign_hits(attacker_player, defender_hits);

	  his_self.game.state.naval_battle.attacker_hits = attacker_hits;
	  his_self.game.state.naval_battle.defender_hits = defender_hits;

	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.naval_battle.attacker_modified_rolls));
	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.naval_battle.defender_modified_rolls));
	  his_self.updateLog("Attacker Hits: " + attacker_hits);
	  his_self.updateLog("Defender Hits: " + defender_hits);

	  //
	  // who won?
	  //
	  if (attacker_hits > defender_hits) {
	    winner = attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
	  let attacker_sea_units_remaining = attacker_units - defender_hits;
	  let defender_sea_units_remaining = defender_units - attacker_hits;

          his_self.game.state.naval_battle.attacker_sea_units_remaining = attacker_sea_units_remaining;
          his_self.game.state.naval_battle.defender_sea_units_remaining = defender_sea_units_remaining;

	  if (attacker_sea_units_remaining <= 0 && defender_sea_units_remaining <= 0) {
	    if (attacker_rolls > defender_rolls) {
	      his_self.updateLog("Attacker adds 1 squadron");
	      his_self.addSquadron(attacker_faction, space);
	    } else {
	      his_self.updateLog("Defender adds 1 squadron");
	      his_self.addSquadron(defender_faction, space);
	    }
	  }


	  //
	  // capture stranded leaders
	  //
	  if (attacker_sea_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(defender_faction, attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (defender_sea_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(attacker_faction, defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

	  this.updateLog("Winner: "+this.returnFactionName(winner));

	  this.updateLog("Attacker Units Remaining: "+attacker_land_units_remaining);
	  this.updateLog("Defender Units Remaining: "+defender_land_units_remaining);

console.log(winner + " --- " + attacker_faction + " --- " + defender_faction);

          this.game.queue.push("purge_naval_units_and_capture_leaders\t"+f+"\t"+defender_faction+"\t"+space.key);

          //
          // conduct retreats
          //
	  if (this.game.spaces[space.key]) {

	    //
	    // attacker always retreats from ports
	    //
            this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+attacker_faction+"\t"+space.key);

	  } else {

	    //
	    // loser retreats on open seas
	    //
            if (winner === defender_faction) {
              this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+attacker_faction+"\t"+space.key);
	    } else {
              this.game.queue.push("player_evaluate_post_naval_battle_retreat\t"+defender_faction+"\t"+space.key);
	    }

	  }

          this.game.queue.push("naval_battle_hits_assignment\t"+defender_faction+"\t"+attacker_hits+"\t"+space.key);
          this.game.queue.push("naval_battle_hits_assignment\t"+attacker_faction+"\t"+defender_hits+"\t"+space.key);


          //
          // redisplay
          //
	  if (this.game.spaces[space.key]) {
            his_self.displaySpace(space.key);
	  } else {
            his_self.displayNavalSpace(space.key);
	  }

          return 1;

        }



	if (mv[0] === "assault") {

console.log("!");
console.log("!! assault !!");
console.log("!");

          this.game.queue.splice(qe, 1);
	  this.game.state.assault = {};

	  //
	  // calculate rolls
	  //
          let calculate_units = function(faction, space) {
	    let num = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].type != "cavalry" && space.units[faction][i].personage == false) { num++; }
	    }
	    return num;
          }

	  //
	  // calculate highest battle ranking
	  //
          let calculate_highest_battle_rating = function(faction) {
	    let highest_battle_rating = 0;
            for (let i = 0; i < space.units[faction].length; i++) {
	      if (space.units[faction][i].battle_rating > 0) {
	        if (space.units[faction][i].gout != true) {
	          if (highest_battle_rating < space.units[faction][i].battle_rating) {
		    highest_battle_rating = space.units[faction][i].battle_rating;
		  }
		}
	      }
	    }
	    return highest_battle_rating;
          }


	  //
	  // this is run when a field battle starts. players have by now
	  // interceded or played cards that allow them to respond to the
	  // movement, including retreat into a fortress if available. as
	  // such, this handles the conflict.
	  //
	  let his_self = this;
	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let space = this.game.spaces[mv[2]];
	  let stage = "assault";

	  //
	  // keep track of assaulted spaces
	  //
 	  this.game.state.spaces_assaulted_this_turn.push(spacekey);

	  //
	  // prevent from being assaulted again
	  //
          space.besieged == 2;

	  //
	  // otherwise -- who the hell is here?
	  //
	  // an ally of a major power can intercept and fight together, complicating
	  // how hits are assigned. so we need to know which factions are actually on
	  // which sides. additionally, formations can include units from allied minor
	  // powers.
	  //
	  let attacker_faction = attacker;
	  let defender_faction = his_self.returnDefenderFaction(attacker_faction, space);

 	  let attacker_player = his_self.returnPlayerOfFaction(attacker_faction);
 	  let defender_player = his_self.returnPlayerOfFaction(defender_faction);

	  //
	  // map every faction in space to attacker or defender
	  //
	  let attacking_factions = 0;
	  let defending_factions = 0;
	  let faction_map = this.returnFactionMap(space, attacker_faction, defender_faction);
          
	  //
	  // migrate any bonuses to attacker or defender
	  //
          for (let f in space.units) {
	    if (f !== attacker_faction && faction_map[f] === attacker_faction) {
	      let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker)-1];
	      let ap = his_self.game.state.players_info[attacker_player-1];
	      if (p.tmp_roll_first == 1) { ap.tmp_roll_first = 1; }
	      if (p.tmp_roll_bonus != 0) { ap.tmp_roll_bonus += p.tmp_roll_bonus; }
	      if (p.tmp_roll_modifiers.length > 0) {
		for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	          ap.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	        }
	      }
	    }
	    if (f !== defender_faction && faction_map[f] === attacker_faction) {
	      if (defender_player > 0) {
	        let p = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];
	        let dp = his_self.game.state.players_info[defender_player-1];
	        if (p.tmp_roll_first == 1) { dp.tmp_roll_first = 1; }
	        if (p.tmp_roll_bonus != 0) { dp.tmp_roll_bonus += p.tmp_roll_bonus; }
	        if (p.tmp_roll_modifiers.length > 0) {
	   	  for (let i = 0; i < p.tmp_roll_modifiers.length; i++) {
	            dp.tmp_roll_modifiers.push(p.tmp_roll_modifiers[i]);
	          }
	        }
	      }
	    }
          }

	  //
	  // we now have a mapping of all factions to the two main factions that
	  // will make any strategic decisions for hits assignment, etc. and any
	  // bonuses that affect combat will have been copied over to those players
	  //

	  //
	  // calculate the total rolls each faction gets to make. the defender starts
	  // with +1 roll bonus because they have control over the space.
	  //
	  let attacker_units = 0;
	  let defender_units = 0;
	  let attacker_rolls = 0;
	  let defender_rolls = 1;
          let attacker_units_units = [];
          let defender_units_units = [];
          let attacker_units_faction = [];
          let defender_units_faction = [defender_faction];
	  let attacker_highest_battle_rating = 0;
	  let defender_highest_battle_rating = 0;

	  for (let f in faction_map) {
	    if (faction_map[f] === attacker_faction) {
	      let x = his_self.returnFactionLandUnitsInSpace(f, space);
	      attacker_units += x;
	      for (let i = 0; i < space.units[f].length; i++) {
		if (space.units[f][i].type == "regular" || space.units[f][i].type == "mercenary" || space.units[f][i].type == "cavalry") {
		  attacker_units_units.push(space.units[f][i]);
	        }
	      }
	      for (let i = 0; i < x; i++) { attacker_units_faction.push(f); }
	      if (calculate_highest_battle_rating(f) > attacker_highest_battle_rating) {
		attacker_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	    if (faction_map[f] === defender_faction) {
	      let x = his_self.returnFactionLandUnitsInSpace(f, space);
	      defender_units += x;
	      for (let i = 0; i < space.units[f].length; i++) {
		if (space.units[f][i].type == "regular" || space.units[f][i].type == "mercenary" || space.units[f][i].type == "cavalry") {
		  defender_units_units.push(space.units[f][i]);
	        }
	      }
	      for (let i = 0; i < x; i++) { defender_units_faction.push(f); }
	      if (calculate_highest_battle_rating(f) > defender_highest_battle_rating) {
		defender_highest_battle_rating = calculate_highest_battle_rating(f);
	      }
	    }
	  }

	  //
	  // calculate how many rolls attacker and defener get in this situation
	  //
	  if (defender_units == 0) {
console.log("CALCULATING ATTACKER ROLLS: no defender units");
	    attacker_rolls = attacker_unit;
	    attacker_rolls += attacker_highest_battle_rating;
	    defender_rolls = 1 + defender_highest_battle_rating;
	  } else {
console.log("CALCULATING ATTACKER ROLLS: some defender units");
	    for (let i = 0; i < attacker_units; i++) {
	      if (i%2 === 0) { attacker_rolls++; }
	    }
	    attacker_rolls += attacker_highest_battle_rating;
	    defender_rolls = 1 + defender_units + defender_highest_battle_rating;
	  }

console.log("pre-bonus: " + attacker_rolls + " =-= " + defender_rolls);

	  if (attacker_player > 0) {
	    if (his_self.game.state.players_info[attacker_player-1].tmp_roll_bonus) {
	      attacker_rolls += parseInt(his_self.game.state.players_info[attacker_player-1].tmp_roll_bonus);
	    }
	  }
	  if (defender_player > 0) {
	    if (his_self.game.state.players_info[defender_player-1].tmp_roll_bonus) {
	      defender_rolls += parseInt(his_self.game.state.players_info[defender_player-1].tmp_roll_bonus);
	    }
	  }

	  //
	  // logic forks depending on if any of the players can "go first". in order to
	  // simplify our implementation we are going to roll the dice now and then apply
	  // the hits either simultaneously or in sequence so that we don't need to re-
	  // implement the above.
	  //
	  let attacker_results = [];
	  let defender_results = [];
	  let attacker_hits = 0;
	  let defender_hits = 0;

	  for (let i = 0; i < attacker_rolls; i++) {
	    let res = this.rollDice(6);
	    attacker_results.push(res);
	    if (res >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let res = this.rollDice(6);
	    defender_results.push(res);
	    if (res >= 5) { defender_hits++; }
	  }

	  //
	  // PRINT OUT INFO TO LOG
	  //
	  //this.updateLog("Attackers: " + attacker_rolls + " in total rolls");
	  //for (let i = 0; i < attacker_results.length; i++) {
	  //  this.updateLog(" ... rolls: " + attacker_results[i]);
          //}
	  //this.updateLog("Defenders: " + defender_rolls + " in total rolls");
	  //for (let i = 0; i < defender_results.length; i++) {
	  //  this.updateLog(" ... rolls: " + defender_results[i]);
          //}

	  //
	  // things get messy and conditional now, because Ottomans may play
	  // Janissaries and Suprise Attack may change the order in which players
	  // remove units (and hits!) in the resolution of the battle.
	  //
	  // we handle this by saving the "state" of the battle and pushing
	  // execution back to the game queue.
	  //

	  //
	  // save battle state
	  //
	  his_self.game.state.assault.attacker_units = attacker_units;
	  his_self.game.state.assault.defender_units = defender_units;
	  his_self.game.state.assault.attacker_units_units = attacker_units_units;
	  his_self.game.state.assault.defender_units_units = defender_units_units;
	  his_self.game.state.assault.attacker_units_faction = attacker_units_faction;
	  his_self.game.state.assault.defender_units_faction = defender_units_faction;
	  his_self.game.state.assault.attacker_rolls = attacker_rolls;
	  his_self.game.state.assault.defender_rolls = defender_rolls;
	  his_self.game.state.assault.attacker_results = attacker_results;
	  his_self.game.state.assault.defender_results = defender_results;
	  his_self.game.state.assault.attacker_faction = attacker_faction;
	  his_self.game.state.assault.defender_faction = defender_faction;
	  his_self.game.state.assault.faction_map = faction_map;
	  his_self.game.state.assault.spacekey = spacekey;
	  his_self.game.state.assault.attacker_player = attacker_player;
	  his_self.game.state.assault.defender_player = defender_player;
	  his_self.game.state.assault.attacker_modified_rolls = attacker_rolls;
	  his_self.game.state.assault.defender_modified_rolls = defender_rolls;
          his_self.game.state.assault.attacker_hits = attacker_hits;
          his_self.game.state.assault.defender_hits = defender_hits;
          his_self.game.state.assault.attacker_units_destroyed = [];
          his_self.game.state.assault.defender_units_destroyed = [];
          his_self.game.state.assault.attacker_hits_first = 0;
          his_self.game.state.assault.defender_hits_first = 0;
          
console.log("ASSAULT: " + JSON.stringify(his_self.game.state.assault));

	  his_self.game.queue.push(`assault_continue\t${mv[1]}\t${mv[2]}`);

          let ap = {};
          let dp = {};

          if (attacker_player > 0) { ap = this.game.state.players_info[attacker_player-1]; }
          if (defender_player > 0) { dp = this.game.state.players_info[defender_player-1]; }

          //
          // we stop here for intercession by cards that need to execute before the die rolls
	  // are assigned but after they have been rolled.
          //
          if (ap.tmp_roll_first == 1 && dp.tmp_roll_first != 1) {
            his_self.game.state.assault.attacker_hits_first = 1;
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.defender_faction);
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.attacker_faction);
          } else if (ap.tmp_roll_first != 1 && dp.tmp_roll_first == 1) {
            his_self.game.state.field_battle.defender_hits_first = 1;
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.attacker_faction);
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.defender_faction);
          } else {
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.attacker_faction);
            his_self.game.queue.push("assault_assign_hits\t"+his_self.game.state.assault.defender_faction);
          }

          //
          // this should stop execution while we are looking at the pre-field battle overlay
          //
          his_self.game.queue.push("assault_assign_hits_render");
          his_self.game.queue.push("counter_or_acknowledge\tAssault results in "+space.name + "\tpre_assault_hits_assignment");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
          his_self.game.queue.push("assault_show_hits_render");
          his_self.game.queue.push("counter_or_acknowledge\tAssault is about to begin in "+space.name + "\tpre_assault_hits_roll");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");

          his_self.assault_overlay.renderPreAssault(his_self.game.state.assault);
          his_self.assault_overlay.pullHudOverOverlay();

          return 1;

        }


	if (mv[0] === "assault_continue") {

          this.game.queue.splice(qe, 1);

	  let his_self = this;
	  let space = this.game.spaces[mv[2]];

	  //
	  // calculate hits
	  //
          let modify_rolls = function(player, roll_array) {

	    if (!player.tmp_roll_modifiers) {
	      return roll_array;
	    }

	    let modified_rolls = [];
            for (let i = 0; i < roll_array.length; i++) {
              if (player.tmp_roll_modifiers.length > i) {
                let modded_roll = roll_array[i] + player.tmp_roll_modifiers[i];
                if (modded_roll >= 5) {
                  modified_rolls.push(modded_roll);
                } else {
                  modified_rolls.push(modded_roll);
		}
              } else {
                if (roll_array[i] >= 5) {
                  modified_rolls.push(roll_array[i]);
                } else {
                  modified_rolls.push(roll_array[i]);
	        }
              }
            }
	    return modified_rolls;
          }
          let calculate_hits = function(player, roll_array) {
            let hits = 0;
            for (let i = 0; i < roll_array.length; i++) {
              if (roll_array[i] >= 5) {
                hits++;
              }
            }
            return hits;
          }
	  let assign_hits = function(faction, hits) {

	    //
	    // hits are spread out over units
	    //
	    let are_hits_all_assigned = 0;
	    let hits_to_assign = hits;
	    let max_possible_hits_assignable = 0;

	    //
	    // max hits to assign are the faction land units
	    //
	    for (let f in faction_map) {
	      if (faction_map[f] === faction) {
	    	max_possible_hits_assignable += his_self.returnFactionLandUnitsInSpace(f, space);
	      }
	    }

	    //
	    //
	    //
	    if (max_possible_hits_assignable < hits_to_assign) {
	      hits_to_assign = max_possible_hits_assignable;
	    }


	    while (are_hits_all_assigned == 0 && hits_to_assign > 0) {

	      //
	      // first we calculate starting faction targets
	      //
	      let number_of_targets = 0;
	      for (let f in faction_map) {
	        if (faction_map[f] === faction) {
		  if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		    number_of_targets++;
		  }
		}
	      }

	      while (hits_to_assign >= number_of_targets && hits_to_assign > 0 && number_of_targets > 0) {

	        for (let f in faction_map) {
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
	 	      for (let zzz = 0; zzz < 3; zzz++) {

		        let cannon_fodder = "";
		        if (zzz == 0) { cannon_fodder = "cavalry"; }
		        if (zzz == 1) { cannon_fodder = "mercenary"; }
		        if (zzz == 2) { cannon_fodder = "regular"; }

			let units_len = space.units[f].length;

  	     	        for (let i = 0; i < units_len; i++) {
	   	          if (space.units[f][i].type === cannon_fodder) {
		  	    space.units[f].splice(i, 1);
			    hits_to_assign--;
		            zzz = 1000000;
		            i   = units_len + 1;
			  }
			}
		      }
		    }
		  }
		}

	        //
	        // recalculate num targets
	        //
	        number_of_targets = 0;
	        for (let f in faction_map) {
	          if (faction_map[f] === faction) {
		    if (his_self.returnFactionLandUnitsInSpace(f, space) > 0) {
		      number_of_targets++;
		    }
		  }
	        }
	      }

	      //
	      // we now have fewer hits to assign than there are factions available
	      // to share the damage, so we pick randomly by rolling a dice.
	      //
	      while (hits_to_assign > 0) {

		let targets = [];
	        for (let f in faction_map) { targets.push(f); }
		targets.sort();

		for (let i = hits_to_assign; i > 0; i--) {
		  let selected_target = his_self.rollDice(targets.length);
		  let selected_faction = targets[selected_target-1];
		  his_self.updateLog("Random Target: " + selected_faction);

		  //
		  // again, survival of the fittest
		  //
		  for (let zzz = 0; zzz < 3; zzz++) {

                    let cannon_fodder = "";
                    if (zzz == 0) { cannon_fodder = "cavalry"; }
                    if (zzz == 1) { cannon_fodder = "mercenary"; }
                    if (zzz == 2) { cannon_fodder = "regular"; }

                    for (let ii = 0; ii < space.units[selected_faction].length; ii++) {
                      if (space.units[selected_faction][ii].type === cannon_fodder) {
			his_self.updateLog(this.returnFactionName(f) + " " + space.units[selected_faction][ii].name + " killed");
                        space.units[selected_faction].splice(ii, 1);
                        hits_to_assign--;
                        zzz = 1000000;
                        ii  = 1000000;
                      }
                    }
                  }

		  //
		  // remove other faction land unit next
		  //
		  targets.splice(selected_target-1, 0);
		}
	      }

	      are_hits_all_assigned = 1;

	    }
	  }

	  let faction_map      = his_self.game.state.assault.faction_map;
	  let attacker_faction = his_self.game.state.assault.attacker_faction;
	  let defender_faction = his_self.game.state.assault.defender_faction;
	  let ap = his_self.returnPlayerOfFaction(attacker_faction);
	  let dp = his_self.returnPlayerOfFaction(defender_faction);
	  let attacker_player = {};
	  let defender_player = {};
	  if (ap > 0) { attacker_player  = his_self.game.state.players_info[ap-1]; }
          if (dp > 0) { defender_player  = his_self.game.state.players_info[dp-1]; }
	  let attacker_results = his_self.game.state.assault.attacker_results;
	  let defender_results = his_self.game.state.assault.defender_results;
	  let attacker_rolls   = his_self.game.state.assault.attacker_rolls;
	  let defender_rolls   = his_self.game.state.assault.defender_rolls;
	  let attacker_units   = his_self.game.state.assault.attacker_units;
	  let defender_units   = his_self.game.state.assault.defender_units;


	  let winner	       = defender_faction;
	  let attacker_hits    = 0;
	  let defender_hits    = 0;

	  //
	  // attacker goes first
	  //
          if (attacker_player.tmp_rolls_first == 1 && defender_player.tmp_rolls_first != 1) {

	    //
 	    // assign attacker hits
	    //
	    his_self.game.state.assault.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	    attacker_hits = calculate_hits(attacker_player, his_self.game.state.assault.attacker_modified_rolls);
	    assign_hits(defender_player, attacker_hits);

	    for (let i = 0; i < attacker_hits; i++) {
	      if (defender_results.length > 0) {
		defender_rolls.splice(defender_rolls.length-1, 1);
		defender_results.splice(defender_rolls.length-1, 1);
	      }
	    }

	    //
	    // assign defender hits
	    //
	    his_self.game.state.assault.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    defender_hits = calculate_hits(defender_player, his_self.game.state.assault.defender_modified_rolls);
	    assign_hits(attacker_player, defender_hits);

	    his_self.game.state.assault.attacker_hits = attacker_hits;
	    his_self.game.state.assault.defender_hits = defender_hits;

          //
          // defender goes first
          //
          } else if (attacker_player.tmp_rolls_first != 1 && defender_player.tmp_rolls_first == 1) {

	    //
 	    // assign defender hits
	    //
	    his_self.game.state.assault.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    defender_hits = calculate_hits(defender_player, his_self.game.state.assault.defender_modified_rolls);
	    assign_hits(attacker_player, defender_hits);

	    for (let i = 0; i < defender_hits; i++) {
	      if (attacker_results.length > 0) {
		attacker_rolls.splice(attacker_rolls.length-1, 1);
		attacker_results.splice(attacker_rolls.length-1, 1);
	      }
	    }

	    //
	    // check if we can continue
	    //

	    //
	    // assign attacker hits
	    //
	    his_self.game.state.assault.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	    attacker_hits = calculate_hits(attacker_player, his_self.game.state.assault.attacker_modified_rolls);
	    assign_hits(defender_player, attacker_hits);

	    his_self.game.state.assault.attacker_hits = attacker_hits;
	    his_self.game.state.assault.defender_hits = defender_hits;

          } else {

	    //
	    // assign hits simultaneously
	    //
	    his_self.game.state.assault.attacker_modified_rolls = modify_rolls(attacker_player, attacker_results);
	    his_self.game.state.assault.defender_modified_rolls = modify_rolls(defender_player, defender_results);
	    attacker_hits = calculate_hits(attacker_player, attacker_results);
	    defender_hits = calculate_hits(defender_player, defender_results);
	    assign_hits(defender_player, attacker_hits);
	    assign_hits(attacker_player, defender_hits);
	    his_self.game.state.assault.attacker_hits = attacker_hits;
	    his_self.game.state.assault.defender_hits = defender_hits;

          }

//	  his_self.updateLog("Attacker UnModified: " + JSON.stringify(attacker_results));
//	  his_self.updateLog("Defender UnModified: " + JSON.stringify(defender_results));
//	  his_self.updateLog("Attacker Modified: " + JSON.stringify(his_self.game.state.assault.attacker_modified_rolls));
//	  his_self.updateLog("Defender Modified: " + JSON.stringify(his_self.game.state.assault.defender_modified_rolls));
//	  his_self.updateLog("Attacker Units: " + attacker_units);
//	  his_self.updateLog("Defender Units: " + defender_units);
//	  his_self.updateLog("Attacker Hits: " + attacker_hits);
//	  his_self.updateLog("Defender Hits: " + defender_hits);

	  //
	  // who won?
	  //
	  if (attacker_hits > defender_hits) {
	    winner = attacker_faction;
	  }

	  //
	  // calculate units remaining
	  //
	  let attacker_land_units_remaining = attacker_units - defender_hits;
	  let defender_land_units_remaining = defender_units - attacker_hits;

          his_self.game.state.assault.attacker_land_units_remaining = attacker_land_units_remaining;
          his_self.game.state.assault.defender_land_units_remaining = defender_land_units_remaining;

	  //
	  // attacker and defender both wiped out
	  //
	  if (attacker_land_units_remaining <= 0 && defender_land_units_remaining >= 0) {
	    space.besieged = false;
	    space.unrest = false;
	    //
	    // remove besieged
	    //
	    for (let key in space.units) {
	      for (let i = 0; i < space.units[key].length; i++) {
	        space.units[key][i].besieged = 0;
	      }
	    }
	    //
	    // updarte log
	    //
	    this.updateLog("Winner: "+this.returnFactionName(defender_faction));
	  }

	  //
	  // attacker does better than defender
	  //
	  if (attacker_land_units_remaining <= 0 && defender_land_units_remaining <= 0) {

	    //
	    // no-one survived, so just end siege
	    //
	    space.besieged = false;
	    space.unrest = false;

	    this.updateLog("Siege in " + this.returnSpaceName(space.key) + " ends");

	  }

	  //
	  // capture stranded leaders
	  //
	  if (attacker_land_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === attacker_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(defender_faction, attacker_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }
	  if (defender_land_units_remaining <= 0) {
	    for (let f in faction_map) {
	      if (faction_map[f] === defender_faction) {
	        for (let i = 0; i < space.units[f].length; i++) {
	          his_self.captureLeader(attacker_faction, defender_faction, mv[1], space.units[f][i]);
		  space.units[f].splice(i, 1);
		  i--;
		}
	      }
	    }
	  }

          //
          // conduct retreats
          //
          if (defender_land_units_remaining < attacker_land_units_remaining) {

	    //
	    // no land units remain
	    //
	    if (defender_land_units_remaining <= 0 && attacker_land_units_remaining > 0) {
	      space.besieged = 0;
	      space.unrest = 0;
	      this.controlSpace(attacker_faction, space.key);
	      this.updateLog(this.returnFactionName(attacker_faction) + " wins seige, controls " + this.returnSpaceName(space.key));

	      for (let key in space.units) {
	        for (let i = 0; i < space.units[key].length; i++) {
	          space.units[key][i].besieged = 0;
	        }
	      }
	    }

          } else {

            if (attacker_land_units_remaining == 0) {
	      space.besieged = 0;
	      space.unrest = 0;
	      this.updateLog(this.returnFactionName(defender_faction) + " breaks seige, controls " + this.returnSpaceName(space.key));
	    } else {
              his_self.game.queue.push("break_siege");
              his_self.game.queue.push("hide_overlay\tassault");
	    }
	  }

          //
          // redisplay
          //
	  his_self.refreshBoardUnits();
          his_self.displaySpace(space.key);

          return 1;

        }



	if (mv[0] === "purge_units_and_capture_leaders") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let winner = mv[2];
          let spacekey = mv[3];

	  let space = this.game.spaces[spacekey];

	  if (space.units[loser].length > 0) {
	    this.updateLog(this.returnFactionName(loser) + " eliminated in " + this.returnSpaceName(spacekey));
	  }

	  for (let i = 0; i < space.units[loser].length; i++) {
	    this.captureLeader(loser, winner, spacekey, space.units[f][i]);
	  }

	  space.units[loser] = [];

	  return 1;

	}


	if (mv[0] === "purge_naval_units_and_capture_leaders") {

console.log("purging naval units and capturing leader");

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let winner = mv[2];
          let spacekey = mv[3];

	  let space;
	  if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }
	  if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }

	  if (space.units[loser].length > 0) {
	    this.updateLog(this.returnFactionName(loser) + " eliminated in " + this.returnSpaceName(spacekey));
	  }

	  for (let i = 0; i < space.units[loser].length; i++) {
	    this.captureNavalLeader(loser, winner, spacekey, space.units[f][i]);
	  }

	  space.units[loser] = [];

	  return 1;

	}


        if (mv[0] === "player_evaluate_post_naval_battle_retreat") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let spacekey = mv[2];

          let faction_map = his_self.game.state.naval_battle.faction_map;
          let attacker_faction = his_self.game.state.naval_battle.attacker_faction;
          let defender_faction = his_self.game.state.naval_battle.defender_faction;
          let attacker_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1];
          let defender_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1];

          if (this.game.player == this.returnPlayerOfFaction(loser)) {
            this.playerEvaluateNavalRetreatOpportunity(loser, spacekey);
          } else {
            this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat at sea");
          }

          return 0;

        }


        if (mv[0] === "post_field_battle_player_evaluate_retreat") {

          this.game.queue.splice(qe, 1);

          let loser = mv[1];
          let spacekey = mv[2];

	  //
	  // auto-skip if loser cannot retreat because they have no land units
	  //
	  let loser_can_retreat = false;
	  for (let i = 0; i < this.game.spaces[spacekey].units[loser].length; i++) {
	    if (["regular", "mercentary", "calvary"].includes(this.game.spaces[spacekey].units[loser][i].type)) { loser_can_retreat = true; }
	  }
	  if (loser_can_retreat == false) { return 1; }

          let faction_map = his_self.game.state.field_battle.faction_map;
          let attacker_faction = his_self.game.state.field_battle.attacker_faction;
          let defender_faction = his_self.game.state.field_battle.defender_faction;
          let ap = his_self.returnPlayerOfFaction(attacker_faction);
          let dp = his_self.returnPlayerOfFaction(defender_faction);
	  let attacker_player = {};
	  let defender_player = {};
          if (ap > 0) { attacker_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(attacker_faction)-1]; }
	  if (dp > 0) { defender_player  = his_self.game.state.players_info[his_self.returnPlayerOfFaction(defender_faction)-1]; }
          let attacker_results = his_self.game.state.field_battle.attacker_results;
          let defender_results = his_self.game.state.field_battle.defender_results;
          let attacker_rolls   = his_self.game.state.field_battle.attacker_rolls;
          let defender_rolls   = his_self.game.state.field_battle.defender_rolls;
          let attacker_units   = his_self.game.state.field_battle.attacker_units;
          let defender_units   = his_self.game.state.field_battle.defender_units;
          let attacker_land_units_remaining = his_self.game.state.field_battle.attacker_land_units_remaining;
          let defender_land_units_remaining = his_self.game.state.field_battle.defender_land_units_remaining;

          //
          // fortification has already happened. if the loser is the attacker, they have to retreat
          //
          if (this.game.player == this.returnPlayerOfFaction(loser)) {
	    let is_attacker_loser = false;
	    if (loser === attacker_faction) { is_attacker_loser = true; }
            this.playerEvaluateRetreatOpportunity(attacker_faction, spacekey, this.game.state.attacker_comes_from_this_spacekey, defender_faction, is_attacker_loser);
          } else {
            this.updateStatus(this.returnFactionName(loser) + " considering post-battle retreat");
          }

          return 0;

        }



        if (mv[0] === "found_jesuit_university") {

	  let spacekey = mv[1];

	  this.game.queue.splice(qe, 1);

	  this.updateLog("Jesuit University founded in " + this.game.spaces[spacekey].name);
	  this.game.spaces[spacekey].university = 1;

	  return 1;

	}



	if (mv[0] === "pick_second_round_debaters") {

	  let attacker = this.game.state.theological_debate.attacker;
	  let defender = this.game.state.theological_debate.defender;
	  let committed = this.game.state.theological_debate.committed;
	  this.game.state.theological_debate.round++;

	  let x = 0;

	  //
	  // attacker chosen randomly from uncommitted
	  //
          let ad = 0;
          let cd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].owner == attacker) {
	      if (this.game.state.debaters[i].committed == 0) {
	        ad++;
	      } else {
	        cd++;
	      }
	    }
	  }

	  //
	  // defender chosen randomly from type committed / uncommitted
	  //
	  let dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	        dd++;
	      }
	    } else {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed != 1) {
	        dd++;
	      }
	    }
	  }

	  x = this.rollDice(dd) - 1;
	  dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	        if (x === dd) {
		  this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
	          this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
		}
	        dd++;
	      }
	    } else {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
	        if (x === dd) {
		  this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
		  this.game.state.theological_debate.defender_debater_bonus++;
	          this.game.state.theological_debate.defender_debater_entered_uncommitted = 1;
		}
	        dd++;
	      }
	    }
	  }

	  //
	  // attacker chosen from uncommitted
	  //
	  let tad = 0;
	  if (ad != 0) {
	    x = this.rollDice(ad) - 1;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 0) {
	        if (x === tad) {
		  this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	          this.game.state.theological_debate.attacker_debater_entered_uncommitted = 1;
		}
	        tad++;
	      }
	    }
	  } else {
	    x = this.rollDice(cd) - 1;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 1) {
	        if (x === tad) {
		  this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	          this.game.state.theological_debate.attacker_debater_entered_uncommitted = 0;
		}
	        tad++;
	      }
	    }
	  }

          this.game.state.theological_debate.round2_attacker_debater = this.game.state.theological_debate.attacker_debater;
          this.game.state.theological_debate.round2_defender_debater = this.game.state.theological_debate.defender_debater;

	  //
	  //
	  //
	  this.displayTheologicalDebate(this.game.state.theological_debate);
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "pick_first_round_debaters") {

	  let attacker = mv[1];
	  let defender = mv[2];
	  let language_zone = mv[3];
	  let committed = mv[4];
	  if (parseInt(mv[4]) == 1) { committed = "committed"; } else { committed = "uncommitted"; }
	  let selected_papal_debater = "";
	  if (mv[5]) { selected_papal_debater = mv[5]; }
	  let prohibited_protestant_debater = "";
	  if (mv[6]) { prohibited_protestant_debater = mv[6]; }

	  this.game.state.theological_debate = {};
	  this.game.state.theological_debate.attacker_rolls = 0;
	  this.game.state.theological_debate.defender_rolls = 0;
	  this.game.state.theological_debate.adice = [];
	  this.game.state.theological_debate.ddice = [];
	  this.game.state.theological_debate.attacker = mv[1];
	  this.game.state.theological_debate.defender = mv[2];
	  this.game.state.theological_debate.language_zone = mv[3];
	  this.game.state.theological_debate.committed = committed;
	  this.game.state.theological_debate.round = 1;
	  this.game.state.theological_debate.round1_attacker_debater = "";
	  this.game.state.theological_debate.round1_defender_debater = "";
	  this.game.state.theological_debate.round2_attacker_debater = "";
	  this.game.state.theological_debate.round2_defender_debater = "";
	  this.game.state.theological_debate.attacker_debater = "";
	  this.game.state.theological_debate.defender_debater = "";
	  this.game.state.theological_debate.attacker_debater_entered_uncommitted = 0;
	  this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
	  this.game.state.theological_debate.attacker_debater_power = 0;
	  this.game.state.theological_debate.defender_debater_power = 0;
	  this.game.state.theological_debate.attacker_debater_bonus = 3;
	  this.game.state.theological_debate.defender_debater_bonus = 1;
	  this.game.state.theological_debate.selected_papal_debater = "";
	  this.game.state.theological_debate.prohibited_protestant_debater = "";
	  this.game.state.theological_debate.attacker_faction = attacker;
	  this.game.state.theological_debate.defender_faction = defender;

	  let x = 0;

	  //
	  // Henry Petitions for Divorce pre-selects 
	  //
	  if (this.game.state.events.henry_petitions_for_divorce_grant == 1) {
	    selected_papal_debater = "campeggio-debater";
	  }

	  //
	  // attacker picks debater at random from uncommitted
	  //
	  if (selected_papal_debater != "") {
	    this.game.state.theological_debate.attacker_debater = selected_papal_debater;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (selected_papal_debater == this.game.state.debaters[i].type) {
  	        this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
		if (!this.game.state.debaters[i].committed) {
	          this.game.state.theological_debate.attacker_debater_entered_uncommitted = 1;
		}
	      }
	    }
	  } else {
            let ad = 0;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker) {
	        if (this.game.state.debaters[i].committed == 0) {
	          ad++;
	        }
	      }
	    }
	     x = this.rollDice(ad) - 1;
	    ad = 0;
	    for (let i = 0; i < this.game.state.debaters.length; i++) {
	      if (this.game.state.debaters[i].owner == attacker && this.game.state.debaters[i].committed == 0) {
	        if (x === ad) {
	  	  this.game.state.theological_debate.attacker_debater = this.game.state.debaters[i].type;
		  this.game.state.theological_debate.attacker_debater_power = this.game.state.debaters[i].power;
	          this.game.state.theological_debate.attacker_debater_entered_uncommitted = 1;
	        }
	        ad++;
	      }
	    }
	  }


	  //
	  // defender chosen randomly from type committed / uncommitted
	  //
	  let dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type !== prohibited_protestant_debater) {
	    if (this.game.state.theological_debate.committed == "committed") {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	        dd++;
	      }
	    } else {
	      if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed != 1) {
	        dd++;
	      }
	    }
	    }
	  }

	  x = this.rollDice(dd) - 1;

	  dd = 0;
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type !== prohibited_protestant_debater) {
	      if (this.game.state.theological_debate.committed == "committed") {
	        if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 1) {
	          if (x === dd) {
		    this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		    this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
	            this.game.state.theological_debate.defender_debater_entered_uncommitted = 0;

	          }
	          dd++;
	        }
	      } else {
	        if (this.game.state.debaters[i].owner == defender && this.game.state.debaters[i].committed == 0) {
	          if (x === dd) {
		    this.game.state.theological_debate.defender_debater = this.game.state.debaters[i].type;
		    this.game.state.theological_debate.defender_debater_power = this.game.state.debaters[i].power;
	            this.game.state.theological_debate.defender_debater_entered_uncommitted = 1;
	            this.game.state.theological_debate.defender_debater_bonus++;
		  }
	          dd++;
	        }
	      }
	    }
	  }

          this.game.state.theological_debate.round1_attacker_debater = this.game.state.theological_debate.attacker_debater;
          this.game.state.theological_debate.round1_defender_debater = this.game.state.theological_debate.defender_debater;

	  //
	  // and show it...
	  //
	  this.displayTheologicalDebate(this.game.state.theological_debate);
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);


	  this.game.queue.splice(qe, 1);

	  return 1;

	}


        if (mv[0] === "commit") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let debater = mv[2];
	  let activate_it = 0;

	  this.updateLog(this.returnFactionName(faction) + " commits " + this.popup(debater));

	  if (parseInt(mv[3]) > 0) { activate_it = parseInt(mv[3]); }
	  this.commitDebater(faction, debater, activate_it);

	  return 1;

        }

	if (mv[0] === "player_call_theological_debate") {
	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerCallTheologicalDebate(this, player, faction);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " calling theological debater");
	  }
	  return 0;
	}
        if (mv[0] === "theological_debate") {

	  let attacker = this.game.state.theological_debate.attacker;
	  let defender = this.game.state.theological_debate.defender;
	  let language_zone = this.game.state.theological_debate.language_zone;
	  let committed = this.game.state.theological_debate.committed;
	  let attacker_idx = 0;
	  let defender_idx = 0;
	  let was_defender_uncommitted = 0;

	  this.game.queue.splice(qe, 1);

	  //
	  // commit attacker if uncommitted
	  //
	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.attacker_debater) {
	      attacker_idx = i;
	      if (!this.isCommitted(this.game.state.theological_debate.attacker_debater)) {
		this.commitDebater(this.game.state.theological_debate.attacker, this.game.state.theological_debate.attacker_debater, 0);
	      }
	    }
	  }

	  //
	  // defender power and bonus check is complicated because of Here I Stand
	  //
	  let defender_debater_power = 1;
	  let defender_debater_bonus = 0;

	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.defender_debater) {
	      defender_idx = i;
	      defender_debater_power = this.game.state.debaters[defender_idx].power;
	      if (!this.isCommitted(this.game.state.theological_debate.defender_debater)) {
	        was_defender_uncommitted = 1;
		this.commitDebater(this.game.state.theological_debate.defender, this.game.state.theological_debate.defender_debater, 0);
	      }
	    }
	  }
	  for (let i = 0; i < this.game.state.excommunicated.length; i++) {
	    if (this.game.state.excommunicated[i].debater) {
	      if (this.game.state.excommunicated[i].debater.type === this.game.state.theological_debate.defender_debater) {
	        defender_debater_power = this.game.state.excommunicated[i].debater.power;
	        if (this.game.state.excommunicated[i].debater.committed == 0) {
	          was_defender_uncommitted = 1;
	  	  this.game.state.excommunicated[i].debater.committed = 1;
	        }
	      }
	    }
	  }


	  let attacker_debater_power = 1;
	  let attacker_debater_bonus = 3;

	  for (let i = 0; i < this.game.state.debaters.length; i++) {
	    if (this.game.state.debaters[i].type === this.game.state.theological_debate.attacker_debater) {
	      attacker_idx = i;
	      attacker_debater_power = this.game.state.debaters[attacker_idx].power;
	      if (this.game.state.debaters[i].committed == 0) {
		this.commitDebater(this.game.state.theological_debate.attacker, this.game.state.theological_debate.attacker_debater, 0);
	      }
	    }
	  }
	  for (let i = 0; i < this.game.state.excommunicated.length; i++) {
	    if (this.game.state.excommunicated[i].debater) {
	      if (this.game.state.excommunicated[i].debater.type === this.game.state.theological_debate.attacker_debater) {
	        attacker_debater_power = this.game.state.excommunicated[i].debater.power;
	        if (this.game.state.excommunicated[i].debater.committed == 0) {
	  	  this.game.state.excommunicated[i].debater.committed = 1;
	        }
	      }
	    }
	  }

	  //
	  // even Luther gets 3 if invoked w/ Here I Stand as attacker
	  //
	  let attacker_rolls = attacker_debater_power + 3;
	  //
	  // defender_debater_power handled above - Luther because may be excommunicated
	  //
	  defender_debater_bonus = 1 + was_defender_uncommitted;
	  let defender_rolls = defender_debater_power + 1 + was_defender_uncommitted;

	  //
	  // papal inquisition
	  //
	  if (attacker === "papacy" && this.game.state.events.papal_inquisition_debate_bonus == 1) {
	    attacker_rolls += 2;
	  }

	  //
	  // eck-debator bonus
	  //
	  if (attacker === "papacy" && this.game.state.theological_debate.attacker_debater === "eck-debater" && this.game.state.theological_debate.attacker_debater_entered_uncommitted == 1) {
	    attacker_rolls++;
	  }

	  //
	  // gardiner-debater bonus
	  //
	  if (attacker === "papacy" && this.game.state.theological_debate.attacker_debater === "gardiner-debater" && this.game.state.theological_debate.language_zone === "english" && this.game.state.theological_debate.defender_debater_entered_uncommitted == 1) {
	    attacker_rolls++;
	  }

	  //
	  // augsburg confession
	  //
	  if (attacker === "papacy" && this.game.state.events.augsburg_confession == true) {
	    attacker_rolls--;
	  }

	  let attacker_hits = 0;
	  let defender_hits = 0;
	  let adice = [];
	  let ddice = [];

	  for (let i = 0; i < attacker_rolls; i++) {
	    let x = this.rollDice(6);
	    adice.push(x);
	    if (x >= 5) { attacker_hits++; }
	  }
	  for (let i = 0; i < defender_rolls; i++) {
	    let x = this.rollDice(6);
	    ddice.push(x);
	    if (x >= 5) { defender_hits++; }
	  }
this.updateLog(this.popup(this.game.state.theological_debate.attacker_debater) + " vs " + this.popup(this.game.state.theological_debate.defender_debater) + ` [${attacker_hits}/${defender_hits}]`);

	  //
	  //
	  //
	  this.game.state.theological_debate.attacker_rolls = attacker_rolls;
	  this.game.state.theological_debate.defender_rolls = defender_rolls;
	  this.game.state.theological_debate.adice = adice;
	  this.game.state.theological_debate.ddice = ddice;
	  this.game.state.theological_debate.attacker_debater_power = attacker_debater_power;
	  this.game.state.theological_debate.defender_debater_power = defender_debater_power;
	  this.game.state.theological_debate.attacker_debater_bonus = attacker_debater_bonus;
	  this.game.state.theological_debate.defender_debater_bonus = defender_debater_bonus;

	  if (attacker_hits == defender_hits) {
	    this.game.state.theological_debate.status = "Inconclusive - Second Round";
	  } else {
	    if (attacker_hits > defender_hits) {
	      this.game.state.theological_debate.status = this.returnFactionName(this.game.state.theological_debate.attacker_faction) + " Wins";
	    } else {
	      this.game.state.theological_debate.status = this.returnFactionName(this.game.state.theological_debate.defender_faction) + " Wins";
	    }
	  }

	  //
	  // open theological debate UI
	  //
	  this.displayTheologicalDebate(this.game.state.theological_debate);
	  this.displayTheologicalDebater(this.game.state.theological_debate.attacker_debater, true);
	  this.displayTheologicalDebater(this.game.state.theological_debate.defender_debater, false);

	  if (attacker_hits == defender_hits) {

	    //
	    // first round of debate moves into second
	    //
	    this.game.state.theological_debate.round++;
	    if (this.game.state.theological_debate.round > 2) {

	      this.game.queue.push("counter_or_acknowledge\tTie - Debate Ends Inconclusively");
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");

	    } else {

	      this.game.queue.push("theological_debate");
	      this.game.queue.push("counter_or_acknowledge\tTheological Debate: 2nd Round\tdebate");
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate_and_debaters");
	      this.game.queue.push("pick_second_round_debaters");
	      this.game.queue.push("counter_or_acknowledge\tThe Debate is Tied - Progress to 2nd Round");
              this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");

	    }

	  } else {

	    let bonus_conversions = 0;

	    //
	    // if aleander is in play, flip extra space
	    //
	    if ((this.game.state.theological_debate.attacker_debater === "aleander-debater" && this.game.state.theological_debate.attacker_debater_entered_uncommitted == 1) || (this.game.state.theological_debate.defender_debater === "aleander-debater")) {
	      this.updateLog(this.popup("aleander-debater") + " bonus: +1 conversion");
	      bonus_conversions = 1;
	    }

	    if (attacker_hits > defender_hits) {

	      let total_spaces_to_convert = attacker_hits - defender_hits;
	      let unaltered_total_spaces_to_convert = total_spaces_to_convert;
attacker_hits - defender_hits;
	      let total_spaces_overall = this.returnNumberOfProtestantSpacesInLanguageZone();
	      if (total_spaces_to_convert > total_spaces_overall) { total_spaces_to_convert = total_spaces_overall; }
	      let total_spaces_in_zone = this.returnNumberOfProtestantSpacesInLanguageZone(language_zone);
	      if (defender === "papacy") { total_spaces_in_zone = this.returnNumberOfCatholicSpacesInLanguageZone(language_zone); }

	      //
	      // if campeggio is the debater, we have 1/3 chance of ignoring result
	      //

	      if (this.game.state.theological_debate.defender_debater === "campeggio-debater" && this.game.state.theological_debate.defender_debater_entered_uncommitted == 1) {
		let roll = this.rollDice(6);
	        if (roll >= 5) {
	          this.updateLog(this.popup("campeggio-debater") + " rolls: " + roll + " debate loss discarded");
		  total_spaces_to_convert = 0;
		  bonus_conversions = 0;
	        } else {
	          this.updateLog(this.popup("campeggio-debater") + " rolls: " + roll + " debate loss sustained");
	 	}
	      }

	      if ((bonus_conversions+total_spaces_to_convert) == 1) {
	        this.updateLog(this.returnFactionName(this.game.state.theological_debate.attacker_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Space`);
	      } else {
	        this.updateLog(this.returnFactionName(this.game.state.theological_debate.attacker_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Spaces`);
	      }


	      //
	      // reduce number of convertible spaces to total available to convert
	      //
	      let flip_this_number = total_spaces_to_convert + bonus_conversions;
	      if (this.game.state.theological_debate.attacker_faction == "papacy" && this.returnNumberOfProtestantSpacesInLanguageZone() < flip_this_number) {
	        this.updateLog("Protestants only have " + this.returnNumberOfProtestantSpacesInLanguageZone() + " spaces to flip");
	        flip_this_number = this.returnNumberOfProtestantSpacesInLanguageZone();
	      }


	      //
	      // attacker has more hits, is defender burned?
	      //
	      if (unaltered_total_spaces_to_convert > this.game.state.theological_debate.defender_debater_power) {
		if (this.game.state.theological_debate.defender_faction === "protestant") {
		  this.burnDebater(this.game.state.theological_debate.defender_debater);
		} else {
		  this.disgraceDebater(this.game.state.theological_debate.defender_debater);
		}
	      }

	      this.game.queue.push("hide_overlay\tzoom\t"+language_zone);

	      for (let i = flip_this_number; i >= 1; i--) {
	        if (i > (total_spaces_in_zone+bonus_conversions)) {
		  if (attacker === "papacy") {
		    this.game.queue.push("select_for_catholic_conversion\tpapacy");
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant");
		  }
		} else {
		  if (attacker === "papacy") {
  		    this.game.queue.push("select_for_catholic_conversion\tpapacy\t"+language_zone);
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant\t"+language_zone);
		  }
		}
	      }
	      //
	      this.game.queue.push("show_overlay\tzoom\t"+language_zone);
	      this.game.queue.push("hide_overlay\ttheological_debate");
	      if ((total_spaces_to_convert+bonus_conversions) == 1) {
		this.game.queue.push("counter_or_acknowledge\t"+this.returnFactionName(this.game.state.theological_debate.attacker_faction) + ` Wins - Convert ${(total_spaces_to_convert+bonus_conversions)} Space`);
	      } else { 
	        this.game.queue.push("counter_or_acknowledge\t"+this.returnFactionName(this.game.state.theological_debate.attacker_faction) + ` Wins - Convert ${(total_spaces_to_convert+bonus_conversions)} Spaces`);
              }
	      this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");

	    //
	    // defender has more hits than attacker
	    //
	    } else {

	      let total_spaces_to_convert = defender_hits - attacker_hits;
	      let unaltered_total_spaces_to_convert = total_spaces_to_convert;
defender_hits - attacker_hits;
	      let total_spaces_overall = this.returnNumberOfProtestantSpacesInLanguageZone();
	      if (total_spaces_to_convert > total_spaces_overall) { total_spaces_to_convert = total_spaces_overall; }
	      let total_spaces_in_zone = this.returnNumberOfProtestantSpacesInLanguageZone(language_zone);
	      if (attacker === "papacy") { total_spaces_in_zone = this.returnNumberOfCatholicSpacesInLanguageZone(language_zone); }

	      //
	      // if campeggio is the debater, we have 1/3 chance of ignoring result
	      //
	      if (this.game.state.theological_debate.attacker_debater === "campeggio-debater" && this.game.state.theological_debate.attacker_debater_entered_uncommitted == 1) {
		let roll = this.rollDice(6);
	        if (roll >= 5) {
	          this.updateLog("Campeggio rolls: " + roll + " debate loss discarded");
		  total_spaces_to_convert = 0;
		  bonus_conversions = 0;
	        } else {
	          this.updateLog("Campeggio rolls: " + roll + " debate loss sustained");
	 	}
	      }


	      if ((total_spaces_to_convert+bonus_conversions) == 1) {
	        this.updateLog(this.returnFactionName(this.game.state.theological_debate.defender_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Space`);
	      } else {
	        this.updateLog(this.returnFactionName(this.game.state.theological_debate.defender_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Spaces`);
	      }

	      //
	      // reduce number of convertible spaces to total available to convert
	      //
	      let flip_this_number = total_spaces_to_convert + bonus_conversions;

	      if (this.game.state.theological_debate.defender_faction == "papacy" && this.returnNumberOfProtestantSpacesInLanguageZone() < flip_this_number) {
	        this.updateLog("Protestants only have " + this.returnNumberOfProtestantSpacesInLanguageZone() + " spaces to flip");
	        flip_this_number = this.returnNumberOfProtestantSpacesInLanguageZone();
	      }

	      //
	      // defender has more hits, is attacker burned?
	      //
	      if (unaltered_total_spaces_to_convert > this.game.state.theological_debate.attacker_debater_power) {
	        if (this.game.state.theological_debate.attacker_faction === "papacy") {
		  this.burnDebater(this.game.state.theological_debate.attacker_debater);
	 	} else {
		  this.disgraceDebater(this.game.state.theological_debate.attacker_debater);
		}
	      }

	      this.game.queue.push("hide_overlay\tzoom\t"+language_zone);

	      for (let i = flip_this_number; i >= 1; i--) {
	        if (i > total_spaces_in_zone) {
		  if (defender === "papacy") {
		    this.game.queue.push("select_for_catholic_conversion\tpapacy");
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant");
		  }
		} else {
		  if (defender === "papacy") {
		    this.game.queue.push("select_for_catholic_conversion\tpapacy\t"+language_zone);
		  } else {
		    this.game.queue.push("select_for_protestant_conversion\tprotestant\t"+language_zone);
		  }
		}
	      }
	      this.game.queue.push("show_overlay\tzoom\t"+language_zone);
	      this.game.queue.push("hide_overlay\ttheological_debate");
	      if ((total_spaces_to_convert+bonus_conversions) == 1) { 
		this.game.queue.push("counter_or_acknowledge\t"+this.returnFactionName(this.game.state.theological_debate.defender_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Space`);
	      } else {
		this.game.queue.push("counter_or_acknowledge\t"+this.returnFactionName(this.game.state.theological_debate.defender_faction) + ` Wins - Convert ${total_spaces_to_convert+bonus_conversions} Spaces`);
              }
	      this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	      this.game.queue.push("show_overlay\ttheological_debate");
	    }
	  }

	  return 1;

	}



        if (mv[0] === "translation") {

	  let zone = mv[1];
	  let ops = 1;
	  if (mv[2]) { if (parseInt(mv[2]) > ops) { ops = parseInt(mv[2]); } }
          let player = this.returnPlayerOfFaction("protestant");

	  this.game.queue.splice(qe, 1);

	  for (let z = 0; z < ops; z++) {
	    if (zone === "german") {
	      if (this.game.state.translations['new']['german'] >= 6) {
	        this.updateLog("Protestants translate Old Testament (german)");
	        this.game.state.translations['full']['german']++;
		if (this.game.state.translations['full']['german'] == 10) {
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.state.german_bible_translation_bonus = 1;
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
		}
  	      } else {
	        this.updateLog("Protestants translate New Testament (german)");
	        this.game.state.translations['new']['german']++;
		if (this.game.state.translations['new']['german'] == 6) {
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
		}
	      }
	    }
	    if (zone === "french") {
	      if (this.game.state.translations['new']['french'] >= 6) {
	        this.updateLog("Protestants translate Old Testament (french)");
	        this.game.state.translations['full']['french']++;
		if (this.game.state.translations['full']['french'] == 10) {
		  // protestant gets 1 roll bonus at start
	          his_self.game.state.french_bible_translation_bonus = 1;
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
		}
	      } else {
	        this.updateLog("Protestants translate New Testament (french)");
	        this.game.state.translations['new']['french']++;
		if (this.game.state.translations['full']['french'] == 6) {
		  // protestant gets 1 roll bonus at start
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tfrench");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
		}
	      }
	    }
	    if (zone === "english") {
	      if (this.game.state.translations['new']['english'] >= 6) {
	        this.updateLog("Protestants translate Old Testament (english)");
	        this.game.state.translations['full']['english']++;
		if (this.game.state.translations['full']['english'] == 10) {
		  // protestant gets 1 roll bonus at start
	          his_self.game.state.english_bible_translation_bonus = 1;
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
		}
	      } else {
	        this.updateLog("Protestants translate New Testament (english)");
	        this.game.state.translations['new']['english']++;
		if (this.game.state.translations['full']['english'] == 6) {
		  // protestant gets 1 roll bonus at start
        	  his_self.game.queue.push("hide_overlay\ttheses");
	          his_self.game.queue.push("remove_translation_bonus");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("protestant_reformation\t"+player+"\tenglish");
        	  his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
		}
	      }
	    }
	  }

	  his_self.faction_overlay.render("protestant");

	  return 1;
        }


	if (mv[0] === "build_saint_peters_with_cp") {

	  let ops = parseInt(mv[1]);

	  this.game.queue.splice(qe, 1);

          for (let i = 0; i < ops; i++) {
            his_self.game.queue.push("build_saint_peters");
          }

	  return 1;

	}

        if (mv[0] === "build_saint_peters") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.state.saint_peters_cathedral['vp'] < 5) {
	    this.updateLog("Papacy builds St. Peter's Basilica");
	    this.game.state.saint_peters_cathedral['state'] += 1;
	    if (this.game.state.saint_peters_cathedral['state'] >= 5) {
	      this.game.state.saint_peters_cathedral['state'] = 0;
	      this.updateLog(this.returnFactionName("papacy") + " +1 VP from St. Peter's Basilica");
	      this.game.state.saint_peters_cathedral['vp'] += 1;
	    }
	  }

	  his_self.faction_overlay.render("papacy");

	  return 1;

	}

        if (mv[0] === "victory_determination_phase") {


	  this.game.queue.splice(qe, 1);

	  let f = this.calculateVictoryPoints();

/****
//          faction : this.game.state.players_info[i].factions[ii] ,
//          vp : 0 ,
//          keys : 0 ,
//          religious : 0 ,
//          victory : 0,
//          details : "",
****/

	  for (let faction in f) {
	    if (f.victory == 1) {
	      let player = this.returnPlayerOfFaction(faction);
	      this.sendGameOverTransaction([this.game.players[player-1]], f.details);
	      return 0;
	    }
	  }

          return 1;
        }
        if (mv[0] === "new_world_phase") {

	  //
	  // no new world phase in 2P games
	  //
	  if (this.game.players.length > 2) {

	    // resolve voyages of exploration

	    // resolve voyages of conquest

	  }

	  //
	  // phase otherwise removed entirely for 2P
	  //

	  this.game.queue.splice(qe, 1);
          return 1;
        }
        if (mv[0] === "winter_phase") {

	  // show the winter overlay to let people know WTF is happening
	  //this.winter_overlay.render();

	  // Remove loaned naval squadron markers
	  this.returnLoanedUnits();

	  // Flip all debaters to their uncommitted (white) side, and
	  this.restoreDebaters();

	  // Remove the Renegade Leader if in play
	  let rl_idx = "";
	  rl_s = his_self.returnSpaceOfPersonage("hapsburg", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\thapsburg\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("papacy", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tpapacy\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("england", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tengland\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("france", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tfrance\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("ottoman", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tottoman\trenegade-leader\t"+rl_s+"\t0"); }
	  rl_s = his_self.returnSpaceOfPersonage("protestant", "renegade-leader");
          if (rl_s) { this.game.queue.push("remove_unit\tprotestant\trenegade-leader\t"+rl_s+"\t0"); }

	  // Remove major power alliance markers
	  this.unsetAllies("hapsburg", "papacy");
	  this.unsetAllies("hapsburg", "england");
	  this.unsetAllies("hapsburg", "france");
	  this.unsetAllies("hapsburg", "ottoman");
	  this.unsetAllies("hapsburg", "protestant");
	  this.unsetAllies("papacy", "england");
	  this.unsetAllies("papacy", "france");
	  this.unsetAllies("papacy", "ottoman");
	  this.unsetAllies("papacy", "protestant");
	  this.unsetAllies("england", "france");
	  this.unsetAllies("england", "ottoman");
	  this.unsetAllies("england", "protestant");
	  this.unsetAllies("france", "ottoman");
	  this.unsetAllies("france", "protestant");
	  this.unsetAllies("ottoman", "protestant");

	  // Add 1 regular to each friendly-controlled capital
	  if (this.isSpaceControlled("rome", "papacy")) { this.game.queue.push("build\tland\tpapacy\tregular\trome\t0"); }
	  // only to non-papacy if > 2P game
	  if (this.game.players.length > 2) {
	    if (this.isSpaceControlled("london", "england")) { this.game.queue.push("build\tland\tengland\tregular\tlondon\t0"); }
	    if (this.isSpaceControlled("paris", "france")) { this.game.queue.push("build\tland\tfrance\tregular\tparis\t0"); }
	    if (this.isSpaceControlled("valladolid", "hapsburg")) { this.game.queue.push("build\tland\thapsburg\tregular\tvalladolid\t0"); }
	    if (this.isSpaceControlled("vienna", "hapsburg")) { this.game.queue.push("build\tland\thapsburg\tregular\tvienna\t0"); }
	    if (this.isSpaceControlled("istanbul", "ottoman")) { this.game.queue.push("build\tland\tottoman\tregular\tistanbul\t0"); }
	  }

	  // Remove all piracy markers
	  // ResolvespecificMandatoryEventsiftheyhavenotoccurred by their “due date”.

	  //
	  // TESTING form Schmalkaldic League triggers end of round 1
	  //
	  //if (this.game.state.round == 2 && this.game.state.events.schmalkaldic_league != 1) {
	  //  this.game.queue.push("counter_or_acknowledge\tSchmalkaldic League Forms");
	  //  this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	  //  this.game.queue.push("event\tprotestant\t013");
	  //}
	  //
	  //
	  // form Schmalkaldic League if unformed by end of round 4
	  //
	  if (this.game.state.round == 4 && this.game.state.events.schmalkaldic_league != 1) {
	    this.game.queue.push("counter_or_acknowledge\tSchmalkaldic League Forms");
	    this.game.queue.push("RESETCONFIRMSNEEDED\tall");
	    this.game.queue.push("event\tprotestant\t013");
	  }

	  // Return naval units to the nearest port
	  this.game.queue.push("retreat_to_winter_ports");

	  // TODO - ATTRITION

	  // Return leaders and units to fortified spaces (suffering attrition if there is no clear path to such a space)
	  this.game.queue.push("retreat_to_winter_spaces");

	  this.game.queue.splice(qe, 1);
          return 1;
        }


        if (mv[0] === "action_phase") {

	  //
	  // check if we are really ready for a new round, or just need another loop
	  // until all of the players have passed. note that players who have passed 
	  // and have more than their admin_rating (saved cards) are forced to eventually
	  // stop passing and play....
	  //
	  let factions_in_play = [];
	  let factions_force_pass = [];


	  for (let i = 0; i < this.game.state.players_info.length; i++) {
console.log("ACTION PHASE: CHECK FACTIONS!");
console.log(JSON.stringify(this.game.state.players_info[i].factions));
	    for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	      let faction = this.game.state.players_info[i].factions[z];
	      if (this.game.state.players_info[i].factions_passed[z] == false) {
		if (!this.game.state.skip_next_impulse.includes(this.game.state.players_info[i].factions[z])) {
		  factions_in_play.push(this.game.state.players_info[i].factions[z]);
		} else {
		  for (let ii = 0; ii < this.game.state.skip_next_impulse.length; ii++) {
		    if (this.game.state.skip_next_impulse[ii] === this.game.state.players_info[i].factions[z]) {
		      this.game.state.skip_next_impulse.splice(ii, 1);
		      factions_force_pass.push(this.game.state.players_info[i].factions[z]);
		    }
		  }
		}
	      } else {
		// they passed but maybe they have more cards left than their admin rating?
		let far = this.factions[faction].returnAdminRating();
	        if (far < this.game.state.cards_left[faction]) {
		  factions_in_play.push(this.game.state.players_info[i].factions[z]);
	        }
	      }
	    }
	  }

	  //
	  // if anyone is left to play, everyone with cards left needs to pass again
	  //
          if (factions_in_play.length > 0) {
	    for (let i = 0; i < this.game.state.players_info.length; i++) {
	      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	        let f = this.game.state.players_info[i].factions[z];
	        if (!factions_in_play.includes(f) && !factions_force_pass.includes(f)) {

		  let is_activated_power = false;
	          let io = this.returnImpulseOrder();
		  for (let y = 0; y < io.length; y++) {
		    if (this.game.state.activated_powers[io[y]].includes(f)) { is_activated_power = true; }
		  }
		  if (!is_activated_power) {
	    	    factions_in_play.push(f);
		  }
	        }
	      }
	    }
	  }


	  //
	  // players still to go...
	  //
	  if (factions_in_play.length > 0) {
	    let io = this.returnImpulseOrder();
	    for (let i = io.length-1; i >= 0; i--) {
	      for (let k = 0; k < factions_in_play.length; k++) {
	        if (factions_in_play[k] === io[i]) {
	          this.game.queue.push("play\t"+io[i]);
		  k = factions_in_play.length+2;
	        }
	      }
	      for (let k = 0; i < factions_force_pass.length; k++) {
	        if (factions_force_pass[k] === io[i]) {
	          this.game.queue.push("skipturn\t"+io[i]);
		  k = factions_force_pass.length+2;
	        }
	      }
	    }
	    return 1;
	  }

	  //
	  // move past action phase if no-one left to play
	  //
	  this.game.queue.splice(qe, 1);
          return 1;
        }

        if (mv[0] === "spring_deployment_phase") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.players.length === 2) {
	    // only papacy moves units
	    this.game.queue.push("spring_deployment\tpapacy");
	  } else {
	    // all players can move units
	    let io = this.returnImpulseOrder();
	    for (let i = io.length-1; i >= 0; i--) {
	      if (this.isFactionInPlay(io[i])) {
		this.game.queue.push("spring_deployment\t"+io[i]);
	      }
	    }
	  }

          return 1;
        }
        if (mv[0] === "spring_deployment") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

	  if (faction === "protestant") { return 1; }
	  if (player == 0) { return 1; }

	  if (this.game.player == player) {
	    this.playerPlaySpringDeployment(faction, player);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " Spring Deployment");
	  }

	  return 0;

	}
        if (mv[0] === "diplomacy_phase") {

	  // multiplayer has diplomacy phase
	  // this.playerOffer();
	  // return 0;

	  //
	  // no diplomacy phase round 1
	  //
	  if (this.game.state.round == 1) {

            this.game.queue.push("SHUFFLE\t2");
            this.game.queue.push("DECKRESTORE\t2");
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKENCRYPT\t2\t"+(i));
	    }
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKXOR\t2\t"+(i));
	    }
	    let new_cards = this.returnNewDiplomacyCardsForThisTurn(this.game.state.round);
    	    this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));

	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  //
	  // 2-player game? both players play a diplomacy card
	  // AFTER they have been dealt on every turn after T1
	  //
	  if (this.game.state.round > 1) {
    	    this.game.queue.push("play_diplomacy_card\tprotestant");
    	    this.game.queue.push("play_diplomacy_card\tpapacy");
	  }

	  //
	  // 2-player game? Diplomacy Deck
	  //
	  if (this.game.players.length == 2) {

	    let cards_to_deal = 2;
	    if (this.game.state.round > 2) { cards_to_deal = 1; }

	    for (let i = this.game.state.players_info.length-1; i >= 0; i--) {
	      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
    	        this.game.queue.push("DEAL\t2\t"+(i+1)+"\t"+cards_to_deal);
	      }
	    }
            this.game.queue.push("SHUFFLE\t2");
            this.game.queue.push("DECKRESTORE\t2");
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKENCRYPT\t2\t"+(i));
	    }
	    for (let i = this.game.state.players_info.length; i > 0; i--) {
    	      this.game.queue.push("DECKXOR\t2\t"+(i));
	    }
	    let new_cards = this.returnNewDiplomacyCardsForThisTurn(this.game.state.round);
    	    this.game.queue.push("DECK\t2\t"+JSON.stringify(new_cards));
            this.game.queue.push("DECKBACKUP\t2");
	  }

	  //
	  // The Papacy may end a war they are fighting by playing Papal Bull or by suing for peace. -- start of diplomacy phase
	  //
          let is_papacy_at_war = false;
          let factions = ["genoa","venice","scotland","ottoman","france","england","hungary","hapsburg"];
          for (let i = 0; i < factions.length; i++) { if (this.areEnemies(factions[i], "papacy")) { is_papacy_at_war = true; } }
          if (is_papacy_at_war == true) {
            this.game.queue.push("papacy_diplomacy_phase_special_turn");
            this.game.queue.push("counter_or_acknowledge\tPapacy Special Diplomacy Phase");
          }

	  this.game.queue.splice(qe, 1);
          return 1;

        }


	if (mv[0] === "player_play_papacy_regain_spaces_for_vp") {

	  this.game.queue.splice(qe, 1);

	  if (this.game.player == this.returnPlayerOfFaction("papacy")) {
	    this.playerPlayPapacyDiplomacyPhaseSpecialTurn(enemies);
	  } else {
	    this.updateStatus("Papacy Considering Regaining Spaces");
	  }

          return 0;

	}


	if (mv[0] === "papacy_diplomacy_phase_special_turn") {

	  this.game.queue.splice(qe, 1);

	  let is_papacy_at_war = false;
          let enemies = [];
	  let factions = ["genoa","venice","scotland","ottoman","france","england","hungary","hapsburg"];
	  for (let i = 0; i < factions.length; i++) { if (this.areEnemies(factions[i], "papacy")) { enemies.push(factions[i]); is_papacy_at_war = true; } }

	  if (is_papacy_at_war == false) {
	    this.updateLog("Papacy is not at War, skipping special pre-diplomacy stage...");
	    return 1;
	  }

	  if (this.game.player == this.returnPlayerOfFaction("papacy")) {
	    this.playerPlayPapacyDiplomacyPhaseSpecialTurn(enemies);
	  } else {
	    this.updateStatus("Papacy Considering Diplomatic Options to End War");
	  }

          return 0;

        }

	if (mv[0] === "unset_enemies") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.unsetEnemies(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;
	  
	}
        if (mv[0] === "unset_allies") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.unsetAllies(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;
	  
	}

	if (mv[0] === "declare_war" || mv[0] === "set_enemies") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.setEnemies(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;

	}

	if (mv[0] === "declare_alliance" || mv[0] === "set_allies") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.setAllies(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;

	}

	if (mv[0] === "unset_activated_power") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.unsetActivatedPower(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;

	}

	if (mv[0] === "set_activated_power" || mv[0] === "set_activated_powers") {

	  let f1 = mv[1];
	  let f2 = mv[2];

  	  this.setActivatedPower(f1, f2);
	  this.game.queue.splice(qe, 1);

	  return 1;

	}


        if (mv[0] === "card_draw_phase") {

console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("CARD DRAW PHASE");

	  //
	  // deal cards and add home card
	  //
	  for (let i = this.game.state.players_info.length-1; i >= 0; i--) {
console.log("player: " + (i+1));
console.log(JSON.stringify(this.game.state.players_info[i].factions));
	    for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {

	      //
	      // sanity check we are major power
	      //
	      let f = this.game.state.players_info[i].factions[z];

	      if (f == "protestant" || f == "hapsburg" || f == "papacy" || f == "england" || f == "ottoman" || f == "france") {

                let cardnum = this.factions[this.game.state.players_info[i].factions[z]].returnCardsDealt(this);

//
// is_testing
//
if (this.game.state.scenario == "is_testing") { cardnum = 1; }
//
//
//
	        //
	        // fuggers card -1
	        //
                if (this.game.state.events.fuggers === this.game.state.players_info[i].factions[z]) {
		  cardnum--;
	  	  this.game.state.events.fuggers = "";
	        }

    	        this.game.queue.push("hand_to_fhand\t1\t"+(i+1)+"\t"+this.game.state.players_info[i].factions[z]);
    	        this.game.queue.push("add_home_card\t"+(i+1)+"\t"+this.game.state.players_info[i].factions[z]);
    	        this.game.queue.push("DEAL\t1\t"+(i+1)+"\t"+(cardnum));

	        // try to update cards_left
	        if (!this.game.state.cards_left[this.game.state.players_info[i].factions[z]]) {
	          this.game.state.cards_left[this.game.state.players_info[i].factions[z]] = 0;
	        }
	        this.game.state.cards_left[this.game.state.players_info[i].factions[z]] += cardnum;

	      }
	    }
	  }

	  //
	  // DECKRESTORE copies backed-up back into deck
	  //
          this.game.queue.push("SHUFFLE\t1");
          this.game.queue.push("DECKRESTORE\t1");

	  for (let i = this.game.state.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKENCRYPT\t1\t"+(i));
	  }
	  for (let i = this.game.state.players_info.length; i > 0; i--) {
    	    this.game.queue.push("DECKXOR\t1\t"+(i));
	  }

	  //
	  // new cards this turn
	  //
	  let new_cards = this.returnNewCardsForThisTurn(this.game.state.round);

	  //
	  // re-add discards
	  //
	  let discards = {};
	  for (let i in this.game.deck[0].discards) {
      	    discards[i] = this.game.deck[0].cards[i];
      	    delete this.game.deck[0].cards[i];
    	  }
    	  this.game.deck[0].discards = {};

	  //
	  // our deck for re-shuffling
	  //
	  let reshuffle_cards = {};
	  for (let key in discards) {
	    if (key !== "001" && key != "002" && key != "003" && key != "004" && key != "005" && key != "006" && key != "007" && key != "008") {
	      reshuffle_cards[key] = discards[key];
	    }
	  }

	  //
	  // remove home cards 
	  //
	  if (this.game.deck[0].cards['001']) { delete this.game.deck[0].cards['001']; }
	  if (this.game.deck[0].cards['002']) { delete this.game.deck[0].cards['002']; }
	  if (this.game.deck[0].cards['003']) { delete this.game.deck[0].cards['003']; }
	  if (this.game.deck[0].cards['004']) { delete this.game.deck[0].cards['004']; }
	  if (this.game.deck[0].cards['005']) { delete this.game.deck[0].cards['005']; }
	  if (this.game.deck[0].cards['006']) { delete this.game.deck[0].cards['006']; }
	  if (this.game.deck[0].cards['007']) { delete this.game.deck[0].cards['007']; }
	  if (this.game.deck[0].cards['008']) { delete this.game.deck[0].cards['008']; }

	  let deck_to_deal = new_cards;
	  for (let key in deck_to_deal) { 
	    if (key !== "001" && key != "002" && key != "003" && key != "004" && key != "005" && key != "006" && key != "007" && key != "008") {
	      reshuffle_cards[key] = deck_to_deal[key]; 
	    }
	  }

console.log("----------------------------");
console.log("---SHUFFLING IN DISCARDS ---");
console.log("----------------------------");
console.log("RESHUFFLE: " + JSON.stringify(reshuffle_cards));

    	  this.game.queue.push("restore_home_cards_to_deck");
    	  this.game.queue.push("DECK\t1\t"+JSON.stringify(reshuffle_cards));

	  // backup any existing DECK #1
          this.game.queue.push("DECKBACKUP\t1");


	  //
	  // "The Protestant army leader Maurice of Saxony is placed
	  // on the map at the start of Turn 6. Maurice is the only
	  // army leader that doesn’t either start the game on the map
	  // or enter via a Mandatory Event. Place Maurice in any
	  // electorate under Protestant political control."
	  //
//
// is not debater
//
//	  if (this.game.round == 6) {
//    	    this.game.queue.push("place_protestant_debater\tmaurice_of_saxony\tselect");
//	  }
	  if (this.game.round == 2) {
    	    this.game.queue.push("place_protestant_debater\tzwingli\tzurich");
	  }
	  if (this.game.round == 4) {
    	    this.game.queue.push("place_protestant_debater\tcalvin\tgeneva");
	  }

	  //
	  // dynamic - turn after Henry VIII maries Anne Boleyn
	  //
	  if (this.game.round == 6) {
    	    this.game.queue.push("place_protestant_debater\tcranmer\tlondon");
	  }

	  //
	  // "Naval leaders eliminated from play are also brought back
	  // during the Card Draw Phase. Place them in a friendly port
	  // if possible. If no friendly port exists, they remain on
	  // the Turn Track for another turn. Naval units eliminated in
	  // a previous turn are also returned to each power’s pool of
	  // units available to be constructed at this time."
	  //
    	  //this.game.queue.push("restore\tnaval_leaders");


	  this.game.queue.splice(qe, 1);
          return 1;

        }

        if (mv[0] === "restore_home_cards_to_deck") {

	  let d = this.returnDeck();
	  this.deck['008'] = d['008'];
	  this.game.deck[0].cards['001'] = d['001'];
	  this.game.deck[0].cards['002'] = d['002'];
	  this.game.deck[0].cards['003'] = d['003'];
	  this.game.deck[0].cards['004'] = d['004'];
	  this.game.deck[0].cards['005'] = d['005'];
	  this.game.deck[0].cards['006'] = d['006'];
	  this.game.deck[0].cards['007'] = d['007'];
	  this.game.deck[0].cards['008'] = d['008'];
	  this.game.queue.splice(qe, 1);
          return 1;
	}

	// removes from game
	if (mv[0] === "remove") {

	  let faction = mv[1];
	  let card = mv[2];

	  this.game.queue.splice(qe, 1);

	  if (!this.game.state.removed.includes(card)) { 
	    this.updateLog(this.popup(card) + " removed from deck");
	  }
	  this.removeCardFromGame(card);

	  return 1;

	}


	// pull card
	if (mv[0] === "pull_card") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];
	  let home_card_permitted = 0;
	  if (parseInt(mv[3]) > 0) { home_card_permitted = 1; }

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);

	  if (this.game.player == p2) {
            let fhand_idx = this.returnFactionHandIdx(p2, faction_giving);
	    let roll = this.rollDice(this.game.deck[0].fhand[fhand_idx].length) - 1;

            let is_this_home_card = 0;
            let pulled = this.game.deck[0].fhand[fhand_idx][roll];
            if (pulled == "001" || pulled == "002" || pulled == "003" || pulled == "004" || pulled == "005" || pulled == "006" || pulled == "007") {
              is_this_home_card = 1;
            }

            if (home_card_permitted == 0 && is_this_home_card == 1) {
              while (roll > 0 && is_this_home_card == 1) {
                is_this_home_card = 0;
                roll--;
                if (roll == -1) {
                  this.addMove("NOTIFY\t"+this.returnFactionname(faction)+ " has no non-home cards to pull");
                  this.endTurn();
                  return 0;
                }
                let pulled = this.game.deck[0].fhand[fhand_idx][roll];
                if (pulled == "001" || pulled == "002" || pulled == "003" || pulled == "004" || pulled == "005" || pulled == "006" || pulled == "007") {
                  is_this_home_card = 1;
                }
              }
            }

	    let card = this.game.deck[0].fhand[fhand_idx][roll];
	    this.addMove("give_card\t"+faction_taking+"\t"+faction_giving+"\t"+card);
	    this.endTurn();
	  } else {
	    this.rollDice();
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

        }

	// requestreveal hand
	if (mv[0] === "request_reveal_hand") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);

	  if (this.game.player == p2) {
            let fhand_idx = this.returnFactionHandIdx(p2, faction_giving);
	    this.addMove("reveal_hand\t"+faction_taking+"\t"+faction_giving+"\t"+JSON.stringify(his_self.game.deck[0].fhand[fhand_idx]));
	    this.endTurn();
	  }

	  this.game.queue.splice(qe, 1);
	  return 0;

        }

	// reveal hand
	if (mv[0] === "reveal_hand") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];
	  let cards = JSON.parse(mv[3]);

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);

	  if (this.game.player == p1) {
	    this.updateLog("Cards Revealed: ");
	    for (let i = 0; i < cards.length; i++) {
	      this.updateLog(this.game.deck[0].cards[i].name);
	    }
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

        }

	// give card
	if (mv[0] === "give_card") {

	  let faction_taking = mv[1];
	  let faction_giving = mv[2];
	  let card = mv[3];

	  if (card == "undefined") { 
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  this.updateLog(this.returnFactionName(faction_taking) + " pulls " + this.popup(card));

	  let p1 = this.returnPlayerOfFaction(faction_taking);
	  let p2 = this.returnPlayerOfFaction(faction_giving);
	  this.game.state.last_pulled_card = card;

	  if (this.game.player == p2) {
	    for (let i = 0; i < this.game.deck[0].fhand.length; i++) {
	      for (let z = 0; z < this.game.deck[0].fhand[i].length; z++) {
		if (this.game.deck[0].fhand[i][z] === card) {
		  this.game.deck[0].fhand[i].splice(z, 1);
		  z--;
		}
	      }
	    }
	  }

	  if (this.game.player == p1) {
            let fhand_idx = this.returnFactionHandIdx(p1, faction_taking);
	    this.game.deck[0].fhand[fhand_idx].push(card);
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

        }

	// fortify a spacekey
	if (mv[0] === "fortify") {

	  let spacekey = mv[1];
	  this.game.spaces[spacekey].fortified = 1;
	  if (this.game.spaces[spacekey].type != "electorate" && this.game.spaces[spacekey].type != "key") { this.game.spaces[spacekey].type = "fortress"; }
	  this.game.queue.splice(qe, 1);

	  this.displaySpace(spacekey);

	  return 1;

	}



	if (mv[0] === "discard_diplomacy_card") {

	  let faction = mv[1];
	  let card = mv[2];
	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  //
	  // move into discards
	  //
	  this.game.deck[1].discards[card] = this.game.deck[1].cards[card];

	  //
	  // and remove from hand
	  //
	  if (this.game.player === player_of_faction) {
	    for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	      if (this.game.deck[1].hand[i] === card) {
		this.game.deck[1].hand.splice(i, 1);
	      }
	    }
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	// moves into discard pile
	if (mv[0] === "discard") {

	  let faction = mv[1];
	  let card = mv[2];
	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  //
	  // move into discards
	  //
	  this.game.deck[0].discards[card] = this.game.deck[0].cards[card];

	  //
	  // and remove from hand
	  //
	  if (this.game.player === player_of_faction) {
            let fhand_idx = this.returnFactionHandIdx(player_of_faction, faction);
	    for (let i = 0; i < this.game.deck[0].fhand[fhand_idx].length; i++) {
	      if (this.game.deck[0].fhand[fhand_idx][i] === card) {
		this.game.deck[0].fhand[fhand_idx].splice(i, 1);
	      }
	    }
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}




	// skip next impulse
	if (mv[0] === "skip_next_impulse") {

	  let target_faction = mv[1];

	  this.game.state.skip_next_impulse.push(target_faction);

	  this.game.queue.splice(qe, 1);
          return 1;
        }


	if (mv[0] === "excommunicate_faction") {

	  let faction = mv[1];
	  this.excommunicateFaction(faction);

	  this.game.queue.splice(qe, 1);

          return 1;

	}

	// discards N cards from faction hand
	if (mv[0] === "excommunicate_reformer") {

	  let reformer = mv[1];

	  this.game.queue.splice(qe, 1);

	  this.excommunicateReformer(reformer);
	  this.displayBoard();

          return 1;
        }


	// discards N cards from faction hand
	if (mv[0] === "discard_random") {

	  let faction = mv[1];
	  let home_card_permitted = 0;
	  if (parseInt(mv[2]) > 0) { home_card_permitted = parseInt(mv[2]); }
	  let num = 1;

	  let player_of_faction = this.returnPlayerOfFaction(faction);

	  this.game.queue.splice(qe, 1);

	    if (this.game.player == player_of_faction) {

              let fhand_idx = this.returnFactionHandIdx(player_of_faction, faction);
	      let num_cards = this.game.deck[0].fhand[fhand_idx].length;
	      if (num_cards == 0) {
		this.rollDice(6);
		this.addMove("NOTIFY\t"+this.returnFactionname(faction)+ " has no cards to discard");
		this.endTurn();
		return 0;
	      }

	      let discards = [];
	      if (num_cards < num) { num = num_cards; }
	      let roll = this.rollDice(num_cards) - 1;
	      let is_this_home_card = 0;
	      let pulled = this.game.deck[0].fhand[fhand_idx][roll];
	      if (pulled == "001" || pulled == "002" || pulled == "003" || pulled == "004" || pulled == "005" || pulled == "006" || pulled == "007") {
		is_this_home_card = 1;
	      }

	      if (home_card_permitted == 0 && is_this_home_card == 1) {
	        while (roll > 0 && is_this_home_card == 1) {
		  is_this_home_card = 0;
		  roll--;
		  if (roll == -1) {
		    this.addMove("NOTIFY\t"+this.returnFactionname(faction)+ " has no non-home cards to discard");
		    this.endTurn();
		    return 0;
		  }
	      	  let pulled = this.game.deck[0].fhand[fhand_idx][roll];
	      	  if (pulled == "001" || pulled == "002" || pulled == "003" || pulled == "004" || pulled == "005" || pulled == "006" || pulled == "007") {
		    is_this_home_card = 1;
		  }
		}
	      }


	      discards.push(roll);
	      discards.sort();
	      for (let zz = 0; zz < discards.length; zz++) {
	        this.addMove("discard\t"+faction+"\t"+this.game.deck[0].fhand[fhand_idx][discards[zz]]);
	      }
	      this.endTurn();

	    } else {
	      this.rollDice(6);
	    }


	  return 0;

	}

	if (mv[0] === "skipturn") {

	    this.game.queue.splice(qe, 1);
	    return 1;
	}

        if (mv[0] === "play") {

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

	  // update board display
	  this.game.state.board[faction] = this.returnOnBoardUnits(faction);
          this.displayBoard();

	  //
	  // if everyone has passed, we can avoid this
	  //
	  let everyone_has_passed = true;
	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	      if (this.game.state.players_info[i].factions_passed[z] != true) { everyone_has_passed = false; }
	    }
	  }
	  if (everyone_has_passed == true) {
console.log("EVERYONE HAS PASSED!");
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }



	  //
	  // new impulse
	  //
          this.resetBesiegedSpaces();
          this.onNewImpulse();

	  //
	  // hide unneeded overlays
	  //
	  this.debate_overlay.hide();
	  this.theses_overlay.hide();

	  this.game.state.active_player = player;
	  this.game.state.active_faction = faction;

	  // skip factions not-in-play
	  if (player == -1) {
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }

	  //
	  // skip turn if required
	  //
	  if (this.game.state.skip_next_impulse.includes(faction)) {
	    for (let i = 0; i < this.game.state.skip_next_impulse.length; i++) {
	      if (this.game.state.skip_next_impulse[i] == faction) {
		this.game.state.skip_next_impulse.splice(i, 1);
	      }
	    }
	    this.game.queue.splice(qe, 1);
	    return 1;
	  }


	  //
	  // reset player/state vars and set as active player
	  //
	  this.resetPlayerTurn(player);

	  if (this.game.player == player) {
	    this.playerTurn(faction);
	  } else {
	    this.updateStatusAndListCards("Opponent Turn:", this.game.deck[0].fhand[0], () => {});
	  }

	  this.game.queue.splice(qe, 1);
          return 0;
        }
	if (mv[0] === "continue") {

	  let player = mv[1];
	  let faction = mv[2];
	  let card = mv[3];
	  let ops = mv[4];
	  let limit = "";
	  if (mv[5]) { limit = mv[5]; }

	  this.game.queue.splice(qe, 1);

	  let player_turn = -1;

	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    if (this.game.state.players_info[i].factions.includes(faction)) {
	      player_turn = i+1;
	    }
	  }

          this.displayBoard();

	  // no-one controls this faction, so skip
	  if (player_turn === -1) {
	    return 1;
	  }

	  // let the player who controls play turn
	  if (this.game.player === player_turn) {
	    this.playerAcknowledgeNotice(`You have ${ops} OPS remaining...`, () => {
	      this.playerPlayOps(card, faction, ops, limit);
	    });
	  } else {
	    this.hideOverlays();
	    this.updateStatusAndListCards("Opponent Turn", () => {});
	  }

          return 0;
        }

	if (mv[0] === "faction_acknowledge") {

	  let faction = mv[1];
	  let msg = mv[2];
	  let player = this.returnPlayerOfFaction(faction);

	  this.game.queue.splice(qe, 1);

	  if (this.game.player == player) {
	    // active player halts, then continues once acknowledgement happens
	    this.playerAcknowledgeNotice(msg, () => {
	      this.handleGameLoop();
	    });
	  } else {
	    // everyone else continues processing
	    return 1;
	  }

	  return 0;

	}

	if (mv[0] === "place_protestant_debater") {

	  this.game.queue.splice(qe, 1);

	  let name = mv[3];
	  let location = mv[4];

	  this.updateLog(unitname + " enters at " + location);
	  this.addDebater("protestant", location, name);
	  if (this.game.spaces[space].religion != "protestant") {
	    this.game.spaces[space].religion = "protestant";
	    this.updateLog(this.returnSpaceName(location) + " converts Protestant");
	  }
	  this.displaySpace(location);

	  return 1;

	}

	if (mv[0] === "select_for_catholic_conversion") {

	  let faction = mv[1];
	  let zone = "";
	  if (mv[2]) { zone = mv[2]; }

	  this.game.queue.splice(qe, 1);

	  if (this.theses_overlay.visible) { this.theses_overlay.pushHudUnderOverlay(); }

	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerSelectSpaceWithFilter(
              "Select Town to Convert Catholic",

              //
              // catholic spaces adjacent to protestant
              //
              function(space) {
                if (
                  space.religion === "protestant" &&
                  his_self.isSpaceAdjacentToReligion(space, "catholic")
                ) {
		  if (space.language == zone || zone == "") {
                    return 1;
                  }
                }
                return 0;
              },

              function(spacekey) {
    	        his_self.updateStatusWithOptions(`Converting ${his_self.returnSpaceName(spacekey)}`);
                his_self.addMove("convert\t"+spacekey+"\tcatholic");
                his_self.endTurn();
              },

              null,

	      true

            );

          } else {
	    this.updateStatus("Counter-Reformation");
	  }
	  this.displayVictoryTrack();
	  return 0;

        }

	if (mv[0] === "select_for_protestant_conversion") {

	  let faction = mv[1];
	  let zone = "";
	  let force_in_zone = 0;
	  if (mv[2]) { zone = mv[2]; }
	  if (mv[3]) { force_in_zone = true; }

	  this.game.queue.splice(qe, 1);

	  //
	  //
	  //
	  let available_spaces = this.returnNumberOfProtestantSpacesInLanguageZone(zone);
	  if (available_spaces == 0) {
	    if (force_in_zone) { 
	      return 1; 
	    } else { 
	      zone = ""; 
	    }
	  }
	  if (1 > this.returnNumberOfProtestantSpacesInLanguageZone(zone)) {
	    return 1;
	  }

	  if (this.theses_overlay.visible) { this.theses_overlay.pushHudUnderOverlay(); }

	  let player = this.returnPlayerOfFaction(faction);
	  if (this.game.player == player) {
	    this.playerSelectSpaceWithFilter(
              "Select Town to Convert Protestant",

              //
              // catholic spaces adjacent to protestant
              //
              function(space) {
                if (
                  space.religion === "catholic" &&
                  his_self.isSpaceAdjacentToReligion(space, "protestant")
                ) {
		  if (space.language == zone || zone == "") {
                    return 1;
                  }
                }
                return 0;
              },

              function(spacekey) {
    	        his_self.updateStatusWithOptions(`Reforming ${his_self.returnSpaceName(spacekey)}`);
                his_self.addMove("convert\t"+spacekey+"\tprotestant");
                his_self.endTurn();
              },

              null,

	      true

            );
          } else {
	    this.updateStatus("Protestant Reformation");
	  }

	  this.displayVictoryTrack();
	  return 0;

        }



	if (mv[0] === "assault") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let space = mv[2];

	  this.displayVictoryTrack();

	  return 1;

	}


 	if (mv[0] === "unrest") {

	  let spacekey = mv[1];
	  this.game.spaces[spacekey].unrest = 1;
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

 	if (mv[0] === "remove_unrest") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  this.game.spaces[spacekey].unrest = 0;
	  this.displaySpace(spacekey);

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


 	if (mv[0] === "player_add_unrest") {

	  let faction = mv[1];
	  let zone = mv[2];
	  let religion = mv[3];
	  let player = this.returnPlayerOfFaction(faction);


	  if (this.game.player == player) {
	    this.playerAddUnrest(this, faction, zone, religion);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " stirring unrest");
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}

	if (mv[0] === "withdraw_to_nearest_fortified_space") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let source_spacekey = mv[2];

	  //
	  // move the units here
	  //
	  let units = this.game.spaces[source_spacekey].units[faction];
	  this.game.spaces[source_spacekey].units[faction] = [];

	  //
	  // find nearest fortified unit
	  //
	  let not_these_spaces = [];
	  let all_units_repositioned = false;

	  //
	  // loop moving these units around
	  //
	  while (all_units_repositioned == false) {

            let found_space = his_self.returnNearestSpaceWithFilter(
	      source_spacekey ,

              function(spacekey) {
                if ( !not_these_spaces.includes(spacekey) && his_self.game.spaces[spacekey].home == faction && (his_self.game.spaces[spacekey].type == "key" || his_self.game.spaces[spacekey].type == "electorate" || his_self.game.spaces[spacekey].type == "fortress")) {
		  if (his_self.returnFactionLandUnitsInSpace(faction, spacekey) < 4) { return 1; }
		}
                return 0;
              },

              function(propagation_filter) {
                return 1;
              },

              0,

              1,
            );

	    let loop_limit = units.length;
	    for (let i = 0; i < loop_limit; i++) {
	      if (his_self.returnFactionLandUnitsInSpace(faction, found_space)) {
		his_self.units[faction].push(units[i]);
		units.splice(i, 1);
		i--;
	        loop_limit = units.length;
	      }
	    }
	  }

	}

	if (mv[0] === "pacify" || mv[0] === "control") {

	  this.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let space = mv[2];

	  this.game.spaces[space].unrest = 0;

	  //
	  // 2P restriction on which keys can 
	  //
	  if (this.game.players.length == 2) {
	    if (space != "metz" && space != "liege" && this.game.spaces[space].language != "german" && this.game.spaces[space].language != "italian") { 
	      this.updateLog("NOTE: only Metz, Liege and German and Italian spaces may change control in the 2P game");
	    } else {
	      this.updateLog(this.returnFactionName(faction) + " controls " + this.returnSpaceName(space));
	      this.game.spaces[space].political = faction;
	    }
	  } else {
	    this.updateLog(this.returnFactionName(faction) + " controls " + this.returnSpaceName(space));
	    this.game.spaces[space].political = faction;
	  }

	  this.game.spaces[space].political = faction;

	  this.displaySpace(space);
	  this.displayVictoryTrack();


          //
          // military victory
          //
	  let keys = this.returnNumberOfKeysControlledByFaction(faction);
	  if (faction === "hapsburg" && keys >= this.game.state.autowin_hapsburg_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }
	  if (faction === "ottoman" && keys >= this.game.state.autowin_ottoman_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }
	  if (faction === "france" && keys >= this.game.state.autowin_france_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }
	  if (faction === "england" && keys >= this.game.state.autowin_england_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }
	  if (faction === "papacy" && keys >= this.game.state.autowin_papacy_keys_controlled) {
	    let player = this.returnPlayerOfFaction(faction);
	    this.sendGameOverTransaction([this.game.players[player-1]], "Military Victory");
	    return 0;
	  }

	  return 1;

	}




	if (mv[0] === "convert") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let religion = mv[2];

	  if (religion == "protestant") {
	    this.updateLog(this.returnSpaceName(space) + " converts Protestant");
	  } else {
	    this.updateLog(this.returnSpaceName(space) + " converts Catholic");
	  }

	  if (space === "augsburg" && religion === "protestant" && this.game.state.augsburg_electoral_bonus == 0) {
	    this.game.spaces['augsburg'].units['protestant'].push();
    	    this.addRegular("protestant", "augsburg", 2);
	    this.game.state.augsburg_electoral_bonus = 1;
	  }
	  if (space === "mainz" && religion === "protestant" && this.game.state.mainz_electoral_bonus == 0) {
	    this.game.spaces['mainz'].units['protestant'].push();
    	    this.addRegular("protestant", "mainz", 1);
	    this.game.state.mainz_electoral_bonus = 1;
	  }
	  if (space === "trier" && religion === "protestant" && this.game.state.trier_electoral_bonus == 0) {
	    this.game.spaces['trier'].units['protestant'].push();
    	    this.addRegular("protestant", "trier", 1);
	    this.game.state.trier_electoral_bonus = 1;
	  }
	  if (space === "cologne" && religion === "protestant" && this.game.state.cologne_electoral_bonus == 0) {
	    this.game.spaces['cologne'].units['protestant'].push();
    	    this.addRegular("protestant", "cologne", 1);
	    this.game.state.cologne_electoral_bonus = 1;
	  }
	  if (space === "wittenberg" && religion === "protestant" && this.game.state.wittenberg_electoral_bonus == 0) {
	    this.game.spaces['wittenberg'].units['protestant'].push();
    	    this.addRegular("protestant", "wittenberg", 2);
	    this.game.state.wittenberg_electoral_bonus = 1;
	  }
	  if (space === "brandenburg" && religion === "protestant" && this.game.state.brandenburg_electoral_bonus == 0) {
	    this.game.spaces['brandenburg'].units['protestant'].push();
    	    this.addRegular("protestant", "brandenburg", 1);
	    this.game.state.brandenburg_electoral_bonus = 1;
	  }

console.log("BRANDENBURG ELEC BONUS: " + this.game.state.brandenburg_electoral_bonus);

	  this.game.spaces[space].religion = religion;
	  this.displaySpace(space);
	  this.displayElectorateDisplay();
	  this.displayVictoryTrack();

	  //
	  // check for victory condition
	  //
          if (this.returnNumberOfProtestantSpacesInLanguageZone() >= 50) {
	    let player = this.returnPlayerOfFaction("protestant");
	    this.sendGameOverTransaction([this.game.players[player-1]], "Religious Victory");
	    return 0;
	  }

	  return 1;

	}

	if (mv[0] === "add_home_card") {

	  let player = parseInt(mv[1]);
 	  let faction = mv[2];
 	  let hc = this.returnDeck();


	  for (let key in hc) {
	    if (hc[key].faction === faction) {
	      if (!this.game.state.cards_left[faction]) { this.game.state.cards_left[faction] = 0; }
	      this.game.state.cards_left[faction]++;
	      if (this.game.player === player) {
	        this.game.deck[0].hand.push(key);
	      }
	    }
	  }

	  this.game.queue.splice(qe, 1);
	  return 1;

	}


        if (mv[0] === "play_diplomacy_card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = this.returnPlayerOfFaction(faction);

	  if (this.game.player == player) {
	    this.playerPlayDiplomacyCard(faction);
	  } else {
	    if (faction == "papacy") {
  	      this.updateStatusAndListCards("Papacy playing Diplomacy Card", this.game.deck[1].hand, () => {});
	    } else {
  	      this.updateStatusAndListCards("Protestants playing Diplomacy Card", this.game.deck[1].hand, () => {});
	    }
	  }

	  return 0;

	}


	if (mv[0] === "hand_to_fhand") {

	  this.game.queue.splice(qe, 1);

	  let deckidx = parseInt(mv[1])-1;
	  let player = parseInt(mv[2]);
	  let faction = mv[3];
	  let fhand_idx = this.returnFactionHandIdx(player, faction);

	  if (this.game.player == player) {

	    if (!this.game.deck[deckidx].fhand) { this.game.deck[deckidx].fhand = []; }
	    while (this.game.deck[deckidx].fhand.length < (fhand_idx+1)) { this.game.deck[deckidx].fhand.push([]); }

	    for (let i = 0; i < this.game.deck[deckidx].hand.length; i++) {
	      this.game.deck[deckidx].fhand[fhand_idx].push(this.game.deck[deckidx].hand[i]);
	    }

	    // and clear the hand we have dealt
	    this.game.deck[deckidx].hand = [];
	  }

	  return 1;

	}

	if (mv[0] === "remove_translation_bonus") {
	  this.game.queue.splice(qe, 1);
	  this.game.state.tmp_protestant_translation_bonus = 0;
	  this.game.state.english_bible_translation_bonus = 0;
	  this.game.state.french_bible_translation_bonus = 0;
	  this.game.state.german_bible_translation_bonus = 0;
	  this.game.state.tmp_protestant_translation_bonus = 0;
	  return 1;
	}

	if (mv[0] === "reformation") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let target_language_zone = mv[2] || "german";
	  this.game.state.tmp_reformations_this_turn.push(space);

	  let p_rolls = 0;
	  let c_rolls = 0;

	  let p_neighbours = 0;
	  let c_neighbours = 0;

	  let p_bonus = 0;
	  let c_bonus = 0;

	  let p_high = 0;
	  let c_high = 0;

	  let p_roll_desc = [];
	  let c_roll_desc = [];

	  let protestants_win = 0;

	  let ties_resolve = "protestant";

	  //
	  // neighbours
	  //
	  for (let i = 0; i < this.game.spaces[space].neighbours.length; i++) {

	    if (!this.game.spaces[space].pass.includes(this.game.spaces[space].neighbours[i]) && !this.game.spaces[this.game.spaces[space].neighbours[i]].unrest) {
	      if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "catholic") {
	        c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
	        c_neighbours++;
	      }
	      if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "protestant") {
	        p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
	        p_neighbours++;
	      }
	      if (this.hasProtestantLandUnits(this.game.spaces[space].neighbours[i])) {
	        p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
	        p_rolls++;
	      }
	      if (this.hasCatholicLandUnits(this.game.spaces[space].neighbours[i])) {
	        c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
	        c_rolls++;
	      }
	      if (this.hasProtestantReformer(this.game.spaces[space].neighbours[i])) {
	        p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "reformer"});
	        p_rolls++;
	      }
	      if (this.game.spaces[this.game.spaces[space].neighbours[i]].university) {
	        c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "jesuit university"});
	        c_rolls++;
	      }
	    }
	  }

	  //
	  // ourselves
	  //
	  if (this.hasProtestantLandUnits(space)) {
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    p_rolls++;
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    p_rolls++;
	  }
	  if (this.hasCatholicLandUnits(space)) {
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    c_rolls++;
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
	    c_rolls++;
	  }
	  if (this.hasProtestantReformer(space)) {
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
	    p_rolls++;
	    p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
	    p_rolls++;
	  }
	  if (this.game.spaces[space].university) {
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
	    c_rolls++;
	    c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
	    c_rolls++;
	  }

	  //
	  // language zone
	  //
	  if (this.game.spaces[space].language !== target_language_zone && target_language_zone != "all") {
	    ties_resolve = "catholic";
 	  }

	  //
	  // temporary bonuses
	  //
	  if (this.game.state.english_bible_translation_bonus == 1 || this.game.state.french_bible_translation_bonus == 1 || this.game.state.german_bible_translation_bonus == 1) {
	    p_rolls++;
	    p_roll_desc.push({ name : "Bonus" , desc : "translation completed"});
	  }
	  if (this.game.state.printing_press_active) {
	    p_rolls++;
	    p_roll_desc.push({ name : "Bonus" , desc : "printing press"});
	  }
	  if (this.game.state.tmp_protestant_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_protestant_reformation_bonus_spaces.includes(space)) {
	      p_roll_desc.push({ name : "Bonus" , desc : "protestant bonus roll"});
	      this.game.state.tmp_protestant_reformation_bonus--;
	      if (this.game.state.tmp_protestant_reformation_bonus < 0) { this.game.state.tmp_protestant_reformation_bonus = 0; }
	    }
	  }
	  if (this.game.state.tmp_catholic_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_catholic_reformation_bonus_spaces.includes(space)) {
	      c_roll_desc.push({ name : "Bonus" , desc : "catholic bonus roll"});
	      this.game.state.tmp_catholic_reformation_bonus--;
	      if (this.game.state.tmp_catholic_reformation_bonus < 0) { this.game.state.tmp_catholic_reformation_bonus = 0; }
	    }
	  }

	  for (let i = 0; i < this.game.state.tmp_protestant_reformation_bonus; i++) {
	    p_roll_desc.push({ name : "Bonus" , desc : "protestant bonus roll"});
	  }
	  for (let i = 0; i < this.game.state.tmp_catholic_reformation_bonus; i++) {
	    c_roll_desc.push({ name : "Bonus" , desc : "catholic bonus roll"});
	  }
	  p_bonus += this.game.state.tmp_protestant_reformation_bonus;
	  c_bonus += this.game.state.tmp_catholic_reformation_bonus;


	  //
	  // calculate total rolls
	  //
	  p_rolls += p_neighbours;
	  p_rolls += p_bonus;
	  c_rolls += c_neighbours;
	  c_rolls += c_bonus;

          //
          // everyone rolls at least 1 dice
          //
          if (c_rolls == 0) {
	    c_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    c_rolls = 1;
	  }
          if (p_rolls == 0) {
	    p_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    p_rolls = 1;
	  }

	  let pdice = [];
	  let cdice = [];

	  for (let i = 0; i < p_rolls; i++) {
	    let x = this.rollDice(6);
	    if (this.game.state.events.calvins_institutes && this.game.spaces[space].language === "french") { x++; }
	    if (x > p_high) { p_high = x; }
	    pdice.push(x);
	  }

	  for (let i = 0; i < c_rolls; i++) {
	    let x = this.rollDice(6);
	    if (x > c_high) { c_high = x; }
	    cdice.push(x);
	  }

	  //
	  // do protestants win?
	  //
	  if (p_high > c_high) { protestants_win = 1; }
	  if (p_high == c_high && ties_resolve === "protestant") { protestants_win = 1; }

	  //
	  //
	  //
	  let obj = {};
	  obj.key = mv[1];
          obj.name = this.spaces[space].name;
	  obj.pdice = pdice;
	  obj.cdice = cdice;
	  obj.p_roll_desc = p_roll_desc;
	  obj.c_roll_desc = c_roll_desc;
	  obj.p_high = p_high;
	  obj.c_high = c_high;
	  obj.reformation = true;
	  obj.counter_reformation = false;
          obj.protestants_win = protestants_win;
	  this.reformation_overlay.render(obj);

	  //
	  // handle victory
	  //
	  if (protestants_win == 1) {
	    this.game.queue.push("convert\t"+space+"\tprotestant");
	  } else {
	    if (parseInt(this.game.state.events.carlstadt_debater) == 1) {
	      // unrest
	      this.game.queue.push("unrest\t"+space);
	    }
	    this.updateLog(this.returnSpaceName(space) + " remains Catholic");
	  }

	  return 1;

	}


	if (mv[0] === "counter_reformation") {

	  this.game.queue.splice(qe, 1);

	  let space = mv[1];
	  let target_language_zone = mv[2] || "german";
	  this.game.state.tmp_counter_reformations_this_turn.push(space);

	  let p_rolls = 0;
	  let c_rolls = 0;

	  let p_neighbours = 0;
	  let c_neighbours = 0;

	  let p_bonus = 0;
	  let c_bonus = 0;

	  let p_high = 0;
	  let c_high = 0;

	  let p_roll_desc = [];
	  let c_roll_desc = [];

	  let catholics_win = 0;

	  let ties_resolve = "protestant";

	  //
	  // language zone
	  //
	  if (this.game.spaces[space].language !== target_language_zone) {
	    //
	    // catholics win ties if Paul III or Julius III are Pope
	    //
	    if (this.game.state.leaders.paul_iii == 1 || this.game.state.leaders.julius_iii == 1) {
	      ties_resolve = "catholic";
	    }
 	  }

          //
          // neighbours
          //
          for (let i = 0; i < this.game.spaces[space].neighbours.length; i++) {
	    if (!this.game.spaces[space].pass.includes(this.game.spaces[space].neighbours[i]) && !this.game.spaces[this.game.spaces[space].neighbours[i]].unrest) {
            if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "catholic") {
              c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
              c_neighbours++;
            }
            if (this.game.spaces[ this.game.spaces[space].neighbours[i] ].religion === "protestant") {
              p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "adjacency"});
              p_neighbours++;
            }
            if (this.hasProtestantLandUnits(this.game.spaces[space].neighbours[i])) {
              p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
              p_rolls++;
            }
            if (this.hasCatholicLandUnits(this.game.spaces[space].neighbours[i])) {
              c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "land units"});
              c_rolls++;
            }
            if (this.hasProtestantReformer(this.game.spaces[space].neighbours[i])) {
              p_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "reformer"});
              p_rolls++;
            }
            if (this.game.spaces[this.game.spaces[space].neighbours[i]].university) {
              c_roll_desc.push({ name : this.game.spaces[this.game.spaces[space].neighbours[i]].name , desc : "jesuit university"});
              c_rolls++;
            }
            }
          }

          //
          // ourselves
          //
          if (this.hasProtestantLandUnits(space)) {
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            p_rolls++;
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            p_rolls++;
          }
          if (this.hasCatholicLandUnits(space)) {
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            c_rolls++;
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "land units"});
            c_rolls++;
          }
          if (this.hasProtestantReformer(space)) {
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
            p_rolls++;
            p_roll_desc.push({ name : this.game.spaces[space].name , desc : "reformer"});
            p_rolls++;
          }
          if (this.game.spaces[space].university) {
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
            c_rolls++;
            c_roll_desc.push({ name : this.game.spaces[space].name , desc : "jesuit university"});
            c_rolls++;
          }

	  //
	  // temporary bonuses
	  //
	  if (this.game.state.tmp_protestant_counter_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_protestant_counter_reformation_bonus_spaces.includes(space)) {
	      this.game.state.tmp_protestant_counter_reformation_bonus--;
	      if (this.game.state.tmp_protestant_counter_reformation_bonus < 0) { this.game.state.tmp_protestant_counter_reformation_bonus = 0; }
	    }
	  }
	  if (this.game.state.tmp_catholic_counter_reformation_bonus_spaces.length > 0) {
	    if (!this.game.state.tmp_catholic_counter_reformation_bonus_spaces.includes(space)) {
	      this.game.state.tmp_catholic_counter_reformation_bonus--;
	      if (this.game.state.tmp_catholic_counter_reformation_bonus < 0) { this.game.state.tmp_catholic_counter_reformation_bonus = 0; }
	    }
	  }

          for (let i = 0; i < this.game.state.tmp_protestant_counter_reformation_bonus; i++) {
            p_roll_desc.push({ name : "Bonus" , desc : "protestant bonus roll"});
          }
          for (let i = 0; i < this.game.state.tmp_catholic_counter_reformation_bonus; i++) {
            c_roll_desc.push({ name : "Bonus" , desc : "catholic bonus roll"});
          }
          p_bonus += this.game.state.tmp_protestant_counter_reformation_bonus;
          c_bonus += this.game.state.tmp_catholic_counter_reformation_bonus;

	  //
	  // calculate total rolls
	  //
	  p_rolls += p_neighbours;
	  p_rolls += p_bonus;
	  c_rolls += c_neighbours;
	  c_rolls += c_bonus;

	  //
	  // everyone rolls at least 1 dice
	  //
          if (c_rolls == 0) {
	    c_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    c_rolls = 1;
	  }
          if (p_rolls == 0) {
	    p_roll_desc.push({ name : "Default Roll" , desc : "base minimum"});
	    p_rolls = 1;
	  }

	  let pdice = [];
	  let cdice = [];

	  for (let i = 0; i < p_rolls; i++) {
	    let x = this.rollDice(6);
	    if (his_self.game.state.events.augsburg_confession == true) { x--; }
	    pdice.push(x);
	    if (x > p_high) { p_high = x; }
	  }

	  for (let i = 0; i < c_rolls; i++) {
	    let x = this.rollDice(6);
	    cdice.push(x);
	    if (x > c_high) { c_high = x; }
	  }

	  //
	  // do catholics win?
	  //
	  if (p_high < c_high) { catholics_win = 1; }
	  if (p_high == c_high && ties_resolve === "catholics") { catholics_win = 1; }

          //
          // render results
          //
          let obj = {};
          obj.key = mv[1];
          obj.name = this.spaces[space].name;
          obj.pdice = pdice;
          obj.cdice = cdice;
          obj.p_roll_desc = p_roll_desc;
          obj.c_roll_desc = c_roll_desc;
          obj.p_high = p_high;
          obj.c_high = c_high;
	  obj.reformation = false;
	  obj.counter_reformation = true;
          obj.catholics_win = catholics_win;
	  obj.protestants_win = 1;
	  if (catholics_win) { obj.protestants_win = 0; }
          this.reformation_overlay.render(obj);

	  //
	  // handle victory
	  //
	  if (catholics_win == 1) {
	    this.game.queue.push("convert\t"+space+"\tcatholic");
	  } else {
	    this.updateLog(this.returnSpaceName(space) + " remains Protestant");
	  }

	  return 1;

	}


	//
	// objects and cards can add commands
	//
        for (let i in z) {
          if (!z[i].handleGameLoop(this, qe, mv)) { return 0; }
        }


        //
        // avoid infinite loops
        //
        if (shd_continue == 0) {
          console.log("NOT CONTINUING");
          return 0;
        }

    } // if cards in queue
    return 1;

  }





  returnPlayers(num = 0) {

    var players = [];
    let factions  = JSON.parse(JSON.stringify(this.factions));
    let factions2 = JSON.parse(JSON.stringify(this.factions));

    // < 6 player games
    if (num == 2) {
      for (let key in factions) {
	if (key !== "protestant" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 3) {
      for (let key in factions) {
	if (key !== "protestant" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 3) {
      for (let key in factions) {
	if (key !== "protestant" && key != "france" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    if (num == 4) {
      for (let key in factions) {
	if (key !== "protestant" && key != "france" && key != "ottoman" && key !== "papacy") {
	  delete factions[key];
	}
      }
    }

    for (let i = 0; i < num; i++) {

      if (i == 0) { col = "color1"; }
      if (i == 1) { col = "color2"; }
      if (i == 2) { col = "color3"; }
      if (i == 3) { col = "color4"; }
      if (i == 4) { col = "color5"; }
      if (i == 5) { col = "color6"; }

      var keys = Object.keys(factions);
      let rf = keys[this.rollDice(keys.length) - 1];

      if (i == 0) {
        if (this.game.options.player1 != undefined) {
          if (this.game.options.player1 != "random") {
            rf = this.game.options.player1;
          }
        }
      }
      if (i == 1) {
        if (this.game.options.player2 != undefined) {
          if (this.game.options.player2 != "random") {
            rf = this.game.options.player2;
          }
        }
      }
      if (i == 2) {
        if (this.game.options.player3 != undefined) {
          if (this.game.options.player3 != "random") {
            rf = this.game.options.player3;
          }
        }
      }
      if (i == 3) {
        if (this.game.options.player4 != undefined) {
          if (this.game.options.player4 != "random") {
            rf = this.game.options.player4;
          }
        }
      }
      if (i == 4) {
        if (this.game.options.player5 != undefined) {
          if (this.game.options.player5 != "random") {
            rf = this.game.options.player5;
          }
        }
      }
      if (i == 5) {
        if (this.game.options.player6 != undefined) {
          if (this.game.options.player6 != "random") {
            rf = this.game.options.player6;
          }
        }
      }

      delete factions[rf];


      players[i] = {};
      players[i].tmp_debaters_committed_reformation = 0;
      players[i].tmp_debaters_committed_translation = 0;
      players[i].tmp_debaters_committed_counter_reformation = 0;
      players[i].tmp_roll_bonus = 0;
      players[i].tmp_roll_first = 0;
      players[i].tmp_roll_modifiers = [];
      players[i].factions = [];
      players[i].factions.push(rf);
      players[i].factions_passed = [];
      players[i].factions_passed.push(false); // faction not passed
      players[i].captured = [];
      players[i].num = i;

      //
      // Each power's VP total is derived from base, special, and bonus VP. 
      // The base VP total is shown in the lower-left of the power card.
      //
      players[i].vp_base = 0;
      players[i].vp_special = 0;
      players[i].vp_bonus = 0;

    }


    if (num == 3) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] === "papacy") {
	  players[i].factions.push("hapsburg");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] === "france") {
	  players[i].factions.push("ottoman");
	  players[i].factions_passed.push(false);
	}
      }
    }

    if (num == 4) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
	if (players[i].factions[0] === "papacy") {
	  players[i].factions.push("hapsburg");
	  players[i].factions_passed.push(false);
	}
      }
    }

    if (num == 5) {
      for (let i = 0; i < players.length; i++) {
	if (players[i].factions[0] === "protestant") {
	  players[i].factions.push("england");
	  players[i].factions_passed.push(false);
	}
      }
    }

    return players;

  }

  //
  // runs each new round
  //
  resetPlayerRound(player_num) {

    this.game.state.tmp_bonus_protestant_translation_german_zone = 0;
    this.game.state.tmp_bonus_protestant_translation_french_zone = 0;
    this.game.state.tmp_bonus_protestant_translation_english_zone = 0;
    this.game.state.tmp_bonus_papacy_burn_books = 0;

    for (let i = 0; i < this.game.state.players_info[player_num-1].factions.length; i++) {
      this.game.state.players_info[player_num-1].factions_passed[i] = false;
    }
  }

  returnPlayerInfoFaction(faction) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	if (this.game.state.players_info[i].factions[z].key == faction) {
	  return this.game.state.players_info[i].factions[z];
	}
      }
    }

    return null;
  }

  //
  // runs each new turn
  //
  resetPlayerTurn(player_num) {

    this.game.state.tmp_reformations_this_turn = [];
    this.game.state.tmp_counter_reformations_this_turn = [];
    this.game.state.tmp_protestant_reformation_bonus = 0;
    this.game.state.tmp_catholic_reformation_bonus = 0;
    this.game.state.tmp_protestant_counter_reformation_bonus = 0;
    this.game.state.tmp_catholic_counter_reformation_bonus = 0;
    this.game.state.tmp_papacy_may_specify_debater = 0;
    this.game.state.tmp_papacy_may_specify_protestant_debater_unavailable = 0;

    this.deactivateDebaters();

    for (let s in this.game.spaces) {
      if (this.game.spaces[s].besieged == 2) {
	this.game.spaces[s].besieged = 1;
      }
      for (let f in this.game.spaces[s].units) {
	for (let z = 0; z < this.game.spaces[s].units[f].length; z++) {
	  this.game.spaces[s].units[f][z].already_moved = 0;
	}
      }
    }

    let p = this.game.state.players_info[(player_num-1)];
    p.tmp_debaters_committed_reformation = 0;
    p.tmp_debaters_committed_translation = 0;
    p.tmp_debaters_committed_counter_reformation = 0;
    p.tmp_roll_bonus = 0;
    p.tmp_roll_first = 0;
    p.tmp_roll_modifiers = [];
    p.has_colonized = 0;
    p.has_explored = 0;
    p.has_conquered = 0;

    this.game.state.field_battle = {};

    this.game.state.active_player = player_num;

  }

  isFactionInPlay(faction) {
    for (let i = 0; i < this.game.players.length; i++) {
      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	if (this.game.state.players_info[i].factions[z] === faction) { return 1; }
      }
    }
    return 0;
  }

  returnPlayerOfFaction(faction) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.game.state.players_info[i].factions.includes(faction)) {
	return i+1;
      }
      for (let z = 0; z < this.game.state.players_info[i].factions.length; z++) {
	let f = this.game.state.players_info[i].factions[z];
        if (this.game.state.activated_powers) {
	  if (this.game.state.activated_powers[f]) {
            if (this.game.state.activated_powers[f].includes(faction)) {
	      return (i+1);
            }
          }
        }
      }
    }
    return 0;
  }


  //
  // 1 hits to destroy everything, opt-in for naval units
  //
  playerAssignHits(faction, spacekey, hits_to_assign, naval_hits_acceptable=0) {

    let his_self = this;
    let space = spacekey;
    try { if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; } } catch (err) {}

    let selectUnitsInterface = function(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface) {

      let msg = "Hits Remaining: " + hits_to_assign;
      let html = "<ul>";
      let targets = 0;

      for (let i = 0; i < space.units[faction].length; i++) {
        if (!units_to_destroy.includes(parseInt(i))) {

	  let is_fodder = true;
          if (space.units[faction][i].land_or_sea === "sea" && naval_hits_acceptable == 0) { is_fodder = false; }
          if (space.units[faction][i].personage == true) { is_fodder = false; }

	  if (is_fodder == true) {
	    targets++;
            html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
          }
	}
      }
      html += "</ul>";

      if (targets <= 0 || hits_to_assign <= 0) {
	his_self.addMove("destroy_units\t"+faction+"\t"+spacekey+"\t"+JSON.stringify(units_to_destroy));
	his_self.endTurn();
	return;
      }

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        $('.option').off();
        let id = $(this).attr("id");

        if (!units_to_destroy.includes(id)) {
          units_to_destroy.push(parseInt(id));
        }

	if (units_available[id].type == "regular") { hits_to_assign -= 1; }
	if (units_available[id].type == "mercenary") { hits_to_assign -= 1; }
	if (units_available[id].type == "squadron") { hits_to_assign -= 1; }
	if (units_available[id].type == "corsair") { hits_to_assign -= 1; }
	if (units_available[id].type == "cavalry") { hits_to_assign -= 1; }

        selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

      });
    }

    selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

    return 0;

  }

  //
  // 2 hits to destroy a squadron, 1 for a corsair
  //
  playerAssignNavalHits(faction, hits_to_assign, spacekey) {

    let his_self = this;
    let space;

    if (this.game.spaces[spacekey]) { space = this.game.spaces[spacekey]; }
    if (this.game.navalspaces[spacekey]) { space = this.game.navalspaces[spacekey]; }

    let units_available = space.units[faction];
    let units_to_destroy = [];

    let selectUnitsInterface = function(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface) {

      let msg = "Hits Remaining: " + hits_to_assign;
      let html = "<ul>";
      let targets = 0;
      for (let i = 0; i < space.units[faction].length; i++) {
        if (space.units[faction][i].land_or_sea === "sea" || space.units[faction][i].land_or_sea === "both") {
          if (!units_to_destroy.includes(parseInt(i))) {
	    targets++;
            html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
          }
          html += "</ul>";
        }
      }

      if (targets <= 0 || hits_to_assign <= 0) {
	his_self.addMove("destroy_naval_units\t"+faction+"\t"+spacekey+"\t"+JSON.stringify(units_to_destroy));
	his_self.endTurn();
	return;
      }

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (!units_to_destroy.includes(id)) {
          units_to_destroy.push(parseInt(id));
        }

	if (units_available[id].type == "squadron") { hits_to_assign -= 2; }
	if (units_available[id].type == "corsair") { hits_to_assign -= 1; }

        selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

      });
    }

    selectUnitsInterface(his_self, units_to_destroy, hits_to_assign, selectUnitsInterface);

    return 0;

  }


  playerResolveNavalWinterRetreat(faction, spacekey) {

    let his_self = this;
    let res = this.returnNearestFactionControlledPort(faction, spacekey);

    let msg = "Select Winter Port for Naval Units in "+space.name;
    let opt = "";
    for (let i = 0; i < res.length; i++) {
      opt += `<li class="option" id="${res[i].key}">${res[i].key}</li>`;
    }

    if (res.length == 0) {
      this.endTurn();
      return 0;
    }

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      let id = $(this).attr('id');
      $(".option").off();

      his_self.addMove("retreat_to_winter_port_resolve\t"+faction+"\t"+spacekey+"\t"+id);
      his_self.endTurn();

    });

  }

  //
  // 2P variant needs automatic determination of where to retreat
  //
  autoResolveWinterRetreat(faction, spacekey) {
    let his_self = this;
    let res = this.returnNearestFriendlyFortifiedSpaces(faction, spacekey);
if (faction === "venice" && spacekey == "agram") {
  console.log("VENICE CHECK: " + JSON.stringify(res));
}
    if (res.length > 0) {
      let space = this.game.spaces[spacekey];
      let roll = this.rollDice(res.length);
      let retreat_destination = res[roll-1].key;
      his_self.game.queue.push("retreat_to_winter_spaces_resolve\t"+faction+"\t"+spacekey+"\t"+retreat_destination);
    }
  }


  

  playerResolveWinterRetreat(faction, spacekey) {

    let his_self = this;
    let res = this.returnNearestFriendlyFortifiedSpaces(faction, spacekey);
    let space = this.game.spaces[spacekey];

    let msg = "Select Winter Location for Units in "+space.name;
    let opt = "<ul>";
    for (let i = 0; i < res.length; i++) {
      opt += `<li class="option" id="${res[i].key}">${res[i].key}</li>`;
    }
    opt += "</ul>";

    if (res.length == 0) {
      this.endTurn();
      return 0;
    }


    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      let id = $(this).attr('id');
      $(".option").off();

      his_self.updateStatus("handling retreat...");
      his_self.addMove("retreat_to_winter_spaces_resolve\t"+faction+"\t"+spacekey+"\t"+id);
      his_self.endTurn();

    });

  }


  playerRetainUnitsWithFilter(faction, filter_func, num_to_retain) {

    let units_available = [];
    let units_to_retain = [];


    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
	for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (filter_func(key, i)) {
	    units_available.push({spacekey : key, idx : i});
	  }
	}
      }
    }

    let selectUnitsInterface = function(his_self, units_to_retain, units_available, selectUnitsInterface) {

      let msg = "Select Units to Retain: ";
      let html = "<ul>";
      for (let i = 0; i < units_available.length; i++) {
	let spacekey = units_available[i].spacekey;
	let unit = his_self.game.spaces[spacekey].units[faction][units_available[i].idx];
        if (units_to_retain.includes(parseInt(i))) {
          html += `<li class="option" style="font-weight:bold" id="${i}">${units_available[i].name} - (${units_available[i].spacekey})</li>`;
        } else {
          html += `<li class="option" id="${i}">${units_available[i].name} - (${units_available[i].spacekey})</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {

	  //
	  // moves prepended to last removed first
	  //
	  for (let i = units_available.length; i >= 0; i--) {
	    if (!units_to_retain.includes(i)) {
	      his_self.prependMove("destroy_unit_by_index\t"+faction+"\t"+spacekey+"\t"+units_available[i].idx);
	    }
	  }
	  his_self.endTurn();
	  return;

	}


	//
	// add unit to units available
	//
        if (units_to_retain.includes(id)) {
          let idx = units_to_retain.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
	  units_to_retain.push(id);
	}

	//
	// if this is max to retain, we end as well
	//
	if (units_to_retain.length === num_to_retain) {

	  //
	  // moves prepended to last removed first
	  //
	  for (let i = units_available.length; i >= 0; i--) {
	    if (!units_to_retain.includes(i)) {
	      his_self.prependMove("destroy_unit_by_index\t"+faction+"\t"+spacekey+"\t"+units_available[i].idx);
	    }
	  }
	  his_self.endTurn();
	  return;
	}
      });
    }

    selectUnitsInterface(his_self, units_to_retain, units_available, selectUnitsInterface);

    return 0;

  }




  returnPlayerFactions(player) {
    return this.game.state.players_info[player-1].factions;
  }


  returnActionMenuOptions(player=null, faction=null, limit="") {

    let menu = [];

if (limit === "build") {

    menu.push({
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Mercenary",
      check : this.canPlayerBuyMercenary,
      fnct : this.playerBuyMercenary,
      category : "build" ,
      img : '/his/img/backgrounds/move/mercenary.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Regular",
      check : this.canPlayerRaiseRegular,
      fnct : this.playerRaiseRegular,
      category : "build" ,
      img : '/his/img/backgrounds/move/regular.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Squadron",
      check : this.canPlayerBuildNavalSquadron,
      fnct : this.playerBuildNavalSquadron,
      category : "build" ,
      img : '/his/img/backgrounds/move/squadron.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Cavalry",
      check : this.canPlayerRaiseCavalry,
      fnct : this.playerRaiseCavalry,
      category : "build" ,
      img : '/his/img/backgrounds/move/cavalry.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Corsair",
      check : this.canPlayerBuildCorsair,
      fnct : this.playerBuildCorsair,
      category : "build" ,
      img : '/his/img/backgrounds/move/corsair.jpg',
    });

} else {

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Move",
      check : this.canPlayerMoveFormationInClear,
      fnct : this.playerMoveFormationInClear,
      category : "move" ,
      img : '/his/img/backgrounds/move/move_in_clear.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Move over Pass",
      check : this.canPlayerMoveFormationOverPass,
      fnct : this.playerMoveFormationOverPass,
      category : "move" ,
      img : '/his/img/backgrounds/move/move_over_pass.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Move across Sea",
      check : this.canPlayerNavalTransport,
      fnct : this.playerNavalTransport,
      category : "move" ,
      img : '/his/img/backgrounds/move/move_transport.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1],
      name : "Move Ships",
      check : this.canPlayerNavalMove,
      fnct : this.playerNavalMove,
      category : "move" ,
      img : '/his/img/backgrounds/move/move_fleet.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2,2,2],
      name : "Regular",
      check : this.canPlayerRaiseRegular,
      fnct : this.playerRaiseRegular,
      category : "build" ,
      img : '/his/img/backgrounds/move/regular.jpg',
    });
    menu.push({
      factions : ['hapsburg','england','france','papacy','protestant'],
      cost : [1,1,1,1,1],
      name : "Mercenary",
      check : this.canPlayerBuyMercenary,
      fnct : this.playerBuyMercenary,
      category : "build" ,
      img : '/his/img/backgrounds/move/mercenary.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Cavalry",
      check : this.canPlayerRaiseCavalry,
      fnct : this.playerRaiseCavalry,
      category : "build" ,
      img : '/his/img/backgrounds/move/cavalry.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy', 'genoa', 'scotland', 'venice'],
      cost : [2,2,2,2,2,2,2,2],
      name : "Squadron",
      check : this.canPlayerBuildNavalSquadron,
      fnct : this.playerBuildNavalSquadron,
      category : "build" ,
      img : '/his/img/backgrounds/move/squadron.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [1],
      name : "Corsair",
      check : this.canPlayerBuildCorsair,
      fnct : this.playerBuildCorsair,
      category : "build" ,
      img : '/his/img/backgrounds/move/corsair.jpg',
    });
    if (this.game.players.length == 2) {
      menu.push({
        factions : ['papacy','protestant'] ,
        cost : [1,1,1,1,1,1,1,1,1,1],
        name : "Remove Unrest",
        check : this.canPlayerRemoveUnrest,
        fnct : this.playerRemoveUnrest,
        category : "attack" ,
        img : '/his/img/backgrounds/move/control.jpg',
      });
    }
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Control",
      check : this.canPlayerControlUnfortifiedSpace,
      fnct : this.playerControlUnfortifiedSpace,
      category : "attack" ,
      img : '/his/img/backgrounds/move/control.jpg',
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant', 'genoa', 'hungary', 'scotland', 'venice'],
      cost : [1,1,1,1,1,1,1,1,1,1],
      name : "Assault",
      check : this.canPlayerAssault,
      fnct : this.playerAssault,
      category : "attack" ,
      img : '/his/img/backgrounds/move/assault.jpg',
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,2,2],
      name : "Explore",
      check : this.canPlayerExplore,
      fnct : this.playerExplore,
      category : "special" ,
      img : '/his/img/backgrounds/move/explore.jpg',
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [2,3,3],
      name : "Colonize",

      fnct : this.playerColonize,
      category : "special" ,
      img : '/his/img/backgrounds/move/colonize.jpg',
    });
    menu.push({
      factions : ['hapsburg','england','france'],
      cost : [4,4,4],
      name : "Conquer",
      check : this.canPlayerConquer,
      fnct : this.playerConquer,
      category : "special" ,
      img : '/his/img/backgrounds/move/conquer.jpg',
    });
    menu.push({
      factions : ['ottoman'],
      cost : [2],
      name : "Piracy",
      check : this.canPlayerInitiatePiracyInASea,
      fnct : this.playerInitiatePiracyInASea,
      category : "attack" ,
      img : '/his/img/backgrounds/move/piracy.jpg',
    });
    menu.push({
      factions : ['protestant'],
      cost : [1],
      name : "Translate Scripture",
      check : this.canPlayerTranslateScripture,
      fnct : this.playerTranslateScripture,
      category : "special" ,
      img : '/his/img/backgrounds/move/translate.jpg',
    });
    menu.push({
      factions : ['england','protestant'],
      cost : [3,2],
      name : "Publish Treatise",
      check : this.canPlayerPublishTreatise,
      fnct : this.playerPublishTreatise,
      category : "special" ,
      img : '/his/img/backgrounds/move/printing_press.jpg',
    });
    menu.push({
      factions : ['papacy','protestant'],
      cost : [3,3],
      name : "Convene Debate",
      check : this.canPlayerCallTheologicalDebate,
      fnct : this.playerCallTheologicalDebate,
      category : "special" ,
      img : '/his/img/backgrounds/move/theological_debate.jpg',
    });
    menu.push({
      factions : ['papacy'],
      cost : [1],
      name : "Build Saint Peters",
      check : this.canPlayerBuildSaintPeters,
      fnct : this.playerBuildSaintPeters,
      category : "special" ,
      img : '/his/img/backgrounds/move/saint_peters.png',
    });
    menu.push({
      factions : ['papacy'],
      cost : [2],
      name : "Burn Books",
      check : this.canPlayerBurnBooks,
      fnct : this.playerBurnBooks,
      category : "special" ,
      img : '/his/img/backgrounds/move/burn_books.jpg',
    });
    // Loyola reduces Jesuit University Cost
    let university_founding_cost = 3;
    if (this.canPlayerCommitDebater("papacy", "loyola-debater")) {
      let university_founding_cost = 2;
    }
    menu.push({
      factions : ['papacy'],
      cost : [university_founding_cost],
      name : "Found University",
      check : this.canPlayerFoundJesuitUniversity,
      fnct : this.playerFoundJesuitUniversity,
      category : "special" ,
      img : '/his/img/backgrounds/move/university.png',
    });
}

    //
    // major powers have limited options in 2P version
    //
    if (this.game.players.length == 2 && (faction === "hapsburg" || faction === "england" || faction === "france" || faction == "ottoman")) {
      for (let i = menu.length-1; i >= 0; i--) {
	if (menu[i].category == "build") { menu.splice(i, 1); } else {
	  if (menu[i].category == "special") { menu.splice(i, 1); } else {
  	    if (menu[i].name === "Move across Sea") { menu.splice(i, 1); }
          }
        }
      }
    } 

    if (player == null) { return menu; }

    let fmenu = [];

    for (let i = 0; i < menu.length; i++) {
      if (menu[i].factions.includes(faction)) {
        fmenu.push(menu[i]);
      }
    }

    return fmenu;

  }


  playerSelectFactionWithFilter(msg, filter_func, mycallback = null, cancel_func = null) {

    let his_self = this;
    let factions = this.returnImpulseOrder();
    let f = [];

    for (let i = 0; i < factions.length; i++) {
      if (filter_func(factions[i])) { f.push(factions[i]); }
    }

    let html = "<ul>";
    for (let i = 0; i < f.length; i++) {
      html += `<li class="option" id="${f[i]}">${f[i]}</li>`;
    }
    html += "</ul>";

    his_self.updateStatusWithOptions(msg, html);
     
    $('.option').off();
    $('.option').on('click', function () {

      let id = $(this).attr("id");
      $('.option').off();
      mycallback(id);
    });

    return 0;
  }


  playerFactionSelectCardWithFilter(faction, msg, filter_func, mycallback = null, cancel_func = null) {

    let cards = [];
    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);

    for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length; i++) {
      if (filter_func(this.game.deck[0].fhand[faction_hand_idx])) {
	cards.push(this.game.deck[0].fhand[faction_hand_idx][i]);
      }
    }

    this.updateStatusAndListCards(msg, cards);
    this.attachCardboxEvents(function(card) {
      mycallback(card, faction);
    });

  }


  countSpacesWithFilter(filter_func) {
    let count = 0;
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) { count++; }
    }
    return count;
  }

  playerSelectSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let callback_run = false;
    let at_least_one_option = false;
    let html = '';
    html += '<ul class="hide-scrollbar">';

    $('.option').off();
    $('.hextile').off();
    $('.space').off();

    this.theses_overlay.space_onclick_callback = mycallback;

    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {
        at_least_one_option = true;
        html += '<li class="option .'+key+'" id="' + key + '">' + key + '</li>';

	//
	// the spaces that are selectable are clickable on the main board (whatever board shows)
	//
	if (board_clickable) {
	  let t = "."+key;
	  document.querySelectorAll(t).forEach((el) => {
	    his_self.addSelectable(el);
	    el.onclick = (e) => {
	      e.stopPropagation();
	      e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
	      el.onclick = () => {};
	      $('.option').off();
	      $('.space').off();
	      $('.hextile').off();
              his_self.theses_overlay.space_onclick_callback = null;
	      his_self.removeSelectable();
    	      if (callback_run == false) {
	        callback_run = true;
	        mycallback(key);
	      }
	    }
	  });
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      //
      // and remove on-board clickability
      //
      if (board_clickable) {
        for (let key in his_self.game.spaces) {
          if (filter_func(his_self.game.spaces[key]) == 1) {
	    let t = "."+key;
	    document.querySelectorAll(t).forEach((el) => {
	      el.onclick = (e) => {};
	    });
	  }
	}
      }

      his_self.removeSelectable();

      $('.option').off();
      $('.space').off();
      $('.hextile').off();

      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      his_self.theses_overlay.space_onclick_callback = null;
      mycallback(action);

    });

    if (at_least_one_option) { return 1; }
    return 0;
  }

  playerSelectSpaceOrNavalSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {
    return this.playerSelectNavalSpaceWithFilter(msg, filter_func, mycallback, cancel_func, board_clickable);
  }

  playerSelectNavalSpaceWithFilter(msg, filter_func, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let at_least_one_option = false;
    let callback_run = false;

    this.theses_overlay.space_onclick_callback = mycallback;

    // remove any previous events
    $('.option').off();
    $('.hextile').off();
    $('.space').off();

    let html = '';
    html += '<ul class="hide-scrollbar">';
    for (let key in this.game.navalspaces) {
      if (filter_func(this.game.navalspaces[key]) == 1) {
	at_least_one_option = true;
        html += '<li class="option" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.querySelectorAll(`.${key}`).forEach((el) => { his_self.addSelectable(el); });
	  document.getElementById(key).onclick = (e) => {
console.log("playerSelectNavalSapceWithFilter -- before events off...");
	    $('.option').off();
     	    $('.hextile').off();
    	    $('.space').off();
	    if (callback_run == true) { return; }
	    callback_run = true;
	    e.stopPropagation();
	    e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
	    his_self.removeSelectable();
            his_self.theses_overlay.space_onclick_callback = null;
    	    if (callback_run == false) {
	      callback_run = true;
    	      his_self.updateStatus("selected...");
console.log("playerSelectNavalSapceWithFilter -- sending into callback");
	      mycallback(key);
	    }
	  }
	}
      }
    }
    for (let key in this.game.spaces) {
      if (filter_func(this.game.spaces[key]) == 1) {
        at_least_one_option = true;
        html += '<li class="option" id="' + key + '">' + key + '</li>';
	if (board_clickable) {
	  document.querySelectorAll(`.${key}`).forEach((el) => { his_self.addSelectable(el); });
	  document.getElementById(key).onclick = (e) => { 
console.log("clicked on id of key: " + key);
	    document.getElementById(key).onclick = (e) => {};
	    $('.option').off();
     	    $('.hextile').off();
    	    $('.space').off();
	    if (callback_run == true) { return; }
	    callback_run = true;
	    e.stopPropagation();
	    e.preventDefault();   // clicking on keys triggers selection -- but clicking on map will still show zoom-in
	    his_self.removeSelectable();
            his_self.theses_overlay.space_onclick_callback = null;
console.log("and calling callback...");
    	    his_self.updateStatus("selected...");
	    mycallback(key);
	    return;
	  }
	}
      }
    }
    if (cancel_func != null) {
      html += '<li class="option" id="cancel">cancel</li>';
    }
    html += '</ul>';

    this.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {
      let action = $(this).attr("id");
      if (action == "cancel") {
        cancel_func();
        return 0;
      }

      his_self.theses_overlay.space_onclick_callback = null;
      mycallback(action);

    });

    if (at_least_one_option) { return 1; }
    return 0;
  }




  playerTurn(faction, selected_card=null) {

    this.startClock();

    let his_self = this;

    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);
    let can_pass = true;

    let cards = [];
    for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length;i++) {
      let c = this.game.deck[0].fhand[faction_hand_idx][i];
      if (c === "001") { can_pass = false; }
      if (c === "002") { can_pass = false; }
      if (c === "003") { can_pass = false; }
      if (c === "004") { can_pass = false; }
      if (c === "005") { can_pass = false; }
      if (c === "006") { can_pass = false; }
      if (c === "007") { can_pass = false; }
      if (c === "008") { can_pass = false; }
      if (c === "009") { can_pass = false; }
      if (c === "010") { can_pass = false; }
      cards.push(this.game.deck[0].fhand[faction_hand_idx][i]);
      if (this.game.deck[0].cards[c].type == "mandatory") { can_pass = false; }
    } // no home card? can pass

    if (this.factions[faction].returnAdminRating() < this.game.deck[0].fhand[faction_hand_idx].length) {
      can_pass = false;
    }
    if (this.game.deck[0].fhand[faction_hand_idx].length == 0) {
      can_pass = true;
    }
    if (can_pass) {
      cards.push("pass");
    }

    this.updateStatusAndListCards("Select a Card: ", cards);
    this.attachCardboxEvents((card) => {
      try {
        $('.card').off();
        $('.card img').off();
      } catch (err) {}
      this.playerPlayCard(card, this.game.player, faction);
    });  

  }


  playerFortifySpace(faction, attacker, spacekey) {

    let space = this.game.spaces[spacekey];
    let faction_map = this.returnFactionMap(space, attacker, faction);
    let player = this.returnPlayerOfFaction(faction);

    let his_self = this;
    let units_to_move = [];
    let available_units = [];

    for (f in faction_map) { 
      if (faction_map[f] !== attacker) {
        for (let i = 0; i < space.units[f].length; i++) {
          available_units.push({ faction : f , unit_idx : i });
        }
      }
    }

    let selectUnitsInterface = function(his_self, units_to_move, available_units, selectUnitsInterface) {

      let msg = "Fortification Holds 4 Units: ";
      let html = "<ul>";

      for (let i = 0; i < available_units.length; i++) {
	let tf = available_units[i].faction;
	let tu = space.units[tf][available_units[i].unit_idx];
	if (units_to_move.includes(i)) {
          html += `<li class="option" style="font-weight:bold" id="${i}">* ${tu.name} - ${his_self.returnFactionName(tf)} *</li>`;
	} else {
          html += `<li class="option" style="" id="${i}">${tu.name} - ${his_self.returnFactionName(tf)}</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);
     
      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {

	  // faction associative array
	  let fa = {};
	  for (let f in faction_map) { fa[f] = []; };

	  // move in the units
	  for (let i = 0; i < units_to_move.length; i++) {
	    let ui = units_to_move[i];
	    let tf = available_units[ui].faction;
	    let tu = available_units[ui].unit_idx;
	    fa[tf].push(tu);
	  }

	  for (let f in fa) {
	    his_self.addMove("fortify_unit\t"+spacekey+"\t"+f+"\t"+JSON.stringify(fa[f]));
	  }
	  his_self.endTurn();

          return;
	}
        
	units_to_move.push(parseInt(id));

        selectUnitsInterface(his_self, units_to_move, available_units, selectUnitsInterface);

      });
    };

    selectUnitsInterface(his_self, units_to_move, available_units, selectUnitsInterface);

    return 0;

  }

  playerPlayDiplomacyCard(faction) {

    let p = this.returnPlayerOfFaction(faction);
    let his_self = this;

    this.updateStatusAndListCards("Select Diplomacy Card to Play", this.game.deck[1].hand);
    this.attachCardboxEvents(function(card) {

      this.updateStatus(`Playing ${this.popup(card)}`, this.game.deck[1].hand);
      his_self.addMove("diplomacy_card_event\t"+faction+"\t"+card);
      his_self.addMove("discard_diplomacy_card\t"+faction+"\t"+card);
      his_self.endTurn();
    });

  }

  playerPlayCard(card, player, faction) {
    
    this.cardbox.hide();

    if (card === "pass") {
      this.updateStatus("Passing this Round...");
      let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);
      let cards_in_hand = 0;
      if (this.game.deck[0]) {
	if (this.game.deck[0].fhand[faction_hand_idx]) {
	  if (this.game.deck[0].fhand[faction_hand_idx].length > 0) {
	    cards_in_hand = this.game.deck[0].fhand[faction_hand_idx].length;
	  }
	}
      }
      // auto updates cards_left (last entry)
      this.addMove("pass\t"+faction+"\t"+cards_in_hand);
      this.endTurn();
      return;
    }


    //
    // mandatory event cards effect first, then 2 OPS
    //
    if (this.deck[card].type === "mandatory" && this.deck[card].canEvent(this, faction)) {
      this.addMove("remove\t"+faction+"\t"+card);
      this.addMove("ops\t"+faction+"\t"+card+"\t"+2);
      this.addMove("faction_acknowledge\t"+faction+"\t"+this.returnFactionName(faction) + " now plays 2 OPs");
      this.playerPlayEvent(card, faction);
    } else {

      let html = `<ul>`;
      html    += `<li class="card" id="ops">play for ops</li>`;
      if (this.deck[card].canEvent(this, faction)) {
        html    += `<li class="card" id="event">play for event</li>`;
      }
      html    += `</ul>`;

      let pick_card_function = () => {
        this.updateStatusWithOptions(`Playing ${this.popup(card)}`, html, true);
        this.bindBackButtonFunction(() => { this.playerTurn(faction); });
        this.attachCardboxEvents((user_choice) => {
          if (user_choice === "ops") {
            let ops = this.game.deck[0].cards[card].ops;
            this.playerPlayOps(card, faction, ops);
            return;
          }
          if (user_choice === "event") {
            if (this.game.deck[0].cards[card].warn.includes(faction)) {
              let c = confirm("Unorthodox! Are you sure you want to event this card?");
              if (!c) {
                pick_card_function();
               return;
              }
              this.playerPlayEvent(card, faction);
              return;
            } else {
              this.playerPlayEvent(card, faction);
              return;
	    }
            return;
          }
        });
      }

      pick_card_function();
    }

  }

  async playerPlayOps(card="", faction, ops=null, limit="") {

    //
    // cards left
    //
    let faction_hand_idx = this.returnFactionHandIdx(this.game.player, faction);
    this.addMove("cards_left\t"+faction+"\t"+this.game.deck[0].fhand[faction_hand_idx].length);

    //
    // discard the card
    //
    if (card != "") {
      this.addMove("discard\t"+faction+"\t"+card);
      if (this.game.deck[0]) {
        if (this.game.deck[0].cards[card]) {
          if (this.game.deck[0].cards[card].ops == ops) {
            this.addEndMove("NOTIFY\t" + this.returnFactionName(faction) + " plays " + this.popup(card) + " for ops");
          }
        }
      }
    }

    let his_self = this;
    let menu = this.returnActionMenuOptions(this.game.player, faction, limit);
    let pfactions = this.returnPlayerFactions(this.game.player);

    if (ops == null) { ops = 2; }
    if (ops == 0) { console.log("OPS ARE ZERO!"); }

    //
    // "ACTIVATED POWERS" are those for whom players have the choice of moving.
    // this can be triggered through alliance with a minor power, or through a 
    // diplomacy card in the 2P game.
    //
    if (this.game.state.activated_powers[faction].length > 0) {

      let html = `<ul>`;
      html    += `<li class="card" id="${faction}">${faction}</li>`;
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
         html    += `<li class="card" id="${this.game.state.activated_powers[faction][i]}">${this.game.state.activated_powers[faction][i]}</li>`;
      }
      html    += `</ul>`;

      let ops_text = `${ops} op`;
      if (ops > 0) { ops_text += 's'; }

      this.updateStatusWithOptions(`Which Faction: ${ops_text}`, html);
      this.attachCardboxEvents(function(selected_faction) {

        menu = this.returnActionMenuOptions(this.game.player, selected_faction, limit);

	//
	// duplicates code below
	//
        let html = `<ul>`;
        for (let i = 0; i < menu.length; i++) {
	  // added ops to check() for naval transport
          if (menu[i].check(this, this.game.player, selected_faction, ops)) {
            for (let z = 0; z < menu[i].factions.length; z++) {
              if (menu[i].factions[z] === selected_faction) {
  	        if (menu[i].cost[z] <= ops) {
                  html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
                }
	        z = menu[i].factions.length+1;
              }
            }
          }
        }

        html    += `<li class="card" id="end_turn">end turn</li>`;
        html    += `</ul>`;

	let attachEventsToMenuOptions = () => {

        his_self.updateStatusWithOptions(`${his_self.returnFactionName(selected_faction)}: ${ops} ops remaining`, html, false);
        this.attachCardboxEvents(async (user_choice) => {      

	  his_self.menu_overlay.hide();

          if (user_choice === "end_turn") {
            this.endTurn();
            return;
          }

	  //
	  // cost of founding depends on Loyola
	  //
	  if (menu[user_choice].name.indexOf("University") != -1) {

	    let default_cost = 3;
    	    if (this.canPlayerCommitDebater("papacy", "loyola-debater")) {

	      let msg = "Commit Loyola to reduce cost to 2 OPs?";
      	      let html = `<ul>`;
              html += `<li class="option" id="commit">commit Loyola (2 OPs)</li>`;
              html += `<li class="option" id="donot">do not commit (3 OPs)</li>`;
	      html += '</ul>';

	      his_self.updateStatusWithOptions(msg, html);
      	      his_self.attachCardboxEvents(async (moar_user_choice) => {      

	        if (moar_user_choice === "commit") {
                  ops -= 2;
                  if (ops > 0) {
 		    his_self.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
		  }
                  his_self.addMove("commit\tpapacy\tloyola-debater\t1");
                  his_self.playerFoundJesuitUniversity(his_self, player, "papacy");
                  return;
		}

		if (moar_user_choice === "donot") {
                  ops -= 3;
		  if (ops > 0) {
 		    his_self.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
                  }
                  his_self.playerFoundJesuitUniversity(his_self, player, "papacy");
                  return;
		}

	      });

	    } else {
              ops -= 3;
	      if (ops > 0) {
 	        his_self.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit); 
              }
              menu[user_choice].fnct(this, this.game.player, selected_faction);
              return;
	    }

	  } else {

	    //
	    // sub-menu to simplify translations / st peters
	    //
	    if (menu[user_choice].name.indexOf("Peters") != -1 || menu[user_choice].name.indexOf("Translate") != -1) {

	      let msg = "How many OPs to Spend: ";
              let html = `<ul>`;
	      let desc = ['one', 'two', 'three', 'four', 'five', 'six'];
              for (let i = 1; i <= ops; i++) {
                html += `<li class="card" id="${i}">${desc[i-1]}</li>`;
              }
              html += '</ul>';

              this.updateStatusWithOptions(msg, html, false);
              this.attachCardboxEvents(async (uc) => {      

	        let ops_to_spend = parseInt(uc);
	        let ops_remaining = ops - ops_to_spend;

                if (ops_remaining > 0) {
  	          this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops_remaining+"\t"+limit);
                }
                menu[user_choice].fnct(this, this.game.player, faction, ops_to_spend);
                return;
	      });

	    } else {

              for (let z = 0; z < menu[user_choice].factions.length; z++) {
                if (menu[user_choice].factions[z] === selected_faction) {
                  ops -= menu[user_choice].cost[z];
	          z = menu[user_choice].factions.length+1;
                }
              }

              if (ops > 0) {
	        this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit);
              }
              menu[user_choice].fnct(this, this.game.player, selected_faction);
              return;

	    }
	  }
        });

	} // function

	his_self.menu_overlay.render(menu, this.game.player, selected_faction, ops, attachEventsToMenuOptions);

	attachEventsToMenuOptions();

      });
    } else {

      //
      // duplicates code above
      //
      let html = `<ul>`;
      for (let i = 0; i < menu.length; i++) {
        if (menu[i].check(this, this.game.player, faction)) {
          for (let z = 0; z < menu[i].factions.length; z++) {
            if (menu[i].factions[z] === faction) {
  	      if (menu[i].cost[z] <= ops) {
                html += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
              }
	      z = menu[i].factions.length+1;
            }
          }
        }
      }

      html    += `<li class="card" id="end_turn">end turn</li>`;
      html    += `</ul>`;

      let attachEventsToMenuOptions = () => {

      this.updateStatusWithOptions(`${this.returnFactionName(faction)}: ${ops} ops remaining`, html, false);
      this.attachCardboxEvents(async (user_choice) => {      

	his_self.menu_overlay.hide();

        if (user_choice === "end_turn") {
          this.endTurn();
          return;
        }

	//
	// sub-menu to simplify translations / st peters
	//
	if (menu[user_choice].name.indexOf("Peters") != -1 || menu[user_choice].name.indexOf("Translate") != -1) {

	  let msg = "How many OPs to Spend: ";
          let html = `<ul>`;
	  let desc = ['one', 'two', 'three', 'four', 'five', 'six'];
          for (let i = 1; i <= ops; i++) {
            html += `<li class="card" id="${i}">${desc[i-1]}</li>`;
          }
          html += '</ul>';

          this.updateStatusWithOptions(msg, html, false);
          this.attachCardboxEvents(async (uc) => {      

	    let ops_to_spend = parseInt(uc);
	    let ops_remaining = ops - ops_to_spend;

            if (ops_remaining > 0) {
  	      this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops_remaining+"\t"+limit);
            }
            menu[user_choice].fnct(this, this.game.player, faction, ops_to_spend);
            return;
	  });

	} else {

          for (let z = 0; z < menu[user_choice].factions.length; z++) {
            if (pfactions.includes(menu[user_choice].factions[z])) {
              ops -= menu[user_choice].cost[z];
  	      z = menu[user_choice].factions.length+1;
            }
          }

          if (ops > 0) {
  	    this.addMove("continue\t"+this.game.player+"\t"+faction+"\t"+card+"\t"+ops+"\t"+limit);
          }
          menu[user_choice].fnct(this, this.game.player, faction);
          return;

	}
      });


      } // attach events to menu options

      this.menu_overlay.render(menu, this.game.player, faction, ops, attachEventsToMenuOptions);
      attachEventsToMenuOptions();


    }
  }
  playerPlayEvent(card, faction, ops=null) {
    this.addMove("remove\t"+faction+"\t"+card);
    this.addMove("event\t"+faction+"\t"+card);
    this.addMove("discard\t"+faction+"\t"+card);
    this.addMove("counter_or_acknowledge\t" + this.returnFactionName(faction) + " triggers " + this.popup(card) + "\tevent\t"+card);
    this.addMove("RESETCONFIRMSNEEDED\tall");
    this.endTurn();
  }


  playerActionMenu(player) {
    let menu_options = this.returnActionMenuOptions();
  }

  async playerReformationAttempt(player) {
    this.updateStatus("Attempting Reformation Attempt");
    return;
  }
  async playerCounterReformationAttempt(player) {
console.log("1");
return;
  }

  playerPlayPapacyDiplomacyPhaseSpecialTurn(enemies=[]) {

    let his_self = this;
    let player = this.returnPlayerOfFaction("papacy");
    if (this.game.player != player) { this.updateStatus("ERROR: you are not the papacy"); return; }

    let msg = `End a War? [${JSON.stringify(enemies)}]`;
    let opt = "<ul>";
    opt += `<li class="option" id="yes">yes</li>`;
    opt += `<li class="option" id="no">no</li>`;
    opt += '</ul>';

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      $(".option").off();
      let id = $(this).attr('id');

      if (id === "no") {
	his_self.endTurn();
	return 0;
      }

      //
      // otherwise YES
      //
      let msg = `Which Faction?`;
      let opt = "<ul>";
      for (let i = 0; i < enemies.length; i++) {
        opt += `<li class="option" id="${enemies[i]}">${enemies[i]}</li>`;
      }
      opt += '</ul>';

      his_self.updateStatusWithOptions(msg, opt);

      $(".option").off();
      $(".option").on('click', function () {

	let enemy = $(this).attr('id');

        //
        // otherwise YES
        //
        let msg = `How would you like to End the War?`;
        let opt = "<ul>";
	if ((enemy == "hapsburg" && his_self.game.state.excommunicated_faction["hapsburg"] != 1) || (enemy == "france" && his_self.game.state.excommunicated_faction["france"] != 1)) {
          opt += `<li class="option" id="005">Papal Bull</li>`;
	}
        opt += `<li class="option" id="sue">sue for peace</li>`;
        opt += '</ul>';

        his_self.updateStatusWithOptions(msg, opt);

        $(".option").off();
        $(".option").on('click', function () {

	  let method = $(this).attr('id');

	  if (method === "005") {

	    //
	    // excommunicate faction 
	    //
	    his_self.addMove("excommunicate_faction\t"+enemy);

	    //
	    // factions no longer At War
	    //
	    his_self.addMove("unset_enemies\tpapacy\t"+enemy);

	    //
	    // regain control of home space, or draw card
	    //
    	    let msg = `Regain Home Space or Draw Card?`;
    	    let opt = "<ul>";
    	    opt += `<li class="option" id="regain">regain home space</li>`;
    	    opt += `<li class="option" id="draw">draw card</li>`;
    	    opt += '</ul>';

	    his_self.updateStatusWithOptions(msg, opt);

	    $(".option").off();
	    $(".option").on('click', function () {

	      let action2 = $(this).attr('id');

	      if (action2 === "draw") {
                his_self.addMove("hand_to_fhand\t1\t"+his_self.game.player+"\t"+"papacy");
                his_self.addMove(`DEAL\t1\t${his_self.game.player}\t1`);
		his_self.endTurn();
	      }

	      if (action2 === "regain") {

    	        his_self.playerSelectSpaceWithFilter(

                  "Select Home Space to Recapture" ,

        	  function(space) {
	            if (space.home === "papacy" && space.political !== "papacy") {
		      return 1;
		    }
		  },

      		  function(spacekey) {
                    his_self.addMove(`control\tpapacy\t${spacekey}`);
                    his_self.addMove(`withdraw_to_nearest_fortified_space\t${enemy}\t${spacekey}`);
	            his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t{his_self.game.state.protestant_war_winner_wp+1)}`);
		    his_self.endTurn();
		  },

	    	  cancel_func,

	    	  true 

	  	);

	      }

	    });

	  }

	  if (method === "sue") {

	    //
	    // protestants get War Winner 1 VP
	    //
	    his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t{his_self.game.state.protestant_war_winner_wp+1)}`);

	    //
	    // papacy removes 2 units
	    //
            his_self.playerSelectSpaceOrNavalSpaceWithFilter(
              `Select Space to Remove 1st Unit` ,
              function(space) {
	        if (space.units["papacy"].length > 0) { return 1; }
		return 0;
              },
              function(spacekey) {
	        let land_or_sea = "land";
	        let space = null;
	        if (his_self.game.navalspaces[spacekey]) {
	  	  land_or_sea = "sea";
		  space = his_self.game.navalspaces[spacekey];
	        } else {
		  space = his_self.game.spaces[spacekey];
	        }
	        if (space == null) {
		  alert("ERROR: not sure where you clicked - reload to continue");
		  return 1;
	        }
	        let faction_to_destroy = "papacy";
   	        let msg = "Destroy Which Unit: ";
                let unittypes = [];
                let html = '<ul>';
                for (let i = 0; i < space.units[faction_to_destroy].length; i++) {
                  if (space.units[faction_to_destroy][i].admin_rating == 0) {
                    if (!unittypes.includes(space.units[faction_to_destroy][i].unittype)) {
                      html += `<li class="option" id="${space.units[faction_to_destroy][i].unittype}">${space.units[faction_to_destroy][i].unittype}</li>`;
                      unittypes.push(space.units[faction_to_destroy][i].unittype);
                    }
                  }
                }
                html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);
                $('.option').off();
                $('.option').on('click', function () {
                  let unittype = $(this).attr("id");
                  his_self.removeUnit(faction_to_destroy, spacekey, unittype);
                  his_self.displaySpace(spacekey);
                  his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
	    	  //
	          // papacy removes 2 units
	          //
                  his_self.playerSelectSpaceOrNavalSpaceWithFilter(
                    `Select Space to Remove 1st Unit` ,
                    function(space) {
	              if (space.units["papacy"].length > 0) { return 1; }
		      return 0;
                    },
                    function(spacekey) {
	              let land_or_sea = "land";
	              let space = null;
	              if (his_self.game.navalspaces[spacekey]) {
	  	        land_or_sea = "sea";
		        space = his_self.game.navalspaces[spacekey];
	              } else {
		        space = his_self.game.spaces[spacekey];
	              }
	              if (space == null) {
		        alert("ERROR: not sure where you clicked - reload to continue");
		        return 1;
	              }
	              let faction_to_destroy = "papacy";
   	              let msg = "Destroy Which Unit: ";
                      let unittypes = [];
                      let html = '<ul>';
                      for (let i = 0; i < space.units[faction_to_destroy].length; i++) {
                        if (space.units[faction_to_destroy][i].admin_rating == 0) {
                          if (!unittypes.includes(space.units[faction_to_destroy][i].unittype)) {
                            html += `<li class="option" id="${space.units[faction_to_destroy][i].unittype}">${space.units[faction_to_destroy][i].unittype}</li>`;
                            unittypes.push(space.units[faction_to_destroy][i].unittype);
                          }
                        }
                      }
                      html += '</ul>';
                      his_self.updateStatusWithOptions(msg, html);
                      $('.option').off();
                      $('.option').on('click', function () {
                        let unittype = $(this).attr("id");
                        his_self.removeUnit(faction_to_destroy, spacekey, unittype);
                        his_self.displaySpace(spacekey);
                        his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
			let z = false;
                        his_self.addMove("player_play_papacy_regain_spaces_for_vp");
		        his_self.endTurn();
		      });
	            },
	            0 ,
	            1
	          );
		});
	      },
	      0 ,
	      1
	    );
	  }	
	});
      });
    });

    return 0;

  }

  playerPlayPapacyRegainSpacesForVP(faction) {
 
    let spaces = his_self.returnSpacesWithFilter(
      function(spacekey) {
	if (his_self.game.spaces[spacekey].home == "papacy" && his_self.game.spaces[spacekey].political == faction) { return true; }
        return false;
      }
    ); 

    if (spaces.length == 0) {
      his_self.endTurn();
      return;
    }

    let msg = "Do you wish to Regain Home Space for 1 VP: ";
    let opt = "<ul>";
    opt += `<li class="option" id="regain">regain and give VP</li>`;
    opt += `<li class="option" id="skip">skip</li>`;
    opt += '</ul>';

    this.updateStatusWithOptions(msg, opt);

    $(".option").off();
    $(".option").on('click', function () {

      $(".option").off();
      let id = $(this).attr('id');

      if (id === "skip") {
	his_self.endTurn();
	return;
      }

      if (id === "regain") {
        his_self.playerSelectSpaceWithFilter(

          "Select Home Space to Recapture" ,

          function(space) {
	    if (space.home === "papacy" && space.political !== "papacy") {
	      return 1;
	    }
	  },

      	  function(spacekey) {
            his_self.addMove(`control\tpapacy\t${spacekey}`);
            his_self.addMove(`withdraw_to_nearest_fortified_space\t${faction}\t${spacekey}`);
	    his_self.addMove(`SETVAR\tstate\tprotestant_war_winner_vp\t{his_self.game.state.protestant_war_winner_wp+1)}`);
            his_self.addMove("player_play_papacy_regain_spaces_for_vp");
	    his_self.endTurn();
	  },

	  null,

	  true 

        );

      }

    });

  }


  playerPlaySpringDeployment(faction, player) {

    let his_self = this;
    let capitals = this.factions[faction].capitals;
    let viable_capitals = [];
    let can_deploy = 0;
    let units_to_move = [];
    let cancel_func = null;
    let source_spacekey;

    for (let i = 0; i < capitals.length; i++) {
      let c = capitals[i];
      if (this.game.spaces[c].units[faction].length > 0) {
        can_deploy = 1;
        viable_capitals.push(capitals[i]);
      }
    }

    if (can_deploy == 0) {
      this.updateStatus("Spring Deployment not possible");
      this.endTurn();
    } else {

      let msg = "Spring Deploy from: ";
     
      let opt = "<ul>";
      for (let i = 0; i < viable_capitals.length; i++) {
	opt += `<li class="option" id="${viable_capitals[i]}">${viable_capitals[i]}</li>`;
      }
      opt += `<li class="option" id="pass">skip</li>`;
      opt += '</ul>';

      this.updateStatusWithOptions(msg, opt);

      $(".option").off();
      $(".option").on('click', function () {

        let id = $(this).attr('id');

        $(".option").off();

	source_spacekey = id;

	if (id === "pass") {
	  his_self.updateStatus("passing...");
	  his_self.endTurn();
	  return;
        }

       his_self.playerSelectSpaceWithFilter(

          "Select Destination for Units from Capital: ",

          function(space) {
            if (his_self.isSpaceFriendly(space, faction)) {
              if (his_self.isSpaceConnectedToCapitalSpringDeployment(space, faction)) {
                if (!his_self.isSpaceFactionCapital(space, faction)) {
                  return 1;
		}
              }
            }
            return 0;
          },


          function(destination_spacekey) {

            let space = his_self.spaces[source_spacekey];

	    //
	    // spring deployment doesn't have this, so we wrap the sending/end-move
	    // action in this dummy function so that the same UI can be used for 
	    // multiple movement options, with the normal one including intervention
	    // checks etc.
	    //
	    let selectDestinationInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

	      // MOVE THE UNITS
	      units_to_move.sort(function(a, b){return parseInt(a)-parseInt(b)});

              for (let i = 0; i < units_to_move.length; i++) {
                his_self.addMove("move\t"+faction+"\tland\t"+source_spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
              }
              his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" spring deploys to "+his_self.game.spaces[destination_spacekey].name);
              his_self.addMove("RESETCONFIRMSNEEDED\tall");
              his_self.endTurn();
              return;

	    };

            let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) { 

	      let mobj = {
		space : space ,
		faction : faction ,
		source : source_spacekey ,
		destination : destination_spacekey ,
 	      }
   	      his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface

console.log("A");
	      let max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, source_spacekey);
	      if (faction != his_self.game.state.events.spring_preparations) { if (max_formation_size > 5) { max_formation_size = 5; } }

	      let msg = "Max Formation Size: " + max_formation_size + " units";

              let html = "<ul>";
              for (let i = 0; i < space.units[faction].length; i++) {
                if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
                  if (units_to_move.includes(parseInt(i))) {
                    html += `<li class="option" style="font-weight:bold" id="${i}">* ${space.units[faction][i].name} *</li>`;
                  } else {
                    html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
                  }
                }
              }
              html += `<li class="option" id="end">finish</li>`;
              html += "</ul>";

              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {

                let id = $(this).attr("id");

                if (id === "end") {
		  his_self.movement_overlay.hide();
		  selectDestinationInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
                  return;
                }

		//
		// check for max formation size
		//
		let unitno = 0;
		for (let i = 0; i < units_to_move.length; i++) {
		  if (space.units[faction][units_to_move[i]].command_value == 0) { unitno++; }
		  if (unitno >= max_formation_size) { 
		    max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, source_spacekey);
	            if (unitno >= max_formation_size) { 
	              alert("Maximum Formation Size: " + max_formation_size);
	              return;
		    }
		  }
		}

	        if (units_to_move.includes(id)) {
	          let idx = units_to_move.indexOf(id);
	          if (idx > -1) {
  		    units_to_move.splice(idx, 1);
	          }
	        } else {
	          if (!units_to_move.includes(parseInt(id))) {
	            units_to_move.push(parseInt(id));
	          } else {
		    for (let i = 0; i < units_to_move.length; i++) {
		      if (units_to_move[i] === parseInt(id)) {
		        units_to_move.splice(i, 1);
		        break;
		      }
		    }
	          }
	        }

                selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);

              });
            }
            selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
          },

	  null ,

	  true

        );
      });
    }
  }

  returnMaxFormationSize(units_to_move, faction = "", spacekey = "") {

    let utm = [];
    if (units_to_move.length > 0) {
      if (typeof units_to_move[0] != "number") {
        utm = units_to_move;
      } else {
        for (let i = 0; i < units_to_move.length; i++) { utm.push(this.game.spaces[spacekey].units[faction][units_to_move[i]]); }
      }
    }

    let command_value_one = 0;
    let command_value_two = 0;
    let max_command_value = 0;

    for (let i = 0; i < utm.length; i++) {
      if (utm[i].command_value > 0) {
        // we can have up to two army leaders combine command values
	if (command_value_one == 0) {
	  command_value_one = utm[i].command_value; 
	} else {
	  if (command_value_two == 0) {
	    command_value_one = utm[i].command_value;
	  } else {
	    if (command_value_one > command_value_two && utm[i].command_value > command_value_one) {
	      command_value_one = utm[i].command_value;
	    } else {
	      if (command_value_one < command_value_two && utm[i].command_value > command_value_two) {
	        command_value_two = utm[i].command_value;
	      }
	    }
	  }
	}

	max_command_value = command_value_one + command_value_two;
      }
    }

    if (max_command_value > 4) { return max_command_value; }
    return 4;

  }

  async playerMoveFormationInClear(his_self, player, faction) {

    let units_to_move = [];
    let cancel_func = null;
    let spacekey = "";
    let space = null;
    let protestant_player = his_self.returnPlayerOfFaction("protestant");

	//
	// first define the functions that will be used internally
	//
	let selectDestinationInterface = function(his_self, units_to_move) {  
    	  his_self.playerSelectSpaceWithFilter(

            "Select Destination for these Units",

      	    function(space) {
	      // no-one can move into electorates before schmalkaldic league forms
              if (his_self.game.player != protestant_player && his_self.game.state.events.schmalkaldic_league == 0) {
		if (space.type == "electorate") { return 0; }
	      }
	      if (space.neighbours.includes(spacekey)) {
	        if (!space.pass) { 
		  return 1; 
		} else {
 		  if (!space.pass.includes(spacekey)) {
		    return 1;
		  } else {
		    return 0;
		  }
		}
	  	return 1;
              }
	      return 0;
            },

      	    function(destination_spacekey) {
	
	      units_to_move.sort(function(a, b){return parseInt(a)-parseInt(b)});

	      let does_movement_include_cavalry = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
		if (units_to_move[i].type === "cavalry") {
		  does_movement_include_cavalry = 1;
		}
	      }

	      his_self.addMove("interception_check\t"+faction+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
	      }
              his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" moving to "+his_self.game.spaces[destination_spacekey].name + "\tmove");
	      his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      his_self.endTurn();

	    },

	    cancel_func,

	    true 

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

          space = his_self.game.spaces[spacekey];

	  let mobj = {
	    space : space ,
	    faction : faction ,
   	    source : spacekey ,
	    destination : "" ,
 	  }
   	  his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface

	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	  let msg = "Max Formation Size: " + max_formation_size + " units";
	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	      if (space.units[faction][i].locked != true && (his_self.game.state.events.foul_weather != 1 && space.units[faction][i].already_moved != 1)) {
	        if (units_to_move.includes(parseInt(i))) {
	          html += `<li class="option" style="font-weight:bold" id="${i}">*${space.units[faction][i].name}*</li>`;
	        } else {
	          html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
	        }
	      }
	    }
	  }
	  html += `<li class="option" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let id = $(this).attr("id");

	    if (id === "end") {
	      his_self.movement_overlay.hide();
	      selectDestinationInterface(his_self, units_to_move);
	      return;
	    }

	    //
	    // check for max formation size
	    //
	    let unitno = 0;
	    for (let i = 0; i < units_to_move.length; i++) {
	      if (space.units[faction][units_to_move[i]].command_value == 0) { unitno++; }
	      if (unitno >= max_formation_size) { 
		max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	        if (unitno >= max_formation_size) { 
	          alert("Maximum Formation Size: " + max_formation_size);
	          return;
		}
	      }
	    }

	    if (units_to_move.includes(id)) {
	      let idx = units_to_move.indexOf(id);
	      if (idx > -1) {
  		units_to_move.splice(idx, 1);
	      }
	    } else {
	      if (!units_to_move.includes(parseInt(id))) {
	        units_to_move.push(parseInt(id));
	      } else {
		for (let i = 0; i < units_to_move.length; i++) {
		  if (units_to_move[i] === parseInt(id)) {
		    units_to_move.splice(i, 1);
		    break;
		  }
		}
	      }
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}
	//
	// end select units
	//


    his_self.playerSelectSpaceWithFilter(

      "Select Town from which to Move Units:",

      function(space) {
	for (let z in space.units) {
	  if (space.units[z].length > 0 && faction === z) {
	    return 1;
          }
	}
	return 0;
      },

      function(skey) {

	spacekey = skey;

        let space = his_self.game.spaces[spacekey];

	//
	// is this a rapid move ?
	//
	let max_formation_size = his_self.returnMaxFormationSize(space.units[faction]);
	let units_in_space = his_self.returnFactionLandUnitsInSpace(faction, space);
	let can_we_quick_move = false;
	if (max_formation_size >= units_in_space) { can_we_quick_move = true; }

	if (can_we_quick_move == true) {

	  let msg = "Choose Movement Option: ";
	  let html = "<ul>";
	  html += `<li class="option" id="auto">move everything (auto)</li>`;
	  html += `<li class="option" id="manual">select units (manual)</li>`;
	  html += "</ul>";
	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

	    $('.option').off();
            let id = $(this).attr("id");

	    if (id === "auto") {
	      for (let i = 0; i < space.units[faction].length; i++) {
		let u = space.units[faction][i];
		if (u.type === "cavalry" || u.type === "regular" || u.type === "mercenary" || u.command_value > 0 || u.battle_rating > 0) {
		  if (u.locked != true && (his_self.game.state.events.foul_weather != 1 || u.already_moved != 1)) { 
		    units_to_move.push(i);
		  } else {
		    his_self.updateLog("Some units unable to auto-move because of Foul Weather");
		  }
		}
	      }
	      selectDestinationInterface(his_self, units_to_move);
	      return;
	    }

	    if (id === "manual") {
	      //
	      // we have to move manually
	      //
	      selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	      return;
	    }

	  });

	} else {

	  //
	  // we have to move manually
	  //
	  selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  return;

	}
      },

      cancel_func,

      true,

    );

  }

  playerSelectUnitsWithFilterFromSpacesWithFilter(faction, space_filter_func, unit_filter_func, num=1, must_select_max=true, mycallback=null) {

    let his_self = this;
    let selected = [];

    let selectSpacesInterface = function(his_self, selected, selectSpacesInterface) {

      his_self.playerSelectSpaceWithFilter(

        ("Select Space of Unit" + (selected.length+1)),

	space_filter_func,

        function(spacekey) {

	  let options = [];
	  let space = his_self.game.spaces[spacekey];
	  let units = space.units[faction];
	  let num_remaining = num - selected.length;

          for (let i = 0; i < units; i++) {
	    if (unit_filter_func(units[i])) {
	      let add_this_unit = true;
	      for (let z = 0; z < selected.length; z++) {
		if (z.spacekey == spacekey && i === unit_idx) { add_this_unit = false; }
	      }
	      if (add_this_unit == true) {
	        options.push({ spacekey : spacekey, unit : units[i] , unit_idx : i });
	      }
	    }
	  }

  	  his_self.playerSelectOptions(options, num_remaining, false, function(array_of_unit_idxs) {

	    //
	    // selected options copied to selected
	    //
	    for (let i = 0; i < array_of_unit_idxs.length; i++) {
	      let add_this_unit = true;
	      for (let z = 0; z < selected.length; z++) {
		if (selected[z].spacekey == options[array_of_unit_idxs[i]].spacekey && selected[z].unit_idx === array_of_unit_idxs[i]) { add_this_unit = false; }
	      }
	      if (add_this_unit == true) {
		selected.push(options[array_of_unit_idxs[i]]);
	      }
	    }

	    //    
	    // still more needed?    
	    //    
	    let num_remaining = num - selected.length;
	    if (num_remaining > 0) {
	      selectSpacesInterface(his_self, selected, selectSpacesInterface);
	    } else {
	      mycallback(selected);
	    }

	  });
	},

	null,

	true 
      );
    }

    selectSpacesInterface(his_self, selected, selectSpacesInterface);

  }

  playerSelectOptions(options, num=1, must_select_max=true, mycallback=null) {

    let his_self = this;
    let options_selected = [];
    let cancel_func = null;

    let selectOptionsInterface = function(his_self, options_selected, selectOptionsInterface) {

      let remaining = num - options_selected.length;

      let msg = `Select From Options: (${remaining} remaining)`;
      let html = "<ul>";
      for (let i = 0; i < options.length; i++) {
        if (options_selected.includes(parseInt(i))) {
	  html += `<li class="option" style="font-weight:bold" id="${i}">${options[i]}</li>`;
	} else {
          html += `<li class="option" id="${i}">${options[i]}</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

          let id = $(this).attr("id");

	  if (id === "end") {
	    if (mycallback != null) {
	      mycallback(options_selected);
	      return;
	    } else {
	      return options_selected;
	    }
	  }

          if (options_selected.includes(id)) {
	    let idx = options_selected.indexOf(id);
	    if (idx > -1) {
  	      options_selected.splice(idx, 1);
	    }
	  } else {
	    if (!options_selected.includes(id)) {
	      options_selected.push(id);
	    } else {
	      for (let i = 0; i < options_selected.length; i++) {
	        if (options_selected[i] === id) {
		  options_selected.splice(i, 1);
		  break;
		}
	      }
	    }
	  }

	  if (options_selected.length == num) {
	    if (mycallback != null) {
	      mycallback(options_selected);
	      return;
	    } else {
	      return options_selected;
	    }
	  }


	  selectOptionsInterface(his_self, options_selected, selectOptionsInterface);
      });

    }

    selectOptionsInterface(his_self, options_selected, selectOptionsInterface);
	
  }


  playerEvaluateNavalRetreatOpportunity(faction, spacekey) {

    let his_self = this;
    let retreat_destination = "";

    let space;
    if (his_self.game.spaces[spacekey]) { space = his_self.game.spaces[spacekey]; }
    if (his_self.game.navalspaces[spacekey]) { space = his_self.game.navalspaces[spacekey]; }

    let neighbours = this.returnNavalAndPortNeighbours(spacekey);
    let retreat_options = 0;
    for (let i = 0; i < neighbours.length; i++) {
      if (this.canFactionRetreatToNavalSpace(faction, neighbours[i])) {
	retreat_options++;
      }
    }

    if (retreat_options == 0) {
      his_self.updateLog("Naval retreat not possible...");
      his_self.endTurn();
      return 0;
    }

    let onFinishSelect = function(his_self, destination_spacekey) {
      his_self.addMove("naval_retreat"+"\t"+faction+"\t"+spacekey+"\t"+"\t"+destination_spacekey);
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {
      let html = "<ul>";
      for (let i = 0; i < neighbours.length; i++) {
        if (this.canFactionNavalRetreatToSpace(defender, neighbours[i])) {
          html += `<li class="option" id="${neighbours[i]}">${neighbours[i]}</li>`;
	}
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Destination for Naval Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");
        onFinishSelect(his_self, id);
      });
    };


    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="skip">do not retreat</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Retreat from ${spacekey}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "retreat") {
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }



  playerEvaluateBreakSiegeRetreatOpportunity(attacker, spacekey) {

    let his_self = this;
    let retreat_destination = "";
    let space_name = this.game.spaces[spacekey].name;

    let onFinishSelect = function(his_self, destination_spacekey) {
      his_self.addMove("retreat"+"\t"+attacker+"\t"+spacekey+"\t"+destination_spacekey);
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {

      let space = his_self.game.spaces[spacekey];

      let html = "<ul>";
      for (let i = 0; i < space.neighbours.length; i++) {
        if (his_self.canFactionRetreatToSpace(attacker, space.neighbours[i])) {
          html += `<li class="option" id="${space.neighbours[i]}">${his_self.game.spaces[space.neighbours[i]].key}</li>`;
        }
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Destination for Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");
        onFinishSelect(his_self, id);
      });

    };

    
    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    html    += `<li class="card" id="skip">sacrifice forces</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Break Siege and Retreat: ${space_name}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "retreat") {
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }




  playerEvaluateRetreatOpportunity(attacker, spacekey, attacker_comes_from_this_spacekey="", defender, is_attacker_loser=false) {

    let his_self = this;
    let retreat_destination = "";
    let space_name = this.game.spaces[spacekey].name;

    let onFinishSelect = function(his_self, destination_spacekey) {
      if (is_attacker_loser) {
        his_self.addMove("retreat"+"\t"+attacker+"\t"+spacekey+"\t"+destination_spacekey);
      } else {
        his_self.addMove("retreat"+"\t"+defender+"\t"+spacekey+"\t"+destination_spacekey);
      }
      his_self.endTurn();
    };

    let selectDestinationInterface = function(his_self, selectDestinationInterface, onFinishSelect) {

      let space = his_self.game.spaces[spacekey];

      let html = "<ul>";
      for (let i = 0; i < space.neighbours.length; i++) {
	if (is_attacker_loser) {
          if (his_self.canFactionRetreatToSpace(attacker, space.neighbours[i], attacker_comes_from_this_spacekey)) {
            html += `<li class="option" id="${space.neighbours[i]}">${his_self.game.spaces[space.neighbours[i]].key}</li>`;
	  }
	} else {
          if (his_self.canFactionRetreatToSpace(defender, space.neighbours[i], attacker_comes_from_this_spacekey)) {
            html += `<li class="option" id="${space.neighbours[i]}">${his_self.game.spaces[space.neighbours[i]].key}</li>`;
	  }
	}
      }
      html += "</ul>";

      his_self.updateStatusWithOptions("Choose Destination for Retreat: ", html);

      $('.option').off();
      $('.option').on('click', function () {
        let id = $(this).attr("id");
        onFinishSelect(his_self, id);
      });

    };

    
    let html = `<ul>`;
    html    += `<li class="card" id="retreat">retreat</li>`;
    if (is_attacker_loser) { 
      html    += `<li class="card" id="skip">sacrifice forces</li>`;
    } else {
      html    += `<li class="card" id="skip">do not retreat</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Retreat from ${space_name}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "retreat") {
	selectDestinationInterface(his_self, selectDestinationInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }





  playerEvaluateFortification(attacker, faction, spacekey) {

    let his_self = this;

    let html = `<ul>`;
    html    += `<li class="card" id="fortify">withdraw into fortification</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Withdraw Units into Fortification?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "fortify") {
	his_self.addMove("fortification\t"+attacker+"\t"+faction+"\t"+spacekey);
	his_self.endTurn();
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }





  playerEvaluateInterceptionOpportunity(attacker, spacekey, attacker_includes_cavalry, defender, defender_spacekey) {

    let his_self = this;

    let units_to_move = [];

    let onFinishSelect = function(his_self, units_to_move) {
      his_self.addMove("intercept"+"\t"+attacker+"\t"+spacekey+"\t"+attacker_includes_cavalry+"\t"+defender+"\t"+defender_spacekey+"\t"+JSON.stringify(units_to_move));
      his_self.endTurn();
    };

    let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, onFinishSelect) {

      let max_formation_size = his_self.returnMaxFormationSize(units_to_move, defender, defender_spacekey);
      let msg = "Max Formation Size: " + max_formation_size + " units";
      let space = his_self.game.spaces[defender_spacekey];

      let html = "<ul>";

      for (let i = 0; i < space.units[defender].length; i++) {
        if (space.units[defender][i].land_or_sea === "land" || space.units[defender][i].land_or_sea === "both") {
	  if (space.units[defender][i].locked != true) {
            if (units_to_move.includes(parseInt(i))) {
              html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[defender][i].name}</li>`;
            } else {
              html += `<li class="option" id="${i}">${space.units[defender][i].name}</li>`;
            }
          }
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      let mobj = {
	space : space ,
	faction : defender ,
	source : defender_spacekey ,
	destination : spacekey ,
      }

      his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, onFinishSelect); // no destination interface

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
          onFinishSelect(his_self, units_to_move);
          return;
        }

        if (units_to_move.includes(id)) {
          let idx = units_to_move.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
          units_to_move.push(parseInt(id));
        }

        selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
      });
    };


    let html = `<ul>`;
    html    += `<li class="card" id="intercept">intercept</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Intercept from ${defender_spacekey}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "intercept") {
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }






  playerEvaluateNavalInterceptionOpportunity(attacker, spacekey, defender, defender_spacekey) {

    let his_self = this;

    let units_to_move = [];

    let onFinishSelect = function(his_self, units_to_move) {
      his_self.addMove("naval_intercept"+"\t"+attacker+"\t"+spacekey+"\t"+"\t"+defender+"\t"+defender_spacekey+"\t"+JSON.stringify(units_to_move));
      his_self.endTurn();
    };

    let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, onFinishSelect) {

      let msg = "Select Units to Intercept: ";
      let space;
      if (his_self.game.spaces[defender_spacekey]) {
        space = his_self.game.spaces[defender_spacekey];
      }
      if (his_self.game.navalspaces[defender_spacekey]) {
        space = his_self.game.navalspaces[defender_spacekey];
      }

      let html = "<ul>";

      for (let i = 0; i < space.units[defender].length; i++) {
        if (space.units[defender][i].land_or_sea === "sea" || space.units[defender][i].land_or_sea === "both") {
          if (units_to_move.includes(parseInt(i))) {
            html += `<li class="option" style="font-weight:bold" id="${i}">${space.units[defender][i].name}</li>`;
          } else {
            html += `<li class="option" id="${i}">${space.units[defender][i].name}</li>`;
          }
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
          onFinishSelect(his_self, units_to_move);
          return;
        }

        if (units_to_move.includes(id)) {
          let idx = units_to_move.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
          units_to_move.push(parseInt(id));
        }

        selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
      });
    };


    let html = `<ul>`;
    html    += `<li class="card" id="intercept">intercept</li>`;
    html    += `<li class="card" id="skip">skip</li>`;
    html    += `</ul>`;

    this.updateStatusWithOptions(`Intercept from ${defender_spacekey}?`, html);
    this.attachCardboxEvents(function(user_choice) {
      if (user_choice === "intercept") {
	selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, onFinishSelect);
        return;
      }
      if (user_choice === "skip") {
	his_self.endTurn();
        return;
      }
    });

  }




  canPlayerNavalTransport(his_self, player, faction, ops) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (ops < 2) { return 0; }
    let spaces_with_infantry = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      if (his_self.game.spaces[spaces_with_infantry[i]].ports.length == 0) {
	spaces_with_infantry.splice(i, 1);
	i--;
      }
    }

    if (spaces_with_infantry.length == 0) { return 0; }

    for (let i = 0; i < spaces_with_infantry.length; i++) {
      let dest = his_self.returnNavalTransportDestinations(faction, spaces_with_infantry[i], ops);
      if (dest.length > 0) { return 1; }
    }

    return 0;

  }
  async playerNavalTransport(his_self, player, faction) {

    let spaces_with_infantry = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      if (!his_self.game.spaces[spaces_with_infantry[i]].ports.length > 0) {
	spaces_with_infantry.splice(i, 1);
	i--;
      }
    }

    let html = `<ul>`;
    for (let i = 0; i < spaces_with_infantry.length; i++) {
      html    += `<li class="option" id="${i}">${spaces_with_infantry[i]}</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Transport from Which Port?`, html);
    this.attachCardboxEvents(function(user_choice) {

      let dest = his_self.returnNavalTransportDestinations(faction, spaces_with_infantry[user_choice], ops);
       
      let html = `<ul>`;
      for (let i = 0; i < dest.length; i++) {
        html    += `<li class="option" id="${i}">${dest[i].key} (${desk[i].cost} CP)</li>`;
      }
      html    += `</ul>`;

      his_self.updateStatusWithOptions(`Select Destination:`, html);
      his_self.attachCardboxEvents(function(destination) {
        his_self.endTurn();
      });
    });

  }


  async playerNavalTransport(his_self, player, faction) {
    his_self.endTurn();
    return;
  }

  // 1 = yes, 0 = no / maybe
  canPlayerPlayCard(faction, card) {
    let player = this.returnPlayerOfFaction(faction);
    if (this.game.player == player) { 
      let faction_hand_idx = this.returnFactionHandIdx(player, faction);
      for (let i = 0; i < this.game.deck[0].fhand[faction_hand_idx].length; i++) {
        let c = this.game.deck[0].fhand[faction_hand_idx][i];
  	if (c === card) { return 1; }
      }
    }
    return 0;
  }

  canPlayerCommitDebater(faction, debater) {

    if (faction !== "protestant" && faction !== "papacy") { return false; }

    if (this.game.state.debater_committed_this_impulse[faction] == 1) { return false; }   

    if (this.isBurned(debater)) { return false; }

    let already_committed = false;
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {

        if (this.game.state.debaters[i].active == 1 && this.game.state.debaters[i].faction === "papacy" && faction === "papacy") {}
        if (this.game.state.debaters[i].active == 1 && this.game.state.debaters[i].faction === "protestant" && faction !== "papacy") { return false; }
        if (this.game.state.debaters[i].committed == 1) { return false; }

        let is_mine = false;

        if (this.game.state.debaters[i].faction === "papacy" && faction === "papacy") {
          is_mine = true;               
        }
        if (this.game.state.debaters[i].faction !== "papacy" && faction === "protestant") {
          is_mine = true;
        }
    
        if (is_mine == true) {
          if (this.game.state.debaters[i].active == 1) { already_comitted = true; }
        }
      }
    }
    return !already_committed;
  } 
    

  canPlayerMoveFormationOverPass(his_self, player, faction) {
    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }
    let spaces_with_units = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_with_units.length; i++) {
      if (his_self.game.spaces[spaces_with_units[i]].pass.length > 0) {
        for (let z = 0; z < his_self.game.spaces[spaces_with_units[i]].units[faction].length; z++) {
  	  if (his_self.game.spaces[spaces_with_units[i]].units[faction][z].locked != true) {
	    return 1;
	  }
        }
      }
    }
    return 0;
  }

  async playerMoveFormationOverPass(his_self, player, faction) {

    let units_to_move = [];
    let cancel_func = null;
    let spacekey = "";
    let space = null;
    let protestant_player = his_self.returnPlayerOfFaction("protestant");

	//
	// first define the functions that will be used internally
	//
	let selectDestinationInterface = function(his_self, units_to_move) {  
    	  his_self.playerSelectSpaceWithFilter(

            "Select Destination for these Units",

      	    function(space) {
	      // no-one can move into electorates before schmalkaldic league forms
              if (his_self.game.player != protestant_player && his_self.game.state.events.schmalkaldic_league == 0) {
		if (space.type == "electorate") { return 0; }
	      }
	      if (space.neighbours.includes(spacekey)) {
		if (space.pass) {
		  if (space.pass.includes(spacekey)) { return 1; }
		}
              }
	      return 0;
            },

      	    function(destination_spacekey) {
	
	      units_to_move.sort(function(a, b){return parseInt(a)-parseInt(b)});

	      let does_movement_include_cavalry = 0;
	      for (let i = 0; i < units_to_move.length; i++) {
		if (units_to_move[i].type === "cavalry") {
		  does_movement_include_cavalry = 1;
		}
	      }

	      his_self.addMove("interception_check\t"+faction+"\t"+destination_spacekey+"\t"+does_movement_include_cavalry);
	      for (let i = 0; i < units_to_move.length; i++) {
		his_self.addMove("move\t"+faction+"\tland\t"+spacekey+"\t"+destination_spacekey+"\t"+units_to_move[i]);
	      }
              his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" moving to "+his_self.game.spaces[destination_spacekey].name + "\tmove");
	      his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      his_self.endTurn();

	    },

	    cancel_func,

	    true 

	  );
	}

	let selectUnitsInterface = function(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface) {

          space = his_self.game.spaces[spacekey];

	  let mobj = {
	    space : space ,
	    faction : faction ,
   	    source : spacekey ,
	    destination : "" ,
 	  }
   	  his_self.movement_overlay.render(mobj, units_to_move, selectUnitsInterface, selectDestinationInterface); // no destination interface

	  let max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	  let msg = "Max Formation Size: " + max_formation_size + " units";
	  let html = "<ul>";
	  for (let i = 0; i < space.units[faction].length; i++) {
	    if (space.units[faction][i].land_or_sea === "land" || space.units[faction][i].land_or_sea === "both") {
	      if (space.units[faction][i].locked != true && (his_self.game.state.events.foul_weather != 1 && space.units[faction][i].already_moved != 1)) {
	        if (units_to_move.includes(parseInt(i))) {
	          html += `<li class="option" style="font-weight:bold" id="${i}">*${space.units[faction][i].name}*</li>`;
	        } else {
	          html += `<li class="option" id="${i}">${space.units[faction][i].name}</li>`;
	        }
	      }
	    }
	  }
	  html += `<li class="option" id="end">finish</li>`;
	  html += "</ul>";

	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let id = $(this).attr("id");

	    if (id === "end") {
	      his_self.movement_overlay.hide();
	      selectDestinationInterface(his_self, units_to_move);
	      return;
	    }

	    //
	    // check for max formation size
	    //
	    let unitno = 0;
	    for (let i = 0; i < units_to_move.length; i++) {
	      if (space.units[faction][units_to_move[i]].command_value == 0) { unitno++; }
	      if (unitno >= max_formation_size) { 
		max_formation_size = his_self.returnMaxFormationSize(units_to_move, faction, spacekey);
	        if (unitno >= max_formation_size) { 
	          alert("Maximum Formation Size: " + max_formation_size);
	          return;
		}
	      }
	    }

	    if (units_to_move.includes(id)) {
	      let idx = units_to_move.indexOf(id);
	      if (idx > -1) {
  		units_to_move.splice(idx, 1);
	      }
	    } else {
	      if (!units_to_move.includes(parseInt(id))) {
	        units_to_move.push(parseInt(id));
	      } else {
		for (let i = 0; i < units_to_move.length; i++) {
		  if (units_to_move[i] === parseInt(id)) {
		    units_to_move.splice(i, 1);
		    break;
		  }
		}
	      }
	    }

	    selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  });
	}
	//
	// end select units
	//


    his_self.playerSelectSpaceWithFilter(

      "Select Town from which to Move Units:",

      function(space) {
	for (let z in space.units) {
	  let fluis = his_self.returnFactionLandUnitsInSpace(z, space);
	  if (space.pass.length > 0 && fluis > 0 && faction === z) {
	    return 1;
          }
	}
	return 0;
      },

      function(skey) {

	spacekey = skey;

        let space = his_self.game.spaces[spacekey];

	//
	// is this a rapid move ?
	//
	let max_formation_size = his_self.returnMaxFormationSize(space.units[faction]);
	let units_in_space = his_self.returnFactionLandUnitsInSpace(faction, space);
	let can_we_quick_move = false;
	if (max_formation_size >= units_in_space) { can_we_quick_move = true; }

	if (can_we_quick_move == true) {

	  let msg = "Choose Movement Option: ";
	  let html = "<ul>";
	  html += `<li class="option" id="auto">move everything (auto)</li>`;
	  html += `<li class="option" id="manual">select units (manual)</li>`;
	  html += "</ul>";
	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

	    $('.option').off();
            let id = $(this).attr("id");

	    if (id === "auto") {

	      for (let i = 0; i < space.units[faction].length; i++) {
		let u = space.units[faction][i];
		if (u.type === "cavalry" || u.type === "regular" || u.type === "mercenary" || u.command_value > 0) {
		  if (u.locked != true && (his_self.game.state.events.foul_weather != 1 || u.already_moved != 1)) { 
		    units_to_move.push(i);
		  } else {
		    his_self.updateLog("Some units unable to auto-move because of Foul Weather");
		  }
		}
	      }
	      selectDestinationInterface(his_self, units_to_move);
	      return;
	    }

	    if (id === "manual") {
	      //
	      // we have to move manually
	      //
	      selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	      return;
	    }

	  });

	} else {

	  //
	  // we have to move manually
	  //
	  selectUnitsInterface(his_self, units_to_move, selectUnitsInterface, selectDestinationInterface);
	  return;

	}
      },

      cancel_func,

      true,

    );

  }

  canPlayerNavalMove(his_self, player, faction) {

    if (his_self.game.state.events.foul_weather) { console.log("Foul Weather - cannot naval move"); return 0; }

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    // 2P game, papacy+protestant can move minor + allied naval units during their own turn
    if (his_self.game.players.length == 2) {
      if (his_self.doesFactionHaveNavalUnitsOnBoard(faction)) {
	if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {
	  return 1;
	}
      }
    }

    if (his_self.doesFactionHaveNavalUnitsOnBoard(faction)) { return 1; }
    return 0;

  }
  async playerNavalMove(his_self, player, faction) {

    let units_to_move = [];
    let units_available = his_self.returnFactionNavalUnitsToMove(faction);

    let selectUnitsInterface = function(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface) {

      let msg = "Select Unit to Move";
      let html = "<ul>";
      for (let i = 0; i < units_available.length; i++) {
	let spacekey = units_available[i].spacekey;
	let unit = units_available[i];
        if (units_to_move.includes(parseInt(i))) {
          html += `<li class="option" style="font-weight:bold" id="${i}">${units_available[i].name} (${units_available[i].spacekey} -> ${units_available[i].destination})</li>`;
        } else {
          html += `<li class="option" id="${i}">${units_available[i].name} (${units_available[i].spacekey})</li>`;
        }
      }
      html += `<li class="option" id="end">finish</li>`;
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

        if (id === "end") {
	  let destinations = {};

	  for (let i = 0; i < units_to_move.length; i++) {
	    let unit = units_available[units_to_move[i]];
	    if (!destinations[unit.destination]) {
	      his_self.addMove("naval_interception_check\t"+faction+"\t"+unit.destination);
	      destinations[unit.destination] = 1;
	    }
	  }


	  let revised_units_to_move = [];
	  let entries_to_loop = units_to_move.length;	
	  for (let z = 0; z < entries_to_loop; z++) {

	    let highest_idx = 0;
	    let highest_num = 0;

	    for (let y = 0; y < units_to_move.length; y++) {
   	      let unit = units_available[units_to_move[y]];
	      let max_num = unit.idx;
	      let max_idx = y;
	      if (max_num > highest_num) {
		highest_idx = max_idx;
		highest_num = max_num;
	      }
	    }

	    revised_units_to_move.unshift(JSON.parse(JSON.stringify(units_available[units_to_move[highest_idx]])));
	    units_to_move.splice(highest_idx, 1);
	  }

	  //
	  // revised units to move is
	  //
	  for (let i = 0; i < revised_units_to_move.length; i++) {
	    let unit = revised_units_to_move[i];
            his_self.addMove("move\t"+faction+"\tsea\t"+unit.spacekey+"\t"+unit.destination+"\t"+revised_units_to_move[i].idx);
	  }
          his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" shifting naval forces\tnavalmove");
	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.endTurn();
	  return;

	}

	//
	// add unit to units available
	//
        if (units_to_move.includes(id)) {
          let idx = units_to_move.indexOf(id);
          if (idx > -1) {
            units_to_move.splice(idx, 1);
          }
        } else {
          if (!units_to_move.includes(parseInt(id))) {
            units_to_move.push(parseInt(id));
            selectDestinationInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
          } else {
            for (let i = 0; i < units_to_move.length; i++) {
              if (units_to_move[i] === parseInt(id)) {
                units_to_move.splice(i, 1);
      	        selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);
                break;
              }
            }
          }
        }
      });
    }

    let selectDestinationInterface = function(his_self, unit_to_move, units_available, selectUnitsInterface, selectDestinationInterface) {

      //
      // unit selected will always be last in array
      //
      let unit = units_available[unit_to_move[unit_to_move.length-1]];

      let destinations = his_self.returnNavalMoveOptions(unit.spacekey);

      let msg = "Select Destination";
      let html = "<ul>";
      for (let i = 0; i < destinations.length; i++) {
	let spacekey = destinations[i];
        html += `<li class="option" style="font-weight:bold" id="${spacekey}">${spacekey}</li>`;
      }
      html += "</ul>";

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        let id = $(this).attr("id");

	unit.destination = id;
        selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);

      });

    }

    selectUnitsInterface(his_self, units_to_move, units_available, selectUnitsInterface, selectDestinationInterface);

  }

  canPlayerMoveFormationInClear(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let spaces_with_units = his_self.returnSpacesWithFactionInfantry(faction);
    if (spaces_with_units.length > 0) { 
      let any_unlocked_units = false;
      for (let i = 0; i < spaces_with_units.length; i++) {
       for (let z = 0; z < his_self.game.spaces[spaces_with_units[i]].units[faction].length; z++) {
	  if (his_self.game.spaces[spaces_with_units[i]].units[faction][z].locked != true) {
	    // need to be non-pass moves available
	    if (his_self.game.spaces[spaces_with_units[i]].neighbours.length > his_self.game.spaces[spaces_with_units[i]].pass.length) {
	      return 1;
	    }
	  }
	}
      }
    }
    return 0;
  }

  canPlayerBuyMercenary(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  playerBuyMercenary(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Mercenary",

      function(space) {
        if (his_self.isSpaceFriendly(space, faction) && space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
  }

  canPlayerRaiseRegular(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  async playerRaiseRegular(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Destination for Regular",

      function(space) {
        if (his_self.isSpaceFriendly(space, faction) && space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerBuildNavalSquadron(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  async playerBuildNavalSquadron(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Naval Squadron",

      function(space) {
        if (space.ports.length === 0) { return 0; }
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"squadron"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }

  canPlayerAssault(his_self, player, faction) {

    if (his_self.game.state.events.foul_weather) { return 0; }

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (!his_self.isSpaceControlled(conquerable_spaces[i], faction)) {
        if (his_self.game.spaces[conquerable_spaces[i]].besieged == 1) {
	  if (!his_self.game.state.spaces_assaulted_this_turn.includes(conquerable_spaces[i])) {

	    //
	    // now check if there are squadrons in the port or sea protecting the town
	    //
	    let space = his_self.game.spaces[conquerable_spaces[i]];

	    let squadrons_protecting_space = his_self.returnNumberOfSquadronsProtectingSpace(conquerable_spaces[i]);
	    if (squadrons_protecting_space == 0) { return 1; }

	    let attacker_squadrons_adjacent = 0;
	    for (let y = 0; y < his_self.game.spaces[conquerable_spaces[i]].ports.length; y++) {
	      let p = his_self.game.spaces[conquerable_spaces[i]].ports[y];
	      for (let z = 0; z < his_self.game.navalspaces[p].units[faction].length; z++) {
		let u = his_self.game.navalspaces[p].units[faction][z];
		if (u.type == "squadron") { attacker_squadrons_adjacent++; }
	      }
	    }

	    if (attacker_squadrons_adjacent > squadrons_protecting_space) { return 1; }

	  }
	}
      }
    }

    return 0;
  }
  async playerAssault(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Space for Siege/Assault: ",

      function(space) {
        if (!his_self.isSpaceControlled(space, faction) && his_self.returnFactionLandUnitsInSpace(faction, space) > 0 && space.besieged == 1) {
          if (his_self.game.spaces[space.key].type === "fortress") {
  	    return 1;
	  }
          if (his_self.game.spaces[space.key].type === "electorate") {
  	    return 1;
	  }
          if (his_self.game.spaces[space.key].type === "key") {
  	    return 1;
	  }
        }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("assault\t"+faction+"\t"+destination_spacekey);
        his_self.addMove("counter_or_acknowledge\t"+his_self.returnFactionName(faction)+" announces siege of "+his_self.game.spaces[destination_spacekey].name + "\tassault");
        his_self.addMove("RESETCONFIRMSNEEDED\tall");
	his_self.endTurn();
      },

    );
  }

  // 2P requires only that it is in protestant or catholic religious influence
  canPlayerRemoveUnrest(his_self, player, faction) {
    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (his_self.game.spaces[spaces_in_unrest[i]].religion == "protestant" && faction == "protestant") { return 1; }
      if (his_self.game.spaces[spaces_in_unrest[i]].religion == "catholic" && faction == "papacy") { return 1; }
    }
    return 0;
  }
  canPlayerControlUnfortifiedSpace(his_self, player, faction) {
 
    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (!his_self.isSpaceControlled(spaces_in_unrest[i]), faction) { 
	let neighbours = his_self.game.spaces[spaces_in_unrest[i]];
	for (let z = 0; z < neighbours.length; z++) {
	  if (his_self.returnFactionLandUnitsInSpace(faction, neighbours[z]) > 0) {
	    return 1;
	  } 
	}
	if (his_self.returnFactionLandUnitsInSpace(faction, spaces_in_unrest[i]) > 0) {
	  return 1;
	} 
      }
    }
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (!his_self.isSpaceControlled(conquerable_spaces[i], faction)) { 
	if (his_self.game.spaces[conquerable_spaces[i]].besieged != 1 && his_self.game.spaces[conquerable_spaces[i]].besieged != 2) {
	  return 1;
	}
      } 
    }
    return 0;
  }
  async playerRemoveUnrest(his_self, player, faction) {
    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let spaces_to_fix = [];
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (faction == "protestant" && his_self.game.spaces[spaces_in_unrest[i]].religion == "protestant"){spaces_to_fix.push(spaces_in_unrest[i]);}
      if (faction == "papacy" && his_self.game.spaces[spaces_in_unrest[i]].religion == "catholic"){spaces_to_fix.push(spaces_in_unrest[i]);}
    }

    his_self.playerSelectSpaceWithFilter(

      "Select Space to Remove Unrest:",

      function(space) {
        if (spaces_to_fix.includes(space.key)) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("remove_unrest\t"+faction+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
    return 0;
  }
  canPlayerExplore(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (his_self.game.state.players_info[player-1].has_explored == 0) { return 1; }
    return 0;
  }
  async playerControlUnfortifiedSpace(his_self, player, faction) {
    let spaces_in_unrest = his_self.returnSpacesInUnrest();
    let pacifiable_spaces_in_unrest = [];
    for (let i = 0; i < spaces_in_unrest.length; i++) {
      if (!his_self.isSpaceControlled(spaces_in_unrest[i], faction)) { 
	let neighbours = his_self.game.spaces[spaces_in_unrest[i]];
	for (let z = 0; z < neighbours.length; z++) {
	  if (his_self.returnFactionLandUnitsInSpace(faction, neighbours[z]) > 0) { pacifiable_spaces_in_unrest.push(spaces_in_unrest[i]); } 
	}
	if (his_self.returnFactionLandUnitsInSpace(faction, spaces_in_unrest[i]) > 0) { pacifiable_spaces_in_unrest.push(spaces_in_unrest[i]); } 
      }
    }
    let conquerable_spaces = his_self.returnSpacesWithFactionInfantry(faction);
    for (let i = 0; i < conquerable_spaces.length; i++) {
      if (his_self.isSpaceControlled(conquerable_spaces[i], faction) || his_self.game.spaces[conquerable_spaces[i]].besieged == 1 || his_self.game.spaces[conquerable_spaces[i]].besieged == 2) {
	conquerable_spaces.splice(i, 1);
	i--;
      }
    }

    his_self.playerSelectSpaceWithFilter(

      "Select Space to Pacify:",

      function(space) {
        if (pacifiable_spaces_in_unrest.includes(space.key)) { return 1; }
        if (conquerable_spaces.includes(space.key) && !his_self.isSpaceControlled(space.key, faction) && !his_self.isSpaceFriendly(space.key, faction)) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("pacify\t"+faction+"\t"+destination_spacekey);
	his_self.endTurn();
      },

      null,

      true

    );
    return 0;
  }
  canPlayerExplore(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (his_self.game.state.players_info[player-1].has_explored == 0) { return 1; }
    return 0;
  }
  async playerExplore(his_self, player, faction) {
    his_self.game.state.players_info[player-1].has_explored = 1;
console.log("10");
return;
  }
  canPlayerColonize(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (his_self.game.state.players_info[player-1].has_conquered == 0) { return 1; }
    return 0;
  }
  async playerColonize(his_self, player, faction) {
    his_self.game.state.players_info[player-1].has_colonized = 1;
console.log("11");
return;
  }
  canPlayerConquer(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (his_self.game.state.players_info[player-1].has_conquered == 0) { return 1; }
    return 0;
  }
  async playerConquer(his_self, player, faction) {
    his_self.game.state.players_info[player-1].has_conquered = 1;
console.log("12");
return;
  }
  canPlayerInitiatePiracyInASea(his_self, player, faction) {

    if (his_self.game.state.events.foul_weather) { return 0; }

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    if (faction === "ottoman" && his_self.game.events.ottoman_piracy_enabled == 1) { return 1; }
    return 0;
  }
  async playerInitiatePiracyInASea(his_self, player, faction) {
console.log("13");
return;
  }
  canPlayerRaiseCavalry(his_self, player, faction) {

    // no for protestants early-game
    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league == 0) { return false; }

    return 1;
  }
  async playerRaiseCavalry(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Naval Squadron",

      function(space) {
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }
  canPlayerBuildCorsair(his_self, player, faction) {
    if (faction === "ottoman" && his_self.game.events.ottoman_corsairs_enabled == 1) { return 1; }
    return 0;
  }
  async playerBuildCorsair(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Port for Corsair",

      function(space) {
        if (space.owner === faction) { return 1; }
        if (space.home === faction) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
	his_self.addMove("build\tsea\t"+faction+"\t"+"corsair"+"\t"+destination_spacekey);
	his_self.endTurn();
      },

    );
  }
  canPlayerTranslateScripture(his_self, player, faction) {
    if (faction === "protestant") { return 1; }
    return 0;
  }
  async playerTranslateScripture(his_self, player, faction, ops=1) {

    let msg = "Select Work to Translate:";
    let html = '<ul>';

    if (his_self.game.state.translations['new']['german'] < 6) {
      html += '<li class="option german" style="" id="1">German (new testament)</li>';
    }
    if (his_self.game.state.translations['new']['french'] < 6) {
      html += '<li class="option french" style="" id="2">French (new testament)</li>';
    }
    if (his_self.game.state.translations['new']['english'] < 6) {
      html += '<li class="option english" style="" id="3">English (new testament)</li>';
    }
    if (his_self.game.state.translations['full']['german'] < 10 && his_self.game.state.translations['new']['german'] >= 6) {
      html += '<li class="option german" style="" id="4">German (full bible)</li>';
    }
    if (his_self.game.state.translations['full']['french'] < 10 && his_self.game.state.translations['new']['french'] >= 6) {
      html += '<li class="option french" style="" id="5">French (full bible)</li>';
    }
    if (his_self.game.state.translations['full']['english'] < 10 && his_self.game.state.translations['new']['english'] >= 6) {
      html += '<li class="option english" style="" id="6">English (full bible)</li>';
    }
    html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      let id = parseInt($(this).attr("id"));
      his_self.language_zone_overlay.hide();

      if (id == 1 || id == 4) {
	his_self.addMove("translation\tgerman\t"+ops);
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in German Language Zone\ttranslation_german_language_zone\tgerman\t"+faction);
      }
      if (id == 2 || id == 5) { 
	his_self.addMove("translation\tfrench\t"+ops); 
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in French Language Zone\ttranslation_french_language_zone\tfrench\t"+faction);
      }
      if (id == 3 || id == 6) { 
	his_self.addMove("translation\tenglish\t"+ops);
	his_self.addMove("counter_or_acknowledge\tProtestants Translate in English Language Zone\ttranslation_english_language_zone\tenglish\t"+faction);
      }
      // we only ask for our own CONFIRMS
      his_self.addMove("RESETCONFIRMSNEEDED\t"+his_self.game.player);
      his_self.endTurn();

    });

  }
  canPlayerPublishTreatise(his_self, player, faction) {
    if (faction === "protestant") { return 1; }
    if (faction === "england") {
      if (his_self.isPersonageOnMap("england", "cranmer") != null) {
	return 1;
      }
    }
    return 0;
  }
  async playerPublishTreatise(his_self, player, faction) {

    if (faction === "protestant") {

      let msg = "Select Language Zone for Reformation Attempts:";
      let html = '<ul>';
          html += '<li class="option german" style="" id="german">German</li>';
          html += '<li class="option english" style="" id="english">English</li>';
          html += '<li class="option french" style="" id="french">French</li>';
          html += '<li class="option spanish" style="" id="spanish">Spanish</li>';
          html += '<li class="option italian" style="" id="italian">Italian</li>';
          html += '</ul>';

      //
      // show visual language zone selector
      //
      his_self.language_zone_overlay.render();

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('click', function () {

        $('.option').off();
        his_self.language_zone_overlay.hide();

        let id = $(this).attr("id");

	if (id === "french" && his_self.canPlayerCommitDebater("protestant", "calvin-debater") && his_self.game.player === his_self.returnPlayerOfFaction("protestant")) {

          let msg = "Use Calvin Debater Bonus +1 Attempt:";
          let html = '<ul>';
          html += '<li class="option" style="" id="calvin-debater">Yes, Commit Calvin</li>';
          html += '<li class="option" style="" id="no">No</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('mouseover', function () {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.show(action2);
            }
          });
          $('.option').on('mouseout', function () {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.hide(action2);
            }
          });
          $('.option').on('click', function () {
            let id = $(this).attr("id");

	    his_self.updateStatus("submitting...");
	    his_self.addMove("hide_overlay\tpublish_treatise\tfrench");
	    his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	    if (id === "calvin-debater") {
	      his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    }
	    his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    his_self.addMove("protestant_reformation\t"+player+"\tfrench");
	    his_self.addMove("show_overlay\tpublish_treatise\tfrench");
	    if (id === "calvin-debater") {
	      his_self.addMove("commit\tprotestant\tcalvin_debater\t1");
	    }
	    his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	    his_self.endTurn();

	    return 0;
	  });

	  return 0;
        }


	if (id === "german" && his_self.canPlayerCommitDebater("protestant", "carlstadt-debater") && his_self.game.player === his_self.returnPlayerOfFaction("protestant")) {

          let msg = "Use Carlstadt Debater Bonus +1 Attempt:";
          let html = '<ul>';
          html += '<li class="option" style="" id="carlstadt-debater">Yes, Commit Carlstadt</li>';
          html += '<li class="option" style="" id="no">No</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('mouseover', function () {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.show(action2);
            }
          });
          $('.option').on('mouseout', function () {
            let action2 = $(this).attr("id");
            if (his_self.debaters[action2]) {
              his_self.cardbox.hide(action2);
            }
          });
          $('.option').on('click', function () {
            let id = $(this).attr("id");

	    his_self.updateStatus("submitting...");
	    his_self.cardbox.hide();

	    his_self.addMove("hide_overlay\tpublish_treatise\tgerman");
	    his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	    if (id === "carlstadt-debater") {
	      his_self.addMove("SETVAR\tstate\tevents\tcarlstadt_debater\t0");
	      his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    }
	    his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    his_self.addMove("protestant_reformation\t"+player+"\tgerman");
	    his_self.addMove("show_overlay\tpublish_treatise\tgerman");
	    if (id === "carlstadt-debater") {
	      his_self.addMove("commit\tprotestant\tcarlstadt-debater\t1");
	      his_self.addMove("SETVAR\tstate\tevents\tcarlstadt_debater\t1");
	    }
	    his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	    his_self.endTurn();

	    return 0;
	  });

	  return 0;
        }

	his_self.addMove("hide_overlay\tpublish_treatise\t"+id);
	his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.addMove("protestant_reformation\t"+player+"\t"+id);
	his_self.addMove("protestant_reformation\t"+player+"\t"+id);
	his_self.addMove("show_overlay\tpublish_treatise\t"+id);
	his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.endTurn();
      });

    }


    if (faction === "england") {
      let id = "england";
      his_self.addMove("protestant_reformation\t"+player+"\t"+id);
      his_self.addMove("protestant_reformation\t"+player+"\t"+id);
      his_self.endTurn();
    }

    return 0;
  }
  canPlayerCallTheologicalDebate(his_self, player, faction) {
//
// TODO
//
// If all Protestant debaters in a language zone are committed, the Protestant player may not initiate debates in that language zone. Similarly, if all Papal debaters are committed, the Papal player may not initiate debates in any language zone. If none of the Protestant debaters for a language zone have entered the game (or all of them have been burnt at the stake, excommuni- cated, or removed from play), neither player may call a debate in that zone. 
//
    if (his_self.returnNumberOfUncommittedDebaters(faction) <= 0) { return 0; }
    if (his_self.game.state.events.wartburg == 1) { if (faction === "protestant") { return 0; } }
    if (faction === "protestant") { return 1; }
    if (faction === "papacy") { return 1; }
    return 0;
  }
  async playerCallTheologicalDebate(his_self, player, faction) {

    let msg = "Select Language Zone for Theological Debate:";
    let html = '<ul>';

    if (his_self.returnDebatersInLanguageZone("german", "protestant")) { 
        html += '<li class="option german" style="" id="german">German</li>';
    }
    if (his_self.returnDebatersInLanguageZone("french", "france")) { 
        html += '<li class="option french" style="" id="french">French</li>';
    }
    if (his_self.returnDebatersInLanguageZone("english", "france")) { 
        html += '<li class="option english" style="" id="english">English</li>';
    }
        html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', (e) => {

      $('.option').off();
      let language_zone = e.currentTarget.id;
      let opponent_faction = "protestant";
      if (faction != "papacy") { opponent_faction = "papacy"; }

      let msg = "Against Commited or Uncommited Debater?";
      let html = '<ul>';
      if (0 < his_self.returnDebatersInLanguageZone(language_zone, opponent_faction, 1)) {
          html += '<li class="option" id="committed">Committed</li>';
      }
      if (0 < his_self.returnDebatersInLanguageZone(language_zone, opponent_faction, 0)) {
          html += '<li class="option" id="uncommitted">Uncommitted</li>';
      }
      html += '</ul>';

      his_self.updateStatusWithOptions(msg, html);

      $('.option').off();
      $('.option').on('mouseover', function () {
        let action2 = $(this).attr("id");
        his_self.cardbox.show(action2);
      });
      $('.option').on('mouseout', function () {
        let action2 = $(this).attr("id");
        his_self.cardbox.hide(action2);
      });
      $('.option').on('click', function () {

        let committed = $(this).attr("id");

        his_self.language_zone_overlay.hide();

        if (committed === "committed") { committed = 1; } else { committed = 0; }

        if (faction === "papacy") {
	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+committed);
        } else {
    	  his_self.addMove("theological_debate");
          his_self.addMove("counter_or_acknowledge\tProtestants call a theological debate\tdebate");
          his_self.addMove("RESETCONFIRMSNEEDED\tall");
    	  his_self.addMove("pick_first_round_debaters\tprotestant\tpapacy\t"+language_zone+"\t"+committed);
        }
        his_self.endTurn();

      });
    });

    return 0;

  }
  canPlayerBuildSaintPeters(his_self, player, faction) {
    if (faction === "papacy") {
      if (his_self.game.state.saint_peters_cathedral['vp'] < 5) { return 1; }
    }
    return 0;
  }
  async playerBuildSaintPeters(his_self, player, faction, ops=1) {
    for (let z = 0; z < ops; z++) {
      his_self.addMove("build_saint_peters\t"+player+"\t"+faction);
    }
    his_self.endTurn();
    return 0;
  }
  canPlayerBurnBooks(his_self, player, faction) {
    if (faction === "papacy") { return 1; }
    return 0;
  }
  async playerBurnBooks(his_self, player, faction) {

    let msg = "Select Language Zone for Counter Reformations";
    let html = '<ul>';
        html += '<li class="option german" style="" id="german">German</li>';
        html += '<li class="option english" style="" id="english">English</li>';
        html += '<li class="option french" style="" id="french">French</li>';
        html += '<li class="option spanish" style="" id="spanish">Spanish</li>';
        html += '<li class="option italian" style="" id="italian">Italian</li>';
        html += '</ul>';

    //
    // show visual language zone selector
    //
    his_self.language_zone_overlay.render();

    his_self.updateStatusWithOptions(msg, html);

    $('.option').off();
    $('.option').on('click', function () {

      $('.option').off();
      his_self.language_zone_overlay.hide();
      let id = $(this).attr("id");

      if ((his_self.canPlayerCommitDebater("papacy", "cajetan-debater") || his_self.canPlayerCommitDebater("papacy", "tetzel-debater") || his_self.canPlayerCommitDebater("papacy", "caraffa")) && his_self.game.player === his_self.returnPlayerOfFaction("papacy")) {

        let msg = "Commit Debater for Burn Books Bonus:";
        let html = '<ul>';
        html += '<li class="option" style="" id="no">No</li>';
	if (his_self.canPlayerCommitDebater("papacy", "tetzel-debater")) {
          html += '<li class="option" style="" id="tetzel-debater">Tetzel +1 to St Peters</li>';
	}
	if (his_self.canPlayerCommitDebater("papacy", "cajetan-debater")) {
          html += '<li class="option" style="" id="cajetan-debater">Cajetan +1 Attempt</li>';
	}
	if (his_self.canPlayerCommitDebater("papacy", "caraffa-debater")) {
          html += '<li class="option" style="" id="caraffa-debater">Caraffa +1 Attempt</li>';
        }
	html += '</ul>';

        his_self.updateStatusWithOptions(msg, html);

        $('.option').off();
        $('.option').on('mouseover', function () {
          let action2 = $(this).attr("id");
          if (his_self.debaters[action2]) {
            his_self.cardbox.show(action2);
          }
        });
        $('.option').on('mouseout', function () {
          let action2 = $(this).attr("id");
          if (his_self.debaters[action2]) {
            his_self.cardbox.hide(action2);
          }
        });
        $('.option').on('click', function () {
          let id2 = $(this).attr("id");

	  his_self.cardbox.hide();

	  if (id2 === "tetzel-debater") {
            his_self.addMove("build_saint_peters");
            his_self.addMove("commit\tpapacy\ttetzel-debater\t1");
	  }

	  his_self.addMove("hide_overlay\tburn_books\t"+id);
	  his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	  if (id2 === "cajetan-debater" || id2 === "caraffa-debater") {
	    if (id2 === "cajetan-debater") { his_self.addMove("commit\tpapacy\tcajetan-debater\t1"); }
	    if (id2 === "caraffa-debater") { his_self.addMove("commit\tpapacy\tcaraffa-debater\t1"); }
            his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
	  }
          his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
          his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
	  his_self.addMove("show_overlay\tburn_books\t"+id);
	  his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	  his_self.endTurn();

	  return 0;
	});

	return 0;
      }

      his_self.addMove("hide_overlay\tburn_books\t"+id);
      his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
      his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
      his_self.addMove("catholic_counter_reformation\t"+player+"\t"+id);
      his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
      his_self.addMove("show_overlay\tburn_books\t"+id);
      his_self.endTurn();
    });

    return 0;
  }
  canPlayerFoundJesuitUniversity(his_self, player, faction) {
    if (faction === "papacy" && his_self.game.state.events.papacy_may_found_jesuit_universities == 1) { return 1; }
    return 0;
  }
  async playerFoundJesuitUniversity(his_self, player, faction) {

    his_self.playerSelectSpaceWithFilter(

      "Select Catholic-Controlled Space for Jesuit University",

      function(space) {
        if (space.religion === "catholic" &&
            space.university != 1) { return 1; }
	return 0;
      },

      function(destination_spacekey) {
        his_self.addMove("found_jesuit_university\t"+destination_spacekey);
	his_self.endTurn();
      },

    );

    return 0;
  }

  playerPlaceUnitsInSpaceWithFilter(unittype, num, faction, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;

    his_self.playerSelectSpaceWithFilter(

      `Place ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {
        
	his_self.addUnit(faction, spacekey, unittype);
	his_self.displaySpace(spacekey);
        his_self.addMove("build\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);	

	if (num == 1) {
          his_self.endTurn();
	} else {
  	  his_self.playerPlaceUnitsInSpaceWithFilter(unittype, num-1, faction, filter_func, mycallback, cancel_func, board_clickable);
	}
      },

      cancel_func ,

      board_clickable 
    );
  }


  playerRemoveUnitsInSpaceWithFilter(unittype, num, faction, filter_func=null, mycallback = null, cancel_func = null, board_clickable = false) {

    let his_self = this;
    let placed = 0;

    his_self.playerSelectSpaceWithFilter(

      `Remove ${his_self.units[unittype].name} (${num})` ,

      filter_func ,

      function(spacekey) {

	his_self.removeUnit(faction, spacekey, unittype);
        his_self.addMove("remove_unit\tland\t"+faction+"\t"+unittype+"\t"+spacekey+"\t"+this.game.player);	

	if (num == 1) {
          his_self.endTurn();
	} else {
  	  his_self.playerRemoveUnitsInSpaceWithFilter(msg, unittype, num-1, faction, filter_func, mycallback, cancel_func, board_clickable);
	}

      },

      cancel_func 

    );
  }

  playerAddUnrest(his_self, faction="", zone="", religion="") {

    his_self.playerSelectSpaceWithFilter(
      "Select Space to add Unrest" ,
      function(space) {
        if (space.language === zone && space.religion === religion) { return 1; }
      },
      function(spacekey) {
        his_self.addMove(`unrest\t${spacekey}`);
        his_self.endTurn();
      },
      null,
      true 
    );

  }



  
  returnDebaters(faction="papacy", type="uncommitted") {
    let debaters = [];
    let map = {};
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (faction == "papacy") {
        if (this.game.state.debaters[i].faction == faction) {
	  if (type == "uncommitted" && this.game.state.debaters[i].committed != 1) {
	    if (!map[this.game.state.debaters[i].type]) {
	      map[this.game.state.debaters[i].type] = 1;
	      debaters.push(this.game.state.debaters[i]);
	    }
	  }
	  if (type == "committed" && this.game.state.debaters[i].committed == 1) {
	    if (!map[this.game.state.debaters[i].type]) {
	      map[this.game.state.debaters[i].type] = 1;
	      debaters.push(this.game.state.debaters[i]);
	    }
	  }
	}
      } else {
        if (this.game.state.debaters[i].faction != "papacy") {
	  if (type == "uncommitted" && this.game.state.debaters[i].committed != 1) {
	    if (!map[this.game.state.debaters[i].type]) {
	      map[this.game.state.debaters[i].type] = 1;
	      debaters.push(this.game.state.debaters[i]);
	    }
	  }
	  if (type == "committed" && this.game.state.debaters[i].committed == 1) {
	    if (!map[this.game.state.debaters[i].type]) {
	      map[this.game.state.debaters[i].type] = 1;
	      debaters.push(this.game.state.debaters[i]);
	    }
	  }
	}
      }
    }
    return debaters;
  }




  returnDiplomacyMenuOptions(player=null, faction=null) {

    let menu = [];

    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "End War",
      check : this.canPlayerEndWar,
      fnct : this.playerEndWar,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Form Alliance",
      check : this.canPlayerFormAlliance,
      fnct : this.playerFormAlliance,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Loan Squadrons",
      check : this.canPlayerLoanSquadrons,
      fnct : this.playerLoanSquadrons,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Form Alliance",
      check : this.canPlayerReturnCapturedArmyLeader,
      fnct : this.playerReturnCapturedArmyLeader,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Yield Territory",
      check : this.canPlayerYieldTerritory,
      fnct : this.playerYieldTerritory,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Issue Cards",
      check : this.canPlayerIssueCards,
      fnct : this.playerIssueCards,
    });
    menu.push({
      factions : ['ottoman','hapsburg','england','france','papacy','protestant'],
      name : "Give Mercenaries",
      check : this.canPlayerGiveMercenaries,
      fnct : this.playerGiveMercenaries,
    });
    menu.push({
      factions : ['papacy'],
      name : "Give Mercenaries",
      check : this.canPlayerApproveDivorce,
      fnct : this.playerApproveDivorce,
    });
    menu.push({
      factions : ['papacy'],
      name : "Rescind Excommunication",
      check : this.canPlayerRescindExcommunication,
      fnct : this.playerRescindExcommunication,
    });

    return menu;

  }




  playerOfferAsFaction(faction) {

    let io = this.returnImpulseOrder();
    let html = `<ul>`;

    for (let i = io.length-1; i>= 0; i--) {
      for (let i = 0; i < pfactions.length; i++) {
        html    += `<li class="card" id="${i}">${pfactions[i]}</li>`;
      }
      html    += `</ul>`;
    }
 
    this.updateStatusWithOptions(`Offer Agreement to which faction?`, html);
    this.attachCardboxEvents(function(user_choice) {
      his_self.factionOfferFaction(faction, faction);
    });

  }


  factionOfferFaction(faction1, faction2) {

    let menu = this.returnDiplomacyMenuOptions(this.game.player);

    let html = `<ul>`;
    for (let i = 0; i < menu.length; i++) {
      if (menu[i].check(this, faction1, faction2)) {
        for (let z = 0; z < menu[i].factions.length; z++) {
          if (menu[i].factions[z] === selected_faction) {
            if (menu[i].cost[z] <= ops) {
              html    += `<li class="card" id="${i}">${menu[i].name} [${menu[i].cost[z]} ops]</li>`;
            }
            z = menu[i].factions.length+1;
          }
        }
      }
    }
    html    += `<li class="card" id="end_turn">end turn</li>`;
    html += '</ul>';

    this.updateStatusWithOptions(`Type of Agreement`, html);
    this.attachCardboxEvents(async (user_choice) => {

      if (user_choice === "end_turn") {
        this.endTurn();
        return;
      }

      menu[user_choice].fnct(this, faction1, faction2);
      return;
    });
  }






  playerOffer() {

    let his_self = this;
    let pfactions = this.returnPlayerFactions(this.game.player);

    let html = `<ul>`;
    for (let i = 0; i < pfactions.length; i++) {
      html    += `<li class="card" id="${i}">${pfactions[i]}</li>`;
    }
    html    += `</ul>`;

    this.updateStatusWithOptions(`Offer Agreement as which Faction?`, html);
    this.attachCardboxEvents(function(user_choice) {
      his_self.playerOfferAsFaction(faction);
    });

  }






  canPlayerEndWar(his_self, f1, f2) {
    return 0;
  }

  canPlayerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  canPlayerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  canPlayerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  canPlayerLoanSquadron(his_self, f1, f2) {
    return 0;
  }

  canPlayerReturnCapturedArmyLeader(his_self, f1, f2) {
    return 0;
  }

  canPlayerYieldTerritory(his_self, f1, f2) {
    return 0;
  }

  canPlayerIssueCards(his_self, f1, f2) {
    return 0;
  }

  canPlayerGiveMercenaries(his_self, f1, f2) {
    return 0;
  }

  canPlayerApproveDivorce(his_self, f1, f2) {
    return 0;
  }

  canPlayerRescindExcommunication(his_self, f1, f2) {
    return 0;
  }

  async playerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  async playerFormAlliance(his_self, f1, f2) {
    return 0;
  }

  async playerLoanSquadron(his_self, f1, f2) {
    return 0;
  }

  async playerReturnCapturedArmyLeader(his_self, f1, f2) {
    return 0;
  }

  async playerYieldTerritory(his_self, f1, f2) {
    return 0;
  }

  async playerIssueCards(his_self, f1, f2) {
    return 0;
  }

  async playerGiveMercenaries(his_self, f1, f2) {
    return 0;
  }

  async playerApproveDivorce(his_self, f1, f2) {
    return 0;
  }

  async playerRescindExcommunication(his_self, f1, f2) {
    return 0;
  }










  isPlayerControlledFaction(faction="") {
    if (faction === "") { return false; }
    if (this.isAlliedMinorPower(faction)) { return true; }
    if (this.isMajorPower(faction)) { return true; }
    return false;
  }

  returnFactionAdminRating(faction="") {
    if (this.factions[faction]) {
      return this.factions[faction].returnAdminRating();
    }
    return 0;
  }
 
  returnFactionName(f) {
    if (this.factions[f]) {
      return this.factions[f].name;
    }
    return "Unknown";
  }

  importFaction(name, obj) {

    if (obj.id == null)                 { obj.id = "faction"; }
    if (obj.name == null)               { obj.name = "Unknown Faction"; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.key == null)	        { obj.key = name; }
    if (obj.ruler == null)		{ obj.ruler = ""; }
    if (obj.cards == null)		{ obj.cards = 0; }
    if (obj.capitals == null)	        { obj.capitals = []; }
    if (obj.admin_rating == null)	{ obj.admin_rating = 0; } // cards "holdable"
    if (obj.cards_bonus == null)	{ obj.cards_bonus = 0; }
    if (obj.vp == null)			{ obj.vp = 0; }
    if (obj.vp_base == null)		{ obj.vp_base = 0; }
    if (obj.vp_special == null)		{ obj.vp_special = 0; }
    if (obj.vp_bonus == null)		{ obj.vp_bonus = 0; }
    if (obj.allies == null)		{ obj.allies = []; }
    if (obj.minor_allies == null)	{ obj.minor_allies = []; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.passed == null)		{ obj.passed = false; }
    if (obj.calculateBaseVictoryPoints == null) {
      obj.calculateBaseVictoryPoints = function() { return 0; }
    }
    if (obj.calculateBonusVictoryPoints == null) {
      obj.calculateBonusVictoryPoints = function() { return 0; }
    }
    if (obj.returnAdminRating == null) {
      obj.returnAdminRating = function() { return this.admin_rating; }
    }
    if (obj.calculateSpecialVictoryPoints == null) {
      obj.calculateSpecialVictoryPoints = function() { return 0; }
    }
    if (obj.returnFactionSheet == null) {
      obj.returnFactionSheet = function(faction) {
        return `
	  <div class="faction_sheet" id="faction_sheet" style="background-image: url('/his/img/factions/${obj.img}')">
	    <div class="faction_sheet_ruler" id="faction_sheet_ruler"></div>
	  </div>
	`;
      }
    }
    if (obj.returnCardsDealt == null) {
      obj.returnCardsDealt = function(faction) {
	return 1;
      }
    }

    obj = this.addEvents(obj);
    this.factions[obj.key] = obj;

  }

  gainVictoryPoints(faction, points, type="special") {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let ii = 0; ii < this.game.state.players_info[i].factions.length; ii++) {
	if (faction === this.game.state.players_info[i].factions[ii]) {
	  if (type == "base") {
            this.game.state.players_info[i].factions[ii].vp += points;
            this.game.state.players_info[i].factions[ii].vp_base += points;
	  }
	  if (type == "special") {
            this.game.state.players_info[i].factions[ii].vp += points;
            this.game.state.players_info[i].factions[ii].vp_special += points;
	  }
	  if (type == "bonus") {
            this.game.state.players_info[i].factions[ii].vp += points;
            this.game.state.players_info[i].factions[ii].vp_bonus += points;
	  }
	  break;
        }
      }
    }
    return -1;
  }

  returnCapitals(faction) {
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      for (let ii = 0; ii < this.game.state.players_info[i].factions.length; ii++) {
	if (faction === this.game.state.players_info[i].factions[ii]) {
          return this.factions[this.game.state.players_info[i].factions[ii]].capitals;
        }
      }
    }
    return [];
  }

  returnFactionHandIdx(player, faction) {
    for (let i = 0; i < this.game.state.players_info[player-1].factions.length; i++) {
      if (this.game.state.players_info[player-1].factions[i] === faction) {
	return i;
      }
    }
    return -1;
  }




  /* override default */
  updateStatus(str, force = 0) {

    this.updateControls("");

    try {

      this.game.status = str;
      if (!this.browser_active) { return; }

      if (this.useHUD) {
        this.hud.updateStatus(str);
      }

      document.querySelectorAll(".status").forEach((el) => {
        el.innerHTML = str;
      });
      if (document.getElementById("status")) {
        document.getElementById("status").innerHTML = str;
      }

      if (this.useCardbox) {
	this.cardbox.attachCardboxEvents();
      }


    } catch (err) {
      console.warn("Error Updating Status: ignoring: " + err);
    }
  } 





  importUnit(name, obj) {

    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.active == null)		{ obj.active = 0; } // if bonus is active for debaters
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)             { obj.loaned = false; }
    if (obj.key == null)                { obj.key = name; }
    if (obj.gout == null)               { obj.gout = false; }
    if (obj.locked == null)		{ obj.locked = false; }
    if (obj.already_moved == null)	{ obj.already_moved = 0; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (obj.returnCardImage == null) {
      obj.returnCardImage = () => { return ""; }
    }

    this.addEvents(obj);
    this.units[name] = obj;

  }

  newUnit(faction, type) {
    for (let key in this.units) {
      if (this.units[key].type === type) {
        let new_unit = JSON.parse(JSON.stringify(this.units[key]));
        new_unit.owner = faction;
        return new_unit;
      }
    }
    return null;
  }

  importArmyLeader(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.army[name]) {
      this.addEvents(obj);
      this.army[name] = obj;
    }
  }

  importNavyLeader(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.navy[name]) {
      this.addEvents(obj);
      this.navy[name] = obj;
    }
  }

  importWife(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.wives[name]) {
      this.addEvents(obj);
      this.wives[name] = obj;
    }
  }

  importReformer(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = true; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.reformers[name]) {
      this.addEvents(obj);
      this.reformers[name] = obj;
    }
  }

  importDebater(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = true; }
    if (obj.debater == null)            { obj.debater = true; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.power == null)		{ obj.power = 0; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (obj.returnCardImage == null) {
      obj.returnCardImage = () => {
        let tile_f = "/his/img/tiles/debaters/" + obj.img;
        let tile_b = tile_f.replace('.svg', '_back.svg');
	return `
	  <div class="debater-card" id="${obj.key}" style="background-image: url('${tile_f}'); background-size: cover"></div>	
	`;
      }
    }

    if (!this.debaters[name]) {
      this.debaters[name] = obj;
      this.addEvents(obj);
    }
  }

  importExplorer(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.explorers[name]) {
      this.addEvents(obj);
      this.explorers[name] = obj;
    }
  }

  importConquistador(name, obj) {
    if (obj.type == null)               { obj.type = "unit"; }
    if (obj.name == null)               { obj.name = "Unit"; }
    if (obj.spacekey == null)           { obj.spacekey = ""; }
    if (obj.personage == null)          { obj.personage = false; }
    if (obj.debater == null)            { obj.debater = false; }
    if (obj.reformer == null)           { obj.reformer = false; }
    if (obj.land_or_sea == null)        { obj.land_or_sea = "land"; }
    if (obj.army_leader == null)        { obj.army_leader = false; }
    if (obj.navy_leader == null)        { obj.navy_leader = false; }
    if (obj.piracy_rating == null)      { obj.piracy_rating = 0; }
    if (obj.command_value == null)      { obj.command_value = 0; }
    if (obj.battle_rating == null)      { obj.battle_rating = 0; }
    if (obj.img == null)                { obj.img = ""; }
    if (obj.committed == null)          { obj.committed = 0; }
    if (obj.besieged == null)           { obj.besieged = false; }
    if (obj.captured == null)           { obj.captured = false; }
    if (obj.loaned == null)		{ obj.loaned = false; }
    if (obj.key == null)		{ obj.key = name; }
    if (obj.onCommitted == null) {
      obj.onCommitted = function(his_self, faction) { return 1; }
    }
    if (!this.conquistadors[name]) {
      this.addEvents(obj);
      this.conquistadors[name] = obj;
    }
  }

  removeArmyLeader(faction, space, leader) {

    if (!this.army[leader]) {
      console.log("ARMY LEADER: " + leader + " not found");
      return;
    }

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === leader) {
	space.units[faction].splice(i, 1);
      }
    }

  }


  addArmyLeader(faction, space, leader) {

    if (!this.army[leader]) {
      console.log("ARMY LEADER: " + leader + " not found");
      return;
    }

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.army[leader]);
    space.units[faction][space.units[faction].length-1].owner = faction; 

  }


  addNavyLeader(faction, space, leader) {

    if (!this.navy[leader]) {
      console.log("NAVY LEADER: " + leader + " not found");
      return;
    }

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    space.units[faction].push(this.navy[leader]);
    space.units[faction][space.units[faction].length-1].owner = faction; 

  }


  removeReformer(faction, space, reformer) {
    if (!this.reformers[reformer]) {
      console.log("REFORMER: " + reformer + " not found");
      return;
    }
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === reformer) {
	space.units[faction].splice(i, 1);
      }
    }
  }

  addReformer(faction, space, reformer) {
    if (!this.reformers[reformer]) {
      console.log("REFORMER: " + reformer + " not found");
      return;
    }

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.units[faction].push(this.reformers[reformer]);
    space.units[faction][space.units[faction].length-1].owner = faction; 

  }

  addWife(faction, wife) {

    if (!this.wives[wife]) {
      console.log("WIFE: " + wife + " not found");
      return;
    }

    for (let i = 0; i < this.game.state.wives.length; i++) {
      if (this.game.state.wives[i].type === wife) {
	return;
      }
    }


    this.game.state.wives.push(this.wives[wife]);
    this.game.state.wives[this.game.state.wives.length-1].owner = faction; 

  }

  removeDebater(faction, debater) {

    if (!this.debaters[debater]) {
      console.log("DEBATER: " + debater + " not found");
      return;
    }

    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].type == debater) { 
	this.game.state.debaters.splice(i, 1);
      }
    }

  }

  disgraceDebater(debater) { return this.burnDebater(debater, 1); }
  burnDebater(debater, disgraced = 0) {

    if (!this.debaters[debater]) {
      console.log("DEBATER: " + debater + " not found");
      return;
    }

    //
    // remove the debater
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].type == debater) { 

	if (this.game.state.debaters[i].owner == "papacy") {
	  this.updateLog("Protestants gain " + this.game.state.debaters[i].power + " VP");
	  this.updateLog(this.popup(debater) + " disgraced");
	} else {
	  this.updateLog("Papacy gains " + this.game.state.debaters[i].power + " VP");
	  this.updateLog(this.popup(debater) + " burned");
	}

	this.game.state.debaters.splice(i, 1);
        this.game.state.burned.push(debater);

        let x = debater.split("-");
	//
	// also remove reformer (if exists)
	//
	try {
	  let reformer = x[0] + "-reformer";
          let s = this.returnSpaceOfPersonage(this.debaters[debater].faction, reformer);
	  if (s) { this.removeReformer(this.debaters[debater].faction, reformer); }
	} catch (err) {
	  // reformer does not exist
	}
      }
    }

    //
    //
    //
    this.displayVictoryTrack();

  }

  addDebater(faction, debater) {

    if (!this.debaters[debater]) {
      console.log("DEBATER: " + debater + " not found");
      return;
    }

    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].type === debater) {
	console.log("DEBATER: " + debater + " already added");
	return;
      }
    }

    this.game.state.debaters.push(this.debaters[debater]);
    this.game.state.debaters[this.game.state.debaters.length-1].owner = faction; 
    this.game.state.debaters[this.game.state.debaters.length-1].committed = 0; 

  }

  addExplorer(faction, explorer) {

    if (!this.explorers[explorer]) {
      console.log("EXPLORER: " + explorer + " not found");
      return;
    }

    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].type === explorer) {
	console.log("EXPLORER: " + explorer + " already added");
	return;
      }
    }

    this.game.state.explorers.push(this.explorers[explorer]);
  }

  addConquistador(faction, conquistador) {

    if (!this.conquistadors[conquistador]) {
      console.log("CONQUISTADOR: " + conquistador + " not found");
      return;
    }

    for (let i = 0; i < this.game.state.conquistador.length; i++) {
      if (this.game.state.conquistador[i].type === conquistador) {
	return;
      }
    }

    this.game.state.conquistador.push(this.conquistadors[conquistador]);

  }

  isActive(debater) { return this.isDebaterActive(debater); }
  isDebaterActive(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].active == 1) { return 1; }
      }
    }
    return 0;
  }

  isDebaterDisgraced(debater) { return this.isBurned(debater); }
  isDisgraced(debater) { return this.isBurned(debater); }
  isDebaterBurned(debater) { return this.isBurned(debater); }
  isBurned(debater) { if (this.game.state.burned.includes(debater)) { return true; } return false; }
  isCommitted(debater) { return this.isDebaterCommitted(debater); }
  isDebaterCommitted(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].committed == 1) { return 1; }
      }
    }
    // sometimes debaters will be excommunicated without being committed
    for (let i = 0; i < this.game.state.excommunicated.length; i++) {
      if (this.game.state.excommunicated[i].debater) {
	if (this.game.state.excommunicated[i].debater.type == debater) {
	  if (this.game.state.debaters[i].committed == 1) { return 1; }
        }
      }
    }
    return 0;
  }

  isDebaterAvailable(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	if (this.game.state.debaters[i].committed == 0) { return 1; }
      }
    }
    return 0;
  }

  deactivateDebater(debater) {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key === debater) {
        this.game.state.debaters[i].active = 0;
      }
    }
  }
  deactivateDebaters() {
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      this.game.state.debaters[i].active = 0;
    }
  }

  commitDebater(faction, debater, activate=1) {

    let his_self = this;

    //
    // we can only commit 1 debater for the bonus each impulse, so note it if so
    //
    if (activate == 1) {
      this.game.state.debater_committed_this_impulse[faction] = 1;
    }

    for (let i = 0; i < this.game.state.debaters.length; i++) {
      if (this.game.state.debaters[i].key == debater) {
	this.game.state.debaters[i].committed = 1;
	this.game.state.debaters[i].active = activate; // if the bonus is active
	this.debaters[debater].onCommitted(his_self, this.game.state.debaters[i].owner);
      }
    }
  }

  commitExplorer(faction, explorer) {
    let his_self = this;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      if (this.game.state.explorers[i].key == explorer) {
	this.game.state.explorer[i].committed = 1;
	this.explorers[explorer].onCommitted(his_self, this.game.state.explorers[i].owner);
      }
    }
  }

  commitConquistador(faction, explorer) {
    let his_self = this;
    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      if (this.game.state.conquistadors[i].key == explorer) {
	this.game.state.conquistadors[i].committed = 1;
	this.conquistadors[conquistador].onCommitted(his_self, this.game.state.conquistadors[i].owner);
      }
    }
  }

  //
  // each faction has a limited number of physical tokens to use to 
  // represent units that are available. the game will auto-reallocate
  // these tokens to teh extent possible.
  // 
  updateOnBoardUnits() { this.game.state.board_updated = 0; } // setting to 0 forces update next displaySpace
  returnOnBoardUnits(faction="") {

    let my_spaces = {};
    let available_units = {};
        available_units['regular'] = {};
    let deployed_units = {};

    //
    // each faction has a separate token mix
    //
    if (faction == "protestant") {
      available_units['regular']['1'] = 8;    
      available_units['regular']['2'] = 5;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 2;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
    }
    if (faction == "england") {
      available_units['regular']['1'] = 9;    
      available_units['regular']['2'] = 5;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 2;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 1;    
    }
    if (faction == "ottoman") {
      available_units['regular']['1'] = 11;    
      available_units['regular']['2'] = 7;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 4;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 1;    
    }
    if (faction == "france") {
      available_units['regular']['1'] = 10;    
      available_units['regular']['2'] = 5;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 3;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 1;    
    }
    if (faction == "papacy") {
      available_units['regular']['1'] = 7;    
      available_units['regular']['2'] = 4;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 2;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
    }
    if (faction == "hapsburg") {
      available_units['regular']['1'] = 12;    
      available_units['regular']['2'] = 6;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 3;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 1;    
    }

    if (faction == "scotland") {
      available_units['regular']['1'] = 2;    
      available_units['regular']['2'] = 1;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 0;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
    }
    if (faction == "genoa") {
      available_units['regular']['1'] = 2;    
      available_units['regular']['2'] = 2;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 0;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
    }
    if (faction == "venice") {
      available_units['regular']['1'] = 4;    
      available_units['regular']['2'] = 4;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 0;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
    }
    if (faction == "hungary") {
      available_units['regular']['1'] = 3;    
      available_units['regular']['2'] = 3;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 1;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
    }
    if (faction == "independent") {
      available_units['regular']['1'] = 3;    
      available_units['regular']['2'] = 3;    
      available_units['regular']['3'] = 0;    
      available_units['regular']['4'] = 0;    
      available_units['regular']['5'] = 0;    
      available_units['regular']['6'] = 0;    
    }

    //
    // find out what units I supposedly have deployed
    //
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units) {
        if (this.game.spaces[key].units[faction].length > 0) {
          for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
      	    if (!my_spaces[key]) { my_spaces[key] = {}; }
            if (!my_spaces[key][this.game.spaces[key].units[faction][i].type]) { my_spaces[key][this.game.spaces[key].units[faction][i].type] = 0; }
            my_spaces[key][this.game.spaces[key].units[faction][i].type]++;
          }
        }
      }
    }

    //
    //
    //
    for (let key in my_spaces) {
      deployed_units[key] = {};
      deployed_units[key]['regular'] = {};
      deployed_units[key]['regular']['1'] = 0;
      deployed_units[key]['regular']['2'] = 0;
      deployed_units[key]['regular']['3'] = 0;
      deployed_units[key]['regular']['4'] = 0;
      deployed_units[key]['regular']['5'] = 0;
      deployed_units[key]['regular']['6'] = 0;
      deployed_units[key]['mercenary'] = {};
      deployed_units[key]['mercenary']['1'] = 0;
      deployed_units[key]['mercenary']['2'] = 0;
      deployed_units[key]['mercenary']['3'] = 0;
      deployed_units[key]['mercenary']['4'] = 0;
      deployed_units[key]['mercenary']['5'] = 0;
      deployed_units[key]['mercenary']['6'] = 0;
    }


    //
    // order spaces 
    //
    let continue_to_apportion = true;
    while (continue_to_apportion == true) {

      continue_to_apportion = false;
      let changed_anything = false;

      for (let key in my_spaces) {

	if (my_spaces[key]['regular'] >= 6 && available_units['regular']['6'] > 0) { 
	  my_spaces[key]['regular'] -= 6;
	  available_units['regular']['6']--;
	  deployed_units[key]['regular']['6']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['mercenary'] >= 6 && available_units['regular']['6'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['mercenary'] -= 6;
	  available_units['regular']['6']--;
	  deployed_units[key]['mercenary']['6']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}

	// !5

	if (my_spaces[key]['regular'] >= 4 && available_units['regular']['4'] > 0) { 
	  my_spaces[key]['regular'] -= 4;
	  available_units['regular']['4']--;
	  deployed_units[key]['regular']['4']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['mercenary'] >= 4 && available_units['regular']['4'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['mercenary'] -= 4;
	  available_units['regular']['4']--;
	  deployed_units[key]['mercenary']['4']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}

	// !3

	if (my_spaces[key]['regular'] >= 2 && available_units['regular']['2'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['regular'] -= 2;
	  available_units['regular']['2']--;
	  deployed_units[key]['regular']['2']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['mercenary'] >= 2 && available_units['regular']['2'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['mercenary'] -= 2;
	  available_units['regular']['2']--;
	  deployed_units[key]['mercenary']['2']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}

	if (my_spaces[key]['regular'] >= 1 && available_units['regular']['1'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['regular'] -= 1;
	  available_units['regular']['1']--;
	  deployed_units[key]['regular']['1']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}
	if (my_spaces[key]['mercenary'] >= 1 && available_units['regular']['1'] > 0 && continue_to_apportion == false) { 
	  my_spaces[key]['mercenary'] -= 1;
	  available_units['regular']['1']--;
	  deployed_units[key]['mercenary']['1']++;
	  continue_to_apportion = true;
          changed_anything = true;
	}

      }

      if (changed_anything == true) {
        continue_to_apportion = true;
      }

    }

    let results = {};
    results.deployed = deployed_units;
    results.available = available_units;
    results.missing = {};

    //
    // pieces we are having difficulty assigning
    //
    for (let key in my_spaces) {
      if (my_spaces[key]['regular'] > 0) { 
	if (!results.missing[key]) { results.missing[key] = {}; }
	results.missing[key]['regular'] = my_spaces[key]['regular'];
      }	
      if (my_spaces[key]['mercenary'] > 0) { 
	if (!results.missing[key]) { results.missing[key] = {}; }
	results.missing[key]['mercenary'] = my_spaces[key]['mercenary'];
      }	
    }

    this.game.state.board_updated = new Date().getTime();

    return results;

  }

  



  hideOverlays() {
    this.debate_overlay.hide();
    this.treatise_overlay.hide();
    this.religious_overlay.hide();
    this.faction_overlay.hide();
    this.diet_of_worms_overlay.hide();
    this.council_of_trent_overlay.hide();
    this.theses_overlay.hide();
    this.reformation_overlay.hide();
    this.language_zone_overlay.hide();
    this.debaters_overlay.hide();
    this.schmalkaldic_overlay.hide();
    this.assault_overlay.hide();
    this.field_battle_overlay.hide();
    this.movement_overlay.hide();
    this.welcome_overlay.hide();
    this.deck_overlay.hide();
    this.menu_overlay.hide();
    this.winter_overlay.hide();
    this.units_overlay.hide();
  }

  returnReligionImage(religion) {
    if (religion === "protestant") { return "/his/img/tiles/abstract/protestant.png"; }
    if (religion === "catholic") { return "/his/img/tiles/abstract/catholic.png"; }
    return "/his/img/tiles/abstract/independent.svg";
  }

  returnLanguageImage(language) {

    if (language == "english") { return "/his/img/tiles/abstract/english.png"; }
    if (language == "french") { return "/his/img/tiles/abstract/french.png"; }
    if (language == "spanish") { return "/his/img/tiles/abstract/spanish.png"; }
    if (language == "italian") { return "/his/img/tiles/abstract/italian.png"; }
    if (language == "german") { return "/his/img/tiles/abstract/german.png"; }

    return "/his/img/tiles/abstract/other.png";

  }

  returnControlImage(faction) {

    if (faction == "papacy") { return "/his/img/tiles/abstract/papacy.svg"; }
    if (faction == "protestant") { return "/his/img/tiles/abstract/protestant.svg"; }
    if (faction == "england") { return "/his/img/tiles/abstract/england.svg"; }
    if (faction == "france") { return "/his/img/tiles/abstract/france.svg"; }
    if (faction == "ottoman") { return "/his/img/tiles/abstract/ottoman.svg"; }
    if (faction == "hapsburg") { return "/his/img/tiles/abstract/hapsburg.svg"; }

    return "/his/img/tiles/abstract/independent.svg";   

  }

  displayWarBox() {

    let factions = ["ottoman","hapsburg","england","france","papacy","protestant","genoa","hungary","scotland","venice"];
    for (let i = 0; i < factions.length; i++) {
      for (let ii = 0; ii < factions.length; ii++) {
	if (ii > i) {
	  let obj = null;
	  let box = '#' + factions[i] + "_" + factions[ii];
	  obj = document.querySelector(box);
	  if (obj) {
	    if (this.areAllies(factions[i], factions[ii])) {
	      obj.innerHTML = '<img src="/his/img/Allied.svg" />';
	      obj.style.display = "block";
	    } else {
	      if (this.areEnemies(factions[i], factions[ii])) {
	        obj.innerHTML = '<img src="/his/img/AtWar.svg" />';
	        obj.style.display = "block";
	      } else {
	        obj.style.display = "none";
	      }
	    }
	  }
	}
      }
    }
  }

  displayDebaters() {
    this.debaters_overlay.render();
  }

  displayExplorers() {

    let html = `<div class="personage_overlay" id="personage_overlay">`;
    for (let i = 0; i < this.game.state.explorers.length; i++) {
      html += `	<div class="personage_tile${i}" data-id="${this.game.state.explorers[i].img}" style="background-image:url('/his/img/tiles/explorers/${this.game.state.explorers[i].img}')"></div>`;
    }
    html += `</div>`;

    this.overlay.showOverlay(html);

    for (let i = 0; i < this.game.state.explorers.length; i++) {
      let tile_f = "/his/img/tiles/explorers/" + this.game.state.explorers[i].img;
      let tile_b = tile_f.replace('.svg', '_back.svg');
      if (this.game.state.explorers[i].committed == 1) {
	let x = tile_f;
	tile_f = tile_b;
	tile_b = x;
      }
      let divsq = `.personage_tile${i}`;
      $(divsq).mouseover(function() {
	$(this).css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$(this).css('background-image', `url('${tile_f}')`);
      });
    }

  }

  displayConquistadors() {

    let html = `<div class="personage_overlay" id="personage_overlay">`;
    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      html += `	<div class="personage_tile personage_tile${i}" data-id="${this.game.state.conquistadors[i].img}" style="background-image:url('/his/img/tiles/conquistadors/${this.game.state.conquistadors[i].img}')"></div>`;
    }
    html += `</div>`;

    this.overlay.showOverlay(html);

    for (let i = 0; i < this.game.state.conquistadors.length; i++) {
      let tile_f = "/his/img/tiles/conquistadors/" + this.game.state.conquistadors[i].img;
      let tile_b = tile_f.replace('.svg', '_back.svg');
      if (this.game.state.conquistadors[i].committed == 1) {
	let x = tile_f;
	tile_f = tile_b;
	tile_b = x;
      }
      let divsq = `.personage_tile${i}`;
      $(divsq).mouseover(function() {
	$(this).css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$(this).css('background-image', `url('${tile_f}')`);
      });
    }
  }

  displayTheologicalDebater(debater, attacker=true) {

    let tile_f = "/his/img/tiles/debaters/" + this.debaters[debater].img;
    let tile_b = tile_f.replace('.svg', '_back.svg');

    if (attacker) {
      $('.attacker_debater').css('background-image', `url('${tile_f}')`);
      $('.attacker_debater').mouseover(function() { 
	$('.attacker_debater').css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$('.attacker_debater').css('background-image', `url('${tile_f}')`);
      });
    } else {
      $('.defender_debater').css('background-image', `url('${tile_f}')`);
      $('.defender_debater').mouseover(function() { 
	$('.defender_debater').css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$('.defender_debater').css('background-image', `url('${tile_f}')`);
      });
    }
  }

  displayTheologicalDebate(res) {
    this.debate_overlay.render(res);
  }


  displayReligiousConflictSheet() {

    let num_protestant_spaces = 0;
    let rcc = this.returnReligiousConflictChart();
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
        num_protestant_spaces++;
      }
    }
    if (num_protestant_spaces > 50) { num_protestant_spaces = 50; }
    let cid = "s" + num_protestant_spaces;

    let html = `
      <div class="religious_conflict_sheet" id="religious_conflict_sheet" style="background-image: url('/his/img/reference/religious.jpg')">
	<div class="religious_conflict_sheet_tile" id="religious_conflict_sheet_tile"></div>
	<div class="papal_debaters"></div>
	<div class="lutheran_debaters"></div>
	<div class="calvinist_debaters"></div>
	<div class="anglican_debaters"></div>
	<div class="protestant_debaters"></div>
      </div>
    `;

    this.overlay.showOverlay(html);

    //
    // list all debaters
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      let d = this.game.state.debaters[i];
      let dtile = `<img class="debater_tile" id="${i}" src="/his/img/tiles/debaters/${d.img}" />`;
      if (d.owner === "papacy") {
	this.app.browser.addElementToSelector(dtile, '.papal_debaters');
      }
      if (d.owner === "england") {
	this.app.browser.addElementToSelector(dtile, '.anglican_debaters');
      }
      if (d.owner === "hapsburg") {
	this.app.browser.addElementToSelector(dtile, '.calvinist_debaters');
      }
      if (d.owner === "protestant") {
	this.app.browser.addElementToSelector(dtile, '.protestant_debaters');
      }
    }

    let obj = document.getElementById("religious_conflict_sheet_tile");
    obj.style.top = rcc[cid].top;
    obj.style.left = rcc[cid].left;

  }

  returnProtestantSpacesTrackVictoryPoints() {

    let num_protestant_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
        num_protestant_spaces++;
      }
    }
    if (num_protestant_spaces > 50) { num_protestant_spaces = 50; }

    let x = [];
    for (let i = 0; i < 51; i++) { 

      x[i] = {}; x[i].protestant = 0; x[i].papacy = 15;

      if (i >= 4) { x[i].protestant++; x[i].papacy--; }
      if (i >= 7) { x[i].protestant++; x[i].papacy--; }
      if (i >= 10) { x[i].protestant++; x[i].papacy--; }
      if (i >= 14) { x[i].protestant++; x[i].papacy--; }
      if (i >= 17) { x[i].protestant++; x[i].papacy--; }
      if (i >= 20) { x[i].protestant++; x[i].papacy--; }
      if (i >= 24) { x[i].protestant++; x[i].papacy--; }
      if (i >= 27) { x[i].protestant++; x[i].papacy--; }
      if (i >= 30) { x[i].protestant++; x[i].papacy--; }
      if (i >= 34) { x[i].protestant++; x[i].papacy--; }
      if (i >= 37) { x[i].protestant++; x[i].papacy--; }
      if (i >= 40) { x[i].protestant++; x[i].papacy--; }
      if (i >= 44) { x[i].protestant++; x[i].papacy--; }
      if (i >= 47) { x[i].protestant++; x[i].papacy--; }
      if (i >= 50) { x[i].protestant+=100; x[i].papacy--; }
    }

    return x[num_protestant_spaces];

  }


  displayFactionSheet(faction) {
    this.faction_overlay.render(faction);
  }

  returnFactionSheetKeys() {
  }

  displayBoard() {

    try {
      this.displayWarBox();
    } catch (err) {
      console.log("error displaying board... " + err);
    }
    try {
      this.displayColony();
    } catch (err) {
      console.log("error displaying board... " + err);
    }
    try {
      this.displayConquest();
    } catch (err) {
      console.log("error displaying conquest... " + err);
    }
    try {
      this.displayElectorateDisplay();
    } catch (err) {
      console.log("error displaying electorates... " + err);
    }
    try {
      this.displayNewWorld();
    } catch (err) {
      console.log("error displaying new world... " + err);
    }
    try {
      this.displaySpaces();
    } catch (err) {
      console.log("error displaying spaces... " + err);
    }
    try {
      this.displayNavalSpaces();
    } catch (err) {
      console.log("error displaying naval spaces... " + err);
    }
    try {
      this.displayVictoryTrack();
    } catch (err) {
      console.log("error displaying victory track... " + err);
    }
  }

  displayColony() {
  }

  displayConquest() {
  }

  displayNewWorld() {
  }

  displaySpaceDetailedView(name) {
    // function is attached to this.spaces not this.game.spaces
    let html = this.spaces[name].returnView();    
    this.overlay.show(html);
  }

  displayElectorateDisplay() {
    let elecs = this.returnElectorateDisplay();
    for (let key in elecs) {
      let obj = document.getElementById(`ed_${key}`);
      let tile = this.returnSpaceTile(this.game.spaces[key]);
      obj.innerHTML = ` <img class="hextile" src="${tile}" />`;      
      if (this.returnElectoralBonus(key) != 0) {
        obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-${this.returnElectoralBonus(key)}.svg" />`;
      }
    }
  }


  // returns 1 if the bonus for controlling is still outstanding
  returnElectoralBonus(space) {

    if (space === "augsburg" && this.game.state.augsburg_electoral_bonus == 0) {
      return 2;
    }
    if (space === "mainz" && this.game.state.mainz_electoral_bonus == 0) {
      return 1;
    }
    if (space === "trier" && this.game.state.trier_electoral_bonus == 0) {
      return 1;
    }
    if (space === "cologne" && this.game.state.cologne_electoral_bonus == 0) {
      return 1;
    }
    if (space === "wittenberg" && this.game.state.wittenberg_electoral_bonus == 0) {
      return 2;
    }
    if (space === "brandenburg" && this.game.state.brandenburg_electoral_bonus == 0) {
      return 1;
    }

    return 0;

  }

  returnSpaceTile(space) {

    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";
    let stype = "hex";

    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }

    if (owner != "") {
      if (owner === "hapsburg") {
        tile = "/his/img/tiles/hapsburg/";	  
        if (space.religion === "protestant") {
          tile += `Hapsburg_${stype}_back.svg`;
        } else {
          tile += `Hapsburg_${stype}.svg`;
        }
      }
      if (owner === "england") {
        tile = "/his/img/tiles/england/";	  
        if (space.religion === "protestant") {
          tile += `England_${stype}_back.svg`;
        } else {
          tile += `England_${stype}.svg`;
        }
      }
      if (owner === "france") {
        tile = "/his/img/tiles/france/";	  
        if (space.religion === "protestant") {
          tile += `France_${stype}_back.svg`;
        } else {
          tile += `France_${stype}.svg`;
        }
      }
      if (owner === "papacy") {
        tile = "/his/img/tiles/papacy/";	  
        if (space.religion === "protestant") {
          tile += `Papacy_${stype}_back.svg`;
	} else {
	  tile += `Papacy_${stype}.svg`;
	}
      }
      if (owner === "protestant") {
        tile = "/his/img/tiles/protestant/";	  
        if (space.religion === "protestant") {
          tile += `Protestant_${stype}_back.svg`;
        } else {
          tile += `Protestant_${stype}.svg`;
        }
      }
      if (owner === "ottoman") {
        tile = "/his/img/tiles/ottoman/";	  
        if (space.religion === "protestant") {
          tile += `Ottoman_${stype}_back.svg`;
        } else {
          tile += `Ottoman_${stype}.svg`;
        }
      }
      if (owner === "independent") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "hungary") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "scotland") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "venice") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
      if (owner === "genoa") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
    }

    return tile;

  }

  returnNavalTiles(faction, spacekey) {

      let html = "";
      let tile = "";
      let space = this.game.navalspaces[spacekey];
      if (!space) {
	// might be at a port
        space = this.game.spaces[spacekey];
      }
      let z = faction;
      let squadrons = 0;
      let corsairs = 0;

      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].type === "squadron") {
	  squadrons += 2;
	}
	if (space.units[z][zz].type === "corsair") {
	  corsairs += 1;
	}
      }

      while (squadrons >= 2) {
        if (z === "hapsburg") {
          tile = "/his/img/tiles/hapsburg/";	  
	  if (squadrons >= 2) {
            tile += `Hapsburg_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (z === "england") {
          tile = "/his/img/tiles/england/";	  
	  if (squadrons >= 2) {
            tile += `English_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "france") {
          tile = "/his/img/tiles/france/";	  
	  if (squadrons >= 2) {
            tile += `French_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "papacy") {
          tile = "/his/img/tiles/papacy/";	  
	  if (squadrons >= 2) {
            tile += `Papacy_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (squadrons >= 2) {
            tile += `Ottoman_squadron.svg`;
	    squadrons -= 2;
          }
	  if (corsairs >= 1) {
            tile += `Ottoman_corsair.svg`;
	    corsairs -= 1;
          }
        }
        if (z === "venice") {
          tile = "/his/img/tiles/venice/";	  
	  if (squadrons >= 2) {
            tile += `Venice_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "genoa") {
          tile = "/his/img/tiles/genoa/";	  
	  if (squadrons >= 2) {
            tile += `Genoa_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "scotland") {
          tile = "/his/img/tiles/scotland/";	  
	  if (squadrons >= 2) {
            tile += `Scottish_squadron.svg`;
	    squadrons -= 2;
          }
        }

        html += `<img class="navy_tile" src="${tile}" />`;
      }

 
      while (corsairs >= 1) {
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (corsairs >= 1) {
            tile += `Ottoman_corsair.svg`;
	    corsairs -= 1;
          }
        }
        html += `<img class="navy_tile" src="${tile}" />`;
      }

    return html;
  }

  returnNavies(space) {

    let html = '<div class="space_navy" id="">';
    let tile = "";

    for (let z in space.units) {
      html += this.returnNavalTiles(z, space.key);
      tile = html;
    }
    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnArmyTiles(faction, spacekey) {
    let z = faction;
    let space = this.game.spaces[spacekey];
    let html = "";

    if (this.game.state.board[z]) {
      if (this.game.state.board[z].deployed[spacekey]) {
          if (z === "hapsburg") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-1.svg" />`;
	    }
	  }
          if (z === "ottoman") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-1.svg" />`;
	    }
	  }
          if (z === "papacy") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-1.svg" />`;
	    }
	  }
          if (z === "england") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-1.svg" />`;
	    }
	  }
          if (z === "france") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-1.svg" />`;
	    }
	  }
          if (z === "protestant") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-1.svg" />`;
	    }
	  }
          if (z === "venice") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/venice/VeniceReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/venice/VeniceReg-1.svg" />`;
	    }
	  }
          if (z === "genoa") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/genoa/GenoaReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/genoa/GenoaReg-1.svg" />`;
	    }
	  }
          if (z === "hungary") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-1.svg" />`;
	    }
	  }
          if (z === "scotland") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/scotland/ScotlandReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/scotland/ScotlandReg-1.svg" />`;
	    }
	  }
          if (z === "independent") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/independent/IndependentReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/independent/IndependentReg-1.svg" />`;
	    }
	  }

      }
    }

    return html;
  }

  returnArmies(space) {

    let html = '<div class="space_army" id="">';
    let tile = "";
    let spacekey = space.key;
    let controlling_faction = "";
    if (space.political != "") { controlling_faction = space.political; } else {
      if (space.home != "") { controlling_faction = space.home; }
    }

    for (let z in space.units) {

      //
      // ideally our space is "pre-calculated" and we can display the correct
      // mix of tiles. this should be saved in this.game.state.board["papacy"]
      // etc. see his-units for the returnOnBoardUnits() function that organizes
      // this data object.
      //
      if (this.game.state.board[z]) {
        html += this.returnMercenaryTiles(z, spacekey);
        html += this.returnArmyTiles(z, spacekey);
	tile = html;
      } else {

        new_units = false;

	//
	// AUTO - ARMIES
	//
        let army = 0;
        for (let zz = 0; zz < space.units[z].length; zz++) {
  	  if (space.units[z][zz].type === "regular") {
	    new_units = true;
	    army++;
	  }
        }

        while (army >= 1) {
          if (z === "hapsburg") {
            tile = "/his/img/tiles/hapsburg/";	  
	    if (army >= 4) {
              tile += `HapsburgReg-4.svg`;
	      army -= 4;
	    } else {
	      if (army >= 2) {
                tile += `HapsburgReg-2.svg`;
	        army -= 2;
	      } else {
	        if (army >= 1) {
                  tile += `HapsburgReg-1.svg`;
	          army -= 1;
	        }
	      }
            }
	  }
          if (z === "england") {
            tile = "/his/img/tiles/england/";	  
	    if (army >= 4) {
              tile += `EnglandReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `EnglandReg-2.svg`;
	        army -= 2;
              } else {
	        if (army >= 1) {
                  tile += `EnglandReg-1.svg`;
	          army -= 1;
                }
              }
	    }
          }
          if (z === "france") {
            tile = "/his/img/tiles/france/";	  
	    if (army >= 4) {
              tile += `FrenchReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `FrenchReg-2.svg`;
	        army -= 2;
              } else {
	        if (army >= 1) {
                  tile += `FrenchReg-1.svg`;
	          army -= 1;
                }
	      }
	    }
          }
          if (z === "papacy") {
            tile = "/his/img/tiles/papacy/";	  
            if (army >= 4) {
              tile += `PapacyReg-4.svg`;
              army -= 4;
            } else {
	      if (army >= 2) {
                tile += `PapacyReg-2.svg`;
	        army -= 2;
	      } else {
	        if (army >= 1) {
                  tile += `PapacyReg-1.svg`;
	          army -= 1;
	        }
	      }
	    }
          }
          if (z === "protestant") {
            tile = "/his/img/tiles/protestant/";	  
	    if (army >= 4) {
              tile += `ProtestantReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `ProtestantReg-2.svg`;
	        army -= 2;
               } else {
	         if (army >= 1) {
                   tile += `ProtestantReg-1.svg`;
	           army -= 1;
                 }
	       }
            }
          }
          if (z === "ottoman") {
            tile = "/his/img/tiles/ottoman/";	  
	    if (army >= 4) {
              tile += `OttomanReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `OttomanReg-2.svg`;
	        army -= 2;
              } else {
	        if (army >= 1) {
                  tile += `OttomanReg-1.svg`;
	          army -= 1;
                }
              }
            }
          }
          if (z === "independent") {
            tile = "/his/img/tiles/independent/";	  
	    if (army >= 2) {
              tile += `IndependentReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `IndependentReg-1.svg`;
	        army -= 1;
              } 
	    }
          }
          if (z === "venice") {
            tile = "/his/img/tiles/venice/";	  
	    if (army >= 2) {
              tile += `VeniceReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `VeniceReg-1.svg`;
	        army -= 1;
              }
	    }
          }
          if (z === "hungary") {
            tile = "/his/img/tiles/hungary/";	  
	    if (army >= 4) {
              tile += `HungaryReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `HungaryReg-2.svg`;
	        army -= 2;
              } else {
	        if (army >= 1) {
                  tile += `HungaryReg-1.svg`;
	          army -= 1;
                }
              }
            }
          }
          if (z === "genoa") {
            tile = "/his/img/tiles/genoa/";	  
	    if (army >= 2) {
              tile += `GenoaReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `GenoaReg-1.svg`;
	        army -= 1;
              }
            }
          }
          if (z === "scotland") {
            tile = "/his/img/tiles/scotland/";	  
	    if (army >= 2) {
              tile += `ScottishReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `ScottishReg-1.svg`;
	        army -= 1;
              }
            } 
          }
        }

        if (new_units == true) {
          if (controlling_faction != "" && controlling_faction !== z) {
            html += `<img class="army_tile army_tile" src="${tile}" />`;
  	  } else {
            html += `<img class="army_tile" src="${tile}" />`;
	  }
        }




        new_units = false;

        army = 0;
        for (let zz = 0; zz < space.units[z].length; zz++) {
          if (space.units[z][zz].type === "mercenary") {
  	    new_units = true;
            army++;
          }
        }

        while (army > 0) {
          if (z != "") {
            if (z === "hapsburg") {
              tile = "/his/img/tiles/hapsburg/";	  
	      if (army >= 4) {
                tile += `HapsburgMerc-4.svg`;
	        army -= 4;
	      } else {
	      if (army >= 2) {
                tile += `HapsburgMerc-2.svg`;
	        army -= 2;
	      } else {
	      if (army >= 1) {
                tile += `HapsburgMerc-1.svg`;
	        army -= 1;
	      }
	      }
	      }
            }
            if (z === "england") {
              tile = "/his/img/tiles/england/";	  
	      if (army >= 4) {
                tile += `EnglandMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `EnglandMerc-2.svg`;
	        army -= 4;
              } else {
	      if (army >= 1) {
                tile += `EnglandMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "france") {
              tile = "/his/img/tiles/france/";	  
	      if (army >= 4) {
                tile += `FrenchMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `FrenchMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `FrenchMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "papacy") {
              tile = "/his/img/tiles/papacy/";	  
	      if (army >= 4) {
                tile += `PapacyMerc-4.svg`;
	        army -= 4;
	      } else {
	      if (army >= 2 && tile.indexOf("svg") == -1) {
                tile += `PapacyMerc-2.svg`;
	        army -= 2;
	      } else {
	      if (army >= 1 && tile.indexOf("svg") == -1) {
                tile += `PapacyMerc-1.svg`;
	        army -= 1;
	      }
	      }
	      }
            }
            if (z === "protestant") {
              tile = "/his/img/tiles/protestant/";	  
	      if (army >= 4) {
                tile += `ProtestantMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `ProtestantMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `ProtestantMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "ottoman") {
              tile = "/his/img/tiles/ottoman/";	  
	      if (army >= 4) {
                tile += `OttomanMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `OttomanMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `OttomanMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
          }


          if (new_units == true) {
            if (controlling_faction != "" && controlling_faction !== z) {
              html += `<img class="army_tile army_tile" src="${tile}" />`;
  	    } else {
              html += `<img class="army_tile" src="${tile}" />`;
	    }
          }
        }
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnMercenaryTiles(faction, spacekey) {

    let z = faction;
    let space = this.game.spaces[spacekey];
    let html = "";

    if (this.game.state.board[z]) {
      if (this.game.state.board[z].deployed[spacekey]) {

	  let tile = "";
          if (z === "hapsburg") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-1.svg" />`;
	    }
	  }
          if (z === "ottoman") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-1.svg" />`;
	    }
	  }
          if (z === "papacy") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-1.svg" />`;
	    }
	  }
          if (z === "england") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-1.svg" />`;
	    }
	  }
          if (z === "france") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-1.svg" />`;
	    }
	  }
          if (z === "protestant") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-1.svg" />`;
	    }
	  }
      }
    }

    return html;

  }


  returnMercenaries(space) {

    let html = '<div class="space_mercenaries" id="">';
    let tile = "";
    let spacekey = space.key;

    for (let z in space.units) {

      //
      // ideally our space is "pre-calculated" and we can display the correct
      // mix of tiles. this should be saved in this.game.state.board["papacy"]
      // etc. see his-units for the returnOnBoardUnits() function that organizes
      // this data object.
      //
      if (this.game.state.board[z]) {
        html += this.returnMercenaryTiles(z, spacekey);
	tile = html;
      } else {

        new_units = false;

        let army = 0;
        for (let zz = 0; zz < space.units[z].length; zz++) {
          if (space.units[z][zz].type === "mercenary") {
  	    new_units = true;
            army++;
          }
        }

        while (army > 0) {
          if (z != "") {
            if (z === "hapsburg") {
              tile = "/his/img/tiles/hapsburg/";	  
	      if (army >= 4) {
                tile += `HapsburgMerc-4.svg`;
	        army -= 4;
	      } else {
	      if (army >= 2) {
                tile += `HapsburgMerc-2.svg`;
	        army -= 2;
	      } else {
	      if (army >= 1) {
                tile += `HapsburgMerc-1.svg`;
	        army -= 1;
	      }
	      }
	      }
            }
            if (z === "england") {
              tile = "/his/img/tiles/england/";	  
	      if (army >= 4) {
                tile += `EnglandMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `EnglandMerc-2.svg`;
	        army -= 4;
              } else {
	      if (army >= 1) {
                tile += `EnglandMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "france") {
              tile = "/his/img/tiles/france/";	  
	      if (army >= 4) {
                tile += `FrenchMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `FrenchMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `FrenchMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "papacy") {
              tile = "/his/img/tiles/papacy/";	  
	      if (army >= 4) {
                tile += `PapacyMerc-4.svg`;
	        army -= 4;
	      } else {
	      if (army >= 2 && tile.indexOf("svg") == -1) {
                tile += `PapacyMerc-2.svg`;
	        army -= 2;
	      } else {
	      if (army >= 1 && tile.indexOf("svg") == -1) {
                tile += `PapacyMerc-1.svg`;
	        army -= 1;
	      }
	      }
	      }
            }
            if (z === "protestant") {
              tile = "/his/img/tiles/protestant/";	  
	      if (army >= 4) {
                tile += `ProtestantMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `ProtestantMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `ProtestantMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "ottoman") {
              tile = "/his/img/tiles/ottoman/";	  
	      if (army >= 4) {
                tile += `OttomanMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `OttomanMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `OttomanMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
          }
          html += `<img class="mercenary_tile" src="${tile}" />`;
        }
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnPersonagesTiles(faction, spacekey) {

    let z = faction;
    let space = this.game.spaces[spacekey];
    if (!space || space == undefined) { space = this.game.navalspaces[spacekey]; }

    let html = "";

      for (let zz = 0; zz < space.units[z].length; zz++) {
	let added = 0;
	if (space.units[z][zz].debater === true) {
          html += `<img src="/his/img/tiles/debater/${space.units[z][zz].img}" />`;
	  tile = html;
	  added = 1;
	}
	if (space.units[z][zz].army_leader && added == 0) {
          html += `<img src="/his/img/tiles/army/${space.units[z][zz].img}" />`;
	  added = 1;
	}
        if (space.units[z][zz].navy_leader && added == 0) {
	  html += `<img src="/his/img/tiles/navy/${space.units[z][zz].img}" />`;
	  added = 1;
	} 
        if (space.units[z][zz].reformer && added == 0) {
	  html += `<img src="/his/img/tiles/reformers/${space.units[z][zz].img}" />`;
	  added = 1;
	}
      }
    return html;
  }

  returnPersonages(space) {

    let html = '<div class="figures_tile" id="">';
    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";

    for (let z in space.units) {
      html += this.returnPersonagesTiles(z, space.key);
      tile = html;
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  refreshBoardUnits() {
    this.game.state.board["protestant"] = this.returnOnBoardUnits("protestant");
    this.game.state.board["papacy"] = this.returnOnBoardUnits("papacy");
    this.game.state.board["england"] = this.returnOnBoardUnits("england");
    this.game.state.board["france"] = this.returnOnBoardUnits("france");
    this.game.state.board["ottoman"] = this.returnOnBoardUnits("ottoman");
    this.game.state.board["hapsburg"] = this.returnOnBoardUnits("hapsburg");
    this.game.state.board["independent"] = this.returnOnBoardUnits("independent");
    this.game.state.board["venice"] = this.returnOnBoardUnits("venice");
    this.game.state.board["genoa"] = this.returnOnBoardUnits("genoa");
    this.game.state.board["scotland"] = this.returnOnBoardUnits("scotland");
    this.game.state.board["hungary"] = this.returnOnBoardUnits("hungary");
  }


  displaySpace(key) {

    let ts = new Date().getTime();
    if (this.game.state.board_updated < ts + 20000) {
      this.refreshBoardUnits();
    }

    if (!this.game.spaces[key]) { return; }

    let space = this.game.spaces[key];
    let tile = this.returnSpaceTile(space);

    let stype = "hex";

    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }

    //
    // should we show the tile?
    //
    let show_tile = 1;

    //
    // do not show under some conditions
    //
    if (space.political == space.home && space.religion != "protestant") { show_tile = 0; }
    if (space.political === "" && space.religion != "protestant") { show_tile = 0; }

    //
    // and force for keys
    //
    if (space.home === "" && space.political !== "") { show_tile = 1; }
    if (space.type === "key") { show_tile = 1; }

    //
    // and force if has units
    //
    for (let key in space.units) {
      if (space.units[key].length > 0) {
	show_tile = 1; 
      }
    }

    //
    // sanity check
    //
    if (tile === "") { show_tile = 0; }

    let t = "."+key;
    document.querySelectorAll(t).forEach((obj) => {

      obj.innerHTML = "";

      if (show_tile === 1) {
        obj.innerHTML = `<img class="${stype}tile" src="${tile}" />`;
        obj.innerHTML += this.returnArmies(space);
        obj.innerHTML += this.returnNavies(space);
        obj.innerHTML += this.returnPersonages(space);
      }

      if (space.fortified == 1) {
        obj.innerHTML += `<img class="fortified" src="/his/img/tiles/Fortress.svg" />`;
      }
      if (this.isSpaceInUnrest(space)) {
        obj.innerHTML += `<img class="unrest" src="/his/img/tiles/unrest.svg" />`;
      }
      if (this.isSpaceBesieged(space)) {
        obj.innerHTML += `<img class="siege" src="/his/img/tiles/siege.png" />`;
      }

    });

  }

  displayNavalSpace(key) {

    if (!this.game.navalspaces[key]) { return; }

    let obj = document.getElementById(key);
    let space = this.game.navalspaces[key];

    //
    // should we show the tile?
    //
    let show_tile = 1;

    //
    // do not show under some conditions
    //

    if (show_tile === 1) {
      obj.innerHTML += this.returnNavies(space);
      obj.innerHTML += this.returnPersonages(space);
    }

  }

  displayNavalSpaces() {

    //
    // add tiles
    //
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key]) {
	this.displayNavalSpace(key);
      }
    }

  }

  addSelectable(el) {
    if (!el.classList.contains("selectable")) {
      el.classList.add('selectable');
    }
  }

  removeSelectable() {
    document.querySelectorAll(".selectable").forEach((el) => {
      el.onclick = (e) => {};
      el.classList.remove('selectable');
    });
    $('.space').off();
  }

  displaySpaces() {

    let his_self = this;

    //
    // generate faction tile info
    //
    if (!this.game.state.board) {
      this.game.state.board["protestant"] = this.returnOnBoardUnits("protestant");
      this.game.state.board["papacy"] = this.returnOnBoardUnits("papacy");
      this.game.state.board["england"] = this.returnOnBoardUnits("england");
      this.game.state.board["france"] = this.returnOnBoardUnits("france");
      this.game.state.board["ottoman"] = this.returnOnBoardUnits("ottoman");
      this.game.state.board["hapsburg"] = this.returnOnBoardUnits("hapsburg");
    }

    //
    // add tiles
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {
	this.displaySpace(key);
      }
    }

    let xpos = 0;
    let ypos = 0;


    if (!his_self.bound_gameboard_zoom) {

      $('.gameboard').on('mousedown', function (e) {
        if (e.currentTarget.classList.contains("space")) { return; }
        xpos = e.clientX;
        ypos = e.clientY;
      });
      $('.gameboard').on('mouseup', function (e) { 
        if (Math.abs(xpos-e.clientX) > 4) { return; }
        if (Math.abs(ypos-e.clientY) > 4) { return; }
	//
	// if this is a selectable space, let people select directly
	//
	// this is a total hack by the way, but it captures the embedding that happens when
	// we are clicking and the click actino is technically on the item that is INSIDE
	// the selectable DIV, like a click on a unit in a key, etc.
	//
	if (e.target.classList.contains("selectable")) {
	  // something else is handling this
	  return;
	} else {
	  let el = e.target;
	  if (el.parentNode) {
	    if (el.parentNode.classList.contains("selectable")) {
	      // something else is handling this
	      return;
	    } else {
	      if (el.parentNode.parentNode) {
	        if (el.parentNode.parentNode.classList.contains("selectable")) {
	          return;
	        }
	      }
	    }
	  }
	}
	// otherwise show zoom
        //if (e.target.classList.contains("space")) {
          his_self.theses_overlay.renderAtCoordinates(xpos, ypos);
	  //e.stopPropagation();
	  //e.preventDefault();	
	  //return;
	//}
      });

      his_self.bound_gameboard_zoom = 1;

    }


  }


  displayVictoryTrack() {

    let factions_and_scores = this.calculateVictoryPoints();

    let x = this.returnVictoryPointTrack();

    for (f in factions_and_scores) {
      let total_vp = factions_and_scores[f].vp;
      let ftile = f + "_vp_tile";
      obj = document.getElementById(ftile);
      obj.style.left = x[total_vp.toString()].left + "px";
      obj.style.top = x[total_vp.toString()].top + "px";
      obj.style.display = "block";
    }

  }



  returnCardImage(cardname) {

    let cardclass = "cardimg";
    let deckidx = -1;
    let card;
    let cdeck = this.returnDeck();
    let ddeck = this.returnDiplomaticDeck();

    if (cardname === "pass") {
      return `<img class="${cardclass}" src="/his/img/cards/PASS.png" /><div class="cardtext">pass</div>`;
    }

    if (this.debaters[cardname]) { return this.debaters[cardname].returnCardImage(); }

    for (let i = 0; i < this.game.deck.length; i++) {
      var c = this.game.deck[i].cards[cardname];
      if (c == undefined) { c = this.game.deck[i].discards[cardname]; }
      if (c == undefined) { c = this.game.deck[i].removed[cardname]; }
      if (c !== undefined) { 
	deckidx = i;
        card = c;
      }
    }
    if (c == undefined) { c = cdeck[cardname]; card = cdeck[cardname]; }
    if (c == undefined) { c = ddeck[cardname]; card = ddeck[cardname]; }

    //
    // triggered before card deal
    //
    if (cardname === "008") { return `<img class="${cardclass}" src="/his/img/cards/HIS-008.svg" />`; }

    if (deckidx === -1 && !cdeck[cardname] && !ddeck[cardname]) {
      //
      // this is not a card, it is something like "skip turn" or cancel
      //
      return `<div class="noncard" id="${cardname.replaceAll(" ","")}">${cardname}</div>`;
    }

    var html = `<img class="${cardclass}" src="/his/img/${card.img}" />`;

    //
    // add cancel button to uneventable cards
    //
    if (deckidx == 0) { 
      if (!this.deck[cardname]) {
        if (!this.deck[cardname].canEvent(this, "")) {
          html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
        }
      }
    }
    if (deckidx == 1) { 
      if (!this.diplomatic_deck[cardname].canEvent(this, "")) {
        html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
      }
    }

    return html

  }


  displayDebaterPopup(debater) {
    
  }



  async preloadImages() {
    var allImages = [
      "img/factions/protestant.png",
      "img/factions/papacy.png",
      "img/factions/england.png",
      "img/factions/france.png",
      "img/factions/ottoman.png",
      "img/factions/hapsburgs.png",
      "img/backgrounds/reformation.jpg",
      "img/backgrounds/theological-debate.jpg",
      "img/backgrounds/theological-debate2.jpg",
      "img/backgrounds/diet_of_worms.jpeg",
      "img/backgrounds/language-zone.jpg",
      "img/backgrounds/95_theses.jpeg",
    ];

    this.preloadImageArray(allImages);
  }

  preloadImageArray(imageArray=[], idx=0) {

    let pre_images = [imageArray.length];

    if (imageArray && imageArray.length > idx) {
      pre_images[idx] = new Image();
      pre_images[idx].onload = () => {
        this.preloadImageArray(imageArray, idx+1);
      }
      pre_images[idx].src = "/his/" + imageArray[idx];
    }

  }







  addCard(faction, card) {

    let p = this.returnPlayerOfFaction(faction);
    if (p) {

console.log("PLAYER OF FACTION: " + faction);
console.log(p);
 
      for (let z = 0; z < this.game.state.players_info[p-1].factions.length; z++) {
	if (this.game.state.players_info[p-1].factions[z] == faction) {
console.log("FACTION IS FHAND: " + z);
	  if (this.game.player == p) {
console.log("DECK FHAND IS: " + JSON.stringify(this.game.deck[0].fhand));
  	    this.game.deck[0].fhand[z].push(card);
	  }
	}
      }
     
    }
  }



} // end and export

module.exports = HereIStand;


