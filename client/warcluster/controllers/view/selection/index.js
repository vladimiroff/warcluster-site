module.exports = function(context, config){
  THREE.EventDispatcher.call(this);

  var self = this;

  config = config || {};

  this.context = context;
  this.mpos = {x: 0, y: 0};

  this.attackTarget = null;
  this.supportTarget = null;

  this.selectedPlanets = [];
  this.selectedTooltipPlanet = null;
  this.ctrlKey = false;
  this.shiftKey = false;

  this.selectionRect = $('<div class="selection-rect"></div>');

  // *****************************************************************

  this.context.spaceScene.afterRenderFn = function() {
    for (var i=0;i < self.context.planetsHitObjects.length;i ++) {
      self.context.planetsHitObjects[i].on("mouseover", function(e) {
        self.onPlanetMouseOver(e);
      });
      self.context.planetsHitObjects[i].on("mouseout", function(e) {
        self.onPlanetMouseOut(e);
      });
    }
  }

  var keymap = {};
  $(document).keydown(function(e){
    if (keymap[e.keyCode])
      return ;
    keymap[e.keyCode] = true;
    
    switch (e.keyCode) {
      case 16:
        self.shiftKey = true;
        if (self.supportTarget)
          self.supportTarget.hideSupportSelection();
      break;
      case 17:
        self.ctrlKey = true;
        if (self.supportTarget)
          self.handleShowSupprotSelection();
      break;
    }
  });

  $(document).keyup(function(e){
    delete keymap[e.keyCode];
    switch (e.keyCode) {
      case 16:
        self.shiftKey = false;
        if (self.supportTarget)
          self.handleShowSupprotSelection();
      break;
      case 17:
        self.ctrlKey = false;
        if (self.supportTarget)
          self.supportTarget.hideSupportSelection();
      break;
    }
  });

  $(document).bind("contextmenu",function(e){
    if (!self.shiftKey)
      return false;
  });

  // *****************************************************************

  var selectionMouseMove = function(e) {
    e.preventDefault();

    var w = e.clientX - self.mpos.x;
    var h = e.clientY - self.mpos.y;

    var css = {
      left: w >= 0 ? self.mpos.x : e.clientX,
      top: h >= 0 ? self.mpos.y : e.clientY,
      width: w >= 0 ? w : Math.abs(w),
      height: h >= 0 ? h : Math.abs(h)
    };

    $(self.selectionRect).css(css);
  }

  var handleMouseActions = function(e) {
    var intersects = self.getMouseIntersectionObjects(e);
    if (intersects.length > 0) {
      var target = intersects[0].object.parent;
      if (target.data.Owner.indexOf(self.context.playerData.Username) != -1) {
        if (self.supportTarget && self.ctrlKey) {
          self.dispatchEvent({
            type: "supportPlanet", 
            supportSourcesIds: self.getSelectedPlanetsIds(),
            planetToSupportId: self.getPlanetТоSupportId()
          });
        } else if (self.shiftKey && !self.ctrlKey) {
          var index = self.selectedPlanets.indexOf(target);
          if (index == -1) {
            target.select();
            self.selectedPlanets.push(target);  
          } else {
            target.deselect();
            self.selectedPlanets.splice(index, 1);
          }
        } else {
          self.deselectAll();

          target.select();
          self.selectedPlanets.push(target);  
          
        }
      } else {
        if (self.selectedPlanets.length > 0) {
          if (self.attackTarget) {
            self.dispatchEvent({
              type: "attackPlanet", 
              attackSourcesIds: self.getSelectedPlanetsIds(),
              planetToAttackId: self.getPlanetТоAttackId()
            });
          }
        }
      }
    } else {
      for (var i = 0;i < self.selectedPlanets.length;i ++)
        self.selectedPlanets[i].deselect();
      self.selectedPlanets = [];
    }
  }

  var selectionMouseUp = function(e) {
    e.preventDefault();

    var w = e.clientX - self.mpos.x;
    var h = e.clientY - self.mpos.y;
    var rect = {
      x: w >= 0 ? self.mpos.x : e.clientX,
      y: h >= 0 ? self.mpos.y : e.clientY,
      width: w >= 0 ? w : Math.abs(w),
      height: h >= 0 ? h : Math.abs(h)
    };

    if (rect.width < 4 && rect.height < 4)
      handleMouseActions(e);
    else
      self.hitTestPlanets(rect);
    self.selectionRect.remove();
    
    window.removeEventListener("mousemove", selectionMouseMove);
    window.removeEventListener("mouseup", selectionMouseUp);
  }

  this.selectionMouseDown = function(e) {
    e.preventDefault();

    self.mpos.x = e.clientX;
    self.mpos.y = e.clientY;

    $("body").append(self.selectionRect);

    var css = {
      left: self.mpos.x,
      top: self.mpos.y,
      width: e.clientX - self.mpos.x,
      height: e.clientY - self.mpos.y
    }

    $(self.selectionRect).css(css);

    window.addEventListener("mousemove", selectionMouseMove);
    window.addEventListener("mouseup", selectionMouseUp);
  }
}

