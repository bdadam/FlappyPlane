(function() {
    var images = {};
    var imagesToLoad = 0;

    var Plane = {
        baseUrl: 'TappyPlane/PNG/Planes/',
        srcList: [
            'planeBlue1.png',
            'planeBlue2.png',
            'planeBlue3.png',
            'planeGreen1.png',
            'planeGreen2.png',
            'planeGreen3.png',
            'planeYellow1.png',
            'planeYellow2.png',
            'planeYellow3.png',
            'planeRed1.png',
            'planeRed2.png',
            'planeRed3.png'
        ],

        x: 50,
        y: 0,
        vy: 0,

        init: function(ctx) {
            this.ctx = ctx;
            this.img = images[this.srcList[Math.floor(Math.random() * this.srcList.length)]];
            this.y = Math.floor(height / 2 - this.img.height / 2);
            this.width = this.img.width;
            this.height = this.img.height;
        },

        draw: function(x, delta) {
            var ay = 15*9.81;
            this.vy += ay * delta;
            this.y = Math.floor(this.y + this.vy * delta);
            this.ctx.drawImage(this.img, this.x, this.y);
        },

        detectCollision: function() {

            if (this.y < 0 || this.y > height - this.height) {
                return true;
            }

            var corners = [
                [this.x, this.y],
                [this.x + this.width, this.y],
                [this.x, this.y + this.height],
                [this.x + this.width, this.y + this.height]
            ];

            var validColors = [
                [234, 245, 250, 255],
                [212, 236, 246, 255],
                [207, 234, 245, 255],
                [208, 234, 245, 255]
            ];


            for (var i = 0; i < 4; i++) {
                var p = corners[i];
                var d = this.ctx.getImageData(p[0], p[1], 1, 1);
                var ok = false;
                window.d = window.d || [];
                window.d.push(d.data);


                /*
                var pixel = d.data;

                for (var i = 0, l = validColors.length; i < l; i++) {
                    var color = validColors[i];
                    if (Math.abs(color[0] - pixel[0]) < 5 && Math.abs(color[1] - pixel[1]) < 5 && Math.abs(color[2] - pixel[2]) < 5) {
                        ok = true;
                        break;
                    }
                }

                if (!ok) {
                    return true;
                }*/
            }
        }
    };

    addEventListener(document, 'click', function() {
        Plane.vy += 100;
    });

    var Ground = {
        baseUrl: 'TappyPlane/PNG/',
        srcList: [
            'groundDirt.png',
            'groundGrass.png',
            'groundIce.png',
            'groundRock.png',
            'groundSnow.png'
        ],
        lastX: 0,

        visibleGrounds: [],

        width: 0,

        init: function(ctx) {
            this.width = images[this.srcList[0]].width;
            this.ctx = ctx;
        },

        draw: function(x) {
            var n = Math.ceil(width / this.width) + 1;

            if (Math.floor(x / this.width) !== Math.floor(this.lastX / this.width)) {
                this.visibleGrounds.shift();
            }

            for (var i = 0; i < n; i++) {
                if (!this.visibleGrounds[i]) {
                    this.visibleGrounds[i] = images[this.srcList[Math.floor(Math.random() * this.srcList.length)]];
                }

                var img = this.visibleGrounds[i];
                this.ctx.drawImage(img, i * img.width - (x % img.width), height - img.height);
            }

            this.lastX = x;
        }
    };

    var Background = {
        baseUrl: 'TappyPlane/PNG/',
        srcList: [
            'background.png'
        ],
        img: null,

        init: function(ctx) {
            this.img = images[this.srcList[0]];
            this.ctx = ctx;
        },

        draw: function(x) {
            x *= 0.65;

            var n = Math.ceil(width / this.img.width) + 1;

            for (var i = 0; i < n; i++) {
                this.ctx.drawImage(this.img, i * this.img.width - (x % this.img.width), height - this.img.height);
            }
        }
    };

    var Rock = {
        baseUrl: 'TappyPlane/PNG/',
        srcList: [
            'rock.png',
            'rockGrass.png',
            'rockIce.png',
            'rockSnow.png'
        ],

        lastRockDrawn: 0,
        activeRocks: [],

        init: function(ctx) {
            this.ctx = ctx;
        },

        draw: function(x) {
            if (x - this.lastRockDrawn > 450) {
                var img = images[this.srcList[Math.floor(Math.random() * this.srcList.length)]];
                var rx = x + width + Math.floor(Math.random() * 320);
                var h = img.height - Math.floor((Math.random() * 120));
                this.activeRocks.push([rx, img, h]);
                this.lastRockDrawn = x;
            }

            for (var i = 0, l = this.activeRocks.length; i < l; i++) {
                var rock = this.activeRocks[i];
                this.ctx.drawImage(rock[1], rock[0] - x, height - rock[2]);
            }
        }
    };

    var RockDown = {
        baseUrl: 'TappyPlane/PNG/',
        srcList: [
            'rockDown.png',
            'rockGrassDown.png',
            'rockIceDown.png',
            'rockSnowDown.png'
        ],

        lastRockDrawn: 0,
        activeRocks: [],

        init: function(ctx) {
            this.ctx = ctx;
        },

        draw: function(x) {
            if (x - this.lastRockDrawn > 650) {
                var img = images[this.srcList[Math.floor(Math.random() * this.srcList.length)]];
                var rx = x + width + Math.floor(Math.random() * 320);
                var h = 0 - Math.floor((Math.random() * 320));
                this.activeRocks.push([rx, img, h]);
                this.lastRockDrawn = x;
            }

            for (var i = 0, l = this.activeRocks.length; i < l; i++) {
                var rock = this.activeRocks[i];
                this.ctx.drawImage(rock[1], rock[0] - x, rock[2]);
            }
        }
    };

    function loadImages(callback) {
        var objects = [Plane, Ground, Background, Rock, RockDown];
        for (var i = 0, l = objects.length; i < l; i++) {
            var obj = objects[i];

            for (var j = 0, jl = obj.srcList.length; j < jl; j++) {
                var src = obj.srcList[j];
                images[src] = new Image();
                images[src].onload = function() {
                    imagesToLoad -= 1;

                    if (imagesToLoad === 0) {
                        callback();
                    }
                };
                images[src].onerror = function() {
                    // error
                };

                imagesToLoad += 1;
                images[src].src = obj.baseUrl + src;
            }
        }
    }

    loadImages(function() {

        Background.init(ctx);
        Rock.init(ctx);
        RockDown.init(ctx);
        Ground.init(ctx);
        Plane.init(ctx);

        var startTime = +new Date();
        var now = startTime;
        var lastNow = now;
        var vx = 350;
        var x = 0;
        var delta = 0;
        var ended = false;

        raf(function draw() {
            if (ended) {
                return;
            }

            raf(draw);

            now = +new Date();
            delta = (lastNow - now) / 1000;
            x = Math.floor((now - startTime) / 1000 * vx);

            //ctx.clearRect(0, 0, width, height);
            Background.draw(x);
            Rock.draw(x);
            RockDown.draw(x);
            Ground.draw(x);
            Plane.draw(x, delta);

            ended = Plane.detectCollision();

            lastNow = now;
        });
    });
}());