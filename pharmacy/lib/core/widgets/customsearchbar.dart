import 'package:flutter/material.dart';
import 'package:iconly/iconly.dart';

class CustomSearchBar extends StatelessWidget {
  final String hintText;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final bool readOnly;
  final VoidCallback? onTap;
  final bool autofocus;

  const CustomSearchBar({
    Key? key,
    required this.hintText,
    this.controller,
    this.onChanged,
    this.readOnly = false,
    this.onTap,
    this.autofocus = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFBFBFB),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE8F3F1)),
      ),
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        readOnly: readOnly,
        onTap: onTap,
        autofocus: autofocus,
        decoration: InputDecoration(
          prefixIcon: const Icon(IconlyLight.search, color: Colors.grey),
          hintText: hintText,
          hintStyle: const TextStyle(color: Colors.grey),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
        ),
      ),
    );
  }
}
