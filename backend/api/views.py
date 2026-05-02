from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Textbook, SaleListing, WishlistItem
from .serializers import TextbookSerializer, SaleListingSerializer, WishlistItemSerializer


# --- Textbooks ---

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def textbook_list(request):
    if request.method == 'GET':
        google_books_id = request.query_params.get('google_books_id')
        isbn = request.query_params.get('isbn')
        books = Textbook.objects.all()
        if google_books_id:
            books = books.filter(google_books_id=google_books_id)
        if isbn:
            books = books.filter(isbn=isbn)
        return Response(TextbookSerializer(books, many=True).data)

    # Use get_or_create so duplicate Google Books IDs never cause errors
    google_books_id = request.data.get('google_books_id', '')
    if google_books_id:
        book, created = Textbook.objects.get_or_create(
            google_books_id=google_books_id,
            defaults=request.data,
        )
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(TextbookSerializer(book).data, status=code)

    serializer = TextbookSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def textbook_detail(request, pk):
    try:
        book = Textbook.objects.get(pk=pk)
    except Textbook.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(TextbookSerializer(book).data)


# --- Marketplace Listings ---

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def listing_list(request):
    if request.method == 'GET':
        isbn = request.query_params.get('isbn')
        listings = SaleListing.objects.filter(status='active').select_related('book')
        if isbn:
            listings = listings.filter(book__isbn=isbn)
        return Response(SaleListingSerializer(listings, many=True).data)

    if not request.user.is_authenticated:
        return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = SaleListingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(seller_id=request.user.uid, seller_name=request.user.name or request.user.email)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def listing_detail(request, pk):
    try:
        listing = SaleListing.objects.get(pk=pk)
    except SaleListing.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(SaleListingSerializer(listing).data)

    if not request.user.is_authenticated or request.user.uid != listing.seller_id:
        return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PATCH':
        serializer = SaleListingSerializer(listing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    listing.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# --- Wishlist ---

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def wishlist(request):
    if request.method == 'GET':
        items = WishlistItem.objects.filter(user_id=request.user.uid).select_related('book')
        return Response(WishlistItemSerializer(items, many=True).data)

    serializer = WishlistItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user_id=request.user.uid)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_item(request, pk):
    try:
        item = WishlistItem.objects.get(pk=pk, user_id=request.user.uid)
    except WishlistItem.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
