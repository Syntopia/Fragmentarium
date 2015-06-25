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
            // Literal names for OpenGL flags
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
                if (f & QGLFormat::OpenGL_Version_3_1) s.append("OpenGL3.1");
                if (f & QGLFormat::OpenGL_Version_3_2) s.append("OpenGL3.2");
                if (f & QGLFormat::OpenGL_Version_3_3) s.append("OpenGL3.3");
                if (f & QGLFormat::OpenGL_Version_4_0) s.append("OpenGL4.0");
#if (QT_VERSION > QT_VERSION_CHECK(4,9,9))
                // support Debian Wheezy's old Qt version
                if (f & QGLFormat::OpenGL_Version_4_1) s.append("OpenGL4.1");
                if (f & QGLFormat::OpenGL_Version_4_2) s.append("OpenGL4.2");
                if (f & QGLFormat::OpenGL_Version_4_3) s.append("OpenGL4.3");
#endif
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
            clearOnChange = true;
            drawingState = Progressive;
            hiresBuffer = 0;
            iterationsBetweenRedraws = 0;
            previewBuffer = 0;
            doClearBackBuffer = true;
            backBuffer = 0;
            subframeCounter = 0;
            bufferShaderProgram = 0;
            shaderProgram = 0;
            bufferType = None;
            nextActiveTexture = 0;
            tileFrame = 0;
            tileFrameMax = 0;
            viewFactor = 0;
            previewFactor = 0.0;
            tilesCount = 0;
            fitWindow = true;
            bufferSizeX=0;
            bufferSizeY=0;
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
            requireRedraw(true);
            setupFragmentShader();
        }

        void DisplayWidget::setFragmentShader(FragmentSource fs) {
            fragmentSource = fs;
            clearOnChange = fs.clearOnChange;
            iterationsBetweenRedraws = fs.iterationsBetweenRedraws;
            if (fs.subframeMax != -1) {
                mainWindow->setSubframeMax(fs.subframeMax );
            }

            // Camera setup
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

            // Buffer setup
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
            requireRedraw(true);
            setupFragmentShader();
        }


        void DisplayWidget::requireRedraw(bool clear) {
            if (disableRedraw) return;
            pendingRedraws = requiredRedraws;
            if (clear) {
                clearBackBuffer();
            } else {
                subframeCounter = 0;
            }
        }

        void DisplayWidget::uniformsHasChanged() {
            requireRedraw(clearOnChange);
        }

        namespace {
            void setGlTexParameter(QMap<QString, QString> map) {
                QMapIterator<QString, QString> i(map);
                while (i.hasNext()) {
                    i.next();
                    QString key = i.key();
                    QString value = i.value();
                    GLenum k = 0;
                    if (key == "GL_TEXTURE_WRAP_S") {
                        k = GL_TEXTURE_WRAP_S;
                    } else if (key == "GL_TEXTURE_WRAP_T") {
                        k = GL_TEXTURE_WRAP_T;
                    } else if (key == "GL_TEXTURE_MIN_FILTER") {
                        k = GL_TEXTURE_MIN_FILTER;
                    } else if (key == "GL_TEXTURE_MAG_FILTER") {
                        k = GL_TEXTURE_MAG_FILTER;
                    } else {
                        WARNING("Unable to parse TexParameter key: " + key);
                        continue;
                    }

                    GLint v = 0;
                    if (value == "GL_CLAMP") {
                        v = GL_CLAMP;
                    } else if (value == "GL_REPEAT") {
                        v = GL_REPEAT;
                    } else if (value == "GL_NEAREST") {
                        v = GL_NEAREST;
                    } else if (value == "GL_LINEAR") {
                        v = GL_LINEAR;
                    } else {
                        WARNING("Unable to parse TexParameter value: " + value);
                        continue;
                    }
                    glTexParameteri(GL_TEXTURE_2D, k, v);
                }
            }
        }

        void DisplayWidget::setupFragmentShader() {
            QMap<QString, bool> textureCacheUsed;

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
                    if (fragmentSource.textureParams.contains("backbuffer")) {
                        setGlTexParameter(fragmentSource.textureParams["backbuffer"]);

                    }
                    shaderProgram->setUniformValue(l, (GLuint)u);
                    //INFO(QString("Binding back buffer (ID: %1) to active texture %2").arg(backBuffer->texture()).arg(u));
                    //INFO(QString("Setting uniform backbuffer to active texture %2").arg(u));
                    u++;
                } else {
                    WARNING("Trying to use a backbuffer, but no bufferType set.");
                    WARNING("Use the buffer define, e.g.: '#buffer RGBA8' ");
                }
            } else {
                // Apparently we must always bind the backbuffer texture.
                // FIX: this indicates an error in the later binding of user textures.
                glActiveTexture(GL_TEXTURE0+u); // non-standard (>OpenGL 1.3) gl extension
                u++;
            }


            for (QMap<QString, QString>::iterator it = fragmentSource.textures.begin(); it!=fragmentSource.textures.end(); it++) {
                QString textureName = it.key();
                QString texturePath = it.value();
                QImage im(texturePath);
                if (im.isNull() && !texturePath.endsWith(".hdr", Qt::CaseInsensitive)) {
                    WARNING("Failed to load texture: " + QFileInfo(texturePath).absoluteFilePath());
                } else {
                    int l = shaderProgram->uniformLocation(textureName);
                    if (l != -1) {
                        if (im.isNull()) {

                            GLuint texture = 0;

                            // set current texture
                            glActiveTexture(GL_TEXTURE0+u); // non-standard (>OpenGL 1.3) gl extension

                            // allocate a texture id

                            if (TextureCache.contains(texturePath)) {
                                textureCacheUsed[texturePath] = true;
                                int textureID = TextureCache[texturePath];
                                glBindTexture(GL_TEXTURE_2D, textureID );
                                INFO(QString("Found texture in cache: %1 (id: %2)").arg(texturePath).arg(textureID));
                            } else {
                                glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

                                glGenTextures(1, &texture );
                                INFO(QString("Allocated texture ID: %1").arg(texture));

                                glBindTexture(GL_TEXTURE_2D, texture );
                                //glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

                                // TODO: If I don't keep this line, HDR images don't work.
                                // It must be a symptom of some kind of error in the OpenGL setup.
                                //
                                // UPDATE: This disables the mip-mapping. There is probably a good
                                // reason why mip-mapping doesn't work (floats unsupported? Not a power-of two?)
                                glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
                                if (fragmentSource.textureParams.contains(textureName)) {
                                    setGlTexParameter(fragmentSource.textureParams[textureName]);
                                }

                                HDRLoaderResult result;
                                HDRLoader::load(texturePath.toLatin1().data(), result);
                                INFO(QString("Hdrloader found HDR image: %1 x %2").arg(result.width).arg(result.height));
                                glTexImage2D(GL_TEXTURE_2D, 0, 0x8815  , result.width, result.height, 0, GL_RGB, GL_FLOAT, result.cols);

                                //INFO(QString("Binding %0 (ID: %1) to active texture %2").arg(textureName+":"+texturePath).arg(texture).arg(u));
                                TextureCache[texturePath] = texture;
                                textureCacheUsed[texturePath] = true;
                            }

                            shaderProgram->setUniformValue(l, (GLuint)u);
                            //INFO(QString("Setting uniform %0 to active texture %2").arg(textureName).arg(u));

                        } else {
                            glActiveTexture(GL_TEXTURE0+u); // non-standard (>OpenGL 1.3) gl extension
                            GLuint textureID;
                            if (TextureCache.contains(texturePath)) {
                                textureCacheUsed[texturePath] = true;
                                textureID = TextureCache[texturePath];
                                INFO(QString("Found texture in cache: %1").arg(texturePath));
                            } else {
                                textureID = bindTexture(texturePath, GL_TEXTURE_2D, GL_RGBA);
                                TextureCache[texturePath] = textureID;
                                textureCacheUsed[texturePath] = true;
                            }
                            glBindTexture(GL_TEXTURE_2D,textureID);

                            // Disable mip-mapping per default.
                            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);

                            //INFO(QString("Binding %0 (ID: %1) to active texture %2").arg(textureName+":"+texturePath).arg(textureID).arg(u));

                            shaderProgram->setUniformValue(l, (GLuint)u);
                            //INFO(QString("Setting uniform %0 to active texture %2").arg(textureName).arg(u));

                            if (fragmentSource.textureParams.contains(textureName)) {
                                setGlTexParameter(fragmentSource.textureParams[textureName]);
                            }
                        }
                    } else {
                        WARNING("Could not locate sampler2D uniform: " + textureName);
                    }
                    u++;
                }
            }
            nextActiveTexture = u;
            setupBufferShader();

            clearTextureCache(&textureCacheUsed);

        }

        void DisplayWidget::clearTextureCache(QMap<QString, bool>* textureCacheUsed) {
            if (textureCacheUsed) {
                // Check for unused textures
                QMutableMapIterator<QString, int> i(TextureCache);
                while (i.hasNext()) {
                    i.next();
                    if (!textureCacheUsed->contains(i.key())) {
                        INFO("Removing texture from cache: " +i.key());
                        GLuint id = i.value();
                        glDeleteTextures(1, &id);
                        i.remove();
                    }
                }
            } else {
                QMapIterator<QString, int> i(TextureCache);
                while (i.hasNext()) {
                    i.next();
                    INFO("Removing texture from cache: " +i.key());
                    GLuint id = i.value();
                    glDeleteTextures(1, &id);
                }
                TextureCache.clear();
            }
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

        void DisplayWidget::tileRender() {
            if (getState() == DisplayWidget::Tiled) {
                float x = (tilesCount / tiles) - (tiles-1)/2.0;
                float y = (tilesCount % tiles) - (tiles-1)/2.0;

                glLoadIdentity();

                glTranslatef( x * (2.0/tiles) , y * (2.0/tiles), 1.0);
                glScalef( (1.0+padding)/tiles,(1.0+padding)/tiles,1.0);
            }
        }

        void DisplayWidget::setViewFactor(int val) {
            viewFactor = val;
            requireRedraw(true);
        }

        void DisplayWidget::resetCamera(bool fullReset) {
            if (!cameraControl) return;
            cameraControl->reset(fullReset);
        }

        void DisplayWidget::setPreviewFactor(int val) {
            previewFactor = val;
            makeBuffers();
            requireRedraw(true);
        }

        void DisplayWidget::makeBuffers() {
            makeCurrent();

            int w = pixelWidth()/(previewFactor+1);
            int h = pixelHeight()/(previewFactor+1);



            if (bufferSizeX!=0) {
                w = bufferSizeX;
                h = bufferSizeY;
            }

            GLenum type = GL_RGBA8;
            QString b = "None";
            b = "RGBA8"; // As of now, we never do direct renders. Always two buffers.
            if (bufferType==RGBA8) { b = "RGBA8"; }
            else if (bufferType==RGBA16) { b = "RGBA16";  type = GL_RGBA16; }
            else if (bufferType==RGBA32F)  { b = "RGBA32F";  type = 0x8814 /*GL_RGBA32F*/; }
            else b = "UNKNOWN";

            QString bufferString;
            if (bufferType==None) {
                if (false && previewFactor==0) {
                    bufferString = QString("No buffers. Direct render as %1x%2 %3.").arg(w).arg(h).arg("RGBA8");
                } else {
                    bufferString = QString("Created front buffer as %1x%2 %3.").arg(w).arg(h).arg("RGBA8");
                }
            } else {
                // we must create both the backbuffer and previewBuffer
                bufferString = QString("Created front and back buffers as %1x%2 %3.").arg(w).arg(h).arg(b);
            }

            if (oldBufferString == bufferString) return;
            oldBufferString = bufferString;

            delete(previewBuffer); previewBuffer = 0;
            delete(backBuffer); backBuffer = 0;

            if (bufferType==None) {
                if (false && previewFactor==0) {
                } else {
                    previewBuffer = new QGLFramebufferObject(w, h, QGLFramebufferObject::NoAttachment, GL_TEXTURE_2D, type);
                }
            } else {
                // we must create both the backbuffer and previewBuffer
                backBuffer = new QGLFramebufferObject(w, h, QGLFramebufferObject::NoAttachment, GL_TEXTURE_2D, type);
                previewBuffer = new QGLFramebufferObject(w, h, QGLFramebufferObject::NoAttachment, GL_TEXTURE_2D, type);
            }
            clearBackBuffer();
        }

        void DisplayWidget::clearBackBuffer() {
            doClearBackBuffer = true;
        }

        void DisplayWidget::setViewPort(int w, int h) {
            if (drawingState == Tiled) {
                glViewport( 0, 0,bufferSizeX, bufferSizeY);
            } else
                if (fitWindow) {
                    glViewport( 0, 0, w, h);
                } else {
                    glViewport( 0, 0,bufferSizeX<w ? bufferSizeX : w, bufferSizeY<h ? bufferSizeY : h);
                }
        }

        void DisplayWidget::drawFragmentProgram(int w,int h, bool toBuffer) {
            //static int c = 0;
            //INFO(QString("Draw fragment program: %1").arg(c++));
            shaderProgram->bind();

            glDisable( GL_CULL_FACE );
            glDisable( GL_LIGHTING );
            glDisable( GL_DEPTH_TEST );

            // -- Viewport
            if (toBuffer) {
                glViewport( 0, 0,w,h);
            } else {
                setViewPort(w,h);
            }
            // -- Projection
            // The projection mode as used here
            // allow us to render only a region of the viewport.
            // This allows us to perform tile based rendering.
            glMatrixMode(GL_PROJECTION);
            tileRender();

            cameraControl->transform(pixelWidth(), pixelHeight());

            int l = shaderProgram->uniformLocation("pixelSize");
            if (l != -1) {
                shaderProgram->setUniformValue(l, (float)(1.0/w),(float)(1.0/h));
            }

            l = shaderProgram->uniformLocation("globalPixelSize");
            if (l != -1) {
                int d = 1; // TODO: Set to Tile factor.
                if (d<1) d = 1;
                if (viewFactor > 0) {
                    d = viewFactor+1.;
                }
                shaderProgram->setUniformValue(l, ((float)d/w),((float)d/h));
            }

            l = shaderProgram->uniformLocation("time");
            if (l != -1) {
                float t = mainWindow->getTime();
                shaderProgram->setUniformValue(l, (float)t);
            } else {
                mainWindow->getTime();
            }

            if (bufferType!=None) {
                l = shaderProgram->uniformLocation("backbuffer");
                if (l != -1) {
                    glActiveTexture(GL_TEXTURE0); // non-standard (>OpenGL 1.3) gl extension
                    GLuint i = backBuffer->texture();
                    glBindTexture(GL_TEXTURE_2D,i);
                    if (fragmentSource.textureParams.contains("backbuffer")) {
                        setGlTexParameter(fragmentSource.textureParams["backbuffer"]);
                    }
                    shaderProgram->setUniformValue(l, 0);
                    //INFO(QString("Binding backbuffer (ID: %1) to active texture %2").arg(i).arg(0));
                    //INFO(QString("Setting uniform backbuffer to active texture %2").arg(0));
                }

                l = shaderProgram->uniformLocation("subframe");
                if (l != -1) {
                    shaderProgram->setUniformValue(l, subframeCounter);
                    //INFO(QString("Setting subframe: %1").arg(subframeCounter));

                }
            }

            // Setup User Uniforms
            mainWindow->setUserUniforms(shaderProgram);
            glColor3d(1.0,1.0,1.0);

            glBegin(GL_TRIANGLES);
            glTexCoord2f(0.0f, 0.0f); glVertex3f(-1.0f, -1.0f,  0.0f);
            glTexCoord2f(2.0f, 0.0f); glVertex3f( 3.0f, -1.0f,  0.0f);
            glTexCoord2f(0.0f, 2.0f); glVertex3f( -1.0f,  3.0f,  0.0f);
            glEnd();

            //   glFinish();// <-- should we call this? (NO, burns a lot of CPU)
            shaderProgram->release();
        }

        void DisplayWidget::drawToFrameBufferObject(QGLFramebufferObject* buffer, bool drawLast) {
            //static int c = 0;
            //INFO(QString("drawToFrameBufferObject: %1").arg(c++));

            if (previewBuffer == 0 || !previewBuffer->isValid()) {
                WARNING("Non valid FBO");
                return;
            }
            QSize s = previewBuffer->size();

            if (!drawLast) {
                for (int i = 0; i <= iterationsBetweenRedraws; i++) {
                    if (backBuffer) {
                        // swap backbuffer
                        QGLFramebufferObject* temp = backBuffer;
                        backBuffer= previewBuffer;
                        previewBuffer = temp;
                        subframeCounter++;
                    }

                    if (!previewBuffer->bind()) { WARNING("Failed to bind FBO"); return; }
                    drawFragmentProgram(s.width(),s.height(), true);
                    if (!previewBuffer->release()) { WARNING("Failed to release FBO"); return; }
                }
            }
            mainWindow->setSubFrameDisplay(subframeCounter);

            if (buffer && !buffer->bind()) { WARNING("Failed to bind target buffer"); return; }

            // Draw a textured quad using the preview texture.
            if (bufferShaderProgram) {
                bufferShaderProgram->bind();
                int l = bufferShaderProgram->uniformLocation("pixelSize");
                if (l != -1) {
                    shaderProgram->setUniformValue(l, (float)(1.0/s.width()),(float)(1.0/s.height()));
                }

                l = bufferShaderProgram->uniformLocation("globalPixelSize");
                if (l != -1) {
                    int d = 1; // TODO: Set to Tile factor.
                    if (d<1) d = 1;

                    if (viewFactor > 0) {
                        d = viewFactor+ 1.;
                    }
                    shaderProgram->setUniformValue(l, (d/(float)s.width()),(d/(float)s.height()));
                }

                l = bufferShaderProgram->uniformLocation("frontbuffer");
                if (l != -1) {
                    bufferShaderProgram->setUniformValue(l, 0);
                } else {
                    WARNING("No front buffer sampler found in buffer shader. This doesn't make sense.");
                }
                mainWindow->setUserUniforms(bufferShaderProgram);

            }
            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();
            glMatrixMode(GL_MODELVIEW);
            glLoadIdentity();
            //if (bufferShaderProgram) {
            setViewPort(pixelWidth(),pixelHeight());
            //} else {
            //    glViewport(0, 0, width(),height());
            //}
            glActiveTexture(GL_TEXTURE0); // non-standard (>OpenGL 1.3) gl extension
            glBindTexture(GL_TEXTURE_2D, previewBuffer->texture());

            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);

            glEnable(GL_TEXTURE_2D);

            glBegin(GL_TRIANGLES);
            glTexCoord2f(0.0f, 0.0f); glVertex3f(-1.0f, -1.0f,  0.0f);
            glTexCoord2f(2.0f, 0.0f); glVertex3f( 3.0f, -1.0f,  0.0f);
            glTexCoord2f(0.0f, 2.0f); glVertex3f( -1.0f,  3.0f,  0.0f);
            glEnd();

            if (bufferShaderProgram) bufferShaderProgram->release();
            if (buffer && !buffer->release()) { WARNING("Failed to release target buffer"); return; }
        }

        /**
         * Call this before and after performing a tile render.
         * @brief DisplayWidget::clearTileBuffer
         */
        void DisplayWidget::clearTileBuffer()  {
            delete(hiresBuffer);
            mainWindow->getBufferSize(pixelWidth(), pixelHeight(),bufferSizeX, bufferSizeY, fitWindow);
            makeBuffers();
            hiresBuffer = 0;
        }

        QImage DisplayWidget::render(float padding, float time, int subframes, int w, int h, int tile, int tileMax, QProgressDialog* progress, int* steps, int totalSteps) {
            this->tiles = tileMax;
            this->tilesCount = tile;
            this->padding = padding;
            mainWindow->setLastStoredTime(time);
            if (hiresBuffer==0) {
                hiresBuffer = new QGLFramebufferObject(w, h, QGLFramebufferObject::NoAttachment, GL_TEXTURE_2D, GL_RGBA8);
            }
            if (!hiresBuffer->isValid()) { WARNING("Failed to create hiresBuffer FBO");  }

            INFO(QString("Rendering tile %1/%2. Time: %3, Tile: %4/%5, Subframes: %6. Resolution: %8x%9")
                 .arg(*steps).arg(totalSteps).arg(time).arg(tile).arg(tileMax*tileMax).arg(subframes)
                 .arg(w).arg(h));

            if (!previewBuffer->bind()) { WARNING("Failed to bind previewBuffer BFO");  }
            glClearColor(0.0f,0.0f,0.0f,0.0f);
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
            if (!previewBuffer->release()) { WARNING("Failed to release previewBuffer FBO");  }

            for (int i = 0; i< subframes; i++) {
                if (progress->wasCanceled()) {
                    break;
                }
                progress->setValue(*steps);
                progress->setLabelText(QString("Rendering tile %1/%2.\nTime: %3, Tile: %4/%5, Subframe: %6/%7.\nResolution: %8x%9")
                                       .arg(*steps).arg(totalSteps).arg(time).arg(tile).arg(tileMax*tileMax).arg(i).arg(subframes)
                                       .arg(w).arg(h));

                (*steps)++;
                drawToFrameBufferObject(hiresBuffer, false);
            }
            return hiresBuffer->toImage();
        }

        void DisplayWidget::setState(DrawingState state) {
            this->drawingState = state;
        }


        void DisplayWidget::paintGL() {
            if (drawingState == Tiled) {
                return;
            }
            // Show info first time we display something...
            static bool shownInfo = false;
            if (!shownInfo) {
                shownInfo = true;
                INFO("This video card supports: " + GetOpenGLFlags().join(", "));
                qDebug(" - OpenGL Vendor: %s", glGetString(GL_VENDOR));
                qDebug(" - OpenGL Version: %s", glGetString(GL_VERSION));
                qDebug(" - OpenGL Renderer: %s", glGetString(GL_RENDERER));
                qDebug(" - OpenGL Shading Language Version: %s", glGetString(GL_SHADING_LANGUAGE_VERSION));
            }
            if (pixelHeight() == 0 || pixelWidth() == 0) return;


            if (pendingRedraws > 0) pendingRedraws--;

            if (disabled || !shaderProgram) {
                qglClearColor(backgroundColor);
                glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );
                return;
            }


            if ((doClearBackBuffer || drawingState == DisplayWidget::Animation) && backBuffer) {
                if (!previewBuffer->bind()) { WARNING("Failed to bind previewBuffer BFO"); return; }
                glClearColor(0.0f,0.0f,0.0f,0.0f);
                glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
                if (!previewBuffer->release()) { WARNING("Failed to release previewBuffer FBO");  }
                subframeCounter = 0;
                doClearBackBuffer = false;
            } else {
                if (doClearBackBuffer) {
                    subframeCounter = 0;
                    doClearBackBuffer = false;
                    qglClearColor(Qt::black);
                    glClear( GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT );
                }
            }

            if (drawingState == DisplayWidget::Progressive) {
                if (subframeCounter>=maxSubFrames && maxSubFrames>0) {
                    drawToFrameBufferObject(0, true);
                    return;
                }
            }

            QTime t = QTime::currentTime();

            if (previewBuffer) {
                drawToFrameBufferObject(0, false);
            } else {
                drawFragmentProgram(pixelWidth(),pixelHeight(), true);
                if (drawingState == DisplayWidget::Progressive) {
                    subframeCounter++;
                    mainWindow->setSubFrameDisplay(subframeCounter);
                }
            }

            QTime cur = QTime::currentTime();
            long ms = t.msecsTo(cur);
            fpsCounter++;
            float fps = -1;

            // If the render takes more than 0.5 seconds, we will directly measure fps from one frame.
            if (ms>500) {
                fps = 1000.0f/((float)ms);
                mainWindow->setFPS(fps);
            } else {
                if (drawingState == Animation && isContinuous()) {
                    // Else measure over two seconds.
                    long ms2 = fpsTimer.msecsTo(cur);
                    if (ms2>2000 || ms2<0) {
                        fps = fpsCounter/(ms2/1000.0);
                        fpsTimer = cur;
                        fpsCounter = 0;
                        mainWindow->setFPS(fps);
                    }
                } else {
                    mainWindow->setFPS(0);
                }
            }

        }

        void DisplayWidget::updateBuffers() {
            resizeGL(0,0);
        }

        void DisplayWidget::resizeGL( int /* width */, int /* height */) {
            // When resizing the perspective must be recalculate
            updatePerspective();
            QTimer::singleShot(500, this, SLOT(clearPreviewBuffer()));
        }

        void DisplayWidget::updatePerspective() {
            if (pixelHeight() == 0 || pixelWidth() == 0) return;
            mainWindow->getBufferSize(pixelWidth(), pixelHeight(),bufferSizeX, bufferSizeY, fitWindow);
            QString infoText = QString("[%1x%2] Aspect=%3").arg(pixelWidth()).arg(pixelHeight()).arg((float)pixelWidth()/pixelHeight());
            mainWindow-> statusBar()->showMessage(infoText, 5000);
        }

        void DisplayWidget::timerSignal() {
            static bool firstTime = true;
            if (firstTime) {
                firstTime = false;
                updatePerspective();
                requireRedraw(true);
            }

            static QWidget* lastFocusedWidget = QApplication::focusWidget();
            if (QApplication::focusWidget()!=lastFocusedWidget && cameraControl) {
                cameraControl->releaseControl();
                lastFocusedWidget = QApplication::focusWidget();
            }
            if (cameraControl && cameraControl->wantsRedraw()) {
                requireRedraw(clearOnChange);
                cameraControl->updateState();
            }

            if (pendingRedraws) {
                updateGL();
            } else if (continuous) {
                if (drawingState == DisplayWidget::Progressive &&
                        (subframeCounter>=maxSubFrames && maxSubFrames>0)) {
                    // Ignore this.
                }
                else {
                    updateGL();
                }
            }
        }

        void DisplayWidget::initializeGL()
        {
            requireRedraw(true);
            glEnable( GL_CULL_FACE );
            glEnable( GL_LIGHTING );
            glEnable( GL_DEPTH_TEST );
            glEnable( GL_NORMALIZE );
            glEnable(GL_LINE_SMOOTH);
            glEnable(GL_POINT_SMOOTH);
            glEnable(GL_POLYGON_SMOOTH);
            glHint(GL_POLYGON_SMOOTH_HINT, GL_NICEST);
        }

