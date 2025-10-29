// lib/models/category.dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:json_annotation/json_annotation.dart'; // Import

part 'category.g.dart'; // Add this line for generated code

@JsonSerializable() // Add annotation
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
    final data = doc.data() as Map<String, dynamic>;
    // Ensure words list is handled correctly if it might be missing
    final wordsList =
        data['words'] != null ? List<String>.from(data['words']) : <String>[];
    return Category(
      id: doc.id,
      name: data['name'] ?? '',
      icon: data['icon'] ?? '',
      words: wordsList,
    );
  }

  // Factory for JSON deserialization
  factory Category.fromJson(Map<String, dynamic> json) =>
      _$CategoryFromJson(json);

  // Method for JSON serialization
  Map<String, dynamic> toJson() => _$CategoryToJson(this);

  // Keep toMap if used directly with Firestore set/update,
  // though toJson() might replace it.
  Map<String, dynamic> toMap() {
    return {'name': name, 'icon': icon, 'words': words};
  }
}
