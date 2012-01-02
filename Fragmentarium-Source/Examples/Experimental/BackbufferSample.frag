#info Notice: set Render mode to Continous
#buffer RGBA8
#buffershader "BufferShader.frag"
#include "2D.frag"
void init() {}

uniform sampler2D backbuffer;
uniform float time;
vec3 getColor2D(vec2 z) {
	vec3 col4 = texture2D(backbuffer,(viewCoord*0.9+vec2(1.0))/2.0).xyz;
	vec3 col3 = texture2D(backbuffer,(viewCoord*1.01+vec2(1.0))/2.0).xyz;
	vec3 col = max(col4,col3);
	vec3 col2 = (length(z)<0.1) ? vec3(sin(time),cos(time),1.0):  vec3(0,0,0)  ;
	return vec3(0.4,0.0,0.0)+mix(max(col, col2),col2,0.01);
}
