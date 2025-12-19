import 'package:flutter/material.dart';

class OnboardingViewModel extends ChangeNotifier {
  final PageController pageController = PageController();
  int currentPage = 0;
  final int totalPages = 4;

  void onPageChanged(int index) {
    currentPage = index;
    notifyListeners();
  }

  void skip() {
    pageController.animateToPage(
      totalPages - 1,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeInOut,
    );
  }

  void next() {
    if (currentPage < totalPages - 1) {
      pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      debugPrint("🎉 Onboarding finished");
      // Navigation logic is typically handled in the View or via a Navigation Service,
      // but the trigger comes from here.
    }
  }

  @override
  void dispose() {
    pageController.dispose();
    super.dispose();
  }
}
