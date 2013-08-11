var Ship = require("../../space-objects/ships/Ship");

module.exports = function(context){
	this.context = context;
	this.cache = [];
}

module.exports.prototype.build = function(total, color, formationPosition) {
	var ship = this.cache.length > 0 ? this.cache.shift() : new Ship(this.context);
	ship.prepare(total);
	
	ship.material.color = color;
	ship.material.ambient = color;
	ship.formation = formationPosition;

	this.context.container.add(ship);
	this.context.objects.push(ship);
	this.context.interactiveObjects.push(ship);

	return ship;
}

module.exports.prototype.destroy = function(ship) {
	this.context.container.remove(ship);
	this.context.objects.splice(this.context.objects.indexOf(ship), 1);
	this.context.interactiveObjects.splice(this.context.interactiveObjects.indexOf(ship), 1);

	this.cache.push(ship);

	return ship;
}