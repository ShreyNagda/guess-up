import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart'; // Ensure Category model is imported
import 'package:guess_up/screens/about_screen.dart';
import 'package:guess_up/screens/config_screen.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/how_to_play_screen.dart';
import 'package:guess_up/screens/settings_screen.dart';
// TODO: Uncomment these imports when the screens are created
// import 'package:guess_up/screens/how_to_play_screen.dart';
// import 'package:guess_up/screens/about_screen.dart';
import 'package:guess_up/services/storage_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

// Add SingleTickerProviderStateMixin for the animation controller
class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _setPortraitOnly(); // Enforce portrait mode when screen loads

    // --- Animation Setup ---
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(
        milliseconds: 1200,
      ), // Duration of one pulse cycle
    )..repeat(reverse: true); // Make it loop back and forth

    _scaleAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut, // Smooth easing
      ),
    );
    // --- End Animation Setup ---
  }

  @override
  void dispose() {
    _animationController.dispose(); // Dispose the controller
    super.dispose();
  }

  // Function to set portrait mode
  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  // Helper to fetch offline words (custom + local JSON)
  Future<List<String>> _fetchOfflineWords() async {
    final customWords = await StorageService().getCustomWords();
    final localWords = await StorageService().getWordsFromLocalFile();
    return [...customWords, ...localWords];
  }

  // Function to handle starting offline game
  Future<void> _startOfflineGame() async {
    final offlineWords = await _fetchOfflineWords();

    if (!mounted) return; // Check if the widget is still in the tree

    if (offlineWords.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "No offline words found! Add custom words in Settings.",
          ),
          duration: Duration(seconds: 2),
        ),
      );
      return;
    }

    // Wrap words into a dummy category for GameScreen
    final offlineCategory = Category(
      id: "-1", // Special ID for offline/custom words
      name: "Offline Mix",
      icon: "💾", // Example icon
      words: offlineWords..shuffle(), // Shuffle them for variety
    );

    Navigator.of(context).push(
      CupertinoPageRoute(
        builder:
            (_) => GameScreen(
              time: 60, // Default time, consider making this configurable
              selectedCategories: [offlineCategory],
            ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      // No AppBar in this design
      body: Stack(
        // Wrap body with Stack for background
        children: [
          // --- Background Image ---
          Positioned.fill(
            child: Opacity(
              opacity: 0.2, // Adjust opacity
              child: Image.asset(
                'assets/images/background.png', // Your background image path
                fit: BoxFit.cover,
              ),
            ),
          ),
          // --- End Background Image ---

          // --- Main Content ---
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 40.0,
              ),
              child: Column(
                mainAxisAlignment:
                    MainAxisAlignment.spaceBetween, // Distributes space
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // 1. Top Section: Logo and Title
                  Column(
                    mainAxisSize: MainAxisSize.min, // Takes minimum space
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(
                            75,
                          ), // Circular border for logo
                        ),
                        clipBehavior: Clip.hardEdge,
                        child: Image.asset(
                          'assets/images/logo.png', // Your logo asset
                          height: 150, // Adjust size as desired
                          width: 150,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        "guesse up", // Your app name
                        textAlign: TextAlign.center,
                        style: theme.textTheme.displayMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2,
                          fontSize: 42,
                        ),
                      ),
                    ],
                  ),

                  // 2. Center Section: Animated Play Button
                  ScaleTransition(
                    // Apply pulsing animation
                    scale: _scaleAnimation,
                    child: SizedBox(
                      width: 120, // Define size for the circle
                      height: 120,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            CupertinoPageRoute(
                              builder: (_) => const ConfigScreen(),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          shape: const CircleBorder(),
                          padding: EdgeInsets.zero, // Remove default padding
                          backgroundColor:
                              theme.colorScheme.primary, // Use primary color
                          elevation: 10,
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.play_arrow_rounded,
                            size: 70, // Make icon prominent
                            color:
                                Colors
                                    .white, // White icon looks good on primary
                          ),
                        ),
                      ),
                    ),
                  ),
                  // The Offline button is removed from the center column

                  // 3. Bottom Section: Secondary Action Buttons (Now includes Offline)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16.0),
                    child: Row(
                      mainAxisAlignment:
                          MainAxisAlignment.spaceAround, // Evenly space icons
                      children: [
                        _buildSecondaryButton(
                          context,
                          icon: Icons.settings_outlined,
                          label: "Settings",
                          onPressed: () {
                            Navigator.of(context).push(
                              CupertinoPageRoute(
                                builder: (_) => const SettingsScreen(),
                              ),
                            );
                          },
                        ),
                        _buildSecondaryButton(
                          context,
                          icon: Icons.help_outline,
                          label: "How to Play",
                          onPressed: () {
                            Navigator.of(context).push(
                              CupertinoPageRoute(
                                builder: (_) => const HowToPlayScreen(),
                              ),
                            );
                          },
                        ),
                        // Add Offline button back here
                        _buildSecondaryButton(
                          context,
                          icon:
                              Icons.save_alt_rounded, // Using your chosen icon
                          label: "Offline",
                          onPressed: _startOfflineGame,
                        ),
                        _buildSecondaryButton(
                          context,
                          icon: Icons.info_outline,
                          label: "About",
                          onPressed: () {
                            Navigator.of(context).push(
                              CupertinoPageRoute(
                                builder: (_) => const AboutScreen(),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          // --- End Main Content ---
        ],
      ),
    );
  }

  // Helper widget for creating consistent secondary buttons WITH labels
  // (Removed the isProminent flag as it's less needed now)
  Widget _buildSecondaryButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
  }) {
    final theme = Theme.of(context);
    return TextButton(
      onPressed: onPressed,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 28),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: theme.textTheme.labelSmall?.copyWith(fontSize: 10),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
