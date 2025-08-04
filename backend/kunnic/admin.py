from django.contrib import admin
from kunnic.models import Post,Song,GalleryImage
# Register your models here.

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_published', 'published_at', 'updated_at', 'created_at')
    prepopulated_fields = {'slug': ('title',)}
    search_fields = ('title', 'content')
    list_filter = ('is_published', 'published_at')
    ordering = ('-published_at',)

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'release_date', 'upload_date')
    search_fields = ('title', 'artist')
    list_filter = ('release_date',)
    ordering = ('-release_date',)

@admin.register(GalleryImage)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ('image', 'caption', 'upload_date')
    search_fields = ('caption',)
    ordering = ('-upload_date',)
    readonly_fields = ('upload_date',)
