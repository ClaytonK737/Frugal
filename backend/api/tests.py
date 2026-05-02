from django.test import TestCase
from django.db.utils import IntegrityError
from decimal import Decimal
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
