class Drug {
  final String imgUrl;
  final String name;
  final String items;
  final double? rating;
  final String desc;
  final int? saleprice; // Only saleprice can be null
  final int actualPrice; // <--- **MUST BE NON-NULLABLE**

  Drug({
    required this.desc,
    required this.imgUrl,
    required this.name,
    this.saleprice,
    required this.items,
    this.rating,
    required this.actualPrice, // Now required in the constructor and guaranteed to be non-null
  });
}