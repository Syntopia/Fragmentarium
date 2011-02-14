varying vec2 coord;

#info SimpleTexture demo.
#group Simple Texture demo.

/*
Set the render mode to continuous to test this shader.

The deformation is a modified version of
'Deform' by Inigo Quilez
(see http://www.iquilezles.org/apps/shadertoy/)
*/

uniform float time;
uniform sampler2D texture; file[texture2.jpg]
// You can use multiple textures:
// uniform sampler2D texture2; file[texture.jpg]
uniform vec2 params; slider[(-1,-1),(-0.5,0.24),(1,1)]


vec3 a(vec2 z, float t) {
	vec2 m =  params.xy;
	float a1 = atan(z.x-m.y,z.x-m.x);
	float r1 = sqrt(dot(z-m,z-m));
	float a2 = -atan(z.x+m.y,z.x+m.x);
	float r2 = sqrt(dot(z+m,z+m));
	vec2 uv;
	uv.x = 0.2*t + (r1-r2)*0.25;
	uv.y = tan(2.0*(a1-a2));
	float w = r1*r2*0.8;
	vec3 col = texture2D(texture,uv).xyz;
	return vec3(col/(.1+w));
}


vec3 getColor2D(vec2 z) {
	z.y*=2.0;
	z.x*=1.5;
	vec3 acc = vec3(0.0);
	float wt = 0.0;
	int iter = 10;
	for (int i = 0; i< iter; i++) {
		float w = (float(iter)-float(i))/(float(iter));
		w= w*w;
		wt+= w;
		acc+= a(z.yx,time+(float(i)*0.02))*w;
	}
	return (acc/(wt*2.0));
}

void main() {
	gl_FragColor = vec4(getColor2D(coord.xy),1.0);
}

