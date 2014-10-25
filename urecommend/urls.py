from django.conf.urls import patterns, include, url
from django.contrib import admin
import core.views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'urecommend.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', core.views.IntroTemplateView.as_view(), name='intro_view'),
    url(r'^login/$', core.views.login, name='login_view'),

)
