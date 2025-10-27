import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/screens/splash_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/services/theme_service.dart';
import 'package:guess_up/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await AudioService().init();
  await ThemeService().loadTheme();

  // Load saved settings
  final isDarkTheme = await StorageService().getTheme();
  final customWords = await StorageService().getCustomWords();

  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  runApp(MyApp(isDarkTheme: isDarkTheme, customWords: customWords));
}

class MyApp extends StatefulWidget {
  final bool isDarkTheme;
  final List<String> customWords;

  const MyApp({
    super.key,
    required this.isDarkTheme,
    required this.customWords,
  });

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  void updateTheme(bool value) {
    StorageService().setTheme(value);
  }

  void updateCustomWords(List<String> words) {}

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: ThemeService(),
      builder: (context, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'guesse up',
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeService().themeMode,
          home: const SplashScreen(),
        );
      },
    );
  }
}
