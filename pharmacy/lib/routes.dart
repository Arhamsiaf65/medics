import 'package:flutter/material.dart';
import 'package:pharmacy/features/articles/views/articles.dart';
import 'features/auth/views/auth_check_screen.dart';
import 'features/auth/views/login.dart';
import 'features/auth/views/signup.dart';
import 'features/pharmacy/views/pharmacy.dart';
import 'features/pharmacy/views/cartpage.dart';
import 'features/pharmacy/views/drugdetail.dart';
import 'features/doctor/views/doctor_detail_screen.dart';
import 'features/doctor/views/doctors_screen.dart';
import 'features/doctor/views/top_doctor_screen.dart';
import 'features/doctor/views/appointment_screen.dart';
import 'features/doctor/views/chat_screen.dart';
import 'features/doctor/views/call_screen.dart';
import 'features/doctor/views/call_page.dart';
import 'features/ai_chat/screens/ai_chat_screen.dart'; // New Import
import 'features/home/views/home_screen.dart';
import 'features/search/views/search_screen.dart';
// import 'features/profile/views/profile_screen.dart';
import 'features/home/views/main_screen.dart';
import 'features/onboarding/views/splashscreen.dart';
import 'features/onboarding/views/onboarding.dart';
import 'features/pharmacy/data/models/drugmodel.dart';
import 'features/doctor/data/models/doctor_model.dart';
import 'features/profile/views/profile_screen.dart';
import 'features/notifications/screens/notification_list_screen.dart';
// import 'features/profile/views/profile_screen.dart';

class Routes {
  static const String authCheck = '/';
  static const String splash = '/splash';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String main = '/main';
  static const String home = '/home';
  static const String pharmacy = '/pharmacy';
  static const String cart = '/cart';
  static const String drugDetail = '/drugDetail';
  static const String doctors = '/doctors';
  static const String doctorDetail = '/doctorDetail';
  static const String topDoctors = '/topDoctors';
  static const String appointment = '/appointment';
  static const String chat = '/chat';
  static const String call = '/call';
  static const String callPage = '/callPage';
  static const String articles = '/articles';
  static const String profile = '/profile';
  static const String aiChat = '/aiChat';
  static const String search = '/search';
  static const String notifications = '/notifications';


  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {

      case authCheck:
        return MaterialPageRoute(builder: (_) => const AuthCheckScreen());
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      case onboarding:
        return MaterialPageRoute(builder: (_) => const OnboardingScreen());
      case login:
        return MaterialPageRoute(builder: (_) => const LoginScreen());
      case signup:
        return MaterialPageRoute(builder: (_) => const SignUpScreen());
      case main:
        return MaterialPageRoute(builder: (_) => const MainScreen());
      case home:
        return MaterialPageRoute(builder: (_) =>  HomeScreen());
      case pharmacy:
        return MaterialPageRoute(builder: (_) => const PharmacyPage());
      case cart:
        return MaterialPageRoute(builder: (_) => const CartPage());

      case drugDetail:
        final drug = settings.arguments as Drug;
        return MaterialPageRoute(builder: (_) => DrugDetail(drug: drug));

      case doctors:
        return MaterialPageRoute(builder: (_) => const DoctorsScreen());

      case doctorDetail:
        final doctor = settings.arguments as Doctor;
        return MaterialPageRoute(builder: (_) => DoctorDetailScreen(doctor: doctor));

      case topDoctors:
        return MaterialPageRoute(builder: (_) =>  TopDoctorScreen());

      case appointment:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => AppointmentScreen(
            doctor: args['doctor'] as Doctor,
            selectedDate: args['selectedDate'] as String? ?? 'Not selected',
            selectedTime: args['selectedTime'] as String? ?? 'Not selected',
            paymentDetails: args['paymentDetails'] as Map<String, double>? ?? {'Consultation': 60.0, 'Admin Fee': 1.0},
            totalPayment: args['totalPayment'] as double? ?? 61.0,
            reason: args['reason'] as String? ?? 'General Consultation',
          ),
        );

      case chat:
        final doctor = settings.arguments as Doctor;
        return MaterialPageRoute(builder: (_) => ChatScreen(doctor: doctor));

      case call:
        final doctor = settings.arguments as Doctor;
        return MaterialPageRoute(builder: (_) => CallScreen(doctor: doctor));

      case callPage:
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => CallPage(
            doctor: args['doctor'] as Doctor,
            isVideoCall: args['isVideoCall'] as bool? ?? false,
            userImageUrl: args['userImageUrl'] as String?,
          ),
        );

       case articles:
        // final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(builder: (_) => ArticlesPage());

      case profile:
        return MaterialPageRoute(builder: (_) => const ProfileScreen());

      case aiChat:
        return MaterialPageRoute(builder: (_) => const AIChatScreen());

      case search:
        return MaterialPageRoute(builder: (_) => const SearchScreen());

      case notifications:
        final userId = settings.arguments as String;
        return MaterialPageRoute(builder: (_) => NotificationListScreen(userId: userId));

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('No route defined for ${settings.name}')),
          ),
        );
    }
  }
}
