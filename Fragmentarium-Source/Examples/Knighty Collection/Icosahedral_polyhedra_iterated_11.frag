#info Icosahedral polyhedra Distance Estimator (knighty 2011 some of the code is from Syntopia)
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Icosahedral

//Cut and fold (Houdini?) technique with icosahedral folding
//Well... in 2d, it's proved that any (?) polygon can be obtained with Cut and fold
//Is it the same for polyhedras?
//in this example the process is done recursively to get more elaborate shapes
//At eache step the current DE is combined with the previous ones
//feel free to play with this code by:
// - changing the DE combination
// - adding removing and changing the folding planes
// - use other cuts: 2+ planes, curved surfaces...etc.
// - optimize code :P
// -...etc :)
// Low iterations number gives more interresting results IMHO

// Number of fractal iterations.
uniform int Iterations;  slider[0,2,100]

// Number of color iterations.
uniform int ColorIterations;  slider[0,2,100]

uniform float Scale; slider[0.00,2.0,4.00]
//Size of the polyhedra
uniform float Size; slider[-2.0,.5,2.00]

//normal of the cutting plane
uniform vec3 plnormal; slider[(-1,-1,-1),(1,0,0),(1,1,1)]

#define Phi (.5*(1.+sqrt(5.)))

vec3 n1 = normalize(vec3(-Phi,Phi-1.0,1.0));
vec3 n2 = normalize(vec3(1.0,-Phi,Phi+1.0));
vec3 n3 = normalize(vec3(0.0,0.0,-1.0));


uniform vec3 Offset; slider[(0,0,0),(0.850650808,0.525731112,0),(1,1,1)]

uniform float Angle1; slider[-180,0,180]
uniform vec3 Rot1; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float Angle2; slider[-180,0,180]
uniform vec3 Rot2; slider[(-1,-1,-1),(1,1,1),(1,1,1)]

mat4 M;

void init() {
	mat4 fracRotation2 = rotationMatrix(normalize(Rot2), Angle2);
	mat4 fracRotation1 = rotationMatrix(normalize(Rot1), Angle1);
       M = fracRotation2 * translate(Offset) * scale4(Scale) * translate(-Offset) * fracRotation1;
}

float DE(vec3 z)
{
	float s=1.;
	float t;
	// Folds.
	//Dodecahedral.. you can use other sets of foldings!
	z = abs(z);
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	z = abs(z);
	t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
	t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
	z = abs(z);
	//combine DEs... explore different combinations ;)
	float dmin=dot(z-vec3(Size,0.,0.),normalize(plnormal));

	for(int i=0; i<Iterations; i++){
		// Rotate, scale, rotate (we need to cast to a 4-component vector).
		z = (M*vec4(z,1.0)).xyz;s/=Scale;
		
		// Folds.
		//Dodecahedral.. you can use other sets of foldings!
		z = abs(z);
		t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		z = abs(z);
		t=dot(z,n1); if (t>0.0) { z-=2.0*t*n1; }
		t=dot(z,n2); if (t>0.0) { z-=2.0*t*n2; }
		z = abs(z);
       	if (i<ColorIterations) orbitTrap = min(orbitTrap, abs(vec4(z.x,z.y,z.z,dot(z.xyz,z.xyz))));
				
		//combine DEs... explore different combinations ;)
		//the base DE is the distance to the plane going through vec3(Size,0.,0.) and which normal is plnormal
		dmin=max(dmin,s*dot(z-vec3(Size,0.,0.),normalize(plnormal)));
	}
	return abs(dmin);//you can take a look to the inside
}

#preset P2
FOV = 0.4
Eye = -0.886212,0.780972,1.39117
Target = 3.22959,-0.883778,-4.03418
Up = 0.809,0.335331,0.482775
AntiAlias = 1
Detail = -3.65218
DetailAO = -0.42
FudgeFactor = 0.32941
MaxRaySteps = 146
BoundingSphere = 7.5904
Dither = 0.5
AO = 0,0,0,1
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.25713
SpotLightDir = 0.66266,0.1
CamLight = 1,1,1,0.78874
CamLightMin = 0.31765
Glow = 1,1,1,0.2826
Fog = 0.3307
HardShadow = 0.4
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.64557
X = 0.5,0.6,0.6,0.75238
Y = 1,0.6,0,0.48572
Z = 0.8,0.78,1,0.5
R = 0.545098,0,0,0.78846
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 6.65914
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Size = 0.459
plnormal = 1,0.06928,0
Iterations = 7
Scale = 2
Offset = 0.850651,0.59649,0.65789
Angle1 = 74.9988
Rot1 = 1,1,1
Angle2 = 180
Rot2 = 1,1,1
ColorIterations = 2
#endpreset

#preset Default
FOV = 0.4
Eye = -0.230944,0.208713,-1.44444
Target = -0.181701,-1.56741,6.77114
Up = -0.929051,0.36103,0.0807557
AntiAlias = 1
Detail = -2.60183
DetailAO = -1.00002
FudgeFactor = 0.90361
MaxRaySteps = 66
BoundingSphere = 76.364
Dither = 0.26316
AO = 0,0,0,1
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.25713
SpotLightDir = 0.66266,0.1
CamLight = 1,1,1,1.23076
CamLightMin = 0.31765
Glow = 1,1,1,0.2826
Fog = 0.3307
HardShadow = 0.15384
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0.50632
X = 0.5,0.6,0.6,0.71428
Y = 1,0.666667,0,0.71428
Z = 0.8,0.78,1,0.2
R = 0.666667,0.333333,0.498039,0.98076
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.17235
CycleColors = false
Cycles = 6.36097
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Size = 0.4918
plnormal = 1,-0.0495,0.70298
Iterations = 11
Scale = 1.96668
Offset = 0.850651,0.5614,0.11404
Angle1 = 47.8152
Rot1 = 0.18644,-0.38984,0.66102
Angle2 = 93.7512
Rot2 = 0.8305,1,1
ColorIterations = 2
#endpreset