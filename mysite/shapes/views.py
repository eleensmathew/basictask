from django.shortcuts import render
from .models import Shape
import json 
def home_view(request):
    shapes = [{"type": int(x.type), "color":x.color} for x in Shape.objects.all()]
    shape_json = json.dumps(shapes)
    context = {'shapes':shape_json}
    return render(request, 'shapes/main.html',context)