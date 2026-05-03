from django.test import TestCase
from django.db.utils import IntegrityError
from decimal import Decimal
from rest_framework import status
from rest_framework.test import APITestCase

from .authentication import FirebaseUser
from .models import Textbook, SaleListing, WishlistItem


class TextbookModelTest(TestCase):

    def setUp(self):
        self.book = Textbook.objects.create(
            name='Introduction to Algorithms',
            title='Introduction to Algorithms',
            author='Thomas H. Cormen',
            isbn='978-0262046305',
            edition='4th Edition',
            publisher='MIT Press',
            description='A comprehensive guide to algorithms.',
            price=Decimal('89.99'),
            category='textbook',
            google_books_id='cormen_algorithms',
        )

    def test_textbook_creation(self):
        self.assertEqual(self.book.title, 'Introduction to Algorithms')
        self.assertEqual(self.book.author, 'Thomas H. Cormen')
        self.assertEqual(self.book.isbn, '978-0262046305')
        self.assertEqual(self.book.price, Decimal('89.99'))

    def test_textbook_inherits_product_fields(self):
        """Textbook inherits name, description, price, category from Product."""
        self.assertEqual(self.book.name, 'Introduction to Algorithms')
        self.assertEqual(self.book.category, 'textbook')
        self.assertIsNotNone(self.book.created_date)

    def test_textbook_str(self):
        self.assertEqual(str(self.book), 'Introduction to Algorithms — Thomas H. Cormen')

    def test_google_books_id_unique(self):
        """Two textbooks cannot share the same Google Books ID."""
        with self.assertRaises(IntegrityError):
            Textbook.objects.create(
                name='Duplicate',
                title='Duplicate',
                author='Someone',
                price=Decimal('10.00'),
                category='textbook',
                google_books_id='cormen_algorithms',
            )


class SaleListingModelTest(TestCase):

    def setUp(self):
        self.book = Textbook.objects.create(
            name='Calculus',
            title='Calculus: Early Transcendentals',
            author='James Stewart',
            isbn='978-1337613927',
            price=Decimal('129.99'),
            category='textbook',
            google_books_id='stewart_calculus',
        )
        self.listing = SaleListing.objects.create(
            book=self.book,
            seller_id='firebase_uid_abc123',
            seller_name='Alex Johnson',
            price=Decimal('60.00'),
            condition='like-new',
            description='Only used for one semester.',
        )

    def test_listing_creation(self):
        self.assertEqual(self.listing.price, Decimal('60.00'))
        self.assertEqual(self.listing.condition, 'like-new')
        self.assertEqual(self.listing.status, 'active')

    def test_listing_linked_to_textbook(self):
        """SaleListing has a foreign key relationship to Textbook."""
        self.assertEqual(self.listing.book.title, 'Calculus: Early Transcendentals')
        self.assertEqual(self.listing.book.author, 'James Stewart')

    def test_listing_str(self):
        self.assertEqual(
            str(self.listing),
            'Calculus: Early Transcendentals — $60.00 (like-new)'
        )

    def test_listing_default_status(self):
        self.assertEqual(self.listing.status, 'active')

    def test_listing_mark_sold(self):
        self.listing.status = 'sold'
        self.listing.save()
        updated = SaleListing.objects.get(pk=self.listing.pk)
        self.assertEqual(updated.status, 'sold')

    def test_multiple_listings_per_book(self):
        """Multiple sellers can list the same textbook."""
        SaleListing.objects.create(
            book=self.book,
            seller_id='firebase_uid_xyz789',
            seller_name='Jordan Smith',
            price=Decimal('45.00'),
            condition='good',
        )
        self.assertEqual(SaleListing.objects.filter(book=self.book).count(), 2)

    def test_listing_deleted_when_book_deleted(self):
        """Listings are cascade deleted when their textbook is deleted."""
        listing_id = self.listing.pk
        self.book.delete()
        self.assertFalse(SaleListing.objects.filter(pk=listing_id).exists())


