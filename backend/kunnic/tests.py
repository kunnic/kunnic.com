from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from datetime import date
from kunnic.models import Post, Comment, Song, GalleryImage


class PostAPITestCase(APITestCase):
    """Test cases for Posts API endpoints"""

    def setUp(self):
        """Set up test data"""
        self.testuser = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_list_published_posts(self):
        """Test Case 1.1: List Published Posts"""
        # Create published and unpublished posts
        post_published = Post.objects.create(
            title='Published Post',
            slug='published-post',
            content='This is a published post',
            is_published=True,
            author=self.testuser
        )
        post_unpublished = Post.objects.create(
            title='Unpublished Post',
            slug='unpublished-post',
            content='This is an unpublished post',
            is_published=False,
            author=self.testuser
        )

        # Make GET request
        url = reverse('post-list')
        response = self.client.get(url)

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['slug'], 'published-post')

        # Ensure unpublished post is not in response
        slugs_in_response = [post['slug'] for post in response.data['results']]
        self.assertNotIn('unpublished-post', slugs_in_response)

    def test_retrieve_single_published_post(self):
        """Test Case 1.2: Retrieve a Single Published Post"""
        # Create a published post
        post_published = Post.objects.create(
            title='My Published Post',
            slug='my-published-post',
            content='This is the content of my published post',
            is_published=True,
            author=self.testuser
        )

        # Make GET request
        url = reverse('post-detail', kwargs={'slug': 'my-published-post'})
        response = self.client.get(url)

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'My Published Post')
        self.assertEqual(response.data['slug'], 'my-published-post')
        self.assertEqual(response.data['content'], 'This is the content of my published post')
        self.assertEqual(response.data['author']['username'], 'testuser')

    def test_retrieve_unpublished_post_returns_404(self):
        """Test Case 1.3: Attempt to Retrieve an Unpublished Post"""
        # Create an unpublished post
        post_unpublished = Post.objects.create(
            title='My Unpublished Post',
            slug='my-unpublished-post',
            content='This is an unpublished post',
            is_published=False,
            author=self.testuser
        )

        # Make GET request
        url = reverse('post-detail', kwargs={'slug': 'my-unpublished-post'})
        response = self.client.get(url)

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_post_authenticated_user(self):
        """Test Case 1.4: Create a Post as an Authenticated User"""
        # Authenticate user
        self.client.force_authenticate(user=self.testuser)

        # Prepare post data
        post_data = {
            'title': 'New Test Post',
            'content': 'This is the content of the new test post'
        }

        # Make POST request
        url = reverse('post-list')
        response = self.client.post(url, post_data, format='json')

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if post was created in database
        created_post = Post.objects.get(title='New Test Post')
        self.assertEqual(created_post.author, self.testuser)
        self.assertEqual(created_post.slug, 'new-test-post')  # Auto-generated slug
        self.assertEqual(created_post.content, 'This is the content of the new test post')

    def test_create_post_unauthenticated_user(self):
        """Test Case 1.5: Attempt to Create a Post as an Unauthenticated User"""
        # Prepare post data
        post_data = {
            'title': 'Unauthorized Post',
            'content': 'This should not be created'
        }

        # Make POST request without authentication
        url = reverse('post-list')
        response = self.client.post(url, post_data, format='json')

        # Assertions
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class CommentAPITestCase(APITestCase):
    """Test cases for Comments API endpoints"""

    def setUp(self):
        """Set up test data"""
        self.testuser = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.test_post = Post.objects.create(
            title='Test Post',
            slug='test-post',
            content='This is a test post',
            is_published=True,
            author=self.testuser
        )

    def test_list_comments_for_post(self):
        """Test Case 2.1: List Comments for a Post"""
        # Create two comments for the test post
        comment1 = Comment.objects.create(
            post=self.test_post,
            author='User One',
            content='First comment'
        )
        comment2 = Comment.objects.create(
            post=self.test_post,
            author='User Two',
            content='Second comment'
        )

        # Make GET request
        url = reverse('post-comments', kwargs={'slug': 'test-post'})
        response = self.client.get(url)

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_comment_for_post(self):
        """Test Case 2.2: Create a Comment for a Post"""
        # Authenticate user (based on current implementation)
        self.client.force_authenticate(user=self.testuser)

        # Prepare comment data
        comment_data = {
            'author': 'Test Commenter',
            'content': 'This is a test comment'
        }

        # Make POST request
        url = reverse('post-comments', kwargs={'slug': 'test-post'})
        response = self.client.post(url, comment_data, format='json')

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if comment was created in database
        created_comment = Comment.objects.filter(post=self.test_post, content='This is a test comment').first()
        self.assertIsNotNone(created_comment)
        self.assertEqual(created_comment.post, self.test_post)

    def test_create_comment_invalid_data(self):
        """Test Case 2.3: Attempt to Create a Comment with Invalid Data"""
        # Authenticate user
        self.client.force_authenticate(user=self.testuser)

        # Prepare invalid comment data (missing content)
        comment_data = {
            'author': 'Test Commenter'
            # Missing 'content' field
        }

        # Make POST request
        url = reverse('post-comments', kwargs={'slug': 'test-post'})
        response = self.client.post(url, comment_data, format='json')

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('content', response.data)  # Error should mention content field


