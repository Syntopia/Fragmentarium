#donotrun

// Atmospheric scattering model
//
// IMPORTANT COPYRIGHT INFO:
// -----------------------------------
// The license of this fragment is not completely clear to me, but for all I
// can tell this shader derives from the MIT licensed source given below.
//
// This fragment derives from this shader: http://glsl.herokuapp.com/e#9816.0
// written by Martijn Steinrucken: countfrolic@gmail.com
//
// Which in turn contained the following copyright info:
// Code adapted from Martins:
// http://blenderartists.org/forum/showthread.php?242940-unlimited-planar-reflections-amp-refraction-%28update%29
//
// Which in turn originates from:
// https://github.com/SimonWallner/kocmoc-demo/blob/RTVIS/media/shaders/sky.frag
// where it was MIT licensed:
// https://github.com/SimonWallner/kocmoc-demo/blob/RTVIS/README.rst
#group Sky
uniform float turbidity; slider[1,2,16]

const float mieCoefficient = 0.005;
const float mieDirectionalG = 0.80;


// constants for atmospheric scattering
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;

const float n = 1.0003; // refractive index of air
const float N = 2.545E25; // number of molecules per unit volume for air at
// 288.15K and 1013mb (sea level -45 celsius)

// wavelength of used primaries, according to preetham
const vec3 primaryWavelengths = vec3(680E-9, 550E-9, 450E-9);

// mie stuff
// K coefficient for the primaries
const vec3 K = vec3(0.686, 0.678, 0.666);
const float v = 4.0;

// optical length at zenith for molecules
const float rayleighZenithLength = 8.4E3;
const float mieZenithLength = 1.25E3;
const vec3 up = vec3(0.0, 0.0, 1.0);

const float sunIntensity = 1000.0;

// Angular sun size - physical sun is 0.53 degrees
uniform float sunSize; slider[0,1,10]

 float sunAngularDiameterCos = cos(sunSize*pi/180.0);

// earth shadow hack
const float cutoffAngle = pi/1.95;
const float steepness = 1.5;

float RayleighPhase(float cosViewSunAngle)
{
	return (3.0 / (16.0*pi)) * (1.0 + pow(cosViewSunAngle, 2.0));
}

vec3 totalMie(vec3 primaryWavelengths, vec3 K, float T)
{
	float c = (0.2 * T ) * 10E-18;
	return 0.434 * c * pi * pow((2.0 * pi) / primaryWavelengths, vec3(v - 2.0)) * K;
}

float hgPhase(float cosViewSunAngle, float g)
{
	return (1.0 / (4.0*pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0*g*cosViewSunAngle + pow(g, 2.0), 1.5));
}

float SunIntensity(float zenithAngleCos)
{
	return sunIntensity * max(0.0, 1.0 - exp(-((cutoffAngle - acos(zenithAngleCos))/steepness)));
}

uniform vec2 SunPos; slider[(0,0),(0,0.2),(1,1)]
uniform float SkyFactor; slider[0,1,100]
vec3 fromSpherical(vec2 p) {
	return vec3(
		cos(p.x)*sin(p.y),
		sin(p.x)*sin(p.y),
		cos(p.y));
}
uniform float time;
vec3 sunDirection = normalize(fromSpherical((SunPos-vec2(0.0,0.5))*vec2(6.28,3.14)));
	
vec3 sun(vec3 viewDir)
{
	
	// Cos Angles
	float cosViewSunAngle = dot(viewDir, sunDirection);
	float cosSunUpAngle = dot(sunDirection, up);
	float cosUpViewAngle = dot(up, viewDir);

	float sunE = SunIntensity(cosSunUpAngle);  // Get sun intensity based on how high in the sky it is
	// extinction (asorbtion + out scattering)
	// rayleigh coeficients
	vec3 rayleighAtX = vec3(5.176821E-6, 1.2785348E-5, 2.8530756E-5);
	
	// mie coefficients
	vec3 mieAtX = totalMie(primaryWavelengths, K, turbidity) * mieCoefficient;
	
	// optical length
	// cutoff angle at 90 to avoid singularity in next formula.
	float zenithAngle = max(0.0, cosUpViewAngle);
	
	float rayleighOpticalLength = rayleighZenithLength / zenithAngle;
	float mieOpticalLength = mieZenithLength / zenithAngle;
	
	
	// combined extinction factor
	vec3 Fex = exp(-(rayleighAtX * rayleighOpticalLength + mieAtX * mieOpticalLength));
	
	// in scattering
	vec3 rayleighXtoEye = rayleighAtX * RayleighPhase(cosViewSunAngle);
	vec3 mieXtoEye = mieAtX *  hgPhase(cosViewSunAngle, mieDirectionalG);
	
	vec3 totalLightAtX = rayleighAtX + mieAtX;
	vec3 lightFromXtoEye = rayleighXtoEye + mieXtoEye;
	
	vec3 somethingElse = sunE * (lightFromXtoEye / totalLightAtX);
	
	vec3 sky = somethingElse * (1.0 - Fex);
	sky *= mix(vec3(1.0),pow(somethingElse * Fex,vec3(0.5)),clamp(pow(1.0-dot(up, sunDirection),5.0),0.0,1.0));
	// composition + solar disc
	
//	float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosViewSunAngle);
	float sundisk = 
		sunAngularDiameterCos < cosViewSunAngle ? 1.0 : 0.0;
	//	smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosViewSunAngle);
	vec3 sun = (sunE * 19000.0 * Fex)*sundisk;
	
	return 0.01*sun;
}

