/**
 * Created by samael on 4/16/16.
 */



var OOBSprite = cc.Sprite.extend({
    _axis: null,
    corner: null,
    _origin: null,

    ctor: function() {
        this._super(res.HelloWorld_png);
        this._axis = [0, 0];
        this.corner = [0, 0, 0, 0];
        this._origin = [];

        this.computeAxes();
        return true;
    },

    isOverlaps: function(target) {
        for(var i = 0; i < 2; i++) {
            // 左下角与旋转轴的投影
            var origin = this._origin[i];
            var t = cc.pDot(target.corner[0], this._axis[i]);
            var min = t;
            var max = t;
            // 计算重叠
            for (var j = 1; j < 4; j++) {
                t = cc.pDot(target.corner[j], this._axis[i]);
                if (t < min) min = t;
                else if (t > max) max = t;
            }

            // 为了保证性能,求的是平方的, 所以如果有重叠, 则范围是
            // [origin, 1 + origin]
            if ((max < origin) || (min > (1 + origin))) {
                return false;
            }
        }
        return true;
    },

    computeAxes: function() {
        var degrees = this.getRotation();
        var radians = cc.degreesToRadians(degrees);
        var rect1 = this.getContentSize();
        rect1.width = this.getScale() * rect1.width;
        rect1.height = this.getScale() * rect1.height;
        var x = cc.pMult(cc.p(-Math.cos(radians), Math.sin(radians)), rect1.width / 2);
        var y = cc.pMult(cc.p(Math.sin(radians), Math.cos(radians)),  rect1.height / 2);
        var pos = this.getPosition();
        var x1 = cc.pSub(pos, x);
        var x2 = cc.pAdd(pos, x);
        this.corner[0] = cc.pSub(x1, y);
        this.corner[1] = cc.pSub(x2, y);
        this.corner[2] = cc.pAdd(x2, y);
        this.corner[3] = cc.pAdd(x1, y);
        var extent0 = cc.pSub(this.corner[1], this.corner[0]);
        var extent1 = cc.pSub(this.corner[3], this.corner[0]);

        this._axis[0] = cc.pMult(extent0, 1/cc.pLengthSQ(extent0));
        this._axis[1] = cc.pMult(extent1, 1/cc.pLengthSQ(extent1));

        this._origin[0] = cc.pDot(this.corner[0], this._axis[0]);
        this._origin[1] = cc.pDot(this.corner[0], this._axis[1]);

    }

});

var OBBTest = cc.Layer.extend({
    _sp1: null,
    _draw1: null,
    _sp2: null,
    _draw2: null,
    ctor: function() {
        this._super();

        this._sp1 = new OOBSprite();
        this._sp1.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
        this._draw1 = new cc.DrawNode();
        this.addChild(this._draw1, 100);
        this._draw1.drawRect(this._sp1.corner[0], this._sp1.corner[2], cc.color(128, 128, 0, 255), 2, cc.color(128, 128, 0, 255));
        this._sp1.setScale(0.4);
        this.addChild(this._sp1);
        this._sp1.runAction(cc.repeatForever(cc.rotateBy(0.5, 90)));

        this._sp2 = new OOBSprite();
        this._sp2.setPosition(cc.winSize.width / 1 , cc.winSize.height / 2);
        this._draw2 = new cc.DrawNode();
        this.addChild(this._draw2, 1000);
        this.addChild(this._sp2);
        this._sp2.setScale(0.4);
        this._sp2.runAction(cc.repeatForever(cc.rotateBy(0.5, 90)));
        this.scheduleUpdate();

        var obj = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(this)
        };

        obj.onTouchMoved = this.onTouchMoved.bind(this);
        obj.onTouchEnded = this.onTouchEnded.bind(this);

        var eventListener = cc.EventListener.create(obj);
        cc.eventManager.addListener(eventListener, this);
    },


    update: function(dt) {
        this._sp1.computeAxes();
        this._draw1.clear();
        this._draw1.drawPoly(this._sp1.corner, cc.color(128, 128, 0, 255), 2, cc.color(128, 128, 0, 255));
        this._sp2.computeAxes();
        this._draw2.clear();
        this._draw2.drawPoly(this._sp2.corner, cc.color(128, 128, 0, 255), 2, cc.color(128, 128, 0, 255));
        if (this._sp1.isOverlaps(this._sp2)) {
            if (this._sp2.isOverlaps(this._sp1)) {
                console.log("hehe");
                this._sp2.setColor(cc.color(255, 0, 0));
            }
        } else {
            this._sp2.setColor(cc.color(255, 255, 255));
        }

    },

    onTouchBegan: function(touch) {
        return cc.rectContainsPoint(this._sp2.getBoundingBox(), touch.getLocation());
    },

    onTouchMoved: function(touch) {
        this._sp2.computeAxes();
        this._sp2.setPosition(touch.getLocation());
    },

    onTouchEnded: function(touch) {

    }

});
