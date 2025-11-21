import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/services/theme_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:provider/provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  final storageService = StorageService();
  await storageService.init();

  final audioService = AudioService();
  await audioService.init();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeService()),
        Provider(create: (_) => CategoryService()),
        Provider.value(value: storageService),
        Provider.value(value: audioService),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Listen to ThemeService changes
    final themeService = Provider.of<ThemeService>(context);

    return MaterialApp(
      title: 'Guess Up',
      debugShowCheckedModeBanner: false,
      themeMode: themeService.themeMode, // Use the dynamic mode
      theme: AppTheme.lightTheme, // Light theme config
      darkTheme: AppTheme.darkTheme, // Dark theme config
      home: const HomeScreen(),
    );
  }
}
