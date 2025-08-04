from django.shortcuts import render

from rest_framework import viewsets, permissions
from kunnic.models import Post, GalleryImage, Song
from kunnic.serializers import PostSerializer, GalleryImageSerializer, SongSerializer

# Create your views here.
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_published=True).order_by('-published_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    lookup_field = 'slug'

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all().order_by('-upload_date')
    serializer_class = GalleryImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all().order_by('-release_date')
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]