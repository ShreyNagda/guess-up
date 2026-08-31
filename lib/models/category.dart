// lib/models/category.dart
import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

/// Single unified model representing a game Deck / Category in Guess Up.
/// Serves both Firestore remote decks and local custom decks.
class Category {
  final String id;
  final String name;
  final String icon;
  final List<String> words;
  final String? description;
  final String? color;
  final String? gradientEnd;
  final bool isTrending;
  final int sortOrder;
  final int? wordsCount;
  final String? imageUrl;
  final bool isAvailable;
  final bool isLocked;
  final String? lockReason;
  final Map<String, dynamic>? theme;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.words,
    this.description,
    this.color,
    this.gradientEnd,
    this.isTrending = false,
    this.sortOrder = 0,
    this.wordsCount,
    this.imageUrl,
    this.isAvailable = true,
    this.isLocked = false,
    this.lockReason,
    this.theme,
    this.createdAt,
    this.updatedAt,
  });

  /// Alias for color hex string
  String? get colorHex => color;

  /// Alias for title
  String get title => name;

  /// Check if deck is a custom user-created deck
  bool get isCustom => id.startsWith('custom') || id.contains('custom');

  /// Total words count
  int get count => wordsCount ?? words.length;

  /// Deck description provided from database or fallback
  String get categoryDescription {
    if (description != null && description!.trim().isNotEmpty) {
      return description!;
    }
    return "Deck featuring $count cards.";
  }

  /// Parse hex color string to Color
  static Color parseHex(
    String? hex, {
    Color fallback = const Color(0xFFFFC107),
  }) {
    if (hex == null || hex.isEmpty) return fallback;
    try {
      String cleanHex = hex.replaceAll('#', '').replaceAll('0x', '');
      if (cleanHex.length == 6) cleanHex = 'FF$cleanHex';
      return Color(int.parse(cleanHex, radix: 16));
    } catch (_) {
      return fallback;
    }
  }

  /// Primary theme color for the deck
  Color get themeColor {
    if (color != null && color!.isNotEmpty) {
      return parseHex(color);
    }
    if (theme != null && theme!['accentColor'] != null) {
      return parseHex(theme!['accentColor'].toString());
    }
    return const Color(0xFFFFC107);
  }

  /// Color alias for themeColor
  Color get primaryColor => themeColor;

  /// End gradient color (defaults to gradientEnd or 20% darker tone of themeColor)
  Color get gradientEndColor {
    if (gradientEnd != null && gradientEnd!.isNotEmpty) {
      return parseHex(gradientEnd);
    }
    final hsl = HSLColor.fromColor(themeColor);
    final darkenedHsl = hsl.withLightness(
      (hsl.lightness - 0.20).clamp(0.0, 1.0),
    );
    return darkenedHsl.toColor();
  }

  /// Linear gradient colors pair: [color, gradientEnd]
  List<Color> get gradientColors => [themeColor, gradientEndColor];

  /// Get seasonal/festive badge text if present (e.g. "FESTIVE 🪔" or "IPL 🏏")
  String? get badgeText {
    if (isTrending) return "🔥 Trending";
    return theme?['badgeText']?.toString();
  }

  factory Category.fromDocument(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    List<String> wordsList = [];
    if (data['words'] is List) {
      wordsList =
          (data['words'] as List)
              .map((e) => e?.toString() ?? '')
              .where((e) => e.isNotEmpty)
              .toList();
    }

    bool available = true;
    if (data.containsKey('isAvailable')) {
      final val = data['isAvailable'];
      if (val is bool) {
        available = val;
      } else if (val != null) {
        final s = val.toString().toLowerCase();
        available = s == 'true' || s == 'active' || s == 'available';
      }
    } else if (data.containsKey('status')) {
      final s = data['status']?.toString().toLowerCase() ?? '';
      available = s == 'active' || s == 'available' || s == 'true';
    }

    final String titleVal =
        data['name']?.toString() ??
        data['title']?.toString() ??
        'Unnamed Category';

    final String colorVal =
        data['color']?.toString() ??
        data['colorHex']?.toString() ??
        data['accentColor']?.toString() ??
        '#FFC107';

    final int wordsCountVal =
        data['wordsCount'] is int
            ? data['wordsCount'] as int
            : (int.tryParse(data['wordsCount']?.toString() ?? '') ??
                wordsList.length);

    final int sortVal =
        data['sortOrder'] is int
            ? data['sortOrder'] as int
            : (int.tryParse(data['sortOrder']?.toString() ?? '0') ?? 0);

    final bool trendingVal =
        data['isTrending'] == true ||
        data['isTrending']?.toString().toLowerCase() == 'true' ||
        (data['theme'] is Map && data['theme']['isTrending'] == true);

    DateTime? parseDate(dynamic d) {
      if (d is Timestamp) return d.toDate();
      if (d != null) return DateTime.tryParse(d.toString());
      return null;
    }

    return Category(
      id: doc.id,
      name: titleVal,
      icon: data['icon']?.toString() ?? '🎮',
      words: wordsList,
      description: data['description']?.toString() ?? data['desc']?.toString(),
      color: colorVal,
      gradientEnd: data['gradientEnd']?.toString(),
      isTrending: trendingVal,
      sortOrder: sortVal,
      wordsCount: wordsCountVal,
      imageUrl: data['imageUrl']?.toString(),
      isAvailable: available,
      isLocked:
          data['isLocked'] == true || data['isLocked']?.toString() == 'true',
      lockReason: data['lockReason']?.toString(),
      theme:
          data['theme'] is Map
              ? Map<String, dynamic>.from(data['theme'])
              : null,
      createdAt: parseDate(data['createdAt']),
      updatedAt: parseDate(data['updatedAt']),
    );
  }

  factory Category.fromJson(Map<String, dynamic> json) {
    List<String> wordsList = [];
    if (json['words'] is List) {
      wordsList =
          (json['words'] as List)
              .map((e) => e?.toString() ?? '')
              .where((e) => e.isNotEmpty)
              .toList();
    }

    bool available = true;
    if (json.containsKey('isAvailable')) {
      final val = json['isAvailable'];
      if (val is bool) {
        available = val;
      } else if (val != null) {
        final s = val.toString().toLowerCase();
        available = s == 'true' || s == 'active' || s == 'available';
      }
    } else if (json.containsKey('status')) {
      final s = json['status']?.toString().toLowerCase() ?? '';
      available = s == 'active' || s == 'available' || s == 'true';
    }

    final String titleVal =
        json['name']?.toString() ??
        json['title']?.toString() ??
        'Unnamed Category';

    final String colorVal =
        json['color']?.toString() ??
        json['colorHex']?.toString() ??
        json['accentColor']?.toString() ??
        '#FFC107';

    final int wordsCountVal =
        json['wordsCount'] is int
            ? json['wordsCount'] as int
            : (int.tryParse(json['wordsCount']?.toString() ?? '') ??
                wordsList.length);

    final int sortVal =
        json['sortOrder'] is int
            ? json['sortOrder'] as int
            : (int.tryParse(json['sortOrder']?.toString() ?? '0') ?? 0);

    final bool trendingVal =
        json['isTrending'] == true ||
        json['isTrending']?.toString().toLowerCase() == 'true' ||
        (json['theme'] is Map && json['theme']['isTrending'] == true);

    return Category(
      id: json['id']?.toString() ?? '',
      name: titleVal,
      icon: json['icon']?.toString() ?? '🎮',
      words: wordsList,
      description: json['description']?.toString() ?? json['desc']?.toString(),
      color: colorVal,
      gradientEnd: json['gradientEnd']?.toString(),
      isTrending: trendingVal,
      sortOrder: sortVal,
      wordsCount: wordsCountVal,
      imageUrl: json['imageUrl']?.toString(),
      isAvailable: available,
      isLocked:
          json['isLocked'] == true || json['isLocked']?.toString() == 'true',
      lockReason: json['lockReason']?.toString(),
      theme:
          json['theme'] is Map
              ? Map<String, dynamic>.from(json['theme'])
              : null,
      createdAt:
          json['createdAt'] != null
              ? DateTime.tryParse(json['createdAt'].toString())
              : null,
      updatedAt:
          json['updatedAt'] != null
              ? DateTime.tryParse(json['updatedAt'].toString())
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'words': words,
      'description': description,
      'color': color,
      'gradientEnd': gradientEnd,
      'isTrending': isTrending,
      'sortOrder': sortOrder,
      'wordsCount': wordsCount ?? words.length,
      if (imageUrl != null) 'imageUrl': imageUrl,
      'isAvailable': isAvailable,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  Map<String, dynamic> toMap() {
    return toJson();
  }

  static String encode(List<Category> categories) => json.encode(
    categories.map<Map<String, dynamic>>((cat) => cat.toJson()).toList(),
  );

  static List<Category> decode(String jsonStr) =>
      (json.decode(jsonStr) as List<dynamic>)
          .map<Category>((item) => Category.fromJson(item))
          .toList();

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Category && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
