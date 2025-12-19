// Simplified call_page.dart - Full version available if needed
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:pharmacy/features/doctor/data/models/doctor_model.dart';
import 'package:pharmacy/core/constants/app_constants.dart';

class CallPage extends StatefulWidget {
  final Doctor doctor;
  final bool isVideoCall;
  final String? userImageUrl;

  const CallPage({
    super.key,
    required this.doctor,
    required this.isVideoCall,
    this.userImageUrl,
  });

  @override
  State<CallPage> createState() => _CallPageState();
}

class _CallPageState extends State<CallPage> {
  bool _isMuted = false;
  bool _isSpeakerOn = false;
  bool _isVideoOn = true;

  @override
  void initState() {
    super.initState();
    _isVideoOn = widget.isVideoCall;
  }

  void _toggleMute() {
    setState(() {
      _isMuted = !_isMuted;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_isMuted ? 'Microphone Muted' : 'Microphone Unmuted')));
    });
  }

  void _toggleSpeaker() {
    setState(() {
      _isSpeakerOn = !_isSpeakerOn;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_isSpeakerOn ? 'Speaker On' : 'Speaker Off')));
    });
  }

  void _toggleVideo() {
    if (!widget.isVideoCall) return;
    setState(() {
      _isVideoOn = !_isVideoOn;
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_isVideoOn ? 'Video On' : 'Video Off')));
    });
  }

  void _endCall() {
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Positioned.fill(
            child: widget.isVideoCall && _isVideoOn
                ? Image.asset(widget.doctor.imageUrl, fit: BoxFit.cover)
                : Stack(
                    fit: StackFit.expand,
                    children: [
                      Image.asset(widget.doctor.imageUrl, fit: BoxFit.cover),
                      if (!widget.isVideoCall || !_isVideoOn)
                        BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
                          child: Container(
                            color: Colors.black.withOpacity(0.4),
                          ),
                        ),
                    ],
                  ),
          ),
          if (widget.isVideoCall && _isVideoOn && widget.userImageUrl != null)
            Positioned(
              top: MediaQuery.of(context).padding.top + 15,
              right: 15,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  width: 100,
                  height: 140,
                  color: Colors.grey.shade800,
                  child: Image.asset(
                    widget.userImageUrl!,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
          Align(
            alignment: widget.isVideoCall && _isVideoOn ? Alignment.bottomCenter : Alignment.center,
            child: Padding(
              padding: EdgeInsets.only(
                top: widget.isVideoCall && _isVideoOn ? MediaQuery.of(context).size.height * 0.15 : 0,
                bottom: widget.isVideoCall && _isVideoOn ? MediaQuery.of(context).size.height * 0.25 : 0,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!widget.isVideoCall || !_isVideoOn)
                    CircleAvatar(
                      radius: 60,
                      backgroundImage: AssetImage(widget.doctor.imageUrl),
                      backgroundColor: Colors.white,
                    ),
                  if (!widget.isVideoCall || !_isVideoOn) const SizedBox(height: 20),
                  Text(
                    widget.doctor.name,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: widget.isVideoCall && _isVideoOn ? 28 : 32,
                      fontWeight: FontWeight.bold,
                      shadows: [
                        Shadow(
                          blurRadius: 5.0,
                          color: Colors.black.withOpacity(0.5),
                          offset: const Offset(1, 1),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    '00:05:24',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Column(
              children: [
                const Icon(Icons.keyboard_arrow_up_rounded, color: Colors.white, size: 30),
                const Text(
                  'Swipe back to menu',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    if (widget.isVideoCall)
                      _buildCallControlButton(
                        _isVideoOn ? Icons.videocam : Icons.videocam_off,
                        _isVideoOn ? 'Video Off' : 'Video On',
                        _toggleVideo,
                        isRed: !_isVideoOn,
                      ),
                    _buildCallControlButton(
                      Icons.call_end,
                      'End Call',
                      _endCall,
                      isRed: true,
                    ),
                    _buildCallControlButton(
                      _isMuted ? Icons.mic_off : Icons.mic,
                      _isMuted ? 'Unmute' : 'Mute',
                      _toggleMute,
                      isRed: _isMuted,
                    ),
                    if (!widget.isVideoCall)
                      _buildCallControlButton(
                        _isSpeakerOn ? Icons.volume_up : Icons.volume_down,
                        _isSpeakerOn ? 'Speaker On' : 'Speaker Off',
                        _toggleSpeaker,
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCallControlButton(IconData icon, String label, VoidCallback onTap, {bool isRed = false}) {
    Color bgColor = isRed ? Colors.red.shade600 : Colors.white24;

    return Column(
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: bgColor,
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