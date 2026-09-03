import 'package:flutter/material.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;
    final borderColor = isDark ? primaryColor.withAlpha(77) : Colors.black12;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () {
            GameAudioEngine().lightImpact();
            Navigator.of(context).pop();
          },
        ),
        title: Text(
          "PRIVACY POLICY",
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
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            // Hero Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: borderColor, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: primaryColor.withAlpha(40),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: primaryColor.withAlpha(40),
                      borderRadius: BorderRadius.circular(
                        22,
                      ), // Squircle shape!
                      border: Border.all(
                        color: primaryColor.withAlpha(100),
                        width: 2,
                      ),
                    ),
                    child: Icon(
                      Icons.shield_outlined,
                      size: 36,
                      color: primaryColor,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "YOUR PRIVACY MATTERS",
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                      letterSpacing: 1.2,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    "Last updated: August 2026",
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: textColor.withAlpha(140),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Guess Up is designed to bring people together for fun party games without compromising your privacy or personal data.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      height: 1.4,
                      color: textColor.withAlpha(200),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Policy Sections
            _buildPolicySection(
              isDark: isDark,
              borderColor: borderColor,
              textColor: textColor,
              primaryColor: primaryColor,
              icon: Icons.no_accounts_rounded,
              title: "1. No Account or Personal Data Collection",
              content:
                  "Guess Up does not require any registration, email address, phone number, or personal user account. We do not track, collect, sell, or rent your personal identifiable information to third parties.",
            ),

            const SizedBox(height: 14),

            _buildPolicySection(
              isDark: isDark,
              borderColor: borderColor,
              textColor: textColor,
              primaryColor: primaryColor,
              icon: Icons.sensors_rounded,
              title: "2. Motion Sensors & Forehead Tilt",
              content:
                  "The game utilizes your device's built-in accelerometer and gyroscope strictly for real-time forehead tilt controls (tilting down for Correct, tilting up to Pass). Sensor data is computed locally on your device and is never stored or transmitted anywhere.",
            ),

            const SizedBox(height: 14),

            _buildPolicySection(
              isDark: isDark,
              borderColor: borderColor,
              textColor: textColor,
              primaryColor: primaryColor,
              icon: Icons.phonelink_setup_rounded,
              title: "3. Local Storage Preferences",
              content:
                  "Game settings (such as music, sound effects, haptics, tilt sensitivity, and custom deck data) are stored locally on your device using encrypted key-value storage. Clearing app data or uninstalling the app will clear these local preferences.",
            ),

            const SizedBox(height: 14),

            _buildPolicySection(
              isDark: isDark,
              borderColor: borderColor,
              textColor: textColor,
              primaryColor: primaryColor,
              icon: Icons.cloud_done_rounded,
              title: "4. Cloud Categories & Data Access",
              content:
                  "Pre-built game categories are retrieved anonymously from secure cloud storage. No telemetry or user device identifiers are attached to these category fetch requests.",
            ),

            const SizedBox(height: 14),

            _buildPolicySection(
              isDark: isDark,
              borderColor: borderColor,
              textColor: textColor,
              primaryColor: primaryColor,
              icon: Icons.mail_outline_rounded,
              title: "5. Contact Us",
              content:
                  "If you have any questions or feedback regarding this Privacy Policy, feel free to reach out at:\n\nEmail: shreynagda.dev@gmail.com",
            ),

            const SizedBox(height: 28),

            // Bottom Brand Footer
            Center(
              child: Text(
                "Guess Up • Party Charades",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: textColor.withAlpha(120),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildPolicySection({
    required bool isDark,
    required Color borderColor,
    required Color textColor,
    required Color primaryColor,
    required IconData icon,
    required String title,
    required String content,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor, width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: primaryColor, size: 22),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                    color: textColor,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            content,
            style: TextStyle(
              fontSize: 13,
              height: 1.4,
              color: textColor.withAlpha(190),
            ),
          ),
        ],
      ),
    );
  }
}
