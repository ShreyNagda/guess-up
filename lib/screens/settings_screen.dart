import 'package:flutter/material.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/services/theme_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool isDarkTheme = false;
  bool isVolumeOn = true;
  List<String> customWords = [];

  final TextEditingController wordController = TextEditingController();
  final TextEditingController multiWordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final theme = await StorageService().getTheme();
    final volume = await StorageService().getVolume();
    final words = await StorageService().getCustomWords();
    setState(() {
      isDarkTheme = theme;
      isVolumeOn = volume;
      customWords = words;
    });
  }

  void _updateTheme(bool value) {
    setState(() => isDarkTheme = value); // local switch
    ThemeService().toggleTheme(value); // notify MaterialApp
  }

  void _updateVolume(bool value) {
    setState(() => isVolumeOn = value);
    StorageService().setVolume(value);
    AudioService().setVolume(value ? 1.0 : 0.0);
  }

  void _addWord(String word) {
    if (word.isEmpty) return;
    setState(() {
      customWords.add(word);
      wordController.clear();
    });
    StorageService().setCustomWords(customWords);
  }

  void _addMultipleWords(String text) {
    if (text.isEmpty) return;
    final newWords =
        text
            .split(',')
            .map((w) => w.trim())
            .where((w) => w.isNotEmpty)
            .toList();
    setState(() {
      customWords.addAll(newWords);
      multiWordController.clear();
    });
    StorageService().addCustomWords(newWords);
  }

  void _removeWord(String word) {
    setState(() => customWords.remove(word));
    StorageService().setCustomWords(customWords);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text("Settings"),
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
        ),
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, size: 36),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            // Theme Card
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
              margin: const EdgeInsets.symmetric(vertical: 8),
              child: ListTile(
                title: const Text("Dark Theme"),
                trailing: Switch(value: isDarkTheme, onChanged: _updateTheme),
              ),
            ),

            // Volume Card
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              elevation: 4,
              margin: const EdgeInsets.symmetric(vertical: 8),
              child: ListTile(
                title: const Text("Game Sound"),
                trailing: Switch(value: isVolumeOn, onChanged: _updateVolume),
              ),
            ),

            const SizedBox(height: 16),
            Text(
              "Custom Words",
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            // Single-word input
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: wordController,
                    decoration: InputDecoration(
                      hintText: "Add a new word",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () => _addWord(wordController.text.trim()),
                  child: const Text("Add"),
                ),
              ],
            ),

            const SizedBox(height: 16),
            // Multi-word input
            Text(
              "Add Multiple Words (comma separated)",
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: multiWordController,
              decoration: InputDecoration(
                hintText: "e.g. apple, banana, cat, dog",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 12,
                ),
              ),
              minLines: 3,
              maxLines: 5,
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed:
                  () => _addMultipleWords(multiWordController.text.trim()),
              child: const Text("Add Multiple Words"),
            ),

            const SizedBox(height: 16),
            // Word List
            ...customWords.map(
              (word) => Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
                margin: const EdgeInsets.symmetric(vertical: 6),
                child: ListTile(
                  title: Text(word),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete, color: Colors.redAccent),
                    onPressed: () => _removeWord(word),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
