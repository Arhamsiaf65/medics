// lib/features/auth/data/models/user_model.dart

class UserModel {
  final String? id;
  final String name;
  final String email;
  final String? phone;
  final String? profileImage;
  final String? token;
  final String? expiresAt;

  UserModel({
    this.id,
    required this.name,
    required this.email,
    this.phone,
    this.profileImage,
    this.token,
    this.expiresAt,
  });

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id']?.toString(),
      name: map['name'] as String? ?? '',
      email: map['email'] as String? ?? '',
      phone: map['phone'] as String?,
      profileImage: map['profileImage'] as String?,
      token: map['token'] as String?,
      expiresAt: map['expiresAt'] as String?,
    );
  }

  /// Factory constructor for API response that contains nested user object
  /// Factory constructor for API response that contains nested user object
  factory UserModel.fromApiResponse(Map<String, dynamic> response) {
    // Check if the response is wrapped in a 'data' field (common in some API standards)
    Map<String, dynamic> effectiveResponse = response;
    if (response.containsKey('data') && response['data'] is Map<String, dynamic>) {
      effectiveResponse = response['data'] as Map<String, dynamic>;
    }

    final userData = effectiveResponse['user'] as Map<String, dynamic>? ?? {};
    
    // Robustly find ID: check 'id', '_id', and inside 'user' object
    final id = userData['id']?.toString() ?? 
               userData['_id']?.toString() ?? 
               effectiveResponse['id']?.toString() ??
               effectiveResponse['_id']?.toString();

    // Robustly find Token: check root 'token', 'accessToken', or inside 'user'
    final token = effectiveResponse['token'] as String? ?? 
                  effectiveResponse['accessToken'] as String? ?? 
                  userData['token'] as String?;

    return UserModel(
      id: id,
      name: userData['name'] as String? ?? '',
      email: userData['email'] as String? ?? '',
      phone: userData['phone'] as String?,
      profileImage: userData['avatarUrl'] as String? ?? userData['profileImage'] as String?, // Added avatarUrl support
      token: token,
      expiresAt: effectiveResponse['expiresAt'] as String?,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'profileImage': profileImage,
      'token': token,
      'expiresAt': expiresAt,
    };
  }

  /// Returns a copy of this UserModel with updated fields
  UserModel copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? profileImage,
    String? token,
    String? expiresAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      profileImage: profileImage ?? this.profileImage,
      token: token ?? this.token,
      expiresAt: expiresAt ?? this.expiresAt,
    );
  }

  /// Check if the token is still valid
  bool get isTokenValid {
    // If we have a token but no expiry, assume it's valid indefinitely (persistent session)
    if (token != null && expiresAt == null) return true;
    
    if (token == null || expiresAt == null) return false;
    try {
      final expiry = DateTime.parse(expiresAt!);
      return DateTime.now().isBefore(expiry);
    } catch (_) {
      return false;
    }
  }
}
