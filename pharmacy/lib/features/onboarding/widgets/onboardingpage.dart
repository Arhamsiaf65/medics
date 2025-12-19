import 'package:flutter/material.dart';

class OnboardingPage extends StatelessWidget {
  final String imagePath;
  final String title;
  final VoidCallback onNext;
  final VoidCallback onSkip;
  final bool isLastPage;
  final int currentPageIndex;
  final int totalPages;

  const OnboardingPage({
    Key? key,
    required this.imagePath,
    required this.title,
    required this.onNext,
    required this.onSkip,
    required this.isLastPage,
    required this.currentPageIndex,
    required this.totalPages,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: TextButton(
                onPressed: onSkip,
                child: const Text(
                  "Skip",
                  style: TextStyle(color: Colors.grey, fontSize: 16),
                ),
              ),
            ),
            const Spacer(),
            Image.asset(
              imagePath,
              height: height * 0.4,
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 40),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: List.generate(
                    totalPages,
                    (index) => Container(
                      margin: const EdgeInsets.only(right: 4),
                      height: 4,
                      width: currentPageIndex == index ? 20 : 10,
                      decoration: BoxDecoration(
                        color: currentPageIndex == index
                            ? const Color(0xFF199A8E)
                            : Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: onNext,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF199A8E),
                    shape: const CircleBorder(),
                    padding: const EdgeInsets.all(16),
                  ),
                  child: const Icon(Icons.arrow_forward, color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
