const Transaction = require("../../lib/saito/transaction").default;

/*********************************************************************************
 GAME MODULE v.

 This is a general parent class for modules that wish to implement Game logic. It
 introduces underlying methods for creating games via email invitations, and sending
 and receiving game messages over the Saito network. The module also includes random
 number routines for dice and deck management. Thanks for the Web3 Foundation for its
 support developing code that allows games to interact with cryptocurrency tokens and
 Polkadot parachains.

 This module attempts to use peer-to-peer connections with fellow gamers where
 possible in order to avoid the delays associated with on-chain transactions. All
 games should be able to fallback to using on-chain communications however. Peer-
 to-peer connections will only be used if both players have a proxymod connection
 established.

 Developers please note that every interaction with a random dice and or processing
 of the deck requires an exchange between machines, so games that do not have more
 than one random dice roll per move and/or do not require constant dealing of cards
 from a deck are easier to implement on a blockchain than those which require
 multiple random moves per turn.

 HOW IT WORKS

 We recommend new developers check out the WORDBLOCKS game for a quick introduction
 to how to build complex games atop the Saito Game Engine. Essentially, games require
 developers to manage a "stack" of instructions which are removed one-by-one from
 the main stack, updating the state of all players in the process.

 MINOR DEBUGGING NOTE

 core functionality from being re-run -- i.e. DECKBACKUP running twice on rebroadcast
 or reload, clearing the old deck twice. What this means is that if the msg.extra
 data fields are used to communicate, they should not be expected to persist AFTER
 core functionality is called like DEAL or SHUFFLE. etc. An example of this is in the
 Twilight Struggle headline code.

 **********************************************************************************/
let ModTemplate = require("./modtemplate");

//
// CORE Game Engine file are broken across several
// classes to compartmentalize related functionality
// these are all dynamically included in the main
// game-template.
//
const GameAcknowledge = require("./gametemplate-src/gametemplate-acknowledge");
const GameAnimation = require("./gametemplate-src/gametemplate-animation");
const GameArcade = require("./gametemplate-src/gametemplate-arcade");
const GameCards = require("./gametemplate-src/gametemplate-cards");
const GameMoves = require("./gametemplate-src/gametemplate-moves");
const GamePlayers = require("./gametemplate-src/gametemplate-players");
const GameQueue = require("./gametemplate-src/gametemplate-queue");
const GameGame = require("./gametemplate-src/gametemplate-game");
const GameUI = require("./gametemplate-src/gametemplate-ui");
const GameWeb3 = require("./gametemplate-src/gametemplate-web3");

let saito = require("./../saito/saito");
let GameLog = require("./../saito/ui/game-log/game-log");
let GameHud = require("./../saito/ui/game-hud/game-hud");
let GameMenu = require("./../saito/ui/game-menu/game-menu");
let GameClock = require("./../saito/ui/game-clock/game-clock");
let SaitoOverlay = require("./../saito/ui/saito-overlay/saito-overlay");
let GameCardbox = require("./../saito/ui/game-cardbox/game-cardbox");
let GamePlayerbox = require("./../saito/ui/game-playerbox/game-playerbox");
let GameCardfan = require("./../saito/ui/game-cardfan/game-cardfan");
let GameBoardSizer = require("./../saito/ui/game-board-sizer/game-board-sizer");
let GameHexGrid = require("./../saito/ui/game-hexgrid/game-hexgrid");
let GameCryptoTransferManager = require("./../saito/ui/game-crypto-transfer-manager/game-crypto-transfer-manager");
let GameAcknowledgeOverlay = require("./../saito/ui/game-acknowledge-overlay/game-acknowledge-overlay");
let GameObserverControls = require("./../saito/ui/game-observer/game-observer");
const GameScoreboard = require("./../saito/ui/game-scoreboard/game-scoreboard");
const GameHammerMobile = require("./../saito/ui/game-hammer-mobile/game-hammer-mobile");
const JSON = require("json-bigint");
let GameRaceTrack = require("./../saito/ui/game-racetrack/game-racetrack");

