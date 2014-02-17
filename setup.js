var canvas = document.getElementById('scene');
var bgCanvas = document.getElementById('bg');

var ctx = canvas.getContext('2d');
var bgctx = bgCanvas.getContext('2d');

var width, height;

window.onresize = function() {
    bgCanvas.width = canvas.width = width = canvas.parentNode.clientWidth;
    bgCanvas.height = canvas.height = height = 480; //canvas.parentNode.clientHeight;
};

window.onresize();

var raf = window.requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function addEventListener(obj, event, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(event, fn, false);
    } else if (obj.attachEvent) {
        obj.attachEvent('on' + event, fn);
    }
}
