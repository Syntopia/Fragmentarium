#include "Progressive2D.frag"
#include "Complex.frag"

// An example of using progressive rendering.
// Bbuffers are set up by the 'Progressive2D' fragment.
//
// Remember to set 'Render mode' to 'Continous'.
// Progressive rendering, makes very high-quality AA possible.
// Notice, that this is a difficult image to render, due to very high frequency components.

vec3 color(vec2 v) {
	vec2 p = (viewCoord+vec2(1.0))/2.0;
	p=p/pixelSize;
	
	if (p.y<40.0) {
		return vec3(pow(0.73,Gamma));
	}
	float r = dot(v,v);
	float a = 1.0;
	if (mod(r,1.0)<0.5) a =1.0-a;
	if (v.y>0) a = 1.0-a;
	return vec3(a);
}




#preset Default
Center = 0.0727965,-0.192122
Zoom = 0.284263
AntiAliasScale = 1
Gamma = 0.4545
ExponentialExposure = false
Exposure = 1.3
Brightness = 1
Contrast = 1
Saturation = 1
AARange = 4.65655
AAExp = 1.89429
GaussianAA = true
#endpreset
