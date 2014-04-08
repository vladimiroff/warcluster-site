var OrangeRaceTwitterStreamRender = jadeCompile(require("./render/orange-stream.jade"));
var RedRaceTwitterStreamRender = jadeCompile(require("./render/red-stream.jade"));
var YellowRaceTwitterStreamRender = jadeCompile(require("./render/yellow-stream.jade"));
var GreenRaceTwitterStreamRender =  jadeCompile(require("./render/green-stream.jade"));
// var BlueRaceTwitterStreamRender =   jadeCompile(require("./render/blue-stream.jade"));
// var PinkRaceTwitterStreamRender =   jadeCompile(require("./render/pink-stream.jade"));


module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  events: {
    "click .twitter-stream-toggle-btn": "toggleTwitterStream"
  },
  className: "twitter-stream",
  initialize: function() {    
  },
  render: function(clusterTeam) {
    this.$el.html(this.template());
    switch (clusterTeam) {
      case "InitLab":
        this.$el.append(RedRaceTwitterStreamRender());
        break;
      case "VarnaLab":
        this.$el.append(OrangeRaceTwitterStreamRender());
        break;
      case "Hackafe":
        this.$el.append(YellowRaceTwitterStreamRender());
        break;
      case "BurgasLab":
        this.$el.append(GreenRaceTwitterStreamRender());
        break;
    }
    return this;
  },
  toggleTwitterStream: function() {
    if (this.expanded()) {
      this.$(".icon-circle-arrow-right").removeClass("hide");
      this.$(".icon-circle-arrow-left").addClass("hide");
      this.showTwitterStream();
    } else {
      this.$(".icon-circle-arrow-right").addClass("hide");
      this.$(".icon-circle-arrow-left").removeClass("hide");
      this.hideTwitterStream();
    }
  },
  expanded: function() {
    return this.$(".icon-circle-arrow-right").hasClass("hide");
  },
  showTwitterStream: function() {
      TweenLite.to(this.$el, 0.3, {
        css:  {right: "0px"},
        ease: Cubic.easeOut
      });
  },
  hideTwitterStream: function() {
    TweenLite.to(this.$el, 0.3, {
      css:  {right: "-246px"},
      ease: Cubic.easeOut
    });
  }
})
