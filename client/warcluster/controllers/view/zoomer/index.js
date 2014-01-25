module.exports = function(context, config){
  THREE.EventDispatcher.call(this);

  var self = this;

  this.context = context;
  this.zoom = config.zoom || 0;
  this.zoomStep = config.zoomStep || 250;
  this.minZoom = config.minZoom || null;
  this.maxZoom = config.maxZoom || null;
  this.mousePosition = { x: 0, y: 0};

  this.zoomIt = function(e) {
    var zoomMode, step,
        self = this;
    if (e === "in" || e === "out") {
      step = (e === "in") ? -this.zoomStep : this.zoomStep;
      zoomMode = "zoom" + e; 
      this.mousePosition.x = (zoomMode === "zoomin") ? this.context.windowCenterX : 0;
      this.mousePosition.y = (zoomMode === "zoomin") ? this.context.windowCenterY : 0;
    }
    else {
      e.preventDefault();

      step = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      zoomMode = e.deltaY > 0 ? "zoomin" : "zoomout";
      this.mousePosition.x = (zoomMode === "zoomin") ? e.clientX : 0;
      this.mousePosition.y = (zoomMode === "zoomin") ? e.clientY : 0;
    }

    if (this.minZoom != null && this.maxZoom != null) {
      if (this.zoom + step < this.minZoom)
        this.zoom = this.minZoom;
      else if (this.zoom + step > this.maxZoom)
        this.zoom = this.maxZoom;
      else
        this.zoom += step;
    } else if (this.minZoom != null && this.maxZoom == null) {
      if (this.zoom + step < this.minZoom)
        this.zoom = this.minZoom;
      else
        this.zoom += step;
    } else if (this.minZoom == null && this.maxZoom != null) {
      if (this.zoom + step > this.maxZoom)
        this.zoom = this.maxZoom;
      else
        this.zoom += step;
    } else {
      this.zoom += step;
    }

    TweenLite.to(this.context.spaceScene.camera.position, 0.5, {
      z: this.zoom,
      ease: Cubic.easeOut,
      onStart: function() {
        self.dispatchEvent({
          type: "zoom", 
          zoom: self.zoom,
          mode: zoomMode
        });
      },
      onComplete: function(){        
        self.dispatchEvent({
          type: "scopeOfView", 
          zoom: self.zoom
        }); 
      }
    });
  }

  $(window).mousewheel(function(e){
    self.zoomIt(e);
  });
}

module.exports.prototype = new THREE.EventDispatcher();
