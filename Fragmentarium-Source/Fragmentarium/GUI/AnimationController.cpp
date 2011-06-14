#include "AnimationController.h"
#include "../../SyntopiaCore/Misc/Misc.h"

using namespace SyntopiaCore::Logging;

namespace Fragmentarium {
	namespace GUI {
		AnimationController::AnimationController(QWidget* parent) : QDockWidget(parent)
		{
                        if (objectName().isEmpty())
				setObjectName(QString::fromUtf8("Animation Controller"));
			//resize(627, 144);
			/*
			QSizePolicy sizePolicy(QSizePolicy::Minimum, QSizePolicy::Preferred);
			sizePolicy.setHorizontalStretch(0);
			sizePolicy.setVerticalStretch(0);
			//	sizePolicy.setHeightForWidth(getSizePolicy().hasHeightForWidth());
			setSizePolicy(sizePolicy);
			*/

			centralwidget = new QWidget(this);
			setWidget(centralwidget);
			centralwidget->setObjectName(QString::fromUtf8("centralwidget"));
			verticalLayout_3 = new QVBoxLayout(centralwidget);
			verticalLayout_3->setObjectName(QString::fromUtf8("verticalLayout_3"));
			horizontalLayout_2 = new QHBoxLayout();
			horizontalLayout_2->setObjectName(QString::fromUtf8("horizontalLayout_2"));
			verticalLayout = new QVBoxLayout();
			verticalLayout->setSpacing(3);
			verticalLayout->setObjectName(QString::fromUtf8("verticalLayout"));
			timeSlider = new QSlider(centralwidget);
			timeSlider->setObjectName(QString::fromUtf8("timeSlider"));
			timeSlider->setStyleSheet(QString::fromUtf8(""));
			timeSlider->setOrientation(Qt::Horizontal);

			verticalLayout->addWidget(timeSlider);

			horizontalLayout = new QHBoxLayout();
			horizontalLayout->setSpacing(3);
			horizontalLayout->setObjectName(QString::fromUtf8("horizontalLayout"));
			gridLayout_2 = new QGridLayout();
			gridLayout_2->setObjectName(QString::fromUtf8("gridLayout_2"));
			gridLayout_2->setHorizontalSpacing(1);
			gridLayout_2->setVerticalSpacing(2);
			timeLabel = new QLabel(centralwidget);
			timeLabel->setObjectName(QString::fromUtf8("timeLabel"));

			gridLayout_2->addWidget(timeLabel, 0, 0, 1, 1);

			timeSpinBox = new QDoubleSpinBox(centralwidget);
			timeSpinBox->setObjectName(QString::fromUtf8("timeSpinBox"));
			timeSpinBox->setMinimumSize(QSize(70, 0));

			gridLayout_2->addWidget(timeSpinBox, 0, 1, 1, 1);

			frameLabel = new QLabel(centralwidget);
			frameLabel->setObjectName(QString::fromUtf8("frameLabel"));

			gridLayout_2->addWidget(frameLabel, 0, 2, 1, 1);

			frameSpinBox = new QSpinBox(centralwidget);
			frameSpinBox->setObjectName(QString::fromUtf8("frameSpinBox"));
			frameSpinBox->setMinimumSize(QSize(70, 0));

			gridLayout_2->addWidget(frameSpinBox, 0, 3, 1, 1);

			lengthLabel = new QLabel(centralwidget);
			lengthLabel->setObjectName(QString::fromUtf8("lengthLabel"));

			gridLayout_2->addWidget(lengthLabel, 1, 0, 1, 1);

			lengthSpinBox = new QDoubleSpinBox(centralwidget);
			lengthSpinBox->setObjectName(QString::fromUtf8("lengthSpinBox"));

			gridLayout_2->addWidget(lengthSpinBox, 1, 1, 1, 1);

			fpsLabel = new QLabel(centralwidget);
			fpsLabel->setObjectName(QString::fromUtf8("fpsLabel"));

			gridLayout_2->addWidget(fpsLabel, 1, 2, 1, 1);

			fpsSpinBox = new QSpinBox(centralwidget);
			fpsSpinBox->setObjectName(QString::fromUtf8("fpsSpinBox"));

			gridLayout_2->addWidget(fpsSpinBox, 1, 3, 1, 1);


			horizontalLayout->addLayout(gridLayout_2);

			playButton = new QPushButton(centralwidget);
			playButton->setObjectName(QString::fromUtf8("playButton"));
			QSizePolicy sizePolicy1(QSizePolicy::Minimum, QSizePolicy::Fixed);
			sizePolicy1.setHorizontalStretch(0);
			sizePolicy1.setVerticalStretch(0);
			sizePolicy1.setHeightForWidth(playButton->sizePolicy().hasHeightForWidth());
			playButton->setSizePolicy(sizePolicy1);
			playButton->setMaximumSize(QSize(50, 50));
			playButton->setToolTip("Play / Stop");
			playButton->setStatusTip("Play / Stop");
						

			horizontalLayout->addWidget(playButton);

			rewindButton = new QPushButton(centralwidget);
			rewindButton->setObjectName(QString::fromUtf8("rewindButton"));
			QSizePolicy sizePolicy2(QSizePolicy::Minimum, QSizePolicy::Minimum);
			sizePolicy2.setHorizontalStretch(0);
			sizePolicy2.setVerticalStretch(0);
			sizePolicy2.setHeightForWidth(rewindButton->sizePolicy().hasHeightForWidth());
			rewindButton->setSizePolicy(sizePolicy2);
			rewindButton->setMaximumSize(QSize(50, 50));
			rewindButton->setToolTip("Rewind");
			rewindButton->setStatusTip("Rewind");
			

			horizontalLayout->addWidget(rewindButton);

			recButton = new QPushButton(centralwidget);
			recButton->setObjectName(QString::fromUtf8("recButton"));
			sizePolicy2.setHeightForWidth(recButton->sizePolicy().hasHeightForWidth());
			recButton->setSizePolicy(sizePolicy2);
			recButton->setMaximumSize(QSize(50, 50));

			recButton->setToolTip("Export");
			recButton->setStatusTip("Export");
			
			horizontalLayout->addWidget(recButton);

			horizontalSpacer = new QSpacerItem(13, 20, QSizePolicy::Expanding, QSizePolicy::Minimum);

			horizontalLayout->addItem(horizontalSpacer);


			verticalLayout->addLayout(horizontalLayout);

			verticalSpacer = new QSpacerItem(20, 40, QSizePolicy::Minimum, QSizePolicy::Expanding);

			verticalLayout->addItem(verticalSpacer);


			horizontalLayout_2->addLayout(verticalLayout);

			keyFrameGroup = new QGroupBox(centralwidget);
			keyFrameGroup->setObjectName(QString::fromUtf8("keyFrameGroup"));
			keyFrameGroup->setEnabled(false);
			QSizePolicy sizePolicy3(QSizePolicy::Maximum, QSizePolicy::Preferred);
			sizePolicy3.setHorizontalStretch(0);
			sizePolicy3.setVerticalStretch(0);
			sizePolicy3.setHeightForWidth(keyFrameGroup->sizePolicy().hasHeightForWidth());
			keyFrameGroup->setSizePolicy(sizePolicy3);
			keyFrameGroup->setFlat(true);
			horizontalLayout_3 = new QHBoxLayout(keyFrameGroup);
			horizontalLayout_3->setSpacing(1);
			horizontalLayout_3->setObjectName(QString::fromUtf8("horizontalLayout_3"));
			horizontalLayout_3->setContentsMargins(0, 1, 1, 1);
			keyFrameList = new QListWidget(keyFrameGroup);
			keyFrameList->setObjectName(QString::fromUtf8("keyFrameList"));
			keyFrameList->setMinimumSize(QSize(70, 20));
			keyFrameList->setMaximumSize(QSize(60, 16777215));

			keyFrameGroup->setHidden(true); // disable for now

			horizontalLayout_3->addWidget(keyFrameList);

			verticalLayout_2 = new QVBoxLayout();
			verticalLayout_2->setSpacing(1);
			verticalLayout_2->setObjectName(QString::fromUtf8("verticalLayout_2"));
			removeButton = new QPushButton(keyFrameGroup);
			removeButton->setObjectName(QString::fromUtf8("removeButton"));

			verticalLayout_2->addWidget(removeButton);

			editButton = new QPushButton(keyFrameGroup);
			editButton->setObjectName(QString::fromUtf8("editButton"));

			verticalLayout_2->addWidget(editButton);

			verticalSpacer_2 = new QSpacerItem(20, 40, QSizePolicy::Minimum, QSizePolicy::Expanding);

			verticalLayout_2->addItem(verticalSpacer_2);


			horizontalLayout_3->addLayout(verticalLayout_2);


			horizontalLayout_2->addWidget(keyFrameGroup);


			verticalLayout_3->addLayout(horizontalLayout_2);

			//layout->addWidget(centralwidget);

			setWindowTitle(QApplication::translate("Animation", "Animation", 0, QApplication::UnicodeUTF8));
			timeLabel->setText(QApplication::translate("MainWindow", "Time", 0, QApplication::UnicodeUTF8));
			frameLabel->setText(QApplication::translate("MainWindow", "Frame", 0, QApplication::UnicodeUTF8));
			lengthLabel->setText(QApplication::translate("MainWindow", "Length (s)", 0, QApplication::UnicodeUTF8));
			fpsLabel->setText(QApplication::translate("MainWindow", "FPS", 0, QApplication::UnicodeUTF8));
			playButton->setText(QApplication::translate("MainWindow", ">", 0, QApplication::UnicodeUTF8));
			rewindButton->setText(QApplication::translate("MainWindow", "|<", 0, QApplication::UnicodeUTF8));
			recButton->setText(QApplication::translate("MainWindow", "O", 0, QApplication::UnicodeUTF8));
			keyFrameGroup->setTitle(QApplication::translate("MainWindow", "Keyframes", 0, QApplication::UnicodeUTF8));
			removeButton->setText(QApplication::translate("MainWindow", "Remove", 0, QApplication::UnicodeUTF8));
			editButton->setText(QApplication::translate("MainWindow", "Edit", 0, QApplication::UnicodeUTF8));
		
		
			frameSpinBox->setMinimum(1);
			frameSpinBox->setMaximum(animationSettings.totalFrames());
			frameSpinBox->setValue(1);
			
			
			lengthSpinBox->setMinimum(1);
			lengthSpinBox->setMaximum(9999);
			lengthSpinBox->setValue(animationSettings.getLength());
			
			fpsSpinBox->setMinimum(1);
			fpsSpinBox->setMaximum(100);
			fpsSpinBox->setValue(animationSettings.getFps());
			
			timeSlider->setMinimum(0);
			timeSlider->setMaximum(animationSettings.totalFrames());
			timeSlider->setValue(0);

			timeSpinBox->setMinimum(0);
			timeSpinBox->setMaximum(animationSettings.getLength());
			timeSpinBox->setValue(0);

			connect(timeSlider, SIGNAL(valueChanged(int)), this, SLOT(sliderChanged(int)));
	 	    connect(timeSpinBox, SIGNAL(valueChanged(double)), this, SLOT(timeChanged(double)));
	   	    connect(frameSpinBox, SIGNAL(valueChanged(int)), this, SLOT(frameChanged(int)));
	   	    connect(lengthSpinBox, SIGNAL(valueChanged(double)), this, SLOT(lengthChanged(double)));
	   	    connect(fpsSpinBox, SIGNAL(valueChanged(int)), this, SLOT(fpsChanged(int)));
	   	    connect(playButton, SIGNAL(clicked()), this, SLOT(play()));
	   	    connect(rewindButton, SIGNAL(clicked()), this, SLOT(rewind()));
	   	    connect(recButton, SIGNAL(clicked()), this, SLOT(record()));

			connect(&animationSettings, SIGNAL(updateSliders()), this, SLOT(updateSliders()));

	    } 