class SongAPITestCase(APITestCase):
    """Test cases for Songs API endpoints"""

    def setUp(self):
        """Set up test data"""
        # Create mock audio file
        audio_file1 = SimpleUploadedFile("test_song1.mp3", b"audio_content", content_type="audio/mpeg")
        audio_file2 = SimpleUploadedFile("test_song2.mp3", b"audio_content", content_type="audio/mpeg")

        # Create two songs
        self.song1 = Song.objects.create(
            title='Test Song 1',
            artist='Test Artist 1',
            audio_file=audio_file1,
            lyrics='Test lyrics for song 1',
            release_date=date(2024, 1, 1)
        )
        self.song2 = Song.objects.create(
            title='Test Song 2',
            artist='Test Artist 2',
            audio_file=audio_file2,
            lyrics='Test lyrics for song 2',
            release_date=date(2024, 2, 1)
        )

    def test_list_songs(self):
        """Test Case 3.1: List Songs"""
        # Make GET request
        url = reverse('song-list')
        response = self.client.get(url)

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)


class GalleryAPITestCase(APITestCase):
    """Test cases for Gallery API endpoints"""

    def setUp(self):
        """Set up test data"""
        # Create mock image files
        image_file1 = SimpleUploadedFile("test_image1.jpg", b"image_content", content_type="image/jpeg")
        image_file2 = SimpleUploadedFile("test_image2.jpg", b"image_content", content_type="image/jpeg")

        # Create two gallery images
        self.image1 = GalleryImage.objects.create(
            image=image_file1,
            caption='Test image 1'
        )
        self.image2 = GalleryImage.objects.create(
            image=image_file2,
            caption='Test image 2'
        )

    def test_list_gallery_images(self):
        """Test Case 3.2: List Gallery Images"""
        # Make GET request
        url = reverse('gallery-list')
        response = self.client.get(url)

        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)


class IntegrationTestCase(APITestCase):
    """Additional integration tests"""

    def setUp(self):
        """Set up test data"""
        self.testuser = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_post_creation_with_automatic_slug_generation(self):
        """Test that slugs are automatically generated from titles"""
        self.client.force_authenticate(user=self.testuser)

        post_data = {
            'title': 'This is a Test Post With Spaces',
            'content': 'Content here'
        }

        url = reverse('post-list')
        response = self.client.post(url, post_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_post = Post.objects.get(title='This is a Test Post With Spaces')
        self.assertEqual(created_post.slug, 'this-is-a-test-post-with-spaces')

    def test_post_ordering(self):
        """Test that posts are ordered by published_at in descending order"""
        # Create posts with different published_at times
        from django.utils import timezone
        import datetime

        old_post = Post.objects.create(
            title='Old Post',
            slug='old-post',
            content='Old content',
            is_published=True,
            author=self.testuser,
            published_at=timezone.now() - datetime.timedelta(days=1)
        )

        new_post = Post.objects.create(
            title='New Post',
            slug='new-post',
            content='New content',
            is_published=True,
            author=self.testuser,
            published_at=timezone.now()
        )

        url = reverse('post-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        # First post should be the newer one
        self.assertEqual(response.data['results'][0]['slug'], 'new-post')
        self.assertEqual(response.data['results'][1]['slug'], 'old-post')
