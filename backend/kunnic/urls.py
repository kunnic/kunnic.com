from django.urls import path, include
from rest_framework.routers import DefaultRouter
from kunnic.views import PostViewSet, GalleryImageViewSet, SongViewSet

router = DefaultRouter()

router.register(r'posts', PostViewSet, basename='post')
router.register(r'galleries', GalleryImageViewSet, basename='gallery')
router.register(r'songs', SongViewSet, basename='song')

urlpatterns = [
    path('', include(router.urls)),
]


