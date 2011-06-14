#pragma once

#include <QVector>
#include <QPoint>
#include <QList>
#include <QWheelEvent>
#include <QMouseEvent>
#include <QStatusBar>
#include <QGLShaderProgram>
#include "SyntopiaCore/Logging/ListWidgetLogger.h"
#include "SyntopiaCore/Math/Vector3.h"
#include "SyntopiaCore/Math/Matrix4.h"


namespace Fragmentarium {
	namespace GUI {	

		class VariableWidget;
		class VariableEditor;
		class Float3Widget;
		class Float2Widget;
		class FloatWidget;
		class ComboSlider;
			
		using namespace SyntopiaCore::Math;

		// CameraControl maintains camera position, and respond to user control.
		class CameraControl {
		public:
			CameraControl();
			virtual ~CameraControl() {};
			virtual SyntopiaCore::Math::Vector3f transform(int width, int height) = 0;
			virtual void printInfo() = 0;
			virtual QString getID() =0;
			virtual QVector<VariableWidget*> addWidgets(QWidget* group, QWidget* parent) = 0;
			virtual void connectWidgets(VariableEditor* /*ve*/) {};
			virtual bool mouseEvent(QMouseEvent* /*e*/, int /*w*/, int /*h*/) { return false; };
			virtual void wheelEvent(QWheelEvent* /*e*/) {};
			virtual bool keyPressEvent(QKeyEvent* /*ev*/);
			virtual bool wantsRedraw() { return askForRedraw; } 
			virtual void updateState() { parseKeys(); };
			virtual void reset(bool /*fullReset*/){};
			virtual bool parseKeys() = 0;
			virtual void checkSliderKeys(bool* keysDown);
			void setComboSlider(ComboSlider* comboSlider);
         virtual void releaseControl();
			
		protected:
			ComboSlider* comboSlider;
			double sliderStepSize;
			bool keyDown(int key);
			QMap<int, bool> keyStatus;
			bool askForRedraw;
		};

		class Camera3D : public CameraControl {
		public:
			Camera3D(QStatusBar* statusBar);
			~Camera3D();
			virtual QVector<VariableWidget*> addWidgets(QWidget* group, QWidget* parent);
			virtual QString getID() { return "3D"; };
			void printInfo();
			Vector3f screenTo3D(int sx, int sy, int sz);
			virtual Vector3f transform(int width, int height);
			virtual void connectWidgets(VariableEditor* ve);
			virtual bool mouseEvent(QMouseEvent* e, int w, int h);
			virtual void wheelEvent(QWheelEvent* /*e*/);
			bool parseKeys();
			virtual void reset(bool fullReset);
		private:
			int height;
			int width;
			float stepSize;
			QStatusBar* statusBar;
		    Float3Widget* eye ;
			Float3Widget* target ;
			Float3Widget* up ;
			FloatWidget* fov;
			Vector3f eyeDown ;
			Vector3f targetDown ;
			Vector3f upDown ;
			float fovDown;
			Vector3f mouseDown;
		};

		class Camera2D : public CameraControl {
		public:
			Camera2D(QStatusBar* statusBar);
			virtual QVector<VariableWidget*> addWidgets(QWidget* group, QWidget* parent);
			virtual void connectWidgets(VariableEditor* ve);
			virtual QString getID() { return "2D"; };
			void printInfo();
			virtual Vector3f transform(int width, int height);
			virtual bool mouseEvent(QMouseEvent* e, int w, int h);
			virtual void wheelEvent(QWheelEvent* /*e*/);
			bool parseKeys();
			virtual void reset(bool fullReset);
		private:
			float stepSize;
			Float2Widget* center;
			FloatWidget* zoom;	
			QStatusBar* statusBar;
			Vector3f mouseDown;
			float zoomDown;
			Vector3f centerDown;
		};
	}



};

