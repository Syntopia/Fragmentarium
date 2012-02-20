#include "OutputDialog.h"
#include "MainWindow.h"
#include "../../SyntopiaCore/Misc/Misc.h"
#include <QFileInfo>
#include <QDir>
#include <QImageWriter>
#include <QSettings>


using namespace SyntopiaCore::Math;
using namespace SyntopiaCore::Logging;


namespace Fragmentarium {
	namespace GUI {
		OutputDialog::OutputDialog(QWidget* parent, int w, int h) : QDialog(parent), width(w), height(h) {
			if (objectName().isEmpty())
				setObjectName(QString::fromUtf8("OutputDialog"));
			resize(353,237);
			setWindowTitle("High Resolution Render");

			verticalLayout = new QVBoxLayout(this);
			verticalLayout->setObjectName(QString::fromUtf8("verticalLayout"));
			label = new QLabel(this);
			label->setObjectName(QString::fromUtf8("label"));

			verticalLayout->addWidget(label);

			tilesSlider = new QSlider(this);
			tilesSlider->setObjectName(QString::fromUtf8("tilesSlider"));
			tilesSlider->setOrientation(Qt::Horizontal);

			verticalLayout->addWidget(tilesSlider);

			verticalSpacer = new QSpacerItem(20, 13, QSizePolicy::Minimum, QSizePolicy::Fixed);

			verticalLayout->addItem(verticalSpacer);


			QHBoxLayout* hLayout2 = new QHBoxLayout(this);
			hLayout2->setObjectName(QString::fromUtf8("verticalLayout2"));
			QLabel* label2 = new QLabel("Number of frames (for progressive rendering):",this);
			label2->setObjectName(QString::fromUtf8("label"));

			hLayout2->addWidget(label2);

			frameSpinBox = new QSpinBox(this);
			frameSpinBox->setMaximum(2000);
			frameSpinBox->setMinimum(1);

			frameSpinBox->setObjectName(QString::fromUtf8("frameSpinBox"));

			hLayout2->addWidget(frameSpinBox);
			verticalLayout->addLayout(hLayout2);



			label_2 = new QLabel(this);
			label_2->setObjectName(QString::fromUtf8("label_2"));

			verticalLayout->addWidget(label_2);

			downsamplingSlider = new QSlider(this);
			downsamplingSlider->setObjectName(QString::fromUtf8("downsamplingSlider"));
			downsamplingSlider->setOrientation(Qt::Horizontal);

			verticalLayout->addWidget(downsamplingSlider);

			horizontalLayout_4 = new QHBoxLayout();
			horizontalLayout_4->setObjectName(QString::fromUtf8("horizontalLayout_4"));
			label_4 = new QLabel(this);
			label_4->setObjectName(QString::fromUtf8("label_4"));

			horizontalLayout_4->addWidget(label_4);

			filterSizeSpinBox = new QSpinBox(this);
			filterSizeSpinBox->setObjectName(QString::fromUtf8("filterSizeSpinBox"));
			filterSizeSpinBox->setMaximumSize(QSize(80, 16777215));
			filterSizeSpinBox->setMaximum(16);
			filterSizeSpinBox->setValue(2);

			horizontalLayout_4->addWidget(filterSizeSpinBox);

			horizontalSpacer_3 = new QSpacerItem(40, 20, QSizePolicy::Expanding, QSizePolicy::Minimum);

			horizontalLayout_4->addItem(horizontalSpacer_3);


			verticalLayout->addLayout(horizontalLayout_4);

			verticalSpacer_2 = new QSpacerItem(20, 13, QSizePolicy::Minimum, QSizePolicy::Fixed);

			verticalLayout->addItem(verticalSpacer_2);

			displayCheckBox = new QCheckBox(this);
			displayCheckBox->setObjectName(QString::fromUtf8("displayCheckBox"));

			verticalLayout->addWidget(displayCheckBox);

			verticalSpacer_3 = new QSpacerItem(20, 13, QSizePolicy::Minimum, QSizePolicy::Fixed);

			verticalLayout->addItem(verticalSpacer_3);

			horizontalLayout = new QHBoxLayout();
			horizontalLayout->setObjectName(QString::fromUtf8("horizontalLayout"));
			label_3 = new QLabel(this);
			label_3->setObjectName(QString::fromUtf8("label_3"));

			horizontalLayout->addWidget(label_3);

			filenameEdit = new QLineEdit(this);
			filenameEdit->setObjectName(QString::fromUtf8("filenameEdit"));

			horizontalLayout->addWidget(filenameEdit);

			fileButton = new QPushButton(this);
			fileButton->setObjectName(QString::fromUtf8("fileButton"));

			horizontalLayout->addWidget(fileButton);

			verticalLayout->addLayout(horizontalLayout);

			horizontalLayout_2 = new QHBoxLayout();
			horizontalLayout_2->setObjectName(QString::fromUtf8("horizontalLayout_2"));
			horizontalSpacer = new QSpacerItem(40, 20, QSizePolicy::Fixed, QSizePolicy::Minimum);

			horizontalLayout_2->addItem(horizontalSpacer);

			uniqueCheckBox = new QCheckBox(this);
			uniqueCheckBox->setObjectName(QString::fromUtf8("uniqueCheckBox"));

			horizontalLayout_2->addWidget(uniqueCheckBox);


			verticalLayout->addLayout(horizontalLayout_2);

			horizontalLayout_3 = new QHBoxLayout();
			horizontalLayout_3->setObjectName(QString::fromUtf8("horizontalLayout_3"));
			horizontalSpacer_2 = new QSpacerItem(40, 20, QSizePolicy::Fixed, QSizePolicy::Minimum);

			horizontalLayout_3->addItem(horizontalSpacer_2);

			autoSaveCheckBox = new QCheckBox(this);
			autoSaveCheckBox->setObjectName(QString::fromUtf8("autoSaveCheckBox"));

			horizontalLayout_3->addWidget(autoSaveCheckBox);


			verticalLayout->addLayout(horizontalLayout_3);

			verticalSpacer_4 = new QSpacerItem(20, 95, QSizePolicy::Minimum, QSizePolicy::Expanding);

			verticalLayout->addItem(verticalSpacer_4);

			buttonBox = new QDialogButtonBox(this);
			buttonBox->setObjectName(QString::fromUtf8("buttonBox"));
			buttonBox->setOrientation(Qt::Horizontal);
			buttonBox->setStandardButtons(QDialogButtonBox::Cancel|QDialogButtonBox::Ok);

			verticalLayout->addWidget(buttonBox);


			QObject::connect(buttonBox, SIGNAL(accepted()), this, SLOT(accept()));
			QObject::connect(buttonBox, SIGNAL(rejected()), this, SLOT(reject()));

			QMetaObject::connectSlotsByName(this);

			label->setText(QApplication::translate("OutputDialog", "Render quality: (2x2 tiles - 1630x1920 pixels - 3.1 MPixel):", 0, QApplication::UnicodeUTF8));
			label_2->setText(QApplication::translate("OutputDialog", "Output image: ( xXx pixels - x MPixel)", 0, QApplication::UnicodeUTF8));
			label_4->setText(QApplication::translate("OutputDialog", "Downsampling filter size (Lanczos):", 0, QApplication::UnicodeUTF8));
			displayCheckBox->setText(QApplication::translate("OutputDialog", "Display after rendering", 0, QApplication::UnicodeUTF8));
			label_3->setText(QApplication::translate("OutputDialog", "Filename", 0, QApplication::UnicodeUTF8));
			fileButton->setText(QApplication::translate("OutputDialog", "File...", 0, QApplication::UnicodeUTF8));
			uniqueCheckBox->setText(QApplication::translate("OutputDialog", "Add unique ID to name ()", 0, QApplication::UnicodeUTF8));
			autoSaveCheckBox->setText(QApplication::translate("OutputDialog", "Autosave fragment (as [ImageOutputName].frag)", 0, QApplication::UnicodeUTF8));

			tilesSlider->setMinimum(1);
			tilesSlider->setValue(3);
			tilesSlider->setMaximum(30);
			connect(tilesSlider, SIGNAL(valueChanged(int)), this, SLOT(tilesChanged(int)));
			connect(uniqueCheckBox, SIGNAL(clicked()), this, SLOT(updateFileName()));
			connect(autoSaveCheckBox, SIGNAL(clicked()), this, SLOT(updateFileName()));
			connect(fileButton, SIGNAL(clicked()), this, SLOT(chooseFile()));
			connect(filenameEdit, SIGNAL(textChanged(const QString &)),this, SLOT(updateFileName(const QString &)));

			QList<QByteArray> a = QImageWriter::supportedImageFormats();

			foreach(QByteArray s, a) {
				extensions.append(QString(s));
			}

			QSettings settings;
			uniqueCheckBox->setChecked(settings.value("outputdialog.unique", true).toBool());
			autoSaveCheckBox->setChecked(settings.value("outputdialog.autosave", true).toBool());
			displayCheckBox->setChecked(settings.value("outputdialog.display", false).toBool());
			filenameEdit->setText(settings.value("outputdialog.filename", "out.png").toString());

			tilesChanged(0);

			// Disable the stuff that is not implemented yet...
			label_2->setHidden(true);
			label_4->setHidden(true);
			displayCheckBox->setHidden(true);
			//autoSaveCheckBox->setHidden(true);
			downsamplingSlider->setHidden(true);
			filterSizeSpinBox->setHidden(true);

		}

