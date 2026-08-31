import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/constants/app_info.dart';
import 'package:guess_up/screens/privacy_policy_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/services/theme_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

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
  String _tiltSensitivity = 'Normal';

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
    final storage = StorageService();
    final currentThemeMode =
        Provider.of<ThemeService>(context, listen: false).themeMode;

    if (mounted) {
      setState(() {
        _selectedThemeMode = currentThemeMode;
        isMusicOn = storage.isMusicEnabled;
        isSfxOn = storage.isSfxEnabled;
        isHapticsOn = storage.isHapticsEnabled;
        _tiltSensitivity = storage.tiltSensitivity;
      });
    }
  }

  Future<void> _updateTiltSensitivity(String mode) async {
    if (mounted) setState(() => _tiltSensitivity = mode);
    await StorageService().setTiltSensitivity(mode);
    AudioService().extraLightImpact();
  }

  Future<void> _launchURL(String url) async {
    final uri = Uri.parse(url);
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      debugPrint("Could not launch $url: $e");
    }
  }

  void _updateTheme(ThemeMode newMode) {
    if (mounted) setState(() => _selectedThemeMode = newMode);
    Provider.of<ThemeService>(context, listen: false).setThemeMode(newMode);
    StorageService().setThemeMode(newMode);
  }

  Future<void> _toggleMusic() async {
    final newValue = !isMusicOn;
    if (mounted) setState(() => isMusicOn = newValue);
    final storage = StorageService();
    await storage.setMusicEnabled(newValue);
    await AudioService().toggleMusic(newValue);
  }

  Future<void> _toggleSfx() async {
    final newValue = !isSfxOn;
    if (mounted) setState(() => isSfxOn = newValue);
    final storage = StorageService();
    await storage.setSfxEnabled(newValue);
    if (newValue) AudioService().playCorrect();
  }

  Future<void> _toggleHaptics() async {
    final newValue = !isHapticsOn;
    if (mounted) setState(() => isHapticsOn = newValue);
    final storage = StorageService();
    await storage.setHapticsEnabled(newValue);
    if (newValue) AudioService().mediumImpact();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final accentColor =
        isDark ? AppTheme.darkAccentColor : AppTheme.lightAccentColor;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;

    const String alexMorganUrl =
        "https://pixabay.com/users/alex-morgan-54692529/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=573931";
    const String pixabayUrl =
        "https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=573931";

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
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
      body: AmbientBackground(
        ambientColor: primaryColor,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          children: [
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
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildThemeButton(
                    ThemeMode.dark,
                    "Dark",
                    Icons.nights_stay_rounded,
                    isDark,
                  ),
                ),
                const SizedBox(width: 8),
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

            const SizedBox(height: 28),
            Divider(color: textColor.withAlpha(25), height: 1),
            const SizedBox(height: 24),

            // --- 2. Controls Section ---
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
                const SizedBox(width: 10),
                Expanded(
                  child: _buildToggleButton(
                    "Sounds",
                    isSfxOn
                        ? Icons.volume_up_rounded
                        : Icons.volume_off_rounded,
                    isSfxOn,
                    _toggleSfx,
                    primaryColor,
                    accentColor,
                    isDark,
                  ),
                ),
                const SizedBox(width: 10),
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

            const SizedBox(height: 28),
            Divider(color: textColor.withAlpha(25), height: 1),
            const SizedBox(height: 24),

            // --- 3. Tilt Sensitivity Section ---
            _buildSectionTitle("FOREHEAD TILT SENSITIVITY", textColor),
            Row(
              children: [
                Expanded(
                  child: _buildSensitivityButton(
                    'Low',
                    'Low',
                    Icons.screen_rotation_rounded,
                    isDark,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSensitivityButton(
                    'Normal',
                    'Normal',
                    Icons.stay_current_portrait_rounded,
                    isDark,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSensitivityButton(
                    'High',
                    'High',
                    Icons.bolt_rounded,
                    isDark,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 28),
            Divider(color: textColor.withAlpha(25), height: 1),
            const SizedBox(height: 24),

            // --- 4. Legal & Privacy Section ---
            _buildSectionTitle("LEGAL & PRIVACY", textColor),
            InkWell(
              onTap: () {
                AudioService().lightImpact();
                Navigator.of(context).push(
                  CupertinoPageRoute(
                    builder: (_) => const PrivacyPolicyScreen(),
                  ),
                );
              },
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 4,
                  vertical: 10,
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: primaryColor.withAlpha(40),
                        borderRadius: BorderRadius.circular(14), // Squircle
                      ),
                      child: Icon(
                        Icons.shield_outlined,
                        color: primaryColor,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Privacy Policy",
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                              color: textColor,
                              letterSpacing: 0.3,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            "Read how your data and privacy are protected",
                            style: TextStyle(
                              fontSize: 12,
                              color: textColor.withAlpha(140),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      color: textColor.withAlpha(120),
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 28),
            Divider(color: textColor.withAlpha(25), height: 1),
            const SizedBox(height: 24),

            // --- 5. About & Credits Section (Unboxed / No Card Container) ---
            _buildSectionTitle("ABOUT & CREDITS", textColor),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Column(
                children: [
                  // App Logo (Squircle Shape!)
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                      borderRadius: BorderRadius.circular(
                        22,
                      ), // Squircle shape!
                      border: Border.all(
                        color: primaryColor.withAlpha(140),
                        width: 2.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: primaryColor.withAlpha(60),
                          blurRadius: 18,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Image.asset(
                        'assets/images/logo-transparent.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  Text(
                    AppInfo.name.toUpperCase(),
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.5,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Version Pill Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: primaryColor.withAlpha(35),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: primaryColor.withAlpha(80)),
                    ),
                    child: Text(
                      "v${AppInfo.displayVersion} • PARTY CHARADES",
                      style: TextStyle(
                        color: primaryColor,
                        fontWeight: FontWeight.w900,
                        fontSize: 11,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  Text(
                    AppInfo.description,
                    softWrap: true,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: textColor.withAlpha(200),
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 18),

                  // Audio credits
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.music_note_rounded,
                        color: primaryColor,
                        size: 18,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        "Audio & Music Credits",
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: textColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: textColor.withAlpha(180),
                      ),
                      children: [
                        const TextSpan(text: "Music by "),
                        TextSpan(
                          text: "Alex Morgan",
                          style: TextStyle(
                            color: primaryColor,
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                          recognizer:
                              TapGestureRecognizer()
                                ..onTap = () => _launchURL(alexMorganUrl),
                        ),
                        const TextSpan(text: " from "),
                        TextSpan(
                          text: "Pixabay",
                          style: TextStyle(
                            color: primaryColor,
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                          recognizer:
                              TapGestureRecognizer()
                                ..onTap = () => _launchURL(pixabayUrl),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            // Copyright Footer
            Text(
              "© ${DateTime.now().year} Guess Up / Shrey Nagda\nAll rights reserved.",
              style: theme.textTheme.bodySmall?.copyWith(
                color: textColor.withAlpha(110),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
          ],
        ),
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
                fontSize: 12,
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

  Widget _buildSensitivityButton(
    String mode,
    String label,
    IconData icon,
    bool isDark,
  ) {
    final isSelected = _tiltSensitivity == mode;
    final inactiveColor =
        isDark
            ? AppTheme.darkTextColor.withAlpha(125)
            : AppTheme.lightAccentColor.withAlpha(100);
    return InkWell(
      onTap: () => _updateTiltSensitivity(mode),
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
              size: 22,
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
}
