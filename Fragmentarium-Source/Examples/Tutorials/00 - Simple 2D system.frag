#include "2D.frag"

// The simplest way to draw something in Fragmentarium,
// is to include the "2D.frag" header.
//
// Now, we can implement a simple 'color' function,
// which for each point in the plane returns a RGB color.
//
// Notice, that you can zoom using the mouse or the keyboard.
// (A,S,D,W,Q,E,1,3)

vec3 color(vec2 c) {
	return vec3(cos(c.x),sin(c.y),sin(c.x*c.y));
}
