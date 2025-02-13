const SettingsAppspaceTemplate = require("./main.template.js");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const localforage = require("localforage");
const jsonTree = require("json-tree-viewer");

class SettingsAppspace {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.privateKey = null;

    this.overlay = new SaitoOverlay(app, mod);

    this.app.connection.on("settings-overlay-render-request", async () => {
      this.mod.attachStyleSheets();
      await this.render();
    });
  }

  async render() {
    this.privateKey = await this.app.wallet.getPrivateKey();
    this.overlay.show(SettingsAppspaceTemplate(this.app, this.mod, this));

    let settings_appspace = document.querySelector(".settings-appspace");
    if (settings_appspace) {
      for (let i = 0; i < this.app.modules.mods.length; i++) {
        if (this.app.modules.mods[i].respondTo("settings-appspace") != null) {
          let mod_settings_obj = this.app.modules.mods[i].respondTo("settings-appspace");
          mod_settings_obj.render(this.app, this.mod);
        }
      }
    }

    //debug info
    let el = document.querySelector(".settings-appspace-debug-content");

    try {
      let optjson = JSON.parse(
        JSON.stringify(
          this.app.options,
          (key, value) => (typeof value === "bigint" ? value.toString() : value) // return everything else unchanged
        )
      );
      var tree = jsonTree.create(optjson, el);
    } catch (err) {
      console.log("error creating jsonTree: " + err);
    }

    await this.attachEvents();
  }

  async attachEvents() {
    let app = this.app;
    let mod = this.mod;

    try {
      let settings_appspace = document.querySelector(".settings-appspace");
      if (settings_appspace) {
        for (let i = 0; i < app.modules.mods.length; i++) {
          if (app.modules.mods[i].respondTo("settings-appspace") != null) {
            let mod_settings_obj = app.modules.mods[i].respondTo("settings-appspace");
            mod_settings_obj.attachEvents(app, mod);
          }
        }
      }

      if (document.getElementById("register-identifier-btn")) {
        document.getElementById("register-identifier-btn").onclick = function (e) {
          app.connection.emit("register-username-or-login");
        };
      }

      if (document.getElementById("trigger-appstore-btn")) {
        document.getElementById("trigger-appstore-btn").onclick = function (e) {
          let appstore_mod = app.modules.returnModule("AppStore");
          if (appstore_mod) {
            appstore_mod.openAppstoreOverlay(app, appstore_mod);
          }
        };
      }

      //
      // install module (button)
      //
      Array.from(document.getElementsByClassName("modules_mods_checkbox")).forEach((ckbx) => {
        ckbx.onclick = async (e) => {
          let thisid = parseInt(e.currentTarget.id);
          let currentTarget = e.currentTarget;

          if (e.currentTarget.checked == true) {
            let sc = await sconfirm("Reactivate this module?");
            if (sc) {
              app.options.modules[thisid].active = 1;
              app.storage.saveOptions();
              window.location = window.location;
            } else {
              window.location = window.location;
            }
          } else {
            let sc = await sconfirm("Remove this module?");
            if (sc) {
              app.options.modules[thisid].active = 0;
              app.storage.saveOptions();
              window.location = window.location;
            } else {
              currentTarget.checked = true;
            }
          }
        };
      });

      if (document.getElementById("backup-account-btn")) {
        document.getElementById("backup-account-btn").onclick = (e) => {
          app.wallet.backupWallet();
        };
      }

      if (document.getElementById("restore-account-btn")) {
        document.getElementById("restore-account-btn").onclick = async (e) => {
          document.getElementById("file-input").addEventListener("change", function (e) {
            var file = e.target.files[0];
            app.wallet.restoreWallet(file);
          });
          document.querySelector("#file-input").click();
        };
      }

      document.getElementById("nuke-account-btn").onclick = async (e) => {
        let confirmation = await sconfirm(
          "This will reset/nuke your account, do you wish to proceed?"
        );
        if (confirmation) {
          app.keychain.keys = [];
          app.keychain.groups = [];
          localforage
            .clear()
            .then(function () {
              console.log("DB Reset Success");
              return app.wallet.resetWallet();
            })
            .catch(function (err) {
              console.error(err);
              return app.wallet.resetWallet();
            });              
        }
      };

      if (document.getElementById("clear-storage-btn")) {
        document.getElementById("clear-storage-btn").onclick = async (e) => {
          let confirmation = await sconfirm(
            "This will clear your browser's DB, proceed cautiously"
          );
          if (confirmation) {
            localforage
              .clear()
              .then(function () {
                console.log("Cleared LocalForage");
              })
              .catch(function (err) {
                console.error(err);
              });

            let archive = this.app.modules.returnModule("Archive");
            if (archive) {
              await archive.onWalletReset(true);
            }
          }
        };
      }

      Array.from(document.querySelectorAll(".settings-appspace .pubkey-containter")).forEach(
        (key) => {
          key.onclick = (e) => {
            navigator.clipboard.writeText(e.currentTarget.dataset.id);
            let icon_element = e.currentTarget.querySelector(".pubkey-containter i");
            icon_element.classList.toggle("fa-copy");
            icon_element.classList.toggle("fa-check");

            setTimeout(() => {
              icon_element.classList.toggle("fa-copy");
              icon_element.classList.toggle("fa-check");
            }, 1500);
          };
        }
      );

      document.getElementById("restore-privatekey-btn").onclick = async (e) => {
        let privatekey = "";
        let publicKey = "";

        try {
          privatekey = await sprompt("Enter Private Key:");
          if (privatekey != "") {
            let version = app.wallet.version;
            // await app.storage.resetOptions();

            publicKey = app.crypto.generatePublicKey(privatekey);
            console.log("111 : " + (await app.wallet.getPublicKey()));

            console.log("publickey ///");
            console.log(publicKey);

            await app.wallet.setPublicKey(publicKey);
            await app.wallet.setPrivateKey(privatekey);
            app.wallet.version = version;
            app.wallet.inputs = [];
            app.wallet.outputs = [];
            app.wallet.spends = [];
            app.wallet.pending = [];

            // await app.blockchain.resetBlockchain();
            delete app.options.keys;

            // await fetch wallet balance
            await app.wallet.fetchBalanceSnapshot(publicKey);

            console.log("wallet slips : ", await app.wallet.getSlips());
            await app.wallet.saveWallet();

            let c = await sconfirm("Success! Confirm to reload");

            if (c) {
              window.location.reload();
            }
          }
        } catch (e) {
          salert("Restore Private Key ERROR: " + e);
          console.log("Restore Private Key ERROR: " + e);
        }
      };
    } catch (err) {
      console.log("Error in Settings Appspace: ", err);
    }
  }
}

module.exports = SettingsAppspace;
