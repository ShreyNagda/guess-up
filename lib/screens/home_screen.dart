import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/screens/config_screen.dart';
import 'package:guess_up/screens/settings_screen.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/models/category.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  // Helper to fetch offline words (custom + local JSON)
  Future<List<String>> _fetchOfflineWords() async {
    final customWords = await StorageService().getCustomWords();
    final localWords =
        await StorageService().getWordsFromLocalFile(); // data.json
    return [...customWords, ...localWords];
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        elevation: 20,
        toolbarHeight: 150,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
        ),
        title: Center(
          child: Column(
            children: [
              Text(
                "guesse up",
                style: TextStyle(fontSize: 45, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 10),
              Text(
                "act, hint, laugh",
                style: theme.textTheme.headlineSmall!.copyWith(
                  fontWeight: FontWeight.w600,
                  fontSize: 24,
                  letterSpacing: 2,
                ),
              ),
            ],
          ),
        ),
      ),
      body: Stack(
        children: [
          const SizedBox.expand(),
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: SizedBox(
              height: 100,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Left: Settings button
                  Positioned(
                    left: 40,
                    child: IconButton(
                      style: IconButton.styleFrom(
                        shape: const CircleBorder(),
                        padding: const EdgeInsets.all(16),
                        elevation: 6,
                        minimumSize: const Size(60, 60),
                      ),
                      onPressed: () {
                        Navigator.of(context).push(
                          CupertinoPageRoute(
                            builder: (_) => const SettingsScreen(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.settings, size: 40),
                    ),
                  ),

                  // Right: Offline mode button
                  Positioned(
                    right: 40,
                    child: Tooltip(
                      message: "Play offline with saved or local words",
                      child: IconButton(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.all(16),
                          elevation: 6,
                          minimumSize: const Size(60, 60),
                        ),
                        onPressed: () async {
                          final offlineWords = await _fetchOfflineWords();

                          if (offlineWords.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text("No offline words available!"),
                              ),
                            );
                            return;
                          }

                          // Wrap words into a dummy category
                          final offlineCategory = Category(
                            id: "-1",
                            name: "Offline",
                            icon: "📝",
                            words: offlineWords,
                          );

                          Navigator.of(context).push(
                            CupertinoPageRoute(
                              builder:
                                  (_) => GameScreen(
                                    time: 60,
                                    selectedCategories: [offlineCategory],
                                  ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.wifi_off, size: 40),
                      ),
                    ),
                  ),

                  // Center: Play button (online/config)
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(50),
                      ),
                      padding: const EdgeInsets.all(24),
                      elevation: 12,
                      minimumSize: const Size(100, 100),
                    ),
                    onPressed: () {
                      Navigator.of(context).push(
                        CupertinoPageRoute(
                          builder: (_) => const ConfigScreen(),
                        ),
                      );
                    },
                    child: const Icon(Icons.play_arrow_rounded, size: 48),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
