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
			mouseDown = Vector3f(0,0,-1);
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

				double mouseSpeed = 1.0;
				Vector3f directionDown = targetDown-eyeDown;
				Vector3f rightDown = Vector3f::cross(directionDown.normalized(), upDown).normalized();

				if (e->buttons() == Qt::RightButton) {
					Vector3f offset = -upDown*dp.y()*10.0*mouseSpeed + rightDown*dp.x()*10.0*mouseSpeed;
					eye->setValue(eyeDown+offset);
					target->setValue(targetDown+offset);
					return true;
				} else if (e->buttons() == (Qt::RightButton | Qt::LeftButton)  ) {
					Vector3f newEye = eyeDown -directionDown*dp.x()*1.0*mouseSpeed;
					fov->setValue(fovDown* (1-0.1*dp.y()));
					eye->setValue(newEye);
					target->setValue(directionDown +newEye);
					return true;
				} else {
					// Left mouse button
					if (QApplication::keyboardModifiers() == Qt::ControlModifier) {
						Matrix4f mx = Matrix4f::Rotation(upDown, -dp.x()*mouseSpeed);
						Matrix4f my = Matrix4f::Rotation(rightDown, -dp.y()*mouseSpeed);
						Vector3f oDir = (my*mx)*(-eyeDown);
						eye->setValue(-oDir);
						target->setValue( (my*mx)*directionDown-oDir);
						up->setValue((my*mx)*upDown);
					} else if ((QApplication::keyboardModifiers() == Qt::ShiftModifier )
								 || (QApplication::keyboardModifiers() == Qt::NoModifier)
								  || (QApplication::keyboardModifiers() == (Qt::ShiftModifier | Qt::ControlModifier))) {
						
						Matrix4f mx = Matrix4f::Rotation(upDown, -dp.x()*mouseSpeed);
						Matrix4f my = Matrix4f::Rotation(rightDown, -dp.y()*mouseSpeed);
						target->setValue((my*mx)*directionDown+eyeDown);
						up->setValue((my*mx)*upDown);
							
						if (QApplication::keyboardModifiers() == Qt::ShiftModifier) {
							eyeDown=eyeDown+mouseSpeed*(eyeDown.length())*0.1*directionDown.normalized();
							eye->setValue(eyeDown);
						}
						if (QApplication::keyboardModifiers() == (Qt::ShiftModifier | Qt::ControlModifier)) {
							eyeDown=eyeDown-mouseSpeed*(eyeDown.length())*0.1*directionDown.normalized();
							eye->setValue(eyeDown);
						}
					}
					return true;
				}
			}
			return false;
		}

		Vector3f Camera3D::transform(int width, int height) {
			this->height = height;
			this->width = width;

			// -- Modelview
			glMatrixMode(GL_MODELVIEW);
			glLoadIdentity();
			return Vector3f(1.0,1.0,1.0);
		};


		Camera2D::Camera2D(QStatusBar* statusBar) : statusBar(statusBar) {
		 center = 0;
		  zoom = 0;
		};

		QVector<VariableWidget*> Camera2D::addWidgets(QWidget* /*group*/, QWidget* /*parent*/) {
			return QVector<VariableWidget*>();
		}

		

		void Camera2D::printInfo() {
			INFO("Camera: Left mouse button translates scene.");
			INFO("Camera: Mouse wheel or (right mouse button + up/down) zooms");
		}

		Vector3f Camera2D::transform(int /*width*/, int /*height*/) {
			glMatrixMode(GL_MODELVIEW);
			glLoadIdentity();
			return Vector3f(1.0,1.0,1.0);
		};

		void Camera2D::connectWidgets(VariableEditor* ve) {
			center = dynamic_cast<Float2Widget*>(ve->getWidgetFromName("Center"));
			if (!center) WARNING("Could not find Center interface widget");
			zoom = dynamic_cast<FloatWidget*>(ve->getWidgetFromName("Zoom"));
			if (!zoom) WARNING("Could not find Zoom interface widget");
		}

		namespace {
			Vector3f getModelCoord(Vector3f mouseCoord, Vector3f center, float zoom, int w, int h) {
				float ar = h/((float)(w));
				Vector3f coord = (mouseCoord/zoom+center);
				coord.x() = ar*coord.x();
				return coord;
			}
		}

		bool Camera2D::mouseMoveEvent(QMouseEvent* e, int w, int h) {
			if (!center || !zoom) return false;
			Vector3f pos = Vector3f(e->pos().x()/(0.5*float(w))-1.0,1.0-e->pos().y()/(0.5*float(h)),0.0);
			Vector3f centerValue = center->getValue();
			float zoomValue = zoom->getValue();
		
			if (e->type() ==  QEvent::MouseButtonPress) {
				mouseDown = pos;
				zoomDown = zoomValue;
				centerDown = centerValue;
			} else if (e->type() ==  QEvent::MouseButtonRelease) {
				mouseDown = Vector3f(0,0,-1);
			}
			
			float mouseSpeed = 1.0;
			if (mouseDown.z()!=-1 && e->buttons()!=Qt::NoButton) {
				Vector3f dp = mouseDown-pos;
				if (e->buttons() == Qt::LeftButton) {
					center->setValue(centerDown + dp*mouseSpeed/zoomDown);
				} else if (e->buttons() == Qt::RightButton) {
					// Convert mouse down to model coordinates
					Vector3f md = getModelCoord(mouseDown, centerDown, zoomDown, w,h);
					float newZoom = zoomDown +dp.y()*(zoomDown)*mouseSpeed;
					//float z = newZoom/zoomDown;
					//center->setValue(md-(md-centerDown)/z);
					zoom->setValue( newZoom);
				}
				return true;
			}
			return false;
		}

	}
}

