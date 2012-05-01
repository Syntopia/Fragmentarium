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
uniform int ToneMapping;
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
	vec3 c = tex.xyz/tex.a;

	c = pow(c, vec3(1.0/Gamma));

	
	if (ToneMapping==1) {
		// Linear
	       c = c*Exposure;
	} else if (ToneMapping==2) {
		// ExponentialExposure
	       c = vec3(1.0)-exp(-c*Exposure);
	} else if (ToneMapping==3) {
		// Filmic: http://filmicgames.com/archives/75
	      c*=Exposure;
            vec3 x = max(vec3(0.),c-vec3(0.004));
             c = (x*(6.2*x+.5))/(x*(6.2*x+1.7)+0.06);
	} else if (ToneMapping==4) {
		// Reinhart
	      c*=Exposure;
             c = c/(1.+c);
	}

      
	c = ContrastSaturationBrightness(c, Brightness, Saturation, Contrast);
	gl_FragColor = vec4(c,1.0);
}