class WishlistItemModelTest(TestCase):

    def setUp(self):
        self.book = Textbook.objects.create(
            name='Organic Chemistry',
            title='Organic Chemistry',
            author='John McMurry',
            isbn='978-1305080485',
            price=Decimal('149.99'),
            category='textbook',
            google_books_id='mcmurry_orgo',
        )
        self.item = WishlistItem.objects.create(
            user_id='firebase_uid_abc123',
            book=self.book,
        )

    def test_wishlist_item_creation(self):
        self.assertEqual(self.item.user_id, 'firebase_uid_abc123')
        self.assertEqual(self.item.book.title, 'Organic Chemistry')
        self.assertIsNotNone(self.item.added_date)

    def test_wishlist_item_str(self):
        self.assertEqual(str(self.item), 'firebase_uid_abc123 → Organic Chemistry')

    def test_duplicate_wishlist_item_raises_error(self):
        """A user cannot add the same book to their wishlist twice."""
        with self.assertRaises(IntegrityError):
            WishlistItem.objects.create(
                user_id='firebase_uid_abc123',
                book=self.book,
            )

    def test_different_users_can_wishlist_same_book(self):
        """Two different users can both wishlist the same book."""
        WishlistItem.objects.create(
            user_id='firebase_uid_xyz789',
            book=self.book,
        )
        self.assertEqual(WishlistItem.objects.filter(book=self.book).count(), 2)

    def test_wishlist_item_deleted_when_book_deleted(self):
        """Wishlist items are cascade deleted when their textbook is deleted."""
        item_id = self.item.pk
        self.book.delete()
        self.assertFalse(WishlistItem.objects.filter(pk=item_id).exists())

# --- API views (basis paths per textbook_list, textbook_detail, listing_list, listing_detail, wishlist) ---

def _sample_book_payload(**overrides):
    base = {
        'name': 'API Test Book',
        'title': 'API Test Book',
        'author': 'Test Author',
        'price': '19.99',
        'category': 'textbook',
        'google_books_id': 'api_test_gb_1',
    }
    base.update(overrides)
    return base


