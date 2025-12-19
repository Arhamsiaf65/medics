import 'package:flutter/material.dart';
import 'package:pharmacy/features/pharmacy/data/models/drugmodel.dart';

class CartViewModel extends ChangeNotifier {
  // key = drug id or name, value = map with quantity and price
  final Map<String, Map<String, dynamic>> _cartItems = {};

  Map<String, Map<String, dynamic>> get cartItems => _cartItems;

  void addToCart(Drug drug, int quantity) {
    if (_cartItems.containsKey(drug.name)) {
      _cartItems[drug.name]!['quantity'] += quantity;
    } else {
      _cartItems[drug.name] = {
        'drug': drug,
        'quantity': quantity,
      };
    }
    notifyListeners();
  }

  void removeFromCart(String drugName) {
    _cartItems.remove(drugName);
    notifyListeners();
  }

  void clearCart() {
    _cartItems.clear();
    notifyListeners();
  }

  double get totalPrice {
    double total = 0;
    _cartItems.forEach((key, item) {
      final drug = item['drug'] as Drug;
      final quantity = item['quantity'] as int;
      total += (drug.actualPrice ?? 0) * quantity;
    });
    return total;
  }

  int get totalItems => _cartItems.length;
}
