#pragma once

#include <QVector>
#include <QGLWidget>
#include <QMainWindow>
#include <QGLFramebufferObject>
#include <QPoint>
#include <QList>
#include <QGLShaderProgram>
#include "SyntopiaCore/Logging/ListWidgetLogger.h"
#include "SyntopiaCore/Math/Vector3.h"
#include "SyntopiaCore/Math/Matrix4.h"
#include "../Parser/Preprocessor.h"
#include "AnimationController.h"
#include "CameraControl.h"

namespace Fragmentarium {
	namespace GUI {	

		using namespace Parser;
		class MainWindow;
		class VariableWidget;
		class CameraControl;


		/// Widget for the mini OpenGL engine.
		class DisplayWidget : public QGLWidget {
			Q_OBJECT
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
			void resetCamera(bool fullReset);
			void setDisabled(bool disabled) { this->disabled = disabled; }
			void setFragmentShader(FragmentSource fs);
			void setupFragmentShader();
			void setupBufferShader();
			void setContinuous(bool value) { continuous = value; }
			void setDisableRedraw(bool value) { disableRedraw = value; }
			bool isRedrawDisabled() { return disableRedraw; }
			CameraControl* getCameraControl() { return cameraControl; }
			void setupTileRender(int tiles, int tileFrameMax, QString outputFile);
			void resetTime() { time = QTime::currentTime(); }
			void setViewFactor(int val);
			void setPreviewFactor(int val);
			FragmentSource* getFragmentSource() { return &fragmentSource; }
			void setAnimationSettings(AnimationSettings* a) { animationSettings = a; }
			void keyReleaseEvent(QKeyEvent* ev);
			void keyPressEvent(QKeyEvent* ev);
			public slots:
				void clearPreviewBuffer();
		protected:
			void tileRender();
			void drawFragmentProgram(int w,int h);
			void drawToFrameBufferObject();
			void mouseMoveEvent(QMouseEvent* ev) ; 
			void contextMenuEvent (QContextMenuEvent* ev);
			void mouseReleaseEvent ( QMouseEvent * ev);
			void mousePressEvent ( QMouseEvent * ev);
			void initializeGL();
			void timerEvent( QTimerEvent * );
			void paintEvent(QPaintEvent * ev);  

			/// Actual drawing is implemented here
			void paintGL();

			/// Triggers a perspective update and a redraw
			void resizeGL(int w, int h);
			void wheelEvent(QWheelEvent* e);

		private:
			QGLFramebufferObject* previewBuffer;
			QGLFramebufferObject* backBuffer;
			bool continuous;
			bool disableRedraw;
			bool fragmentShader;
			QGLShaderProgram* shaderProgram;
			QGLShaderProgram* bufferShaderProgram;

			void clearBackBuffer();
			void updatePerspective();	
			void makeBuffers();
			int pendingRedraws; // the number of times we must redraw 
			int requiredRedraws;
			QColor backgroundColor;
			int backBufferCounter;

			QMenu* contextMenu;

			bool disabled;
			int tileFrame;
			int tileFrameMax;

			MainWindow* mainWindow;
			CameraControl* cameraControl;
			FragmentSource fragmentSource;
			QTime time;
			QTime fpsTimer;
			int fpsCounter;
			int tiles;
			int tilesCount;
			QVector<QImage> cachedTileImages;
			int viewFactor;
			int previewFactor;
			AnimationSettings* animationSettings;
			QString outputFile;
			enum BufferType { None, RGBA8, RGBA16, RGBA32F };
			BufferType bufferType;
			int nextActiveTexture;

			QDateTime tileRenderStart;
		};
	};

};

