#vertex
varying vec2 coord;

void main(void)
{
    gl_Position =  gl_Vertex;
    coord = gl_Vertex.xy;
}
#endvertex

varying vec2 coord;
uniform sampler2D frontbuffer;
void main() {
    vec2 pos = (coord.xy+vec2(1.0))/2.0;
    vec4 tex = texture2D(frontbuffer, pos);
    gl_FragColor = vec4(tex.xyz,1.0);
}