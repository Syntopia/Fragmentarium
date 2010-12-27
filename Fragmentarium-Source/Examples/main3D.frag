// main() has to go after all other method and variable declarations

void main() {
	vec3 color = vec3(0,0,0);
	for (int x = 1; x<=AntiAlias; x++) {
		float  dx =  AntiAliasScale*(float(x)-1.0)/float(AntiAlias);
		
		for (int y = 1; y<=AntiAlias; y++) {
			float dy = AntiAliasScale*(float(y)-1.0)/float(AntiAlias);
			color += trace(from+fromDx*dx+fromDy*dy,to+toDx*dx+toDy*dy);
		}
	}
	gl_FragColor = vec4(color, 1.0)/float(AntiAlias*AntiAlias);
}