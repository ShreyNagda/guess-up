// lib/models/category.dart
import 'dart:convert';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

class Category {
  final String id;
  final String name;
  final String icon;
  final String description;
  final List<String> words;
  final int wordsCount;
  final List<String> gradient;
  final bool isAvailable;
  final bool isTrending;
  final int sortOrder;
  final DateTime? updatedAt;

  Category({
    required this.id,
    required String name,
    String? title,
    required this.icon,
    required List<String> words,
    String? description,
    String? desc,
    int? wordsCount,
    this.gradient = const [],
    this.isAvailable = true,
    this.isTrending = false,
    this.sortOrder = 0,
    this.updatedAt,
    bool? isCustom,
  }) : name = name.isNotEmpty ? name : (title ?? 'Unnamed Category'),
       description = description ?? desc ?? '',
       words =
           words
               .map((w) => w.replaceAll('"', '').trim())
               .where((w) => w.isNotEmpty)
               .toList(),
       wordsCount =
           wordsCount ??
           words
               .map((w) => w.replaceAll('"', '').trim())
               .where((w) => w.isNotEmpty)
               .length;

  /// Backward compatibility getter alias for title
  String get title => name;

  /// Backward compatibility getter alias for cards
  List<String> get cards => words;

  /// Backward compatibility getter alias for desc
  String get desc => description;

  /// Compatibility getter for isCustom
  bool get isCustom => id.startsWith('custom') || id.contains('custom');

  /// Main color hex string using gradient[0] as primary
  String get mainColorHex {
    if (gradient.isNotEmpty && gradient[0].trim().isNotEmpty) {
      return gradient[0].trim();
    }
    return '#FFD600';
  }

  /// Alias for color hex string
  String get colorHex => mainColorHex;

  /// End gradient color hex string using the last element of gradient
  String get gradientEndColorHex {
    if (gradient.length > 1 && gradient.last.trim().isNotEmpty) {
      return gradient.last.trim();
    }
    return mainColorHex;
  }

  /// Total words count
  int get count => wordsCount;

  /// Deck description provided from database or fallback
  String get categoryDescription {
    if (description.trim().isNotEmpty) {
      return description;
    }
    return "Party deck for charades.";
  }

  /// Parse hex color string to Color
  static Color parseHex(
    String? hex, {
    Color fallback = const Color(0xFFFFD600),
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
  Color get themeColor => parseHex(mainColorHex);

  /// Color alias for themeColor
  Color get primaryColor => themeColor;

  /// End gradient color using last element of gradient or darkened fallback
  Color get gradientEndColor {
    if (gradient.length > 1 && gradient.last.trim().isNotEmpty) {
      return parseHex(gradient.last);
    }
    final hsl = HSLColor.fromColor(themeColor);
    final darkenedHsl = hsl.withLightness(
      (hsl.lightness - 0.20).clamp(0.0, 1.0),
    );
    return darkenedHsl.toColor();
  }

  /// Linear gradient colors list supporting 1, 2, or 3 hex colors from gradient field
  List<Color> get gradientColors {
    if (gradient.isNotEmpty) {
      final parsed =
          gradient
              .where((g) => g.trim().isNotEmpty)
              .map((g) => parseHex(g.trim()))
              .toList();
      if (parsed.length >= 2) return parsed;
      if (parsed.length == 1) return [parsed[0], gradientEndColor];
    }
    return [themeColor, gradientEndColor];
  }

  /// Get seasonal/festive badge text if present
  String? get badgeText {
    if (isTrending) return "🔥 Trending";
    return null;
  }

  factory Category.fromDocument(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};

    List<String> wordsList = [];
    if (data['words'] is List) {
      wordsList =
          (data['words'] as List)
              .map((e) => e?.toString().replaceAll('"', '').trim() ?? '')
              .where((e) => e.isNotEmpty)
              .toList();
    } else if (data['cards'] is List) {
      wordsList =
          (data['cards'] as List)
              .map((e) => e?.toString().replaceAll('"', '').trim() ?? '')
              .where((e) => e.isNotEmpty)
              .toList();
    }

    List<String> gradientList = [];
    if (data['gradient'] is List) {
      gradientList =
          (data['gradient'] as List)
              .map((e) => e?.toString() ?? '')
              .where((e) => e.trim().isNotEmpty)
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
    }

    final String nameVal =
        data['name']?.toString() ??
        data['title']?.toString() ??
        'Unnamed Category';

    final String descVal =
        data['description']?.toString() ?? data['desc']?.toString() ?? '';

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
        data['isTrending']?.toString().toLowerCase() == 'true';

    DateTime? parseDate(dynamic d) {
      if (d is Timestamp) return d.toDate();
      if (d != null) return DateTime.tryParse(d.toString());
      return null;
    }

    return Category(
      id: doc.id,
      name: nameVal,
      icon: data['icon']?.toString() ?? '🎮',
      words: wordsList,
      description: descVal,
      gradient: gradientList,
      isTrending: trendingVal,
      sortOrder: sortVal,
      wordsCount: wordsCountVal,
      isAvailable: available,
      updatedAt: parseDate(data['updatedAt']),
    );
  }

  factory Category.fromJson(Map<String, dynamic> json) {
    List<String> wordsList = [];
    if (json['words'] is List) {
      wordsList =
          (json['words'] as List)
              .map((e) => e?.toString().replaceAll('"', '').trim() ?? '')
              .where((e) => e.isNotEmpty)
              .toList();
    } else if (json['cards'] is List) {
      wordsList =
          (json['cards'] as List)
              .map((e) => e?.toString().replaceAll('"', '').trim() ?? '')
              .where((e) => e.isNotEmpty)
              .toList();
    }

    List<String> gradientList = [];
    if (json['gradient'] is List) {
      gradientList =
          (json['gradient'] as List)
              .map((e) => e?.toString() ?? '')
              .where((e) => e.trim().isNotEmpty)
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
    }

    final String nameVal =
        json['name']?.toString() ??
        json['title']?.toString() ??
        'Unnamed Category';

    final String descVal =
        json['description']?.toString() ?? json['desc']?.toString() ?? '';

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
        json['isTrending']?.toString().toLowerCase() == 'true';

    final String catId = json['id']?.toString() ?? '';

    return Category(
      id: catId,
      name: nameVal,
      icon: json['icon']?.toString() ?? '🎮',
      words: wordsList,
      description: descVal,
      gradient: gradientList,
      isTrending: trendingVal,
      sortOrder: sortVal,
      wordsCount: wordsCountVal,
      isAvailable: available,
      updatedAt:
          json['updatedAt'] != null
              ? DateTime.tryParse(json['updatedAt'].toString())
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'icon': icon,
      'isAvailable': isAvailable,
      'isTrending': isTrending,
      'sortOrder': sortOrder,
      'words': words,
      'wordsCount': wordsCount,
      if (gradient.isNotEmpty) 'gradient': gradient,
      if (updatedAt != null) 'updatedAt': updatedAt?.toIso8601String(),
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
