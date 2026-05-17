@echo off
:loop
npx localtunnel --port 3000 --subdomain sanabakes
goto loop