		OutputDialog::~OutputDialog() {
			QSettings settings;
			settings.setValue("outputdialog.unique", uniqueCheckBox->isChecked());
			settings.setValue("outputdialog.autosave", autoSaveCheckBox->isChecked());
			settings.setValue("outputdialog.display", displayCheckBox->isChecked());
			settings.setValue("outputdialog.filename", filenameEdit->text());
		}

		void OutputDialog::chooseFile() {
			QString filename = SyntopiaCore::Misc::GetImageFileName(this, "Save screenshot as:");
			filenameEdit->setText(filename);
			updateFileName("");
		}

		void OutputDialog::updateFileName() {
			updateFileName("");
		}

		QString OutputDialog::getFileName() {
			if (uniqueCheckBox->isChecked()) return uniqueFileName;
			return filenameEdit->text();
		}

		QString OutputDialog::getFragmentFileName() {
			return fragmentFileName;
		}

		void OutputDialog::updateFileName(const QString &) {
			uniqueFileName = "";
			QString uname = "";
			QString file = filenameEdit->text();
			QFileInfo fi(file);
			bool error = false;
			if (!fi.absoluteDir().exists()) {
				uname = "dir does not exist";
				error = true;
			};

			QString extension = filenameEdit->text().section(".",-1,-1);

			if (!extensions.contains(extension, Qt::CaseInsensitive)) {
				uname = "not a valid image extension";
				error = true;
			}


			if (error) {
				QPalette p = filenameEdit->palette();
				p.setColor(QPalette::Base, QColor(255,70,70));
				filenameEdit->setPalette(p);
			} else {
				filenameEdit->setPalette(QApplication::palette());
			}

			buttonBox->button(QDialogButtonBox::Ok)->setEnabled(!error);

			if (uniqueCheckBox->isChecked()) {
				if (!error) {

					QString stripped = filenameEdit->text().section(".",0,-2); // find everything until extension.

					QString lastNumber = stripped.section("-", -1, -1);
					bool succes = false;
					int number = lastNumber.toInt(&succes);

					if (!succes) number = 2;
					if (succes) {
						// The filename already had a number extension.
						stripped = stripped.section("-", 0, -2);
					}

					QString testName = filenameEdit->text();
					while (QFile(testName).exists()) {
						testName = stripped + "-" + QString::number(number++) + "." + extension;
					}
					uname = testName;
					uniqueFileName = uname;
				}

				uniqueCheckBox->setText(QString("Add unique ID to filename (%1)").arg(uname));
				fragmentFileName = QFileInfo( uname.section(".",0,-2)+".frag").fileName();
			} else {
				uniqueCheckBox->setText("Add unique ID to filename");
				fragmentFileName =  QFileInfo(filenameEdit->text().section(".",0,-2)+".frag").fileName();

			}
			if (autoSaveCheckBox) autoSaveCheckBox->setText(QString("Autosave fragments and settings (in directory: '%1)").arg(
				QFileInfo(getFileName()).fileName()+ " Files'"));

		}

		void OutputDialog::tilesChanged(int) {
			int t = tilesSlider->value();
			label->setText(QString("Render quality: (%1x%2 tiles - %3x%4 pixels - %5 MegaPixel):").arg(t).arg(t).arg(t*width).arg(t*height)
				.arg((double)((t*width*t*height)/(1024.0*1024.0)),0,'f',1));
		}

		int OutputDialog::getTiles() {
			return tilesSlider->value();
		}

	}
}
