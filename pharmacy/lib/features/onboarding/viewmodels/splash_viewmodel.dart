import 'package:flutter/material.dart';

class SplashViewModel extends ChangeNotifier {
  
  Future<void> init(VoidCallback onComplete) async {
    await Future.delayed(const Duration(seconds: 2));
    onComplete();
  }
}
