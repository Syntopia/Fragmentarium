
#info LivingKIFS 1.0 by Kali

#include "MathUtils.frag"
#include "DE-Raytracer.frag"

#info Default Raytracer (by Syntopia)
#camera 3D

#group Fractal

uniform int Iterations;  slider[0,17,300]
uniform int ColorIterations;  slider[0,3,300]
uniform int ColoringType; slider[1,1,3]
uniform float ColorScale;  slider[0,.5,1]
uniform float ColorOffset;  slider[-2,0,2]
uniform float Scale;  slider[1,1,3]
uniform int FoldingMode; slider[1,2,3]
uniform vec3 Fold; slider[(-3,-3,-3),(0,0,0),(3,3,3)]
uniform vec3 Julia; slider[(-3,-3,-3),(-0.5,-0.5,-0.5),(3,3,3)]
uniform vec3 RotVector; slider[(-1,-1,-1),(1,1,1),(1,1,1)]
uniform float RotAngle; slider[-180,0,180]

#group Shape
uniform vec3 ScaleVary; slider[(-1,-1,-1),(0,0,0),(1,1,1)]
uniform float ScaleVaryStrength; slider[0,0,1]
uniform vec3 RotVary; slider[(-1,-1,-1),(0,0,0),(1,1,1)]
uniform float RotVaryStrength; slider[0,0,1]
uniform vec2 MinMaxScale;  slider[(1,1),(1,3),(2,3)]
uniform float Fatness;  slider[0,0,2]


#group Animation 1
uniform int AnimationFunction; slider[1,1,4]
uniform vec3 Speeds;  slider[(-1,-1,-1),(.5,.5,.5),(1,1,1)]
uniform vec3 Amplitudes; slider[(-1,-1,-1),(.5,.5,.5),(1,1,1)]
uniform bool UniformSpeed; checkbox[false];
uniform bool UniformAmplitude; checkbox[false];
uniform float SpeedAdjust; slider[0,.5,1]
uniform float AmplitudeAdjust; slider[0,.5,1]

#group Animation 2
uniform vec3 AmpVary; slider[(-1,-1,-1),(0,0,0),(1,1,1)]
uniform float AmpVaryStrength; slider[0,0,1]
uniform vec3 SpeedVary; slider[(-1,-1,-1),(0,0,0),(1,1,1)]
uniform float SpeedVaryStrength; slider[0,0,1]
uniform float WaveAmp; slider[0,0,1]
uniform float WaveLength; slider[0,.5,1]
uniform float WaveSpeed; slider[0,.5,1]
uniform float WaveZoom; slider[0,.5,1]

#group Translation
uniform vec3 TransVector; slider[(-1,-1,-1),(1,0,0),(1,1,1)]
uniform float TransSpeed; slider[0,0,1]
uniform float ImpulseStrength; slider[0,0,10]
uniform float ImpulseRate; slider[0,0,10]
uniform float ImpulseOffset; slider[0,0,10]
uniform vec3 TRotVector; slider[(-1,-1,-1),(1,0,0),(1,1,1)]
uniform float TRotSpeed; slider[0,0,45]


mat3 rot;


uniform float time;


