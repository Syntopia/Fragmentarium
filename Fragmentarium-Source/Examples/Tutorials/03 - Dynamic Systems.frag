#include "2D.frag"

// It is possible to change variables
// based on a special uniform 'time' variable.
//
// To see this in action, you must
// change the Render mode to 'Continuous' - 
// otherwise the system will only render changes 
// when something changes.

#group MySystem

uniform float X; slider[0,1,10]
uniform float Y; slider[0,1,10]
uniform float time;

vec3 color(vec2 c) {
	return vec3(cos(c.x*X+time)+sin(c.y*Y+time*2.0),
		sin(c.x*Y)+cos(c.y*X+time),
		sin(c.x*c.y+time));
}

#preset Default
Center = -1.87816,-0.786641
Zoom = 0.214943
AntiAliasScale = 1
AntiAlias = 1
X = 5.0382
Y = 3.0534
#endpreset
