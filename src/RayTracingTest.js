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
    edges: null,
    _player: null,
    ctor: function() {
        this._super();

        this.initMap();
        this.initPoints();
        this.initPlayer();

        this._drawNode = new cc.DrawNode();

        this._map.addChild(this._drawNode, 200);
        this.edges = [];

        this.updateMapData();
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
                this.updateMapData();
            }.bind(this, p))
        ));
    },
    addEdge: function(p1, p2, distance) {
        var d = {
            p1: p1,
            p2: p2,
//            pt: pt,
            next: -1,
            prev: -1,
            distance: distance
        };
        this.edges.push(d);
    },
    updateMapData: function() {
        var draw = this._drawNode;
        draw.clear();
        this.edges = [];
        for (var y = 1; y < 31; y++) {
            for (var x = 1; x < 31; x++) {
                var tile = this._mapWall.getTileAt(x,y);
                if (tile == null) continue;
                var lb = cc.p(tile.x , tile.y );
                var lt = cc.p(tile.x, tile.y + 100);
                var rb = cc.p(tile.x + 100, tile.y);
                var rt = cc.p(tile.x + 100, tile.y + 100);

                var px = this._player.x;
                var py = this._player.y;
                var p1, p2, pt = null;
                //var x1 = lt.x, y1 = lt.y;
                //var x2 = rt.x, y2 = rt.y;
                //var x3 = lb.x, y3 = lb.y;
                //var x4 = rb.x, y4 = rb.y;
                // check for up side, data direction >>>
                var distance = cc.pDistance(tile.getPosition(), cc.p(px, py));
                if ((this._mapWall.getTileAt(x,y-1) == null) && (py > lt.y)) {
                    p1 = lt;
                    p2 = rt;
                    this.addEdge(p1, p2, distance);
                }

                // check for down side, data direction <<<
                if ((this._mapWall.getTileAt(x,y+1) == null) && (py < rb.y)) {
                    p1 = rb;
                    p2 = lb;
                    this.addEdge(p1, p2, distance)
                }
                // check for left side, data direction ^^^
                if ((this._mapWall.getTileAt(x-1,y) == null) && (px < lt.x)) {
                    p1 = lb;
                    p2 = lt
                    this.addEdge(p1, p2, distance)
                }
                // check for right side, data direction vvv
                if ((this._mapWall.getTileAt(x+1,y) == null) && (px > rt.x)) {
                    p1 = rt;
                    p2 = rb;
                    this.addEdge(p1, p2, distance)
                }
            }
        }
        this.edges = _.sortBy(this.edges, 'distance');
        // Connect edges
        for (var i=0; i<this.edges.length; i++) {
            var eNow = this.edges[i];
            if (eNow.prev != -1 && eNow.next != -1)
                continue;
            for(var j=0; j<this.edges.length; j++) {
                if (i == j)
                    continue;
                var eCheck = this.edges[j];
                if (eCheck.prev != -1 && eCheck.next != -1)
                    continue;

                if (cc.pSameAs(eNow, eCheck)) {
                    eNow.next = j;
                    eCheck.prev = i;
                }
            }
        }


        this.updateEdges();

        var edge = this.edges[0];
        var next = edge.next;
        var targetEdge;
        //while (next >= 0) {
        //    targetEdge = this.edges[next];
        //    if (targetEdge.pt) {
        //        draw.drawSegment(targetEdge.p1, targetEdge.pt, 2, cc.color.RED);
        //        draw.drawSegment(targetEdge.pt, targetEdge.p2, 2, cc.color.RED);
        //    } else {
        //        draw.drawSegment(targetEdge.p1, targetEdge.p2, 2, cc.color.RED);
        //    }
        //    next = targetEdge.next;
        //
        //}

        _.each(this.edges, function(targetEdge){
            draw.drawSegment(targetEdge.p1, targetEdge.p2, 2, cc.color.RED);
        });
    },

    getLineABC: function(pt1, pt2) {
        var abc;

        if (cc.pSameAs(pt1, pt2)) {
            abc = { a:0, b:0, c:0 };
        } else if (pt1.x == pt2.x) {
            abc = { a:1, b:0, c:-pt1.x }
        } else {
            abc = { a:-(pt2.y - pt1.y) / (pt2.x - pt1.x), b:1, c:pt1.x * (pt2.y - pt1.y) / (pt2.x - pt1.x) - pt1.y };
        }

        return abc;
    },


    /**
     * Get intersection point
     * @param abc1
     * @param abc2
     * @returns {{x: number, y: number}}
     */
    getIntersectionPoint: function(abc1, abc2) {
        var p = { x:0, y:0 };
        var x = 0,
            y = 0;
        var a1 = abc1.a, b1 = abc1.b, c1 = abc1.c,
            a2 = abc2.a, b2 = abc2.b, c2 = abc2.c;

        if ((b1 == 0) && (b2 == 0)) {
            return p;
        } else if (b1 == 0) {
            x = -c1;
            y = -(a2 * x + c2) / b2;
        } else if (b2 == 0) {
            x = -c2;
            y = -(a1 * x + c1) / b1;
        } else {
            if ((a1 / b1) == (a2 / b1)) {
                return p;
            } else {
                x = (c1 - c2) / (a2  - a1);
                y = -(a1 * x) - c1;
            }
        }

        p = { x:x, y:y };

        return p;
    },

    /**
     * Update the edge
     * @param edgeID            The edge that start the projection
     * @param targetEdgeID      The target edge
     * @param p                 Intersection point
     * @param isNext            Is this a next check?
     */
    updateEdge: function(edgeID, targetEdgeID, p, isNext) {
        // The edge that start the projection
        var edgeStart = this.edges[edgeID];
        // The target edge
        var edgeToBeSliced = this.edges[targetEdgeID];

        // Calculate for the edge to be kept
        if (isNext) {
            edgeStart.next = targetEdgeID;
            edgeToBeSliced.p1 = p;
            edgeToBeSliced.prev = edgeID;
        } else {
            edgeStart.prev = targetEdgeID;
            edgeToBeSliced.p2 = p;
            edgeToBeSliced.next = edgeID;
        }

        // Update all the 3 edges
        this.edges[edgeID] = edgeStart;
        this.edges[targetEdgeID] = edgeToBeSliced;
    },

    updateEdges: function() {
        var edges = this.edges;
        for (var i = 0, m = edges.length; i < m; i++) {
            var e = edges[i];
            var abc;
            var intersectionData;
            var lightSource = {
                x: this._player.x,
                y: this._player.y
            };
            if (e.next == -1) {
                abc = this.getLineABC(e.p2, lightSource);
                intersectionData = this.checkIntersection(abc, e.p2, i);
                if (intersectionData.intersectID != -1) {
                    this.updateEdge(i, intersectionData.intersectID, { x:intersectionData.x, y:intersectionData.y }, true);
                }
            }

            if (e.prev == -1) {
                abc = this.getLineABC(e.p1, lightSource);
                intersectionData = this.checkIntersection(abc, e.p1, i);

                // if found intersection point then split the edge at intersection point
                if (intersectionData.intersectID != -1) {
                    this.updateEdge(i, intersectionData.intersectID, { x:intersectionData.x, y:intersectionData.y }, false);
                }
            }
        }
    },
    getIntersectionPoint: function(abc1, abc2) {
        var p = { x:0, y:0 };
        var x = 0,
            y = 0;
        var a1 = abc1.a, b1 = abc1.b, c1 = abc1.c,
            a2 = abc2.a, b2 = abc2.b, c2 = abc2.c;

        if ((b1 == 0) && (b2 == 0)) {
            return p;
        } else if (b1 == 0) {
            x = -c1;
            y = -(a2 * x + c2) / b2;
        } else if (b2 == 0) {
            x = -c2;
            y = -(a1 * x + c1) / b1;
        } else {
            if ((a1 / b1) == (a2 / b1)) {
                return p;
            } else {
                x = (c1 - c2) / (a2  - a1);
                y = -(a1 * x) - c1;
            }
        }

        p = { x:x, y:y };

        return p;
    },
    checkIntersection: function(lineABC, point, currentID) {
        var edges = this.edges;
        var i,
            p,
            abc;
        var found = false;
        var lightSource = { x:this._player.x, y:this._player.y };
        for (var i = 0, m = edges.length; i < m; i++) {
            if (i != currentID) {
                var edge = edges[i];
                abc = this.getLineABC(edge.p1, edge.p2);
                p = this.getIntersectionPoint(abc, lineABC);

                if ((p.x == point.x) && (p.y == point.y))   continue;   // Skip current point, confirm
                if ((lightSource.x > point.x) && (p.x > point.x))   continue;
                if ((lightSource.x < point.x) && (p.x < point.x))   continue;
                if ((lightSource.y > point.y) && (p.y > point.y))   continue;
                if ((lightSource.y < point.y) && (p.y < point.y))   continue;

                // check if the intersection point is not on the edge
                var bigX, bigY, smallX, smallY;
                if (edge.p1.x > edge.p2.x) {
                    bigX = edge.p1.x;       smallX = edge.p2.x;
                } else {
                    bigX = edge.p2.x;       smallX = edge.p1.x;
                }

                if (edge.p1.y > edge.p2.y) {
                    bigY = edge.p1.y;       smallY = edge.p2.y;
                } else {
                    bigY = edge.p2.y;       smallY = edge.p1.y;
                }

                // If the intersection point is note on the edge, ignore it
                if ((p.x < smallX) || (p.x > bigX) || (p.y < smallY) || (p.y > bigY))
                    continue;

                found = true;
                break;
            }
        }
        // if not found, marked as not found with zero filled
        if (!found) {
            p = { x: 0, y: 0 };
            i = -1;
        }

        // return intersection point and intersect id
        return { x:p.x, y: p.y, intersectID:i};
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