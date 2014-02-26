(function() {
    var Images = {
        Background: {
            baseUrl: 'TappyPlane/PNG/',
            list: [
                'background.png'
            ]
        },

        Plane: {
            baseUrl: 'TappyPlane/PNG/Planes/',
            list: [
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
            ]
        },

        Ground: {
            baseUrl: 'TappyPlane/PNG/',
            list: [
                'groundGrass.png',
                'groundDirt.png',
                'groundRock.png',
                'groundSnow.png',
                'groundIce.png'
            ]
        },

        Rock: {
            baseUrl: 'TappyPlane/PNG/',
            list: [
                'rockGrass.png',
                'rock.png',
                'rock.png',
                'rockSnow.png',
                'rockIce.png'
            ]
        },

        RockDown: {
            baseUrl: 'TappyPlane/PNG/',
            list: [
                'rockGrassDown.png',
                'rockDown.png',
                'rockDown.png',
                'rockSnowDown.png',
                'rockIceDown.png'
            ]
        },

        load: function(fn) {
            var imagesToLoad = 0;

            for (var key in this) {
                var obj = this[key];
                if (obj.baseUrl && obj.list) {
                    for (var i = 0, l = obj.list.length; i < l; i++) {
                        imagesToLoad++;
                        var img = new Image();
                        obj.images = obj.images || [];
                        obj.images.push(img);

                        img.onload = function() {
                            imagesToLoad--;
                            if (imagesToLoad === 0) {
                                PubSub.publish('images:loaded');
                            }
                        };

                        img.src = obj.baseUrl + obj.list[i];
                    }
                }
            }
        }
    };

    var Plane = {
        x: 50,
        y: 0,
        vy: 0,

        setColor: function(color) {
            this.color = color % Images.Plane.images.length || 0;
        },

        init: function(ctx) {
            this.ctx = ctx;
            this.width = Images.Plane.images[0].width;
            this.height = Images.Plane.images[0].height;
            this.y = Math.floor(Game.height / 2 - this.height / 2);

            this.corners = [
                [73, 0],
                [this.width - 2, 17],
                [this.width - 2, 64],
                [64, this.height-1],
                [22, 64],
                [0, 18]
            ];

            this.setColor(Math.floor(Math.random() * Images.Plane.images.length / 3));
        },

        start: function() {
            this.setColor(Math.floor(Math.random() * Images.Plane.images.length / 3));
        },

        clear: function() {
            this.ctx.clearRect(this.x, this.y, this.width, this.height);
        },

        updatePosition: function() {
            var ay = 15*9.81;
            this.vy += ay * Game.delta;
            this.y = Math.floor(this.y + this.vy * Game.delta);

            if (this.y < 0) {
                this.vy = 0;
                this.y = 0;
            }

            var offset = this.color * 3;
            var d = [0, 1, 2, 1];
            this.img = Images.Plane.images[offset + d[Math.floor(Game.x / 40) % 4]];
        },

        draw: function() {
            this.ctx.drawImage(this.img, this.x, this.y);
        },

        collidesWithPoint: function() {
            for (var i = 0, l = this.corners.length; i < l; i++) {
                var corner = this.corners[i];

                var x = this.x + corner[0];
                var y = this.y + corner[1];

                if (Ground.collidesWithPoint(x, y) || RockHandler.collidesWithPoint(x, y)) {
                    PubSub.publish('plane:crash', { x: x, y: y });
                    return true;
                }
            }
        }
    };

    window.addEventListener('click', function() {
        Plane.vy -= 100;
    });

    var Background = {
        init: function(ctx) {
            this.img = Images.Background.images[0];
            this.ctx = ctx;
            this.x = 0;
            this.n = Math.ceil(Game.width / this.img.width) + 1;
            this.vx = 90;

            this.width = this.img.width;
            this.height = this.img.height;

            this.xWhenLastDrawn = Number.MIN_VALUE;

            this.ctx.globalAlpha = 0.7;
        },

        draw: function() {
            this.x = -(Game.elapsed * this.vx) % this.width;

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
        init: function(ctx) {
            this.ctx = ctx;
            this.width = Images.Ground.images[0].width;
            this.height = Images.Ground.images[0].height;
            this.n = Math.ceil(Game.width / this.width) + 1;
            this.top = Game.height - this.height;

            this.heights = Helper.calcHeights(Images.Ground.images[0]); //this.calcHeights();
        },

        clear: function() {
            this.ctx.clearRect(0, this.top, Game.width, this.height);
        },

        getTerrainTypeForX: function(x) {
            return Math.floor(x / this.width / 5) % Images.Ground.images.length;
        },

        draw: function() {
            var dx = -Game.x % this.width;

            for (var i = 0; i < this.n; i++) {
                var q = this.getTerrainTypeForX(Game.x + i * this.width);
                var img = Images.Ground.images[q];

                this.ctx.drawImage(img, dx + i * this.width, this.top);
            }
        },

        calcHeights: function() {
            var q = [];
            var c = document.createElement('canvas');
            var img = Images.Ground.images[0];
            c.width = img.width;
            c.height = img.height;

            var ctx = c.getContext('2d');

            ctx.clearRect(0, 0, img.width, img.height);
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
        },

        collidesWithPoint: function(x, y) {
            var imgX = (x + Game.x) % this.width;
            return Game.height - this.heights[imgX] <= y;
        }
    };

    var Rock = function(ctx) {
        this.ctx = ctx;

        Rock.heights = Rock.heights || Helper.calcHeights(Images.Rock.images[0]);

        Object.defineProperty(this, 'visible', {
            get: function() {
                return this.x + this.img.width >= 0;
            }
        });
    };

    Rock.prototype.init = function(x, up) {
        this.up = up !== false;
        this.x = x;

        var images = this.up ? Images.Rock.images : Images.RockDown.images;
        this.img = images[Ground.getTerrainTypeForX(Game.x + this.x)];

        var dy = Math.random() * this.img.height | 0;

        this.y = up ? (Game.height - this.img.height + dy) | 0 : 0 - dy;
    };

    Rock.prototype.collidesWithPoint = function(x, y) {
        if (this.x - Game.x <= x && this.x - Game.x + this.img.width > x) {
            var h = Rock.heights[Game.x + x - this.x];

            return this.up ? (this.y + this.img.height - h < y) : y <= this.y + h;
        }

        return false;
    };

    Rock.prototype.clear = function() {
        if (!this.visible) {
            return;
        }

        if (this.up) {
            this.ctx.clearRect(this.x - Game.x, this.y, this.img.width, this.img.height);
        } else {
            this.ctx.clearRect(this.x - Game.x, 0, this.img.width, this.img.height);
        }
    };

    Rock.prototype.draw = function() {
        if (!this.visible) {
            return;
        }

        this.ctx.drawImage(this.img, this.x - Game.x, this.y);
    };

    (function() {
        var lastRock = 0;
        var rocks = [];
        var ctx;

        window.RockHandler = {
            init: function(context) {
                ctx = context;
            },

            do: function() {
                if (Math.random() < 0.04) {
                    var rock = new Rock(ctx);
                    rock.init(Game.x + Game.width, Math.random() < 0.5);
                    rocks.push(rock);
                    lastRock = Game.x + Game.width;
                }
            },

            collidesWithPoint: function(x, y) {
                return rocks.some(function(rock) {
                    return rock.collidesWithPoint(x, y);
                });
                /*rocks.forEach(function(rock) {
                    if (rock.collidesWithPoint(x, y)) {
                        return true;
                    }
                });*/
            },

            clear: function() {
                rocks.forEach(function(rock) {
                    rock.clear();
                });
            },

            draw: function() {
                rocks.forEach(function(rock) {
                    rock.draw();
                });
            }
        };
    }());

    function start() {
        Background.init(Game.bgCtx);
        Ground.init(Game.ctx);
        Plane.init(Game.ctx);
        RockHandler.init(Game.ctx);

        var ended = false;

        function clear() {
//            Game.ctx.clearRect(0, 0, Game.width, Game.height);
//            return;

            Plane.clear();
            Ground.clear();
            RockHandler.clear();
        }

        function loop() {
            if (ended) {
                return;
            }

            raf(loop);

            RockHandler.do();

            clear();

            Game.ping();

            Background.draw();
            RockHandler.draw();
            Ground.draw();

            Plane.updatePosition();
            ended = Plane.collidesWithPoint();
            Plane.draw();
        };

        raf(loop);
    }

    PubSub.subscribe('images:loaded', function() {
        Game.start();
        start();
    });

    PubSub.subscribe('plane:crash', function(point) {
        console.log(point);
        Game.ctx.beginPath();
        Game.ctx.arc(point.x, point.y, 10, 0, Math.PI*2, true);
        Game.ctx.fill();
    });

    Images.load();
}());