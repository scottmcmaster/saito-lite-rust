const saito = require("./../../../lib/saito/saito");
const SaitoUser = require("./../../../lib/saito/ui/saito-user/saito-user");
const TweetTemplate = require("./tweet.template");
const Link = require("./link");
const Image = require("./image");
const Post = require("./post");
const JSON = require("json-bigint");
const Transaction = require("../../../lib/saito/transaction").default;

class Tweet {
  constructor(app, mod, tx, container = ".tweet-manager") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "Tweet";

    if (!tx) {
      console.warn("Attempting to create a tweet from a null tx");
      return null; //Doesn't actually return null
    }

    let txmsg = tx.returnMessage();

    if (txmsg.module !== mod.name) {
      console.warn("Attempting to create Tweet from non-Redsquare tx");
      return null;
    }

    //
    // the core
    //
    this.tx = tx;

    //
    // ancillary content is stored in the tx.optional array, where it
    // can be saved back to the network of archive nodes / databases and
    // preserved along with the transaction as optional (unverified) but
    // associated content.
    //
    // this includes information like the number of replies, retweets,
    // likes, and information like open graph images, etc.
    //
    if (!this.tx.optional) {
      this.tx.optional = {};
    }
    if (this.tx.optional.parent_id) {
      this.parent_id = this.tx.optional.parent_id;
    }
    if (this.tx.optional.thread_id) {
      this.thread_id = this.tx.optional.thread_id;
    }
    if (!this.tx.optional.num_replies) {
      this.tx.optional.num_replies = 0;
    }
    if (!this.tx.optional.num_retweets) {
      this.tx.optional.num_retweets = 0;
    }
    if (!this.tx.optional.num_likes) {
      this.tx.optional.num_likes = 0;
    }
    if (!this.tx.optional.link_properties) {
      this.tx.optional.link_properties = null;
    }
    if (!this.tx.optional.parent_id) {
      this.tx.optional.parent_id = "";
    }
    if (!this.tx.optional.thread_id) {
      this.tx.optional.thread_id = "";
    }

    //
    // If I am not part of a thread, become my own thread
    // This value will get propagated to this.thread_id
    //
    this.tx.optional.thread_id = this.tx.signature;
    //
    // comments will specify parent and thread ids, so we should capture that in the optional
    // field here in the constructor so that we can guarantee they exist
    //
    if (txmsg.data) {
      if (txmsg.data.parent_id) {
        this.parent_id = this.tx.optional.parent_id = txmsg.data.parent_id;
      }
      if (txmsg.data.thread_id) {
        this.thread_id = this.tx.optional.thread_id = txmsg.data.thread_id;
      }
    }

    //
    // additional variables are created in-memory from the core transaction
    // without the need for re-saving, these are specified below.
    //
    this.text = "";
    this.youtube_id = null;
    this.created_at = this.tx.timestamp;
    // ***will be updated by tx.optional.updated_at if necessary***
    this.updated_at = this.tx.timestamp;

    //
    // the notice shows up at the top of the tweet BEFORE the username and
    // is used for "retweeted by X" or "liked by Y". the userline is the
    // line that goes in the tweet header below the username/address but to
    // the right of the identicon.
    //
    this.notice = "";

    this.user = new SaitoUser(
      app,
      mod,
      this.container + `> .tweet-${this.tx.signature} > .tweet-header`,
      this.tx.from[0].publicKey
    );

    //
    // Default is a new tweet
    //
    this.user.notice = "new post on " + this.formatDate(this.created_at);

    this.children = [];
    this.children_sigs_hmap = {};
    this.unknown_children = [];
    this.unknown_children_sigs_hmap = {};
    this.critical_child = null;
    this.render_after_selector = ""; //Used to attach replies to the original tweet

    this.retweet = null;
    this.retweeters = [];
    this.retweet_tx = null;
    this.links = [];
    this.link = null;
    this.show_controls = 1;
    this.force_long_tweet = false;
    this.is_long_tweet = false;
    this.is_retweet = false;
    this.parent_id = "";
    this.thread_id = "";


