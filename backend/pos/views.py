from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, MenuItem, Order, OrderItem, Table
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, MenuItemSerializer, TableSerializer, OrderSerializer, CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all().order_by('table_number')
    serializer_class = TableSerializer


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    # override in built django function 
    def create(self, request, *args, **kwargs):
        table = request.data.get('table') 
        if table:
            existing_order = Order.objects.filter(table=table, status='open').first()
            if existing_order:
                serializer = self.get_serializer(existing_order)
                return Response(serializer.data, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        order = self.get_object() 
        item_id = request.data.get('item_id') 
        
        try:
            menu_item = MenuItem.objects.get(id=item_id)
        except MenuItem.DoesNotExist:
            return Response({"error": "Menu item not found"}, status=status.HTTP_404_NOT_FOUND)
        order_item, created = OrderItem.objects.get_or_create(
            order=order,
            item=menu_item,
            status='ordered',
            defaults={'quantity': 1}
        )
        
        if not created:
            order_item.quantity += 1
            order_item.save()

        serializer_instance = OrderSerializer(order)

        return Response(serializer_instance.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def decrement_item(self, request, pk=None):
        order = self.get_object()
        item_id = request.data.get('item_id')
        
        try:
            order_item = OrderItem.objects.get(order = order, item_id = item_id, status='ordered')
            if order_item.quantity > 1:
                order_item.quantity -= 1
                order_item.save()
            else:
                order_item.delete()  

        except OrderItem.DoesNotExist:
            return Response({"error": "Item not found in order"}, status=status.HTTP_404_NOT_FOUND)

        serializer_instance = OrderSerializer(order)

        return Response(serializer_instance.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        order = self.get_object()
        item_id = request.data.get('item_id')

        try:
            order_item = OrderItem.objects.get(order = order, item_id = item_id, status='ordered')
            order_item.delete()
        except OrderItem.DoesNotExist:
            return Response({"error": "Item not found in order"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer_instance = OrderSerializer(order)

        return Response(serializer_instance.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def update_item_status(self, request, pk = None):
        order = self.get_object()
        item_id = request.data.get('item_id')
        new_status = request.data.get('status') 

        valid_statuses = ['ordered', 'sent', 'cooking', 'ready', 'served']
        if new_status not in valid_statuses:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        status_map = {
            'sent': 'ordered',
            'cooking': 'sent',
            'ready': 'cooking',
            'served': 'ready'
        }
        prev_status = status_map.get(new_status)

        try:
            if prev_status:
                order_item = OrderItem.objects.get(order=order, item_id=item_id, status=prev_status)
            else:
                order_item = OrderItem.objects.get(order=order, item_id=item_id)
            
            order_item.status = new_status
            order_item.save()
        except OrderItem.DoesNotExist:
            return Response({"error": "Item not found in order"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer_instance = OrderSerializer(order)

        return Response(serializer_instance.data, status=status.HTTP_200_OK)

    # override django's inbuilt update(patch) function so it runs with every patch request
    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status in ['paid', 'voided']:
            try:
                table_obj = Table.objects.get(table_number=instance.table)
                table_obj.status = 'available'
                table_obj.save()
            except Table.DoesNotExist:
                pass
