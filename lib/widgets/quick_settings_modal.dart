import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guess_up/blocs/theme/theme_cubit.dart';
import 'package:guess_up/screens/onboarding_screen.dart';
import 'package:guess_up/screens/settings_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/bouncy_game_button.dart';

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
  final GameStorageService _storageService = GameStorageService();
  final GameAudioEngine _audioEngine = GameAudioEngine();

  late ThemeMode _selectedThemeMode;
  late bool _music;
  late bool _sfx;
  late bool _haptics;
  late String _tiltSensitivity;

  @override
  void initState() {
    super.initState();
    _selectedThemeMode = context.read<ThemeCubit>().state.themeMode;
    _music = _storageService.isMusicEnabled;
    _sfx = _storageService.isSfxEnabled;
    _haptics = _storageService.isHapticsEnabled;
    _tiltSensitivity = _storageService.tiltSensitivity;
  }

  void _updateTheme(ThemeMode newMode) {
    if (mounted) setState(() => _selectedThemeMode = newMode);
    context.read<ThemeCubit>().setThemeMode(newMode);
    _storageService.setThemeMode(newMode);
  }

  Future<void> _updateTiltSensitivity(String mode) async {
    if (mounted) setState(() => _tiltSensitivity = mode);
    await _storageService.setTiltSensitivity(mode);
    _audioEngine.extraLightImpact();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final surfaceColor = isDark ? const Color(0xFF1E1938) : Colors.white;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(
          top: BorderSide(
            color: isDark ? Colors.white.withAlpha(25) : Colors.black.withAlpha(20),
            width: 1.5,
          ),
        ),
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
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? Colors.white24 : Colors.black12,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Header Title Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.settings_suggest_rounded,
                      size: 22,
                      color: primaryColor,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      "QUICK SETTINGS",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
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

            // --- 1. Appearance Section ---
            _buildSectionTitle("APPEARANCE", textColor),
            Row(
              children: [
                Expanded(
                  child: _buildThemeButton(
                    ThemeMode.light,
                    "Light",
                    Icons.wb_sunny_rounded,
                    isDark,
                    primaryColor,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildThemeButton(
                    ThemeMode.dark,
                    "Dark",
                    Icons.nights_stay_rounded,
                    isDark,
                    primaryColor,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildThemeButton(
                    ThemeMode.system,
                    "System",
                    Icons.settings_brightness_rounded,
                    isDark,
                    primaryColor,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // --- 2. Audio & Haptics Section ---
            _buildSectionTitle("AUDIO & HAPTICS", textColor),
            Row(
              children: [
                Expanded(
                  child: _buildToggleButton(
                    "Music",
                    _music ? Icons.music_note_rounded : Icons.music_off_rounded,
                    _music,
                    () {
                      _audioEngine.extraLightImpact();
                      final val = !_music;
                      setState(() => _music = val);
                      _storageService.setMusicEnabled(val);
                      if (val) {
                        _audioEngine.startBgm();
                      } else {
                        _audioEngine.stopBgm();
                      }
                    },
                    primaryColor,
                    isDark,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildToggleButton(
                    "Sounds",
                    _sfx ? Icons.volume_up_rounded : Icons.volume_off_rounded,
                    _sfx,
                    () {
                      _audioEngine.extraLightImpact();
                      final val = !_sfx;
                      setState(() => _sfx = val);
                      _storageService.setSfxEnabled(val);
                      if (val) _audioEngine.playCorrectSfx();
                    },
                    primaryColor,
                    isDark,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildToggleButton(
                    "Haptics",
                    _haptics ? Icons.vibration_rounded : Icons.smartphone_rounded,
                    _haptics,
                    () {
                      _audioEngine.extraLightImpact();
                      final val = !_haptics;
                      setState(() => _haptics = val);
                      _storageService.setHapticsEnabled(val);
                      if (val) _audioEngine.mediumImpact();
                    },
                    primaryColor,
                    isDark,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // --- 3. Forehead Tilt Sensitivity Section ---
            _buildSectionTitle("TILT SENSITIVITY", textColor),
            Row(
              children: [
                Expanded(
                  child: _buildSensitivityButton(
                    'Low',
                    'Low',
                    Icons.screen_rotation_rounded,
                    isDark,
                    primaryColor,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSensitivityButton(
                    'Normal',
                    'Normal',
                    Icons.stay_current_portrait_rounded,
                    isDark,
                    primaryColor,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSensitivityButton(
                    'High',
                    'High',
                    Icons.bolt_rounded,
                    isDark,
                    primaryColor,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),

            // Quick Nav Action Buttons
            Row(
              children: [
                Expanded(
                  child: BouncyGameButton(
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        CupertinoPageRoute(
                          builder: (_) => const OnboardingScreen(isRevisiting: true),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF261F47) : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDark ? Colors.white24 : Colors.black12,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.help_outline_rounded, size: 18, color: textColor),
                          const SizedBox(width: 6),
                          Text(
                            "HOW TO PLAY",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: textColor,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: BouncyGameButton(
                    onTap: () {
                      Navigator.of(context).pop();
                      Navigator.of(context).push(
                        CupertinoPageRoute(
                          builder: (_) => const SettingsScreen(),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFFEA00), Color(0xFFFF9100)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white, width: 2),
                        boxShadow: const [
                          BoxShadow(color: Color(0xFF8E4800), offset: Offset(0, 3)),
                        ],
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.tune_rounded, size: 18, color: Colors.black),
                          SizedBox(width: 6),
                          Text(
                            "ALL SETTINGS",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: Colors.black,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0, left: 4.0),
      child: Text(
        title,
        style: TextStyle(
          color: color.withAlpha(150),
          fontWeight: FontWeight.w900,
          fontSize: 10,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildThemeButton(
    ThemeMode mode,
    String label,
    IconData icon,
    bool isDark,
    Color primaryColor,
  ) {
    final isSelected = _selectedThemeMode == mode;
    return BouncyGameButton(
      onTap: () => _updateTheme(mode),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? primaryColor
              : (isDark ? Colors.black.withAlpha(60) : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? Colors.white : Colors.transparent,
            width: isSelected ? 1.5 : 0,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.black : (isDark ? Colors.white70 : Colors.black54),
              size: 20,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 10,
                color: isSelected ? Colors.black : (isDark ? Colors.white70 : Colors.black54),
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
    bool isDark,
  ) {
    return BouncyGameButton(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isActive
              ? primaryColor
              : (isDark ? Colors.black.withAlpha(60) : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isActive ? Colors.white : Colors.transparent,
            width: isActive ? 1.5 : 0,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 22,
              color: isActive ? Colors.black : (isDark ? Colors.white38 : Colors.black38),
            ),
            const SizedBox(height: 4),
            Text(
              label.toUpperCase(),
              style: TextStyle(
                color: isActive ? Colors.black : (isDark ? Colors.white60 : Colors.black54),
                fontWeight: FontWeight.w900,
                fontSize: 10,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSensitivityButton(
    String mode,
    String label,
    IconData icon,
    bool isDark,
    Color primaryColor,
  ) {
    final isSelected = _tiltSensitivity == mode;
    return BouncyGameButton(
      onTap: () => _updateTiltSensitivity(mode),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? primaryColor
              : (isDark ? Colors.black.withAlpha(60) : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? Colors.white : Colors.transparent,
            width: isSelected ? 1.5 : 0,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.black : (isDark ? Colors.white70 : Colors.black54),
              size: 18,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 10,
                color: isSelected ? Colors.black : (isDark ? Colors.white70 : Colors.black54),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
