#info Shadow test
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"

uniform float Scale; slider[0.00,3.0,4.00]
// Scaling center
uniform vec3 Offset; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float Spacing; slider[0.1,1.1,2.3]

uniform vec3 RotVector; slider[(0,0,0),(1,1,1),(1,1,1)]

uniform float RotAngle; slider[0.00,0,180]

// Number of fractal iterations.
uniform int ColorIterations;  slider[0,9,100]
uniform int Iterations;  slider[0,9,100]

mat3 rot;

void init() {
	 rot = rotationMatrix3(normalize(RotVector), RotAngle);
}

vec3 T(vec3 z) {
  z.xy = mod((z.xy),Spacing);
  z = vec3(Spacing/2.0)-abs(z-vec3(Spacing/2.0));
  return z;
}

int imod(int a, int b) {
	return a - (a/b)*b;
}

float DE(vec3 z)
{
	int n = 0;
	while (n < Iterations) {
		z = rot *z;
		if (imod(n,2)==0) z.xy = abs(z.xy);
	    	if (imod(n,2)==1) z.xz = abs(z.xz);
	      if (imod(n,3)==1) z.yz = abs(z.yz);
	      z = Scale*z-Offset*(Scale-1.0);

	 if (n<ColorIterations) orbitTrap = min(orbitTrap, (vec4(abs(z),dot(z,z))));		
		n++;
	}
	
	return abs(length(z)-0.0 ) * pow(Scale, float(-n));
}

float DE3(vec3 z)
{

z.xy = -abs(z.xy);
  float de = 10000.0;
int i = 0; 
while (i<Iterations) {
	z += Offset;
z*=Scale; 
i++;
}
  float d = max(0.0,length(z.xy)-0.2)+max(0.0,abs(z.z)-2.0);	
  de = min(d,de); 

 return de;
}

#preset Default
FOV = 0.389692
Eye = -4.55068,-0.185663,7.2439
Target = 2.77777,0.296457,0.457054
Up = 0.679716,-0.0964234,0.72711
AntiAlias = 1
Detail = -5.01067
DetailAO = -1.4
FudgeFactor = 0.67692
MaxRaySteps = 247
BoundingSphere = 42.857
Dither = 0.48958
AO = 0,0,0,0.7
Specular = 0.8974
SpecularExp = 16
SpotLight = 1,1,1,0.26
SpotLightDir = 0.55556,-0.1746
CamLight = 1,1,1,0.86274
CamLightMin = 0
Glow = 1,1,1,0
Fog = 0.18692
HardShadow = 0.46875 NotLocked
Reflection = 0
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.992157,0.992157,0.741176
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
EnableFloor = true NotLocked
FloorNormal = 0,0,0.15626
FloorHeight = -0.6061
FloorColor = 1,1,1
Scale = 3
Offset = 1,1,1
Spacing = 2.025
#endpreset