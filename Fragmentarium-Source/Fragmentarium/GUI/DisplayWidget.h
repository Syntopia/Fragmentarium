#pragma once

#include <QVector>
#include <QGLWidget>
#include <QMainWindow>
#include <QGLFramebufferObject>
#include <QProgressDialog>
#include <QPoint>
#include <QList>
#include <QGLShaderProgram>
#include "SyntopiaCore/Logging/ListWidgetLogger.h"
#include "SyntopiaCore/Math/Vector3.h"
#include "SyntopiaCore/Math/Matrix4.h"
#include "../Parser/Preprocessor.h"
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

            enum DrawingState { Progressive, Animation, Tiled };

            /// Constructor
            DisplayWidget(QGLFormat format, MainWindow* mainWindow, QWidget* parent);

            /// Destructor
            ~DisplayWidget();

            void clearTileBuffer();
            QImage render(float padding, float time, int subframes, int w, int h, int tile, int tileMax, QProgressDialog* progress, int* steps, int totalSteps);

            /// Use this whenever an redraw is required.
            /// Calling this function multiple times will still only result in one redraw
            void requireRedraw(bool clear);
            void clearWorld();
            void updateRefreshRate();
            void setState(DrawingState state);
            DrawingState getState() { return drawingState; }
            bool isContinuous() { return continuous; }
            void reset();
            void setContextMenu(QMenu* contextMenu) { this->contextMenu = contextMenu; }
            void resetCamera(bool fullReset);
            void setDisabled(bool disabled) { this->disabled = disabled; }
            void setFragmentShader(FragmentSource fs);
            bool hasShader() { return (shaderProgram!=0); }
            void setupFragmentShader();
            void setupBufferShader();
            void setContinuous(bool value) { continuous = value; }
            void setDisableRedraw(bool value) { disableRedraw = value; }
            bool isRedrawDisabled() { return disableRedraw; }
            CameraControl* getCameraControl() { return cameraControl; }
            //void setupTileRender(int tiles, float padding, int tileFrameMax, QString outputFile);
            void resetTime() { time = QTime::currentTime(); }
            void setViewFactor(int val);
            void setPreviewFactor(int val);
            FragmentSource* getFragmentSource() { return &fragmentSource; }
            void keyReleaseEvent(QKeyEvent* ev);
            void keyPressEvent(QKeyEvent* ev);
            void setMaxSubFrames(int i ) { maxSubFrames = i; }
            void uniformsHasChanged();
            void setClearOnChange(bool v) { clearOnChange = v; }

            void updatePerspective();
            void clearTextureCache(QMap<QString, bool>* textureCacheUsed);
        public slots:
            void updateBuffers();
            void clearPreviewBuffer();
            void timerSignal();
        protected:
            void tileRender();
            void drawFragmentProgram(int w,int h, bool toBuffer);
            void drawToFrameBufferObject(QGLFramebufferObject* buffer, bool drawLast);
            void mouseMoveEvent(QMouseEvent* ev) ;
            void contextMenuEvent (QContextMenuEvent* ev);
            void mouseReleaseEvent ( QMouseEvent * ev);
            void mousePressEvent ( QMouseEvent * ev);
            void initializeGL();
            void paintEvent(QPaintEvent * ev);

            /// Actual drawing is implemented here
            void paintGL();

            /// Triggers a perspective update and a redraw
            void resizeGL(int w, int h);
            void wheelEvent(QWheelEvent* e);

        private:
            QGLFramebufferObject* previewBuffer;
            QGLFramebufferObject* backBuffer;
            QGLFramebufferObject* hiresBuffer;
            bool continuous;
            bool disableRedraw;
            bool fragmentShader;
            QGLShaderProgram* shaderProgram;
            QGLShaderProgram* bufferShaderProgram;

            void clearBackBuffer();
            void setViewPort(int w, int h);
            void makeBuffers();
            int pendingRedraws; // the number of times we must redraw
            int requiredRedraws;
            QColor backgroundColor;
            int subframeCounter;

            QMenu* contextMenu;

            bool disabled;
            int tileFrame;
            int tileFrameMax;
            bool fitWindow;

            MainWindow* mainWindow;
            CameraControl* cameraControl;
            FragmentSource fragmentSource;
            QTime time;
            QTime fpsTimer;
            int fpsCounter;
            float padding;
            int tilesCount;
            int tiles;
            int viewFactor;
            int previewFactor;
            QString outputFile;
            enum BufferType { None, RGBA8, RGBA16, RGBA32F };
            BufferType bufferType;
            int nextActiveTexture;

            QDateTime tileRenderStart;
            QMap<QString, int> TextureCache;
            bool doClearBackBuffer;
            QTimer* timer;
            int maxSubFrames;
            QString oldBufferString;

            bool clearOnChange;
            int iterationsBetweenRedraws;
            int bufferSizeX;
            int bufferSizeY;
            DrawingState drawingState;
        };
    }

}

