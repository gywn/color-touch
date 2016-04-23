var delay = function (cb, timeout) {
  window.setTimeout(cb, timeout ? timeout : 200);
};

var ctouch = new ColorTouch();

document.addEventListener('touchstart', function (e) {
  ctouch.touchStart(e.pageX, e.pageY);
});

document.addEventListener('touchend', function (e) {
  ctouch.touchEnd();
});

document.addEventListener('touchmove', function (e) {
  e.preventDefault();
  var t = e.touches[0];
  ctouch.touchMove(t.pageX, t.pageY);
});

document.addEventListener('mousedown', function (e) {
  ctouch.touchStart(e.pageX, e.pageY);
});

document.addEventListener('mouseup', function (e) {
  ctouch.touchEnd();
});

document.addEventListener('mousemove', function (e) {
  ctouch.touchMove(e.pageX, e.pageY);
});

ctouch.lchChange(function (s_lch) {
    var c1 = chroma.lch(s_lch.L1, s_lch.C1, s_lch.H1);
    var c2 = chroma.lch(s_lch.L2, s_lch.C2, s_lch.H2);

    $('body').attr('class', chroma.contrast('white', c1) < 2  ? 'light' : 'dark');
    $('body').css('background', 'linear-gradient(to bottom, ' + c1.css() + ' 0, ' + c2.css() + ' 100%)');
});

var download = function () {
  var b64 = ctouch.getPNGBase64(16);

  $('#download').attr('class', 'okay');
  delay(function () {
    $('#download').attr('class', 'download');
  }, 2000);

  $('<a>', {
    href: 'data:image/png;base64,' + b64,
    download: 'wallpaper.png'
  })[0].click();
};

$('#download').bind('click', function () {
  if ($(this).hasClass('download')) {
    $(this).attr('class', 'loading');
    delay(download);
  }
  return false;
});

$('#reset').bind('click', function () {
  ctouch.loadSetting();
  return false;
});

ctouch.lchChange();
