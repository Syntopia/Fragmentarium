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

		struct AnimationSettings {
			AnimationSettings() {
				isRunning = false;
				time = 0.0;
				length = 10.0;
				fps = 25;
			}
			
			void setRunning(bool start) {
				isRunning = start;
			}

			void setStartTime() {
				startTime = QDateTime::currentDateTime();
			};

			void setStartAnimTime() {
				startAnimTime = time;
			};

			void setTime(float t) {
				if (t>length) t=length;
				if (t<0) t=0;
				time = t;
			};

			void setFrame(int f) {
				time = f/(double)(fps);
			};


			int currentFrame() {
				return (int)(time*fps); // round down
			};

			int totalFrames() { return (int)(length*fps); }

			float time; // Current time
			float length;
			int fps;
			QDateTime startTime;
			float startAnimTime;
			bool isRunning;
		};

		class AnimationController : public QDockWidget
		{
			Q_OBJECT
		public:
			AnimationController(QWidget* parent);

		public slots:
			void timeChanged(double);
			void lengthChanged(double);
			void frameChanged(int);
			void fpsChanged(int);
			void sliderChanged(int);
			void rewind();
			void play();
			void record();

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