    //
    // Read data from txmsg.data and tx.optional to populate this class
    //
    try {
      this.setKeys(txmsg.data);
    } catch (err) {
      //console.log("ERROR 1: " + err);
    }
    try {
      this.setKeys(tx.optional);
    } catch (err) {
      //console.log("ERROR 2: " + err);
    }

    //
    //This is async and won't necessarily finish before running the following code!
    //
    this.generateTweetProperties(app, mod, 0);

    //
    // retweets
    //
    if (this.retweet_tx != null) {
      let newtx = new Transaction();
      newtx.deserialize_from_web(this.app, this.retweet_tx);

      this.retweet = new Tweet(
        this.app,
        this.mod,
        newtx,
        this.container + `> .tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`
      );
      this.retweet.is_retweet = true;
      this.retweet.show_controls = 0;
    }

    //
    // image preview -- copied over from txmsg.data.images
    //
    //tweet.tx.msg.data.images

    if (this.images?.length > 0) {
      this.img_preview = new Image(
        this.app,
        this.mod,
        this.container + `> .tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`,
        this.images,
        this.tx.signature
      );
    }

    // We will use this as a flag to know there were no breaking failures in the constructor
    this.noerrors = true;
  }

  formatDate(ts = 0) {
    let dt = this.app.browser.formatDate(ts || this.updated_at);
    return `${dt.month} ${dt.day}, ${dt.year} at ${dt.hours}:${dt.minutes}`;
  }

  //
  //  This is helpful when pulling older tweets and then running through the whole list of tweets
  //
  isRendered() {
    if (document.querySelector(`.tweet-manager > .tweet-${this.tx.signature}`)) {
      return true;
    }
    return false;
  }

  remove() {
    let eqs = `.tweet-${this.tx.signature}`;
    if (document.querySelector(eqs)) {
      document.querySelector(eqs).remove();
    }
  }

  render(prepend = false) {
    //Process link stuff here and not on constructor
    if (this.link && !this.link_preview) {
      this.link_preview = new Link(
        this.app,
        this.mod,
        this.container + `> .tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`,
        this
      );
    }

    // double-rendering is possible with commented retweets
    // but we should just replace, duh.

    let myqs = this.container + `> .tweet-${this.tx.signature}`;
    let replace_existing_element = true;

    let has_reply = false;
    let has_reply_disconnected = false;

    //
    // we might be re-rendering when critical child is on screen, so check if the
    // class exists and flag if so
    //
    let obj = document.querySelector(myqs);

    if (obj) {
      if (obj.classList.contains("has-reply")) {
        has_reply = true;
      }
      if (obj.classList.contains("has-reply-disconnected")) {
        has_reply_disconnected = true;
      }

      //
      // if prepend = true, remove existing element
      //
      if (prepend) {
        obj.remove();
      }
    }

    //
    // We only want this default behavior for main feed, NEED TO FIX
    //
    if (this.updated_at > this.created_at) {
      if (this.tx.optional.num_replies > 0) {
        this.user.notice = "new reply on " + this.formatDate();
      }
    }

    //
    // retweets without commentary? pass-through and render subtweet
    //
    if (this.retweet_tx && !this.text && !this.img_preview) {
      this.retweet.notice =
        "retweeted by " +
        this.app.browser.returnAddressHTML(this.tx.from[0].publicKey) +
        this.formatDate();
      this.retweet.container = ".tweet-manager";

      let t = this.mod.returnTweet(this.retweet.tx.signature);
      if (t) {
        t.notice = this.retweet.notice;
        t.render(prepend);
      } else {
        (this.retweet.user.container =
          this.container + `> .tweet-${this.tx.signature} > .tweet-header`),
          this.retweet.render(prepend);
      }
      return;
    }

    //
    // remove if selector does not exist
    //
    if (this.render_after_selector) {
      if (!document.querySelector(this.render_after_selector)) {
        this.render_after_selector = "";
      }
    }

    if (/*replace_existing_element &&*/ document.querySelector(myqs)) {
      this.app.browser.replaceElementBySelector(TweetTemplate(this.app, this.mod, this), myqs);
    } else if (prepend) {
      this.app.browser.prependElementToSelector(
        TweetTemplate(this.app, this.mod, this),
        this.container
      );
    } else if (this.render_after_selector) {
      this.app.browser.addElementAfterSelector(
        TweetTemplate(this.app, this.mod, this),
        this.render_after_selector
      );
    } else {
      this.app.browser.addElementToSelector(
        TweetTemplate(this.app, this.mod, this),
        this.container
      );
    }

    //
    // has-reply and has-reply-disconnected
    //
    if (has_reply) {
      let obj = document.querySelector(myqs);
      if (obj) {
        obj.classList.add("has-reply");
      }
    }
    if (has_reply_disconnected) {
      let obj = document.querySelector(myqs);
      if (obj) {
        obj.classList.add("has-reply-disconnected");
      }
    }

    //
    // modify width of any iframe
    //
    if (this.youtube_id != null && this.youtube_id != "null") {
      let tbqs = myqs + " .tweet-body .tweet-main";
      let ytqs = myqs + " .tweet-body .tweet-main .youtube-embed";
      if (document.querySelector(tbqs)) {
        let x = document.querySelector(tbqs).getBoundingClientRect();
        let y = document.querySelector(ytqs);
        if (x) {
          if (y) {
            y.style.width = Math.floor(x.width) + "px";
            y.style.height = Math.floor((x.width / 16) * 9) + "px";
          }
        }
      }
    }

    this.user.render();

    if (this.img_preview != null) {
      this.img_preview.render();
    }
    if (this.retweet) {
      this.retweet.render();
    }
    if (this.link_preview != null) {
      if (this.tx.optional.link_properties != null) {
        if (Object.keys(this.tx.optional.link_properties).length > 0) {
          this.link_preview.render();
        }
      }
    }

    this.attachEvents();
  }

  renderWithCriticalChild() {

    this.render();

    if (this.critical_child) {
      this.critical_child.render_after_selector = ".tweet-" + this.tx.signature;
      this.critical_child.render();

      let myqs = this.container + ` .tweet-${this.tx.signature}`;
      let obj = document.querySelector(myqs);
      if (obj) {
        if (this.critical_child.parent_id == this.tx.signature) {
          obj.classList.add("has-reply");
        } else {
          obj.classList.add("has-reply-disconnected");
        }
      }
    }

    this.attachEvents();
  }

  renderWithChildren() {
    //
    // first render the tweet
    //
    this.render();

    //
    // then render its children
    //
    // it's clear we need to figure out tweet threading....
    //
    if (this.children.length > 0) {
      let myqs = this.container + ` .tweet-${this.tx.signature}`;
      let obj = document.querySelector(myqs);
      if (obj) {
        obj.classList.add("has-reply");
      }

      for (let i = 0; i < this.children.length; i++) {
        this.children[i].container = this.container;
        this.children[i].render_after_selector = `.tweet-${this.tx.signature}`;
        this.children[i].renderWithChildren();
      }
    }

    this.attachEvents();
  }

  attachEvents() {
    let mod = this.mod;
    let app = this.app;

    if (this.show_controls == 0) {
      return;
    }

    try {
      //
      // tweet does not exist? exit
      //
      let this_tweet = document.querySelector(`.tweet-${this.tx.signature}`);
      if (!this_tweet) {
        return;
      }

      /////////////////////////////
      // Expand / Contract Tweet //
      /////////////////////////////
      //
      // if you don't want a tweet to auto-contract on display, set this.is_long_tweet
      // to be true before running attachEvents(); this will avoid it getting compressed
      // with full / preview toggle.
      //
      let el = document.querySelector(
        `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-text`
      );
      if (!el) {
        return;
      }
      if (!this.force_long_tweet) {
        if (el.clientHeight < el.scrollHeight) {
          el.classList.add("preview");
          this.is_long_tweet = true;
        } else {
          el.classList.add("full");
        }
      } else {
        el.classList.add("full");
      }

      /////////////////
      // view thread //
      /////////////////
      if (!this_tweet.dataset.hasClickEvent) {
        this_tweet.dataset.hasClickEvent = true;
        this_tweet.onclick = (e) => {
          //
          // if we have selected text, then we are trying to copy and paste and
          // the last thing we want is for the UI to update and prevent us from
          // being able to use the site.
          //
          let highlightedText = "";
          if (window.getSelection) {
            highlightedText = window.getSelection().toString();
          } else if (document.selection && document.selection.type != "Control") {
            highlightedText = document.selection.createRange().text;
          }
          if (highlightedText != "") {
            return;
          }

          let tweet_text = document.querySelector(
            `.tweet-${this.tx.signature} > .tweet-body > .tweet-main > .tweet-text`
          );

          if (this.is_long_tweet) {
            if (!tweet_text.classList.contains("full")) {
              tweet_text.classList.remove("preview");
              tweet_text.classList.add("full");
              this.force_long_tweet = true;
              return;
            }
          }

          //
          // if we are asking to see a tweet, WE SHOULD load from parent if exists
          //
          if (e.target.tagName != "IMG") {
            //window.location.href = `/redsquare/?tweet_id=${this.thread_id}`;
            app.connection.emit("redsquare-tweet-render-request", this);
          }
        };
      }

      ////////////////////////////////////////////////
      // view preview  -- click on the retweeted post
      ////////////////////////////////////////////////
      document.querySelectorAll(`.tweet-${this.tx.signature} .tweet`).forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          let sig = item.getAttribute("data-id");
          if (e.target.tagName != "IMG" && sig) {
            //window.location.href = `/redsquare/?tweet_id=${sig}`;
            let t = this.mod.returnTweet(sig);
            if (t) {
              app.connection.emit("redsquare-tweet-render-request", t);
            } else {
              console.warn("This is going to screw up the feed");
              this.retweet.container = ".tweet-manager";
              app.connection.emit("redsquare-tweet-render-request", this.retweet);
            }
          }
        });
      });

      ///////////
      // reply //
      ///////////
      document.querySelector(
        `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment`
      ).onclick = (e) => {

        e.preventDefault();
        e.stopImmediatePropagation();

        let post = new Post(this.app, this.mod, this);
        post.parent_id = this.tx.signature;
        post.thread_id = this.thread_id;

        post.source = "Reply";
        post.render();
        this.app.browser.prependElementToSelector(
          `<div id="post-tweet-preview-${this.tx.signature}" class="post-tweet-preview" data-id="${this.tx.signature}"></div>`,
          ".tweet-overlay"
        );

        //
        //Show quoted tweet in the post
        //
        let newtx = new Transaction(undefined, this.tx.toJson());
        newtx.signature =
          this.app.crypto.hash(this.tx.signature) + this.app.crypto.hash(this.tx.signature);

        let new_tweet = new Tweet(
          this.app,
          this.mod,
          newtx,
          `#post-tweet-preview-${this.tx.signature}`
        );
        new_tweet.show_controls = 0;
        new_tweet.render();
      };

      /////////////
      // retweet //
      /////////////
      document.querySelector(
        `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-retweet`
      ).onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let post = new Post(this.app, this.mod, this);

        post.source = "Retweet";
        post.render();

        this.app.browser.prependElementToSelector(
          `<div id="post-tweet-preview-${this.tx.signature}" class="post-tweet-preview" data-id="${this.tx.signature}"></div>`,
          ".tweet-overlay"
        );

        //Insert this tweet as a new Tweet in the post window
        let newtx = new Transaction(undefined, this.tx.toJson());
        newtx.signature =
          this.app.crypto.hash(this.tx.signature) + this.app.crypto.hash(this.tx.signature);

        let new_tweet = new Tweet(
          this.app,
          this.mod,
          newtx,
          `#post-tweet-preview-${this.tx.signature}`
        );
        new_tweet.show_controls = 0;
        new_tweet.render();
      };

      //////////
      // like //
      //////////
      const heartIcon = document.querySelector(
        `.tweet-${this.tx.signature} .tweet-like-button .heart-icon`
      );
      heartIcon.onclick = async (e) => {
        if (!heartIcon.classList.contains("liked")) {
          heartIcon.classList.add("liked");
	  this.mod.likeTweet(this.tx.signature);
        } else {
          setTimeout(() => {
            heartIcon.classList.remove("liked");
            heartIcon.classList.add("liked");
          }, 5);
        }

        e.preventDefault();
        e.stopImmediatePropagation();

        await this.mod.sendLikeTransaction(
          this.app,
          this.mod,
          { signature: this.tx.signature },
          this.tx
        );

        //
        // increase num likes
        //
        let obj = document.querySelector(
          `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-like .tweet-tool-like-count`
        );
        if (obj) {
          obj.innerHTML = parseInt(obj.innerHTML) + 1;
          if (!obj.classList.contains("liked")) { obj.classList.add("liked"); }
        }
      };

      ///////////
      // share //
      ///////////
      document.querySelector(
        `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-share`
      ).onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let tweetUrl =
          window.location.origin + window.location.pathname + "?tweet_id=" + this.tx.signature;
        navigator.clipboard.writeText(tweetUrl).then(() => {
          siteMessage("Link copied to clipboard.", 2000);
        });
      };

      //////////
      // flag //
      //////////
      document.querySelector(
        `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-flag`
      ).onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.mod.sendFlagTransaction(this.app, this.mod, { sig: this.tx.signature });
        this.flagged = 1;

        let obj = document.querySelector(`.tweet-${this.tx.signature}`);
        if (obj) {
          obj.style.display = "none";
        }
        salert("Tweet reported to moderators successfully.");
      };
    } catch (err) {
      console.log("ERROR attaching events to tweet: " + err);
    }
  }

  setKeys(obj) {
    for (let key in obj) {
      if (typeof obj[key] !== "undefined") {
        if (
          this[key] === 0 ||
          this[key] === "" ||
          this[key] === null ||
          typeof this[key] === "undefined"
        ) {
          this[key] = obj[key];
        }
      }
    }
  }

  async addTweet(tweet, levels_deep = 0) {

console.log("just in add tweet!");

    //
    // this means we know the comment is supposed to be somewhere in this thread/parent
    // but its own parent doesn't yet exist, so we are simply going to store it here
    // until we possibly add the parent (where we will check all unknown children) for
    // placement then.
    //

    //
    // make this UNKNOWN tweet our critical child if we do not have any critical children
    //
    if (!this.critical_child) {
      this.critical_child = tweet;
      if (tweet.created_at > this.updated_at) {
        //
        // April 14, 2023 - do not show critical children unless 2nd level
        //
        this.user.notice = "new reply on " + this.formatDate(tweet.created_at);
      }
    }

    //
    // if this tweet is the parent-tweet of a tweet we have already downloaded
    // and indexed here. this can happen if tweets arrive out-of-order.
    //
    for (let i = 0; i < this.unknown_children.length; i++) {
      if (this.unknown_children[i].parent_id === tweet.tx.signature) {
        if (this.isCriticalChild(this.unknown_children[i])) {
          this.critical_child = this.unknown_children[i];
          //
          // April 14, 2023 - do not show critical children unless 2nd level
          // - since we are adding a child, we do a levels check on OURSELVERS
          //
          if (levels_deep == 0) {
            this.updated_at = this.critical_child.updated_at;
          }

          this.user.notice = "new reply on " + this.formatDate();
        }
        this.unknown_children[i].parent_tweet = tweet;

        //
        // tweet adds its orphan
        //
        tweet.addTweet(this.unknown_children[i], levels_deep + 1);

        //
        // and delete from unknown children
        //
        this.removeUnknownChild(this.unknown_children[i]);
      }
    }


console.log("adding tweet under this tweet: " + tweet.tx.signature);
console.log("adding tweet with this parent_id: " + tweet.parent_id);

    //
    // tweet is direct child
    //
    if (tweet.parent_id == this.tx.signature) {

console.log("we are parent of this tweet!");

      //
      // already added?
      //
      if (this.children_sigs_hmap[tweet.tx.signature]) {
console.log("ALREADY ADDED - returning ZERO");
        return 0;
      }

      //
      // make critical child if needed
      //
      if (
        (this.isCriticalChild(tweet)) ||
        (tweet.tx.timestamp > this.updated_at && this.critical_child == null)
      ) {
        this.critical_child = tweet;
        //
        // April 14, 2023 - do not show critical children unless 2nd level
        // - since we are adding a child, we do a levels check on OURSELVERS
        //
        if (levels_deep == 0) {
          if (tweet.created_at > this.updated_at) {
            this.updated_at = tweet.created_at;
          }
        }

        this.user.notice = "new reply on " + this.formatDate();
      }

      //
      // prioritize tweet-threads
      //
      if (tweet.tx.from[0].publicKey === this.tx.from[0].publicKey) {
        this.children.unshift(tweet);
        this.children_sigs_hmap[tweet.tx.signature] == 1;
        this.removeUnknownChild(tweet);
        return 1;
      } else {
        tweet.parent_tweet = this;
        this.children.push(tweet);
        this.children_sigs_hmap[tweet.tx.signature] == 1;
        this.removeUnknownChild(tweet);
        return 1;
      }

      //
      // tweet belongs to a child
      //
    } else {

console.log("<--- maybe this is a sub-child");

      //
      // maybe it is a critical child
      //
console.log(" --- about to await crit child...");
      if (this.isCriticalChild(tweet)) {
console.log("is critical child...");
        this.critical_child = tweet;
        //
        // April 14, 2023 - do not show critical children unless 2nd level
        // - since we are adding a child, we do a levels check on OURSELVERS
        //
        if (levels_deep == 0) {
          if (tweet.created_at > this.updated_at) {
            this.updated_at = tweet.created_at;
          }
        }

        this.user.notice = "new reply on " + this.formatDate();
      }

console.log("moving forward");
console.log("is in children_sigs_hmap: " + this.children_sigs_hmap[tweet.parent_id]);

      if (this.children_sigs_hmap[tweet.parent_id]) {
console.log("num children: " + this.children.length);
        for (let i = 0; i < this.children.length; i++) {
console.log("adding child");
          if (this.children[i].addTweet(tweet, levels_deep + 1)) {
console.log("added child!!!");
            this.removeUnknownChild(tweet);
            this.children_sigs_hmap[tweet.tx.signature] = 1;
            //
            // April 14, 2023 - do not show critical children unless 2nd level
            // - since we are adding a child, we do a levels check on OURSELVERS
            //
            if (levels_deep == 0) {
              this.updated_at = tweet.updated_at;
              if (tweet.created_at > this.updated_at) {
                this.updated_at = tweet.created_at;
              }
            }

            this.user.notice = "new reply on " + this.formatDate();
            return 1;
          }
        }
      } else {
console.log("x: tweet isn't in sigs hmap");
console.log("levels deep: " + levels_deep);
        //
        // if still here, add to unknown children if top-level as we didn't add to any children
        //
	let inserted = false;
	for (let z = 0; z < this.children.length; z++) {
	  if (tweet.parent_id == this.children[z].tx.signature) {
console.log("we have found the parent id!");
	    if (this.children[z].addTweet(tweet) != 0) {
console.log("child got it added!");
              this.children_sigs_hmap[tweet.tx.signature] = 1;
	      inserted = true;
	    }
	  }
	}

        if (levels_deep == 0 && inserted == false) {
console.log("is tweet in unknown children sigs?");
          if (this.unknown_children_sigs_hmap[tweet.tx.signature] != 1) {
console.log("is tweet in unknown children sigs?");
            this.unknown_children.push(tweet);
            this.unknown_children_sigs_hmap[tweet.tx.signature] = 1;
          }
        }
      }
    }

console.log("ok, returning 1");

    return 1;
  }

  /////////////////////
  // query children  //
  /////////////////////
  hasChildTweet(tweet_sig) {
    if (this.tx.signature == tweet_sig) {
      return 1;
    }
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].hasChildTweet(tweet_sig)) {
        return 1;
      }
    }
    return 0;
  }

  returnChildTweet(tweet_sig) {
    if (this.tx.signature == tweet_sig) {
      return this;
    }
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].hasChildTweet(tweet_sig)) {
        return this.children[i].returnChildTweet(tweet_sig);
      }
    }
    return null;
  }

  removeUnknownChild(tweet) {
    if (this.unknown_children_sigs_hmap[tweet.tx.signature] == 1) {
      for (let i = 0; i < this.unknown_children.length; i++) {
        if (this.unknown_children[i].tx.signature === tweet.tx.signature) {
          this.unknown_children.splice(i, 0);
          delete this.unknown_children_sigs_hmap[tweet.tx.signature];
        }
      }
    }
  }

  isCriticalChild(tweet) {
    //
    // TODO -- changed comparison to !== March 13, right?
    //
    if (tweet.thread_id !== this.thread_id) {
      return false;
    }
    for (let i = 0; i < tweet.tx.to.length; i++) {
      if (tweet.tx.to[i].publicKey === this.mod.publicKey) {
        if (this.critical_child == null) {
          return true;
        }
        if (tweet.tx.timestamp > this.critical_child.tx.tx) {
          return true;
        }
      }
    }
    return false;
  }

  async generateTweetProperties(app, mod, fetch_open_graph = 0) {
    if (!this.text) {
      return this;
    }

    let expression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
    let links = this.text.match(expression);

    let link, urlParams;

    if (links != null && links.length > 0) {
      //
      // save the first link
      //
      let first_link = links[0];
      if (first_link.indexOf("http") == -1) {
        first_link = "http://" + first_link;
      }

      try {
        link = new URL(first_link);
        urlParams = new URLSearchParams(link.search);
        this.link = link.toString();
      } catch (err) {
        console.error(err);
        this.link = first_link;
      }

      //console.log(this.link);

      //
      // youtube link
      //
      if (this.link.indexOf("youtube.com") != -1 || this.link.indexOf("youtu.be") != -1) {
        let videoId = "";

        if (this.link.indexOf("youtu.be") != -1) {
          videoId = this.link.split("/");
          videoId = videoId[videoId.length - 1];
        } else if (urlParams) {
          videoId = urlParams.get("v");
        }

        if (videoId != null && videoId != "null") {
          this.youtube_id = videoId;
        }
        return this;
      }

      //
      // normal link
      //
      if (fetch_open_graph == 1) {
        //
        // Returns "" if a browser or error
        //
        let res = await mod.fetchOpenGraphProperties(app, mod, this.link);
        if (res !== "") {
          this.tx.optional.link_properties = res;
        }
      }
    }

    return this;
  }

  renderLikes() {
    // some edge cases where tweet won't have rendered
    try {
      let qs = `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-like .tweet-tool-like-count`;
      let likes = this.tx?.optional?.num_likes || 0;
      for (let obj of Array.from(document.querySelectorAll(qs))) {
        obj.innerHTML = likes;
      }
    } catch (err) {}
  }

  renderRetweets() {
    // some edge cases where tweet won't have rendered
    //console.log("RenderRetweets");
    try {
      let qs = `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-retweet .tweet-tool-retweet-count`;
      let retweets = this.tx?.optional?.num_retweets || 0;
      for (let obj of Array.from(document.querySelectorAll(qs))) {
        obj.innerHTML = retweets;
      }
    } catch (err) {}
  }

  renderReplies() {
    // some edge cases where tweet won't have rendered
    //console.log("RenderReplies");
    try {
      let qs = `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment .tweet-tool-comment-count`;
      let replies = this.tx?.optional?.num_replies || 0;
      for (let obj of Array.from(document.querySelectorAll(qs))) {
        obj.innerHTML = replies;
      }
    } catch (err) {}
  }
}

module.exports = Tweet;
