from rest_framework import serializers
from django.contrib.auth.models import User
from kunnic.models import Post, GalleryImage, Song, Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'content', 'is_published', 'published_at', 'updated_at', 'created_at', 'author']
        read_only_fields = ['slug', 'author', 'updated_at', 'created_at']

class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = ['id', 'image', 'caption', 'upload_date']
        read_only_fields = ['upload_date']

class SongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'audio_file', 'lyrics', 'release_date', 'upload_date']
        read_only_fields = ['upload_date']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at']
        read_only_fields = ['post']