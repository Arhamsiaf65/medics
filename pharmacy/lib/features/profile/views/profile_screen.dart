import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pharmacy/features/auth/viewmodels/login_viewmodel.dart';
import 'package:pharmacy/features/auth/views/login.dart';
import 'package:iconly/iconly.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<LoginViewModel>(context);
    final user = viewModel.currentUser;

    if (user == null) {
      return const Scaffold(body: Center(child: Text("No user logged in")));
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: const Color(0xFF199A8E), // Primary Teal
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header Section
            Container(
              padding: const EdgeInsets.only(bottom: 30),
              decoration: const BoxDecoration(
                color: Color(0xFF199A8E),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 10),
                  Center(
                    child: Stack(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.2),
                          ),
                          child: CircleAvatar(
                            radius: 50,
                            backgroundColor: Colors.white,
                            backgroundImage: user.profileImage != null
                                ? NetworkImage(user.profileImage!)
                                : const AssetImage('assets/images/placeholder_user.png') as ImageProvider,
                            child: user.profileImage == null
                                ? const Icon(Icons.person, size: 50, color: Colors.grey)
                                : null,
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.camera_alt, color: Color(0xFF199A8E), size: 20),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 15),
                  Text(
                    user.name,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    user.email, // Or phone number if preferred
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: 25),
                  
                  // Stats Row
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildStatItem('Heart Rate', '215bpm', FontAwesomeIcons.heartPulse),
                        Container(width: 1, height: 40, color: Colors.white.withOpacity(0.3)),
                        _buildStatItem('Calories', '756cal', FontAwesomeIcons.fire),
                        Container(width: 1, height: 40, color: Colors.white.withOpacity(0.3)),
                        _buildStatItem('Weight', '103lbs', FontAwesomeIcons.weightScale),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Menu Options
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: IconlyLight.heart,
                    title: 'My Saved',
                    color: const Color(0xFF199A8E),
                    onTap: () {},
                  ),
                  _buildMenuItem(
                    icon: IconlyLight.calendar,
                    title: 'My Appointment',
                    color: const Color(0xFF199A8E),
                    onTap: () {},
                  ),
                  _buildMenuItem(
                    icon: IconlyLight.wallet,
                    title: 'Payment Method',
                    color: const Color(0xFF199A8E),
                    onTap: () {},
                  ),
                  _buildMenuItem(
                    icon: IconlyLight.message,
                    title: 'FAQs',
                    color: const Color(0xFF199A8E),
                    onTap: () {},
                  ),
                  _buildMenuItem(
                    icon: IconlyLight.logout,
                    title: 'Logout',
                    color: Colors.redAccent,
                    isDanger: true,
                    onTap: () {
                        // show confirmation
                        showDialog(context: context, builder: (ctx) => AlertDialog(
                          title: const Text("Logout"),
                          content: const Text("Are you sure you want to log out?"),
                          actions: [
                            TextButton(onPressed: ()=>Navigator.pop(ctx), child: const Text("Cancel")),
                            TextButton(
                              onPressed: () {
                                Navigator.pop(ctx);
                                viewModel.logout().then((_) {
                                  Navigator.of(context).pushAndRemoveUntil(
                                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                                    (route) => false,
                                  );
                                });
                              }, 
                              child: const Text("Logout", style: TextStyle(color: Colors.red))
                            ),
                          ],
                        ));
                    },
                  ),
                ],
              ),
            ),
             const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
         Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
    bool isDanger = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15.0),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(15),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 15),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.grey.shade100),
            // boxShadow: [
            //   BoxShadow(
            //     color: Colors.grey.withOpacity(0.05),
            //     spreadRadius: 1,
            //     blurRadius: 5,
            //     offset: const Offset(0, 2),
            //   ),
            // ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDanger ? Colors.red : Colors.black87,
                  ),
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        ),
      ),
    );
  }
}
