source env/bin/activate
git pull
cd /home/eleensmathew/news/mysite
sudo pkill gunicorn
/home/eleensmathew/news/env/bin/gunicorn --access-logfile - --workers 3 --bind unix:/home/eleensmathew/gunicorn.sock mysite.wsgi:application --log-file gunicorn.log &