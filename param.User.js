var Block = require('./param.Block.js');

var User = function() {
  this.stats = {
    lvl: 0,
    exp: 0,
    exp_max: 100,
    exp_min: 0,
    gol: 0,
    lif: 5,
    lif_max: 5,
    act: 15,
    act_max: 15,
    atk: 1,
    def: 1,
    rcv: 1,
    rcv_max: 1,
    key: 0,
    prm: 0
  };
  this.board = {
    blocks: []
  }
};

User.prototype.addBlock = function(x, y, w, h, io, options) {
  var id = this.board.blocks.length;
  if (options)
    this.board.blocks.push(new Block(x, y, w, h, id, options));
  else
    this.board.blocks.push(new Block(x, y, w, h, id));
  io.emit('add-block', this.board.blocks[this.board.blocks.length - 1]);
}

module.exports = User;