float DE(vec3 pos) {
	vec3 p = pos, p0 = Julia;  

	float Sc;
	vec3 ani=vec3(0,0,0); 
	vec3 AssyS=vec3(0,0,0), AssyR=vec3(0,0,0), AssyA=vec3(0,0,0), AssySp=vec3(0,0,0), Speed=0, Amplitude=0;

	if (TRotSpeed>0) {
		rot=rotationMatrix3(normalize(TRotVector),TRotSpeed*time);
		p*=rot;
	}
	if (TransSpeed>0) {
		p+=normalize(TransVector)*time*TransSpeed*10;
	}
	if (ImpulseStrength>0) {
		p+=normalize(TransVector)*(0.8+sin(time*ImpulseRate+ImpulseOffset))*ImpulseStrength;
	}
	if (WaveAmp>0) {
		float wz=WaveZoom*WaveZoom;
		p+=cos(p*WaveLength/wz+time*WaveSpeed*10)*WaveAmp*.5*wz;
	}

		AssyS=p*ScaleVary*Scale*ScaleVaryStrength*.02;
		AssyR=p*RotVary*RotVaryStrength*.2;


	if (SpeedAdjust>0 && AmplitudeAdjust>0) {
		AssyA=p*AmpVary*AmpVaryStrength*.5;
		AssySp=p*SpeedVary*SpeedVaryStrength*2;
		Speed=(Speeds*SpeedAdjust*10);
		Amplitude=(Amplitudes+AssyA)*AmplitudeAdjust*.5;
		if (UniformSpeed) Speed=vec3(Speed.x,Speed.x,Speed.x)*2;
		if (UniformAmplitude) Amplitude=vec3(Amplitude.x,Amplitude.x,Amplitude.x);
		if (AnimationFunction==1) {
			ani.x=sin(time*Speed.x+AssySp.x);
			ani.y=sin(time*Speed.y+AssySp.y);
			ani.z=sin(time*Speed.z+AssySp.z);
		}
		if (AnimationFunction==2) {
			ani.x=cos(time*Speed.x+AssySp.x);
			ani.y=sin(time*Speed.y+AssySp.y);
			ani.z=sin(time*Speed.z+AssySp.z);
		}
		if (AnimationFunction==3) {
			ani.x=sin(time*Speed.x+AssySp.x);
			ani.y=cos(time*Speed.y+AssySp.y);
			ani.z=sin(time*Speed.z+AssySp.z);
		}
		if (AnimationFunction==4) {
			ani.x=sin(time*Speed.x+AssySp.x);
			ani.y=sin(time*Speed.y+AssySp.y);
			ani.z=cos(time*Speed.z+AssySp.z);
		}
		ani.x*=Amplitude.x;
		ani.y*=Amplitude.y;
		ani.z*=Amplitude.z;
       }
	Sc=clamp(Scale+(AssyS.x+AssyS.y+AssyS.z),MinMaxScale.x,MinMaxScale.y);

	float l=0;
	float lc=0;
	float prevl=0;
	int i=0;
	int i2=0;
	if (ColoringType>1) orbitTrap=vec4(0,0,0,0);
	rot = rotationMatrix3(normalize(RotVector+ani+AssyR), RotAngle);
	for (i=0; i<Iterations; i++) {
		prevl=l;
		if (FoldingMode==1)  p.x=abs(p.x+Fold.x)-Fold.x;
		if (FoldingMode==2)  p.xy=abs(p.xy+Fold.xy)-Fold.xy;
		if (FoldingMode==3)  p.xyz=abs(p.xyz+Fold.xyz)-Fold.xyz;
		p=p*Sc+p0;
		p*=rot;
		l=length(p);
		if (i<ColorIterations) {
			if (ColoringType==2) orbitTrap+=exp(-1/abs(l-prevl+ColorOffset));		
			if (ColoringType==3) orbitTrap+=abs(l-prevl+ColorOffset);		
			if (ColoringType==1) orbitTrap = min(orbitTrap, abs(vec4(p.xyz,0)));
		}
	}
	if (ColoringType==3) orbitTrap/=ColorIterations;		
	orbitTrap*=ColorScale;
	float de1=l*pow(Sc, -float(Iterations))-Fatness;
	return de1;
}


#preset default
FOV = 0.54
Eye = 12.9304,14.1353,-21.2115
Target = 7.45355,8.3979,-15.1215
Up = -0.593847,0.779296,0.200109
AntiAlias = 1 NotLocked
Detail = -2.66371
DetailAO = -1.00002
FudgeFactor = 0.3494
MaxRaySteps = 308
BoundingSphere = 24.528
Dither = 0
NormalBackStep = 0 NotLocked
AO = 0,0,0,1
Specular = 0.5063
SpecularExp = 1.818
SpotLight = 0.862745,0.898039,1,0.13725
SpotLightDir = 0.375,-1
CamLight = 1,1,1,0.1923
CamLightMin = 0.4697
Glow = 1,1,1,0
GlowMax = 0
Fog = 0.22222
HardShadow = 1 NotLocked
ShadowSoft = 19.6774
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.44156
X = 0.4,0.427451,0.498039,0.2233
Y = 1,0.694118,0.203922,1
Z = 0.8,0.78,1,0.0097
R = 0.4,0.7,1,-1
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = false
Cycles = 0.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 30
ColorIterations = 10
ColoringType = 1
ColorScale = 2
ColorOffset = 0
Scale = 1.9505
FoldingMode = 3
Fold = 3,3,3
Julia = -3,-3,-3
RotVector = 0,-1,0
RotAngle = 45
ScaleVary = 0,0,0
ScaleVaryStrength = 0
RotVary = 0,0,0
RotVaryStrength = 0
MinMaxScale = 1,3
Fatness = 0
AnimationFunction = 2
Speeds = 1,1,1
Amplitudes = 1,1,1
UniformSpeed = true
UniformAmplitude = true
SpeedAdjust = 0.09756
AmplitudeAdjust = 1
AmpVary = 0,0,0
AmpVaryStrength = 0
SpeedVary = 0,0,0
SpeedVaryStrength = 0
WaveAmp = 0
WaveLength = 1
WaveSpeed = 1
WaveZoom = 1
TransVector = 0,0,-1
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 3.2468
TRotVector = -1,0,0
TRotSpeed = 0
#endpreset

