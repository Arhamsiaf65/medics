import 'package:flutter/material.dart';

class DrugDetailViewModel extends ChangeNotifier {
  int quantity = 1;
  bool isExpanded = false;

  void incrementQuantity() {
    quantity++;
    notifyListeners();
  }

  void decrementQuantity() {
    if (quantity > 1) {
      quantity--;
      notifyListeners();
    }
  }

  void toggleDescription() {
    isExpanded = !isExpanded;
    notifyListeners();
  }
  
  double calculateTotalPrice(int? price) {
    return (price ?? 0) * quantity.toDouble();
  }
}
