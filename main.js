var height = $('body').height();
// var width = $('body').width();

var pageX;
var pageY;

var default_lch = {
  'L1': 105,
  'L2': 105,
  'C1': 203,
  'C2': 260,
  'H1': 295,
  'H2': 72
};
var lch = localStorage.lch ? JSON.parse(localStorage.lch) :
  JSON.parse(JSON.stringify(default_lch));

var cur_L1 = lch.L1;
var cur_L2 = lch.L2;
var cur_C1 = lch.C1;
var cur_C2 = lch.C2;
var cur_H1 = lch.H1;
var cur_H2 = lch.H2;

var dd = 0.02;

var setColor = function () {
  $('body').css('background', 'linear-gradient(to bottom, ' +
    chroma.lch(cur_L1, cur_C1, cur_H1).css() + ' 0, ' +
    chroma.lch(cur_L2, cur_C2, cur_H2).css() + ' 100%)');
  $('#info-1').html(parseInt(cur_L1) + ' ' + parseInt(cur_C1) + ' ' + parseInt(cur_H1));
  $('#info-2').html(parseInt(cur_L2) + ' ' + parseInt(cur_C2) + ' ' + parseInt(cur_H2));
};

var type = -1;  // -1 | 0 | 1 | 2

document.addEventListener('touchstart', function (e) {
  // e.preventDefault();

  pageX = e.touches[0].pageX;
  pageY = e.touches[0].pageY;

  var delta = e.touches[0].pageY - height / 2;
  if (Math.abs(delta) < height / 6) 
    type = 0;
   else if (delta < 0) 
    type = 1;
   else 
    type = 2;
});

document.addEventListener('touchend', function (e) {
  // e.preventDefault();

  lch.L1 = cur_L1;
  lch.L2 = cur_L2;
  lch.C1 = cur_C1;
  lch.C2 = cur_C2;
  lch.H1 = cur_H1;
  lch.H2 = cur_H2;
  localStorage.setItem('lch', JSON.stringify(lch));

  type = -1;
});

document.addEventListener('touchmove', function (e) {
  e.preventDefault();

  var deltaX = e.pageX - pageX;
  var deltaY = e.pageY - pageY;
  if (type === 0) {
    cur_C1 = Math.max(0, lch.C1 - deltaY * 8 * dd);
    cur_C2 = Math.max(0, lch.C2 - deltaY * 8 * dd);
    cur_L1 = Math.max(0, lch.L1 + deltaX * dd);
    cur_L2 = Math.max(0, lch.L2 + deltaX * dd);
  } else if (type === 1) {
    cur_C1 = Math.max(0, lch.C1 - deltaY * 8 * dd);
    cur_H1 = (lch.H1 + Math.pow(deltaX * dd, 2) + 360) % 360;
  } else if (type === 2) {
    cur_C2 = Math.max(0, lch.C2 - deltaY * 8 * dd);
    cur_H2 = (lch.H2 + Math.pow(deltaX * dd, 2) + 360) % 360;
  }

  setColor();
});

var download = function () {
  var c1 = chroma.lch(cur_L1, cur_C1, cur_H1);
  var c2 = chroma.lch(cur_L2, cur_C2, cur_H2);
  var scale = chroma.scale([c1, c2]);
  var p = new PNGlib(640, 1136, 256);
  var background = p.color(255, 255, 255);
  var r = 0;

  for (var x = 0; x < 640; x ++) {
    for (var y = 0; y < 1136; y ++) {
      r = y + Math.random() * Math.cos(y * Math.PI / 1135) * 50;
      var rgb = scale(Math.round(r / 1135 * 254) / 254).rgb();
      p.buffer[p.index(x, y)] = p.color(rgb[0], rgb[1], rgb[2]);
    }
  }

  var b64 = p.getBase64();
  window.location = 'data:image/png;base64,' + b64;
  // $('<a>', {
  //   href: 'data:image/png;base64,' + b64,
  //   target: '_blank'
  // })[0].click();

  $('#download').removeClass('loading');
  $('#download').addClass('okay');
};

$('#download').bind('touchstart', function () {
  $('#download').addClass('loading');
  window.setTimeout(download, 200);
});

$('#download').bind('click', function () {
  $('#download').addClass('loading');
  window.setTimeout(download, 200);
});

$('#reset').bind('click', function () {
  lch = JSON.parse(JSON.stringify(default_lch));
  localStorage.setItem('lch', JSON.stringify(lch));

  cur_L1 = lch.L1;
  cur_L2 = lch.L2;
  cur_C1 = lch.C1;
  cur_C2 = lch.C2;
  cur_H1 = lch.H1;
  cur_H2 = lch.H2;
  setColor();
});

setColor();
