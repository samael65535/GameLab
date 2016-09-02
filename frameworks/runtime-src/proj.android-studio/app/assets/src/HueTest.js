/**
 * Created by samael on 16/9/1.
 */


function xRotateMat(rs, rc)
{
    var mat= [
        1.0, 0.0, 0.0,
        0.0, rc, rs,
        0.0, -rs, rc
    ];
    return mat;
}

function yRotateMat(rs, rc)
{
   var mat = [
        rc,  0.0, -rs,
        0.0, 1.0, 0.0,
        rs,  0.0, rc
    ];

    return mat;
}


function zRotateMat(rs, rc)
{
    var mat = [
        rc,  rs,  0.0,
        -rs, rc, 0.0,
        0.0, 0.0, 1.0
    ];

    return mat;
}

function matrixMult(a, b, c)
{
    var x, y;
    var temp = [];
    for(y=0; y<3; y++) {
        for(x=0; x<3; x++) {
            var k = y * 3 + x;
            temp[k] = b[y*3] * a[x] + b[y*3+1] * a[3+x] + b[y*3+2] * a[2*3+x];
        }
    }
    for(y=0; y<3; y++) {
        for (x = 0; x < 3; x++) {
            var k = y * 3 + x;
            c[k] = temp[k];
        }
    }
}

function hueMatrix(mat,  angle)
{
    var mag, rot;
    var xrs, xrc;
    var yrs, yrc;
    var zrs, zrc;

    // Rotate the grey vector into positive Z
    mag = Math.sqrt(2);
    xrs = 1.0/mag;
    xrc = 1.0/mag;
    mat = xRotateMat(xrs, xrc);
    mag = Math.sqrt(3);
    yrs = -1.0/mag;
    yrc = Math.sqrt(2)/mag;
    rot = yRotateMat(yrs, yrc);
    matrixMult(rot, mat, mat);

    // Rotate the hue
    zrs = Math.sin(angle);
    zrc = Math.cos(angle);
    rot = zRotateMat(zrs, zrc);
    matrixMult(rot, mat, mat);

    // Rotate the grey vector back into place
    rot = yRotateMat(-yrs, yrc);
    matrixMult(rot, mat, mat);
    rot = xRotateMat(-xrs, xrc);
    matrixMult(rot, mat, mat);
    return mat;
}

function premultiplyAlpha(mat, alpha)
{
    for (var i = 0; i < mat.length; ++i) {
        mat[i] *= alpha;
    }
    return mat;
}

var SpriteHue = cc.Sprite.extend({
    _mat: null,
    _hue: 0,

    ctor: function(str) {
        this._super(str);
        this._mat = [];
        this.initShader();
        return true;
    },

    initShader: function() {
        if ('opengl' in cc.sys.capabilities) {
            if (cc.sys.isNative) {

                //var glprogram = cc.GLProgramCache.getGLProgram("hue_program");
                //if (!glprogram) {
                var glprogram = new cc.GLProgram("res/hue.vsh", "res/hue.fsh");
                glprogram.link();
                glprogram.updateUniforms();
                var glprogramstate = cc.GLProgramState.getOrCreateWithGLProgram(glprogram);
                this.setGLProgramState(glprogramstate);
                //}
                this.updateMyColor();

            } else {
                //this.shaderProgram = new cc.GLProgram("res/hub.vsh", "res/hub.fsh");
                //this.shaderProgram.link();
                //this.shaderProgram.updateUniforms();
                //this.shaderProgram.use();
            }
        }
    },

    updateMyColor: function() {
        //this.setColor(cc.color.WHITE);
        this.updateColorMatrix();
        this.updateAlpha();
    },

    updateAlpha: function() {
        var state = this.getGLProgramState();
        state.setUniformFloat("u_alpha", this.getOpacity() / 255);
    },

    hueUniformCallback: function(p, u) {
        this._mat = new Float32Array(this._mat);
        gl.uniformMatrix3fv(u.location, false, this._mat);
    },

    updateColorMatrix: function() {
        this._mat = hueMatrix(this._mat, this._hue);
        this._mat = premultiplyAlpha(this._mat, this.getOpacity() / 255);
        var state = this.getGLProgramState();
        state.setUniformCallback("u_hue", this.hueUniformCallback.bind(this));
    },

    setHue: function(h) {
        this._hue = h;
        this.updateColorMatrix();
    }
});
var HubTestLayer = cc.Layer.extend({
    ctor: function() {
        this._super();
for (var i = 0; i <= 30; i++) {
    var sprite = new SpriteHue("res/test4.png");
    sprite.x = cc.winSize.width * Math.random();
    sprite.y = cc.winSize.height * Math.random();
    sprite.setScale(0.4);
    sprite.setHue(Math.random()*2*Math.PI);
    this.addChild(sprite);
}
        return true;
    }
});