#preset Mantaraya
FOV = 0.54
Eye = 10.5584,-21.5232,12.1834
Target = 6.4693,-12.7432,9.69491
Up = -0.185964,0.186796,0.964634
AO = 0,0,0,0.61728
Specular = 0.5063
SpecularExp = 1.818
SpotLight = 0.862745,0.898039,1,0.13725
SpotLightDir = 0.4074,0.67902
CamLight = 1,1,1,0.1923
CamLightMin = 0.4697
Glow = 1,1,1,0
GlowMax = 0
Fog = 0.2054
HardShadow = 0.66154 NotLocked
ShadowSoft = 19.6774
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.44156
X = 0.4,0.427451,0.498039,0.2233
Y = 1,0.694118,0.203922,1
Z = 0.8,0.78,1,0.0097
R = 0.4,0.7,1,-1
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = false
Cycles = 0.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
AntiAlias = 1 NotLocked
Detail = -2.78761
DetailAO = -1.00002
FudgeFactor = 0.44578
MaxRaySteps = 198
BoundingSphere = 24.528
Dither = 0
NormalBackStep = 0 NotLocked
Iterations = 30
ColorIterations = 10
ColoringType = 1
ColorScale = 2
ColorOffset = 1.7188
Scale = 1.24616
FoldingMode = 2
Fold = 2.54622,-2.84694,3
Julia = -2.74578,-1.93218,-2.54238
RotVector = 0.65218,0.08696,-0.6087
RotAngle = 27
ScaleVary = 0,-0.2258,0.0238
ScaleVaryStrength = 0.49091
RotVary = -0.02272,-0.70454,0.01136
RotVaryStrength = 0.44444
MinMaxScale = 1.15854,3
Fatness = 0.22642
AnimationFunction = 4
Speeds = 1,1,1
Amplitudes = 1,0,-1
UniformSpeed = false
UniformAmplitude = false
SpeedAdjust = 0.33077
AmplitudeAdjust = 0.19469
AmpVary = 0,-0.34246,0
AmpVaryStrength = 0.33582
SpeedVary = 0,0,0.3409
SpeedVaryStrength = 0.42
WaveAmp = 0.23404
WaveLength = 0.70732
WaveSpeed = 0.76471
WaveZoom = 0.76404
TransVector = 0,0,-1
TransSpeed = 0
ImpulseStrength = 0.8621
ImpulseRate = 3.2468
TRotVector = -1,0,0
TRotSpeed = 0
#endpreset

#preset OceanFungus
FOV = 0.54
Eye = -7.55487,-29.9023,-6.45962
Target = -4.83327,-20.4964,-4.42933
Up = -0.110659,-0.179049,0.977597
AntiAlias = 1 NotLocked
Detail = -2.76318
DetailAO = -1.43997
FudgeFactor = 0.46875
MaxRaySteps = 857
BoundingSphere = 24.528
Dither = 0.25654
NormalBackStep = 0 NotLocked
AO = 0,0,0,0.61728
Specular = 1.519
SpecularExp = 3.788
SpotLight = 0.862745,0.898039,1,0.13725
SpotLightDir = 0.5,0.625
CamLight = 1,1,1,0.1923
CamLightMin = 0.4697
Glow = 0.776471,1,0.815686,0.20667
GlowMax = 414
Fog = 0.22702
HardShadow = 0.66154 NotLocked
ShadowSoft = 19.6774
Reflection = 0 NotLocked
BaseColor = 0.784314,1,0.772549
OrbitStrength = 0.37662
X = 0.4,0.427451,0.498039,0.06796
Y = 1,0.694118,0.203922,1
Z = 0.8,0.78,1,0.1068
R = 0.4,0.7,1,-0.68628
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = true
Cycles = 1.61887
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 40
ColorIterations = 10
ColoringType = 2
ColorScale = 1.05264
ColorOffset = 0
Scale = 1.37948
FoldingMode = 3
Fold = -0.0612,0.30612,3
Julia = -1.39998,-1.21536,-2.41536
RotVector = 0.47928,-0.1361,-0.6568
RotAngle = 15
ScaleVary = 0.01176,0.70588,-0.1647
ScaleVaryStrength = 0.94697
RotVary = 0,0.37078,0.35956
RotVaryStrength = 1
MinMaxScale = 1.22013,1.5283
Fatness = 0
AnimationFunction = 4
Speeds = 1,1,-0.6464
Amplitudes = -0.60976,0.71952,1
UniformSpeed = false
UniformAmplitude = false
AmpVary = 1,-0.27586,0.36782
AmpVaryStrength = 0
SpeedVary = -0.55152,0.07878,0.18788
SpeedVaryStrength = 0.33071
WaveAmp = 0.23404
WaveLength = 0.70732
WaveSpeed = 0.76471
WaveZoom = 0.76404
TransVector = 1,0,0
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 0
TRotVector = 1,0,0
TRotSpeed = 0
SpeedAdjust = 0.50769
AmplitudeAdjust = 0.14159
#endpreset

