// An example of rendering using the progressive 3D ray tracer, 
// which makes it possible to use effects like real soft shadows,
// better anti-alias, better ambient-occlusion and depth-of-field.
// Rendering is much slower, though.
//
// To use it, just include "Soft-Raytracer" instead of "DE-Raytracer"
//
// Remember to set 'Render mode' to 'Continous'!

#info knot thingy by knighty (2012). Based on an idea by DarkBeam from fractalforums (http://www.fractalforums.com/new-theories-and-research/not-fractal-but-funny-trefoil-knot-routine/30/)
#include "Soft-Raytracer.frag"
#group Trefoil


//Radius of the tubes
uniform float tubeRadius; slider[0,0.1,0.5]

//Radius of the goup of tubes
uniform float groupRadius; slider[0,0.4,0.5]

//Radius of the whole object (because it looks like a torus (-:)
uniform float objectRadius; slider[0,1,1]

//Rotation Numerator X: actually not a rotation. This is frequency in x direction
uniform int    RotNumeratorX; slider[-10,2,10]

//Rotation Numerator Y: actually not a rotation. This is frequency in y direction. (lissajou figure)
uniform int    RotNumeratorY; slider[-10,4,10]

//Rotation Denominator: this is the rotation "speed" in xz plane
uniform int    RotDenominator; slider[1,3,20]

//Rotations number: how many instances to check. related to the period of the knot. Have to find math formula for that. 
uniform int    Rotations; slider[1,1,10]

float Cylinder(vec2 p){
	p.x-=groupRadius;
	return length(p)-tubeRadius;
}

float twist(vec3 p){//seen from above it is a lissajou fugure
	float ra =p.z*float(RotNumeratorX)/float( RotDenominator);
	float raz=p.z*float(RotNumeratorY)/float(RotDenominator);
	return length(p.xy-vec2(groupRadius*cos(ra)+objectRadius,groupRadius*sin(raz)+objectRadius))-tubeRadius;
}

vec3 bend2PI(vec3 p){
	return vec3(length(p.xz),p.y,atan(p.z,p.x));
}

float DE(vec3 p) {
	float r=length(p.xz), ang=atan(p.z,p.x),y=p.y;
	float d=10000.;
	for(int i=0; i<Rotations;i++){
		vec3 p=vec3(r,y,ang+2.*PI*float(i));
		p.x-=objectRadius;
		d=min(d,twist(p));
	}
	return min(d,p.y);
}

#preset default
FOV = 0.62536
Eye = 0.77939,1.62364,1.44633
Target = -2.86937,-4.53699,-3.77496
Up = -0.312624,0.711048,-0.620502
EquiRectangular = false
FocalPlane = 1.4674
Aperture = 0.02
Gamma = 2.2685
ToneMapping = 2
Exposure = 0.9783
Brightness = 1
Contrast = 1.0891
Saturation = 1.4516
GaussianWeight = 1
AntiAliasScale = 2
Detail = -3
DetailAO = -0.14287
FudgeFactor = 0.66265
MaxRaySteps = 132
BoundingSphere = 4 Locked
Dither = 0 Locked
NormalBackStep = 1
AO = 0,0,0,0.61224
Specular = 0.3797
SpecularExp = 51.389
SpotLight = 0.811765,1,0.819608,2.2222
SpotLightPos = 5,2.676,-0.7042
SpotLightSize = 1.25157
CamLight = 0.0980392,0.713725,1,0.53846
CamLightMin = 0
Glow = 1,1,1,0
GlowMax = 20
Fog = 0
Shadow = 0.86364 NotLocked
Sun = 0.84582,1.57
SunSize = 0.01
Reflection = 0
BaseColor = 0.701961,0.701961,0.701961
OrbitStrength = 0
X = 0.411765,0.6,0.560784,0.41748
Y = 0.666667,0.666667,0.498039,-0.16504
Z = 1,0.258824,0.207843,1
R = 0.0823529,0.278431,1,0.82352
BackgroundColor = 0,0,0
GradientBackground = 0.3261
CycleColors = true
Cycles = 4.04901
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
tubeRadius = 0.07534
groupRadius = 0.29851
objectRadius = 0.43077
RotNumeratorX = -2
RotNumeratorY = -4
RotDenominator = 3
Rotations = 3
#endpreset
