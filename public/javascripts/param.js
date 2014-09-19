(function($){
  $.fn.disableSelection = function() {
    return this
     .attr('unselectable', 'on')
     .css('user-select', 'none')
     .on('selectstart', false);
  };
})(jQuery);


var user = {
  stats: {},
  lastStatsFetch: Date.now()
};

var board = {
  blocks: [],
  block_count: 0,
  addBlock: function(data) {
    $('#board').append('<div id="block_' + data.id + '" class="block inactive" style="left: ' + (data.pos.x * 40) + 'px; top: ' + (data.pos.y * 40) + 'px; width: ' + (data.dims.x * 36 + Math.max(0, data.dims.x - 1) * 4) + 'px; height: ' + (data.dims.y * 36 + Math.max(0, data.dims.y - 1) * 4) + 'px;"><div class="progress"></div><div class="label"><div class="value">0</div><div class="percent">%</div></div><div class="value">0</div><div class="width">' + data.dims.x + '</div><div class="height">' + data.dims.y + '</div></div>');
    if (data.active)
      board.enableBlock(data.id);
  },
  enableBlock: function(id) {
    console.log('enabling ' + id);
    var fadeInTime = 500;
    $('#block_' + id).animate({
      borderColor: '#888',
      backgroundColor: '#222'
    },
    fadeInTime,
    'easeOutCirc'
    );
    $('#block_' + id).find('> .label').animate({
      opacity: '1.0'
    },
    fadeInTime,
    'easeOutQuint',
    function() {
      $('#block_' + id).removeClass('inactive');
    });
  }
};

var socket = io.connect();
socket.emit('ready');

socket.on('stats', function(data) {
  stats = data;
  console.log(stats);
});

socket.on('add-block', function(data) {
  board.addBlock(data);
  console.log(data);
});





