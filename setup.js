var canvas = document.getElementById('scene');
var ctx = canvas.getContext('2d');

var bgCanvas = document.getElementById('bg');
var bgCtx = bgCanvas.getContext('2d');


(function() {
    var now = (window.performance && window.performance.now)
        ? function() { return window.performance.now(); }
        : function() { Date.now(); };

    var lastPing, started;

    var scoreDiv = document.getElementById('score');

    window.Game = {
        ctx: ctx,
        bgCtx: bgCtx,
        vx: 350,
        running: false,
        frameCount: 0,

        start: function() {
            started = lastPing = now();
            this.elapsed = 0;
            this.delta = 0;
            this.x = 0;
            this.running = true;
        },

        end: function() {
            this.running = false;
        },

        ping: function() {
            var n = now();

            this.delta = (n - lastPing) / 1000;
            this.elapsed = (n - started) / 1000;
            this.x = this.elapsed * this.vx | 0;

            lastPing = n;
            this.frameCount++;
        },

        updateScore: function() {
            scoreDiv.innerHTML = this.x;
        }
    };
}());

window.onresize = function() {
    Game.width = bgCanvas.width = canvas.width = canvas.parentNode.clientWidth;
    Game.height = bgCanvas.height = canvas.height = canvas.parentNode.clientHeight;
};

window.onresize();

window.raf = window.requestAnimFrame = (function(){
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.Helper = {
    calcHeights: function(img) {
        var q = [];
        var c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;

        var ctx = c.getContext('2d');

        ctx.drawImage(img, 0, 0);

        var d = ctx.getImageData(0, 0, img.width, img.height);
        var data = d.data;
        var w = d.width;
        var h = d.height;

        for (var x = 0; x < w; x++) {
            q[x] = h;
            for (var y = 0; y < h; y++) {
                var s = data[y * w * 4 + x * 4 + 3];

                if (s === 0) {
                    q[x] = h - y;
                }
            }
        }

        return q;
    }
};