#preset AlienFish
FOV = 0.35772
Eye = -23.3638,31.1387,24.6082
Target = -18.7177,23.8756,19.5426
Up = 0.459515,0.679942,-0.553441
AntiAlias = 1 NotLocked
Detail = -2.78761
DetailAO = -0.85715
FudgeFactor = 0.48193
MaxRaySteps = 242
BoundingSphere = 54.717
Dither = 0.47368
NormalBackStep = 1.3333 NotLocked
AO = 0,0,0,0.61728
Specular = 1.519
SpecularExp = 5.455
SpotLight = 0.862745,0.898039,1,0.37255
SpotLightDir = -0.3125,1
CamLight = 1,1,1,0.23076
CamLightMin = 0.13636
Glow = 1,1,1,0.45205
GlowMax = 474
Fog = 0.2037
HardShadow = 0.38462 NotLocked
ShadowSoft = 19.6774
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.44156
X = 0.4,0.427451,0.498039,0.53398
Y = 1,0.694118,0.203922,1
Z = 0.8,0.78,1,-0.2233
R = 0.4,0.7,1,0.5098
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = true
Cycles = 1.61887
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 35
ColorIterations = 29
ColoringType = 2
ColorScale = 0.26316
ColorOffset = 1.0938
Scale = 1.25742
FoldingMode = 3
Fold = 2.88234,2.52942,1.82352
Julia = -0.56436,0.2079,-3
RotVector = -0.14666,-0.01334,-0.01334
RotAngle = 16.362
ScaleVary = 0,-0.46236,-0.24732
ScaleVaryStrength = 1
RotVary = 0,-0.10892,0.62376
RotVaryStrength = 0.34921
MinMaxScale = 1.23171,1.39024
Fatness = 0.67924
AnimationFunction = 4
Speeds = 1,0.32692,1
Amplitudes = 1,-0.31034,-1
UniformSpeed = false
UniformAmplitude = false
AmpVary = 0,-1,1
AmpVaryStrength = 1
SpeedVary = -0.20454,0.27272,1
SpeedVaryStrength = 0.2
WaveAmp = 0.23404
WaveLength = 0.70732
WaveSpeed = 0.76471
WaveZoom = 0.76404
TransVector = 1,0,0
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 0
TRotVector = 1,0,0
TRotSpeed = 0
SpeedAdjust = 0.37736
AmplitudeAdjust = 0.05556
#endpreset

#preset Bottom
FOV = 0.54
Eye = -7.39072,-5.7382,3.25534
Target = -1.79597,-6.94279,-4.94514
Up = -0.638847,-0.700239,-0.318654
AO = 0,0,0,1
Specular = 0.5063
SpecularExp = 5.455
SpotLight = 0.862745,0.898039,1,0.23529
SpotLightDir = 0.09376,0.15626
CamLight = 1,1,1,0.15384
CamLightMin = 0.40909
Glow = 0.776471,1,0.815686,0.32877
GlowMax = 474
Fog = 0.88888
HardShadow = 0.66154 NotLocked
ShadowSoft = 19.6774
Reflection = 0 NotLocked
BaseColor = 0.784314,1,0.772549
OrbitStrength = 0.31169
X = 0.4,0.427451,0.498039,0.24272
Y = 1,0.694118,0.203922,1
Z = 0.8,0.78,1,0.2233
R = 0.4,0.7,1,-0.56862
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = true
Cycles = 1.92252
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
AntiAlias = 1 NotLocked
Detail = -2.47786
DetailAO = -1.21429
FudgeFactor = 0.46875
MaxRaySteps = 220
BoundingSphere = 24.528
Dither = 0.25654
NormalBackStep = 0 NotLocked
Iterations = 23
ColorIterations = 10
ColoringType = 2
ColorScale = 1.26316
ColorOffset = 2.3274
Scale = 1.37948
FoldingMode = 3
Fold = 0.8235,0.30612,3
Julia = -1.39998,-1.21536,-2.41536
RotVector = 0.06666,-0.1361,-0.6568
RotAngle = 110
ScaleVary = 0.01176,0.70588,-0.1647
ScaleVaryStrength = 0
RotVary = 0,0.37078,0.35956
RotVaryStrength = 0
MinMaxScale = 1,3
Fatness = 0
AnimationFunction = 4
Speeds = 1,1,-0.6464
Amplitudes = -0.60976,0.71952,1
UniformSpeed = false
UniformAmplitude = false
SpeedAdjust = 0.50769
AmplitudeAdjust = 0
AmpVary = 1,-0.27586,0.36782
AmpVaryStrength = 0
SpeedVary = -0.55152,0.07878,0.18788
SpeedVaryStrength = 0.33071
WaveAmp = 0.19149
WaveLength = 1
WaveSpeed = 0.34118
WaveZoom = 0.1573
TransVector = 1,0,0
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 0
TRotVector = 1,0,0
TRotSpeed = 0
#endpreset

