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
uniform float Exposure;
uniform float Brightness;
uniform float Contrast;
uniform float Saturation;
uniform bool ExponentialExposure;
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

varying vec2 coord;
uniform sampler2D frontbuffer;
void main() {
	vec2 pos = (coord+vec2(1.0))/2.0;
	vec4 tex = texture2D(frontbuffer, pos);
	vec3 c =( tex.xyz)/1.0;
/*
if (c.x<Contrast) {
gl_FragColor = vec4(1.0,0.0,0.0,1.0);
return;
}*/
c = log(c);
	c = pow(c, vec3(Gamma));

	if (ExponentialExposure) {
		c = vec3(1.0)-exp(-c*Exposure);
	} else {
		c = c*Exposure;
		c = c/(vec3(1.0)+c);
	}
	c = ContrastSaturationBrightness(c, Brightness, Saturation, Contrast);
	gl_FragColor = vec4(c,1.0);
}
