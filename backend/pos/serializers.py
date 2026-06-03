from rest_framework import serializers
from .models import User, MenuItem, Order, OrderItem, Table
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'price', 'category']

class TableSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Table
        fields = ["id", "table_number", "seats", "status"]

class OrderItemSerializer(serializers.ModelSerializer):
    item = MenuItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), 
        source='item', 
        write_only=True
    )

    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'item_id', 'quantity', 'status']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'table', 'status', 'items', 'created_at']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # adding custom data INSIDE the token payload (claims)
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['name'] = user.first_name
        return token
    #  adding custom data in the JSON RESPONSE beside the token
    def validate(self, attrs):
        # super().validate(attrs) runs the default password check and generates the tokens
        data = super().validate(attrs)
        
        # append our custom fields into the response dictionary
        data['role'] = self.user.role
        data['name'] = self.user.first_name
        return data
