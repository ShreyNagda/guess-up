import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Import for orientation lock

class HowToPlayScreen extends StatefulWidget {
  // Changed to StatefulWidget for orientation lock
  const HowToPlayScreen({super.key});

  @override
  State<HowToPlayScreen> createState() => _HowToPlayScreenState();
}

class _HowToPlayScreenState extends State<HowToPlayScreen> {
  @override
  void initState() {
    super.initState();
    _setPortraitOnly(); // Lock orientation on entry
  }

  // Function to set portrait mode
  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  // Optional: Function to allow any orientation after leaving screen
  // (Uncomment if needed, e.g., if navigating directly to GameScreen was possible)
  // @override
  // void dispose() {
  //   SystemChrome.setPreferredOrientations([
  //     DeviceOrientation.portraitUp,
  //     DeviceOrientation.portraitDown,
  //     DeviceOrientation.landscapeLeft,
  //     DeviceOrientation.landscapeRight,
  //   ]);
  //   super.dispose();
  // }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        // Uses themed AppBar
        title: const Text("How to Play"),
        // No local shape needed, theme provides it
        leading: IconButton(
          // Using a standard back icon, size inherited or themed
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          tooltip: "Back",
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        // Use ListView for scrollable content
        padding: const EdgeInsets.all(16.0),
        physics: const BouncingScrollPhysics(), // Nice scroll effect
        children: [
          _buildSection(
            context,
            icon: Icons.settings_suggest, // Icon for setup
            title: "1. Get Ready!",
            content: "Go to 'Play Now' > 'Configure Game'. Choose fun decks",
          ),
          _buildSection(
            context,
            icon: Icons.phone_android_outlined, // Icon for placement
            title: "2. Place the Phone",
            content:
                "Hold the phone flat facing the group, then place it securely on your forehead. Don't peek!",
          ),
          _buildSection(
            context,
            icon: Icons.timer_3, // Icon for countdown
            title: "3. Countdown Starts",
            content:
                "Once the phone is steady on your forehead, a 3-second countdown will begin automatically.",
          ),
          _buildSection(
            context,
            icon: Icons.lightbulb_outline, // Icon for guessing
            title: "4. Guess the Word!",
            content:
                "The first word appears! Your friends give you clues (acting, singing, describing - whatever helps!).",
          ),
          _buildSection(
            context,
            icon: Icons.thumb_down_alt_outlined, // Icon for correct tilt
            title: "5. Got it Right? Tilt Down!",
            content:
                "Guessed correctly? Quickly tilt the phone screen towards the floor. You'll score a point and the next word appears.",
          ),
          _buildSection(
            context,
            icon: Icons.thumb_up_alt_outlined, // Icon for pass tilt
            title: "6. Need to Pass? Tilt Up!",
            content:
                "Stuck? Tilt the phone screen towards the sky to pass the word. No points, but you move on quickly!",
          ),
          _buildSection(
            context,
            icon: Icons.celebration_outlined, // Icon for game end
            title: "7. Time's Up!",
            content:
                "Keep going until the timer runs out. Check your score and see which words you got right on the results screen.",
          ),
          const SizedBox(height: 24),
          Center(
            child: Text(
              "Most Importantly: Have Fun!",
              style: theme.textTheme.headlineSmall?.copyWith(
                // Use themed text style
                color:
                    theme.colorScheme.primary, // Use primary color for emphasis
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 16), // Bottom padding
        ],
      ),
    );
  }

  // Helper widget for consistent section styling
  Widget _buildSection(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String content,
  }) {
    final theme = Theme.of(context);
    // Use Card for grouping, styled by theme
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      // Uses cardTheme defaults for shape, elevation, color
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start, // Align icon nicely with multi-line title
              children: [
                Icon(
                  icon,
                  size: 28, // Consistent icon size
                  color:
                      theme.colorScheme.primary, // Use primary color for icons
                ),
                const SizedBox(width: 12),
                // Use Flexible to allow title text to wrap
                Flexible(
                  child: Text(
                    title,
                    // Use a themed text style
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              content,
              style: theme.textTheme.bodyLarge, // Use themed text style
            ),
          ],
        ),
      ),
    );
  }
}
