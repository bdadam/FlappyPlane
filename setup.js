var canvas = document.getElementById('scene');
var ctx = canvas.getContext('2d');

var bgCanvas = document.getElementById('bg');
var bgCtx = bgCanvas.getContext('2d');


var width, height;

var Game = {
    canvas: canvas,
    ctx: ctx,

    bgCanvas: bgCanvas,
    bgCtx: bgCtx,

    x: 0,
    delta: 0,

    planeColor: Math.floor(Math.random() * 4)
};

window.onresize = function() {
    Game.width = bgCanvas.width = canvas.width = width = canvas.parentNode.clientWidth;
    Game.height = bgCanvas.height = canvas.height = height = canvas.parentNode.clientHeight;
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
