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

		CameraControl::CameraControl() : askForRedraw(false) { 
			reset(true); 
			sliderStepSize = 0.0;
			comboSlider = 0;
		};

		void CameraControl::setComboSlider(ComboSlider* comboSlider) {
			this->comboSlider = comboSlider;
			INFO("Settings comboslider to: + " + QString::number((int)comboSlider));
			if (!comboSlider) return;
			sliderStepSize = comboSlider->getSpan()/100.0;
		}
			
			
		bool CameraControl::keyPressEvent(QKeyEvent* ev) {
			if (ev->isAutoRepeat()) {
				ev->accept();
				return false;
			}
			int key = ev->key();
			keyStatus[key] = (ev->type() == QEvent::KeyPress);
			return parseKeys();
		}

		bool CameraControl::keyDown(int key) {
			if (!keyStatus.contains(key)) keyStatus[key] = false;
			return keyStatus[key];
		}


		void CameraControl::checkSliderKeys(bool* keysDown) {
			if (!comboSlider) return;

			if (keyDown(Qt::Key_Up)) {
				sliderStepSize = sliderStepSize*10.0;
				INFO(QString("Slider step size: %1").arg(sliderStepSize));
				*keysDown = true;
				keyStatus[Qt::Key_Up] = false; // only apply once
			} 
			
			if (keyDown(Qt::Key_Down)) {
				sliderStepSize = sliderStepSize/10.0;
				INFO(QString("Slider step size: %1").arg(sliderStepSize));
				*keysDown = true;
				keyStatus[Qt::Key_Down] = false; // only apply once
			}
			
			if (keyDown(Qt::Key_Left)) {
				comboSlider->setValue(comboSlider->getValue()-sliderStepSize);
				*keysDown = true;
			} 
			
			if (keyDown(Qt::Key_Right)) {
				comboSlider->setValue(comboSlider->getValue()+sliderStepSize);
				*keysDown = true;
			} 
			
		}

		Camera3D::Camera3D(QStatusBar* statusBar) : statusBar(statusBar) {
			mouseDown = Vector3f(0,0,-1);
		 reset(true);
		
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
			INFO("Camera: Use W/S to fly. 1/3 adjusts speed. Q/E rolls. Click on 3D window for key focus. See Help Menu for more.");
		}

		void Camera3D::reset(bool fullReset) {
			keyStatus.clear();
			if (fullReset) stepSize = 0.1;
		}

		bool Camera3D::parseKeys() {
			if (!up || !target || !eye || !fov) return false;
	
			//INFO("Parse keys...");
			Vector3f direction = (target->getValue()-eye->getValue());
			Vector3f dir = direction.normalized();
			Vector3f right = Vector3f::cross(direction.normalized(), up->getValue()).normalized();
			Vector3f upV = up->getValue();

			float factor = 0.05;

			bool keysDown = false;
			if (keyDown(Qt::Key_1)) {
				stepSize = stepSize/2.0;
				INFO(QString("Step size: %1").arg(stepSize));
				keyStatus[Qt::Key_1] = false; // only apply once
			} 

			if (keyDown(Qt::Key_3)) {
				stepSize = stepSize*2.0;
				INFO(QString("Step size: %1").arg(stepSize));
				keyStatus[Qt::Key_3] = false; // only apply once
			}

			if (keyDown(Qt::Key_2)) {
				stepSize = stepSize*10.0;
				INFO(QString("Step size: %1").arg(stepSize));
				keyStatus[Qt::Key_2] = false; // only apply once
			} 
			
			if (keyDown(Qt::Key_X)) {
				stepSize = stepSize/10.0;
				INFO(QString("Step size: %1").arg(stepSize));
				keysDown = true;
				keyStatus[Qt::Key_X] = false; // only apply once
			}
			
			if (keyDown(Qt::Key_A)) {
				Vector3f offset = -right*stepSize;		
				eye->setValue(eye->getValue()+offset);
				target->setValue(target->getValue()+offset);	
				keysDown = true;
			} 
			
			if (keyDown(Qt::Key_D)) {
				Vector3f offset = right*stepSize;		
				eye->setValue(eye->getValue()+offset);
				target->setValue(target->getValue()+offset);	
				keysDown = true;
			} 
			
			if (keyDown(Qt::Key_W)) {
				Vector3f offset = dir*stepSize;	
				Vector3f db2 = eye->getValue()+offset;
				eye->setValue(db2);
				target->setValue(target->getValue()+offset);	
				keysDown = true;
			}

			if (keyDown(Qt::Key_S)) {
				Vector3f offset = -dir*stepSize;		
				eye->setValue(eye->getValue()+offset);
				target->setValue(target->getValue()+offset);
				keysDown = true;
			}

			if (keyDown(Qt::Key_R)) {
				Vector3f offset = -upV*stepSize;		
				eye->setValue(eye->getValue()+offset);
				target->setValue(target->getValue()+offset);
				keysDown = true;
			}

			if (keyDown(Qt::Key_F)) {
				Vector3f offset = upV*stepSize;		
				eye->setValue(eye->getValue()+offset);
				target->setValue(target->getValue()+offset);
				keysDown = true;
			}

			if (keyDown(Qt::Key_Y)) {
				Matrix4f m = Matrix4f::Rotation(upV, factor);
				target->setValue(m*direction+eye->getValue());
				up->setValue(m*up->getValue());			
				keysDown = true;
			}

			if (keyDown(Qt::Key_H)) {
				Matrix4f m = Matrix4f::Rotation(upV, -factor);
				target->setValue(m*direction+eye->getValue());
				up->setValue(m*up->getValue());			
				keysDown = true;
			}

			if (keyDown(Qt::Key_T)) {
				Matrix4f m = Matrix4f::Rotation(right, factor);
				target->setValue(m*direction+eye->getValue());
				up->setValue(m*up->getValue());			
				keysDown = true;
			}
			
			if (keyDown(Qt::Key_G)) {
				Matrix4f m = Matrix4f::Rotation(right, -factor);
				target->setValue(m*direction+eye->getValue());
				up->setValue(m*up->getValue());			
				keysDown = true;
			}
			
			if (keyDown(Qt::Key_E)) {
				Matrix4f m = Matrix4f::Rotation(dir, factor);
				target->setValue(m*direction+eye->getValue());
				up->setValue(m*up->getValue());			
				keysDown = true;
			}
			
			if (keyDown(Qt::Key_Q)) {
				Matrix4f m = Matrix4f::Rotation(dir, -factor);
				target->setValue(m*direction+eye->getValue());
				up->setValue(m*up->getValue());	
				keysDown = true;
			} 

			checkSliderKeys(&keysDown);

			askForRedraw = false;
			if (keysDown) {
				// Orthogonalize up vector
				Vector3f fixedUp = up->getValue()-Vector3f::dot(up->getValue(), dir)*dir;
				up->setValue(fixedUp);
				askForRedraw = true;
			}
			return keysDown;
		};

		bool Camera3D::mouseEvent(QMouseEvent* e, int w, int h) {
			if (!up || !target || !eye || !fov) return false;
			Vector3f pos = Vector3f(e->pos().x()/(float(w)),e->pos().y()/(float(h)),0.0);
			Vector3f direction = (target->getValue()-eye->getValue());
			Vector3f right = Vector3f::cross(direction.normalized(), up->getValue()).normalized();

			// Store down params
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
					// Translate in screen plane
					Vector3f offset = -upDown*dp.y()*10.0*mouseSpeed + rightDown*dp.x()*10.0*mouseSpeed;
					eye->setValue(eyeDown+offset);
					target->setValue(targetDown+offset);
					return true;
				} else if (e->buttons() == (Qt::RightButton | Qt::LeftButton)  ) {
					// Zoom
					Vector3f newEye = eyeDown -directionDown*dp.x()*1.0*mouseSpeed;
					fov->setValue(fovDown* (1-0.1*dp.y()));
					eye->setValue(newEye);
					target->setValue(directionDown +newEye);
					return true;
				} else {
					// Left mouse button
					if (QApplication::keyboardModifiers() == Qt::ShiftModifier) {
						// Rotate about origo
						Matrix4f mx = Matrix4f::Rotation(upDown, -dp.x()*mouseSpeed);
						Matrix4f my = Matrix4f::Rotation(rightDown, -dp.y()*mouseSpeed);
						Vector3f oDir = (my*mx)*(-eyeDown);
						eye->setValue(-oDir);
						target->setValue( (my*mx)*directionDown-oDir);
						up->setValue((my*mx)*upDown);
					} else if (QApplication::keyboardModifiers() == Qt::NoModifier) {
						// orient camera
						Matrix4f mx = Matrix4f::Rotation(upDown, -dp.x()*mouseSpeed);
						Matrix4f my = Matrix4f::Rotation(rightDown, -dp.y()*mouseSpeed);
						target->setValue((my*mx)*directionDown+eyeDown);
						up->setValue((my*mx)*upDown);
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

		void Camera3D::wheelEvent(QWheelEvent* e) {
			float steps = e->delta()/120.0;
			float factor = 1.05;
			if (!up || !target || !eye || !fov) return;
			if (steps>0.0) {
				fov->setValue(fov->getValue()*factor);
			} else {
				fov->setValue(fov->getValue()/factor);
			}
		}
			

		/// ----------------- Camera2D ---------------------


		Camera2D::Camera2D(QStatusBar* statusBar) : statusBar(statusBar) {
		 center = 0;
		  zoom = 0;
		  reset(true);
			
		};

		QVector<VariableWidget*> Camera2D::addWidgets(QWidget* /*group*/, QWidget* /*parent*/) {
			return QVector<VariableWidget*>();
		}

		

		void Camera2D::printInfo() {
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


		
		bool Camera2D::parseKeys() {
			//INFO("Parse keys...");
			if (!center || !zoom) return false;
			Vector3f centerValue = center->getValue();
			float zoomValue = zoom->getValue();
		
			float factor =	 pow(1.05f,(float)stepSize);
			float zFactor =0.1/zoomValue;

			bool keysDown = false;

			// --------- step sizes ----------------------------

			if (keyDown(Qt::Key_1)) {
				stepSize = stepSize/2.0;
				INFO(QString("Step size: %1").arg(stepSize));
				keyStatus[Qt::Key_1] = false; // only apply once
			} 

			if (keyDown(Qt::Key_3)) {
				stepSize = stepSize*2.0;
				INFO(QString("Step size: %1").arg(stepSize));
				keyStatus[Qt::Key_3] = false; // only apply once
			}

			if (keyDown(Qt::Key_2)) {
				stepSize = stepSize*10.0;
				INFO(QString("Step size: %1").arg(stepSize));
				keyStatus[Qt::Key_2] = false; // only apply once
			} 
			
			if (keyDown(Qt::Key_X)) {
				stepSize = stepSize/10.0;
				INFO(QString("Step size: %1").arg(stepSize));
				keysDown = true;
				keyStatus[Qt::Key_X] = false; // only apply once
			}
			
			// ---------- Movement -----------------------------

			if (keyDown(Qt::Key_A)) {
				center->setValue(centerValue+Vector3f(-zFactor,0.0,0.0));	
				keysDown = true;
			} 
			
			if (keyDown(Qt::Key_D)) {
				center->setValue(centerValue+Vector3f(zFactor,0.0,0.0));	
				keysDown = true;
			} 

			
			if (keyDown(Qt::Key_W)) {
				center->setValue(centerValue+Vector3f(0.0,-zFactor,0.0));	
				keysDown = true;
			} 
			
			if (keyDown(Qt::Key_S)) {
				center->setValue(centerValue+Vector3f(0.0,zFactor,0.0));	
				keysDown = true;
			} 
			
			if (keyDown(Qt::Key_Q)) {
				zoom->setValue(zoomValue*factor);
				keysDown = true;
			}

			if (keyDown(Qt::Key_E)) {
				zoom->setValue(zoomValue/factor);
				keysDown = true;
			}

			checkSliderKeys(&keysDown);

			
			askForRedraw = keysDown;
			return keysDown;
		};

		bool Camera2D::mouseEvent(QMouseEvent* e, int w, int h) {
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

		void Camera2D::reset(bool fullReset) {
			keyStatus.clear();
			if (fullReset) stepSize = 1.0;
		}

		void Camera2D::wheelEvent(QWheelEvent* e) {
			float steps = e->delta()/120.0;
			float factor = 1.15;
			if (!zoom) return;
			if (steps>0.0) {
				zoom->setValue(zoom->getValue()*factor);
			} else {
				zoom->setValue(zoom->getValue()/factor);
			}
		}
			


	}
}

