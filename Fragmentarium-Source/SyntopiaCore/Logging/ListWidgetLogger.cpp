#include "ListWidgetLogger.h"
#include <QAction>
#include <QMenu>
#include <QClipboard>
#include <QApplication>

namespace SyntopiaCore {
	namespace Logging {

		namespace {

			
			class ListWidget : public QListWidget {
			public: 
				ListWidget(QWidget* parent) : QListWidget(parent) {
				}

				void contextMenuEvent(QContextMenuEvent* ev) {
					QMenu contextMenu;
					QAction copyAction("Copy to Clipboard", &contextMenu);
					QAction clearAction("Clear", &contextMenu);
					contextMenu.addAction(&copyAction);
					contextMenu.addAction(&clearAction);
					QAction* choice = contextMenu.exec(ev->globalPos());
					if (choice == &copyAction) {
						QClipboard *clipboard = QApplication::clipboard();
						QList<QListWidgetItem*> items = selectedItems();
						QStringList l;
						foreach (QListWidgetItem* i, items) {
							l.append(i->text());
						}
						INFO(QString("Copied %1 lines to clipboard").arg(l.count()));
						clipboard->setText(l.join("\n"));
					
					} else if (choice == &clearAction) {
						clear();
					}
				}
			};
		}

		ListWidgetLogger::ListWidgetLogger(QWidget* parent) : parent(parent) { 	
			listWidget = new ListWidget(parent); 
			listWidget->setSelectionMode(QAbstractItemView::ExtendedSelection);
		}

		ListWidgetLogger::~ListWidgetLogger() { 
		}

		void ListWidgetLogger::log(QString message, LogLevel priority) {
			if (listWidget->count() > 50) {
				listWidget->setUpdatesEnabled(false);
				while (listWidget->count() > 20) {
					delete(listWidget->takeItem(0));
				}
				listWidget->setUpdatesEnabled(true);
			}
		

			QListWidgetItem* i = new QListWidgetItem(message, listWidget);

			// Levels: NoneLevel, DebugLevel, TimingLevel, InfoLevel, WarningLevel, CriticalLevel, AllLevel

			if ( priority == InfoLevel ) {
				i->setBackgroundColor(QColor(255,255,255));
			} else if ( priority == ScriptInfoLevel ) {
				i->setBackgroundColor(QColor(155,123,253));
			} else if ( priority == WarningLevel ) {
				parent->show();
				i->setBackgroundColor(QColor(255,243,73));
			} else if ( priority == CriticalLevel ) {
				parent->show();
				i->setBackgroundColor(QColor(255,2,0));
			} else if ( priority == TimingLevel ) {
				parent->show();
				i->setBackgroundColor(QColor(25,255,0));
			} else {
				i->setBackgroundColor(QColor(220,220,220));
			}
			listWidget->scrollToItem(i); 

		}

	}
}