#preset SierpDance
FOV = 0.52032
Eye = -18.5106,9.87251,-6.56905
Target = -11.939,2.91113,-3.67878
Up = 0.122741,-0.293159,-0.948152
AO = 0,0,0,1
Specular = 2.0253
SpecularExp = 7.273
SpotLight = 0.862745,0.898039,1,0.19608
SpotLightDir = 0.71876,-0.53124
CamLight = 1,1,1,0.5
CamLightMin = 0.4697
Glow = 0.776471,1,0.815686,0.20667
GlowMax = 414
Fog = 0.25926
HardShadow = 0.66154 NotLocked
ShadowSoft = 19.6774
Reflection = 0 NotLocked
BaseColor = 1,0.92549,0.72549
OrbitStrength = 0.48052
X = 0.4,0.427451,0.498039,1
Y = 1,0.694118,0.203922,0.28156
Z = 0.8,0.78,1,1
R = 0.4,0.7,1,1
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = true
Cycles = 1.92252
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
AntiAlias = 1 NotLocked
Detail = -2.60176
DetailAO = -0.92855
FudgeFactor = 0.44578
MaxRaySteps = 330
BoundingSphere = 24.528
Dither = 0.19298
NormalBackStep = 1.1667 NotLocked
Iterations = 33
ColorIterations = 24
ColoringType = 2
ColorScale = 0.23684
ColorOffset = 1.7188
Scale = 1.33664
FoldingMode = 1
Fold = 3,3,3
Julia = -3,0.68316,0.38616
RotVector = 0.84,0.49334,0.33334
RotAngle = 117
ScaleVary = 0,1,-0.69892
ScaleVaryStrength = 0.70909
RotVary = 0,0.0693,-0.14852
RotVaryStrength = 0.34921
MinMaxScale = 1,1.39024
Fatness = 0
AnimationFunction = 4
Speeds = 1,1,-0.6464
Amplitudes = 0.37932,-0.10344,0.7931
UniformSpeed = true
UniformAmplitude = false
SpeedAdjust = 0.24528
AmplitudeAdjust = 0.08333
AmpVary = 0.07216,0.36082,-0.50516
AmpVaryStrength = 0.40678
SpeedVary = 0,1,1
SpeedVaryStrength = 0.28
WaveAmp = 0.23404
WaveLength = 0.70732
WaveSpeed = 0.76471
WaveZoom = 0.76404
TransVector = 1,0,0
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 0
TRotVector = 1,0,0
TRotSpeed = 0
#endpreset


