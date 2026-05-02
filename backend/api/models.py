from django.db import models


class Product(models.Model):
    """Base class for all products in the system."""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50)
    image_url = models.URLField(blank=True)
    created_date = models.DateField(auto_now_add=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class Textbook(Product):
    """A textbook — extends Product with academic metadata."""
    isbn = models.CharField(max_length=20, blank=True)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    edition = models.CharField(max_length=100, blank=True)
    publisher = models.CharField(max_length=255, blank=True)
    google_books_id = models.CharField(max_length=100, blank=True, unique=True)

    def __str__(self):
        return f"{self.title} — {self.author}"


class SaleListing(models.Model):
    """A student-to-student textbook sale listing."""

    CONDITION_CHOICES = [
        ('new', 'New'),
        ('like-new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('inactive', 'Inactive'),
    ]

    book = models.ForeignKey(Textbook, on_delete=models.CASCADE, related_name='listings')
    seller_id = models.CharField(max_length=128)
    seller_name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.book.title} — ${self.price} ({self.condition})"


class WishlistItem(models.Model):
    """A book saved to a user's wishlist."""
    user_id = models.CharField(max_length=128)
    book = models.ForeignKey(Textbook, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('user_id', 'book')

    def __str__(self):
        return f"{self.user_id} → {self.book.title}"
