import 'package:flutter/material.dart';
import 'package:pharmacy/features/pharmacy/data/models/drugmodel.dart';

class PharmacyViewModel extends ChangeNotifier {
  int _selectedIndex = 0;
  int get selectedIndex => _selectedIndex;

  final List<Drug> drugs = [
    Drug(
      imgUrl: "assets/images/p1.png",
      name: "febrol",
      items: "20pcs",
      rating: 4.5,
      desc: "febrol provides fast and effective relief from headache, fever, and pain.",
      actualPrice: 15,
    ),
    Drug(
      imgUrl: "assets/images/p2.png",
      name: "Brufen",
      items: "10pcs",
      rating: 4.2,
      desc: "Brufen helps reduce inflammation and pain, suitable for arthritis and muscle aches.",
      actualPrice: 18,
    ),
    Drug(
      imgUrl: "assets/images/p3.png",
      name: "Augmentin",
      items: "10pcs",
      rating: 4.8,
      desc: "Antibiotic used to treat bacterial infections such as sinusitis, pneumonia, and ear infections.",
      actualPrice: 25,
    ),
    Drug(
      imgUrl: "assets/images/febrol.png",
      name: "Flagyl",
      items: "20pcs",
      rating: 4.3,
      desc: "Flagyl is an antibiotic effective against certain bacterial and parasitic infections.",
      actualPrice: 20,
    ),
    Drug(
      imgUrl: "assets/images/febrol.png",
      name: "Calpol Syrup",
      items: "50ml",
      rating: 4.6,
      desc: "Paracetamol syrup used to relieve fever and mild pain in children.",
      actualPrice: 10,
    ),
    Drug(
      imgUrl: "assets/images/febrol.png",
      name: "Disprin",
      items: "10pcs",
      rating: 4.0,
      desc: "Aspirin-based tablet for quick relief from headache and cold symptoms.",
      actualPrice: 12,
    ),
    Drug(
      imgUrl: "assets/images/febrol.png",
      name: "Ceporex",
      items: "10pcs",
      rating: 4.4,
      desc: "Antibiotic used to treat respiratory and urinary tract infections.",
      actualPrice: 22,
    ),
  ];

  final List<Drug> drugsOnSale = [
    Drug(
      imgUrl: "assets/images/febrol.png",
      name: "febrol",
      items: "20pcs",
      rating: 4.5,
      desc: "febrol provides fast and effective relief from headache, fever, and pain.",
      actualPrice: 15,
      saleprice: 10,
    ),
    Drug(
      imgUrl: "assets/images/p3.png",
      name: "Brufen",
      items: "10pcs",
      rating: 4.2,
      desc: "Brufen helps reduce inflammation and pain, suitable for arthritis and muscle aches.",
      actualPrice: 18,
      saleprice: 10,
    ),
    Drug(
      imgUrl: "assets/images/p2.png",
      name: "Augmentin",
      items: "10pcs",
      rating: 4.8,
      desc: "Antibiotic used to treat bacterial infections such as sinusitis, pneumonia, and ear infections.",
      actualPrice: 25,
      saleprice: 10,
    ),
    Drug(
      imgUrl: "assets/images/p1.png",
      name: "Flagyl",
      items: "20pcs",
      rating: 4.3,
      desc: "Flagyl is an antibiotic effective against certain bacterial and parasitic infections.",
      actualPrice: 20,
      saleprice: 10,
    ),
    Drug(
      imgUrl: "assets/images/febrol.png",
      name: "Calpol Syrup",
      items: "50ml",
      rating: 4.6,
      desc: "Paracetamol syrup used to relieve fever and mild pain in children.",
      actualPrice: 10,
      saleprice: 5,
    ),
    Drug(
      imgUrl: "assets/images/febrol.png",
      name: "Disprin",
      items: "10pcs",
      rating: 4.0,
      desc: "Aspirin-based tablet for quick relief from headache and cold symptoms.",
      actualPrice: 12,
      saleprice: 10,
    ),
    Drug(
      imgUrl: "assets/images/febrol.png",
      name: "Ceporex",
      items: "10pcs",
      rating: 4.4,
      desc: "Antibiotic used to treat respiratory and urinary tract infections.",
      actualPrice: 22,
      saleprice: 10,
    ),
  ];

  void setSelectedIndex(int index) {
    _selectedIndex = index;
    notifyListeners();
  }
}
