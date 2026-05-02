from rest_framework import serializers
from .models import Textbook, SaleListing, WishlistItem


class TextbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Textbook
        fields = '__all__'


class SaleListingSerializer(serializers.ModelSerializer):
    book = TextbookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Textbook.objects.all(), source='book', write_only=True
    )

    class Meta:
        model = SaleListing
        fields = ['id', 'book', 'book_id', 'seller_id', 'seller_name',
                  'price', 'condition', 'description', 'status', 'created_date']
        read_only_fields = ['seller_id', 'seller_name', 'created_date']


class WishlistItemSerializer(serializers.ModelSerializer):
    book = TextbookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Textbook.objects.all(), source='book', write_only=True
    )

    class Meta:
        model = WishlistItem
        fields = ['id', 'book', 'book_id', 'user_id', 'added_date']
        read_only_fields = ['user_id', 'added_date']
