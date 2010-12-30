#info Menger Distance Estimator.
#include "include/DE-Raytracer.frag"
#include "include/Matrix.frag"
#group Menger
// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

// Number of iterations.
uniform int Iterations;  slider[0,13,100]

// Scale parameter. A perfect Menger is 3.0
uniform float Scale; slider[0.00,3.0,4.00]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float Angle1; slider[-180,0,180]
uniform vec3 Rot1; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float Angle2; slider[-180,0,180]
uniform vec3 Rot2; slider[(-1,-1,-1),(1,1,1),(1,1,1)]

mat3 fracRotation2 = rotationMatrix3(normalize(Rot2), Angle2);
mat3 fracRotation1 = rotationMatrix3(normalize(Rot1), Angle1);

float DE(vec3 z)
{
	//float r;
	
	int n = 0;
	while (n < Iterations) {
		// Fold
		if (mod(float(n),2.0)==1.0) {
			z*= fracRotation2;
		}  else {
			z*= fracRotation1;
			
		}
		z = abs(z);
		if (z.x<z.y){ z.xy = z.yx;}
		if (z.x< z.z){ z.xz = z.zx;}
		if (z.y<z.z){ z.yz = z.zy;}
		z.x=Scale* z.x-Offset.x*(Scale-1.0);
		z.y=Scale* z.y-Offset.y*(Scale-1.0);
		z.z=Scale* z.z;
		if( z.z>0.5*Offset.z*(Scale-1.0))  z.z-=Offset.z*(Scale-1.0);
				
		//r = dot(z, z);
		n++;
	}
	
	return (length(z) ) * pow(Scale, float(-n));
}

