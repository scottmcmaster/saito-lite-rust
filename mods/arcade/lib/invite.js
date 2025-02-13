const JoinGameOverlay = require("./overlays/join-game");
const InviteTemplate = require("./invite.template");
const InviteTemplateSparse = require("./invite.template.sparse");
const JSON = require("json-bigint");

class Invite {
  constructor(app, mod, container, type, tx = null, publicKey = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.type = type;

    //
    // information may be stored in different places, so we
    // save these variables in our invite, and use the invite
    // version to display our overlay templates.
    //
    this.invite_data = {
      tx,
      game_id: "",
      game_name: "",
      game_status: "",
      originator: null,
      players: [],
      players_needed: 0,
      desired_opponent_publickeys: [],
      options: {},
      game_mod: null,
      game_slug: "",
      game_type: "standard game",
      winner: "",
      method: "",
      time_created: 0,
      time_finished: 0,
    };

    //
    // if we have a valid tx, parse the data, so that the UI components have easy access to info to render
    //
    if (tx) {
      let txmsg = tx.returnMessage();

      this.invite_data.game_id = tx.signature;
      this.invite_data.game_name = txmsg.game;
      this.invite_data.game_status = txmsg.request;
      this.invite_data.originator = txmsg.originator;
      this.invite_data.players = txmsg.players;
      this.invite_data.players_needed = txmsg.players_needed;
      this.invite_data.time_created = tx.timestamp;

      if (txmsg.winner) {
        this.invite_data.winner = txmsg.winner;
      }
      if (txmsg.method) {
        this.invite_data.method = txmsg.method;
      }
      if (txmsg.time_finished) {
        this.invite_data.time_finished = txmsg.time_finished;
      }
      if (txmsg.step) {
        this.invite_data.step = txmsg.step;
      }
      if (txmsg.timestamp) {
        this.invite_data.timestamp = txmsg.timestamp;
      }

      let alt_game_type = "";
      //We still don't know the exact data structures for specified invite(s)
      //But it isn't going to be a single string pushed into an array!
      if (txmsg.options?.desired_opponent_publickey) {
        if (!this.invite_data.players.includes(txmsg.options.desired_opponent_publickey)) {
          this.invite_data.desired_opponent_publickeys.push(
            txmsg.options.desired_opponent_publickey
          );
        }

        //Invitation / Challenge ?

        if (publicKey == txmsg.options.desired_opponent_publickey) {
          alt_game_type = "direct invite ";
          this.invite_data.game_type = "direct invite";
        }
      }

      this.invite_data.options = txmsg.options;

      let game_mod = app.modules.returnModule(txmsg.game);
      if (game_mod) {
        this.invite_data.game_mod = game_mod;
        this.invite_data.game_slug = game_mod.returnSlug();
        this.invite_data.game_name = game_mod.returnName();
      } else {
        this.invite_data.game_slug = this.invite_data.game_name.toLowerCase();
      }

      //
      //Figure out what kind of game invite for convenient display
      //

      //Custom Game

      let defaultOptions = game_mod.returnDefaultGameOptions();
      let defaultKeys = Object.keys(defaultOptions);
      let inviteKeys = Object.keys(txmsg.options);

      if (defaultKeys.length == inviteKeys.length) {
        for (const key of defaultKeys) {
          if (defaultOptions[key] !== txmsg.options[key] && !key.includes("game-wizard-players")) {
            alt_game_type += "custom ";
            this.invite_data.game_type = "custom game";
            break;
          }
        }
      } else {
        alt_game_type += "custom ";
        this.invite_data.game_type = "custom game";
      }

      //Crypto Game
      if (txmsg.options?.crypto) {
        alt_game_type += txmsg.options.crypto + " ";
        this.invite_data.game_type = `${txmsg.options.crypto} game`;
      }

      //League

      if (txmsg.options?.league_id) {
        this.invite_data.league = txmsg.options.league_id;
        alt_game_type += "league ";
        this.invite_data.game_type = "league game";
      }

      //Private (only shown to the originator)
      if (txmsg.request === "private") {
        alt_game_type += "private ";
        this.invite_data.game_type = "private game";
      }
      alt_game_type += "game";
      if (alt_game_type == "game") {
        this.invite_data.verbose_game_type = "standard game open invitation";
      } else {
        this.invite_data.verbose_game_type = alt_game_type;
      }
    }

    // calculate empty slots
    this.invite_data.empty_slots = Math.max(
      0,
      this.invite_data.players_needed - this.invite_data.players.length
    );

    // remove empty slots if any players are requested
    // because we will pre-fill in the invitees
    this.invite_data.empty_slots -= this.invite_data.desired_opponent_publickeys.length;
  }

  render() {
    let html = "";
    if (this.type == "sparse") {
      html = InviteTemplateSparse(this.app, this.mod, this.invite_data);
    } else {
      html = InviteTemplate(this.app, this.mod, this.invite_data);
    }

    if (this.container && document.querySelector(this.container)) {
      this.app.browser.addElementToSelector(html, this.container);
    } else {
      this.app.browser.replaceElementBySelector(html, ".arcade-invites");
    }
    this.attachEvents();
  }

  attachEvents() {
    let qs = `#saito-game-${this.invite_data.game_id}`;

    try {
      if (typeof document.querySelector(qs) != "undefined") {
        document.querySelector(qs).onclick = async (e) => {
          e.stopImmediatePropagation();

          await this.app.browser.logMatomoEvent(
            "GameInvite",
            this.invite_data.game_status,
            this.invite_data.game_mod.name
          );
          let game_overlay = new JoinGameOverlay(this.app, this.mod, this.invite_data);
          await game_overlay.render();
        };
      }
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Invite;
