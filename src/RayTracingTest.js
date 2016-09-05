/**
 * Created by samael on 4/27/16.
 */

var Player = cc.Sprite.extend({
    TilePos: null,
    ctor: function() {
        this._super("res/player.jpg");
        return true;
    }
});
var RayTracing = cc.Layer.extend({
    _map: null,
    _mapWall: null,
    _mapGround: null,
    _edges: null,
    _player: null,
    ctor: function() {
        this._super();

        var draw = new cc.DrawNode();

        this.initMap();
        this.initPoints();
        this.initPlayer();

        this._drawNode = draw;
        this._map.addChild(draw, 200);
        this._edges = [];

        this.initMapData();
        return true;
    },

    initMap: function() {
        var tileMap = cc.TMXTiledMap.create('res/map.tmx');
        tileMap.setAnchorPoint(0.5, 0.5);
        tileMap.x = cc.winSize.width / 2;
        tileMap.y = cc.winSize.height / 2;
        this.addChild(tileMap, 10, 100);
        this._map = tileMap;
        this._mapWall = tileMap.getLayer("layer1");
        this._mapGround = tileMap.getLayer("layer2");
    },

    initPlayer: function() {
        this._player = new Player();
        this._player.TilePos = cc.p(16, 16);
        var t = this._mapGround.getTileAt(16,16);
        this._player.setPosition(t.width/2 + t.x, t.height/2 + t.y);
        this._player.setAnchorPoint(0.5, 0.5);
        this._map.addChild(this._player);

    },

    onTouchesBegan: function(touches, event) {
        if (touches.length == 1)
            this._startTouch = touches[0].getLocation();
    },

    onTouchesMoved: function (touches, event) {
        var tileMap = this._map;
        if (touches.length == 2) {
            var p1 = touches[0].getLocation();
            var p2 = touches[1].getLocation();
            var pd = cc.pSub(p1, p2);
            if (this._direction === null) this._direction = pd;
            // 防止两个手指交叉
            if (pd.x*this._direction.x < 0 ||
                pd.y*this._direction.y < 0 ) return;

            var curDistance = cc.pDistance(p1, p2);
            var prevDistance = cc.pDistance(touches[0].getPreviousLocation(), touches[1].getPreviousLocation());
            var node = event.getCurrentTarget().getChildByTag(100);
            var mp = cc.pMidpoint(p1, p2);
            var p = cc.pSub(tileMap.getPosition(), mp);

            var x = p.x > 0 ? 1 : -1;
            var y = p.y > 0 ? 1 : -1;
            var d = cc.pDistance(tileMap.getPosition(), mp);
            var r = Math.atan(p.x/ p.y);
            var s = tileMap.getScale() * Math.max(0.8, curDistance / prevDistance);
            var minScale = cc.winSize.height / node.height;
            s = Math.max(minScale, s);
            s = Math.min(2, s);
            var ds = s - tileMap.getScale();
            node.y += d * ds * Math.cos(r) * y;
            node.x += d * ds * Math.sin(r) * x;
            tileMap.setScale(s);
            var width = tileMap.getBoundingBox().width;
            var height = tileMap.getBoundingBox().height;
            node.x = node.x - width / 2 >= 0 ? width / 2: node.x;
            node.x = node.x + width / 2 <= cc.winSize.width ? cc.winSize.width - width / 2: node.x;
            node.y = node.y - height / 2 >= 0 ? height / 2: node.y;
            node.y = node.y + height / 2 <= cc.winSize.height ? cc.winSize.height - height / 2: node.y;
        } else if (touches.length == 1) {
            var width = tileMap.getBoundingBox().width;
            var height = tileMap.getBoundingBox().height;
            var node = event.getCurrentTarget().getChildByTag(100);
            var touch = touches[0];
            var delta = touch.getDelta();
            node.x += delta.x;
            node.y += delta.y;

            if (delta.x > 0)
                node.x = node.x - width / 2 >= 0 ? width / 2: node.x;
            else
                node.x = node.x + width / 2 <= cc.winSize.width ? cc.winSize.width - width / 2: node.x;

            if (delta.y > 0)
                node.y= node.y - height / 2 >= 0 ? height / 2: node.y;
            else
                node.y= node.y + height / 2 <= cc.winSize.height ? cc.winSize.height - height / 2: node.y;

        }
    },


    onTouchesEnded: function(touches, event) {
        if (touches.length == 1) {
            var tp = touches[0].getLocation();
            if (cc.pDistance(tp, this._startTouch) <= 5){
                this.movePlayer(tp);
            }
        }
        this._direction = null;
    },

    initPoints: function() {
        var pointBL = { x:0, y:0 };
        var pointBR = { x:cc.winSize.width, y:0 };
        var pointTR = { x:cc.winSize.width, y:cc.winSize.height };
        var pointTL = { x:0, y:cc.winSize.height };

        var pointCollection;
        var center = { x:cc.winSize.width/2, y:cc.winSize.height/2 };
        this.points =[];
        pointCollection = [ ];
        pointCollection.push(center);  pointCollection.push(pointTL);  pointCollection.push(pointTR);
        this.points.push(pointCollection);
        pointCollection = [ ];
        pointCollection.push(center);  pointCollection.push(pointTR);  pointCollection.push(pointBR);
        this.points.push(pointCollection);
        pointCollection = [ ];
        pointCollection.push(center);  pointCollection.push(pointBL);  pointCollection.push(pointBR);
        this.points.push(pointCollection);
        pointCollection = [ ];
        pointCollection.push(center);  pointCollection.push(pointTL);  pointCollection.push(pointBL);
        this.points.push(pointCollection);
    },

    sign: function(n) {
        return Math.abs(n) / n;
    },

    isInsideTriangle: function(A, B, C, P) {
        var planeAB = (A.x - P.x) * (B.y - P.y) - (B.x - P.x) * (A.y - P.y);
        var planeBC = (B.x - P.x) * (C.y - P.y) - (C.x - P.x) * (B.y - P.y);
        var planeCA = (C.x - P.x) * (A.y - P.y) - (A.x - P.x) * (C.y - P.y);
        return ((this.sign(planeAB) == this.sign(planeBC)) && (this.sign(planeBC) == this.sign(planeCA)));
    },

    movePlayer: function(tp) {
        var p = cc.p(0, 0);
        var dir = 0;
        for (var i = 0; i < 4; i++) {
            var pointsSet = this.points[i];
            if (this.isInsideTriangle(pointsSet[0], pointsSet[1], pointsSet[2], tp)) {
                dir = i + 1;
                break;
            }
        }
        switch(dir) {
            case 1: // up
                p = cc.p(0, -1);
                break;
            case 2: // right
                p = cc.p(1, 0);
                break;
            case 3: // down
                p = cc.p(0, 1);
                break;
            case 4: // left
                p = cc.p(-1, 0);
                break;
        }
        var targetPos = cc.pAdd(this._player.TilePos, p);
        var targetTile = this._mapWall.getTileAt(targetPos);
        if (targetTile != null) return;
        this._player.runAction(cc.sequence(
            cc.moveBy(0.3, p.x*100, -p.y*100),
            cc.callFunc(function(p) {
                var targetPos = cc.pAdd(this._player.TilePos, p);
                this._player.TilePos = targetPos;
            }.bind(this, p))
        ));
    },

    initMapData: function() {
        var draw = this._drawNode;
        draw.clear();

        for (var i = 1; i < 31; i++) {
            for (var j = 1; j < 31; j++) {
                var tile = this._mapWall.getTileAt(i,j);
                if (tile == null) continue;
                var lb = cc.p(tile.x , tile.y );
                var lt = cc.p(tile.x, tile.y + 100);
                var rb = cc.p(tile.x + 100, tile.y);
                var rt = cc.p(tile.x + 100, tile.y + 100);


                var px = this._player.x;
                var py = this._player.y;
                var p1, p2, pt = null;
                var x1 = lt.x, y1 = lt.y;
                var x2 = rt.x, y2 = rt.y;
                var x3 = lb.x, y3 = lb.y;
                var x4 = rb.x, y4 = rb.y;
                // 判断光照边
                if (px >= x1 && px <= x2) {
                    if (py > y2) { // 上
                        p1 = cc.p(x1, y1);
                        p2 = cc.p(x2, y2);
                        tile = this._mapWall.getTileAt(i,j-1);
                    }
                    if (py < y4) { // 下
                        p1 = cc.p(x4, y4);
                        p2 = cc.p(x3, y3);
                        tile = this._mapWall.getTileAt(i,j+1);
                    }

                    if(tile!=null) continue;
                } else {
                    if(px > x2)  {
                        if (py > y2) { // 右上
                            p1 = cc.p(x1, y1);
                            p2 = cc.p(x4, y4);
                            pt = cc.p(x2, y2);

                            tile = this._mapWall.getTileAt(i,j-1);
                            if (tile) {
                                p1 = cc.p(x2, y2);
                                pt = null;
                            }
                            tile = this._mapWall.getTileAt(i+1,j);
                            if (tile) {
                                p2 = cc.p(x2, y2);
                                pt = null;
                            }

                        } else if (py < y4) { // 右下
                            p1 = cc.p(x2, y2);
                            p2 = cc.p(x3, y3);
                            pt = cc.p(x4, y4);

                            tile = this._mapWall.getTileAt(i+1,j);
                            if (tile) {
                                p1 = cc.p(x4, y4);
                                pt = null;
                            }

                            tile = this._mapWall.getTileAt(i,j+1);
                            if (tile) {
                                p2 = cc.p(x4, y4);
                                pt = null;
                            }

                        } else { // 右
                            p1 = cc.p(x2, y2);
                            p2 = cc.p(x4, y4);
                            tile = this._mapWall.getTileAt(i+1,j);
                            if(tile!=null) continue;
                        }

                    }
                    else if(px < x1){
                        if (py > y2) { // 左上
                            p1 = cc.p(x3, y3);
                            p2 = cc.p(x2, y2);
                            pt = cc.p(x1, y1);

                            tile = this._mapWall.getTileAt(i-1,j);
                            if (tile) {
                                p1 = cc.p(x1, y1);
                                pt = null;
                            }

                            tile = this._mapWall.getTileAt(i,j-1);
                            if (tile) {
                                p2 = cc.p(x1, y1);
                                pt = null;
                            }

                        } else if (py < y4) { // 左下
                            p1 = cc.p(x4, y4);
                            p2 = cc.p(x1, y1);
                            pt = cc.p(x3, y3);

                            tile = this._mapWall.getTileAt(i,j+1);
                            if (tile) p1 = cc.p(x3, y3);

                            tile = this._mapWall.getTileAt(i-1,j);
                            if (tile) p2 = cc.p(x3, y3);

                        } else { // 左
                            p1 = cc.p(x3, y3);
                            p2 = cc.p(x1, y1);
                            tile = this._mapWall.getTileAt(i-1,j);
                            if(tile!=null) continue;
                        }

                    }

                }
                if (i==13&&j==16) {}
                //if (p1.x == p2.x && p1.y == p2.y) continue;
                if (pt) {
                    draw.drawSegment(p1, pt, 2, cc.color.RED);
                    draw.drawSegment(pt, p2, 2, cc.color.RED);
                } else {
                    draw.drawSegment(p1, p2, 2, cc.color.RED);
                }

                var d = {
                    p1: p1,
                    p2: p2,
                    next: -1,
                    prev: -1,
                    distance: cc.pDistance(cc.p(i, j), this._player.TilePos)
                };
                this._edges.push(d);
            }
        }
    },


    onEnter: function() {
        this._super();
        this._touchListener = Util.registerTouchEventAllAtOnce(this, true);
    },

    onExit: function() {
        this._super();
        cc.eventManager.removeListener(this._touchListener);
    }
});