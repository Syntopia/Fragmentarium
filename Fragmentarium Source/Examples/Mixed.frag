#info Icosahedron Distance Estimator (Syntopia 2010)
#include "DE-Raytracer.frag"
#group Mixed DE

// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

uniform float Scale; slider[0.00,3.0,4.00]

mat4 translate(vec3 v) {
	return mat4(1.0,0.0,0.0,0.0,
		0.0,1.0,0.0,0.0,
		0.0,0.0,1.0,0.0,
		v.x,v.y,v.z,1.0);
}

mat4 scale4(float s) {
	return mat4(s,0.0,0.0,0.0,
		0.0,s,0.0,0.0,
		0.0,0.0,s,0.0,
		0.0,0.0,0.0,1.0);
}

uniform float phi; slider[-5,1.618,5]

vec3 n1 = normalize(vec3(-phi,phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-phi,phi+1.0));
vec3 n3 = normalize(vec3(0.0,0.0,-1.0));
vec3 offset = vec3(0.850650808,0.525731112,0.0);

//mat4   M = toMatrix4(fracRotation2) * translate(offset) * scale4x4(scale) * translate(-offset) * toMatrix4(fracRotation1);
mat4   M =  translate(offset) * scale4(Scale) * translate(-offset) ;

// Number of fractal iterations.
uniform int iters;  slider[0,13,100]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(1,1,1)]



float DE2(vec3 z)
{
	float r;
	
      int n = 0;
      while (n < iters) {
		// Fold
		z = abs(z);
		if (z.x<z.y){ z.xy = z.yx;}
		if (z.x< z.z){ z.xz = z.zx;}
		if (z.y<z.z){ z.yz = z.zy;}
		z.x=(Scale+1)* z.x-Offset.x*(Scale);
		z.y=(Scale+1)* z.y-Offset.y*(Scale);
		z.z=(Scale+1)* z.z;
		if( z.z>0.5*Offset.z*(Scale))  z.z-=Offset.z*(Scale);	
		
		r = dot(z, z);
		n++;
	}
	
	return (length(z) ) * pow((Scale+1), float(-n));
}

float DE3(vec3 z)
{
	float r;
	float mindist = 1000.0;
	
	// Prefolds.
	z = abs(z);
	float t;
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		
	// Iterate to compute the distance estimator.
	int n = 0;
	vec4 p4;
	while (n < iters) {
		// Fold
		z = abs(z);
		t =dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t =dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		
		// Rotate, scale, rotate (we need to cast to a 4-component vector).
		p4.xyz = z; p4.w = 1.0;
		z = (M*p4).xyz;
		
		// Record minimum orbit for colouring
		r = dot(z, z);
		mindist = min(mindist, r);
		n++;
	}
	
	return (length(z) ) * pow(Scale,  float(-n));
}

float DE(vec3 z) {
  return max(DE2(z),DE3(z));
}