class GameTemplate extends ModTemplate {
  constructor(app) {
    super(app);

    this.name = "Game";
    this.game_length = 30; //Estimated number of minutes to complete a game
    this.game = {};
    this.moves = [];
    this.endmoves = [];
    this.commands = [];
    this.game_state_pre_move = "";

    this.acknowledge_text = "acknowledge"; // text shown in ACKNOWLEDGE

    // card height-width-ratio
    this.card_height_ratio = 1.53;
    //size of the board in pixels
    this.boardWidth = 500; //Should be overwritten by the (board game's) full size pixel width
    this.boardRatio = 1;

    //
    // crypto transfers auto-approved set to zero (manually confirm)
    //
    this.crypto_transfers_outbound_approved = 0;
    this.crypto_transfers_inbound_trusted = 0;
    this.grace_window = 4;
    this.decimal_precision = 8; /* used to round off strings representing crypto/token fractions */

    //
    // optional interface -- shouldn't really have these defaults
    //
    this.useHUD = 0;
    this.useCardbox = 0;
    this.useClock = 0;

    this.lock_interface = 0;
    this.lock_interface_step = "";
    this.lock_interface_tx = "";

    this.crypto_msg = "winner takes all";
    this.winnable = 1; // if it is possible to win this game
    this.loseable = 1; // if it is possible to lose this game
    this.cooperative = 0; // if this is a cooperative game

    this.request_no_interrupts = true;

    this.confirm_moves = 0;
    this.confirm_this_move = 0;

    this.animationSpeed = 1500;
    /*
     * Our self defined animations add a marker (their div id) whenever they start and remove it when they finish
     * so we can know if animations are actively moving around the screen through animation_queue
     * Meanwhile, we may want to set up a series of animations with slight pauses between each one kicks off, so animationSequence
     * holds structure object data with the animation function and its parameters. The method runAnimationQueue will execute each animation in turn
     */
    this.animation_queue = [];
    this.animationSequence = [];

    //
    // game interface variables
    //
    this.interface = 0; // 0 = no hud
    // 1 = graphics hud
    // 2 = text hud

    this.relay_moves_offchain_if_possible = 1;
    this.initialize_game_offchain_if_possible = 1;

    this.next_move_onchain_only = 0;

    this.hud = new GameHud(app, this);
    this.clock = new GameClock(app, this);
    this.log = new GameLog(app, this);
    this.cardfan = new GameCardfan(app, this);
    this.playerbox = new GamePlayerbox(app, this);
    this.cardbox = new GameCardbox(app, this);
    this.menu = new GameMenu(app, this);
    this.hammer = new GameHammerMobile(app, this); 
    this.sizer = new GameBoardSizer(app, this); //yes constructor
    this.crypto_transfer_manager = new GameCryptoTransferManager(app, this);
    this.scoreboard = new GameScoreboard(app, this);
    this.hexgrid = new GameHexGrid(app, this);
    this.overlay = new SaitoOverlay(app, this, false);
    this.acknowledge_overlay = new GameAcknowledgeOverlay(app, this);
    this.observerControls = new GameObserverControls(app, this);
    this.racetrack = new GameRaceTrack(app, this);

    this.scripts = ['/saito/lib/hammer/hammer.min.js'];


    this.clock_timer = null; //Interval reference updating countdown clock
    this.menus = [];
    this.minPlayers = 2;
    this.maxPlayers = 2;
    this.lang = "en";
    this.log_length = 150;

    this.card_back = "red_back.png";

    this.publisher_message = "";

    this.time = {};
    this.time.last_received = 0; //For when we last received control of game
    this.time.last_sent = 0; //For when we send our moves

    //
    // used to generate provably-fair dice rolls
    //
    this.secureroll_rnums = [];
    this.secureroll_hash = "";

    //
    // used in reshuffling
    //
    this.old_discards = {};
    this.old_removed = {};
    this.old_cards = {};
    this.old_crypt = [];
    this.old_keys = [];
    this.old_hand = [];

    this.halted = 0;
    this.gaming_active = 1; //
    // this works like halted, except at the level of
    // the game engine. when a move arrives it flips to 1
    // and when a move (rnQueue) has finished executing it
    // goes back to 0. The purpose is to prevent a second
    // move from arriving and executing while the previous
    // one is still executing.
    //
    // the difference between halted and gaming_active
    // for design purposes is that halted should be
    // used when the interface stops the game (i.e. user
    // acknowledgement is required for the game to progress
    // while gaming_active happens behind the scenes.
    //

    //
    // have we tried running our existing queue?
    //
    this.initialize_game_run = 0;

    //
    // this is distinct from this.game.initialize_game_run
    // the reason is that BOTH are set to 1 when the game
    // is initialized. But we only nope out on initializing
    // the game if BOTH are 1. This allows us to swap in and
    // out saved games, but still init the game on reload if
    // this.game.initialize_game_run is set to 1 but it is
    // a freshly loaded browser.
    //

    //
    // instead of associating a different function with each card css we are
    // associating a single one, and changing the reference function inside
    // to get different actions executed on click. Basically we swap out the
    // changeable function before attachingCardEvents and everything just works
    //
    let temp_self = this;
    this.changeable_callback = function (card) {};
    this.cardbox_callback = async function (card) {
      if (temp_self.changeable_callback !== null) {
        await temp_self.changeable_callback(card);
      }
    };
    this.menu_backup_callback = null;
    this.back_button_html = `<i class="fa fa-arrow-left" id="back_button"></i>`;

    this.hiddenTab = "hidden";
    this.notifications = 0;
    this.statistical_unit = "game";

    this.enable_observer = true;

    app.connection.on("update-username-in-game", () => {
      if (this.browser_active) {
        this.game.playerNames = [];
        this.game.players.forEach((playerKey, i) => {
          let name = this.app.keychain.returnUsername(playerKey);
          if (name.includes("...")) {
            name = `Player ${i + 1}`;
          }
          if (name.includes("@")) {
            name = name.substring(0, name.indexOf("@"));
          }
          console.log(playerKey, i, name);
          this.game.playerNames.push(name);
        });
        for (let i = 0; i < this.game.players.length; i++) {
          try {
            Array.from(
              document.querySelectorAll(`.saito-playername[data-id='${this.game.players[i]}']`)
            ).forEach((add) => (add.innerHTML = this.game.playerNames[i]));
          } catch (err) {
            console.error(err);
          }
        }
      }
    });

    return this;
  }

