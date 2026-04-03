"""
config/urls.py — Campusor FINAL (All MVP modules)
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/',        include('apps.users.urls')),

    # Marketplace
    path('api/marketplace/', include('apps.marketplace.urls')),

    # Events
    path('api/events/',      include('apps.events.urls')),

    # Lost & Found
    path('api/lost-found/',  include('apps.lost_found.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