		void AnimationController::updateSliders() {
			frameSpinBox->blockSignals(true);
			timeSlider->blockSignals(true);
			timeSpinBox->blockSignals(true);
			timeSlider->setValue(animationSettings.currentFrame());
			frameSpinBox->setValue(animationSettings.currentFrame());
			timeSpinBox->setValue(animationSettings.getTime());
			frameSpinBox->blockSignals(false);
			timeSlider->blockSignals(false);
			timeSpinBox->blockSignals(true);
		}

		void AnimationController::timeChanged(double) {
			animationSettings.setTime(timeSpinBox->value());

			frameSpinBox->blockSignals(true);
			timeSlider->blockSignals(true);
			
			timeSlider->setValue(animationSettings.currentFrame());
			frameSpinBox->setValue(animationSettings.currentFrame());

			frameSpinBox->blockSignals(false);
			timeSlider->blockSignals(false);
			
		}

		void AnimationController::lengthChanged(double) {
			animationSettings.setLength(lengthSpinBox->value());
			timeSpinBox->blockSignals(true);
			timeSlider->blockSignals(true);
			timeSpinBox->setMaximum(animationSettings.getLength());
			timeSlider->setMaximum(animationSettings.totalFrames());
			timeSpinBox->blockSignals(false);

			timeSlider->blockSignals(false);
			
		}

