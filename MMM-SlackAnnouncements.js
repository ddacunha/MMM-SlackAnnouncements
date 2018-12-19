/* global Module */

/* Magic Mirror
 * Module: slack-announcements
 *
 * By HackerHome MTV
 * MIT Licensed.
 */

Module.register("MMM-SlackAnnouncements", {
  // Configuration
  defaults: {
    title: "Announcements",
    channel: "",
    slackToken: "",
    updateMs: 3000 // in ms
  },

  getChannelMessages: function() {
    var url = `https://slack.com/api/channels.history?token=${
      this.config.slackToken
    }&channel=${this.config.channel}&count=1`;
    var self = this;
    var slackMessageRequest = new XMLHttpRequest();

    slackMessageRequest.open("GET", url, true);
    slackMessageRequest.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          var parsedResponse = JSON.parse(this.response);
          var message = parsedResponse.messages[0].text;
          var userid =  parsedResponse.messages[0].user;
          self.processMessage(message, userid);
        } else if (this.status === 401) {
          self.updateDom(self.config.animationSpeed);
        }
      }
    };

    slackMessageRequest.send();
  },

  getUserInfo: function() {
    var url = `https://slack.com/api/users.info?token=${
      this.config.slackToken
    }&user=${this.userid}`;
    var self = this;
    var slackMessageRequest = new XMLHttpRequest();

    slackMessageRequest.open("GET", url, true);
    slackMessageRequest.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status === 200) {
          var parsedResponse = JSON.parse(this.response);
          var userRealName =  parsedResponse.user["real_name"];
          self.processUserInfo(userRealName);
        } else if (this.status === 401) {
          self.updateDom(self.config.animationSpeed);
        }
      }
    };

    slackMessageRequest.send();
  },

  processMessage: function(message, userid) {
    this.message = message;
    this.userid = userid;
    this.updateDom();
  },

  processUserInfo: function(userRealName) {
    this.userRealName = userRealName;
    this.updateDom();
  },

  start: function() {
    var self = this;
    setInterval(function() {
      self.getChannelMessages();
      if ( typeof self.userid !== 'undefined') {
        self.getUserInfo();
      }
    }, this.config.updateMs);
  },

  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.class = "small"
    var displayText = this.message == undefined ? "Loading..." : this.message;
    var displayUser = this.userRealName == undefined ? "Loading..." : this.userRealName;

    wrapper.innerHTML = `
            <p>${displayText}</p>
            <h6>${displayUser}</h6>
        `;

    return wrapper;
  }
});
