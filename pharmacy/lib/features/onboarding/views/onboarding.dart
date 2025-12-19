import 'package:flutter/material.dart';
import 'package:pharmacy/features/auth/views/signup.dart';
import 'package:pharmacy/features/onboarding/widgets/onboardingpage.dart';
import 'package:pharmacy/features/auth/views/login.dart';
import 'package:provider/provider.dart';
import 'package:pharmacy/features/onboarding/viewmodels/onboarding_viewmodel.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => OnboardingViewModel(),
      child: Scaffold(
        body: Consumer<OnboardingViewModel>(
          builder: (context, viewModel, child) {
            return PageView(
              controller: viewModel.pageController,
              physics: const BouncingScrollPhysics(),
              onPageChanged: viewModel.onPageChanged,
              children: [
                // PAGE 1
                OnboardingPage(
                  imagePath: 'assets/images/onboard1.png',
                  title: 'Consult only with a doctor you trust',
                  onNext: viewModel.next,
                  onSkip: viewModel.skip,
                  isLastPage: false,
                  currentPageIndex: viewModel.currentPage,
                  totalPages: viewModel.totalPages,
                ),

                // PAGE 2
                OnboardingPage(
                  imagePath: 'assets/images/onboard2.png',
                  title: 'Book online appointments instantly',
                  onNext: viewModel.next,
                  onSkip: viewModel.skip,
                  isLastPage: false,
                  currentPageIndex: viewModel.currentPage,
                  totalPages: viewModel.totalPages,
                ),

                // PAGE 3
                OnboardingPage(
                  imagePath: 'assets/images/onboard3.png',
                  title: 'Get connected with our online consultation',
                  onNext: viewModel.next,
                  onSkip: viewModel.skip,
                  isLastPage: false,
                  currentPageIndex: viewModel.currentPage,
                  totalPages: viewModel.totalPages,
                ),

                // PAGE 4 — Custom Final Page
                _CustomFinalPage(
                  imagePath: 'assets/images/greenlogo.png',
                  title: "Let's get started!",
                  onFinish: () {
                    debugPrint("Navigating to next screen...");
                  },
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _CustomFinalPage extends StatelessWidget {
  final String imagePath;
  final String title;
  final VoidCallback onFinish;

  const _CustomFinalPage({
    Key? key,
    required this.imagePath,
    required this.title,
    required this.onFinish,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(24),
        color: Colors.teal.shade50,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
                height: 90,
                width: 80,
                child: Image.asset(imagePath, height: height * 0.45, fit: BoxFit.contain,)),
            Text("Medics", style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF199A8E,), fontSize: 25),),
            const SizedBox(height: 40),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                // color: Colors.teal,
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Text(
                "Login to enjoy the features we've provided, and stay healty",
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w400,
                  // color: Colors.teal,
                ),
              ),
            ),

            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: ()=> Navigator.pushReplacement(context, MaterialPageRoute(builder: (context)=> LoginScreen())),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                padding: const EdgeInsets.symmetric(horizontal: 80, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
              ),
              child: const Text(
                "Login",
                style: TextStyle(fontSize: 18, color: Colors.white),
              ),
            ),

            const SizedBox(height: 10),


            OutlinedButton(
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF199A8E), width: 1),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 80, vertical: 14),
              ),

              onPressed: ()=> Navigator.pushReplacement(context, MaterialPageRoute(builder: (context)=> SignUpScreen())),
              child: const Text(
                "Sign Up",
                style: TextStyle(
                  color: Color(0xFF199A8E),
                  fontSize: 18,
                  // fontWeight: FontWeight.w600,
                ),
              ),
            )

          ],
        ),
      ),
    );
  }
}

