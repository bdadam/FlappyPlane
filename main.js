(function() {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var width, height;

    function setSizes() {
        canvas.width = width = canvas.parentNode.clientWidth;
        canvas.height = height = 480; //canvas.parentNode.clientHeight;
    }

    setSizes();

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

    var spriteSheet,
        sprite = new Image();

    sprite.src = 'TappyPlane/Spritesheet/sheet.png';

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            spriteSheet = xmlhttp.responseXML.documentElement;
        }
    }

    xmlhttp.open("GET", "/TappyPlane/Spritesheet/sheet.xml", true);
    xmlhttp.send();

    function getSprite(fileName) {
        if (!spriteSheet) {
            return;
        }

        var item = spriteSheet.querySelector('[name="' + fileName + '"]');
        if (item) {
            return {
                width: parseInt(item.getAttribute('width'), 10),
                height: parseInt(item.getAttribute('height'), 10),
                x: parseInt(item.getAttribute('x'), 10),
                y: parseInt(item.getAttribute('y'), 10),
                img: sprite
            };
        }
    }

    var g = 9.81;
    var scale = 35;

    var Plane = {
        size: 20,
        v: [150, 0],
        a: [0, 0],
        r: [width / 10, height  / 2],

        update: function(delta) {
            var vy = this.v[1];
            var ay = this.a[1] - g;
            vy -= ay * delta;

            var dry = vy * delta - g/2 * Math.pow(delta, 2);
            dry = dry * scale;

            var ry = this.r[1] + dry;

            this.v[1] = vy;
            this.r[1] = ry;
        },

        draw: function(ctx, delta) {
            this.update(delta);
            var plane = getSprite('planeGreen1.png');
            if (!plane) {
                return;
            }

            ctx.save();
            ctx.drawImage(plane.img, plane.x, plane.y, plane.width, plane.height, this.r[0], this.r[1], plane.width, plane.height);
            ctx.restore();

//            ctx.save();
//            ctx.beginPath();
//            ctx.arc(this.r[0], this.r[1], this.size / 2, 0, Math.PI * 2, false);
//            ctx.strokeStyle = "#D40000";
//            ctx.fillStyle = "#aa5500";
//            ctx.lineWidth = 6;
//            ctx.fill();
//            ctx.stroke();
//            ctx.closePath();
//            ctx.restore();
        }
    };

    addEventListener(document, 'click', function() {
        Plane.v[1] -= height / 100;
    });


    var delta = 0;
    var elapsed = 0;

    window.onresize = function() {
        setSizes();
        Plane.size = height / 15;
    };

    var lastFrameTime = +new Date();
    var startTime = +new Date();
    var now = +new Date();

    //ctx.scale(2, 2);

    var BackGround = {
        draw: function(ctx, tx) {
            var bg = getSprite('background.png');

            if (bg) {
                tx = 0.65 * tx;
                ctx.drawImage(bg.img, bg.x, bg.y, bg.width, bg.height, tx % bg.width, 0, bg.width, bg.height);

                ctx.drawImage(bg.img, bg.x, bg.y, bg.width, bg.height, bg.width + (tx % bg.width), 0, bg.width, bg.height);

                ctx.drawImage(bg.img, bg.x, bg.y, bg.width, bg.height, 2*bg.width + (tx % bg.width), 0, bg.width, bg.height);
            }
        }
    };

    var SpriteObject = function(sprite, obj) {
        this.sprite = sprite;
        this.img = obj.img;
        this.x = obj.x || 0;
        this.y = obj.y || 0;
        this.width = this.sprite.width;
        this.height = this.sprite.height;
    };

    SpriteObject.prototype.draw = function(ctx) {
        ctx.drawImage(this.img,
                      this.sprite.x, this.sprite.y,
                      this.width, this.height,
                      Math.floor(this.x), Math.floor(this.y),
                      this.width, this.height);
    };

    var Ground = {
        visibleGrounds: [],
        lastTx: 0,
        draw: function(ctx, tx, dx) {
            var grounds = [
                getSprite('groundGrass.png'),
                getSprite('groundDirt.png'),
                getSprite('groundSnow.png'),
                getSprite('groundIce.png'),
                getSprite('groundRock.png')
            ];

            for (var i = 0, l = grounds.length; i < l; i++) {
                if (!grounds[i]) {
                    return;
                }
            }

            while(this.visibleGrounds.length < Math.ceil(width / grounds[0].width) + 1) {
                var ground =  grounds[Math.floor(Math.random() * grounds.length)];
                var groundSprite = new SpriteObject(ground, {
                    img: ground.img,
                    y: height - ground.height,
                    x: this.visibleGrounds.length * ground.width
                });

                if (this.visibleGrounds.length > 0) {
                    groundSprite.x = this.visibleGrounds[this.visibleGrounds.length - 1].x + this.visibleGrounds[this.visibleGrounds.length - 1].width - 1;
                }

                this.visibleGrounds.push(groundSprite);
            }

            for (var i = 0, l = this.visibleGrounds.length; i < l; i++) {
                var ground = this.visibleGrounds[i];
                ground.x -= dx;
                ground.draw(ctx);
            }

            if (this.visibleGrounds[0].x + this.visibleGrounds[0].width < 0) {
                this.visibleGrounds.shift();
            }
        }
    };


    raf(function draw() {
        raf(draw);

        now = +new Date();
        delta = (now - lastFrameTime) / 1000;
        elapsed = (now - startTime) / 1000;
        lastFrameTime = now;

        ctx.clearRect(0, 0, width, height);

        var tx = Math.floor(-elapsed * Plane.v[0]);
        var dx = delta * Plane.v[0];

        BackGround.draw(ctx, tx);

        var iceBerg = getSprite('rockGrass.png');
        if (iceBerg) {
            //var y = + (Math.random() - 0.5) * 60
            ctx.drawImage(iceBerg.img, iceBerg.x, iceBerg.y, iceBerg.width, iceBerg.height, width + tx, height - iceBerg.height, iceBerg.width, iceBerg.height);
        }

        Ground.draw(ctx, tx, dx);
        Plane.draw(ctx, delta);
    });
}());