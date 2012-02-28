#include "2DJulia.frag"
#include "Complex.frag"

// Escape time fractals iterate a functions for each point
// in the plane, and check if the sequence generated converges.
// 
// The "2DJulia.frag" helper file makes it easy to generate
// these kind of systems.
//
// Just implement the 'formula' function below.
// It is possible to draw Mandelbrots and Julias
// and customize the coloring.
//
// Here is an example of a Mandelbrot:

vec2 formula(vec2 z, vec2 offset) {
	z = cMul(z,z)+offset;
	return z;
}
