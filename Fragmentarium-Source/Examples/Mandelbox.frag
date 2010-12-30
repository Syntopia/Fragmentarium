#info Mandelbox Distance Estimator (Rrrola's version).
#include "include/DE-Raytracer.frag"
#group Mandelbox

/*
This distance estimator was created by Rrrola, and is part of Boxplorer:
http://rrrola.wz.cz/

Copyright 1998-2009 Jan Kadlec

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
*/

// Number of fractal iterations.
uniform int iters;  slider[0,13,100]   
float minRad2 =  0.25;

// Scale parameter. A perfect Menger is 3.0
uniform float Scale;  slider[-3.0,3.0,5.0]
vec4 scale = vec4(Scale, Scale, Scale, abs(Scale)) / minRad2;

// precomputed constants

float absScalem1 = abs(Scale - 1.0);
float AbsScaleRaisedTo1mIters = pow(abs(Scale), float(1-iters));

// Compute the distance from `pos` to the Mandelbox.
float DE(vec3 pos) {
	vec4 p = vec4(pos,1), p0 = p;  // p.w is the distance estimate
	
	for (int i=0; i<iters; i++) {
		p.xyz = clamp(p.xyz, -1.0, 1.0) * 2.0 - p.xyz;  // min;max;mad
		float r2 = dot(p.xyz, p.xyz);
		p *= clamp(max(minRad2/r2, minRad2), 0.0, 1.0);  // dp3,div,max.sat,mul
		p = p*scale + p0;
	}
	return ((length(p.xyz) - absScalem1) / p.w - AbsScaleRaisedTo1mIters);
}

