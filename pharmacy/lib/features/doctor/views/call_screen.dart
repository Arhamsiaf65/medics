// lib/screens/call_screen.dart
import 'package:flutter/material.dart';
import 'package:pharmacy/features/doctor/data/models/doctor_model.dart';
import 'package:pharmacy/core/constants/app_constants.dart';

class CallScreen extends StatelessWidget {
  final Doctor doctor;

  const CallScreen({super.key, required this.doctor});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              doctor.imageUrl,
              fit: BoxFit.cover,
              colorBlendMode: BlendMode.darken,
              color: Colors.black.withOpacity(0.4),
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black54],
                ),
              ),
            ),
          ),
          Positioned(
            top: 40,
            left: 10,
            right: 10,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 28),
                  onPressed: () => Navigator.pop(context),
                ),
                IconButton(
                  icon: const Icon(Icons.more_vert, color: Colors.white, size: 28),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Call options not implemented')),
                    );
                  },
                ),
              ],
            ),
          ),
          Positioned(
            top: MediaQuery.of(context).size.height * 0.25,
            left: 0,
            right: 0,
            child: Column(
              children: [
                Text(
                  doctor.name,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Calling...',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildCallControlButton(Icons.volume_up, 'Speaker', () {
                  ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Speaker toggle not implemented')));
                }),
                _buildCallControlButton(Icons.mic_off, 'Mute', () {
                  ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Mute toggle not implemented')));
                }),
                _buildCallControlButton(Icons.call_end, 'End Call', () {
                  Navigator.pop(context);
                }, isRed: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCallControlButton(IconData icon, String label, VoidCallback onTap, {bool isRed = false}) {
    return Column(
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: isRed ? Colors.red : Colors.white24,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.white, size: 30),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
          ),
        ),
      ],
    );
  }
}