		void AnimationController::frameChanged(int) {
			animationSettings.setFrame(frameSpinBox->value());
			
			timeSpinBox->blockSignals(true);
			timeSlider->blockSignals(true);
			
			timeSlider->setValue(animationSettings.currentFrame());
			timeSpinBox->setValue(animationSettings.getTime());
	
			timeSpinBox->blockSignals(false);
			timeSlider->blockSignals(false);
			
		}

		void AnimationController::fpsChanged(int) {
			animationSettings.setFps (fpsSpinBox->value());
				timeSlider->blockSignals(true);
				timeSlider->blockSignals(true);
				frameSpinBox->setMaximum(animationSettings.totalFrames());
				timeSlider->setMaximum(animationSettings.totalFrames());
				timeSlider->blockSignals(false);
				timeSlider->blockSignals(false);
				/*
				INFO(QString("frames: %1, %2, %3, %4")
					.arg(animationSettings.totalFrames())
					.arg(timeSlider->minimum())
					.arg(timeSlider->value())
					.arg(timeSlider->maximum()));*/
		};

		void AnimationController::sliderChanged(int) {
			int frame = timeSlider->value();
			//INFO(QString("S:%1").arg(frame));
			animationSettings.setFrame(frame);
			timeSpinBox->blockSignals(true);
			frameSpinBox->blockSignals(true);
			timeSpinBox->setValue(animationSettings.getTime());
			frameSpinBox->setValue(animationSettings.currentFrame());
			timeSpinBox->blockSignals(false);
			frameSpinBox->blockSignals(false);
		};

