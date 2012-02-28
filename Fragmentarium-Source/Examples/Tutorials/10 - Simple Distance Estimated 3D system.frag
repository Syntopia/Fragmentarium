#include "DE-Raytracer.frag"

// This is an example of 
// a simple distance estimated system.
//
// The function "DE" must return 
// the distance to the closest 
// point on any objects in any direction.

float  DE(vec3 z) {
	float d = (length(z-vec3(1.0,0.0,0.0))-1.0); // A sphere
	d = max(d,- (length(z.xy-vec2(1.,0.0))-0.4)); // minus a tube
	d = max(d,- (length(z.yz-vec2(0.,0.0))-0.4)); // minus a tube
	d = max(d,- (length(z.xz-vec2(1.,0.0))-0.4)); // minus a tube
	d = min(d, z.x); // plus a ground plane
       d = min(d, length(z.yz-vec2(1.,1.0))-0.3); // plus a  tube
	return d;
}

#preset Default
FOV = 0.4
Eye = 4.76415,-4.09381,3.08941
Target = -1.17452,2.39263,-1.67067
Up = 0.803593,0.507247,-0.311349
#endpreset
