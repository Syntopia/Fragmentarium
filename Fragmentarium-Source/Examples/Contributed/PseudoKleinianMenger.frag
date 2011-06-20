#info Theli-at's Pseudo Kleinian (Scale 1 JuliaBox + Something (here a Menger Sponge)).
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group PseudoKleinian

// Made by Knighty, see this thread:
// http://www.fractalforums.com/3d-fractal-generation/fragmentarium-an-ide-for-exploring-3d-fractals-and-other-systems-on-the-gpu/msg32270/#msg32270

#define USE_INF_NORM

// Maximum iterations
uniform int MI; slider[0,5,20]

// Size
uniform float Size; slider[0,1,2]

// Cubic fold Size
uniform vec3 CSize; slider[(0,0,0),(1,1,1),(2,2,2)]

// Julia constant
uniform vec3 C; slider[(-2,-2,-2),(0,0,0),(2,2,2)]

// Basic shape DE Offset
uniform float DEoffset; slider[0,0,0.01]

// Basic shape Translation
uniform vec3 Offset; slider[(-2,-2,-2),(0,0,0),(2,2,2)]

//Basic shape
// Menger Number of iterations.
uniform int MnIterations;  slider[0,2,20]

// Menger Scale parameter. A perfect Menger is 3.0
uniform float MnScale; slider[0.00,3.0,4.00]

// Menger Scaling center
uniform vec3 MnOffset; slider[(0,0,0),(1,1,1),(2,2,2)]

float Menger(vec3 z)
{
	float r;
	
	int n = 0;
	// Fold
	z = abs(z);
	if (z.x<z.y){ z.xy = z.yx;}
	if (z.x<z.z){ z.xz = z.zx;}
	if (z.y<z.z){ z.yz = z.zy;}
	if (z.z<1./3.){ z.z -=2.*( z.z-1./3.);}
	
while (n < MnIterations && dot(z,z)<100.0) {
		
		z=MnScale* (z-MnOffset)+MnOffset;
		
		// Fold
		z = abs(z);
		if (z.x<z.y){ z.xy = z.yx;}
		if (z.x< z.z){ z.xz = z.zx;}
		if (z.y<z.z){ z.yz = z.zy;}
		if (z.z<1./3.*MnOffset.z){ z.z -=2.*( z.z-1./3.*MnOffset.z);}
		
		r = dot(z-MnOffset, z-MnOffset);
		orbitTrap = min(orbitTrap, abs(vec4(z,r)));
		
		n++;
	}
	
	//return (length(z)-sqrt(3.) ) * pow(Scale, float(-n));
	return float(z.x-MnOffset) * pow(MnScale, float(-n));
}

float Thing2(vec3 p){
//Just scale=1 Julia box
#ifdef USE_INF_NORM   
	vec3 p1=abs(p);
	float r2=max(p1.x,max(p1.y,p1.z));
#else
	float r2=dot(p,p);
#endif
	float DEfactor=1.;
   
	for(int i=0;i<MI && r2<60.;i++){
		p=2.*clamp(p, -CSize, CSize)-p;
      
		r2=dot(p,p);
		//orbitTrap = min(orbitTrap, abs(vec4(p,r2)));
		float k=max(Size/r2,1.);
		p*=k;DEfactor*=k;
      
		p+=C;
#ifdef USE_INF_NORM   
		p1=abs(p);
		r2=max(p1.x,max(p1.y,p1.z));
#else
		 r2=dot(p,p);
#endif
		orbitTrap = min(orbitTrap, abs(vec4(p,r2)));
	}
	//Call basic shape and scale its DE
	return abs(0.5*Menger(p-Offset)/DEfactor-DEoffset);
}

float DE(vec3 p){
	return  Thing2(p);//RoundBox(p, CSize, Offset);
}

#preset g1
FOV = 0.4
Eye = -0.15632,0.498694,-0.296694
Target = 6.58425,-7.18379,-1.83755
Up = 0.730733,0.668335,-0.135584
AntiAlias = 1
AntiAliasBlur = 1
Detail = -4.2
MaxStep = 2
DetailNormal = -5.63416
DetailAO = 0
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 10
Dither = 0.5
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,1,1,0
Fog = 0
HardShadow = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
MI = 8
Size = 1.01586
CSize = 1.02522,1,1
C = 0,0.47756,0
DEoffset = 0
Offset = 0,0,0
MnIterations = 2
MnScale = 3
MnOffset = 1,1,1
#endpreset

#preset k4
FOV = 0.4
Eye = -0.154476,-0.66737,1.30966
Target = 1.43319,2.17063,-8.4859
Up = -0.987987,0.029591,-0.15156
AntiAlias = 1
AntiAliasBlur = 1
Detail = -4.2
MaxStep = 2
DetailNormal = -5.63416
DetailAO = 0
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 10
Dither = 0.5
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,0.0235294,0.0235294,0.07609
Fog = 0.28346
HardShadow = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.02858
Y = 1,0.6,0,0.5619
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.57692
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = true
Cycles = 13.8149
MI = 8
Size = 1.01586
CSize = 1.69748,0.78992,0.87394
C = -0.02984,0.47756,0
DEoffset = 0.00379
Offset = 0.4,1.12728,-0.07432
MnIterations = 2
MnScale = 0.90568
MnOffset = 0.6,1.32,1
#endpreset


