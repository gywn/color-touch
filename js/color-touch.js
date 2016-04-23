/*
 *  Data Structure:
 *  ---------------
 *
 *    lch: {L1: _, C1: _, H1: _, L2: _, C2: _, H2: _}
 *
 *  Public Methods:
 *  ---------------
 *
 *    .lchChange([callback])
 *        callback: function (lch) {...}
 *
 *    .loadSetting(lch)
 *
 *    .touchEnd(pageX, pageY)
 *
 *    .touchMove(pageX, pageY)
 *
 *    .touchStart(pageX, pageY)
 *
 *    .getPNGBase64(depth)
 *
 */
var ColorTouch = function () {
  var deviceHeight = window.screen.height * window.devicePixelRatio;
  var deviceWidth = window.screen.width * window.devicePixelRatio;
  var bodyHeight = document.body.offsetHeight;
  var bodyWidth = document.body.offsetWidth;

  console.log('Device Height: ', deviceHeight);
  console.log('Device Width: ', deviceWidth);

  var lch;

  var dd = 0.05;  // move speed coefficient

  var randH = Math.random() * 360;
  var default_lch = {
    'L1': 85,
    'L2': 85,
    'C1': 20,
    'C2': 30,
    'H1': randH,
    'H2': (randH + (Math.random() > 0.5 ? 1 : -1) * 30 + 360) % 360
  };

  this.loadSetting = function (s_lch) {
    if (typeof(s_lch) === 'string') {
      lch = JSON.parse(s_lch);
    } else if (typeof(s_lch) === 'object' && s_lch !== null) {
      lch = JSON.parse(JSON.stringify(s_lch));
    } else {
      lch = null;
    }
    if (!lch) lch = JSON.parse(JSON.stringify(default_lch));

    storeSetting();
    fireLCHChange(lch);
  };

  var storeSetting = function () {
    localStorage.setItem('lch', JSON.stringify(lch));
  };

  var lchChangeHandlers = [];

  var fireLCHChange = function (s_lch) {
    lchChangeHandlers.forEach(function (cb) {cb(s_lch);});
  };

  // customized event
  this.lchChange = function (cb) {
    if (typeof(cb) === 'undefined')
      fireLCHChange(lch);
    else
      lchChangeHandlers.push(cb);
  };

  var pageX;      // only filled during touchmove
  var pageY;      // only filled during touchmove
  var cur_lch;    // only filled during touchmove
  var type = -1;  // during touchmove: 0 | 1 | 2

  this.touchStart = function (s_pageX, s_pageY) {
    pageX = s_pageX;
    pageY = s_pageY;

    var delta = s_pageY - bodyHeight / 2;
    if (Math.abs(delta) < bodyHeight / 6) 
      type = 0;
    else if (delta < 0) 
      type = 1;
    else 
      type = 2;

    cur_lch = JSON.parse(JSON.stringify(lch));
  };

  this.touchMove = function (s_pageX, s_pageY) {
    var deltaX = s_pageX - pageX;
    var deltaY = s_pageY - pageY;

    switch (type) {
      case 0:
	cur_lch.L1 = Math.max(0, lch.L1 - deltaY * dd);
	cur_lch.L2 = Math.max(0, lch.L2 - deltaY * dd);
	break;
      case 1:
	cur_lch.C1 = Math.max(0, lch.C1 - deltaY * 4 * dd);
	cur_lch.H1 = (lch.H1 + deltaX * 8 * dd + 360) % 360;
	break;
      case 2:
	cur_lch.C2 = Math.max(0, lch.C2 + deltaY * 4 * dd);
	cur_lch.H2 = (lch.H2 + deltaX * 8 * dd + 360) % 360;
	break;
      default:
	return;
    }

    fireLCHChange(cur_lch);
  };

  this.touchEnd = function () {
    lch = JSON.parse(JSON.stringify(cur_lch));
    storeSetting();
    pageX = null;
    pageY = null;
    cur_lch = null;
    type = -1;
  };

  this.getPNGBase64 = function (depth) {
    var n = depth - 1;
    var c1 = chroma.lch(lch.L1, lch.C1, lch.H1);
    var c2 = chroma.lch(lch.L2, lch.C2, lch.H2);
    var scale = chroma.scale([c1, c2]).mode('lab');

    var dither = function (r) {  // dither in to (n + 1) colors for r in [0, 1]
      var c0 = Math.floor(n * r) / n; 
      var cf = Math.random() > (r - c0) * n ? c0 : c0 + 1 / n;
      var rgb = scale(cf).rgb();
      return p.color(rgb[0], rgb[1], rgb[2]);
    };

    var p = new PNGlib(deviceWidth, deviceHeight, depth);

    for (var x = 0; x < deviceWidth; x ++) {
      for (var y = 0; y < deviceHeight; y ++) {
	p.buffer[p.index(x, y)] = dither(y / (deviceHeight - 1)); 
      }
    }

    return p.getBase64();
  };

  this.loadSetting(localStorage.lch);
};