#preset Async
FOV = 0.4
Eye = -9.83491,11.2363,-13.4951
Target = -5.86233,5.86678,-6.05286
Up = 0.41953,-0.614997,-0.667657
AO = 0,0,0,0.70408
Specular = 1.4583
SpecularExp = 13.889
SpotLight = 1,1,1,0.41176
SpotLightDir = -0.03704,-0.58024
CamLight = 1,1,1,0.2029
CamLightMin = 0.42169
Glow = 1,1,1,0
GlowMax = 72
Fog = 0.272
HardShadow = 0.63415 NotLocked
ShadowSoft = 20
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.33766
X = 0.5,0.6,0.6,0.6699
Y = 1,0.6,0,0.57282
Z = 0.8,0.78,1,0.1068
R = 0.4,0.7,1,-0.07844
BackgroundColor = 0.243137,0.282353,0.301961
GradientBackground = 0
CycleColors = true
Cycles = 7.39072
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
AntiAlias = 1 NotLocked
Detail = -2.41591
DetailAO = -1.14289
FudgeFactor = 0.59036
MaxRaySteps = 56
BoundingSphere = 12
Dither = 0
NormalBackStep = 1 NotLocked
Iterations = 25
ColorIterations = 15
ColoringType = 2
ColorScale = 0.4301
ColorOffset = 2.4691
Scale = 1.38984
FoldingMode = 3
Fold = 1.58826,1.89078,-0.42858
Julia = -0.86442,-1.32204,-0.98022
RotVector = -0.43478,0.2826,-0.26086
RotAngle = 41.2056
ScaleVary = 0,-0.78494,-0.24732
ScaleVaryStrength = 0.85455
RotVary = 0,0,0.45238
RotVaryStrength = 0.28571
MinMaxScale = 1,3
Fatness = 0
AnimationFunction = 1
Speeds = 1,-0.82692,0.65384
Amplitudes = 1,0.4023,-1
UniformSpeed = false
UniformAmplitude = false
SpeedAdjust = 0.34146
AmplitudeAdjust = 0.04615
AmpVary = 0,-1,0.60824
AmpVaryStrength = 0.54237
SpeedVary = 0.29546,-0.52272,1
SpeedVaryStrength = 0.54
WaveAmp = 0
WaveLength = 0.70732
WaveSpeed = 0.76471
WaveZoom = 0.76404
TransVector = 1,0,0
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 0
TRotVector = 1,0,0
TRotSpeed = 0
#endpreset

#preset CloseUp
FOV = 0.98076
Eye = -4.13294,-4.94438,4.96938
Target = 5.5979,-4.61059,2.68913
Up = -0.224801,0.353592,-0.907564
AO = 0,0,0,1
Specular = 0.7792
SpecularExp = 7.547
SpotLight = 0.862745,0.898039,1,0.26531
SpotLightDir = 0.06452,-0.3871
CamLight = 1,1,1,0.12
CamLightMin = 0.40909
Glow = 0.776471,1,0.815686,0.25352
GlowMax = 484
Fog = 0.6415
HardShadow = 0.66154 NotLocked
ShadowSoft = 10.6666
Reflection = 0 NotLocked
BaseColor = 0.784314,1,0.772549
OrbitStrength = 0.5974
X = 0.4,0.427451,0.498039,0.37864
Y = 1,0.694118,0.203922,0.96116
Z = 0.8,0.78,1,0.7864
R = 0.4,0.7,1,0.21568
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = true
Cycles = 4.91165
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
AntiAlias = 1 NotLocked
Detail = -2.08509
DetailAO = -1.21429
FudgeFactor = 0.67188
MaxRaySteps = 220
BoundingSphere = 24.528
Dither = 0.25654
NormalBackStep = 0 NotLocked
Iterations = 30
ColorIterations = 25
ColoringType = 3
ColorScale = 0.43244
ColorOffset = 0
Scale = 1.37288
FoldingMode = 2
Fold = 0.7311,1.68906,3
Julia = -2.03388,0.61014,-1.98306
RotVector = 0.65218,0.28768,-1
RotAngle = 45.5436
ScaleVary = 0.01176,0.70588,-0.1647
ScaleVaryStrength = 0
RotVary = 0,0.37078,0.35956
RotVaryStrength = 0
MinMaxScale = 1,3
Fatness = 0.00204
AnimationFunction = 3
Speeds = 1,-0.55294,1
Amplitudes = 1,0.11764,1
UniformSpeed = true
UniformAmplitude = false
SpeedAdjust = 0.06349
AmplitudeAdjust = 0.08696
AmpVary = -1,-1,1
AmpVaryStrength = 0
SpeedVary = 0.56522,-0.2174,0.71014
SpeedVaryStrength = 0.45161
WaveAmp = 0.28
WaveLength = 0.39683
WaveSpeed = 0.34118
WaveZoom = 0.21429
TransVector = 1,0,0
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 0
TRotVector = 1,0,0
TRotSpeed = 0
#endpreset