vec3 sky(vec3 viewDir)
{
	
	// Cos Angles
	float cosViewSunAngle = dot(viewDir, sunDirection);
	float cosSunUpAngle = dot(sunDirection, up);
	float cosUpViewAngle = dot(up, viewDir);
	
	float sunE = SunIntensity(cosSunUpAngle);  // Get sun intensity based on how high in the sky it is
	// extinction (asorbtion + out scattering)
	// rayleigh coeficients
	vec3 rayleighAtX = vec3(5.176821E-6, 1.2785348E-5, 2.8530756E-5);
	
	// mie coefficients
	vec3 mieAtX = totalMie(primaryWavelengths, K, turbidity) * mieCoefficient;
	
	// optical length
	// cutoff angle at 90 to avoid singularity in next formula.
	float zenithAngle = max(0.0, cosUpViewAngle);
	
	float rayleighOpticalLength = rayleighZenithLength / zenithAngle;
	float mieOpticalLength = mieZenithLength / zenithAngle;
	
	
	// combined extinction factor
	vec3 Fex = exp(-(rayleighAtX * rayleighOpticalLength + mieAtX * mieOpticalLength));
	
	// in scattering
	vec3 rayleighXtoEye = rayleighAtX * RayleighPhase(cosViewSunAngle);
	vec3 mieXtoEye = mieAtX *  hgPhase(cosViewSunAngle, mieDirectionalG);
	
	vec3 totalLightAtX = rayleighAtX + mieAtX;
	vec3 lightFromXtoEye = rayleighXtoEye + mieXtoEye;
	
	vec3 somethingElse = sunE * (lightFromXtoEye / totalLightAtX);
	
	vec3 sky = somethingElse * (1.0 - Fex);
	sky *= mix(vec3(1.0),pow(somethingElse * Fex,vec3(0.5)),clamp(pow(1.0-dot(up, sunDirection),5.0),0.0,1.0));
	// composition + solar disc
	
	float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosViewSunAngle);
	vec3 sun = (sunE * 19000.0 * Fex)*sundisk;
	
	return SkyFactor*0.01*(sky);
}

vec3 sunsky(vec3 viewDir)
{
	
	// Cos Angles
	float cosViewSunAngle = dot(viewDir, sunDirection);
	float cosSunUpAngle = dot(sunDirection, up);
	float cosUpViewAngle = dot(up, viewDir);
		if (sunAngularDiameterCos == 1.0) {
	 return vec3(1.0,0.0,0.0);	
}
	float sunE = SunIntensity(cosSunUpAngle);  // Get sun intensity based on how high in the sky it is
	// extinction (asorbtion + out scattering)
	// rayleigh coeficients
	vec3 rayleighAtX = vec3(5.176821E-6, 1.2785348E-5, 2.8530756E-5);
	
	// mie coefficients
	vec3 mieAtX = totalMie(primaryWavelengths, K, turbidity) * mieCoefficient;
	
	// optical length
	// cutoff angle at 90 to avoid singularity in next formula.
	float zenithAngle = max(0.0, cosUpViewAngle);
	
	float rayleighOpticalLength = rayleighZenithLength / zenithAngle;
	float mieOpticalLength = mieZenithLength / zenithAngle;
	
	
	// combined extinction factor
	vec3 Fex = exp(-(rayleighAtX * rayleighOpticalLength + mieAtX * mieOpticalLength));
	
	// in scattering
	vec3 rayleighXtoEye = rayleighAtX * RayleighPhase(cosViewSunAngle);
	vec3 mieXtoEye = mieAtX *  hgPhase(cosViewSunAngle, mieDirectionalG);
	
	vec3 totalLightAtX = rayleighAtX + mieAtX;
	vec3 lightFromXtoEye = rayleighXtoEye + mieXtoEye;
	
	vec3 somethingElse = sunE * (lightFromXtoEye / totalLightAtX);
	
	vec3 sky = somethingElse * (1.0 - Fex);
	sky *= mix(vec3(1.0),pow(somethingElse * Fex,vec3(0.5)),clamp(pow(1.0-dot(up, sunDirection),5.0),0.0,1.0));
	// composition + solar disc
	
	float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosViewSunAngle);
	vec3 sun = (sunE * 19000.0 * Fex)*sundisk;
	
	return 0.01*(sun+sky);
}
