#group Burning Ship
#include "2DJulia.frag"
#include "Complex.frag"

//  Burning Ship Fractal
// (Implementation by Syntopia)

uniform float MinRadius; slider[0,0,10]
uniform float Scaling; slider[-5,0,5]

vec2 formula(vec2 z) {
	  z = abs(z);
   	z = cMul(z,z);

 z.y = -z.y;
	return z;
}

#preset Default
Center = -1.20902,0.0353328
Zoom = 21.6234
AntiAliasScale = 1
AntiAlias = 2
Iterations = 108
PreIterations = 20
R = 0
G = 0.73188
B = 0.07194
C = 0.27142
Julia = false
JuliaX = -1.2
JuliaY = 1.63084
ShowMap = true
MapZoom = 2.1
EscapeSize = 4.22081
MinRadius = 0
Scaling = -1.9231
#endpreset
