
var HelloWorldLayer = cc.Layer.extend({
    ctor:function () {
        return true;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new OBBTest();
        this.addChild(layer);
    }
});

