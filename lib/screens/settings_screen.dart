import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guess_up/blocs/theme/theme_cubit.dart';
import 'package:guess_up/constants/app_info.dart';
import 'package:guess_up/screens/onboarding_screen.dart';
import 'package:guess_up/screens/privacy_policy_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:guess_up/widgets/bouncy_game_button.dart';
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
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  }

  Future<void> _loadSettings() async {
    final storage = GameStorageService();
    final currentThemeMode = context.read<ThemeCubit>().state.themeMode;

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
    await GameStorageService().setTiltSensitivity(mode);
    GameAudioEngine().extraLightImpact();
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
    context.read<ThemeCubit>().setThemeMode(newMode);
    GameStorageService().setThemeMode(newMode);
  }

  Future<void> _toggleMusic() async {
    final newValue = !isMusicOn;
    if (mounted) setState(() => isMusicOn = newValue);
    final storage = GameStorageService();
    await storage.setMusicEnabled(newValue);
    if (newValue) {
      GameAudioEngine().startBgm();
    } else {
      GameAudioEngine().stopBgm();
    }
  }

  Future<void> _toggleSfx() async {
    final newValue = !isSfxOn;
    if (mounted) setState(() => isSfxOn = newValue);
    final storage = GameStorageService();
    await storage.setSfxEnabled(newValue);
    if (newValue) GameAudioEngine().playCorrectSfx();
  }

  Future<void> _toggleHaptics() async {
    final newValue = !isHapticsOn;
    if (mounted) setState(() => isHapticsOn = newValue);
    final storage = GameStorageService();
    await storage.setHapticsEnabled(newValue);
    if (newValue) GameAudioEngine().mediumImpact();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;

    const String alexMorganUrl =
        "https://pixabay.com/users/alex-morgan-54692529/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=573931";
    const String pixabayUrl =
        "https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=573931";

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: BouncyGameButton(
          onTap: () => Navigator.of(context).pop(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF261F47) : Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: isDark ? Colors.white24 : Colors.black12,
              ),
            ),
            child: Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 18,
              color: textColor,
            ),
          ),
        ),
        title: Text(
          "SETTINGS",
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w900,
            letterSpacing: 2.5,
            color: textColor,
          ),
        ),
        centerTitle: true,
      ),
      body: AmbientBackground(
        ambientColor: primaryColor,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          physics: const BouncingScrollPhysics(),
          children: [
            // --- 1. Appearance Section ---
            _buildSectionTitle("APPEARANCE", textColor),
            _build3DCardContainer(
              isDark: isDark,
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
            ),

            const SizedBox(height: 20),

            // --- 2. Controls Section ---
            _buildSectionTitle("AUDIO & HAPTICS", textColor),
            _build3DCardContainer(
              isDark: isDark,
              child: Row(
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
                      isDark,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // --- 3. Tilt Sensitivity Section ---
            _buildSectionTitle("FOREHEAD TILT SENSITIVITY", textColor),
            _build3DCardContainer(
              isDark: isDark,
              child: Row(
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
            ),

            const SizedBox(height: 20),

            // --- 4. Tutorial & Help Section ---
            _buildSectionTitle("TUTORIAL & HELP", textColor),
            _build3DCardContainer(
              isDark: isDark,
              child: InkWell(
                onTap: () {
                  GameAudioEngine().lightImpact();
                  Navigator.of(context).push(
                    CupertinoPageRoute(
                      builder:
                          (_) => const OnboardingScreen(isRevisiting: true),
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 4,
                    vertical: 4,
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: primaryColor.withAlpha(40),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: primaryColor.withAlpha(100),
                          ),
                        ),
                        child: Icon(
                          Icons.help_outline_rounded,
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
                              "How to Play",
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 16,
                                color: textColor,
                                letterSpacing: 0.3,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              "View game rules and tilt controls tutorial",
                              style: TextStyle(
                                fontSize: 12,
                                color: textColor.withAlpha(160),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios_rounded,
                        color: textColor.withAlpha(140),
                        size: 16,
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),
            _buildSectionTitle("LEGAL & PRIVACY", textColor),
            _build3DCardContainer(
              isDark: isDark,
              child: InkWell(
                onTap: () {
                  GameAudioEngine().lightImpact();
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
                    vertical: 4,
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: primaryColor.withAlpha(40),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: primaryColor.withAlpha(100),
                          ),
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
                              "Read how your privacy is protected",
                              style: TextStyle(
                                fontSize: 12,
                                color: textColor.withAlpha(160),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.arrow_forward_ios_rounded,
                        color: textColor.withAlpha(140),
                        size: 16,
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            // --- 5. About & Credits Section ---
            _buildSectionTitle("ABOUT & CREDITS", textColor),
            _build3DCardContainer(
              isDark: isDark,
              child: Column(
                children: [
                  // App Logo Emblem
                  Container(
                    height: 80,
                    width: 80,
                    clipBehavior: Clip.hardEdge,
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF141026) : Colors.white,
                      borderRadius: BorderRadius.circular(22),
                      // border: Border.all(color: primaryColor, width: 2.5),
                      boxShadow: [
                        BoxShadow(
                          color: primaryColor.withAlpha(60),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Image.asset('assets/images/guessup-icon.png'),
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
                  const SizedBox(height: 6),

                  // Version Pill Badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: primaryColor.withAlpha(35),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: primaryColor.withAlpha(100)),
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
                  const SizedBox(height: 16),
                  Divider(color: textColor.withAlpha(20)),
                  const SizedBox(height: 12),

                  // Audio & Music Credits
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
                          fontWeight: FontWeight.w900,
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

            const SizedBox(height: 24),

            // Copyright Footer
            Text(
              "© ${DateTime.now().year} Guess Up / Shrey Nagda\nAll rights reserved.",
              style: theme.textTheme.bodySmall?.copyWith(
                color: textColor.withAlpha(120),
                height: 1.3,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _build3DCardContainer({required bool isDark, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1938) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color:
              isDark ? Colors.white.withAlpha(25) : Colors.black.withAlpha(15),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color:
                isDark ? const Color(0xFF0C091A) : Colors.black.withAlpha(20),
            offset: const Offset(0, 5),
            blurRadius: 0,
          ),
        ],
      ),
      child: child,
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 6.0),
      child: Text(
        title,
        style: TextStyle(
          color: color.withAlpha(160),
          fontWeight: FontWeight.w900,
          fontSize: 11,
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
    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;

    return BouncyGameButton(
      onTap: () => _updateTheme(mode),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color:
              isSelected
                  ? primaryColor
                  : (isDark
                      ? Colors.black.withAlpha(60)
                      : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? Colors.white : Colors.transparent,
            width: isSelected ? 1.5 : 0,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color:
                  isSelected
                      ? Colors.black
                      : (isDark ? Colors.white70 : Colors.black54),
              size: 22,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 11,
                color:
                    isSelected
                        ? Colors.black
                        : (isDark ? Colors.white70 : Colors.black54),
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
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color:
              isActive
                  ? primaryColor
                  : (isDark
                      ? Colors.black.withAlpha(60)
                      : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isActive ? Colors.white : Colors.transparent,
            width: isActive ? 1.5 : 0,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 26,
              color:
                  isActive
                      ? Colors.black
                      : (isDark ? Colors.white38 : Colors.black38),
            ),
            const SizedBox(height: 6),
            Text(
              label.toUpperCase(),
              style: TextStyle(
                color:
                    isActive
                        ? Colors.black
                        : (isDark ? Colors.white60 : Colors.black54),
                fontWeight: FontWeight.w900,
                fontSize: 11,
                letterSpacing: 0.8,
              ),
            ),
            Text(
              isActive ? "ON" : "OFF",
              style: TextStyle(
                color:
                    isActive
                        ? Colors.black54
                        : (isDark ? Colors.white38 : Colors.black38),
                fontWeight: FontWeight.w900,
                fontSize: 9,
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
    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;

    return BouncyGameButton(
      onTap: () => _updateTiltSensitivity(mode),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color:
              isSelected
                  ? primaryColor
                  : (isDark
                      ? Colors.black.withAlpha(60)
                      : Colors.grey.shade100),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? Colors.white : Colors.transparent,
            width: isSelected ? 1.5 : 0,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color:
                  isSelected
                      ? Colors.black
                      : (isDark ? Colors.white70 : Colors.black54),
              size: 20,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 11,
                color:
                    isSelected
                        ? Colors.black
                        : (isDark ? Colors.white70 : Colors.black54),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
