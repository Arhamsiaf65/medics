import 'package:flutter/material.dart';
import 'package:pharmacy/features/onboarding/views/onboarding.dart';
import 'package:provider/provider.dart';
import 'package:pharmacy/features/onboarding/viewmodels/splash_viewmodel.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => SplashViewModel(),
      child: _SplashScreenContent(),
    );
  }
}

class _SplashScreenContent extends StatefulWidget {
  @override
  State<_SplashScreenContent> createState() => _SplashScreenContentState();
}

class _SplashScreenContentState extends State<_SplashScreenContent> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final viewModel = Provider.of<SplashViewModel>(context, listen: false);
      viewModel.init(() {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const OnboardingScreen()),
        );
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF199A8E),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              child: Image.asset("assets/images/logo.png")
            ),
            const Text("Medics", style: TextStyle(fontSize: 50, fontWeight: FontWeight.w700, color: Colors.white),)
          ],
        ),
      ),
    );
  }
}