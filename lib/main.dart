import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/screens/home_screen.dart';
// import 'package:just_audio/just_audio.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const MyApp());
}

Future<void> uploadCategoriesFromJsonFile() async {
  final FirebaseFirestore firestore = FirebaseFirestore.instance;

  try {
    // Load the JSON file as a string
    final String jsonString = await rootBundle.loadString('assets/data.json');

    // Decode the JSON into a List
    final List<dynamic> jsonData = json.decode(jsonString);

    // Upload each category
    for (var category in jsonData) {
      String id = category['name'].toString().toLowerCase().replaceAll(
        ' ',
        '_',
      );

      await firestore.collection('categories').doc(id).set({
        'name': category['name'],
        'icon': category['icon'] ?? '',
        'words': List<String>.from(category['words']),
      });

      print('✅ Uploaded category: ${category['name']}');
    }
  } catch (e) {
    print('❌ Failed to upload categories: $e');
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'GUESS UP',
      theme: ThemeData(
        scaffoldBackgroundColor: Colors.grey.shade200,
        appBarTheme: AppBarTheme(backgroundColor: Colors.transparent),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF673AB7)),
      ),
      home: const HomeScreen(),
    );
  }
}
