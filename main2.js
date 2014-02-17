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

            this.images = [
                images[this.srcList[0]],
                images[this.srcList[1]],
                images[this.srcList[2]]
            ],

            this.y = Math.floor(height / 2 - this.img.height / 2);
            this.width = this.img.width;
            this.height = this.img.height;

            this.corners = [
                [74, 0],
                [this.width, 17],
                [this.width, 65],
                [67, this.height],
                [20, 65],
                [0, 18]
            ];
        },

        clear: function() {
            this.ctx.clearRect(this.x, this.y, this.width, this.height);
        },

        draw: function(x, delta) {
            var ay = 15*9.81;
            this.vy += ay * delta;
            this.y = Math.floor(this.y + this.vy * delta);

            var img = this.images[Math.floor(x/50) % 3];

            this.ctx.drawImage(img, this.x, this.y);
        },

        detectCollision: function(x) {

            if (this.y < 0 || this.y > height - this.height) {
                return true;
            }

            /*var corners = [
                [this.x - 1, this.y - 1],
                [this.x + this.width + 1, this.y - 1],
                [this.x - 1, this.y + this.height + 1],
                [this.x + this.width + 1, this.y + this.height + 1]
            ];*/

            for (var i = 0, l = this.corners.length; i < l; i++) {
                var corner = this.corners[i];
                var pixel = ctx.getImageData(corner[0], corner[1], 1, 1).data;

                if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) {
                    return true;
                }
            }

            return false;

            this.ctx.beginPath();
            this.ctx.moveTo(corners[0][0], corners[0][1]);
            this.ctx.lineTo(corners[1][0], corners[1][1]);
            this.ctx.lineTo(corners[2][0], corners[2][1]);
            this.ctx.fill();
            this.ctx.closePath();

            var validColors = [
                [234, 245, 250, 255],
                [212, 236, 246, 255],
                [207, 234, 245, 255],
                [208, 234, 245, 255]
            ];


            function intersects(x1, y1, w1, h1, x2, y2, w2, h2) {
                w2 += x2;
                w1 += x1;
                if (x2 > w1 || x1 > w2) return false;
                h2 += y2;
                h1 += y1;
                if (y2 > h1 || y1 > h2) return false;
                return true;
            }

            function ptInTriangle(p, p0, p1, p2) {
                var A = 1/2 * (-p1[1] * p2[0] + p0[1] * (-p1[0] + p2[0]) + p0[0] * (p1[1] - p2[1]) + p1[0] * p2[1]);
                var sign = A < 0 ? -1 : 1;
                var s = (p0[1] * p2[0] - p0[0] * p2[1] + (p2[1] - p0[1]) * p[0] + (p0[0] - p2[0]) * p[1]) * sign;
                var t = (p0[0] * p1[1] - p0[1] * p1[0] + (p0[1] - p1[1]) * p[0] + (p1[0] - p0[0]) * p[1]) * sign;

                return s > 0 && t > 0 && (s + t) < 2 * A * sign;
            }

            for (var i = 0, l = Rock.activeRocks.length; i < l; i++) {
                var rock = Rock.activeRocks[i];

                if (rock[0]-x)

                for (var j = 0; j < corners.length; j++) {
                    var coll = ptInTriangle(corners[j], [rock[0]-x, height], [rock[0]-x + rock[1].width/2 + 15, height - rock[2]], [rock[0]-x + rock[1].width, height]);
                    if (coll) {
                        return true;
                    }
                }

                /*if (intersects(this.x, this.y, this.width, this.height,
                           rock[0] + 15 + rock[1].width / 2 - rock[1].width/8 - x, height - rock[2], rock[1].width / 4, rock[2])) {
                    return true;
                }*/
            }

            /*
            for (var i = 0, l = RockDown.activeRocks.length; i < l; i++) {
                var rock = RockDown.activeRocks[i];

                if (intersects(this.x, this.y, this.width, this.height,
                    rock[0] + 15 + rock[1].width / 2 - rock[1].width/8 - x, 0, rock[1].width / 4, rock[2])) {
                    return true;
                }
            }*/
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
            this.height = images[this.srcList[0]].height;
            this.ctx = ctx;
        },

        clear: function() {
            this.ctx.clearRect(0, height - this.height, this.width, this.height);
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
                //this.ctx.drawImage(this.img, i * this.img.width - (x % this.img.width), height - this.img.height);
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
        //Background.init(bgctx);
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

        var frameCount = 0;

        raf(function draw() {
            if (ended) {
                return;
            }

            raf(draw);

            now = +new Date();
            delta = (lastNow - now) / 1000;
            x = Math.floor((now - startTime) / 1000 * vx);

            //Plane.clear();
            //Ground.clear();

            ctx.clearRect(0, 0, width, height);
            //Background.draw(x);
            Rock.draw(x);
            RockDown.draw(x);
            Ground.draw(x);
            Plane.draw(x, delta);


            if (frameCount % 2 === 0) {
                ended = Plane.detectCollision(x);
            }

            lastNow = now;
            frameCount++;

            canvas.style.backgroundPosition = (-x * 0.65) + 'px bottom';
        });
    });
}());