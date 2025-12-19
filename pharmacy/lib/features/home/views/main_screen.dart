// lib/screens/main_screen.dart (NEW FILE)
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

// Import all required screens (assuming they are in the 'screens' directory)
import '../../profile/views/profile_screen.dart';
import '../../doctor/views/inbox_screen.dart'; // Import at top
import 'home_screen.dart'; // The screen you provided
// For this to work, ensure primaryTeal and customTextStyle are accessible (e.g., defined in a separate constants file or duplicated here for simplicity).

const Color primaryTeal = Color(0xFF00B7B7);
const TextStyle customTextStyle = TextStyle(fontFamily: 'CustomFontFamily');
// -----------------------------------------------------------


class MessageScreen extends StatelessWidget {
  const MessageScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(
          title: Text('Messages (Inbox)', style: customTextStyle.copyWith(fontWeight: FontWeight.bold)),
          backgroundColor: Colors.white, elevation: 0.5),
      body: Center(child: Text('Message Inbox Page (To be designed)', style: customTextStyle)));
}

class ScheduleScreen extends StatelessWidget {
  const ScheduleScreen({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(
          title: Text('My Schedule', style: customTextStyle.copyWith(fontWeight: FontWeight.bold)),
          backgroundColor: Colors.white, elevation: 0.5),
      body: Center(child: Text('Schedule Page (To be designed)', style: customTextStyle)));
}


class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    HomeScreen(),        // 0. Home
    const InboxScreen(),      // 1. Messages (Inbox)
    const ScheduleScreen(),     // 2. Schedule
    const ProfileScreen(),      // 3. Profile
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // 1. The body switches based on the selected index
      body: _screens[_selectedIndex],

      // 2. Functional Bottom Navigation Bar
      bottomNavigationBar: Container(
        height: 70,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(25),
            topRight: Radius.circular(25),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 10,
              offset: const Offset(0, -1),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(FontAwesomeIcons.houseChimneyMedical, 'Home', 0, _selectedIndex == 0),
            _buildNavItem(FontAwesomeIcons.envelope, 'Messages', 1, _selectedIndex == 1),
            _buildNavItem(FontAwesomeIcons.calendarCheck, 'Schedule', 2, _selectedIndex == 2),
            _buildNavItem(FontAwesomeIcons.user, 'Profile', 3, _selectedIndex == 3),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, int index, bool isActive) {
    return GestureDetector(
      onTap: () => _onItemTapped(index), // Calls the state-changing function
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          FaIcon(
            icon,
            size: 28,
            color: isActive ? primaryTeal : Colors.grey.shade500,
          ),
          const SizedBox(height: 4),
          // Optional: Add label back if desired, but image only shows icons
          /*
          Text(
            label,
            style: customTextStyle.copyWith(
              fontSize: 11,
              color: isActive ? primaryTeal : Colors.grey.shade500,
            ),
          )
          */
        ],
      ),
    );
  }
}