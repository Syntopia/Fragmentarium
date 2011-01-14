rmdir /S "Fragmentarium"
mkdir "Fragmentarium"
xcopy ..\Examples\*.* "Fragmentarium"\Examples\  /E
rmdir /S "Fragmentarium"\Examples\DontDeploy
xcopy ..\Misc\*.* "Fragmentarium"\Misc\  /E
xcopy Microsoft.VC90.CRT\*.* "Fragmentarium"\Microsoft.VC90.CRT\  /E
copy Release\Fragmentarium.exe "Fragmentarium"\  
copy %QT4DIR%\bin\QtOpenGl4.dll "Fragmentarium"\  
copy %QT4DIR%\bin\QtGUI4.dll "Fragmentarium"\ 
copy %QT4DIR%\bin\QtCore4.dll "Fragmentarium"\  
copy %QT4DIR%\bin\QtXml4.dll "Fragmentarium"\  
copy %QT4DIR%\bin\QtScript4.dll "Fragmentarium"\  
rem copy *.manifest "Fragmentarium"\ 
copy EULA.txt "Fragmentarium"\  
copy License.txt "Fragmentarium"\  
copy ReadMe.txt "Fragmentarium"\  
@rem copy C:\WINDOWS\WinSxS\x86_Microsoft.VC80.CRT_1fc8b3b9a1e18e3b_8.0.50727.762_x-ww_6b128700\msvcr80.dll "Fragmentarium"\ 
@rem copy C:\WINDOWS\WinSxS\x86_Microsoft.VC80.CRT_1fc8b3b9a1e18e3b_8.0.50727.762_x-ww_6b128700\msvcp80.dll "Fragmentarium"\ 
pause