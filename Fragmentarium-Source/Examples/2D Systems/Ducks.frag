#group Ducks
#include "2DJulia.frag"
#include "Complex.frag"
#info Ducks (Samuel Monnier)

// 'Ducks' fractal by Samuel Monnier
// (Implementation by Syntopia)
// See http://www.algorithmic-worlds.net/blog/blog.php?Post=20110227
vec2 formula(vec2 z, vec2 c) {
    return cLog(vec2(z.x,abs(z.y)))+c;
}

#preset Principal Ducks Structure
Center = -0.103356,4.76826
Zoom = 0.502601
Iterations = 69
PreIterations = 0
R = 0.50625
G = 0.3375
B = 0.32919
C = 0.2
Julia = false
JuliaX = 0
JuliaY = 5
#endpreset

#preset Bone Structure
Center = 0.0108,5.099
Zoom = 27.643
Iterations = 54
PreIterations = 1
R = 0.54374
G = 0.4125
B = 0.37267
C = 0.7875
Julia = false
JuliaX = 0
JuliaY = 5
#endpreset

#preset Pattern 1
Center = -1.5922,0.0692
Zoom = 0.166
Iterations = 91
PreIterations = 12
R = 0.6625
G = 0.4125
B = 0.52174
C = 0.7875
Julia = true
JuliaX = 0.23528
JuliaY = 5.5384
#endpreset

#preset Default
Center = 0,0
Zoom = 1
AntiAliasScale = 1
AntiAlias = 2
Iterations = 200
PreIterations = 1
R = 0
G = 0.4
B = 0.7
C = 1
Julia = true
JuliaX = 0.23528
JuliaY = 5.5384
ShowMap = true
MapZoom = 2.1
EscapeSize = 5
ColoringType = 0
ColorFactor = 0.5
#endpreset


#preset Cell
Center = -490.172,-11.2585
Zoom = -0.000334263
AntiAliasScale = 1
AntiAlias = 2
Iterations = 184
PreIterations = 4
R = 0.61875
G = 0.6125
B = 0.47205
C = 1.02522
Julia = true
JuliaX = 0.36469
JuliaY = 5.89285
ShowMap = true
MapZoom = 2.1
EscapeSize = 5
ColoringType = 0
ColorFactor = 0.5
#endpreset

#preset Spooky
Center = 0.288639,-0.855656
Zoom = 206.094
AntiAliasScale = 1
AntiAlias = 2
Iterations = 261
PreIterations = 6
R = 0.69375
G = 0.6125
B = 0.5031
C = 0.9625
Julia = true
JuliaX = 0.38824
JuliaY = 5.89285
ShowMap = true
MapZoom = 2.1
EscapeSize = 5
ColoringType = 0
ColorFactor = 0.5
#endpreset


#preset todo
Center = 0.0983951,0.314843
Zoom = 0.198006
AntiAliasScale = 1
AntiAlias = 2
Iterations = 54
PreIterations = 9
R = 0.44375
G = 0.55
B = 0.62112
C = 0.775
Julia = true
JuliaX = -0.48238
JuliaY = 5
#endpreset
