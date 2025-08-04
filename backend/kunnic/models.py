from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils import timezone
# Create your models here.

class Post(models.Model):
    title = models.CharField(max_length=200, verbose_name="Title", help_text="Title of the post")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="Slug", help_text="Unique identifier for the post")
    content = models.TextField(verbose_name="Content", help_text="Main content of the post")
    is_published = models.BooleanField(default=False, verbose_name="Is Published", help_text="Indicates if the post is published")
    published_at = models.DateTimeField(default=timezone.now, verbose_name="Published At", help_text="Date and time when the post was published")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At", help_text="Date and time when the post was last updated")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At", help_text="Date and time when the post was created")
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name="Author",
        help_text="Author of the post"
    )

    class Meta:
        ordering = ['-published_at']
        verbose_name = "Post"
        verbose_name_plural = "Posts"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

class Song(models.Model):
    title = models.CharField(max_length=200, verbose_name="Title", help_text="Title of the song")
    artist = models.CharField(max_length=100, verbose_name="Artist", help_text="Artist of the song")
    audio_file = models.FileField(upload_to='songs/', verbose_name="Audio File", help_text="Audio file of the song")
    lyrics = models.TextField(blank=True, null=True, verbose_name="Lyrics", help_text="Lyrics of the song")
    release_date = models.DateField(verbose_name="Release Date", help_text="Release date of the song")
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="Created At", help_text="Date and time when the song was created")

    class Meta:
        ordering = ['-release_date']
        verbose_name = "Song"
        verbose_name_plural = "Songs"

    def __str__(self):
        return f"{self.title} by {self.artist}" if self.artist else self.title

class GalleryImage(models.Model):
    image = models.ImageField(upload_to='gallery/', verbose_name="Image", help_text="Image for the gallery")
    caption = models.CharField(max_length=255, blank=True, null=True, verbose_name="Caption", help_text="Caption for the image")
    upload_date = models.DateTimeField(auto_now_add=True, verbose_name="Upload Date", help_text="Date and time when the image was uploaded")

    class Meta:
        ordering = ['-upload_date']
        verbose_name = "Gallery Image"
        verbose_name_plural = "Gallery Images"

    def __str__(self):
        return self.image.name