#preset Default
FOV = 0.4
Eye = -2.23427,-1.71919,1.73208
Target = -1.75162,4.82164,1.5546
Up = -0.99867,0.0384707,0.0343102
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.28699
MaxStep = -1.24
DetailNormal = -3.67073
DetailAO = -2.17
FudgeFactor = 0.98824
MaxRaySteps = 149
MaxRayStepsDiv = 1.8
BoundingSphere = 621
Dither = 0.51724
AO = 0,0,0,0.7
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.74286
SpotLightDir = -0.15662,0.1
CamLight = 1,1,1,0.50704
CamLightMin = 0
Glow = 0.666667,1,0.498039,0.16303
Fog = 0.56692
HardShadow = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.6762
Y = 0.666667,0.666667,0,0.14286
Z = 0.8,0.78,1,-0.48572
R = 0.666667,0.666667,0.498039,0.46154
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
MI = 11
Size = 1
CSize = 1.0084,1,1.0084
C = 1.97016,-0.02984,-0.2388
DEoffset = 0.00262
Offset = 0.36364,0.2182,-2
MnIterations = 6
MnScale = 3
MnOffset = 1.15998,1.22,1.12
#endpreset

#preset  A
FOV = 0.4
Eye = -0.619777,-0.321106,0.607603
Target = 5.29611,3.74761,-6.10836
Up = -0.701618,0.682568,-0.204515
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.3
MaxStep = -0.3
DetailNormal = -2.8
DetailAO = -0.5
FudgeFactor = 1
MaxRaySteps = 56
MaxRayStepsDiv = 1.8
BoundingSphere = 10
Dither = 0.5
AO = 0,0,0,0.7
Specular = 4
SpecularExp = 16
SpotLight = 1,1,1,0.4
SpotLightDir = 0.1,0.1
CamLight = 1,1,1,1
CamLightMin = 0
Glow = 1,0.666667,0,0.16484
Fog = 0.4127
HardShadow = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.12
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 1.1
MI = 5
Size = 1
CSize = 1.67796,1.20336,1
C = -0.406,0,0
DEoffset = 0
Offset = 0.12844,0.05504,0.09172
MnIterations = 2
MnScale = 3
MnOffset = 1,1,1
#endpreset

#preset B1
FOV = 0.4
Eye = -6.19995,-3.81715,5.62691
Target = -1.77862,-10.4577,5.42392
Up = -0.0134753,-0.0395136,0.999128
AntiAlias = 1
AntiAliasBlur = 1
Detail = -2.88596
MaxStep = -0.3
DetailNormal = -4.66669
DetailAO = -1.13134
FudgeFactor = 1
MaxRaySteps = 153
MaxRayStepsDiv = 1.8
BoundingSphere = 10
Dither = 0.5
AO = 0,0,0,0.76768
Specular = 0.6186
SpecularExp = 16
SpotLight = 1,1,1,0.26087
SpotLightDir = -0.14634,0.1
CamLight = 1,1,1,1
CamLightMin = 0.2381
Glow = 0.333333,0.333333,0,0.37363
Fog = 0.3492
HardShadow = 1
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.5,0.6,0.6,0.7
Y = 1,0.6,0,0.4
Z = 0.8,0.78,1,0.5
R = 0.4,0.7,1,0.14564
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 0.1
MI = 8
Size = 1
CSize = 1.71186,0.77966,1.25424
C = -0.01504,-0.61656,1.84964
DEoffset = 0
Offset = 0.01836,-0.12844,0.75228
MnIterations = 3
MnScale = 3.08572
MnOffset = 1.73738,2,1.45454
#endpreset

#preset
FOV = 0.4
Eye = -0.948684,-1.74806,-1.49775
Target = -0.958776,-1.74092,-1.39897
Up = -0.488718,0.859967,-0.112142
AntiAlias = 1
AntiAliasBlur = 1
Detail = -3.22609
MaxStep = -1.24
DetailNormal = -3.67073
DetailAO = -1.68
FudgeFactor = 0.70588
MaxRaySteps = 149
MaxRayStepsDiv = 1.8
BoundingSphere = 621
Dither = 0.51724
AO = 0,0,0,1
Specular = 0
SpecularExp = 16
SpotLight = 1,1,1,0.5
SpotLightDir = -0.15662,0.1
CamLight = 1,1,1,0.92958
CamLightMin = 0.21176
Glow = 0.905882,1,0.823529,0.20652
Fog = 0.56692
HardShadow = 0
BaseColor = 1,1,1
OrbitStrength = 0.8
X = 0.411765,0.6,0.556863,-0.21312
Y = 0.592157,0.666667,0.592157,1
Z = 0.937255,0.905882,1,0.46666
R = 0.666667,0.666667,0.498039,0.67308
BackgroundColor = 0.6,0.6,0.45
GradientBackground = 0.3
CycleColors = false
Cycles = 12.0253
MI = 11
Size = 1.06348
CSize = 1.0084,1,1.0084
C = 1.97016,-0.02984,-0.1194
DEoffset = 0.00262
Offset = 0.36364,0.2182,-2
MnIterations = 5
MnScale = 3
MnOffset = 1.15998,1.22,1.12
#endpreset