		void AnimationController::rewind() {
			animationSettings.setFrame(0);
			
			timeSlider->setValue(animationSettings.currentFrame());
			timeSpinBox->setValue(animationSettings.getTime());
			frameSpinBox->setValue(animationSettings.currentFrame());
		};

		void AnimationController::play() {
			if (animationSettings.isRunning()) {
				INFO("Stopped animation");
				playButton->setText(">");
				animationSettings.setRunning(false);
			} else {
				playButton->setText("[]");
				INFO("Started animation");
				animationSettings.setStartTime();
				animationSettings.setStartAnimTime();
				animationSettings.setRunning(true);
			}
		};

		void AnimationController::record() {
			if (animationSettings.isRecording()) {
				INFO("Stopped recording");
				animationSettings.setRunning(false);
				animationSettings.setRecording(false);
			} else {
				QString filename = SyntopiaCore::Misc::GetImageFileName(this, "Choose image file name:");
				if (filename.isEmpty()) return;
				QString extension = "."+filename.section(".", -1,-1);
				QString base = filename.section(".", 0,-2);
				INFO("File: " + base + " - " + extension);
				animationSettings.setFileName(base, extension);
				rewind();
				
				INFO("Started recording");
				animationSettings.setStartTime();
				animationSettings.setStartAnimTime();
				animationSettings.setRunning(true);
				animationSettings.setRecording(true);
			}
			
		};

	}
}

