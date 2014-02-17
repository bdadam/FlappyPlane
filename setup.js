var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var width, height;

window.onresize = function() {
    canvas.width = width = canvas.parentNode.clientWidth;
    canvas.height = height = 480; //canvas.parentNode.clientHeight;
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
