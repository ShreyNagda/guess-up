import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:guess_up/screens/onboarding_screen.dart';
import 'package:guess_up/screens/settings_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';

class QuickSettingsModal extends StatefulWidget {
  const QuickSettingsModal({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => const QuickSettingsModal(),
    );
  }

  @override
  State<QuickSettingsModal> createState() => _QuickSettingsModalState();
}

class _QuickSettingsModalState extends State<QuickSettingsModal> {
  final StorageService _storageService = StorageService();
  final AudioService _audioService = AudioService();

  late bool _music;
  late bool _sfx;
  late bool _haptics;

  @override
  void initState() {
    super.initState();
    _music = _storageService.isMusicEnabled;
    _sfx = _storageService.isSfxEnabled;
    _haptics = _storageService.isHapticsEnabled;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final surfaceColor =
        isDark ? const Color(0xFF1E1E22) : Colors.white;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;
    final borderColor =
        isDark ? Colors.white.withAlpha(25) : Colors.black.withAlpha(20);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: borderColor, width: 1.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 90 : 30),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.dividerColor.withAlpha(100),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.tune_rounded,
                      size: 24,
                      color: primaryColor,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      "Quick Settings",
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: textColor,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: Icon(Icons.close_rounded, color: textColor.withAlpha(180)),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Music Toggle
            _buildSettingRow(
              theme: theme,
              isDark: isDark,
              primaryColor: primaryColor,
              textColor: textColor,
              icon: Icons.music_note_rounded,
              title: "Background Music",
              value: _music,
              onChanged: (val) {
                _audioService.extraLightImpact();
                setState(() => _music = val);
                _storageService.setMusicEnabled(val);
                if (val) {
                  _audioService.playBackgroundMusic();
                } else {
                  _audioService.stopBackgroundMusic();
                }
              },
            ),

            // Sound Effects Toggle
            _buildSettingRow(
              theme: theme,
              isDark: isDark,
              primaryColor: primaryColor,
              textColor: textColor,
              icon: Icons.volume_up_rounded,
              title: "Sound Effects",
              value: _sfx,
              onChanged: (val) {
                _audioService.extraLightImpact();
                setState(() => _sfx = val);
                _storageService.setSfxEnabled(val);
              },
            ),

            // Haptics Toggle
            _buildSettingRow(
              theme: theme,
              isDark: isDark,
              primaryColor: primaryColor,
              textColor: textColor,
              icon: Icons.vibration_rounded,
              title: "Haptic Feedback",
              value: _haptics,
              onChanged: (val) {
                _audioService.extraLightImpact();
                setState(() => _haptics = val);
                _storageService.setHapticsEnabled(val);
              },
            ),

            const SizedBox(height: 18),

            // Quick Nav Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        CupertinoPageRoute(
                          builder:
                              (_) => const OnboardingScreen(isRevisiting: true),
                        ),
                      );
                    },
                    icon: Icon(
                      Icons.help_outline_rounded,
                      size: 18,
                      color: textColor,
                    ),
                    label: Text(
                      "How to Play",
                      style: TextStyle(
                        color: textColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: borderColor, width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        CupertinoPageRoute(
                          builder: (_) => const SettingsScreen(),
                        ),
                      );
                    },
                    icon: Icon(
                      Icons.settings_suggest_rounded,
                      size: 18,
                      color: isDark ? Colors.black : Colors.white,
                    ),
                    label: Text(
                      "All Settings",
                      style: TextStyle(
                        color: isDark ? Colors.black : Colors.white,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingRow({
    required ThemeData theme,
    required bool isDark,
    required Color primaryColor,
    required Color textColor,
    required IconData icon,
    required String title,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    final rowBg = isDark
        ? const Color(0xFF26262C)
        : const Color(0xFFF3F4F6);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: rowBg,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(icon, color: primaryColor, size: 22),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: TextStyle(
                    color: textColor,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            CupertinoSwitch(
              value: value,
              activeTrackColor: primaryColor,
              onChanged: onChanged,
            ),
          ],
        ),
      ),
    );
  }
}
