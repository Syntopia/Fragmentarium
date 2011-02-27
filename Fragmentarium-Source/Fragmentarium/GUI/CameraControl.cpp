#include "CameraControl.h"
#include "MainWindow.h"
#include "VariableWidget.h"
#include "../../ThirdPartyCode/glextensions.h"

using namespace SyntopiaCore::Math;
using namespace SyntopiaCore::Logging;

#include <QWheelEvent>
#include <QStatusBar>
#include <QMenu>
#include <QVector2D>

#include <QFileInfo>

namespace Fragmentarium {
	namespace GUI {

		Camera3D::Camera3D(QStatusBar* statusBar) : statusBar(statusBar) {
			reset(); 
		};

		Camera3D::~Camera3D() {
		}

		QVector<VariableWidget*> Camera3D::addWidgets(QWidget* /*group*/, QWidget* /*parent*/) {
			QVector<VariableWidget*> w;
			return w;
		}

		void Camera3D::connectWidgets(VariableEditor* ve) {
			eye = dynamic_cast<Float3Widget*>(ve->getWidgetFromName("Eye"));
			if (!eye) WARNING("Could not find Eye interface widget");
			target = dynamic_cast<Float3Widget*>(ve->getWidgetFromName("Target"));
			if (!target) WARNING("Could not find Target interface widget");
			up = dynamic_cast<Float3Widget*>(ve->getWidgetFromName("Up"));
			if (!up) WARNING("Could not find Up interface widget");
			fov = dynamic_cast<FloatWidget*>(ve->getWidgetFromName("FOV"));
			if (!fov) WARNING("Could not find FOV interface widget");
		}

		void Camera3D::printInfo() {
			INFO("Camera: XXX.");
		}

		void Camera3D::reset() { 
			mouseDown = Vector3f(0,0,-1);
		}


		bool Camera3D::mouseMoveEvent(QMouseEvent* e, int w, int h) {
			if (!up || !target || !eye || !fov) return false;
			Vector3f pos = Vector3f(e->pos().x()/(float(w)),e->pos().y()/(float(h)),0.0);
			Vector3f direction = (target->getValue()-eye->getValue());
			Vector3f right = Vector3f::cross(direction.normalized(), up->getValue()).normalized();

			if (e->type() ==  QEvent::MouseButtonPress) {
				mouseDown = pos;
				upDown = up->getValue();
				targetDown = target->getValue();
				eyeDown = eye->getValue();
				fovDown = fov->getValue();
			} else if (e->type() ==  QEvent::MouseButtonRelease) {
				mouseDown = Vector3f(0,0,-1);
			}
			
			if (mouseDown.z()!=-1 && e->buttons()!=Qt::NoButton) {
				Vector3f dp = mouseDown-pos;

				double rotateSpeed = 1.0;
				Vector3f directionDown = targetDown-eyeDown;
				Vector3f rightDown = Vector3f::cross(directionDown.normalized(), upDown).normalized();

				if (e->buttons() == Qt::RightButton) {
					Vector3f offset = -upDown*dp.y()*10.0*rotateSpeed + rightDown*dp.x()*10.0*rotateSpeed;
					eye->setValue(eyeDown+offset);
					target->setValue(targetDown+offset);
					return true;
				} else if (e->buttons() == (Qt::RightButton | Qt::LeftButton)  ) {
					Vector3f newEye = eyeDown -directionDown*dp.x()*1.0*rotateSpeed;
					fov->setValue(fovDown* (1-0.1*dp.y()));
					eye->setValue(newEye);
					target->setValue(directionDown +newEye);
					return true;
				} else {
					// Left mouse button
					if (QApplication::keyboardModifiers() == Qt::ControlModifier) {
						Matrix4f mx = Matrix4f::Rotation(upDown, -dp.x()*rotateSpeed);
						Matrix4f my = Matrix4f::Rotation(rightDown, -dp.y()*rotateSpeed);
						Vector3f oDir = (my*mx)*(-eyeDown);
						eye->setValue(-oDir);
						target->setValue( (my*mx)*directionDown-oDir);
						up->setValue((my*mx)*upDown);
					} else if ((QApplication::keyboardModifiers() == Qt::ShiftModifier )
								 || (QApplication::keyboardModifiers() == Qt::NoModifier)
								  || (QApplication::keyboardModifiers() == (Qt::ShiftModifier | Qt::ControlModifier))) {
						
						Matrix4f mx = Matrix4f::Rotation(upDown, -dp.x()*rotateSpeed);
						Matrix4f my = Matrix4f::Rotation(rightDown, -dp.y()*rotateSpeed);
						target->setValue((my*mx)*directionDown+eyeDown);
						up->setValue((my*mx)*upDown);
							
						if (QApplication::keyboardModifiers() == Qt::ShiftModifier) {
							eyeDown=eyeDown+rotateSpeed*(eyeDown.length())*0.1*directionDown.normalized();
							eye->setValue(eyeDown);
						}
						if (QApplication::keyboardModifiers() == (Qt::ShiftModifier | Qt::ControlModifier)) {
							eyeDown=eyeDown-rotateSpeed*(eyeDown.length())*0.1*directionDown.normalized();
							eye->setValue(eyeDown);
						}
					}
					return true;
				}
			}
			return false;
		}