class TextbookListAPITest(APITestCase):
    """Basis paths: GET (no filter, google_books_id, isbn, both); POST (get_or_create new/existing, serializer ok/fail)."""

    def setUp(self):
        self.url = '/api/textbooks/'
        self.book = Textbook.objects.create(
            **_sample_book_payload(
                name='Listed Book',
                title='Listed Book',
                google_books_id='filter_me',
                isbn='111-1111111111',
            ),
        )

    def test_get_lists_all(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(r.data), 1)

    def test_get_filter_google_books_id(self):
        r = self.client.get(self.url, {'google_books_id': 'filter_me'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)
        self.assertEqual(r.data[0]['google_books_id'], 'filter_me')

    def test_get_filter_isbn(self):
        r = self.client.get(self.url, {'isbn': '111-1111111111'})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)

    def test_get_filter_google_books_id_and_isbn(self):
        r = self.client.get(
            self.url,
            {'google_books_id': 'filter_me', 'isbn': '111-1111111111'},
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)

    def test_post_get_or_create_returns_201_when_new(self):
        payload = _sample_book_payload(
            google_books_id='brand_new_id',
            name='New From API',
            title='New From API',
        )
        r = self.client.post(self.url, payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['google_books_id'], 'brand_new_id')

    def test_post_get_or_create_returns_200_when_exists(self):
        r = self.client.post(
            self.url,
            _sample_book_payload(
                google_books_id='filter_me',
                title='Updated Title Attempt',
            ),
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.book.refresh_from_db()
        self.assertEqual(self.book.title, 'Listed Book')

    def test_post_without_google_books_id_valid_serializer_201(self):
        payload = {
            'name': 'No GB ID',
            'title': 'No GB ID',
            'author': 'A',
            'price': '5.00',
            'category': 'textbook',
            'google_books_id': '',
        }
        r = self.client.post(self.url, payload, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

    def test_post_without_google_books_id_invalid_400(self):
        r = self.client.post(
            self.url,
            {'title': 'missing required fields'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class TextbookDetailAPITest(APITestCase):
    def setUp(self):
        self.book = Textbook.objects.create(**_sample_book_payload(google_books_id='detail_gb'))
        self.url = f'/api/textbooks/{self.book.pk}/'

    def test_get_found(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['title'], 'API Test Book')

    def test_get_not_found(self):
        r = self.client.get('/api/textbooks/999999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)


class ListingListAPITest(APITestCase):
    """Basis paths: GET all active / filter isbn; POST unauthenticated, authenticated valid/invalid."""

    def setUp(self):
        self.url = '/api/listings/'
        self.book = Textbook.objects.create(**_sample_book_payload(google_books_id='listing_book'))
        self.listing = SaleListing.objects.create(
            book=self.book,
            seller_id='seller_a',
            seller_name='Seller A',
            price=Decimal('40.00'),
            condition='good',
        )
        self.user = FirebaseUser(uid='seller_a', email='a@example.com', name='Seller A')

    def test_get_only_active(self):
        sold_book = Textbook.objects.create(
            **_sample_book_payload(google_books_id='sold_book', title='Sold Title'),
        )
        SaleListing.objects.create(
            book=sold_book,
            seller_id='other',
            seller_name='O',
            price=Decimal('10.00'),
            condition='good',
            status='sold',
        )
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = [row['id'] for row in r.data]
        self.assertIn(self.listing.pk, ids)

    def test_get_filter_by_isbn(self):
        r = self.client.get(self.url, {'isbn': self.book.isbn})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)

    def test_post_unauthenticated_401(self):
        r = self.client.post(
            self.url,
            {
                'book_id': self.book.pk,
                'price': '30.00',
                'condition': 'like-new',
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_post_authenticated_201(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post(
            self.url,
            {
                'book_id': self.book.pk,
                'price': '35.50',
                'condition': 'like-new',
                'description': 'Nice copy.',
            },
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['seller_id'], 'seller_a')

    def test_post_authenticated_invalid_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post(
            self.url,
            {'book_id': self.book.pk},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class ListingDetailAPITest(APITestCase):
    """Basis paths: GET ok/404; PATCH/DELETE owner vs non-owner; PATCH valid/invalid; DELETE 204."""

    def setUp(self):
        self.book = Textbook.objects.create(**_sample_book_payload(google_books_id='detail_listing_book'))
        self.owner = FirebaseUser(uid='owner_uid', email='o@example.com', name='Owner')
        self.other = FirebaseUser(uid='other_uid', email='x@example.com', name='X')
        self.listing = SaleListing.objects.create(
            book=self.book,
            seller_id='owner_uid',
            seller_name='Owner',
            price=Decimal('25.00'),
            condition='fair',
        )

    def test_get_ok(self):
        r = self.client.get(f'/api/listings/{self.listing.pk}/')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['seller_id'], 'owner_uid')

    def test_get_not_found(self):
        r = self.client.get('/api/listings/999999/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_non_owner_403(self):
        self.client.force_authenticate(user=self.other)
        r = self.client.patch(
            f'/api/listings/{self.listing.pk}/',
            {'price': '20.00'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_unauthenticated_403(self):
        r = self.client.patch(
            f'/api/listings/{self.listing.pk}/',
            {'price': '20.00'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_patch_owner_valid(self):
        self.client.force_authenticate(user=self.owner)
        r = self.client.patch(
            f'/api/listings/{self.listing.pk}/',
            {'price': '22.00', 'condition': 'good'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['price'], '22.00')

    def test_patch_owner_invalid_400(self):
        self.client.force_authenticate(user=self.owner)
        r = self.client.patch(
            f'/api/listings/{self.listing.pk}/',
            {'condition': 'not-a-valid-condition'},
            format='json',
        )
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_non_owner_403(self):
        self.client.force_authenticate(user=self.other)
        r = self.client.delete(f'/api/listings/{self.listing.pk}/')
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_unauthenticated_403(self):
        r = self.client.delete(f'/api/listings/{self.listing.pk}/')
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_owner_204(self):
        self.client.force_authenticate(user=self.owner)
        r = self.client.delete(f'/api/listings/{self.listing.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(SaleListing.objects.filter(pk=self.listing.pk).exists())


class WishlistAPITest(APITestCase):
    """Basis paths: GET/POST authenticated; POST invalid; DELETE ok/wrong user/not found."""

    def setUp(self):
        self.book = Textbook.objects.create(**_sample_book_payload(google_books_id='wish_book'))
        self.user = FirebaseUser(uid='wish_user', email='w@example.com', name='W')
        self.url = '/api/wishlist/'

    def test_get_requires_auth(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_returns_user_items(self):
        WishlistItem.objects.create(user_id='wish_user', book=self.book)
        self.client.force_authenticate(user=self.user)
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.data), 1)

    def test_post_valid_201(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post(self.url, {'book_id': self.book.pk}, format='json')
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['book']['id'], self.book.pk)

    def test_post_invalid_400(self):
        self.client.force_authenticate(user=self.user)
        r = self.client.post(self.url, {}, format='json')
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_removes_item_204(self):
        item = WishlistItem.objects.create(user_id='wish_user', book=self.book)
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/wishlist/{item.pk}/')
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_wrong_user_404(self):
        item = WishlistItem.objects.create(user_id='other_wish', book=self.book)
        self.client.force_authenticate(user=self.user)
        r = self.client.delete(f'/api/wishlist/{item.pk}/')
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(WishlistItem.objects.filter(pk=item.pk).exists())
