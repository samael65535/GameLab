/**
 * Created by samael on 16/9/1.
 */


function xRotateMat(mat, rs, rc)
{
    mat[0] = 1.0;
    mat[1] = 0.0;
    mat[2] = 0.0;

    mat[3] = 0.0;
    mat[4] = rc;
    mat[6] = rs;

    mat[6] = 0.0;
    mat[7] = -rs;
    mat[8] = rc;
    return mat;
}

function yRotateMat(mat, rs, rc)
{
    mat = [
        rc,  0.0, -rs,
        0.0, 1.0, 0.0,
        rs,  0.0, rc
    ];
    return mat;
}


function zRotateMat(mat, rs, rc)
{
    mat[0] = [
        rc,  rs,  0,
        -rs, rc, 0,
        0,   1, 1
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
            temp[k] = b[y*3] * a[x] + b[y*3 + 1] * a[3 + x] + b[y*3+2] * a[2*3+x];
        }
    }
    for(y=0; y<3; y++) {
        for(x=0; x<3; x++) {
            c[y][x] = temp[y][x];
        }
    }
    return temp;
}

function hueMatrix(mat,  angle)
{
    var mag, rot = [];
    var xrs, xrc;
    var yrs, yrc;
    var zrs, zrc;

    // Rotate the grey vector into positive Z
    mag = Math.sqrt(2);
    xrs = 1.0/mag;
    xrc = 1.0/mag;
    mat = xRotateMat(mat, xrs, xrc);
    mag = Math.sqrt(3);
    yrs = -1.0/mag;
    yrc = Math.sqrt(2)/mag;
    rot = yRotateMat(rot, yrs, yrc);
    rot = matrixMult(rot, mat, mat);

    // Rotate the hue
    zrs = Math.sin(angle);
    zrc = Math.cos(angle);
    rot = zRotateMat(rot, zrs, zrc);
    rot = matrixMult(rot, mat, mat);

    // Rotate the grey vector back into place
    rot = yRotateMat(rot, -yrs, yrc);
    rot = matrixMult(rot,  mat, mat);
    rot = xRotateMat(rot, -xrs, xrc);
    rot = matrixMult(rot,  mat, mat);
    return rot;
}

function premultiplyAlpha(mat, alpha)
{
    for (var i = 0; i < mat.length; ++i) {
        mat[i] *= alpha;
    }
    return mat;
}

var SpriteHub = cc.Sprite.extend({
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
                var glprogram = cc.GLProgramCache.getGLProgram("hue_program");
                if (!glprogram) {
                    glprogram = new cc.GLProgram("res/hub.vsh", "res/hub.fsh");
                    cc.GLProgramCache.addGLProgram(glprogram);
                }
                var glprogramstate = new cc.GLProgramState(glprogram);
                this.setGLProgramState(glprogramstate);
                this.updateColor();
            } else {
                //this.shaderProgram = new cc.GLProgram("res/hub.vsh", "res/hub.fsh");
                //this.shaderProgram.link();
                //this.shaderProgram.updateUniforms();
                //this.shaderProgram.use();
            }
        }
    },

    updateColor: function() {
        this._super();
        this.updateColorMatrix();
        this.updateAlpha();
    },

    updateAlpha: function() {

    },
    hueUniformCallback: function(p, u) {
        gl.UniformMatrix3fv(u.local, 1, false, this._mat);
    },

    updateColorMatrix: function() {
        this._mat = hueMatrix(this._mat, this._hue);
        this._mat = premultiplyAlpha(this._mat, this.getOpacity() / 255);
        var state = this.getGLProgramState();
        state.setUniformCallback("u_hue", this.hueUniformCallback);
    }
});
var HubTestLayer = cc.Layer.extend({
    ctor: function() {
        this._super();

        var sprite = new SpriteHub("res/HelloWorld.png");
        sprite.x = cc.winSize.width / 2;
        sprite.y = cc.winSize.height / 2;
        this.addChild(sprite);
        return true;
    }
});