#preset AquaBat
FOV = 0.59616
Eye = 6.11984,-2.49591,-11.5452
Target = 1.23248,-0.36768,-3.0844
Up = -0.286271,0.876581,-0.385861
AO = 0,0,0,1
Specular = 0.7792
SpecularExp = 13.208
SpotLight = 0.862745,0.898039,1,0.26531
SpotLightDir = -0.32258,-0.45162
CamLight = 1,1,1,0.12
CamLightMin = 0.40909
Glow = 0.776471,1,0.815686,0
GlowMax = 484
Fog = 0.24528
HardShadow = 0.7619 NotLocked
ShadowSoft = 18.6666
Reflection = 0 NotLocked
BaseColor = 0.784314,1,0.772549
OrbitStrength = 0.5974
X = 0.4,0.427451,0.498039,0.66666
Y = 1,0.694118,0.203922,1
Z = 0.8,0.78,1,0.64286
R = 0.4,0.7,1,0.21568
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = false
Cycles = 4.91165
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
AntiAlias = 1 NotLocked
Detail = -3.27663
DetailAO = -1.21429
FudgeFactor = 0.45313
MaxRaySteps = 220
BoundingSphere = 24.528
Dither = 0.25654
NormalBackStep = 0 NotLocked
Iterations = 30
ColorIterations = 13
ColoringType = 1
ColorScale = 1.1081
ColorOffset = 0
Scale = 1.28282
FoldingMode = 2
Fold = 3,0.96,3
Julia = -2.21214,-0.51516,-1.96968
RotVector = 0.58904,0.36986,-0.61644
RotAngle = 67.5
ScaleVary = 0,1,-0.05406
ScaleVaryStrength = 0.52778
RotVary = 0,-0.68292,-0.87804
RotVaryStrength = 0.36364
MinMaxScale = 1.1746,3
Fatness = 0.13794
AnimationFunction = 1
Speeds = 1,-0.38824,0.6
Amplitudes = 1,0.11764,1
UniformSpeed = true
UniformAmplitude = false
SpeedAdjust = 0.1746
AmplitudeAdjust = 0.13043
AmpVary = 0,1,-0.46154
AmpVaryStrength = 0.45
SpeedVary = 0,-0.24638,0.53624
SpeedVaryStrength = 0.41935
WaveAmp = 0
WaveLength = 0.63492
WaveSpeed = 0.34118
WaveZoom = 0.21429
TransVector = 1,0,0
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 0
TRotVector = 1,0,0
TRotSpeed = 0
#endpreset

#preset Beast
FOV = 0.35772
Eye = -17.0872,5.91552,-0.8296
Target = -9.50211,0.387375,2.62086
Up = -0.534461,-0.227922,0.809726
AntiAlias = 1 NotLocked
Detail = -2.66371
DetailAO = -1.07142
FudgeFactor = 0.37349
MaxRaySteps = 374
BoundingSphere = 26.415
Dither = 0.17544
NormalBackStep = 2.6667 NotLocked
AO = 0,0,0,1
Specular = 2.4051
SpecularExp = 5.455
SpotLight = 0.862745,0.898039,1,0.39216
SpotLightDir = -0.71874,1
CamLight = 1,1,1,0.38462
CamLightMin = 0.25758
Glow = 1,1,1,0
GlowMax = 474
Fog = 0.27778
HardShadow = 0.67692 NotLocked
ShadowSoft = 11.613
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 1
X = 0.4,0.427451,0.498039,1
Y = 1,0.694118,0.203922,1
Z = 0.8,0.78,1,0.06796
R = 0.4,0.7,1,-1
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = false
Cycles = 1.61887
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 20
ColorIterations = 11
ColoringType = 1
ColorScale = 1.28948
ColorOffset = 1.0938
Scale = 1.71288
FoldingMode = 2
Fold = 3,2.05884,3
Julia = -0.86136,-1.87128,-2.40594
RotVector = -1,-1,0.6
RotAngle = 38.1816
ScaleVary = 1,0,0
ScaleVaryStrength = 1
RotVary = -0.30694,0,1
RotVaryStrength = 0.34921
MinMaxScale = 1.47561,3
Fatness = 0
AnimationFunction = 3
Speeds = 1,-0.3077,1
Amplitudes = 1,0,-0.51724
UniformSpeed = false
UniformAmplitude = false
SpeedAdjust = 0.20732
AmplitudeAdjust = 0.21538
AmpVary = 0,0,-1
AmpVaryStrength = 1
SpeedVary = 0,1,1
SpeedVaryStrength = 0.32
WaveAmp = 0
WaveLength = 0.70732
WaveSpeed = 0.47059
WaveZoom = 0.76404
TransVector = 1,0,0
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 0
TRotVector = 1,0,0
TRotSpeed = 0
#endpreset

