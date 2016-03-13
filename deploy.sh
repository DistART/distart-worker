#!/usr/bin/env bash

# largely inspired from http://dmd.3e.org/2015/09/Neurally-Stylin/
# it is tailored for AWS instances with GPUs on it so that is runs fast enough



luarocks install image
luarocks install loadcaffe
luarocks install torch
echo "export LD_LIBRARY_PATH=/home/ubuntu/torch-distro/install/lib:/home/ubuntu/torch-distro/install/lib:/home/ubuntu/cudnn-6.5-linux-x64-v2-rc2" >> ~/.bashrc

git clone https://github.com/jcjohnson/neural-style
cd neural-style
sh models/download_models.sh


#clone our worker client
cd ~/
git clone https://github.com/DistArt/distart-worker.git
cd distart-worker

npm install


