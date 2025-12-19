class Doctor {
  final String id;
  final String name;
  final String specialty;
  final double rating;
  final String distance;
  final String imageUrl;

  // NEW: appointment data
  final Map<String, List<String>> schedule;
  // e.g.
  // {
  //   "2025-02-01": ["09:00 AM", "10:00 AM", "12:00 PM"],
  //   "2025-02-02": ["11:00 AM", "01:00 PM"]
  // }

  Doctor({
    required this.id,
    required this.name,
    required this.specialty,
    required this.rating,
    required this.distance,
    required this.imageUrl,
    required this.schedule,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      specialty: json['specialty'] ?? '',
      rating: (json['rating'] ?? 0.0).toDouble(),
      distance: json['distance'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      schedule: Map<String, List<String>>.from(
        (json['schedule'] ?? {})
            .map((key, value) => MapEntry(key, List<String>.from(value))),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'specialty': specialty,
      'rating': rating,
      'distance': distance,
      'imageUrl': imageUrl,
      'schedule': schedule,
    };
  }
}
