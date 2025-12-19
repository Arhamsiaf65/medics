import 'package:flutter/material.dart';
import 'package:pharmacy/features/auth/data/models/user_model.dart';
import 'package:pharmacy/features/auth/data/repositories/auth_repository.dart';

class SignUpViewModel extends ChangeNotifier {
  final AuthRepository authrepo;

  SignUpViewModel(this.authrepo);

  bool obscurePassword = true;
  bool agreedToTerms = false;
  bool isLoading = false;
  String? errorMessage;
  UserModel? currentUser;

  void togglePasswordVisibility() {
    obscurePassword = !obscurePassword;
    notifyListeners();
  }

  void toggleTermsAgreement(bool? value) {
    agreedToTerms = value ?? false;
    notifyListeners();
  }

  Future<UserModel?> signUp({
    required String name,
    required String email,
    required String password,
  }) async {
    if (!agreedToTerms) {
      errorMessage = "Please agree to Terms & Privacy Policy";
      notifyListeners();
      return null;
    }

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      final user = await authrepo.signUp(name, email, password);
      currentUser = user;
      isLoading = false;
      notifyListeners();
      return user;
    } catch (e) {
      isLoading = false;
      errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return null;
    }
  }
}
