#include "DisplayWidget.h"
#include "MainWindow.h"
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

			class Camera3D : public CameraControl {
			public:
				Camera3D(QStatusBar* statusBar) : statusBar(statusBar) { 
					reset(); 
				};

				virtual QString getID() { return "3D"; };


				virtual void reset() { 
					rotation = Matrix4f::Identity();
					scale = 1.0f;
					translation = Vector3f(0,0,0);
				}

				Vector3f screenTo3D(int sx, int sy, int sz) {
					GLdouble x, y, z;
					gluUnProject(sx, height-sy, sz, modelViewCache, projectionCache, viewPortCache, &x, &y ,&z);
					return Vector3f(x,y,z);
				}

				virtual void leftMouseButtonDrag(double /*x*/, double /*y*/, double rx, double ry) {
					double rotateSpeed = 5.0;
					//Vector3f startPoint = screenTo3D(x, y,1);
					//Vector3f xDir = (screenTo3D(x+10, y,1) - startPoint).normalized() ;
					//Vector3f yDir = (screenTo3D(x, y+10,1) - startPoint).normalized() ;
					Matrix4f mx = Matrix4f::Rotation(Vector3f(1.0,0,0), -ry*rotateSpeed);
					Matrix4f my = Matrix4f::Rotation(Vector3f(0.0,1.0,0), -rx*rotateSpeed);
					rotation = rotation * my * mx;
				};

				virtual void rightMouseButtonDrag(double /*x*/, double /*y*/, double rx, double ry) {
					translation = translation + 5.0*Vector3f(-rx,ry,0);
					if (statusBar) statusBar->showMessage(QString("Translation: %1").arg(translation.toString()),5000);
			
				};

				virtual void bothMouseButtonDrag(double /*x*/, double /*y*/, double rx, double ry) {
					if (ry > 0) {
						scale/=(1.0+2*ry);
					} else {
						scale*=(1.0-2*ry);
					}
					translation = translation + 10.0*Vector3f(0,0,rx);
					
				};

				virtual void wheel(double /*x*/, double /*y*/, double val) {	
					if ( scale <= val ) return;
					scale -= val;
					
				};

				virtual Vector3f transform(int width, int height) {
					this->height = height;
					this->width = width;

					// -- Viewport
					glViewport( 0, 0, width, height);

					// -- Projection
					glMatrixMode(GL_PROJECTION);
					glLoadIdentity();
					//gluPerspective(23.0,(float) width / (float) height, 5.0, 106.0);

					// -- Modelview
					glMatrixMode(GL_MODELVIEW);
					glLoadIdentity();
					//glTranslatef( -pivot.x(), -pivot.y(), -pivot.z() );
					//Vector3f pivot = Vector3f(0,0,0);	
					//Vector3f translation = Vector3f(0,0,-20);
					glMultMatrixf(rotation.getArray());
					glTranslatef( translation.x(), translation.y(), translation.z() );
					//glScalef( 1.0, (height/(float)width), 1.0);
					glScalef( scale, scale*(height/(float)width), 1.0 );
					
					glGetDoublev(GL_MODELVIEW_MATRIX, modelViewCache );
					glGetDoublev(GL_PROJECTION_MATRIX, projectionCache );
					glGetIntegerv(GL_VIEWPORT, viewPortCache);

					if (statusBar) statusBar->showMessage(QString("Scale: %0, Translation: %1").arg(scale).arg(translation.toString()),5000);
			
					return Vector3f(1.0,1.0,1.0);
				};

				QString getVertexShader() {
					return QString(
						"varying vec3 fromDx;\n"
						"varying vec3 toDx;\n"
						"varying vec3 fromDy;\n"
						"varying vec3 toDy;\n"
						"varying vec3 from;\n"
						"varying vec3 to;\n"
						"uniform vec2 pixelSize;\n"
						"void main(void)\n"
						"{\n"
						"   gl_Position =  gl_Vertex;\n"
						"   float fx = 2.0;\n"
						"   float fy = 2.0;\n"
						"   from = (gl_ModelViewMatrix*vec4(gl_Vertex.x, gl_Vertex.y, 1.0,1.0)).xyz;\n"
						"   to = (gl_ModelViewMatrix*vec4(gl_Vertex.x*fx, gl_Vertex.y*fy, -1.0,1.0)).xyz;\n"
						"   fromDy = (gl_ModelViewMatrix*vec4(gl_Vertex.x, gl_Vertex.y+pixelSize.y, 1.0,1.0)).xyz - from;\n"
						"   toDy = (gl_ModelViewMatrix*vec4(gl_Vertex.x*fx, (gl_Vertex.y+pixelSize.y)*fy, -1.0,1.0)).xyz - to;\n"
						"   fromDx = (gl_ModelViewMatrix*vec4(gl_Vertex.x+pixelSize.x, gl_Vertex.y, 1.0,1.0)).xyz- from;\n"
						"   toDx = (gl_ModelViewMatrix*vec4((gl_Vertex.x+pixelSize.x)*fx, gl_Vertex.y*fy, -1.0,1.0)).xyz - to;\n"
						"}");
					// 
				}
			private:
				Vector3f translation ;
				float scale;
				int height;
				int width;
				Matrix4f rotation;
				QStatusBar* statusBar;
				GLdouble modelViewCache[16];
				GLdouble projectionCache[16];
				GLint viewPortCache[16];
			};

			class Camera2D : public CameraControl {
			public:
				Camera2D(QStatusBar* statusBar) : statusBar(statusBar) { reset(); };

				virtual QString getID() { return "2D"; };

				virtual void reset() { 
					scale = 1.0; 
					x = 0;
					y = 0;
				}

				virtual void leftMouseButtonDrag(double /*x*/, double /*y*/, double rx, double ry) {
					this->x+= -rx*scale*2.0;
					this->y+= ry*scale*2.0;
				};

				virtual void rightMouseButtonDrag(double /*x*/, double /*y*/, double /*rx*/, double /*ry*/) {
				};

				virtual void bothMouseButtonDrag(double /*x*/, double /*y*/, double /*rx*/, double ry) {
					if (ry > 0) {
						scale/=(1.0+2*ry);
					} else {
						scale*=(1.0-2*ry);
					}
				};

				virtual void wheel(double /*x*/, double /*y*/, double val) {
					if (val > 0) {
						scale/=(1.0+val/10);
					} else {
						scale*=(1.0-val/10);
					}
					
				};

				virtual Vector3f transform(int width, int height) {
					glViewport(0,0,width,height);
					glMatrixMode(GL_PROJECTION);
					glLoadIdentity();
					gluOrtho2D(-1,-1,1,1);
					glMatrixMode(GL_MODELVIEW);
					glLoadIdentity();glTranslatef(x,y,0);
					glScalef(scale,scale*(height/(float)width),scale);
					if (statusBar) statusBar->showMessage(QString("Scale: %1").arg(scale),5000);
					return Vector3f(scale,scale*(height/(float)width),scale);
				};

				QString getVertexShader() {
					return QString(
						"varying vec2 coord;\n"
						"void main(void)\n"
						"{\n"
						"   gl_Position =  gl_Vertex;\n"
						"   coord = (gl_ModelViewProjectionMatrix * gl_Vertex).xy;\n "
						"}");
				}
			private:
				float scale;
				float x;
				float y;
				QStatusBar* statusBar;
			};
		}

		DisplayWidget::DisplayWidget(QGLFormat format, MainWindow* mainWindow, QWidget* parent) 
			: QGLWidget(parent), mainWindow(mainWindow) 
		{
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
			oldPos = QPoint(0,0);


			setMouseTracking(true);

			backgroundColor = QColor(30,30,30);
			contextMenu = 0;

			rmbDragging = false;

			doingRotate = false;
			shaderProgram = 0;


			setupFragmentShader();
		}


		void DisplayWidget::paintEvent(QPaintEvent * ev) {
			QGLWidget::paintEvent(ev);
		}



		DisplayWidget::~DisplayWidget() {
		}

		void DisplayWidget::mouseReleaseEvent(QMouseEvent* ev)  {
			doingRotate = false;

			if (ev->button() != Qt::RightButton) return;
			if (rmbDragging) { return; }
			if (contextMenu) contextMenu->exec(ev->globalPos());
		}



		void DisplayWidget::contextMenuEvent(QContextMenuEvent* /*ev*/ ) {
		}


		void DisplayWidget::reset() {
			updatePerspective();
			cameraControl->reset();
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
			bool s = shaderProgram->addShaderFromSourceCode(QGLShader::Vertex,
				cameraControl->getVertexShader());
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




		void DisplayWidget::paintGL() {
			// Show info first time we display something...

			static bool shownInfo = false;
			if (!shownInfo) {
				shownInfo = true;
				INFO("This video card supports: " + GetOpenGLFlags().join(", "));
			}
		
			if (pendingRedraws > 0) pendingRedraws--;
			static int count = 0;
			//INFO(QString("frame:%1").arg(count++));

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

				static int i = 0;
				//INFO(QString("Drawing: %1").arg(i++));

				// Setup Magic Uniforms
				Vector3f scale = cameraControl->transform(width(), height())*2;
				if (fragmentSource.hasPixelSizeUniform || true) {
					int l = shaderProgram->uniformLocation("pixelSize");
					if (l == -1) {
						WARNING("Could not find pixelSize");
					} else {
						shaderProgram->setUniformValue(l, (float)(scale.x()/width()),(float)(scale.y()/height()));
					}
				}

				int l = shaderProgram->uniformLocation("time");
				if (l != -1) {
					float t = (time.msecsTo(QTime::currentTime())/1000.0);
					shaderProgram->setUniformValue(l, (float)t);
					//INFO(QString("Time:%1").arg(t));
				}

				// Setup User Uniforms
				mainWindow->setUserUniforms(shaderProgram);
				glColor3d(1.0,1.0,1.0);
				glRectf(-1,-1,1,1); 
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
			if (height() == 0) return;

			GLfloat w = (float) width() / (float) height();
			infoText = QString("[%1x%2] Aspect=%3").arg(width()).arg(height()).arg((float)width()/height());
			textTimer = QTime::currentTime();
			GLfloat h = 1.0;

			glViewport( 0, 0, width(), height() );
			glMatrixMode(GL_PROJECTION);
			glLoadIdentity();

			//settings.perspectiveAngle = 90;
			//			gluPerspective(settings.perspectiveAngle, w,  (float)settings.nearClipping, (float)settings.farClipping);
			glOrtho( -w, w, -h, h, (float)0, (float) 60 );
		}

		void DisplayWidget::timerEvent(QTimerEvent*) {
			static bool firstTime = true;
			if (firstTime) {
				firstTime = false;
				updatePerspective(); 
				requireRedraw();
				infoText = "";
			}

			// Check if we are displaying a message.
			if (infoText != "" && abs((int)(textTimer.msecsTo(QTime::currentTime()))>1000)) {
				infoText = "";
				requireRedraw();
			}

			if (pendingRedraws || continuous) updateGL();
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

			double interval = (double)e->delta() / 800.0;
			cameraControl->wheel(e->pos().x(), e->pos().y(), interval);
			requireRedraw();
		}

		void DisplayWidget::mouseMoveEvent( QMouseEvent *e ) {
			e->accept();

			// store old position
			if (oldPos.x() == 0 && oldPos.y() == 0) {
				// first time
				oldPos = e->pos(); 
				return;
			}
			double dx = e->x() - oldPos.x();
			double dy = e->y() - oldPos.y();

			// normalize wrt screen size
			double rx = dx / width();
			double ry = dy / height();

			oldPos = e->pos();

			if ( (e->buttons() == Qt::LeftButton && e->modifiers() == Qt::ShiftModifier ) 
				|| e->buttons() == (Qt::LeftButton | Qt::RightButton )) 
			{
				doingRotate = true;

				// 1) dragging with left mouse button + shift down, or
				// 2) dragging with left and right mouse button down
				//
				// This results in zooming for vertical movement, and Z axis rotation for horizontal movement.

				cameraControl->bothMouseButtonDrag(e->pos().x(), e->pos().y(),rx,ry);
				requireRedraw();

				if (e->buttons() == (Qt::LeftButton | Qt::RightButton ))  {
					rmbDragging = true;
				}
			} else if ( ( e->buttons() == Qt::RightButton ) 
				|| (e->buttons() == Qt::LeftButton && e->modifiers() == Qt::ControlModifier ) 
				|| (e->buttons() == Qt::LeftButton && e->modifiers() == Qt::MetaModifier ) ) 
			{ 
				doingRotate = true;
				// 1) dragging with right mouse button, 
				// 2) dragging with left button + control button,
				// 3) dragging with left button + meta button (Mac)
				//
				// results in translation
				if (rx != 0 || ry != 0) {
					cameraControl->rightMouseButtonDrag(e->pos().x(), e->pos().y(),rx, ry);
					requireRedraw();
					rmbDragging = true;
				} 
			} else if ( e->buttons() == Qt::LeftButton ) {
				doingRotate = true;
				// Dragging with left mouse button.
				cameraControl->leftMouseButtonDrag(e->pos().x(), e->pos().y(),rx, ry);
				requireRedraw();
				rmbDragging = false;
			} else {
				rmbDragging = false;
			}
		}


	}
}

