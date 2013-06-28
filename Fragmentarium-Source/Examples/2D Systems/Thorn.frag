#group Thorn
#include "Progressive2DJulia.frag"

// Thorn fractal (first seen at Softology's blog)
// http://paulbourke.net/fractals/thorn/
vec2 formula(vec2 z,vec2 c) {
	return vec2(z.x/cos(z.y),z.y/sin(z.x))+c;
}

#preset Default
Gamma = 2.042
ToneMapping = 3
Exposure = 0.4878
Brightness = 1.05265
Contrast = 1.43135
Saturation = 2.38865
Center = -1.70238,7.44304e-05
Zoom = 0.648883
AARange = 2
AAExp = 1
GaussianAA = true
Iterations = 90
PreIterations = 0
R = 0.47985
G = 0.42857
B = 0.32847
C = 2
Julia = true
JuliaX = 0.102
JuliaY = -0.04517
ShowMap = false
MapZoom = 2.1
EscapeSize = 5.12666
ColoringType = 0
ColorFactor = 0.50667
#endpreset
