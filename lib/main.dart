import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/services/audio_service.dart';
// StorageService import might not be strictly needed here anymore,
// but ThemeService uses it, so keep it if other initializations might need it.
import 'package:guess_up/services/theme_service.dart';
import 'package:guess_up/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await AudioService().init();
  // Load the ThemeMode preference from storage via the service
  await ThemeService().loadTheme();

  // Removed loading isDarkTheme and customWords here as they are not needed by MyApp

  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  // Pass only necessary arguments (currently none) to MyApp
  runApp(const MyApp());
}

// MyApp no longer needs isDarkTheme or customWords properties
class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  // Removed updateTheme and updateCustomWords methods

  @override
  Widget build(BuildContext context) {
    // AnimatedBuilder listens to ThemeService for changes
    return AnimatedBuilder(
      animation: ThemeService(),
      builder: (context, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'guesse up',
          theme: AppTheme.lightTheme, // Your light theme definition
          darkTheme: AppTheme.darkTheme, // Your dark theme definition
          // Gets the current ThemeMode (light, dark, or system) from the service
          themeMode: ThemeService().themeMode,
          // Start with SplashScreen which will navigate to HomeScreen
          home: const HomeScreen(),
        );
      },
    );
  }
}
