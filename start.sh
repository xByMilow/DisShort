#!/bin/bash

if screen -list | grep -q "url"; then
    echo "Attaching..."
    screen -r "url"
else
    echo "Creating new screen and starting Node.js..."
    screen -dmS "url" bash -c "node server.js"
    echo "Server is running in screen 'url'. To attach: screen -r url"
fi
