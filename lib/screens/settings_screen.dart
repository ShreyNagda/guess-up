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
  String _controlMode = 'tilt';
  bool _isInvertedControls = false;

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

  void _loadSettings() {
    final storage = GameStorageService();
    final currentThemeMode = context.read<ThemeCubit>().state.themeMode;

    if (mounted) {
      setState(() {
        _selectedThemeMode = currentThemeMode;
        isMusicOn = storage.isMusicEnabled;
        isSfxOn = storage.isSfxEnabled;
        isHapticsOn = storage.isHapticsEnabled;
        _tiltSensitivity = storage.tiltSensitivity;
        _controlMode = storage.controlMode;
        _isInvertedControls = storage.isInvertedControls;
      });
    }
  }

  Future<void> _updateInvertedControls(bool val) async {
    if (mounted) setState(() => _isInvertedControls = val);
    await GameStorageService().setInvertedControls(val);
    GameAudioEngine().extraLightImpact();
  }

  Future<void> _updateControlMode(String mode) async {
    if (mode == 'tilt' && !GameStorageService().isAccelerometerSupported) {
      return;
    }
    if (mounted) setState(() => _controlMode = mode);
    await GameStorageService().setControlMode(mode);
    GameAudioEngine().extraLightImpact();
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
    GameAudioEngine().extraLightImpact();
  }

  Future<void> _toggleMusic() async {
    final newValue = !isMusicOn;
    if (mounted) setState(() => isMusicOn = newValue);
    final storage = GameStorageService();
    await storage.setMusicEnabled(newValue);
    if (newValue) {
      await GameAudioEngine().startBgm();
    } else {
      await GameAudioEngine().stopBgm();
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
    final accentColor =
        isDark ? AppTheme.darkAccentColor : AppTheme.lightAccentColor;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;
    final borderColor =
        isDark ? primaryColor.withAlpha(77) : accentColor.withAlpha(26);

    const String alexMorganUrl =
        "https://pixabay.com/users/alex-morgan-54692529/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=573931";
    const String pixabayUrl =
        "https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=573931";

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(CupertinoIcons.chevron_back),
          onPressed: () {
            GameAudioEngine().lightImpact();
            Navigator.of(context).pop();
          },
        ),
        title: Text(
          "SETTINGS",
          style: TextStyle(
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
            fontSize: 20,
            color: textColor,
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: AmbientBackground(
        ambientColor: primaryColor,
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            children: [
              // --- 1. Theme Section ---
              _buildSectionTitle("THEME", textColor),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                  border: Border.all(color: borderColor, width: 1.5),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _buildThemeButton(
                        ThemeMode.light,
                        "Light",
                        CupertinoIcons.sun_max_fill,
                        isDark,
                      ),
                    ),
                    Expanded(
                      child: _buildThemeButton(
                        ThemeMode.dark,
                        "Dark",
                        CupertinoIcons.moon_stars_fill,
                        isDark,
                      ),
                    ),
                    Expanded(
                      child: _buildThemeButton(
                        ThemeMode.system,
                        "System",
                        CupertinoIcons.device_desktop,
                        isDark,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // --- 2. Controls Section ---
              _buildSectionTitle("CONTROLS", textColor),
              Row(
                children: [
                  Expanded(
                    child: _buildToggleButton(
                      "Music",
                      isMusicOn
                          ? CupertinoIcons.music_note
                          : CupertinoIcons.speaker_slash_fill,
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
                          ? CupertinoIcons.volume_up
                          : CupertinoIcons.volume_off,
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
                          ? CupertinoIcons.device_phone_portrait
                          : CupertinoIcons.device_phone_portrait,
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

              // --- 3. Gameplay & Motion Section ---
              _buildSectionTitle("GAMEPLAY & MOTION", textColor),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor, width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Control Mode Row
                    Row(
                      children: [
                        Icon(
                          CupertinoIcons.hand_point_right_fill,
                          color: primaryColor,
                          size: 22,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          "Control Mode",
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: textColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children:
                          [
                            {'id': 'tilt', 'label': 'Tilt (Motion)'},
                            {'id': 'tap', 'label': 'Tap (Touch)'},
                          ].map((item) {
                            final isSelected = _controlMode == item['id'];
                            final isSupported =
                                item['id'] != 'tilt' ||
                                GameStorageService().isAccelerometerSupported;
                            return Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4.0,
                                ),
                                child: InkWell(
                                  onTap:
                                      isSupported
                                          ? () =>
                                              _updateControlMode(item['id']!)
                                          : null,
                                  borderRadius: BorderRadius.circular(10),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 150),
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 10,
                                    ),
                                    decoration: BoxDecoration(
                                      color:
                                          isSelected
                                              ? primaryColor
                                              : (isDark
                                                  ? Colors.white.withAlpha(15)
                                                  : Colors.black.withAlpha(10)),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Center(
                                      child: Text(
                                        isSupported
                                            ? item['label']!
                                            : "${item['label']} (N/A)",
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w900,
                                          color:
                                              !isSupported
                                                  ? textColor.withAlpha(70)
                                                  : (isSelected
                                                      ? Colors.black
                                                      : textColor.withAlpha(
                                                        180,
                                                      )),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                    ),
                    if (_controlMode == 'tilt') ...[
                      const SizedBox(height: 16),
                      const Divider(height: 1),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Icon(
                            CupertinoIcons.device_phone_landscape,
                            color: primaryColor,
                            size: 22,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            "Tilt Sensitivity",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children:
                            ['Low', 'Normal', 'High'].map((mode) {
                              final isSelected =
                                  _tiltSensitivity.toLowerCase() ==
                                  mode.toLowerCase();
                              return Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 4.0,
                                  ),
                                  child: InkWell(
                                    onTap: () => _updateTiltSensitivity(mode),
                                    borderRadius: BorderRadius.circular(10),
                                    child: AnimatedContainer(
                                      duration: const Duration(
                                        milliseconds: 150,
                                      ),
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 8,
                                      ),
                                      decoration: BoxDecoration(
                                        color:
                                            isSelected
                                                ? primaryColor
                                                : (isDark
                                                    ? Colors.white.withAlpha(15)
                                                    : Colors.black.withAlpha(
                                                      10,
                                                    )),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Center(
                                        child: Text(
                                          mode,
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w900,
                                            color:
                                                isSelected
                                                    ? Colors.black
                                                    : textColor.withAlpha(180),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                      ),
                    ],
                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    const SizedBox(height: 12),
                    // Invert Controls Switch
                    Row(
                      children: [
                        Icon(
                          CupertinoIcons.arrow_2_squarepath,
                          color: primaryColor,
                          size: 22,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Invert Controls",
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: textColor,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _controlMode == 'tap'
                                    ? (_isInvertedControls
                                        ? "Left = Correct 🟢, Right = Pass 🔴"
                                        : "Right = Correct 🟢, Left = Pass 🔴")
                                    : (_isInvertedControls
                                        ? "Tilt Up = Correct 🟢, Tilt Down = Pass 🔴"
                                        : "Tilt Down = Correct 🟢, Tilt Up = Pass 🔴"),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: textColor.withAlpha(160),
                                ),
                              ),
                            ],
                          ),
                        ),
                        CupertinoSwitch(
                          value: _isInvertedControls,
                          activeTrackColor: primaryColor,
                          onChanged: (val) {
                            _updateInvertedControls(val);
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(height: 1),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: () {
                        GameAudioEngine().lightImpact();
                        Navigator.of(context).push(
                          CupertinoPageRoute(
                            builder:
                                (_) =>
                                    const OnboardingScreen(isRevisiting: true),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(10),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 6.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  CupertinoIcons.question_circle,
                                  color: primaryColor,
                                  size: 22,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  "How to Play Tutorial",
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                    color: textColor,
                                  ),
                                ),
                              ],
                            ),
                            Icon(
                              CupertinoIcons.chevron_forward,
                              size: 16,
                              color: textColor.withAlpha(140),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // --- 4. About & Credits Section ---
              _buildSectionTitle("ABOUT & CREDITS", textColor),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: borderColor, width: 1.5),
                ),
                child: Column(
                  children: [
                    // App Logo
                    Container(
                      width: 68,
                      height: 68,
                      clipBehavior: Clip.hardEdge,
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF000000) : Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(isDark ? 80 : 20),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Image.asset(
                        'assets/images/bujho-icon.png',
                        width: 120,
                        height: 120,
                      ),
                    ),
                    const SizedBox(height: 12),

                    Text(
                      AppInfo.name.toUpperCase(),
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2.0,
                        color: textColor,
                      ),
                    ),
                    Text(
                      "Version ${AppInfo.displayVersion}",
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: textColor.withAlpha(140),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Made with ❤️ for charades lovers",
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: textColor.withAlpha(160),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 8),

                    // Privacy Policy
                    InkWell(
                      onTap: () {
                        GameAudioEngine().lightImpact();
                        Navigator.of(context).push(
                          CupertinoPageRoute(
                            builder: (_) => const PrivacyPolicyScreen(),
                          ),
                        );
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12.0,
                          vertical: 8.0,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              "Privacy Policy",
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: textColor,
                              ),
                            ),
                            Icon(
                              CupertinoIcons.chevron_forward,
                              size: 16,
                              color: textColor.withAlpha(140),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Audio Attribution Credits
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4.0),
                      child: RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: textColor.withAlpha(130),
                            fontSize: 11,
                          ),
                          children: [
                            const TextSpan(text: "Music: Game Loop by "),
                            TextSpan(
                              text: "Alex_MakeMusic",
                              style: TextStyle(
                                color: primaryColor,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline,
                              ),
                              recognizer:
                                  TapGestureRecognizer()
                                    ..onTap = () => _launchURL(alexMorganUrl),
                            ),
                            const TextSpan(text: " via "),
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
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0, left: 4.0),
      child: Text(
        title,
        style: TextStyle(
          color: color.withAlpha(160),
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
        padding: const EdgeInsets.symmetric(vertical: 10),
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
              color: isSelected ? Colors.black : inactiveColor,
              size: 22,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
                color: isSelected ? Colors.black : inactiveColor,
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
            ? Colors.black
            : (isDark
                ? AppTheme.darkTextColor.withAlpha(100)
                : AppTheme.lightAccentColor.withAlpha(100));
    final textColor =
        isActive
            ? Colors.black
            : (isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor);

    return InkWell(
      onTap: () {
        GameAudioEngine().lightImpact();
        onTap();
      },
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color:
                isActive
                    ? primaryColor
                    : (isDark ? primaryColor.withAlpha(50) : Colors.black12),
            width: 1.5,
          ),
          boxShadow:
              isActive
                  ? [
                    BoxShadow(
                      color: primaryColor.withAlpha(isDark ? 90 : 60),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ]
                  : [],
        ),
        child: Column(
          children: [
            Icon(icon, color: iconColor, size: 26),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 12,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
