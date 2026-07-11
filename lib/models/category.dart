// lib/models/category.dart
import 'package:cloud_firestore/cloud_firestore.dart';

class Category {
  final String id;
  final String name;
  final String icon;
  final List<String> words;

  Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.words,
  });

  // Keep Firestore factory if needed elsewhere, or adapt fetching logic
  factory Category.fromDocument(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    // Robust handling of the 'words' list
    List<String> wordsList = [];
    if (data['words'] is List) {
      wordsList =
          (data['words'] as List)
              .map((e) => e?.toString() ?? '')
              .where((e) => e.isNotEmpty)
              .toList();
    }

    return Category(
      id: doc.id,
      name: data['name']?.toString() ?? 'Unnamed Category',
      icon: data['icon']?.toString() ?? '🎮',
      words: wordsList,
    );
  }

  // Factory for JSON deserialization
  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Unnamed Category',
      icon: json['icon']?.toString() ?? '🎮',
      words:
          (json['words'] as List?)
              ?.map((e) => e?.toString() ?? '')
              .where((e) => e.isNotEmpty)
              .toList() ??
          [],
    );
  }

  // Method for JSON serialization
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'words': words,
    };
  }

  // Keep toMap if used directly with Firestore set/update,
  // though toJson() might replace it.
  Map<String, dynamic> toMap() {
    return {'name': name, 'icon': icon, 'words': words};
  }
}
