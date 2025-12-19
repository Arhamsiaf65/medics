import 'package:pharmacy/features/auth/data/models/user_model.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DBHelper {
  static Database? _db;

  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDB();
    return _db!;
  }

  Future<Database> _initDB() async {
    String path = join(await getDatabasesPath(), 'user_database.db');
    return await openDatabase(
      path,
      version: 2, // Incremented version for schema update
      onCreate: _createDB,
      onUpgrade: _upgradeDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE users(
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        profileImage TEXT,
        token TEXT,
        expiresAt TEXT
      )
    ''');
  }

  Future<void> _upgradeDB(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Add new columns for version 2
      await db.execute('ALTER TABLE users ADD COLUMN phone TEXT');
      await db.execute('ALTER TABLE users ADD COLUMN profileImage TEXT');
      await db.execute('ALTER TABLE users ADD COLUMN token TEXT');
      await db.execute('ALTER TABLE users ADD COLUMN expiresAt TEXT');
    }
  }

  Future<int> insertUser(UserModel user) async {
    final db = await database;
    print(user.name);
    print( user.email);
    print(user.phone);
    return await db.insert('users', user.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<Map<String, dynamic>?> getUser(String email) async {
    final db = await database;
    final result = await db.query(
      'users',
      where: 'email = ?',
      whereArgs: [email],
    );

    if (result.isNotEmpty) {
      return result.first;
    }
    return null;
  }

  Future<Map<String, dynamic>?> getUserById(String id) async {
    final db = await database;
    final result = await db.query(
      'users',
      where: 'id = ?',
      whereArgs: [id],
    );

    if (result.isNotEmpty) {
      return result.first;
    }
    return null;
  }

  Future<Map<String, dynamic>?> getFirstUser() async {
    final db = await database;
    final result = await db.query('users', limit: 1);

    if (result.isEmpty) return null;
    return result.first;
  }

  Future<bool> emailExists(String email) async {
    final db = await database;
    final result = await db.query('users', where: 'email = ?', whereArgs: [email]);
    return result.isNotEmpty;
  }

  /// Checks if any user is currently stored in the database and has a valid token
  /// Checks if any user is currently stored in the database
  Future<bool> isUserLoggedIn() async {
    final db = await database;
    try {
      final result = await db.query('users');
      print("DB Check Result: $result");

      if (result.isEmpty) {
        print("DB Check: No users found.");
        return false;
      }

      final user = result.first;
      final token = user['token'] as String?;
      
      // Basic validation: must have a token
      if (token != null && token.isNotEmpty) {
         print("DB Check: User found with valid token. loggedIn=true");
         return true;
      }
      
      print("DB Check: User found but token is empty/null. DELETING invalid record.");
      await db.delete('users'); // Auto-heal: remove the bad record
      return false;

    } catch (e) {
      print("DB Check Error: $e");
      return false;
    }
  }

  /// Deletes all users from the database
  Future<void> clearUsers() async {
    final db = await database;
    await db.delete('users');
  }

  /// Update user token
  Future<int> updateUserToken(String email, String token, String expiresAt) async {
    final db = await database;
    return await db.update(
      'users',
      {'token': token, 'expiresAt': expiresAt},
      where: 'email = ?',
      whereArgs: [email],
    );
  }
}
