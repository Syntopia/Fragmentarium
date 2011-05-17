#group Kaliset
#include "2DJulia.frag"
#info Kaliset

//  Fractal by Kali (Kaliset? Kaliduck?)
// (Implementation by Syntopia)
// http://www.fractalforums.com/new-theories-and-research/very-simple-formula-for-fractal-patterns/msg31800/#msg31800

uniform float MinRadius; slider[0,0,10]
uniform float Scaling; slider[-5,0,5]

vec2 formula(vec2 z,vec2 c) {

	float m =dot(z,z);

	if (m<MinRadius) {
		z = abs(z)/(MinRadius*MinRadius);
	}else {
		z = abs(z)/m*Scaling;
	}
	return z+c;
}

#preset Default
Center = -0.00423807,-0.00285229
Zoom = 3.07152
AntiAliasScale = 1
AntiAlias = 2
Iterations = 40
PreIterations = 1
R = 0
G = 0.4
B = 0.7
C = 1
Julia = true
ShowMap = true
MapZoom = 2.1
MinRadius = 0
Scaling = -1.9231
JuliaX = 1.83071
JuliaY = 1.63084
#endpreset

#preset P1
Center = -0.245621,-0.0387084
Zoom = 0.255094
AntiAliasScale = 1
AntiAlias = 2
Iterations = 46
PreIterations = 0
R = 0.08696
G = 0.4
B = 0.7
C = 0.57972
Julia = true
JuliaX = 0.13193
JuliaY = 1.18487
ShowMap = false
MapZoom = 2.1
EscapeSize = 5.62793
MinRadius = 0
Scaling = -1.9231
#endpreset