/*
var rcv_interval;
var rcv_timeout;

var stats = {
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

var board = {
  blocks: [],
  block_count: 0
};

var state = {};

function highlight(id, bright, dim) {
  var bright_ = bright ? bright : '#fff';
  var dim_ = dim ? dim : '#bbb';
  $(id).stop().animate({
    //textShadow: '#fff 4px 4px 10px',
    color: bright_
  },
  50,
  'easeInQuint').animate({
    //textShadow: '#000 0 0 0',
    color: dim_
  },
  500,
  'easeInCubic');
}

function set_exp_range() {
  var diffs = [     100, 150, 250, 300,  450,  750, 1000, 1500 ];
  var mins =  [  0, 100, 250, 500, 800, 1250, 2000, 3000, 4500 ];
  var acts =  [  0,   5,   5,   5,   5,    5,    5,    5,    5 ];
  stats.exp_min = mins[stats.lvl];
  stats.exp_max = mins[stats.lvl + 1];
  var act_max_prev = stats.act_max;
  stats.act_max += acts[stats.lvl];
  $('#act > .value > .value-actual > .maximum').countTo({
    from: act_max_prev,
    to: stats.act_max,
    speed: 100,
    refreshInterval: 5
  });
  highlight('#act > .value > .value-actual > .maximum');
  if (stats.lvl >= 1 && !state.shown_prm)
    show_prm();
}

function give_key(keys) {
  var prev = stats.key;
  stats.key += keys;
  highlight('#key > .value > .value-actual');
  if (!state.shown_key) {
      state.shown_key = true;
      show_key();
    }
  $('#key > .value > .value-actual').countTo({
    from: prev,
    to: stats.key,
    speed: 750,
    refreshInterval: 50
  });
}

function give_exp(exp) {
  console.log("EXP +" + exp);
  var prev = stats.exp;
  stats.exp += exp;
  var prevLevel = stats.lvl;
  var overrun = false;
  while (stats.exp >= stats.exp_max) {
    stats.lvl++;
    set_exp_range();
    overrun = true;
  }
  var cur = (stats.exp - stats.exp_min) / (stats.exp_max - stats.exp_min) * 100;
  $('#exp > .value > .value-actual').countTo({
    from: prev,
    to: stats.exp,
    speed: 750,
    refreshInterval: 50
  });
  
  highlight('#exp > .value > .value-actual');
  
  if (overrun) {
    highlight('#lvl > .value > .value-actual');
    $('#lvl > .value > .value-actual').text(stats.lvl);
    $('#exp > .bar-container > .bar').stop().animate({
      width: 0
    },
    200,
    'easeOutQuint'
    ).animate({
      width: cur.toString() + '%'
    },
    750,
    'easeOutQuint'
    );
  }
  else
    $('#exp > .bar-container > .bar').stop().animate({
      width: cur.toString() + '%'
    },
    750,
    'easeOutQuint'
    );
}

function give_gol(gold) {
  var prev = stats.gol;
  stats.gol += gold;
  $('#gol > .value > .value-actual').countTo({
    from: prev,
    to: stats.gol,
    speed: 750,
    refreshInterval: 50
  });
  
  highlight('#gol > .value > .value-actual');
}

function give_act(act) {
  var prev = stats.act;
  var prev_max = stats.act_max;
  stats.act = Math.min(Math.max(stats.act + act, 0), stats.act_max);
  
  $('#act > .value > .value-actual > .current').countTo({
    from: prev,
    to: stats.act,
    speed: 50,
    refreshInterval: 50
  });
  
  $('#act > .value > .value-actual > .maximum').countTo({
    from: prev_max,
    to: stats.act_max,
    speed: 25,
    refreshInterval: 5
  });
  
  
  if (prev > stats.act)
    highlight('#act > .value > .value-actual > .current');
  if (prev_max != stats.act_max)
    highlight('#act > .value > .value-actual > .current');
  
  if (act < 0) {
    clearInterval(rcv_interval);
    clearTimeout(rcv_timeout);
    rcv_timeout = setTimeout(function() {
      rcv_interval = setInterval(function() {
        give_act(1);
      }, 500 / stats.rcv);
    },
    1000);
  }
  
  $('#act > .bar-container > .bar').stop().animate({
    width: (stats.act / stats.act_max * 100).toString() + '%'
  },
  750,
  'easeOutQuint'
  );
}

function give_rcv(rcv) {
  var prev = stats.rcv;
  stats.rcv += rcv;
  $('#rcv > .value > .value-actual').countTo({
    from: prev,
    to: stats.rcv,
    speed: 250,
    refreshInterval: 5
  });
  highlight('#rcv > .value > .value-actual');
}

function show_exp_gold() {
  state.shown_exp_gold = true;
  $('#hud').animate({
    opacity: 1,
    height: '2em'
  },
  1000,
  'easeOutQuint',
  function() {
  });
}

function show_key() {
  $('#key').animate({
    opacity: 1
  },
  250,
  'easeOutQuint');
  state.shown_key = true;
}

function show_act() {
  $('#hud').animate({
    height: '4em'
  },
  250,
  'easeOutQuint');
  $('#act').animate({
    opacity: 1
  },
  250,
  'easeOutQuint');
  state.shown_act = true;
}

function show_rcv() {
  $('#hud-left-right').animate({
      width: '40ch'
    },
    250,
  'easeOutQuint');
  $('#rcv').animate({
    opacity: 1
  },
  250,
  'easeOutQuint');
  state.shown_rcv = true;
}

function show_prm() {
  console.log('hey hi');
  $('#prm').animate({
    opacity: 1
  },
  250,
  'easeOutQuint');
  state.shown_prm = true;
}

function block_make(x, y, w, h, prop) {
  var id = board.block_count;
  board.block_count++;
  $('#board').append('<div id="block_' + id.toString() + '" class="block inactive" style="left: ' + (x * 40) + 'px; top: ' + (y * 40) + 'px; width: ' + (w * 36 + Math.max(0, w - 1) * 4) + 'px; height: ' + (h * 36 + Math.max(0, h - 1) * 4) + 'px;"><div class="progress"></div><div class="label"><div class="value">0</div><div class="percent">%</div></div><div class="value">0</div><div class="width">' + w + '</div><div class="height">' + h + '</div></div>');
  if (prop.active)
    block_enable(id);
}

function block_enable(id) {
  console.log('enabling ' + id);
  var fadeInTime = 500;
  $('#block_' + id).animate({
    borderColor: '#888',
    backgroundColor: '#222'
  },
  fadeInTime,
  'easeOutCirc'
  );
  $('#block_' + id).find('> .label').animate({
    opacity: '1.0'
  },
  fadeInTime,
  'easeOutQuint',
  function() {
    $('#block_' + id).removeClass('inactive');
  });
}


$( document ).ready(function() {

  $('*').disableSelection();
  
  // fade in the first block
  block_make(0, 0, 1, 1, {active: true});
  block_make(0, 1, 2, 1, {active: true});
  block_make(0, 2, 2, 1, {active: true});
  block_make(1, 0, 3, 1, {active: true});
  block_make(2, 1, 2, 2, {active: true});
  block_make(4, 0, 1, 5, {active: true});
  block_make(0, 3, 4, 4, {active: true});
  //block_enable('#block_0');
  
  $('#upgrade-rcv').click(function() {
    give_rcv(1);
  });
  
  // click handle for all blocks
  $('.block').click(function() {
    var w = parseInt($(this).find('.width').text(), 10);
    var h = parseInt($(this).find('.height').text(), 10);
    if ($(this).hasClass('inactive') || stats.act < w * h)
      return;
    var cur = parseInt($(this).find('> .value').text(), 10);
    var prev = cur;
    if (!state.shown_exp_gold) {
      show_exp_gold();
    }
    if (!state.shown_act) {
      show_act();
    }
    if (!state.shown_rcv) {
      show_rcv();
    }
    
    
    var prog_total = 10 * w * h;
    var prog_current = w * h * cur / 10;
    var hit = 2;
    prog_current += hit;
    cur = Math.min(prog_current / prog_total * 100, 100);
    
    var lvl_prev = stats.lvl;
    
    if (prev != 100)
      give_exp(hit / w * 11);
    
    give_gol(hit * w * Math.sqrt(h));
    
    if (state.shown_act)
      give_act(-(w * h));
    
    if (stats.lvl > lvl_prev)
      give_act(stats.act_max);
    
    if (cur == 100)
      $(this).find('> .label > .percent').animate({
        color: '#777'
      },
      200,
      'easeOutQuint'
      );
      $(this).stop().animate({
        borderColor: '#a9a9a9'
      },
      200,
      'easeOutQuint'
      );
    if (prev == 100)
      return;
    
    
    highlight($(this).find('> .label > .value'), '#fff', $(this).find('> .value').text() == '100' ? '#ddd' : '#bbb');
    
    
    $(this).find('> .value').text(cur);
    $(this).find('> .label > .value').countTo({
      from: prev,
      to: cur,
      speed: 250,
      refreshInterval: 50
    });
    $(this).find('.progress').stop().animate({
      width: cur.toString() + '%'
    },
    250,
    'easeOutQuint',
    function() {
      if ($(this).parent().find('> .value').text() == '100') {
        $(this).animate({
          backgroundColor: '#333'
        },
        250,
        'easeOutQuint',
        function() {
        });
      }
    });
  });
  
  // hover handle for all blocks
  $('.block').hover(function() {
    if ($(this).hasClass('inactive'))
      return;
    $(this).stop().animate({
      borderColor: $(this).find('> .value').text() == '100' ? '#a9a9a9' : '#fff'
    },
    100,
    'easeOutQuint'
    );
  },
  function() {
    if ($(this).hasClass('inactive'))
      return;
    $(this).stop().animate({
      borderColor: $(this).find('> .value').text() == '100' ? '#606060' : '#888'
    },
    100,
    'easeOutQuint'
    );
  });
});
*/