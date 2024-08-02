@echo off
set /p message="Enter the commit message: "
if "%message%"=="" set "message=Update latest action"

cd C:\Users\anson\COSC203_Assessment\cosc203_ass1
git add .
git commit -m "%message%"
git push
