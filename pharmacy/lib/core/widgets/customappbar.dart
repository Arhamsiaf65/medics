import 'package:flutter/material.dart';

class CustomAppbar extends StatelessWidget implements PreferredSizeWidget {
  final IconData? leading;
  final String text;
  final IconData? trailing;
  final VoidCallback? trailingCallBack;
  final VoidCallback? leadingCallBack;

  const CustomAppbar({
    Key? key,
    this.leading,
    required this.text,
    this.trailing,
    this.trailingCallBack,
    this.leadingCallBack,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      leading: leading != null
          ? IconButton(
              icon: Icon(leading, color: Colors.black),
              onPressed: leadingCallBack ?? () => Navigator.pop(context),
            )
          : null,
      title: Text(
        text,
        style: const TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.bold,
          fontSize: 18,
        ),
      ),
      actions: [
        if (trailing != null)
          IconButton(
            icon: Icon(trailing, color: Colors.black),
            onPressed: trailingCallBack,
          ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
