from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Manager', 'Manager'),
        ('Waiter', 'Waiter'),
        ('Chef', 'Chef'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Waiter')
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class MenuItem(models.Model):
    CATEGORY_CHOICES = (
        ('Mains', 'Mains'),
        ('Sides', 'Sides'),
        ('Drinks', 'Drinks'),
        ('Desserts', 'Desserts'),
    )
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)

    def __str__(self):
        return f"{self.name} - ₹{self.price}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('paid', 'Paid'),
        ('voided', 'Voided'),
    )
    table = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Table T{self.table} - Order #{self.id} ({self.status})"

class Table(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('reserved', 'Reserved'),
    )
    table_number = models.IntegerField(unique=True)
    seats = models.IntegerField(default=4)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    def __str__(self):
        return f"Table {self.table_number} ({self.seats} seats) - {self.status}"


class OrderItem(models.Model):
    STATUS_CHOICES = (
        ('ordered', 'Ordered'),
        ('sent', 'Sent to Kitchen'),
        ('cooking', 'Cooking'),
        ('ready', 'Ready'),
        ('served', 'Served')
    )
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ordered')

    def __str__(self):
        return f"{self.quantity}x {self.item.name} for Table T{self.order.table} ({self.status})"
