var ctouch = new ColorTouch();

ctouch.lchChange(function (s_lch) {
    var c1 = chroma.lch(s_lch.L1, s_lch.C1, s_lch.H1);
    var c2 = chroma.lch(s_lch.L2, s_lch.C2, s_lch.H2);

    $('body').attr('class', chroma.contrast('white', c1) < 2  ? 'light' : 'dark');
    $('body').css('background', 'linear-gradient(to bottom, ' + c1.css() + ' 0, ' + c2.css() + ' 100%)');
});

$(document).bind('click', function () {
  $('#go-back')[0].click();
});

$(document).bind('touchend', function () {
  $('#go-back')[0].click();
});

ctouch.lchChange();
