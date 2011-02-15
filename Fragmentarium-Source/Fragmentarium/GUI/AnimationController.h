#pragma once

#include <QtCore/QVariant>
#include <QtGui/QAction>
#include <QtGui/QApplication>
#include <QtGui/QButtonGroup>
#include <QtGui/QDoubleSpinBox>
#include <QtGui/QGridLayout>
#include <QtGui/QGroupBox>
#include <QtGui/QHBoxLayout>
#include <QtGui/QHeaderView>
#include <QtGui/QLabel>
#include <QtGui/QListWidget>
#include <QtGui/QMainWindow>
#include <QtGui/QMenuBar>
#include <QtGui/QPushButton>
#include <QtGui/QSlider>
#include <QtGui/QSpacerItem>
#include <QtGui/QSpinBox>
#include <QtGui/QStatusBar>
#include <QtGui/QVBoxLayout>
#include <QtGui/QWidget>
#include <QtGui/QDockWidget>

#include "SyntopiaCore/Logging/Logging.h"

namespace Fragmentarium {
	namespace GUI {

		using namespace SyntopiaCore::Logging;

		class AnimationSettings : public QObject {
			Q_OBJECT
		public:
			AnimationSettings() {
				running = false;
				recording = false;
				time = 0.0;
				length = 10.0;
				fps = 25;
				startFrame = 1;
			}
			
			void setRunning(bool v) {
				running = v;
			}

			void setStartTime() {
				startTime = QTime::currentTime();
			};

			void setStartAnimTime() {
				startAnimTime = time;
			};

			QString getFileName() {
				int digits = QString::number(totalFrames()).length();
				QString n = QString::number(startFrame);
				QString f = base + n.rightJustified(digits, '0') + extension;
				return f;
			}

			float getTimeFromDisplay() {
				if (!isRunning()) return time;
				if (isRecording()) {
					setFrame(startFrame++);
				} else {
					float elapsedTime = startTime.msecsTo(QTime::currentTime())/1000.0;
					setTime(startAnimTime+elapsedTime, false);
			    }
				if (time>=length ) {
					running = false;
					recording = false;
					INFO("Reached end. Stopping...");
				}
				emit updateSliders();
				return time;
			}

			void setTime(float t, bool checkRunning = true) {
				if (t>length) t=length;
				if (t<0) t=0;
				time = t;
				if (checkRunning && isRunning()) {
					// new time - reset start times
					setStartTime();
					setStartAnimTime();
				}
				emit timeUpdated();
			};

			void setFrame(int f) {
				setTime((f-1)/(double)(fps));
			};


			int currentFrame() {
				int f= (int)(time*fps)+1; // round down
				return f;
			};

			int totalFrames() { return (int)(length*fps); }

			float getLength() { return length; } 
			float getTime() { return time; } 
			int getFps() { return fps; } 
			bool isRunning() { return running; } 
			bool isRecording() { return recording; } 
			void setRecording(bool r) { recording = r;  startFrame = 0; } 
			void setLength(float l) { length = l; }
			void setFps(int f) { fps = f; }

			void setFileName(QString base, QString extension) {
				this->base = base;
				this->extension = extension;
			}

		signals:
			void timeUpdated();	
			void updateSliders();
		private:
			int startFrame; 
			float time; // Current time
			float length;
			bool recording;
			int fps;
			QTime startTime;
			float startAnimTime;
			bool running;
			QString base;
			QString extension;
		};

		class AnimationController : public QDockWidget
		{
			Q_OBJECT
		public:
			AnimationController(QWidget* parent);
			AnimationSettings* getAnimationSettings() { return &animationSettings; }

		public slots:
			void timeChanged(double);
			void lengthChanged(double);
			void frameChanged(int);
			void fpsChanged(int);
			void sliderChanged(int);
			void rewind();
			void play();
			void record();
			void updateSliders();

		private:
			QWidget *centralwidget;
			QVBoxLayout *verticalLayout_3;
			QHBoxLayout *horizontalLayout_2;
			QVBoxLayout *verticalLayout;
			QSlider *timeSlider;
			QHBoxLayout *horizontalLayout;
			QGridLayout *gridLayout_2;
			QLabel *timeLabel;
			QDoubleSpinBox *timeSpinBox;
			QLabel *frameLabel;
			QSpinBox *frameSpinBox;
			QLabel *lengthLabel;
			QDoubleSpinBox *lengthSpinBox;
			QLabel *fpsLabel;
			QSpinBox *fpsSpinBox;
			QPushButton *playButton;
			QPushButton *rewindButton;
			QPushButton *recButton;
			QSpacerItem *horizontalSpacer;
			QSpacerItem *verticalSpacer;
			QGroupBox *keyFrameGroup;
			QHBoxLayout *horizontalLayout_3;
			QListWidget *keyFrameList;
			QVBoxLayout *verticalLayout_2;
			QPushButton *removeButton;
			QPushButton *editButton;
			QSpacerItem *verticalSpacer_2;
			QMenuBar *menubar;
			QStatusBar *statusbar;
			AnimationSettings animationSettings;
		};
	}
}
