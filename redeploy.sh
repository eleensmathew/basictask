git pull
source env/bin/activate
cd mysite
python manage.py collectstatic --noinput
deactivate
sudo systemctl restart gunicorn