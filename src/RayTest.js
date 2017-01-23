/**
 * Created by samael on 2016/10/4.
 */

var LaserSegment = cc.Sprite.extend({
   ctor: function() {
       this._super("res/Laser.png");
       return true;
   },
   draw: function() {
       cc.log("draw");
   },

});
var RayTest = cc.Layer.extend({
    ctor: function() {
        this._super();
        //var laser = new cc.Sprite("res/player.jpg");
        //this.addChild(laser);
        //laser.x = cc.winSize.width / 2;
        //laser.y = cc.winSize.height / 2;
        //laser.setScaleX(0.5);
        //this.drawRay();


        var player1 = new cc.Sprite("res/player.jpg");
        player1.x = cc.winSize.width / 2;
        player1.y = cc.winSize.height / 2;
        this.addChild(player1);

        var player2 = new cc.Sprite("res/player.jpg");
        player2.setAdditionalTransform(player1.getNodeToParentTransform());
        this.addChild(player2);
        return true;
    },


    drawRay: function() {
        var r = 200;

        var divideNum  = parseInt(2 * Math.PI * r / 10);

        var angleDiff = 2 * Math.PI / divideNum;

        var r1 = r - (16 / 2);
        var r2 = r + (16 / 2);

        var angle1 = 90;
        var angle2 = angleDiff;

        var CenterPos = cc.p(cc.winSize.width / 2, cc.winSize.height / 2);
        for (var i = 0; i < 2; i++) {
            var laser = new LaserSegment();
            this.addChild(laser);
            var x = r2 * Math.cos(angle1) + CenterPos.x;
            var y = r2 * Math.sin(angle1) + CenterPos.y;
            laser.setPosition(x, y);
            var r = cc.radiansToDegrees(angle2);
            laser.setRotation(-r);
            angle1 += angleDiff;
            angle2 += angleDiff;
        }
    },

});