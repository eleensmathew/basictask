from django.db import models

SHAPE_CHOICES = (
    ("1","Sphere"),
    ("2","Cube"),
    ("3","Cylinder"),
)

class Shape(models.Model):
    type = models.CharField(max_length=1,choices=SHAPE_CHOICES)
    color =models.CharField(max_length=20,help_text="hex");

    def __str__(self):
        return str(self.id)