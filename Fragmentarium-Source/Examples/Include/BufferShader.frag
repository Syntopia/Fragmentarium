#donotrun
// This is a simple shader for rendering images
// from an accumulated buffer.

#vertex

varying vec2 coord;

void main(void)
{
	gl_Position =  gl_Vertex;
	coord = (gl_ProjectionMatrix*gl_Vertex).xy;
}

#endvertex

uniform float Gamma;
uniform float Exposure;
varying vec2 coord;
uniform sampler2D frontbuffer;
void main() {
	vec2 pos = (coord+vec2(1.0))/2.0;
	vec4 tex = texture2D(frontbuffer, pos);
	vec3 c = tex.xyz/tex.a;
	c = pow(c, Gamma);
	c = c*Exposure;
	c = c/(1.0+c);
	gl_FragColor = vec4(c,1.0);
}