  //Since games are still on initializeHTML, we don't want default mod behavior to
  //add a bunch of random html to our games
  async render(app) {
    await super.render(app);
    app.connection.emit("set-relay-status-to-busy", {});
    this.initializeHTML(app);
  }

  async initializeHTML(app) {
    //
    // initialize game feeder tries to do this
    //
    // it needs to as the QUEUE which starts
    // executing may updateStatus and affect
    // the interface. So this is a sanity check
    //
    // These two tests should be copied to the top of any module that extends gameTemplate
    //
    if (this.browser_active == 0) {
      return;
    }
    if (this.initialize_game_run == 1) {
      return 0;
    }

    //
    // Query server to make sure you know and remember your new friends names
    this.app.connection.emit("registry-fetch-identifiers-and-update-dom", this.game.players);

    //
    // hash reflects game position
    //
    try {
      let oldHash = window.location.hash;
      if (oldHash != "") {
        let results = app.browser.parseHash(oldHash);
        let arcade_mod = app.modules.returnModule("Arcade");
        if (arcade_mod) {
          let msg = {
            game_id: results.gid,
            last_move: results.step,
            module: this.name,
          };

          let msgobj = app.crypto.stringToBase64(JSON.stringify(msg));
          // removed NOV 10
          //if (this.game.id != game_id) {
          //  arcade_mod.observeGame(msgobj);
          //  return;
          //}
        }
      }

      window.location.hash = `#`;

      let short_game_id = this.app.crypto.hash(this.game.id).slice(-6);

      window.location.hash = app.browser.initializeHash(
        `#gid=${short_game_id}&step=${this.game.step.game}`,
        oldHash,
        {}
      );
    } catch (err) {
      console.error(err);
    }

    //
    // check options for clock
    //
    //console.log("Game Options: ", JSON.parse(JSON.stringify(this.game.options)));
    if (this.game?.options?.clock) {
      if (parseFloat(this.game.options.clock) == 0) {
        this.game.clock_limit = 0;
        this.useClock = 0;
      } else {
        if (this.game.clock_spent == 0) {
          this.game.clock_limit = parseFloat(this.game.options.clock) * 60 * 1000;
          this.saveGame(this.game.id);
        }
        this.useClock = 1;
      }
      console.log("Set clock limit to ", this.game.clock_limit);
    }

    if (this.useClock == 1) {
      await this.clock.render();
    }

    if (this.game.player == 0) {
      this.observerControls.render();
      document.body.classList.add("observer-mode");
      if (this.game.live) {
        this.observerControls.step_speed = 3;
        this.observerControls.play(); //Just update the controls so they match our altered state
      }
    }

    //
    // load initial display preferences
    //
    if (this.app.options != undefined) {
      if (this.app.options.gameprefs != undefined) {
        if (this.app.options.gameprefs.lang != undefined) {
          this.lang = this.app.options.gameprefs.lang;
        }
        if (this.app.options.gameprefs.interface != undefined) {
          this.interface = this.app.options.gameprefs.interface;
        }
      }
    }

    // Set the name of the hidden property and the change event for visibility
    let visibilityChange;
    if (typeof document.hidden !== "undefined") {
      // Opera 12.10 and Firefox 18 and later support
      this.hiddenTab = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hiddenTab = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hiddenTab = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    document.addEventListener(
      visibilityChange,
      () => {
        if (document[this.hiddenTab]) {
        } else {
          if (this.tabInterval) {
            clearInterval(this.tabInterval);
            this.tabInterval = null;
            document.title = this.gamename || this.name;
            this.notifications = 0;
          }
        }
      },
      false
    );
  }

  attachEvents(app) {}

  //
  // ARCADE SUPPORT
  //
  respondTo(type) {
    /*
    This is primarily used as a flag to say "Yes I am a game", but some arcade functions want to
    access the game properties to render properly
    */
    if (type == "arcade-games") {
      let obj = {};
      obj.image = `/${this.returnSlug()}/img/arcade/arcade.jpg`;
      obj.banner = `/${this.returnSlug()}/img/arcade/arcade.jpg`;
      return obj;
    }

    if (type == "default-league") {
      let obj = {};
      obj.name = this.gamename || this.name;
      obj.game = this.name;
      obj.description = this.description;
      obj.ranking_algorithm = "ELO";
      obj.default_score = 1500;
      return obj;
    }

    return null;
  }

  async onPeerHandshakeComplete(app, peer) {
    //
    // if we have pending moves in this game in our wallet, relay again
    // Probably only need to check on startQueue (when reconnecting to network)

    if ((await this.hasGameMovePending()) && this.game?.initializing == 0) {
      let pending = await this.app.wallet.getPendingTxs();
      // rebroadcast game move out of paranoia
      for (let i = 0; i < pending.length; i++) {
        let tx = pending[i];
        let txmsg = tx.returnMessage();
        if (txmsg.module === this.name) {
          if (txmsg.game_id === this.game?.id) {
            if (txmsg?.step?.game) {
              if (this.game.step.players[tx.from[0].publicKey] < txmsg.step.game) {
                await this.app.network.propagateTransaction(tx);
                this.app.connection.emit("relay-send-message", {
                  recipient: this.game.accepted,
                  request: "game relay gamemove",
                  data: tx.toJson(),
                });
              }
            }
          }
        }
      }
    }
  }

  initializeObserverMode(tx) {
    let game_id = tx.signature;
    let txmsg = tx.returnMessage();

    console.log("!!!!!OBSERVER MODE!!!!!");
    console.log(game_id, JSON.parse(JSON.stringify(txmsg)));

    this.loadGame(game_id);

    //
    // otherwise setup the game
    //
    this.game.options = txmsg.options;
    this.game.module = txmsg.game;
    this.game.originator = txmsg.originator; //Keep track of who initiated the game
    this.game.players_needed = txmsg.players.length; //So arcade renders correctly

    for (let i = 0; i < txmsg.players.length; i++) {
      this.addPlayer(txmsg.players[i]);
    }

    this.saveGame(game_id);
    if (this.game.players_set == 0) {
      this.gaming_active = 1; //Prevent any moves processing while sorting players

      let players = [];
      for (let z = 0; z < this.game.players.length; z++) {
        players.push(this.app.crypto.hash(this.game.players[z] + this.game.id));
      }

      players.sort();

      let players_reconstructed = [];
      for (let z = 0; z < players.length; z++) {
        for (let zz = 0; zz < this.game.players.length; zz++) {
          if (players[z] === this.app.crypto.hash(this.game.players[zz] + this.game.id)) {
            players_reconstructed.push(this.game.players[zz]);
          }
        }
      }
      this.game.players = players_reconstructed;

      for (let i = 0; i < this.game.players.length; i++) {
        // defaults to SAITO keys
        // I guess this is useful for something...
        this.game.keys.push(this.game.players[i]);
      }

      //
      // game step
      //
      for (let i = 0; i < this.game.players.length; i++) {
        this.game.step.players[this.game.players[i]] = 0;
      }

      this.game.players_set = 1;

      this.gaming_active = 0;
    }

    this.saveGame(game_id);
  }

  /*
  Called by Saito on browser load
  */
  async initialize(app) {
    //We don't inherit (run super.initialize) from modTemplate so need to do this!
    this.publicKey = await this.app.wallet.getPublicKey();

    this.initializeQueueCommands(); // Define standard queue commands

    if (!this.browser_active) {
      //
      // We need the queuecommands defined so that game invites
      // can be initialized from outside the game
      //
      return;
    }

    this.calculateBoardRatio();

    //
    // we grab the game with the most current timestamp (ts)
    // since no ID is provided
    this.loadGame();

    //Just make sure I am in the accepted, so if I send a message, I also receive it
    //edge case with table games/observer
    this.addFollower(this.publicKey);

    //
    // initialize the clock
    //
    this.time.last_received = new Date().getTime();
    this.time.last_sent = new Date().getTime();

    await this.initializeGameQueue(this.game.id);
  }

  /*
  Minimum default, should be overwritten by every game module
  */
  async initializeGame() {
    if (this.game.dice == "") {
      this.initializeDice();
      this.queue.push("READY");
      this.saveGame(this.game.id);
    }
  }

  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();

    if (conf == 0) {
      let game_id = txmsg.game_id;

      if (!tx.isTo(this.publicKey)) {
        return;
      }

      if (!this.doesGameExistLocally(game_id)) {
        return;
      }

      if (!this.app.BROWSER) {
        return;
      }

      let current_game_id = this?.game?.id || null;
      let safety_catch = false;

      // what if no game is loaded into module
      if ((!this.game && game_id) || this.game.id !== game_id) {
        console.info("Game engine received move for other game. Safety catch, loading game...");
        if (current_game_id){
          this.saveGame(current_game_id);
        }
        this.loadGame(game_id);
        safety_catch = true;
      }

      // gameover requests
      if (txmsg.request === "gameover") {
        await this.receiveGameoverTransaction(blk, tx, conf, this.app);
      } else if (txmsg.request === "stopgame") {
        // stopgame requests
        await this.receiveStopGameTransaction(tx.from[0].publicKey, txmsg);
      } else if (txmsg.request === "game") {
        //
        // TODO - poker init fails if this is commented out
        //
        // do we have a failure here if relay not running / fails?
        //
        //
        // this could be a game init
        //
        if (!txmsg?.step?.game) {
          //Not a game move
          console.info(`${this.name} skipping ${JSON.stringify(txmsg)}`);
        } else {
          //
          // process game move
          //
          if (this.initialize_game_run == 0 || this.isFutureMove(tx.from[0].publicKey, txmsg)) {
            //console.log("ONCHAIN: is future move " + txmsg.step.game);
            await this.addFutureMove(tx);

            //Safety check in case observer missed a move
            //If we have multiple moves in the future queue and are receiving moves on chain,
            //then something has probably gone wrong
            if (this.game.player === 0 && this.game.future.length > 3) {
              await this.observerControls.next();
            }
          } else if (this.isUnprocessedMove(tx.from[0].publicKey, txmsg)) {
            //console.log("ONCHAIN: is next move " + txmsg.step.game);
            await this.addNextMove(tx);
            if (document[this.hiddenTab]) {
              this.startNotification();
            }
          } else {
            //console.log("is old move " + txmsg.step.game);
          }
        }
      }

      if (safety_catch && current_game_id){
        console.log("Resume current game...");
        this.loadGame(current_game_id);
      }
    }
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback = null) {
    let message;
    if (tx == null) {
      return;
    }
    try {
      message = tx.returnMessage();
    } catch (err) {
      console.log("@#421341234 error");
      console.log(JSON.stringify(tx));
      return;
    }

    if (app.BROWSER == 0) {
      return;
    }

    await super.handlePeerTransaction(app, tx, peer, mycallback);

    if (message?.request?.includes("game relay")) {
      if (message?.data != undefined) {
        let gametx = new Transaction(undefined, message.data);
        let gametxmsg = gametx.returnMessage();

        //
        // nope out if game does not exist locally
        //
        if (!this.doesGameExistLocally(gametxmsg.game_id)) {
          console.info(
            `Game does not exist locally. Not processing HPR message (${message.request}): waiting for on-chain`
          );
          return;
        }

        //
        // we appear to have two types of inbound message formats, so have a sanity
        // check on the loading mechanism.
        //
        if (this.name === gametxmsg.module) {
          //console.log("Game Peer Request",JSON.parse(JSON.stringify(gametxmsg)));

          //
          // Legacy safety catch in case somewhere doesn't use game_id as the standard in the message
          //
          if (gametxmsg.id) {
            gametxmsg.game_id = gametxmsg.id;
          }            

          //
          // if we are undefined here, we are not a module
          // that should be thinking about doing anything in
          // response to this game message.
          // -- or loading the game id came up with a different game module
          //
          if (!this.game?.id || gametxmsg.game_id != this.game.id) {
            console.warn("ERROR SKIPPING HPT IN GAME: " + this.game.id);
            return;
          }

          if (message.request === "game relay gamemove") {
            if (
              this.initialize_game_run == 0 ||
              this.isFutureMove(gametx.from[0].publicKey, gametxmsg)
            ) {
              await this.addFutureMove(gametx);
            } else if (this.isUnprocessedMove(gametx.from[0].publicKey, gametxmsg)) {
              await this.addNextMove(gametx);

              if (document[this.hiddenTab]) {
                this.startNotification();
              }
            }
          } else if (message.request === "game relay gameover") {
            await this.receiveGameoverTransaction(null, gametx, 0, app);
          } else if (message.request === "game relay stopgame") {
            await this.receiveStopGameTransaction(gametx.from[0].publicKey, gametxmsg);
          } else if (message.request == "game relay update") {
            if (gametxmsg.request == "follow game") {
              this.addFollower(gametxmsg.my_key);
            }
          }
        }
      }
    }
  }

