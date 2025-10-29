import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Import services if orientation lock is needed
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/services/theme_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // bool isDarkTheme = false; // Replaced by selectedThemeMode
  ThemeMode _selectedThemeMode = ThemeMode.system; // Default to system
  bool isVolumeOn = true;
  List<String> customWords = [];

  // final TextEditingController wordController = TextEditingController(); // Removed single word controller
  final TextEditingController multiWordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _setPortraitOnly(); // Keep settings screen portrait
    _loadSettings();
  }

  // Optional: Add dispose if resetting orientation is needed when leaving
  // @override
  // void dispose() {
  //   _resetOrientation();
  //   super.dispose();
  // }

  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  // Optional: Function to allow any orientation after leaving screen
  // void _resetOrientation() {
  //   SystemChrome.setPreferredOrientations([
  //     DeviceOrientation.portraitUp,
  //     DeviceOrientation.portraitDown,
  //     DeviceOrientation.landscapeLeft,
  //     DeviceOrientation.landscapeRight,
  //   ]);
  // }

  Future<void> _loadSettings() async {
    // --- TODO: Update StorageService to load ThemeMode ---
    // Example: Replace StorageService().getTheme() with something like:
    // final storedThemeMode = await StorageService().getThemeMode(); // Returns ThemeMode
    // For now, we'll use the ThemeService's current mode if available
    final currentThemeMode = ThemeService().themeMode; // Get mode from service
    final volume = await StorageService().getVolume();
    final words = await StorageService().getCustomWords();

    if (mounted) {
      // Check mounted before setState
      setState(() {
        _selectedThemeMode = currentThemeMode; // Set initial selection
        isVolumeOn = volume;
        customWords = words;
      });
    }
  }

  // Updated theme update function
  void _updateTheme(ThemeMode? newMode) {
    if (newMode == null) return;
    if (mounted) {
      // Check mounted before setState
      setState(() => _selectedThemeMode = newMode);
    }
    // --- TODO: Update ThemeService and StorageService ---
    // Example: Replace toggleTheme with something like:
    ThemeService().setThemeMode(newMode); // Update ThemeService
    // Example: Replace StorageService().setTheme(bool) with:
    // StorageService().setThemeMode(newMode); // Persist selection
  }

  void _updateVolume(bool value) {
    if (mounted) {
      // Check mounted before setState
      setState(() => isVolumeOn = value);
    }
    StorageService().setVolume(value);
    AudioService().setVolume(value ? 1.0 : 0.0);
  }

  // Removed _addWord function

  void _addMultipleWords(String text) {
    if (text.isEmpty) return;
    final newWords =
        text
            .split(',')
            .map((w) => w.trim())
            .where((w) => w.isNotEmpty)
            .toList();

    if (mounted) {
      // Check mounted before setState
      setState(() {
        // Avoid adding duplicates already in the list
        customWords.addAll(
          newWords.where((word) => !customWords.contains(word)),
        );
        multiWordController.clear();
      });
    }
    // Save the updated list (consider saving only unique words)
    StorageService().setCustomWords(customWords.toSet().toList());
  }

  void _removeWord(String word) {
    if (mounted) {
      // Check mounted before setState
      setState(() => customWords.remove(word));
    }
    StorageService().setCustomWords(customWords);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text("Settings"),
        // Removed local shape, relies on theme
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, size: 36),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            // --- Theme Selection Card ---
            Card(
              // shape: RoundedRectangleBorder( // Inherits from theme
              //   borderRadius: BorderRadius.circular(16),
              // ),
              // elevation: 4, // Inherits from theme
              margin: const EdgeInsets.symmetric(vertical: 8),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 12.0,
                  horizontal: 16.0,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Appearance", // Section title
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      // Use Wrap for flexibility
                      spacing: 12.0, // Horizontal space between chips
                      runSpacing: 8.0, // Vertical space if chips wrap
                      alignment:
                          WrapAlignment.center, // Center chips horizontally
                      children: [
                        ChoiceChip(
                          label: const Text("Light"),
                          selected: _selectedThemeMode == ThemeMode.light,
                          onSelected: (selected) {
                            if (selected) _updateTheme(ThemeMode.light);
                          },
                          // Use theme defaults for styling
                          // showCheckmark: false, // Default is false
                        ),
                        ChoiceChip(
                          label: const Text("Dark"),
                          selected: _selectedThemeMode == ThemeMode.dark,
                          onSelected: (selected) {
                            if (selected) _updateTheme(ThemeMode.dark);
                          },
                        ),
                        ChoiceChip(
                          label: const Text("System"),
                          selected: _selectedThemeMode == ThemeMode.system,
                          onSelected: (selected) {
                            if (selected) _updateTheme(ThemeMode.system);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // --- Volume Card (Centered Content) ---
            Card(
              margin: const EdgeInsets.symmetric(vertical: 8),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 8.0,
                  horizontal: 16.0,
                ), // Adjust padding
                child: Row(
                  mainAxisAlignment:
                      MainAxisAlignment
                          .spaceBetween, // Space between label and switch
                  children: [
                    // Add some flexible space to push content towards center if needed,
                    // but spaceBetween usually looks better for ListTile-like rows.
                    // const Spacer(flex: 1),
                    Text(
                      "Game Sound",
                      style:
                          theme
                              .textTheme
                              .titleMedium, // Use appropriate text style
                    ),
                    // const SizedBox(width: 16), // Explicit spacing
                    Switch(value: isVolumeOn, onChanged: _updateVolume),
                    // const Spacer(flex: 1),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24), // Increased space before next section
            Text(
              "Custom Words",
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            // Single-word input Row REMOVED

            // --- Multi-word input ---
            Text(
              "Add words (comma separated)", // Simplified label
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: multiWordController,
              decoration: const InputDecoration(
                // Relies on theme now
                hintText: "e.g. apple, banana, cat, dog",
              ),
              minLines: 3,
              maxLines: 5,
            ),
            const SizedBox(height: 12), // Increased space
            ElevatedButton(
              onPressed:
                  () => _addMultipleWords(multiWordController.text.trim()),
              // Style removed, inherits theme (pill shape)
              // Make button full width for better tap target
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 45),
              ),
              child: const Text("Add Words"),
            ),

            const SizedBox(height: 24), // Increased space
            if (customWords.isNotEmpty) // Show title only if there are words
              Text(
                "Your Words",
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            const SizedBox(height: 8),

            // Word List
            // Wrap list in a Column if it's inside another ListView to avoid nesting issues
            // Or ensure the outer ListView is the only scrollable parent
            ...customWords.map(
              (word) => Card(
                // Use theme defaults for shape, elevation
                elevation: 2,
                margin: const EdgeInsets.symmetric(vertical: 6),
                child: ListTile(
                  title: Text(word),
                  trailing: IconButton(
                    icon: const Icon(
                      Icons.delete_outline,
                      color: Colors.redAccent,
                    ), // Outline icon
                    tooltip: "Remove '$word'",
                    onPressed: () => _removeWord(word),
                  ),
                  visualDensity:
                      VisualDensity.compact, // Make list items tighter
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
