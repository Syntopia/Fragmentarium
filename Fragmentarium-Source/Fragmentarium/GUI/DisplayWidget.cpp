#include "DisplayWidget.h"
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

		namespace {
			QStringList GetOpenGLFlags() {
				QGLFormat::OpenGLVersionFlags f = QGLFormat::openGLVersionFlags ();
				QStringList s;
				if (f & QGLFormat::OpenGL_Version_1_1) s.append("OpenGL1.1");
				if (f & QGLFormat::OpenGL_Version_1_2) s.append("OpenGL1.2");
				if (f & QGLFormat::OpenGL_Version_1_3) s.append("OpenGL1.3");
				if (f & QGLFormat::OpenGL_Version_1_4) s.append("OpenGL1.4");
				if (f & QGLFormat::OpenGL_Version_1_5) s.append("OpenGL1.5");
				if (f & QGLFormat::OpenGL_Version_2_0) s.append("OpenGL2.0");
				if (f & QGLFormat::OpenGL_Version_2_1) s.append("OpenGL2.1");
				if (f & QGLFormat::OpenGL_Version_3_0) s.append("OpenGL3.0");

				if (f & QGLFormat::OpenGL_ES_CommonLite_Version_1_0) s.append("OpenGL_ES_CL_1.0");
				if (f & QGLFormat::OpenGL_ES_Common_Version_1_0) s.append("OpenGL_ES_C_1.0");
				if (f & QGLFormat::OpenGL_ES_CommonLite_Version_1_1) s.append("OpenGL_ES_CL_1.1");
				if (f & QGLFormat::OpenGL_ES_Common_Version_1_1) s.append("OpenGL_ES_C_1.1");
				if (f & QGLFormat::OpenGL_ES_Version_2_0) s.append("OpenGL_ES_2,0");
				return s;
			}
		}


		DisplayWidget::DisplayWidget(QGLFormat format, MainWindow* mainWindow, QWidget* parent) 
			: QGLWidget(format,parent), mainWindow(mainWindow) 
		{
			animationSettings = 0;
			shaderProgram = 0;
			viewFactor = 1.0;
			tiles = 0;
			tilesCount = 0;
			resetTime();
			fpsTimer = QTime::currentTime();
			fpsCounter = 0;
			continuous = false;
			disableRedraw = false;
			cameraControl = new Camera2D(mainWindow->statusBar());
			disabled = false;
			updatePerspective();
			pendingRedraws = 0;
			requiredRedraws = 1; // 2 for double buffering?
			startTimer( 20 );
			setMouseTracking(true);
			backgroundColor = QColor(30,30,30);
			contextMenu = 0;
			setupFragmentShader();
		}


		void DisplayWidget::paintEvent(QPaintEvent * ev) {
			QGLWidget::paintEvent(ev);
		}

		DisplayWidget::~DisplayWidget() {
		}


		void DisplayWidget::contextMenuEvent(QContextMenuEvent* /*ev*/ ) {
		}


		void DisplayWidget::reset() {
			updatePerspective();
			requireRedraw();
			setupFragmentShader();
		}

		void DisplayWidget::setFragmentShader(FragmentSource fs) { 
			fragmentSource = fs; 

			if (fragmentSource.camera == "") {
				fragmentSource.camera = "2D";
			}
			if (cameraControl->getID() != fragmentSource.camera) {
				INFO("Changing camera control to: "+fragmentSource.camera);
				if (fragmentSource.camera == "2D") {
					delete(cameraControl);
					cameraControl = new Camera2D(mainWindow->statusBar());
				} else if (fragmentSource.camera == "3D") {
					delete(cameraControl);
					cameraControl = new Camera3D(mainWindow->statusBar());
				} else {
					WARNING("Unknown camera type: " + fragmentSource.camera);
				}
			}
			cameraControl->printInfo();


			requireRedraw();
			setupFragmentShader();
		}


		void DisplayWidget::requireRedraw() {
			if (disableRedraw) return;
			pendingRedraws = requiredRedraws;
		}


		void DisplayWidget::setupFragmentShader() {

			if (shaderProgram) {
				shaderProgram->release();
			}
			delete(shaderProgram);
			shaderProgram = new QGLShaderProgram(this);

			// Vertex shader
			bool s = false;
			s = shaderProgram->addShaderFromSourceCode(QGLShader::Vertex,fragmentSource.vertexSource.join("\n"));
			if (fragmentSource.vertexSource.count() == 0) {
				WARNING("No vertex shader found!");
				s = false;
			}
			
			if (!s) WARNING("Could not create vertex shader: " + shaderProgram->log());
			if (!s) { delete(shaderProgram); shaderProgram = 0; return; }
			if (!shaderProgram->log().isEmpty()) INFO("Vertex shader compiled with warnings: " + shaderProgram->log());

			// Fragment shader
			s = shaderProgram->addShaderFromSourceCode(QGLShader::Fragment,
				fragmentSource.getText());
			if (!s) WARNING("Could not create fragment shader: " + shaderProgram->log());
			if (!s) { delete(shaderProgram); shaderProgram = 0; return; }
			if (!shaderProgram->log().isEmpty()) INFO("Fragment shader compiled with warnings: " + shaderProgram->log());

			s = shaderProgram->link();
			if (!s) WARNING("Could not link shaders: " + shaderProgram->log());
			if (!s) { delete(shaderProgram); shaderProgram = 0; return; }

			s = shaderProgram->bind();
			if (!s) WARNING("Could not bind shaders: " + shaderProgram->log());
			if (!s) { delete(shaderProgram); shaderProgram = 0; return; }

			// Setup textures.
			int u = 0;
			for (QMap<QString, QString>::iterator it = fragmentSource.textures.begin(); it!=fragmentSource.textures.end(); it++) {
				QImage im(it.value());
				if (im.isNull()) {
					WARNING("Failed to load texture: " + QFileInfo(it.value()).absoluteFilePath());
				} else {

					int l = shaderProgram->uniformLocation(it.key());
					if (l != -1) {
						glActiveTexture(GL_TEXTURE0+u); // non-standard (>OpenGL 1.3) gl extension
						GLuint i = bindTexture(it.value(), GL_TEXTURE_2D, GL_RGBA);
						glBindTexture(GL_TEXTURE_2D,i);

						shaderProgram->setUniformValue(l, (GLuint)u);
						INFO("Binding " + it.key() + ":" + it.value() + " to " + QString::number(i));

					} else {
						WARNING("Could not locate sampler2D uniform: " + it.key());
					}
					u++;
				}

			}

		}


		void DisplayWidget::setupTileRender(int tiles) {
			this->tiles = tiles;
			tilesCount = 0;
			requireRedraw();
		}

		void DisplayWidget::tileRender() {
			glLoadIdentity();
			if (!tiles && viewFactor<=1.0) return;
			if (viewFactor > 1.0) {
				glScalef(1.0/viewFactor,1.0/viewFactor,1.0);
				return;	
			}
			requireRedraw();
			

			if (tilesCount==tiles*tiles) {
				INFO("Tile rendering complete");
				// Now assemble image
				int w = cachedTileImages[0].width();
				int h = cachedTileImages[0].height();
				QImage im(w*tiles,h*tiles,cachedTileImages[0].format());

				INFO(QString("Created combined image (%1,%2)").arg(im.width()).arg(im.height()));
				// Isn't there a Qt function to copy entire images?
				for (int i = 0; i < tiles*tiles; i++) {
					int dx = (i / tiles);
					int dy = (tiles-1)-(i % tiles);
					for (int x = 0; x < w; x++) {
						for (int y = 0; y < h; y++) {
							QRgb p = cachedTileImages[i].pixel(x,y);
							im.setPixel(x+w*dx,y+h*dy,p);
						}
					}
				}

				cachedTileImages.clear();
				mainWindow->saveImage(im);
				tiles = 0;

				return;
			}
			INFO(QString("Rendering tile: %1 of %2").arg(tilesCount+1).arg(tiles*tiles));
			float x = (tilesCount / tiles) - (tiles-1)/2.0;
			float y = (tilesCount % tiles) - (tiles-1)/2.0;

			glTranslatef( x * (2.0/tiles) , y * (2.0/tiles), 1.0);
			glScalef( 1.0/tiles,1.0/tiles,1.0);	


			tilesCount++;

		}

		void DisplayWidget::setViewFactor(float val) {
			viewFactor = val;
			requireRedraw();
		}


		void DisplayWidget::paintGL() {
			// Show info first time we display something...


			static bool shownInfo = false;
			if (!shownInfo) {
				shownInfo = true;
				INFO("This video card supports: " + GetOpenGLFlags().join(", "));
			}

			if (pendingRedraws > 0) pendingRedraws--;

			if (disabled || !shaderProgram) {
				qglClearColor(backgroundColor);
				glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );
				return;
			}

			QTime t = QTime::currentTime();
			if (shaderProgram) {
				glDisable( GL_CULL_FACE );
				glDisable( GL_LIGHTING );
				glDisable( GL_DEPTH_TEST );

				// -- Viewport
				if (viewFactor >= 1.0) {
					glViewport( 0, 0, width(), height());
				} else {
					qglClearColor(backgroundColor);
					glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );
					glViewport( 0.5*width()*(1.0-viewFactor), 0.5*height()*(1.0-viewFactor), width()*viewFactor, height()*viewFactor);
				}

				// -- Projection
				// The projection mode as used here
				// allow us to render only a region of the viewport.
				// This allows us to perform tile based rendering.
				glMatrixMode(GL_PROJECTION);
				tileRender();


				cameraControl->transform(width(), height())*2;
				if (true) {
					int l = shaderProgram->uniformLocation("pixelSize");
					if (l != -1) {
						shaderProgram->setUniformValue(l, (float)(1.0/width()),(float)(1.0/height()));
					}
				}

			

				int l = shaderProgram->uniformLocation("time");
				if (l != -1) {
					float t = 0;
					if (animationSettings) {
						t = animationSettings->getTimeFromDisplay();
					} else if (continuous) {
						t = (time.msecsTo(QTime::currentTime())/1000.0);
					} else {
						t = 0;
					}
					shaderProgram->setUniformValue(l, (float)t);
					//INFO(QString("Time:%1").arg(t));
				}

				// Setup User Uniforms
				mainWindow->setUserUniforms(shaderProgram);
				glColor3d(1.0,1.0,1.0);

				if (disableRedraw) {
					QTime tx = QTime::currentTime();
					glRectf(-1,-1,1,1); 
					glFinish();
					//int msx = tx.msecsTo(QTime::currentTime());
					//INFO(QString("GPU: render took %1 ms.").arg(msx));
				} else {
					glRectf(-1,-1,1,1); 
				}

				glFinish();
				int msx = t.msecsTo(QTime::currentTime());
				INFO(QString("GPU: render took %1 ms.").arg(msx));
				
				if (animationSettings && animationSettings->isRecording()) {
					QString filename = animationSettings->getFileName();
					QImage im = grabFrameBuffer();
					INFO("Saving frame: " + filename );
					bool succes = im.save(filename);
					if (succes) {
						//INFO("Saved screenshot as: " + filename);
					} else {
						WARNING("Save failed! Filename: " + filename);
					}
				}

				if (tiles) {
					QImage im = grabFrameBuffer();
					cachedTileImages.append(im);
					INFO("Stored image: " + QString::number(cachedTileImages.count()));
				};

			}

			QTime cur = QTime::currentTime();
			long ms = t.msecsTo(cur);
			fpsCounter++;

			float fps = -1;

			// If the render takes more than 0.5 seconds, we will directly measure fps from one frame.
			if (ms>500) {
				fps = 1.0/500;
				//INFO("MS:" + QString::number(ms));
			} else {
				// Else measure over two seconds.
				long ms2 = fpsTimer.msecsTo(cur);
				if (ms2>2000 || ms2<0) {
					fps = fpsCounter/(ms2/1000.0);
					fpsTimer = cur;
					fpsCounter = 0;
				}
				//
			}


			mainWindow->setFPS(fps);
		};

		void DisplayWidget::resizeGL( int /* width */, int /* height */) {
			// When resizing the perspective must be recalculated
			requireRedraw();
			updatePerspective();
		};

		void DisplayWidget::updatePerspective() {
			if (height() == 0 || width() == 0) return;
			QString infoText = QString("[%1x%2] Aspect=%3").arg(width()).arg(height()).arg((float)width()/height());
			mainWindow-> statusBar()->showMessage(infoText, 5000);
		}

		void DisplayWidget::timerEvent(QTimerEvent*) {
			static bool firstTime = true;
			if (firstTime) {
				firstTime = false;
				updatePerspective(); 
				requireRedraw();
			}

			// Check if we are displaying a message.
			/*
			if (infoText != "" && abs((int)(textTimer.msecsTo(QTime::currentTime()))>1000)) {
			infoText = "";
			requireRedraw();
			}
			*/

			if (pendingRedraws || continuous || (animationSettings && animationSettings->isRunning())) updateGL();
		}


		void DisplayWidget::initializeGL()
		{
			requireRedraw();
			glEnable( GL_CULL_FACE );
			glEnable( GL_LIGHTING );
			glEnable( GL_DEPTH_TEST );
			glEnable( GL_NORMALIZE );
			//glMaterialfv( GL_FRONT, GL_AMBIENT_AND_DIFFUSE, agreen );
			glEnable(GL_LINE_SMOOTH);
			glEnable(GL_POINT_SMOOTH);
			glEnable(GL_POLYGON_SMOOTH);
			glHint(GL_POLYGON_SMOOTH_HINT, GL_NICEST);
		}


		void DisplayWidget::wheelEvent(QWheelEvent* e) {
			e->accept();

			//double interval = (double)e->delta() / 800.0;
			cameraControl->wheelEvent(e);
			requireRedraw();
		}

		void DisplayWidget::mouseMoveEvent( QMouseEvent *e ) {
			e->accept();
			bool redraw = cameraControl->mouseMoveEvent(e, width(), height());
			if (redraw) requireRedraw();
		}

		void DisplayWidget::mouseReleaseEvent(QMouseEvent* ev)  {
			bool redraw = cameraControl->mouseMoveEvent(ev, width(), height());
			if (redraw) requireRedraw();
			//if (contextMenu) contextMenu->exec(ev->globalPos());
		}


		void DisplayWidget::mousePressEvent(QMouseEvent* ev)  {
			bool redraw = cameraControl->mouseMoveEvent(ev, width(), height());
			if (redraw) requireRedraw();
			//if (contextMenu) contextMenu->exec(ev->globalPos());
		}



	}
}

