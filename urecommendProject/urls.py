from django.conf.urls import patterns, include, url
from django.contrib import admin
import urecommend.views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'urecommendProject.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', urecommend.views.IntroTemplateView.as_view(), name='intro_view'),

)
