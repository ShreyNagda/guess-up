import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/services/theme_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:provider/provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  ThemeMode _selectedThemeMode = ThemeMode.system;
  bool isMusicOn = true;
  bool isSfxOn = true;
  bool isHapticsOn = true;
  List<String> customWords = [];
  final TextEditingController multiWordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _setPortraitOnly();
    _loadSettings();
  }

  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  Future<void> _loadSettings() async {
    // Access the singleton directly for consistency with AudioService usage
    final storage = StorageService();
    final currentThemeMode =
        Provider.of<ThemeService>(context, listen: false).themeMode;
    final words = storage.getCustomWords();

    if (mounted) {
      setState(() {
        _selectedThemeMode = currentThemeMode;
        // Use specific getters from StorageService
        isMusicOn = storage.isMusicEnabled;
        isSfxOn = storage.isSfxEnabled;
        isHapticsOn = storage.isHapticsEnabled;
        customWords = words;
      });
    }
  }

  void _updateTheme(ThemeMode newMode) {
    if (mounted) setState(() => _selectedThemeMode = newMode);
    Provider.of<ThemeService>(context, listen: false).setThemeMode(newMode);
    // Update StorageService singleton directly
    StorageService().setThemeMode(newMode);
  }

  Future<void> _toggleMusic() async {
    final newValue = !isMusicOn;
    if (mounted) setState(() => isMusicOn = newValue);

    final storage = StorageService();
    await storage.setMusicEnabled(newValue); // Use specific method
    await AudioService().toggleMusic(newValue);
  }

  Future<void> _toggleSfx() async {
    final newValue = !isSfxOn;
    if (mounted) setState(() => isSfxOn = newValue);

    final storage = StorageService();
    await storage.setSfxEnabled(newValue); // Use specific method
    if (newValue) {
      AudioService().playCorrect(); // Play a sound to confirm it works
    }
  }

  Future<void> _toggleHaptics() async {
    final newValue = !isHapticsOn;
    if (mounted) setState(() => isHapticsOn = newValue);

    final storage = StorageService();
    await storage.setHapticsEnabled(newValue);
    if (newValue) AudioService().mediumImpact();
  }

  void _addMultipleWords(String text) {
    if (text.isEmpty) return;
    final newWords =
        text
            .split(',')
            .map((w) => w.trim())
            .where((w) => w.isNotEmpty)
            .toList();

    if (mounted) {
      setState(() {
        customWords.addAll(
          newWords.where((word) => !customWords.contains(word)),
        );
        multiWordController.clear();
      });
    }
    StorageService().setCustomWords(customWords.toSet().toList());
  }

  void _removeWord(String word) {
    if (mounted) setState(() => customWords.remove(word));
    StorageService().setCustomWords(customWords);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Consistent Theme Colors
    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final accentColor =
        isDark ? AppTheme.darkAccentColor : AppTheme.lightAccentColor;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;
    final borderColor =
        isDark ? primaryColor.withAlpha(77) : accentColor.withAlpha(26);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          "SETTINGS",
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w900,
            letterSpacing: 2,
            color: textColor,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          // --- 1. Appearance Section ---
          _buildSectionTitle("APPEARANCE", textColor),
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              border: Border.all(color: borderColor, width: 2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildThemeButton(
                    ThemeMode.light,
                    "Light",
                    Icons.wb_sunny_rounded,
                    isDark,
                  ),
                ),
                Expanded(
                  child: _buildThemeButton(
                    ThemeMode.dark,
                    "Dark",
                    Icons.nights_stay_rounded,
                    isDark,
                  ),
                ),
                Expanded(
                  child: _buildThemeButton(
                    ThemeMode.system,
                    "System",
                    Icons.settings_brightness_rounded,
                    isDark,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),

          // --- 2. Controls Section (Music, SFX, Haptics) ---
          _buildSectionTitle("CONTROLS", textColor),
          Row(
            children: [
              Expanded(
                child: _buildToggleButton(
                  "Music",
                  isMusicOn
                      ? Icons.music_note_rounded
                      : Icons.music_off_rounded,
                  isMusicOn,
                  _toggleMusic,
                  primaryColor,
                  accentColor,
                  isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildToggleButton(
                  "Sounds",
                  isSfxOn ? Icons.volume_up_rounded : Icons.volume_off_rounded,
                  isSfxOn,
                  _toggleSfx,
                  primaryColor,
                  accentColor,
                  isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildToggleButton(
                  "Haptics",
                  isHapticsOn
                      ? Icons.vibration_rounded
                      : Icons.smartphone_rounded,
                  isHapticsOn,
                  _toggleHaptics,
                  primaryColor,
                  accentColor,
                  isDark,
                ),
              ),
            ],
          ),

          const SizedBox(height: 32),

          // --- 3. Custom Words Section ---
          _buildSectionTitle("CUSTOM WORDS", textColor),

          // Input Field
          Container(
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: borderColor, width: 2),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: TextField(
              controller: multiWordController,
              style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
              decoration: InputDecoration(
                border: InputBorder.none,
                hintText: "Add words (comma separated)...",
                hintStyle: TextStyle(color: textColor.withAlpha(100)),
              ),
              minLines: 1,
              maxLines: 3,
            ),
          ),

          const SizedBox(height: 12),

          // Add Button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed:
                  () => _addMultipleWords(multiWordController.text.trim()),
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor:
                    isDark ? accentColor : Colors.white, // Text color
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                "ADD WORDS",
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1,
                  color:
                      isDark
                          ? AppTheme.darkAccentColor
                          : AppTheme.lightAccentColor,
                ),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Words List
          if (customWords.isNotEmpty) ...[
            Text(
              "${customWords.length} WORDS ADDED",
              style: theme.textTheme.labelSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: textColor.withAlpha(125),
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children:
                  customWords.map((word) {
                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color:
                            isDark
                                ? AppTheme.darkSurfaceColor
                                : AppTheme.lightScaffoldBackground,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: borderColor),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            word,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(width: 8),
                          InkWell(
                            onTap: () => _removeWord(word),
                            child: Icon(
                              Icons.close_rounded,
                              size: 16,
                              color: Colors.redAccent.withAlpha(200),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
            ),
          ],

          const SizedBox(height: 40), // Bottom padding
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0, left: 4.0),
      child: Text(
        title,
        style: TextStyle(
          color: color.withAlpha(150),
          fontWeight: FontWeight.w900,
          fontSize: 12,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildThemeButton(
    ThemeMode mode,
    String label,
    IconData icon,
    bool isDark,
  ) {
    final isSelected = _selectedThemeMode == mode;
    final inactiveColor =
        isDark
            ? AppTheme.darkTextColor.withAlpha(125)
            : AppTheme.lightAccentColor.withAlpha(100);

    return InkWell(
      onTap: () => _updateTheme(mode),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color:
              isSelected
                  ? (isDark
                      ? AppTheme.darkPrimaryColor
                      : AppTheme.lightPrimaryColor)
                  : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color:
                  isSelected
                      ? (isDark
                          ? AppTheme.darkAccentColor
                          : AppTheme.lightAccentColor)
                      : inactiveColor,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color:
                    isSelected
                        ? (isDark
                            ? AppTheme.darkAccentColor
                            : AppTheme.lightAccentColor)
                        : inactiveColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildToggleButton(
    String label,
    IconData icon,
    bool isActive,
    VoidCallback onTap,
    Color primaryColor,
    Color accentColor,
    bool isDark,
  ) {
    // Active State: Filled with Primary Color (Yellow/Amber)
    // Inactive State: Outline with faint border

    final bgColor =
        isActive
            ? primaryColor
            : (isDark ? AppTheme.darkSurfaceColor : Colors.white);

    final iconColor =
        isActive
            ? (isDark ? AppTheme.darkAccentColor : AppTheme.lightAccentColor)
            : (isDark
                ? AppTheme.darkTextColor.withAlpha(75)
                : AppTheme.lightAccentColor.withAlpha(75));

    final borderColor =
        isActive
            ? Colors.transparent
            : (isDark ? primaryColor.withAlpha(50) : accentColor.withAlpha(25));

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: borderColor, width: 2),
          boxShadow:
              isActive
                  ? [
                    BoxShadow(
                      color: primaryColor.withAlpha(75),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                  : [],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: iconColor),
            const SizedBox(height: 8),
            Text(
              label.toUpperCase(),
              style: TextStyle(
                color: iconColor,
                fontWeight: FontWeight.w900,
                fontSize: 12, // Slightly smaller to fit 3 buttons
                letterSpacing: 1,
              ),
            ),
            Text(
              isActive ? "ON" : "OFF",
              style: TextStyle(
                color: iconColor.withAlpha(150),
                fontWeight: FontWeight.w700,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
