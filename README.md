# tornado-octave
Example of how to couple Tornado with Octave. This demo is going to show 

Necessary Packages.

Install complete stack and dependencies,
```
sudo apt-get update
sudo apt-get install git
git clone https://github.com/albertoandreottiATgmail/tornado-octave.git
sudo apt-get install python-setuptools python-dev build-essential
sudo easy_install pip
sudo apt-get install gcc

sudo pip install scipy
sudo pip install numpy
sudo pip install tornado
sudo pip install oct2py
```
If all that went well just try,

tornado-octave> python server.py

and point your browser to localhost:8000/draw.html.
You can try this [here](http://104.198.190.113:8000/draw.html).
