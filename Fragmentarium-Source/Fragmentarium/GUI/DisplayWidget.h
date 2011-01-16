#pragma once

#include <QVector>
#include <QGLWidget>
#include <QMainWindow>
#include <QPoint>
#include <QList>
#include <QGLShaderProgram>
#include "SyntopiaCore/Logging/ListWidgetLogger.h"
#include "SyntopiaCore/Math/Vector3.h"
#include "SyntopiaCore/Math/Matrix4.h"
#include "../Parser/Preprocessor.h"


namespace Fragmentarium {
	namespace GUI {	

		using namespace Parser;
		class MainWindow;

		// CameraControl maintains camera position, and respond to user control.
		class CameraControl {
		public:
			CameraControl() {};
			virtual void leftMouseButtonDrag(double x, double y, double rx, double ry) = 0;
			virtual void rightMouseButtonDrag(double x, double y, double rx, double ry) = 0;
			virtual void bothMouseButtonDrag(double x, double y, double rx, double ry) = 0;
			virtual void wheel(double x, double y, double val) = 0;
			virtual SyntopiaCore::Math::Vector3f transform(int width, int height) = 0;
			virtual void reset() = 0;
			virtual QString getVertexShader() =0;
			virtual QString getID() =0;
		};

		/// Widget for the mini OpenGL engine.
		class DisplayWidget : public QGLWidget {
		public:
			/// Constructor
			DisplayWidget(QGLFormat format, MainWindow* mainWindow, QWidget* parent);

			/// Destructor
			~DisplayWidget();

			/// Use this whenever an redraw is required.
			/// Calling this function multiple times will still only result in one redraw
			void requireRedraw();
			void clearWorld();
			void reset();
			void setContextMenu(QMenu* contextMenu) { this->contextMenu = contextMenu; }
			void setDisabled(bool disabled) { this->disabled = disabled; }
			void setFragmentShader(FragmentSource fs);
			void setupFragmentShader();
			void setContinuous(bool value) { continuous = value; }
			void setDisableRedraw(bool value) { disableRedraw = value; }
			void resetTime() { time = QTime::currentTime(); }
			FragmentSource* getFragmentSource() { return &fragmentSource; }
	
		
		protected:
			void mouseMoveEvent(QMouseEvent* ev) ; 
			void contextMenuEvent (QContextMenuEvent* ev);
			void mouseReleaseEvent ( QMouseEvent * ev);
			void initializeGL();
			void timerEvent( QTimerEvent * );
			void paintEvent(QPaintEvent * ev);  

			/// Actual drawing is implemented here
			void paintGL();

			/// Triggers a perspective update and a redraw
			void resizeGL(int w, int h);
			void wheelEvent(QWheelEvent* e);
				
		private:
			bool continuous;
			bool disableRedraw;
			bool fragmentShader;
			QGLShaderProgram* shaderProgram;
		
			void updatePerspective();	
			int pendingRedraws; // the number of times we must redraw 
			// (when a redraw is requested we must draw two times, when double buffering)
			int requiredRedraws;
			QPoint oldPos;
			QColor backgroundColor;


			QString infoText;

			QMenu* contextMenu;
			bool rmbDragging;

			QTime textTimer;
			bool disabled;
			bool doingRotate;
			
			MainWindow* mainWindow;
			CameraControl* cameraControl;
			FragmentSource fragmentSource;
			QTime time;
			QTime fpsTimer;
			int fpsCounter;
		};
	};

};

