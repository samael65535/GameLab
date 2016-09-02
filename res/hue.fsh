#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_texCoord;
uniform mat3 u_hue;
uniform float u_alpha;

void main()
{
    vec4 pixColor = texture2D(CC_Texture0, v_texCoord);
    vec3 rgbColor = u_hue * pixColor.rgb;
    gl_FragColor = vec4(rgbColor, pixColor.a * u_alpha);
}