#preset Tree
FOV = 0.87804
Eye = -5.45838,8.99891,-4.09303
Target = -4.78625,2.18397,-11.3803
Up = 0.15776,0.728453,-0.666683
AntiAlias = 1 NotLocked
Detail = -2.60176
DetailAO = -1.42856
FudgeFactor = 0.20482
MaxRaySteps = 396
BoundingSphere = 100
Dither = 0
NormalBackStep = 0 NotLocked
AO = 0,0,0,0.86735
Specular = 0.3797
SpecularExp = 7.273
SpotLight = 0.862745,0.898039,1,0.15686
SpotLightDir = 0.15626,-0.59374
CamLight = 1,1,1,0.01496
CamLightMin = 0.44578
Glow = 1,1,1,0.20548
GlowMax = 412
Fog = 0.2963
HardShadow = 0 NotLocked
ShadowSoft = 0
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.49351
X = 1,1,1,0.72816
Y = 0.329412,0.27451,0.184314,0.3398
Z = 0.8,0.78,1,0.3398
R = 0.4,0.7,1,1
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0.1087
CycleColors = true
Cycles = 5.26424
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 25
ColorIterations = 25
Scale = 1.33664
FoldingMode = 3
Fold = 3,3,3
Julia = -1.93068,-1.03962,-3
RotVector = -0.06522,0.80434,-0.13044
RotAngle = -32.7276
ScaleVary = -0.05376,-0.24732,0.48388
ScaleVaryStrength = 0
RotVary = -0.16832,-0.70454,0.0495
RotVaryStrength = 0
MinMaxScale = 1,3
AnimationFunction = 3
Speeds = 0.48076,0.82692,0.51924
Amplitudes = 0.47126,-0.42528,1
UniformSpeed = true
UniformAmplitude = false
AmpVary = 1,1,1
AmpVaryStrength = 0
SpeedVary = 1,1,1
SpeedVaryStrength = 0.14
ColoringType = 2
Fatness = 0
SpeedAdjust = 0.19512
AmplitudeAdjust = 0.07692
WaveAmp = 0
WaveLength = 0.5
WaveSpeed = 0.5
WaveZoom = 0.5
TransVector = 1,0,0
TransSpeed = 0
ImpulseStrength = 0
ImpulseRate = 0
TRotVector = 1,0,0
TRotSpeed = 0
ColorScale = 0.15789
ColorOffset = 0.36364
#endpreset

#preset SwimmingExample
FOV = 0.4
Eye = 13.1055,9.91806,14.6828
Target = 4.41078,5.33532,12.8388
Up = 0.129629,-0.571875,0.810033
AO = 0,0,0,0.61728
Specular = 0.5063
SpecularExp = 1.818
SpotLight = 0.862745,0.898039,1,0.13725
SpotLightDir = -0.58024,-0.77778
CamLight = 1,1,1,0.1923
CamLightMin = 0.4697
Glow = 1,1,1,0
GlowMax = 0
Fog = 0.192
HardShadow = 0.66154 NotLocked
ShadowSoft = 19.6774
Reflection = 0 NotLocked
BaseColor = 1,1,1
OrbitStrength = 0.41558
X = 0,0,0,-0.04854
Y = 1,0.694118,0.203922,1
Z = 0.8,0.78,1,1
R = 1,0.333333,0,-0.09804
BackgroundColor = 0.14902,0.192157,0.203922
GradientBackground = 0
CycleColors = true
Cycles = 4.96027
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
AntiAlias = 1 NotLocked
Detail = -3.15931
DetailAO = -0.85715
FudgeFactor = 0.25301
MaxRaySteps = 374
BoundingSphere = 24.528
Dither = 0
NormalBackStep = 0 NotLocked
AnimationFunction = 3
UniformSpeed = true
UniformAmplitude = false
SpeedAdjust = 0.13415
AmplitudeAdjust = 0.66154
Scale = 1.59406
Fold = 3,1.88238,-3
Julia = -2.28714,-3,3
RotVector = 0.33334,1,1
RotAngle = -43.6356
Iterations = 18
ColorIterations = 7
ColoringType = 3
ColorScale = 0.43421
ColorOffset = 0.48484
FoldingMode = 2
ScaleVary = 0,0,1
ScaleVaryStrength = 1
RotVary = -0.42574,0,0.34654
RotVaryStrength = 0
MinMaxScale = 1.46341,3
Fatness = 0.09434
Speeds = 1,0.5,0.5
Amplitudes = -1,1,0
AmpVary = 0.4433,0,0
AmpVaryStrength = 0.38983
SpeedVary = 0.13636,0,0
SpeedVaryStrength = 0
WaveAmp = 0.32979
WaveLength = 0.80488
WaveSpeed = 0.70588
WaveZoom = 0.60674
TransVector = 0,0,-1
TransSpeed = 0.2069
ImpulseStrength = 1.7241
ImpulseRate = 2.5974
TRotVector = -0.06976,1,0
ImpulseOffset = 10
TRotSpeed = 3.21435
#endpreset