from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Textbook, SaleListing, WishlistItem
from .serializers import TextbookSerializer, SaleListingSerializer, WishlistItemSerializer
import base64, time, requests
from django.conf import settings


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



_kroger_token_cache: dict = {}

def _get_kroger_token():
    now = time.time()
    if _kroger_token_cache.get('expires_at', 0) > now + 60:
        return _kroger_token_cache['access_token']
    credentials = f"{settings.KROGER_CLIENT_ID}:{settings.KROGER_CLIENT_SECRET}"
    encoded = base64.b64encode(credentials.encode()).decode()
    resp = requests.post(
        'https://api.kroger.com/v1/connect/oauth2/token',
        headers={'Authorization': f'Basic {encoded}', 'Content-Type': 'application/x-www-form-urlencoded'},
        data={'grant_type': 'client_credentials', 'scope': 'product.compact'},
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    _kroger_token_cache['access_token'] = data['access_token']
    _kroger_token_cache['expires_at'] = now + data.get('expires_in', 1800)
    return _kroger_token_cache['access_token']


@api_view(['GET'])
@permission_classes([AllowAny])
def grocery_search(request):
    query = request.query_params.get('q', '').strip()
    location_id = request.query_params.get('location_id')
    if not query:
        return Response({'error': 'q is required'}, status=400)
    try:
        token = _get_kroger_token()
        params = {'filter.term': query, 'filter.limit': 20}
        if location_id:
            params['filter.locationId'] = location_id
        resp = requests.get(
            'https://api.kroger.com/v1/products',
            headers={'Authorization': f'Bearer {token}', 'Accept': 'application/json'},
            params=params, timeout=10,
        )
        resp.raise_for_status()
        results = []
        for item in resp.json().get('data', []):
            price_info = {}
            if item.get('items'):
                first = item['items'][0]
                price_info = {
                    'regular_price': first.get('price', {}).get('regular'),
                    'promo_price': first.get('price', {}).get('promo'),
                    'size': first.get('size'),
                }
            results.append({
                'product_id': item.get('productId'),
                'name': item.get('description'),
                'brand': item.get('brand'),
                'category': (item.get('categories') or [''])[0],
                'image_url': ((item.get('images') or [{}])[0].get('sizes') or [{}])[-1].get('url'),
                **price_info,
            })
        return Response({'results': results})
    except Exception as e:
        return Response({'error': str(e)}, status=502)


@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_stores(request):
    try:
        lat = float(request.query_params['lat'])
        lng = float(request.query_params['lng'])
    except (KeyError, ValueError):
        return Response({'error': 'lat and lng are required'}, status=400)
    try:
        token = _get_kroger_token()
        resp = requests.get(
            'https://api.kroger.com/v1/locations',
            headers={'Authorization': f'Bearer {token}', 'Accept': 'application/json'},
            params={'filter.latLong.near': f'{lat},{lng}', 'filter.radiusInMiles': 10, 'filter.limit': 5},
            timeout=10,
        )
        resp.raise_for_status()
        return Response({'stores': [{
            'location_id': s.get('locationId'),
            'name': s.get('name'),
            'address': s.get('address', {}).get('addressLine1'),
            'city': s.get('address', {}).get('city'),
            'distance': s.get('geolocation', {}).get('distanceInMiles'),
        } for s in resp.json().get('data', [])]})
    except Exception as e:
        return Response({'error': str(e)}, status=502)
