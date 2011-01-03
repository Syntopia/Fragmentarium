// Write fragment code here...
float DE(vec3 z);
#replace "float DE(" "float DE1("
#include "Menger.frag"
#replace "Iterations" "Iterations2"
#replace "Scale" "Scale2"
#replace "rotVector" "rotVector2"
#replace "rotAngle" "rotAngle2"
#replace "Offset" "Offset2"
#replace "rot " "rot2 "
#replace "float DE(" "float DE2("
#includeonly "Menger.frag"
#replace "float DE(" "float DE("

float DE(vec3 z) {
   return max(DE1(z),DE2(z));
}