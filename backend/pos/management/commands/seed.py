from django.core.management.base import BaseCommand
from pos.models import User, Table, MenuItem

class Command(BaseCommand):
    help = 'Seeds default users, tables, and menu items into the database'

    def handle(self, *args, **kwargs):
        # 1. Create Default Users (Password is the PIN)
        users_data = [
            {"username": "ethanm", "pin": "1234", "role": "Manager", "first_name": "Ethan"},
            {"username": "sarahw", "pin": "5678", "role": "Waiter", "first_name": "Sarah"},
            {"username": "charlesc", "pin": "4321", "role": "Chef", "first_name": "Charles"},
        ]

        for u in users_data:
            if not User.objects.filter(username=u["username"]).exists():
                User.objects.create_user(
                    username=u["username"],
                    password=u["pin"],
                    role=u["role"],
                    first_name=u["first_name"]
                )
                self.stdout.write(self.style.SUCCESS(f'Created user {u["username"]} ({u["role"]})'))
            else:
                self.stdout.write(f'User {u["username"]} already exists')

        # 2. Create Tables (T1 to T12)
        for i in range(1, 13):
            table, created = Table.objects.get_or_create(
                table_number=i,
                defaults={"seats": 4, "status": "available"}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Table {i}'))

        # 3. Create Menu Items (Extensive Premium Indian Menu)
        menu_items = [
            # === Mains ===
            {"name": "Butter Chicken", "price": 350.00, "category": "Mains"},
            {"name": "Chicken Tikka Masala", "price": 360.00, "category": "Mains"},
            {"name": "Lamb Rogan Josh", "price": 420.00, "category": "Mains"},
            {"name": "Paneer Tikka Masala", "price": 290.00, "category": "Mains"},
            {"name": "Palak Paneer", "price": 280.00, "category": "Mains"},
            {"name": "Dal Makhani", "price": 240.00, "category": "Mains"},
            {"name": "Chole Bhature", "price": 180.00, "category": "Mains"},
            {"name": "Chicken Biryani", "price": 320.00, "category": "Mains"},
            {"name": "Vegetable Biryani", "price": 260.00, "category": "Mains"},
            {"name": "Masala Dosa", "price": 120.00, "category": "Mains"},
            {"name": "Aloo Gobi", "price": 190.00, "category": "Mains"},

            # === Sides ===
            {"name": "Tandoori Roti", "price": 30.00, "category": "Sides"},
            {"name": "Butter Naan", "price": 50.00, "category": "Sides"},
            {"name": "Garlic Naan", "price": 60.00, "category": "Sides"},
            {"name": "Cheese Naan", "price": 80.00, "category": "Sides"},
            {"name": "Basmati Rice", "price": 100.00, "category": "Sides"},
            {"name": "Jeera Rice", "price": 120.00, "category": "Sides"},
            {"name": "Mix Veg Raita", "price": 70.00, "category": "Sides"},
            {"name": "Masala Papad (2 pcs)", "price": 40.00, "category": "Sides"},

            # === Drinks ===
            {"name": "Mango Lassi", "price": 80.00, "category": "Drinks"},
            {"name": "Sweet Lassi", "price": 70.00, "category": "Drinks"},
            {"name": "Masala Chai", "price": 40.00, "category": "Drinks"},
            {"name": "Filter Coffee", "price": 50.00, "category": "Drinks"},
            {"name": "Fresh Lime Soda", "price": 60.00, "category": "Drinks"},
            {"name": "Jaljeera", "price": 50.00, "category": "Drinks"},
            {"name": "Spiced Buttermilk (Chaas)", "price": 40.00, "category": "Drinks"},

            # === Desserts ===
            {"name": "Gulab Jamun (2 pcs)", "price": 90.00, "category": "Desserts"},
            {"name": "Rasmalai (2 pcs)", "price": 120.00, "category": "Desserts"},
            {"name": "Kesar Kulfi", "price": 100.00, "category": "Desserts"},
            {"name": "Gajar Ka Halwa", "price": 110.00, "category": "Desserts"},
            {"name": "Warm Jalebi with Rabri", "price": 130.00, "category": "Desserts"},
        ]

        for item in menu_items:
            menu_item, created = MenuItem.objects.get_or_create(
                name=item["name"],
                defaults={"price": item["price"], "category": item["category"]}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created Menu Item: {item["name"]}'))
            else:
                # Update price/category if already exists to ensure changes apply
                menu_item.price = item["price"]
                menu_item.category = item["category"]
                menu_item.save()
