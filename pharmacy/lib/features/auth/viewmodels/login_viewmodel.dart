import 'package:flutter/cupertino.dart';

import '../data/models/user_model.dart';
import '../data/repositories/auth_repository.dart';

class LoginViewModel extends ChangeNotifier {
  final AuthRepository _repo;

  LoginViewModel(this._repo);

  bool obscurePassword = true;
  bool isLoading = false;
  String? errorMessage;
  UserModel? currentUser;

  void togglePasswordVisibility() {
    obscurePassword = !obscurePassword;
    notifyListeners();
  }

  Future<UserModel?> login(String email, String password) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      final user = await _repo.login(email, password);
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

  Future<bool> checkLoginStatus() async {
    try {
      final user = await _repo.retrieveLocalUser();
      if (user != null) {
        currentUser = user;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _repo.logout();
      currentUser = null;
      notifyListeners();
    } catch (e) {
      errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
    }
  }
}
