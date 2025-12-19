import 'package:firebase_auth/firebase_auth.dart';
import 'package:pharmacy/features/auth/data/models/user_model.dart';
import 'package:pharmacy/database/dbhelper.dart';
import 'package:pharmacy/services/services/api_service.dart';

class AuthRepository {
  final FirebaseAuth _auth;
  final DBHelper _db;

  AuthRepository(this._auth, this._db);

  /// Login with email and password
  /// Returns UserModel on success, throws exception on failure
  Future<UserModel> login(String email, String password) async {
    try {
      // Authenticate with Firebase
      print("atempt to login");
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user == null) {
        throw Exception('Login failed: No user returned from Firebase');
      }

      // Call backend API to get user data and token
      final response = await ApiService.post('auth/login', {
        'email': email,
        'password': password,
      });

      print("DEBUG: Raw Login API Response: $response");

      // Parse the API response
      final userModel = UserModel.fromApiResponse(response);
      print("Login Parsed User: ${userModel.toMap()}"); // Debug log

      if (userModel.id == null || userModel.token == null) {
         throw Exception('Critical Error: Failed to parse User ID or Token from API. ID: ${userModel.id}, Token: ${userModel.token}');
      }

      // Save user data locally
      await _db.insertUser(userModel);


      return userModel;
    } on FirebaseAuthException catch (e) {
      throw Exception('Login failed: ${e.message}');
    } catch (e) {
      print("Login Error: $e");
      throw Exception('Login failed: $e');
    }
  }

  /// Sign up with name, email, and password
  /// Returns UserModel on success, throws exception on failure
  Future<UserModel> signUp(String name, String email, String password) async {
    try {
      // Create user in Firebase
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );


      if (credential.user == null) {
        throw Exception('Sign up failed: No user returned from Firebase');
      }

      // Register with backend API
      final response = await ApiService.post('auth/register', {
        'name': name,
        'email': email,
        'password': password,
      });

      print("signup response, $response");
      // Parse the API response
      final userModel = UserModel.fromApiResponse(response);
      print("user model, $userModel");

      if (userModel.id == null || userModel.token == null) {
         throw Exception('Critical Error: Failed to parse User ID or Token from API validation. ID: ${userModel.id}, Token: ${userModel.token}');
      }

      // Save user data locally

      return userModel;
    } on FirebaseAuthException catch (e) {
      // If Firebase signup fails, rethrow with message
      throw Exception('Sign up failed: ${e.message}');
    } catch (e) {
      throw Exception('Sign up failed: $e');
    }
  }

  /// Logout the current user
  Future<void> logout() async {
    try {
      // Get current user token for backend logout
      final currentUser = await getCurrentUser();

      if (currentUser?.token != null) {
        // Call backend logout endpoint
        await ApiService.post('auth/logout', {
          'token': currentUser!.token,
        });
      }

      // Sign out from Firebase
      await _auth.signOut();

      // Clear local user data
      await _db.clearUsers();
    } catch (e) {
      // Still clear local data even if API call fails
      await _db.clearUsers();
      throw Exception('Logout failed: $e');
    }
  }

  /// Get current logged-in user from local database
  Future<UserModel?> getCurrentUser() async {
    try {
      final firebaseUser = _auth.currentUser;
      if (firebaseUser == null) return null;

      final userData = await _db.getUser(firebaseUser.email ?? '');
      if (userData != null) {
        return UserModel.fromMap(userData);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Retrieve user directly from local storage for offline/initial check
  Future<UserModel?> retrieveLocalUser() async {
    try {
      // 1. Check if we have any user stored
      final isUserStored = await _db.isUserLoggedIn();
      if (!isUserStored) return null;
      print("clearing useres");
      // 2. Get the first user (assuming single user session for mobile)
      // await _db.clearUsers();
      final userData = await _db.getFirstUser();
      if (userData != null) {
        final user = UserModel.fromMap(userData);

        // 3. Extra validation: check if token is valid
        if (user.isTokenValid) {
           return user;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    final user = await getCurrentUser();
    return user != null && user.isTokenValid;
  }

  /// Update user profile
  Future<UserModel> updateProfile({
    String? name,
    String? phone,
    String? profileImage,
  }) async {
    try {
      final currentUser = await getCurrentUser();
      if (currentUser == null) {
        throw Exception('No user logged in');
      }

      final response = await ApiService.put('auth/profile', {
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
        if (profileImage != null) 'profileImage': profileImage,
      });

      // Parse updated user data
      final updatedUser = UserModel.fromApiResponse(response);

      // Update local database
      await _db.insertUser(updatedUser);

      return updatedUser;
    } catch (e) {
      throw Exception('Profile update failed: $e');
    }
  }

  /// Refresh token if expired or about to expire
  Future<UserModel?> refreshToken() async {
    try {
      final currentUser = await getCurrentUser();
      if (currentUser?.token == null) return null;

      final response = await ApiService.post('auth/refresh', {
        'token': currentUser!.token,
      });

      final refreshedUser = UserModel.fromApiResponse(response);
      await _db.insertUser(refreshedUser);

      return refreshedUser;
    } catch (e) {
      return null;
    }
  }
}
