#info Mixed Distance Estimator (Syntopia 2010)
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Mixed DE

// This example shows how to mix two different DE's

// Based on Knighty's Kaleidoscopic IFS 3D Fractals, described here:
// http://www.fractalforums.com/3d-fractal-generation/kaleidoscopic-%28escape-time-ifs%29/

uniform float Scale; slider[0.00,1.7,4.00]

uniform float Phi; slider[-5,1.618,5]

vec3 n1 = normalize(vec3(-Phi,Phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-Phi,Phi+1.0));
vec3 n3 = normalize(vec3(0.0,0.0,-1.0));
vec3 offset = vec3(0.850650808,0.525731112,0.0);

mat4   M ;

// Number of fractal iterations.
uniform int Iterations;  slider[0,13,100]
uniform int ColorIterations;  slider[0,3,100]

// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(1,1,1)]

void init() {
    M =  translate(offset) * scale4(Scale) * translate(-offset) ;
}


float DE2(vec3 z)
{
	int n = 0;
	while (n < Iterations) {
		// Fold
		z = abs(z);
		if (z.x<z.y){ z.xy = z.yx;}
		if (z.x< z.z){ z.xz = z.zx;}
		if (z.y<z.z){ z.yz = z.zy;}
		z.x=(Scale+1.0)* z.x-Offset.x*(Scale);
		z.y=(Scale+1.0)* z.y-Offset.y*(Scale);
		z.z=(Scale+1.0)* z.z;
		if( z.z>0.5*Offset.z*(Scale))  z.z-=Offset.z*(Scale);
		
		
		if (n<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z,dot(z,z))));
		n++;
	}
	
	return (length(z) ) * pow((Scale+1.0), float(-n));
}

float DE3(vec3 z)
{
	float mindist = 1000.0;
	
	// Prefolds.
	z = abs(z);
	float t;
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	
	// Iterate to compute the distance estimator.
	int n = 0;
	vec4 p4;
	while (n < Iterations) {
		// Fold
		z = abs(z);
		t =dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t =dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		
		// Rotate, scale, rotate (we need to cast to a 4-component vector).
		p4.xyz = z; p4.w = 1.0;
		z = (M*p4).xyz;
		// Record minimum orbit for colouring
		if (n<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z,dot(z,z))));
		
		n++;
	}
	
	return (length(z) ) * pow(Scale,  float(-n));
}

float DE(vec3 z) {
	return max(DE2(z),DE3(z));
}

#preset Default
FOV = 0.4
Eye = 0.939192,-0.291666,-1.54337
Target = -3.69025,1.88066,6.82177
Up = 0.226567,0.962448,-0.149534
Detail = -2.10616
DetailAO = -0.5
FudgeFactor = 1
MaxRaySteps = 56
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.7
Specular = 3.4167
SpecularExp = 16
SpotLight = 1,1,1,0.46739
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,1,1,0.08772
Fog = 0.4698
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 1,0.321569,0.113725,0.63492
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 4.80603
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 1.7
Phi = 1.618
Iterations = 13
ColorIterations = 6
Offset = 1,1,1
#endpreset

#preset Alt
FOV = 0.4
Eye = -0.788575,-1.70591,0.281756
Target = 3.59945,7.18395,-1.028
Up = -0.861309,0.374867,-0.341228
Detail = -2.10616
DetailAO = -0.5
FudgeFactor = 0.916
MaxRaySteps = 112
BoundingSphere = 2
Dither = 0.5
AO = 0,0,0,0.96721
Specular = 1.4167
SpecularExp = 18.8
SpotLight = 1,1,1,0.17391
SpotLightDir = 0.31428,0.1
CamLight = 1,1,1,1.41936
CamLightMin = 0
Glow = 0.835294,0.0784314,0.0784314,0
Fog = 0
HardShadow = 0
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.515
X = 0.6,0.0117647,0.0117647,0.59056
Y = 1,0.6,0,0.44882
Z = 1,1,1,0.49606
R = 0.666667,0.666667,0.498039,0.07936
BackgroundColor = 0.666667,0.666667,0.498039
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Scale = 1.7
Phi = 1.618
Iterations = 13
ColorIterations = 3
Offset = 1,1,1
#endpreset