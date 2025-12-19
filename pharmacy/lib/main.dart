import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:pharmacy/features/articles/data/article_repository/article_repository.dart';
import 'package:pharmacy/features/auth/viewmodels/login_viewmodel.dart';
import 'package:pharmacy/features/auth/viewmodels/signup_viewmodel.dart';
import 'package:pharmacy/features/doctor/data/doctor_repository/doctors_repository.dart';
import 'package:pharmacy/features/onboarding/viewmodels/onboarding_viewmodel.dart';
import 'package:pharmacy/features/pharmacy/viewmodels/cart_viewmodel.dart';
import 'package:pharmacy/features/pharmacy/viewmodels/pharmacy_viewmodel.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';

import 'features/articles/viewmodels/article_viewmodel.dart';
import 'features/auth/data/repositories/auth_repository.dart';
import 'database/dbhelper.dart';
import 'features/doctor/viewmodels/doctors_viewmodel.dart';
import 'firebase_options.dart';

import 'routes.dart';
import 'features/ai_chat/services/ai_service.dart';
import 'features/ai_chat/viewmodels/ai_chat_viewmodel.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  final firebaseAuth = FirebaseAuth.instance;
  final dbHelper = DBHelper();

  runApp(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => CartViewModel()),
          ChangeNotifierProvider(create: (_) => PharmacyViewModel()),

          Provider<DoctorsRepository>(
            create: (_) => DoctorsRepository(),
          ),

          ChangeNotifierProvider<DoctorsViewModel>(
            create: (context) => DoctorsViewModel(
              context.read<DoctorsRepository>(),
            ),
          ),


          Provider<HealthArticle_Repository>(
            create: (_) => HealthArticle_Repository(),
          ),

          ChangeNotifierProvider<ArcticleViewModel>(
            create: (context) => ArcticleViewModel(
              context.read<HealthArticle_Repository>(),
            ),
          ),


          Provider<AuthRepository>(
            create: (_) => AuthRepository(firebaseAuth, dbHelper),
          ),

          ChangeNotifierProvider<LoginViewModel>(
            create: (context) =>
                LoginViewModel(context.read<AuthRepository>()),
          ),

          ChangeNotifierProvider(
            create: (context) =>
                SignUpViewModel(context.read<AuthRepository>()),
          ),

          ChangeNotifierProvider(create: (_) => OnboardingViewModel()),

          Provider<AIService>(
            create: (context) => AIService(context.read<AuthRepository>()),
          ),
          ChangeNotifierProvider(
             create: (context) => AIChatViewModel(context.read<AIService>()),
          ),
        ],
        child: const MyApp(),
      )
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pharmacy App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.white,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF199A8E),
        ),
        useMaterial3: true,
      ),
      initialRoute: Routes.authCheck,
      onGenerateRoute: Routes.generateRoute,
    );
  }
}
