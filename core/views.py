from django.shortcuts import render

# intro view: learn more, start now or go away
from django.views.generic import DetailView


class IntroTemplateView(DetailView):
    def get(self, request, *args, **kwargs):
        return render(request, 'index.html')

def login(request):
    return render(request, 'login.html')
