@echo off
echo ========================================================
echo   Compilando UrbanInspect APK
echo ========================================================
set "JAVA_HOME=C:\Users\ABARBA\.android_build_tools\jdk"
set "ANDROID_HOME=C:\Users\ABARBA\.android_build_tools\android-sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%"

echo 1. Generando bundle web...
call npm.cmd run build
if %errorlevel% neq 0 (
    echo Error al compilar bundle web.
    pause
    exit /b %errorlevel%
)

echo 2. Sincronizando con Capacitor Android...
call npx.cmd cap sync android
if %errorlevel% neq 0 (
    echo Error al sincronizar con Capacitor.
    pause
    exit /b %errorlevel%
)

echo 3. Compilando APK con Gradle...
cd android
call gradlew.bat assembleDebug
cd ..
if %errorlevel% neq 0 (
    echo Error al compilar APK.
    pause
    exit /b %errorlevel%
)

copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "UrbanInspect-debug.apk"
echo ========================================================
echo APK generado con exito: UrbanInspect-debug.apk
echo ========================================================
pause
