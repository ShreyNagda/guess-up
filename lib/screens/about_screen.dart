import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Import for orientation lock
// Optional: If you want to display the version dynamically (ensure added to pubspec.yaml)
// import 'package:package_info_plus/package_info_plus.dart';

class AboutScreen extends StatefulWidget {
  // Changed to StatefulWidget for orientation lock & optional version loading
  const AboutScreen({super.key});

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  String _version = '1.0.0+1'; // Default version from your pubspec.yaml

  @override
  void initState() {
    super.initState();
    _setPortraitOnly(); // Lock orientation on entry
    // Optional: Load version info dynamically
    // _loadVersionInfo();
  }

  // Function to set portrait mode
  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  // Optional: Function to load version info dynamically
  // Future<void> _loadVersionInfo() async {
  //   try {
  //     final packageInfo = await PackageInfo.fromPlatform();
  //     if (mounted) { // Check mounted before setState
  //       setState(() {
  //         _version = '${packageInfo.version}+${packageInfo.buildNumber}';
  //       });
  //     }
  //   } catch (e) {
  //     print("Could not get package info: $e");
  //     // Keep default version if loading fails
  //   }
  // }

  // Optional: Reset orientation if needed when leaving this screen
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
        title: const Text("About Guess Up"),
        // No local shape needed
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new), // Standard back icon
          tooltip: "Back",
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        // Ensure content avoids system UI
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment:
                  MainAxisAlignment.center, // Center content vertically
              crossAxisAlignment:
                  CrossAxisAlignment.center, // Center content horizontally
              children: [
                const Spacer(
                  flex: 1,
                ), // Pushes content down slightly from AppBar
                // Logo (using a circular clip like HomeScreen)
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(
                      50,
                    ), // Adjust radius as needed
                  ),
                  clipBehavior: Clip.hardEdge,
                  child: Image.asset(
                    'assets/images/logo.png', // Use your main logo
                    width: 100,
                    height: 100,
                  ),
                ),
                const SizedBox(height: 20),

                // App Name
                Text(
                  "guesse up", // Match your branding
                  style: theme.textTheme.displayMedium?.copyWith(
                    fontWeight:
                        FontWeight.w900, // Match HomeScreen style if desired
                    fontSize: 36, // Adjust size
                    letterSpacing: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),

                // Version
                Text(
                  "Version $_version",
                  style: theme.textTheme.titleMedium?.copyWith(
                    // Use a slightly less prominent color from the theme
                    color: theme.textTheme.bodyMedium?.color?.withAlpha(
                      180,
                    ), // e.g., slightly transparent text color
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                // Description (from your README)
                Text(
                  "A mobile charades game built for Indian youths. Perfect for parties!", // Slightly shortened
                  style: theme.textTheme.bodyLarge, // Use themed style
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // --- Optional Links Section ---
                // Example: Link to Privacy Policy or Website
                // InkWell(
                //   onTap: () { /* TODO: Implement URL launching */ },
                //   child: Padding(
                //     padding: const EdgeInsets.symmetric(vertical: 8.0),
                //     child: Text(
                //       "Privacy Policy",
                //       style: theme.textTheme.bodyMedium?.copyWith(
                //         color: theme.colorScheme.primary, // Make it look like a link
                //         decoration: TextDecoration.underline,
                //         decorationColor: theme.colorScheme.primary,
                //       ),
                //     ),
                //   ),
                // ),
                // --- End Optional Links ---
                const Spacer(flex: 2), // Pushes copyright to bottom
                // Copyright or Footer
                Text(
                  "© 2025 guesse up/Shrey Nagda.\nAll rights reserved.", // TODO: Update year and name
                  style: theme.textTheme.bodySmall?.copyWith(
                    // Use a very subtle color
                    color: theme.textTheme.bodySmall?.color?.withAlpha(100),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
