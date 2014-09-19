var Block = function(x, y, w, h, options) {
  this.id = 0;
  this.pos = { x: x, y: y };
  this.dims = { x: w, y: h };
  this.active = options && options.active ? options.active : false;
  this.progress = 0;
};

Block.prototype.click = function() {
  
}

module.exports = Block;