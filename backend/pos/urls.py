from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MenuItemViewSet, OrderViewSet, UserViewSet, CustomTokenObtainPairView, TableViewSet

router = DefaultRouter()

router.register(r'users', UserViewSet, basename='user')
router.register(r'menu', MenuItemViewSet, basename='menu')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'tables', TableViewSet, basename='table')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name = 'token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name = 'token_refresh')
]
