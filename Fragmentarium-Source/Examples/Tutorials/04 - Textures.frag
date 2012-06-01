#include "2D.frag"

// It is possible to read from external bitmaps
// from Fragmentarium using textures.
// Set up a sampler2D as below,
// and read using the texture2D command.
#group MySystem

uniform float T ;slider[0,4,10]
uniform float R; slider[0,2,10]
uniform float step; slider[0,0.004,0.01]
uniform float time;

// Here we read from a texture
// Files locations are resolved relative to the current file,
// and to the include path set in the settings.
uniform sampler2D texture; file[texture2.jpg]

// You can set texture parameters directly:
#TexParameter texture GL_TEXTURE_MAG_FILTER GL_LINEAR
#TexParameter texture GL_TEXTURE_WRAP_S GL_REPEAT
#TexParameter texture GL_TEXTURE_WRAP_T GL_REPEAT

// A simple system based on the 'tunnel' system by Inigo Quilez:
// http://www.iquilezles.org/apps/shadertoy/
vec3 color(vec2 c) {
	c*= 1.3+cos(time*2.0);
	vec2 uv;
	
	float a = atan(c.y,c.x);
	float r = length(c);
	
	uv.x = .5*time+.1/r;
	uv.y = a/3.1416 + time*0.1;
	vec2 dd = vec2(step,0.0);
	vec2 d =uv;
	vec3 col = texture2D(texture,d).xyz;
	vec3 colX = texture2D(texture,d+dd.xy).xyz;
	vec3 colMX = texture2D(texture,d-dd.xy).xyz;
	vec2 g;
	g.x = length(colMX)-length(colX);
	vec3 colY = texture2D(texture,d+dd.yx).xyz;
	vec3 colMY = texture2D(texture,d-dd.yx).xyz;
	g.y = length(colMY)-length(colY);
	g = normalize(g);
	vec2 light = vec2(cos(time*T),sin(time*T))*R;
	return mix(col,r*col* max(-1.0,dot(light,g)),0.9);
}

#preset Default
Center = -0.0214904,-0.00195827
Zoom = 2.34384
AntiAliasScale = 1
AntiAlias = 1
T = 4.3511
R = 2.2308
step = 0.0041
#endpreset