		/*
		void Camera3D::leftMouseButtonDrag(doublouble rx, double ry) {
		Vector3f direction = (target->getValue()-eye->getValue());
		Vector3f right = Vector3f::cross(direction.normalized(), up->getValue()).normalized();

		// Lets try rotating the camera dir.

		// QApplication::keyboardModifiers ()  
		if (QApplication::keyboardModifiers() == Qt::ShiftModifier) {

		double rotateSpeed = 3.0;
		Matrix4f mx = Matrix4f::Rotation(up->getValue(), -rx*rotateSpeed);
		Matrix4f my = Matrix4f::Rotation(right, -ry*rotateSpeed);
		direction = (my*mx)*direction;
		target->setValue(direction+eye->getValue());
		up->setValue((my*mx)*up->getValue());
		} else {
		double rotateSpeed = 3.0;
		Matrix4f mx = Matrix4f::Rotation(up->getValue(), -rx*rotateSpeed);
		Matrix4f my = Matrix4f::Rotation(right, -ry*rotateSpeed);
		direction = (my*mx)*direction;
		eye->setValue(target->getValue()-direction);
		up->setValue((my*mx)*up->getValue());
		}
		// Orthogonalize up wrt direciton.
		Vector3f up2 = up->getValue();
		direction.normalize();
		float f = Vector3f::dot(direction, up2);
		if (fabs(f)>0.8) {
		up2 = (up2 -f  *direction).normalized();
		up->setValue(up2);
		}



		};

		void Camera3D::rightMouseButtonDrag(double , double rx, double ry) {
		Vector3f direction = (target->getValue()-eye->getValue()).normalized();
		Vector3f right = Vector3f::cross(direction, up->getValue()).normalized();
		eye->setValue(eye->getValue() + 5.0*(-rx*right + ry*up->getValue()));
		target->setValue(target->getValue() + 5.0*(-rx*right + ry*up->getValue()));
		};

		void Camera3D::bothMouseButtonDrag(double, double rx, double ry) {
		Vector3f direction = (target->getValue()-eye->getValue()).normalized();
		eye->setValue(eye->getValue() + 5.0*ry*direction);
		float f = fov->getValue();
		if (rx>0.0) {
		f*= (1.0+rx);
		} else {
		f/= fabs((1.0+rx));
		}
		fov->setValue(f);
		};
		*/



		Vector3f Camera3D::transform(int width, int height) {
			this->height = height;
			this->width = width;

			// -- Modelview
			glMatrixMode(GL_MODELVIEW);
			glLoadIdentity();
			return Vector3f(1.0,1.0,1.0);
		};


		Camera2D::Camera2D(QStatusBar* statusBar) : statusBar(statusBar) { reset(); };

		QVector<VariableWidget*> Camera2D::addWidgets(QWidget* /*group*/, QWidget* /*parent*/) {
			return QVector<VariableWidget*>();
		}

		void Camera2D::reset() { 
			scale = 1.0; 
			x = 0;
			y = 0;
		}

		void Camera2D::printInfo() {
			INFO("Camera: Left mouse button translates scene.");
			INFO("Camera: Mouse wheel or (right mouse button + up/down) zooms");
		}

		/*
		void Camera2D::leftMouseButtonDrag(douuble rx, double ry) {
		this->x+= -rx*scale*2.0;
		this->y+= ry*scale*2.0;
		if (statusBar) statusBar->showMessage(QString("Scale: %1").arg(scale),5000);

		};

		void Camera2D::rightMouseButtonDrag(dole ry) {
		if (ry > 0) {
		scale/=(1.0+2*ry);
		} else {
		scale*=(1.0-2*ry);
		}
		if (statusBar) statusBar->showMessage(QString("Scale: %1").arg(scale),5000);

		};

		void Camera2D::bothMouseButtonDrag(dououble ry) {
		if (ry > 0) {
		scale/=(1.0+2*ry*5);
		} else {
		scale*=(1.0-2*ry*5);
		}
		if (statusBar) statusBar->showMessage(QString("Scale: %1").arg(scale),5000);

		};

		void Camera2D::wheel(double double val) {
		if (val > 0) {
		scale/=(1.0+val/10);
		} else {
		scale*=(1.0-val/10);
		}
		if (statusBar) statusBar->showMessage(QString("Scale: %1").arg(scale),5000);

		};
		*/
		Vector3f Camera2D::transform(int width, int height) {
			glMatrixMode(GL_MODELVIEW);
			glLoadIdentity();glTranslatef(x,y,0);
			glScalef(scale,scale*(height/(float)width),scale);
			return Vector3f(scale,scale*(height/(float)width),scale);
		};
	}
}

