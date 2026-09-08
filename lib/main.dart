import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:guess_up/blocs/deck/deck_cubit.dart';
import 'package:guess_up/blocs/theme/theme_cubit.dart';
import 'package:guess_up/blocs/theme/theme_state.dart';
import 'package:guess_up/constants/app_info.dart';
import 'package:guess_up/screens/animated_splash_screen.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);

  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.transparent,
    ),
  );

  // 1. Initialize Game Object Storage
  final storageService = GameStorageService();
  await storageService.init();

  // 2. Pre-load Audio RAM Sound Pool Assets in background (non-blocking & fault-tolerant)
  try {
    GameAudioEngine().init();
  } catch (e) {
    debugPrint("Non-critical audio engine init bypass: $e");
  }

  final categoryService = CategoryService();

  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider<ThemeCubit>(create: (_) => ThemeCubit(storageService)),
        BlocProvider<DeckCubit>(
          create:
              (_) => DeckCubit(
                categoryService: categoryService,
                storageService: storageService,
              )..loadDecks(),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeCubit, ThemeState>(
      buildWhen: (previous, current) => previous.themeMode != current.themeMode,
      builder: (context, themeState) {
        return MaterialApp(
          title: AppInfo.name,
          debugShowCheckedModeBanner: false,
          themeMode: themeState.themeMode,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          builder: (context, child) {
            final mediaQuery = MediaQuery.of(context);
            return MediaQuery(
              data: mediaQuery.copyWith(
                textScaler: mediaQuery.textScaler.clamp(
                  minScaleFactor: 0.85,
                  maxScaleFactor: 1.25,
                ),
              ),
              child: child!,
            );
          },
          home: const AnimatedSplashScreen(),
        );
      },
    );
  }
}
