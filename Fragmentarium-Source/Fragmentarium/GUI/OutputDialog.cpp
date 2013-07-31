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
            setWindowTitle("High Resolution and Animation Render");

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

            label5 = new QLabel(this);
            verticalLayout->addWidget(label5);
            paddingSlider = new QSlider(this);
            paddingSlider->setObjectName(QString::fromUtf8("tilesSlider"));
            paddingSlider->setOrientation(Qt::Horizontal);
            verticalLayout->addWidget(paddingSlider);
            verticalLayout->addItem( new QSpacerItem(20, 13, QSizePolicy::Minimum, QSizePolicy::Fixed));

            QHBoxLayout* hLayout2 = new QHBoxLayout(this);
            hLayout2->setObjectName(QString::fromUtf8("verticalLayout2"));
            QLabel* label2 = new QLabel("Number of frames (for progressive rendering):",this);
            label2->setObjectName(QString::fromUtf8("label"));
            hLayout2->addWidget(label2);
            frameSpinBox = new QSpinBox(this);
            frameSpinBox->setMaximum(2000);
            frameSpinBox->setMinimum(1);
            frameSpinBox->setObjectName(QString::fromUtf8("frameSpinBox"));
            connect(frameSpinBox, SIGNAL(valueChanged(int)), this, SLOT(updateTotalTiles(int)));

            hLayout2->addWidget(frameSpinBox);
            verticalLayout->addLayout(hLayout2);

            verticalLayout->addItem(new QSpacerItem(20, 13, QSizePolicy::Minimum, QSizePolicy::Fixed));


            // Anim params
            {
                QHBoxLayout* hl = new QHBoxLayout();
                animCheckBox = new QCheckBox("Render animation", this);
                hl->addWidget(animCheckBox);
                verticalLayout->addLayout(hl);
            }
            connect(animCheckBox, SIGNAL(clicked()), this, SLOT(animationChanged()));

            {
                QHBoxLayout* hl = new QHBoxLayout();
                hl->addItem(new QSpacerItem(40, 20, QSizePolicy::Fixed, QSizePolicy::Minimum));
                hl->addWidget(new QLabel("End time:",this));
                endTimeSpinBox = new QSpinBox(this);
                endTimeSpinBox->setMinimum(0);
                endTimeSpinBox->setMaximum(1000);
                endTimeSpinBox->setValue(100);
                hl->addWidget(endTimeSpinBox);
                verticalLayout->addLayout(hl);
                endTimeLayout = hl;
            }

            {
                QHBoxLayout* hl = new QHBoxLayout();
                hl->addItem(new QSpacerItem(40, 20, QSizePolicy::Fixed, QSizePolicy::Minimum));
                hl->addWidget(new QLabel("FPS:    ",this));
                fpsSpinBox = new QSpinBox(this);
                fpsSpinBox->setMinimum(1);
                fpsSpinBox->setMaximum(100);
                fpsSpinBox->setValue(25);
                hl->addWidget(fpsSpinBox);
                verticalLayout->addLayout(hl);
                fpsLayout = hl;
            }

            verticalLayout->addItem(new QSpacerItem(20, 13, QSizePolicy::Minimum, QSizePolicy::Fixed));

            QHBoxLayout* hLayout21 = new QHBoxLayout(this);
            hLayout21->setObjectName(QString::fromUtf8("verticalLayout2"));
            totalFrames = new QLabel("...",this);
            hLayout21->addWidget(totalFrames);
            verticalLayout->addLayout(hLayout21);
            verticalLayout->addItem(new QSpacerItem(20, 13, QSizePolicy::Minimum, QSizePolicy::Fixed));

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
            label_3->setText(QApplication::translate("OutputDialog", "Filename", 0, QApplication::UnicodeUTF8));
            fileButton->setText(QApplication::translate("OutputDialog", "File...", 0, QApplication::UnicodeUTF8));
            uniqueCheckBox->setText(QApplication::translate("OutputDialog", "Add unique ID to name ()", 0, QApplication::UnicodeUTF8));
            autoSaveCheckBox->setText(QApplication::translate("OutputDialog", "Autosave fragment (as [ImageOutputName].frag)", 0, QApplication::UnicodeUTF8));

            tilesSlider->setMinimum(1);
            tilesSlider->setValue(3);
            tilesSlider->setMaximum(30);
            paddingSlider->setMinimumHeight(0);
            paddingSlider->setMaximum(100);
            paddingSlider->setValue(0);
            connect(tilesSlider, SIGNAL(valueChanged(int)), this, SLOT(tilesChanged(int)));
            connect(paddingSlider, SIGNAL(valueChanged(int)), this, SLOT(tilesChanged(int)));
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
            filenameEdit->setText(settings.value("outputdialog.filename", "out.png").toString());
            tilesChanged(0);
            updateTotalTiles(0);
            animationChanged();
        }

        void OutputDialog::animationChanged() {
            if (animCheckBox->isChecked()) {
                INFO("isChecked()");
                fpsLayout->setEnabled(true);
                endTimeLayout->setEnabled(true);
                fpsSpinBox->setEnabled(true);
                endTimeSpinBox->setEnabled(true);
            } else {
                INFO("isNotChecked()");
                fpsLayout->setEnabled(false);
                endTimeLayout->setEnabled(false);
                fpsSpinBox->setEnabled(false);
                endTimeSpinBox->setEnabled(false);
            }
            updateTotalTiles(0);
        }

        OutputDialog::~OutputDialog() {
            QSettings settings;
            settings.setValue("outputdialog.unique", uniqueCheckBox->isChecked());
            settings.setValue("outputdialog.autosave", autoSaveCheckBox->isChecked());
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
                    while (QFile(testName).exists() || QFile(testName+ " Files").exists()) {
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
            double mp = (double)((t*width*t*height)/(1024.0*1024.0));
            label->setText(QString("Render quality: (%1x%2 tiles - %3x%4 pixels - %5 MegaPixel):").arg(t).arg(t).arg(t*width).arg(t*height)
                           .arg(mp,0,'f',1));

            float f = paddingSlider->value()/100.0;
            float fd = 1.0/(1.0+f);
            label5->setText(QString("Padding %1%: (resulting size: %3x%4 pixels - %5 MegaPixel):").arg((float)(f*100.),0,'f',1).arg((int)(fd*t*width)).arg((int)(fd*t*height)).arg(mp*fd*fd,0,'f',1));
            updateTotalTiles(0);
        }

        void OutputDialog::updateTotalTiles(int) {
            int t = tilesSlider->value();
            int s = frameSpinBox->value();
            if (animCheckBox->isChecked()) {
                int fps = fpsSpinBox->value();
                int length = endTimeSpinBox->value();
                totalFrames->setText(QString("Total tiles: %1x%2x%3x%4 = %5").arg(t).arg(s).arg(fps).arg(length).arg(fps*length*s));
            } else {
                totalFrames->setText(QString("Total tiles: %1x%2 = %4").arg(t).arg(s).arg(t*s));
            }

            // Tiles x subframes x animframes
        }

        int OutputDialog::getTiles() {
            return tilesSlider->value();
        }

        float OutputDialog::getPadding() {
            return paddingSlider->value()/100.0;
        }

    }
}
