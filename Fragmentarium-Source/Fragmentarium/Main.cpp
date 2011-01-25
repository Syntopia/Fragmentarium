#include <QApplication>
#include <QSplashScreen>
#include <QDir>
#include <QBitmap>

#include "Fragmentarium/GUI/MainWindow.h"

	// Needed for unicode commandline below.
#ifdef Q_WS_WIN
	#define WIN32_LEAN_AND_MEAN
	#include "windows.h"
#endif

int main(int argc, char *argv[])
{
    Q_INIT_RESOURCE(Fragmentarium);
	//QApplication::setStyle("cleanlooks");
    QApplication app(argc, argv);

	QCoreApplication::setOrganizationName("Syntopia Software");
    QCoreApplication::setApplicationName("Fragmentarium");

	QPixmap pixmap(QDir(Fragmentarium::GUI::MainWindow::getMiscDir()).absoluteFilePath("splash.png"));
	QSplashScreen splash(pixmap, Qt::WindowStaysOnTopHint);
	     splash.setMask(pixmap.mask());
	splash.show();
	qApp->processEvents();

	// We will parse for filenames.
	// On Windows 'argv*' is not of much use, since it fails for Unicode paths.
	// We will fetch the unicode strings...
	QStringList args;

#ifdef Q_WS_WIN
	// On Windows we call this Win32 call...   
	int nArgs = 0;
	LPWSTR* wargv = CommandLineToArgvW(GetCommandLineW(), &nArgs);
	for (int i = 0; i < nArgs; i++) { args.append(QString::fromUtf16((const ushort *)wargv[i])); }
#else
	// Other platforms must implement their unicode parsing here...
	// I believe Linux and Unix will store UTF8 in the argv array.
	for (int i = 0; i < argc; i++) {
		args.append(QString::fromUtf8(argv[i]));
	}
#endif

	Fragmentarium::GUI::MainWindow *mainWin;
	if (args.size() <= 1) {
		mainWin = new Fragmentarium::GUI::MainWindow();
	} else {
		// We ignore more then one argument
		mainWin = new Fragmentarium::GUI::MainWindow(args[1]);
	}
	mainWin->setSplashWidget(&splash);
    mainWin->show();
	return app.exec();
}

