from django.shortcuts import render

from rest_framework import viewsets, permissions
from kunnic.models import Post, GalleryImage, Song
from kunnic.serializers import PostSerializer, GalleryImageSerializer, SongSerializer, CommentSerializer

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

# Create your views here.
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_published=True).order_by('-published_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    lookup_field = 'slug'


    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['get', 'post'], url_path='comments', url_name='comments')
    def comments(self, request, slug=None):
        post = self.get_object()
        if request.method == 'GET':
            comments = post.comments.all()
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
        elif request.method == 'POST':
            serializer = CommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(post=post, author=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all().order_by('-upload_date')
    serializer_class = GalleryImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all().order_by('-release_date')
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]