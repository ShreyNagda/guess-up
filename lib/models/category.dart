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
  final String? colorHex;
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
    this.colorHex,
    this.isAvailable = true,
    this.isLocked = false,
    this.lockReason,
    this.theme,
    this.createdAt,
    this.updatedAt,
  });

  /// Check if deck is a custom user-created deck
  bool get isCustom => id.startsWith('custom') || id.contains('custom');

  /// Deck description provided from database
  String get categoryDescription {
    if (description != null && description!.trim().isNotEmpty) {
      return description!;
    }
    return "Deck featuring ${words.length} cards.";
  }

  /// Parse hex color string (e.g., "#FFC107" or "FFC107") to Color
  Color get themeColor {
    if (theme != null && theme!['accentColor'] != null) {
      final hex = theme!['accentColor'].toString();
      try {
        String cleanHex = hex.replaceAll('#', '').replaceAll('0x', '');
        if (cleanHex.length == 6) cleanHex = 'FF$cleanHex';
        return Color(int.parse(cleanHex, radix: 16));
      } catch (_) {}
    }
    if (colorHex != null && colorHex!.isNotEmpty) {
      try {
        String cleanHex = colorHex!.replaceAll('#', '').replaceAll('0x', '');
        if (cleanHex.length == 6) {
          cleanHex = 'FF$cleanHex';
        }
        return Color(int.parse(cleanHex, radix: 16));
      } catch (_) {}
    }
    return const Color(0xFFFFC107);
  }

  /// Get seasonal/festive badge text if present (e.g. "FESTIVE 🪔" or "IPL 🏏")
  String? get badgeText => theme?['badgeText']?.toString();

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

    return Category(
      id: doc.id,
      name: data['name']?.toString() ?? 'Unnamed Category',
      icon: data['icon']?.toString() ?? '🎮',
      words: wordsList,
      description: data['description']?.toString() ?? data['desc']?.toString(),
      colorHex: data['colorHex']?.toString() ?? data['color']?.toString(),
      isAvailable: available,
      isLocked: data['isLocked'] == true || data['isLocked']?.toString() == 'true',
      lockReason: data['lockReason']?.toString(),
      theme: data['theme'] is Map ? Map<String, dynamic>.from(data['theme']) : null,
      createdAt: data['createdAt'] != null
          ? DateTime.tryParse(data['createdAt'].toString())
          : null,
      updatedAt: data['updatedAt'] != null
          ? DateTime.tryParse(data['updatedAt'].toString())
          : null,
    );
  }

  factory Category.fromJson(Map<String, dynamic> json) {
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
      description: json['description']?.toString() ?? json['desc']?.toString(),
      colorHex: json['colorHex']?.toString() ?? json['color']?.toString(),
      isAvailable: available,
      isLocked: json['isLocked'] == true || json['isLocked']?.toString() == 'true',
      lockReason: json['lockReason']?.toString(),
      theme: json['theme'] is Map ? Map<String, dynamic>.from(json['theme']) : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
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
      'colorHex': colorHex,
      'color': colorHex,
      'isAvailable': isAvailable,
      'status': isAvailable ? 'active' : 'inactive',
      'isLocked': isLocked,
      'lockReason': lockReason,
      'theme': theme,
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
