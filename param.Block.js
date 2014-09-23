var Block = function(x, y, w, h, id, options) {
  this.id = id;
  this.pos = { x: x, y: y };
  this.dims = { x: w, y: h };
  this.active = options && options.active ? options.active : false;
  this.progress = 0;
};

Block.prototype.click = function(user) {
  var prog_total = 10 * this.dims.x * this.dims.y;
  var prog_current = this.dims.x * this.dims.y * this.progress / 10;
  prog_current += user.stats.atk;
  this.progress = Math.min(prog_current / prog_total * 100, 100);
}

module.exports = Block;