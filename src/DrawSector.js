/**
 * Created by samael on 16/9/1.
 */

var DrawSectorLayer = cc.Layer.extend({
    ctor: function() {
        var draw = new cc.DrawNode();
        var winSize = cc.director.getWinSize();
        this.addChild(draw, 103);
        this.drawSector(draw, cc.p(winSize.width/2, winSize.height/2), 100, 0, 90, cc.color.YELLOW, 2, cc.color.YELLOW, 100);
        return;
    },

    drawSector: function(node, origin, radius, startAngle, angle_degree, fillColor, borderWidth, borderColor, numOfPoint) {
        // 扇形绘制
        // TODO 增加渐变效果
        if (!node) return;
        var angle_step = 2 * Math.PI * angle_degree / 360 / numOfPoint;
        var circle = [];
        circle.push(origin);
        for (var i = 0; i <= numOfPoint; i++) {
            var rads = angle_step*i + cc.degreesToRadians(startAngle);
            var x = origin.x + radius * Math.cos(rads);
            var y = origin.y + radius * Math.sin(rads);
            circle.push(cc.v2f(x, y));
        }
        node.drawPoly(circle, fillColor, borderWidth, borderColor)
    }
});