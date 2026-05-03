from django.urls import path
from . import views

urlpatterns = [
    path('textbooks/', views.textbook_list),
    path('textbooks/<int:pk>/', views.textbook_detail),
    path('listings/', views.listing_list),
    path('listings/<int:pk>/', views.listing_detail),
    path('wishlist/', views.wishlist),
    path('wishlist/<int:pk>/', views.wishlist_item),
    path('groceries/search/', views.grocery_search),
    path('groceries/stores/', views.nearby_stores),
]