  async preloadImages() {
    // Dummy function that games can implement if they have a lot of
    // image assets to load
    // TODO: add to render function by default and improve the games that use it
  }

  //
  // Games should have a function to turn off all game-specific dom events
  //
  removeEvents() {}

  //
  // Fisher–Yates shuffle algorithm:
  //
  shuffleArray(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  //
  // OBSERVER MODE - return keystate prior to move (hand, etc.)
  //
  // JSON.parse(JSON.stringify(this.game));
  // JSON.parse(JSON.stringify(this.game_state_pre_move));
  returnGameState(game_clone) {
    let sharekey = this.loadGamePreference(this.game.id + "_sharekey");
    for (let i = 0; i < game_clone.deck.length; i++) {
      if (sharekey) {
        game_clone.deck[i].hand = this.app.crypto.encodeXOR(
          this.app.crypto.stringToHex(JSON.stringify(game_clone.deck[i].hand)),
          sharekey
        );
        game_clone.deck[i].keys = this.app.crypto.encodeXOR(
          this.app.crypto.stringToHex(JSON.stringify(game_clone.deck[i].keys)),
          sharekey
        );
      } else {
        game_clone.deck[i].keys = [];
        game_clone.deck[i].hand = [];
      }
    }
    return game_clone;
  }

  startClock() {
    if (!this.useClock) {
      return;
    }

    clearInterval(this.clock_timer); //Just in case
    //console.log("Clock Limit: " + this.game.clock_limit);
    //console.log("Time spent so far: " + this.game.clock_spent);

    //Refresh the clock every second
    this.clock_timer = setInterval(() => {
      let t = new Date().getTime();
      let time_on_clock =
        this.game.clock_limit - (t - this.time.last_received) - this.game.clock_spent;
      if (time_on_clock <= 0) {
        clearInterval(this.clock_timer);
        this.clock.displayTime(0);
        this.sendStopGameTransaction("time out").then(() => {});
      }
      this.clock.displayTime(time_on_clock);
    }, 1000);
  }

  stopClock() {
    if (!this.useClock) {
      return;
    }
    clearInterval(this.clock_timer);

    //
    // game timer
    //
    this.time.last_sent = new Date().getTime();
    if (this.time.last_sent > this.time.last_received + 1000) {
      this.game.clock_spent += this.time.last_sent - this.time.last_received;
      let time_left = this.game.clock_limit - this.game.clock_spent;
      //console.log("TIME LEFT: " + time_left);
      this.clock.displayTime(time_left);
    }
  }

  /**
   * The Game Menu calls exitGame, which allows us to be a little smarter about
   * redirecting the user back to the Saito main page (e.g. Arcade, RedSquare,
   * wherever)
   */
  exitGame() {
    let homeModule = this.app.options.homeModule || "Arcade";
    let mod = this.app.modules.returnModuleByName(homeModule);
    let slug = mod?.returnSlug() || "arcade";
    window.location.href = "/" + slug;
  }

  // this function runs "connect" event
  onConnectionStable(app, peer) {
    if (this.app.BROWSER === 1) {
      siteMessage("Connection Restored", 1000);
    }
  }

  //
  //
  // ON CONNECTION UNSTABLE
  //
  // this function runs "disconnect" event
  onConnectionUnstable(app, peer) {
    if (this.app.BROWSER === 1) {
      siteMessage("Connection Unstable", 1000);
    }
  }
}

GameTemplate.importFunctions(
  GameAnimation,
  GameAcknowledge,
  GameArcade,
  GameCards,
  GameGame,
  GameMoves,
  GamePlayers,
  GameUI,
  GameQueue,
  GameWeb3
);

module.exports = GameTemplate;
