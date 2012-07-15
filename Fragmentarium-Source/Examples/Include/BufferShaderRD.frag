#donotrun
// This is a simple shader for rendering images
// from an accumulated buffer.

#vertex

varying vec2 coord;

void main(void)
{
	gl_Position =  gl_Vertex;
	coord = (gl_ProjectionMatrix*gl_Vertex).xy;
}

#endvertex

uniform float Gamma;
uniform vec3 Exposure;
uniform float Brightness;
uniform float Contrast;
uniform float Saturation;

uniform vec2 pixelSize;
uniform vec3 Light; 

/*
** Based on: http://mouaif.wordpress.com/2009/01/22/photoshop-gamma-correction-shader/
**
** Contrast, saturation, brightness
** Code of this function is from TGM's shader pack
** http://irrlicht.sourceforge.net/phpBB2/viewtopic.php?t=21057
*/
// For all settings: 1.0 = 100% 0.5=50% 1.5 = 150%
vec3 ContrastSaturationBrightness(vec3  color, float brt, float sat, float con)
{
	const vec3 LumCoeff = vec3(0.2125, 0.7154, 0.0721);
	vec3 AvgLumin = vec3(0.5);
	vec3 brtColor = color * brt;
	float intensityf = dot(brtColor, LumCoeff);
	vec3 intensity = vec3(intensityf, intensityf, intensityf);
	vec3 satColor = mix(intensity, brtColor, sat);
	vec3 conColor = mix(AvgLumin, satColor, con);
	return conColor;
}
uniform float Slope;
varying vec2 coord;
uniform sampler2D frontbuffer;
void main() {
	vec2 pos = (coord+vec2(1.0))/2.0;
	vec4 tex = texture2D(frontbuffer, pos);
	

       vec3 e = vec3(pixelSize.x, pixelSize.y, 0.0);
e = vec3(1.0,1.0,0.0)/740.0;
	vec4 texN = texture2D(frontbuffer, pos+e.xz);
	vec4 texS = texture2D(frontbuffer, pos-e.xz);
	vec4 texE = texture2D(frontbuffer, pos+e.zy);
	vec4 texW = texture2D(frontbuffer, pos-e.zy);

	vec3 n1 = vec3(2.0*e.x, 0.0, (texN.r-texS.r)*Slope);	
	vec3 n2 = vec3(0.0, 2.0*e.y, (texE.r-texW.r)*Slope);
	vec3 n = cross(n1,n2);
	n = normalize(n);

	vec3 c = mod(tex.xyz,1.1);
	c = c*Exposure;
	
	c=c* clamp( clamp(dot(n,Light),0.0,1.0),0.0,1.0);

	c = pow(c, vec3(1.0/Gamma));
	
	//c =  (texN-texS)*Exposure;
	
	c = ContrastSaturationBrightness(c, Brightness, Saturation, Contrast);
	gl_FragColor = vec4(c,1.0);
}
