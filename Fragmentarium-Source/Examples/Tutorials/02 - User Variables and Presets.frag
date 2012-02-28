#include "2D.frag"

// It is easy to create custom variables,
// and tie them to sliders in the user interface.
//
// Hint: use the context menu to quickly
// insert templates for different variable types.
// Here you can also see the different types 
// of variables.

// Organize controls by grouping them 
#group MySystem

// Creates a floating point variable,
// with a slider with minimum = 0,
// default = 1, and maximum 10.
uniform float X; slider[0,1,10]
uniform float Y; slider[0,1,10]

// Use the variable like any other in the code
// (But don't assign to them)
vec3 color(vec2 c) {
	return vec3(cos(c.x*X)+sin(c.y*Y),
		sin(c.x*Y)+cos(c.y*X),
		sin(c.x*c.y));
}

// It is possible to store one or more user variable
// settings in a Preset.
//
// Preset are parsed at build time, and will
// appear in the drop-down box in the Parameter 
// window, where they can be quickly applied.

// Presets with the name 'Default'
// will be automatically assigned,
// when the system is built the first time.
#preset Default
Center = -0.221053,0.488189
Zoom = 0.186907
AntiAliasScale = 1
AntiAlias = 1
X = 1.2977
#endpreset

// Create presets by using the
// 'Copy to Clipboard' button in the 
// Parameter window.
#preset Preset 2
Center = -0.221053,0.488189
Zoom = 0.335658
AntiAliasScale = 1
AntiAlias = 1
X = 6.8702
Y = 0.3053
Y = 6.3359
#endpreset

