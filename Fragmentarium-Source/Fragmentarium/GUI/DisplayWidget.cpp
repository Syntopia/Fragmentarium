#include "DisplayWidget.h"
#include "MainWindow.h"
#include "VariableWidget.h"
#include "../../ThirdPartyCode/glextensions.h"

#include "../../ThirdPartyCode/hdrloader.h"

#include <stdio.h>

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
			previewBuffer = 0;
			doClearBackBuffer = true;
			backBuffer = 0;
			backBufferCounter = 0;
			bufferShaderProgram = 0;
			animationSettings = 0;
			shaderProgram = 0;
			bufferType = None;
			nextActiveTexture = 0;
			tileFrame = 0;
			tileFrameMax = 0;

			viewFactor = 0;
			previewFactor = 0.0;
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
			setMouseTracking(true);
			backgroundColor = QColor(30,30,30);
			contextMenu = 0;
			setupFragmentShader();
			setFocusPolicy(Qt::WheelFocus);
			timer = 0;
			maxSubFrames = 0;
		}

		void DisplayWidget::updateRefreshRate() {
			QSettings settings;
			int i = settings.value("refreshRate", 20).toInt();
			if (!timer) {
				timer = new QTimer();
				connect(timer, SIGNAL(timeout()), this, SLOT(timerSignal()));
			}
			timer->start(i);
			INFO(QString("Setting display update timer to %1 ms (max %2 FPS).").arg(i).arg(1000.0/i,0,'f',2));
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

			QString b = fragmentSource.buffer.toUpper();

			if (b=="" || b=="NONE") {
				bufferType = None;
			} else if (b == "RGBA8") {
				bufferType = RGBA8;
			} else if (b == "RGBA16") {
				bufferType = RGBA16;
			} else if (b == "RGBA32F") {
				bufferType = RGBA32F;
			} else {
				WARNING("Unknown buffertype requested: " + b + ". Type must be: NONE, RGBA8, RGBA16, RGBA32F");
				bufferType = None;
			}

			makeBuffers();
			requireRedraw();
			setupFragmentShader();
		}


		void DisplayWidget::requireRedraw() {
			if (disableRedraw && tiles==0) return;
			pendingRedraws = requiredRedraws;
			// Clear backbuffer?
			if (!tiles) clearBackBuffer();
			if (tiles && (tileFrame == 0)) clearBackBuffer();
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
			if (!shaderProgram->log().isEmpty()) INFO("Fragment shader compiled with warnings: " + shaderProgram->log());

			s = shaderProgram->bind();
			if (!s) WARNING("Could not bind shaders: " + shaderProgram->log());
			if (!s) { delete(shaderProgram); shaderProgram = 0; return; }

			// Setup textures.
			int u = 0;

			// Bind first texture to backbuffer
			int l = shaderProgram->uniformLocation("backbuffer");
			if (l != -1) {
				if (bufferType != None) {
					glActiveTexture(GL_TEXTURE0+u); // non-standard (>OpenGL 1.3) gl extension
					GLuint i = backBuffer->texture();
					glBindTexture(GL_TEXTURE_2D,i);
					shaderProgram->setUniformValue(l, (GLuint)u);

					INFO(QString("Binding back buffer (ID: %1) to active texture %2").arg(backBuffer->texture()).arg(u));

					INFO(QString("Setting uniform backbuffer to active texture %2").arg(u));


					u++;
				} else {
					WARNING("Trying to use a backbuffer, but no bufferType set.");
					WARNING("Use the buffer define, e.g.: '#buffer RGBA8' ");
				}
			}


			for (QMap<QString, QString>::iterator it = fragmentSource.textures.begin(); it!=fragmentSource.textures.end(); it++) {
				QImage im(it.value() );
				if (im.isNull() && !it.value().endsWith(".hdr", Qt::CaseInsensitive)) {
					WARNING("Failed to load texture: " + QFileInfo(it.value()).absoluteFilePath());
				} else {

					int l = shaderProgram->uniformLocation(it.key());
					if (l != -1) {
					
						if (im.isNull()) {
							
						
							GLuint texture = 0;

							// set current texture
							glActiveTexture(GL_TEXTURE0+u); // non-standard (>OpenGL 1.3) gl extension
							
							// allocate a texture id

							if (TextureCache.contains(it.value().toAscii().data())) {
								
								int textureID = TextureCache[it.value().toAscii().data()];
								glBindTexture(GL_TEXTURE_2D, textureID );
								INFO(QString("Found texture ID: %1 (%2)").arg(texture).arg(it.value().toAscii().data()));
								
							} else {
								glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
	    
								glGenTextures(1, &texture );
								INFO(QString("Allocated texture ID: %1").arg(texture));

								glBindTexture(GL_TEXTURE_2D, texture );
								glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
								glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);

								HDRLoaderResult result;
								HDRLoader::load(it.value().toAscii().data(), result);
								INFO(QString("Hdrloader: %1 x %2").arg(result.width).arg(result.height));
								glTexImage2D(GL_TEXTURE_2D, 0, 0x8815  /* GL_RGB32F*/, result.width, result.height, 0, GL_RGB, GL_FLOAT, result.cols);
			
								INFO(QString("Binding %0 (ID: %1) to active texture %2").arg(it.key()+":"+it.value()).arg(texture).arg(u));
								TextureCache[it.value().toAscii().data()] = texture;
							}

							shaderProgram->setUniformValue(l, (GLuint)u);
							INFO(QString("Setting uniform %0 to active texture %2").arg(it.key()).arg(u));

						} else {
							glActiveTexture(GL_TEXTURE0+u); // non-standard (>OpenGL 1.3) gl extension
							GLuint i = bindTexture(it.value(), GL_TEXTURE_2D, GL_RGBA);
							glBindTexture(GL_TEXTURE_2D,i);
							INFO(QString("Binding %0 (ID: %1) to active texture %2").arg(it.key()+":"+it.value()).arg(i).arg(u));

							shaderProgram->setUniformValue(l, (GLuint)u);
							INFO(QString("Setting uniform %0 to active texture %2").arg(it.key()).arg(u));

							//INFO("Setting POINT");
							glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
							glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
							//glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP);
							//glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP);

							//INFO("Binding " + it.key() + ":" + it.value() + " to " + QString::number(i) + " - " + QString::number(u) );
						}
					} else {
						WARNING("Could not locate sampler2D uniform: " + it.key());
					}
					u++;
				}
			}
			nextActiveTexture = u;
			setupBufferShader();
		}


		void DisplayWidget::setupBufferShader() {

			if (bufferShaderProgram) {
				bufferShaderProgram->release();
			}
			delete(bufferShaderProgram);
			bufferShaderProgram = 0;

			if (!fragmentSource.bufferShaderSource) return;
			
			bufferShaderProgram = new QGLShaderProgram(this);

			// Vertex shader
			bool s = false;
			s = bufferShaderProgram->addShaderFromSourceCode(QGLShader::Vertex,fragmentSource.bufferShaderSource->vertexSource.join("\n"));
			if (fragmentSource.bufferShaderSource->vertexSource.count() == 0) {
				WARNING("No buffer shader vertex shader found!");
				s = false;
			}

			if (!s) WARNING("Could not create buffer vertex shader: " + bufferShaderProgram->log());
			if (!s) { delete(bufferShaderProgram); bufferShaderProgram = 0; return; }
			if (!bufferShaderProgram->log().isEmpty()) INFO("Buffer vertex shader compiled with warnings: " + bufferShaderProgram->log());

			// Fragment shader
			s = bufferShaderProgram->addShaderFromSourceCode(QGLShader::Fragment,
				fragmentSource.bufferShaderSource->getText());
			if (!s) WARNING("Could not create buffer fragment shader: " + bufferShaderProgram->log());
			if (!s) { delete(bufferShaderProgram); bufferShaderProgram = 0; return; }
			if (!bufferShaderProgram->log().isEmpty()) INFO("Buffer fragment shader compiled with warnings: " + bufferShaderProgram->log());

			s = bufferShaderProgram->link();
			if (!s) WARNING("Could not link shaders: " + bufferShaderProgram->log());
			if (!s) { delete(bufferShaderProgram); bufferShaderProgram = 0; return; }
			if (!bufferShaderProgram->log().isEmpty()) INFO("Fragment shader compiled with warnings: " + bufferShaderProgram->log());

			s = bufferShaderProgram->bind();
			if (!s) WARNING("Could not bind shaders: " + bufferShaderProgram->log());
			if (!s) { delete(shaderProgram); bufferShaderProgram = 0; return; }
		}


		void DisplayWidget::setupTileRender(int tiles, int tileFrameMax, QString fileName) {
			outputFile = fileName;
			this->tiles = tiles;
			tilesCount = 0;
			this->tileFrameMax = tileFrameMax;
			this->tileFrame = 0;
			requireRedraw();
			tileRenderStart = QDateTime::currentDateTime();
		}

		void DisplayWidget::tileRender() {
			glLoadIdentity();
			if (!tiles && viewFactor==0) return;
			if (!tiles && viewFactor > 0) {
				glScalef(1.0/(viewFactor+1.0),1.0/(viewFactor+1.0),1.0);
				return;	
			}
			
			if (tilesCount==tiles*tiles) {
				int s = tileRenderStart.secsTo(QDateTime::currentDateTime());
				INFO(QString("Tile rendering complete in %1 seconds").arg(s));
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
				tiles = 0;

				bool succes = im.save(outputFile);
				if (succes) {
					INFO("Saved image as: " + outputFile);
				} else {
					WARNING("Save failed! Filename: " + outputFile);
				}

			    s = tileRenderStart.secsTo(QDateTime::currentDateTime());
				INFO(QString("Render + recombination completed in %1 seconds").arg(s));
				
				tileFrame = 0;
				tileFrameMax = 0;
				return;
			}

			if (tileFrameMax) {
				if (tileFrame == 0) {
					//clearBackBuffer();
				}
				INFO(QString("Rendering tile %1 of %2, subframe %3 of %4").arg(tilesCount+1).arg(tiles*tiles)
					.arg(tileFrame).arg(tileFrameMax));
			} else {
				INFO(QString("Rendering tile: %1 of %2").arg(tilesCount+1).arg(tiles*tiles));

			}
			float x = (tilesCount / tiles) - (tiles-1)/2.0;
			float y = (tilesCount % tiles) - (tiles-1)/2.0;

			glLoadIdentity();
			glTranslatef( x * (2.0/tiles) , y * (2.0/tiles), 1.0);
			glScalef( 1.0/tiles,1.0/tiles,1.0);	

			if (tileFrame >= tileFrameMax-1) {
				tilesCount++;
				tileFrame = 0;
			} else {
				tileFrame++;
			}
		}

		void DisplayWidget::setViewFactor(int val) {
			viewFactor = val;
			requireRedraw();
		}

		void DisplayWidget::resetCamera(bool fullReset) {
			if (!cameraControl) return;
			cameraControl->reset(fullReset);
		}

		void DisplayWidget::setPreviewFactor(int val) {
			previewFactor = val;
			makeBuffers();
			requireRedraw();
		};

		void DisplayWidget::makeBuffers() {
			makeCurrent();

			delete(previewBuffer); previewBuffer = 0;
			delete(backBuffer); backBuffer = 0;

			int w = width()/(previewFactor+1);
			int h = height()/(previewFactor+1);

			GLenum type = GL_RGBA8;
			QString b = "None";
			if (bufferType==RGBA8) { b = "RGBA8"; }
			else if (bufferType==RGBA16) { b = "RGBA16";  type = GL_RGBA16; }
			else if (bufferType==RGBA32F)  { b = "RGBA32F";  type = 0x8814 /*GL_RGBA32F*/; } 
			else b = "UNKNOWN";

			if (bufferType==None) {
				if (previewFactor==0) {
					INFO(QString("No buffers. Direct render as %1x%2 %3.").arg(w).arg(h).arg("RGBA8"));
				} else {
					previewBuffer = new QGLFramebufferObject(w, h, QGLFramebufferObject::NoAttachment, GL_TEXTURE_2D, type);
					INFO(QString("Created front buffer as %1x%2 %3.").arg(w).arg(h).arg("RGBA8"));
				}
			} else {
				// we must create both the backbuffer and previewBuffer
				backBuffer = new QGLFramebufferObject(w, h, QGLFramebufferObject::NoAttachment, GL_TEXTURE_2D, type);
				previewBuffer = new QGLFramebufferObject(w, h, QGLFramebufferObject::NoAttachment, GL_TEXTURE_2D, type);
				
				INFO(QString("Created front and back buffers as %1x%2 %3.").arg(w).arg(h).arg(b));
			}

			clearBackBuffer();

		}	

		void DisplayWidget::clearBackBuffer() {
			doClearBackBuffer = true;		
			
		}

		void DisplayWidget::drawFragmentProgram(int w,int h) {
			shaderProgram->bind();

			glDisable( GL_CULL_FACE );
			glDisable( GL_LIGHTING );
			glDisable( GL_DEPTH_TEST );

			// -- Viewport
			glViewport( 0, 0,w, h);

			// -- Projection
			// The projection mode as used here
			// allow us to render only a region of the viewport.
			// This allows us to perform tile based rendering.
			glMatrixMode(GL_PROJECTION);
			tileRender();

			cameraControl->transform(width(), height());

			int l = shaderProgram->uniformLocation("pixelSize");
			if (l != -1) {
				shaderProgram->setUniformValue(l, (float)(1.0/w),(float)(1.0/h));
			}

			l = shaderProgram->uniformLocation("time");
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
			}

			if (bufferType!=None) {
				l = shaderProgram->uniformLocation("backbuffer");
				if (l != -1) {
					glActiveTexture(GL_TEXTURE0); // non-standard (>OpenGL 1.3) gl extension
					GLuint i = backBuffer->texture();
					glBindTexture(GL_TEXTURE_2D,i);
					shaderProgram->setUniformValue(l, 0);
					//INFO(QString("Binding backbuffer (ID: %1) to active texture %2").arg(i).arg(0));
					//INFO(QString("Setting uniform backbuffer to active texture %2").arg(0));
				}

				l = shaderProgram->uniformLocation("backbufferCounter");
				if (l != -1) {
					shaderProgram->setUniformValue(l, backBufferCounter);
				}
			}

			// Setup User Uniforms
			mainWindow->setUserUniforms(shaderProgram);
			glColor3d(1.0,1.0,1.0);

			if (disableRedraw) {
				QTime tx = QTime::currentTime();
				glRectf(-1,-1,1,1); 
				//glFinish();
				//int msx = tx.msecsTo(QTime::currentTime());
				//INFO(QString("GPU: render took %1 ms.").arg(msx));
			} else {
				glRectf(-1,-1,1,1); 
			}

			glFinish();// <-- should we call this?
			shaderProgram->release();

		   

		}

		void DisplayWidget::drawToFrameBufferObject() {
			if (previewBuffer == 0 || !previewBuffer->isValid()) {
				WARNING("Non valid FBO");
				return;
			}
			if (!previewBuffer->bind()) { WARNING("Failed to bind FBO"); return; } 
			QSize s = previewBuffer->size();
			//INFO(QString("* Drawing to front buffer, ID: %1").arg(previewBuffer->texture()));
			drawFragmentProgram(s.width(),s.height());
			if (!previewBuffer->release()) { WARNING("Failed to release FBO"); return; } 

			// Draw a textured quad using the preview texture.
			if (bufferShaderProgram) {
				bufferShaderProgram->bind();
				int l = bufferShaderProgram->uniformLocation("frontbuffer");
				if (l != -1) {
					bufferShaderProgram->setUniformValue(l, 0);
				} else {
					WARNING("No front buffer sampler found in buffer shader. This doesn't make sense.");
				}
				mainWindow->setUserUniforms(bufferShaderProgram);
			
			}
			//glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
			glMatrixMode(GL_PROJECTION);
			glLoadIdentity();
			glMatrixMode(GL_MODELVIEW);
			glLoadIdentity();
			glViewport(0, 0, width(),height());
			glActiveTexture(GL_TEXTURE0); // non-standard (>OpenGL 1.3) gl extension	
			glBindTexture(GL_TEXTURE_2D, previewBuffer->texture());
			//INFO(QString("Binding front buffer (ID: %1) to active texture %2").arg(previewBuffer->texture()).arg(nextActiveTexture));
			//INFO(QString("* Drawing from front to screen buffer, ID: %1").arg(previewBuffer->texture()));

			glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
			glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
			glEnable(GL_TEXTURE_2D);
			glBegin(GL_QUADS);
			glTexCoord2f(0.0f, 0.0f); glVertex3f(-1.0f, -1.0f,  0.0f);	
			glTexCoord2f(1.0f, 0.0f); glVertex3f( 1.0f, -1.0f,  0.0f);	
			glTexCoord2f(1.0f, 1.0f); glVertex3f( 1.0f,  1.0f,  0.0f);	
			glTexCoord2f(0.0f, 1.0f); glVertex3f(-1.0f,  1.0f,  0.0f);	
			
			
			glEnd();
			if (bufferShaderProgram) bufferShaderProgram->release();

		}

		void DisplayWidget::paintGL() {
			// Show info first time we display something...
			static bool shownInfo = false;
			if (!shownInfo) {
				shownInfo = true;
				INFO("This video card supports: " + GetOpenGLFlags().join(", "));
			}
			if (height() == 0 || width() == 0) return;
		

			if (pendingRedraws > 0) pendingRedraws--;

			if (disabled || !shaderProgram) {
				qglClearColor(backgroundColor);
				glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );
				return;
			}


			
			

			if (doClearBackBuffer && backBuffer) {
				if (!backBuffer->bind()) { WARNING("Failed to bind backbuffer BFO"); return; } 
				glClearColor(0.0f,0.0f,0.0f,0.0f);
				glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

				if (!backBuffer->release()) { WARNING("Failed to release backbuffer FBO");  } 
				backBufferCounter = 0;
				doClearBackBuffer = false;
			}

			if (!(animationSettings && animationSettings->isRecording()) && !tiles) {
				if (backBuffer && backBufferCounter>=maxSubFrames && maxSubFrames>0) {
					return;
				}
			}

			QTime t = QTime::currentTime();

			if (previewBuffer) {
				drawToFrameBufferObject();
			} else {
				drawFragmentProgram(width(),height());
			}

			//INFO("Painting");
			//int msx = t.msecsTo(QTime::currentTime());
			//INFO(QString("GPU: render took %1 ms.").arg(msx));

			// Animation
			if (animationSettings && animationSettings->isRecording()) {
				QString filename = animationSettings->getFileName();
				QImage im = grabFrameBuffer();
				INFO("Saving frame: " + filename );
				bool succes = im.save(filename);
				if (!succes) {
					WARNING("Save failed! Filename: " + filename);
				}
			}


			// Tile based rendering
			if (tiles) {
				if (!tileFrameMax || (tileFrame == 0)) {
					QImage im = grabFrameBuffer();
				//	QImage im = previewBuffer->toImage();
					cachedTileImages.append(im);
					INFO("Stored image: " + QString::number(cachedTileImages.count()));
				}
			};

			if (backBuffer) {
				QGLFramebufferObject* temp = backBuffer;
				backBuffer= previewBuffer;
				previewBuffer = temp;	
				backBufferCounter++;
				mainWindow->setSubFrameDisplay(backBufferCounter);
			}


			QTime cur = QTime::currentTime();
			long ms = t.msecsTo(cur);
			fpsCounter++;
			float fps = -1;

			// If the render takes more than 0.5 seconds, we will directly measure fps from one frame.
			if (ms>500) {
				fps = 1000.0f/((float)ms);
			} else {
				// Else measure over two seconds.
				long ms2 = fpsTimer.msecsTo(cur);
				if (ms2>2000 || ms2<0) {
					fps = fpsCounter/(ms2/1000.0);
					fpsTimer = cur;
					fpsCounter = 0;
				}
			}

			mainWindow->setFPS(fps);
			 if (tiles) requireRedraw();

		};

		void DisplayWidget::resizeGL( int /* width */, int /* height */) {
			// When resizing the perspective must be recalculated
			updatePerspective();
			QTimer::singleShot(500, this, SLOT(clearPreviewBuffer()));

		};

		void DisplayWidget::updatePerspective() {
			if (height() == 0 || width() == 0) return;
			QString infoText = QString("[%1x%2] Aspect=%3").arg(width()).arg(height()).arg((float)width()/height());
			mainWindow-> statusBar()->showMessage(infoText, 5000);
		}

		void DisplayWidget::timerSignal() {
			static bool firstTime = true;
			if (firstTime) {
				firstTime = false;
				updatePerspective(); 
				requireRedraw();
			}

			if (this != QApplication::focusWidget () && cameraControl) cameraControl->releaseControl();
			if (cameraControl && cameraControl->wantsRedraw()) {
				requireRedraw(); 
				cameraControl->updateState();
			}

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

			cameraControl->wheelEvent(e);
			requireRedraw();
		}

		void DisplayWidget::mouseMoveEvent( QMouseEvent *e ) {
			e->accept();
			bool redraw = cameraControl->mouseEvent(e, width(), height());
			if (redraw) requireRedraw();
		}

		void DisplayWidget::mouseReleaseEvent(QMouseEvent* ev)  {
			bool redraw = cameraControl->mouseEvent(ev, width(), height());
			if (redraw) requireRedraw();
			//if (contextMenu) contextMenu->exec(ev->globalPos());
		}


		void DisplayWidget::mousePressEvent(QMouseEvent* ev)  {
			bool redraw = cameraControl->mouseEvent(ev, width(), height());
			if (redraw) { 
				requireRedraw(); 
			}
			//if (contextMenu) contextMenu->exec(ev->globalPos());
		}

		void DisplayWidget::keyPressEvent(QKeyEvent* ev) {
			bool redraw = cameraControl->keyPressEvent(ev);
			if (redraw) {
				requireRedraw();
				ev->accept();
			} else {
				QGLWidget::keyPressEvent(ev);
			}
		}

		void DisplayWidget::clearPreviewBuffer() {
			INFO("Rebuilding buffers after resize.");
			setPreviewFactor(previewFactor);
			requireRedraw();
		}



		void DisplayWidget::keyReleaseEvent(QKeyEvent* ev) {
			bool redraw = cameraControl->keyPressEvent(ev);
			if (redraw) {
				requireRedraw();
				ev->accept();
			} else {
				QGLWidget::keyReleaseEvent(ev);
			}
		}



	}
}