module.exports.prototype = new THREE.EventDispatcher();
module.exports.prototype.getMouseIntersectionObjects = function(e) {
  var mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  var mouseY = - (e.clientY / window.innerHeight) * 2 + 1;

  var vector = new THREE.Vector3( mouseX, mouseY, 0.5 );
  this.context.projector.unprojectVector( vector, this.context.camera );

  var raycaster = new THREE.Raycaster(this.context.camera.position, vector.sub(this.context.camera.position ).normalize());
  return raycaster.intersectObjects(this.context.planetsHitObjects);
}

module.exports.prototype.hitTestPlanets = function(rect) {
  if (!this.shiftKey)
    this.selectedPlanets = [];
  for (var i=0;i < this.context.planetsHitObjects.length;i ++) {
    var target = this.context.planetsHitObjects[i].parent;
    if (target.data.Owner.indexOf(this.context.playerData.Username) != -1) {
      if (!this.shiftKey)
        target.deselect();
      if (target.rectHitTest(rect)) {
        target.select();
        if (this.selectedPlanets.indexOf(target) == -1)
          this.selectedPlanets.push(target);
      }
    }
  }

  if (this.selectedPlanets.length == 0)
    this.onPlanetMouseOut();
}

module.exports.prototype.deselectAll = function() {
  for (var i=0;i < this.selectedPlanets.length;i ++)
    this.selectedPlanets[i].deselect();
  this.selectedPlanets = [];
}

module.exports.prototype.onPlanetMouseOver = function(e) {
  if (this.selectedPlanets.length > 0) {
    if (e.target.parent.data.Owner.indexOf(this.context.playerData.Username) == -1) {
      this.attackTarget = e.target.parent;
      this.attackTarget.showAttackSelection();
    } else {
      this.supportTarget = e.target.parent;
      if (this.ctrlKey) {
        this.handleShowSupprotSelection();
      }
    }  
  }
}

module.exports.prototype.onPlanetMouseOut = function(e) {
  if (this.attackTarget) {
    this.attackTarget.hideAttackSelection();
    this.attackTarget = null;
  } else if (this.supportTarget) {
    this.supportTarget.hideSupportSelection();
    this.supportTarget = null;
  }
}

module.exports.prototype.handleShowSupprotSelection = function() {
  if (this.selectedPlanets.length == 1) {
    if (this.supportTarget.data.id != this.selectedPlanets[0].data.id) {
      this.supportTarget.showSupportSelection();  
    }
  } else {
    this.supportTarget.showSupportSelection();
  }
}

module.exports.prototype.getSelectedPlanetsIds = function() {
  var ids = [];
  for (var i = 0;i < this.selectedPlanets.length;i ++) 
    if (!this.supportTarget || this.supportTarget.data.id != this.selectedPlanets[i].data.id)
      ids.push(this.selectedPlanets[i].data.id);
  return ids;
}

module.exports.prototype.getPlanetТоAttackId = function() {
  return this.attackTarget.data.id;
}

module.exports.prototype.getPlanetТоSupportId = function() {
  return this.supportTarget.data.id;
}