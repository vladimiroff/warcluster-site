var PlayerData = require("../../data/PlayerData");

module.exports = function(url, context){
  this.url = url;
  this.context = context;

  this.loginFn = null;
  this.renderViewFn = null;

  this.renderData = {
    suns: [],
    planets: [],
    missions: []
  }
}

module.exports.prototype.prepare = function(username, twitterId) {
  var self = this;

  this.username = username;
  this.twitterId = twitterId;

  var msg = {
    "Command": "login", 
    "Username": username, 
    "TwitterId": twitterId
  };
  var new_status = function(status) {
    console.log(status);
  };
  var on_message = function(msg) {
    self.parseMessage(msg.data);
  };
  var on_open = function() {
    console.log('open');

    self.sockjs.send(JSON.stringify(msg));
  }
  //TODO: figure out why I need to do SockReconnect.SockReconnect (double time instead of just ones)
  this.sockjs = new SockReconnect.SockReconnect(this.url, null, new_status, on_message, on_open);
  this.sockjs.connect();

}

module.exports.prototype.parseMessage = function(command) {
  try {
    var data = JSON.parse(command);
    console.log("###.parseMessage:", data);
  } catch(err) {
    console.log("###.InvalidData:", command);
    return false;
  }
  
  if (data.Command) {
    this.context.currentTime =  data.Timestamp;
    switch (data.Command) {
      case "login_success":
        var pd = new PlayerData();

        pd.Username = this.username;
        pd.TwitterID = this.twitterId;
        pd.Position = data.Position;
        pd.Race = data.RaceID;
        pd.HomePlanet = data.HomePlanet;
        pd.JustRegistered = data.JustRegistered;

        this.loginFn(pd);
      break;
      case "scope_of_view_result":
        this.renderViewFn(data);
      break;
      case "state_change":
        this.renderViewFn(data);
      break;
      case "request_setup_params":
        this.requestSetupParameters();
      break;
      case "send_mission":
        this.context.missionsFactory.build(data.Mission);
      break;
      case "send_mission_failed":
        if (!humane._animating) {
          humane.error("You're attacking with less than one pilot", {image: "./images/adjutant.gif",timeout:4000, clickToClose: true});
        }
      break;
      case "server_params":

        this.context.serverParams = {
          HomeSPM: data.HomeSPM,
          PlanetsSPM: data.PlanetsSPM,
          Teams: data.Teams
        }

        _.extend(this.context.Teams, data.Teams);
        for(name in this.context.Teams) {
          this.context.Teams[name].R = Math.ceil(this.context.Teams[name].R * 255);
          this.context.Teams[name].G = Math.ceil(this.context.Teams[name].G * 255);
          this.context.Teams[name].B = Math.ceil(this.context.Teams[name].B * 255);
        }
      break;
      default:
        console.log(data);
    }
  }
}

module.exports.prototype.scopeOfView = function(position, resolution) {
  //https://trello.com/c/slSUdtQd/214-fine-tune-scope-of-view
  var data = {"Command": "scope_of_view", "Position": position, "Resolution": [resolution.width || 1920, resolution.height || 1080]}
  //console.log("scopeOfView", data)
  this.sockjs.send(JSON.stringify(data));
}

module.exports.prototype.sendMission = function(type, source, target, ships) {
  //console.log("sendMission:", type, source, target, ships)
  this.sockjs.send(JSON.stringify({
    "Command": "start_mission",
    "Type": type,
    "StartPlanet": source,
    "EndPlanet": target,
    "Fleet": ships
  }));
}

module.exports.prototype.setupParameters = function(race, sun) {
  this.sockjs.send(JSON.stringify({
    "Command": "setup_parameters",
    "Race": race,
    "SunTextureId": sun
  }))
}