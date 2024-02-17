from django.utils import timezone
from datetime import date
from django.shortcuts import render, redirect

def home(request):
    now = timezone.now()
    return render(request, 'mysite/home.html', {'msg': now})
    
    