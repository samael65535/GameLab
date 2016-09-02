
var HelloWorldLayer = cc.Layer.extend({
    ctor:function () {
        return true;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HubTestLayer();
        this.addChild(layer);
    }
});

