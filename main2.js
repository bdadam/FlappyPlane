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

            this.images = [
                images[this.srcList[Game.planeColor * 3 + 0]],
                images[this.srcList[Game.planeColor * 3 + 1]],
                images[this.srcList[Game.planeColor * 3 + 2]]
            ],

            this.width = this.images[0].width;
            this.height = this.images[0].height;

            this.y = Math.floor(height / 2 - this.height / 2);

            this.corners = [
                [73, 0],
                [this.width - 2, 17],
                [this.width - 2, 64],
                [64, this.height-1],
                [22, 64],
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

            var img = this.images[Math.floor(Game.x/50) % 3];

            this.ctx.drawImage(img, this.x, this.y);
        },

        detectCollision: function(x, delta) {
            if (this.y < 0 || this.y > height - this.height) {
                return true;
            }

            var data = this.ctx.getImageData(this.x, this.y, this.width, this.height);

            for (var i = 0, l = this.corners.length; i < l; i++) {
                var corner = this.corners[i];
                var k = corner[1] * data.width * 4 + corner[0] * 4;

                var pixel = [
                    data.data[k],
                    data.data[k + 1],
                    data.data[k + 2],
                    data.data[k + 3]
                ];

                if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) {
                    return true;
                }
            }


            return;
            //var cornersToCheck =[];

            // ground
            if (this.y + this.height >= height - Ground.height) {
                for (var i = 0, l = this.corners.length; i < l; i++) {
                    var corner = this.corners[i];
                    if (this.y + corner[1] <= height - Ground.height) {
                        continue;
                    }

                    var pixel = this.ctx.getImageData(this.x + corner[0], this.y + corner[1], 1, 1).data;

                    if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) {
                        return true;
                    }
                }
            }

            return false;

//            if (this.y + this.height < height - Ground.height) {
//                return;
//            }

            for (var i = 0, l = this.corners.length; i < l; i++) {
                var corner = this.corners[i];
                var pixel = ctx.getImageData(this.x + corner[0], this.y + corner[1], 1, 1).data;

                if (pixel[0] !== 0 || pixel[1] !== 0 || pixel[2] !== 0 || pixel[3] !== 0) {
                    return true;
                }
            }

            return false;
        }
    };

    addEventListener(document, 'click', function() {
        Plane.vy += 100;
    });

    var Background = {
        baseUrl: 'TappyPlane/PNG/',
        srcList: [
            'background.png'
        ],

        init: function(ctx) {
            this.img = images[this.srcList[0]];
            this.ctx = ctx;
            this.x = 0;
            this.n = Math.ceil(Game.width / this.img.width) + 1;
            this.vx = 90;

            this.width = this.img.width;
            this.height = this.img.height;

            this.xWhenLastDrawn = Number.MIN_VALUE;
        },

        draw: function() {
            this.x = Math.floor(this.x - Game.delta * this.vx) % this.width;

            if (Math.abs(this.x -this.xWhenLastDrawn) >= this.vx / 30 | 0) {
                // we don't need to draw the background in every frame - 180px/s / 30fps = 6px
                this.ctx.save();
                this.ctx.translate(this.x, 0);

                for (var i = 0; i < this.n; i++) {
                    this.ctx.drawImage(this.img, 0, 0, this.width, this.height, i * this.width, 0, this.width, this.height);
                }

                this.ctx.restore();

                this.xWhenLastDrawn = this.x;
            }
        }
    };

    var Ground = {
        baseUrl: 'TappyPlane/PNG/',
        srcList: [
            'groundGrass.png',
            'groundDirt.png',
            'groundRock.png',
            'groundSnow.png',
            'groundIce.png'
        ],

        init: function(ctx) {
            this.width = images[this.srcList[0]].width;
            this.height = images[this.srcList[0]].height;
            this.ctx = ctx;
            this.n = Math.ceil(Game.width / this.width) + 1;
            this.x = 0;
            this.top = Game.height - this.height;
        },

        clear: function() {
            this.ctx.clearRect(0, height - this.height, width, this.height);
        },

        draw: function() {
            this.x = Math.floor(this.x - Game.delta * Game.vx) % this.width;

            this.ctx.save();
            //this.ctx.translate(this.x, 0);
            this.ctx.translate(-Game.x % this.width, 0);

            for (var i = 0; i < this.n; i++) {
                var q = (Math.floor((Game.x + i * this.width) / this.width)) % this.srcList.length;
                q = Math.max(q, 0);

                var img = images[this.srcList[q]];
                this.ctx.drawImage(img, i * this.width, this.top);
            }

            this.ctx.restore();
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

        clear: function() {
            for (var i = 0, l = this.activeRocks.length; i < l; i++) {
                var rock = this.activeRocks[i];

                this.ctx.clearRect(rock[0] - x, height - rock[2], rock[1].width, rock[1].height);
            }
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
        var objects = [Background, Ground];//, Plane, Rock, RockDown];

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

    function start() {
        Background.init(Game.bgCtx);

//        Rock.init(Game.ctx);
//        RockDown.init(Game.ctx);
        Ground.init(Game.ctx);
//        Plane.init(Game.ctx);

        var startTime = window.performance.now(); //Date.now();
        var now = startTime;
        var lastNow = now;
        var vx = 350;
        var x = 0;
        var delta = 0;
        var ended = false;

        Game.vx = vx;

        raf(function draw() {
            if (ended) {
                return;
            }

            now = window.performance.now(); //Date.now();
            Game.delta = delta = (now - lastNow) / 1000;

            //Game.x = x = Math.floor((now - startTime) / 1000 * vx);
            Game.x = x = Math.floor(Game.x + delta * Game.vx);

//            Game.ctx.clearRect(0, 0, width, height);


            Background.draw();


//            Rock.clear();


//            Plane.clear();
            Ground.clear();


//            Rock.draw(x);
//            RockDown.draw(x);


            Ground.draw();


//            if (frameCount % 30) {
//                ended = Plane.detectCollision(x, delta);
//            }
//
//            Plane.draw(x, delta);

            lastNow = now;

            raf(draw);
        });
    }

    loadImages(start);
}());