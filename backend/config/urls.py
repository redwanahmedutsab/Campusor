from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/health/', health_check, name='health-check'),

    path('api/auth/',        include('apps.users.urls')),

    path('api/marketplace/', include('apps.marketplace.urls')),

    path('api/events/',      include('apps.events.urls')),

    path('api/lost-found/',  include('apps.lost_found.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
