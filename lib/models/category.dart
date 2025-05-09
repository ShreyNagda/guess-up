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

  factory Category.fromDocument(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return Category(
      id: doc.id,
      name: data['name'] ?? '',
      icon: data['icon'] ?? '',
      words: List<String>.from(data['words'] ?? []),
    );
  }

  Map<String, dynamic> toMap() {
    return {'name': name, 'icon': icon, 'words': words};
  }
}