#if (QT_VERSION <= QT_VERSION_CHECK(4,9,9))
        // support Debian Wheezy's old Qt version
        double DisplayWidget::devicePixelRatio() {
            return 1;
        }
#endif

        int DisplayWidget::pixelWidth() {
            return width() * devicePixelRatio();
        }

        int DisplayWidget::pixelHeight() {
            return height() * devicePixelRatio();
        }

        void DisplayWidget::wheelEvent(QWheelEvent* e) {
            e->accept();
            cameraControl->wheelEvent(e);
            requireRedraw(clearOnChange);
        }

        void DisplayWidget::mouseMoveEvent( QMouseEvent *e ) {
            e->accept();
            bool redraw = cameraControl->mouseEvent(e, width(), height());
            if (redraw) requireRedraw(clearOnChange);
        }

        void DisplayWidget::mouseReleaseEvent(QMouseEvent* ev)  {
            bool redraw = cameraControl->mouseEvent(ev, width(), height());
            if (redraw) requireRedraw(clearOnChange);
        }


        void DisplayWidget::mousePressEvent(QMouseEvent* ev)  {
            bool redraw = cameraControl->mouseEvent(ev, width(), height());
            if (redraw) {
                requireRedraw(clearOnChange);
            }
        }

        void DisplayWidget::keyPressEvent(QKeyEvent* ev) {
            bool redraw = cameraControl->keyPressEvent(ev);
            if (redraw) {
                requireRedraw(clearOnChange);
                ev->accept();
            } else {
                QGLWidget::keyPressEvent(ev);
            }
        }

        void DisplayWidget::clearPreviewBuffer() {
            setPreviewFactor(previewFactor);
            requireRedraw(true);
        }

        void DisplayWidget::keyReleaseEvent(QKeyEvent* ev) {
            bool redraw = cameraControl->keyPressEvent(ev);
            if (redraw) {
                requireRedraw(clearOnChange);
                ev->accept();
            } else {
                QGLWidget::keyReleaseEvent(ev);
            }
        }
    }
}

