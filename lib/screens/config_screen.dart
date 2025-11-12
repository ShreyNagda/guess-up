import 'dart:async'; // Import for Future
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/storage_service.dart'; // Import StorageService

// We no longer need connectivity_plus here
// import 'package:connectivity_plus/connectivity_plus.dart';

class ConfigScreen extends StatefulWidget {
  const ConfigScreen({super.key});

  @override
  State<ConfigScreen> createState() => _ConfigScreenState();
}

class _ConfigScreenState extends State<ConfigScreen> {
  final CategoryService service = CategoryService();
  final StorageService storage = StorageService(); // Instance of StorageService

  List<Category> categories = [];
  List<Category> selectedCategories = [];

  final List<int> timerOptions = [45, 60, 90, 120];
  int selectedTimer = 60;

  bool _isLoading = true;
  // We no longer need _hasInternet
  // bool _hasInternet = false;

  @override
  void initState() {
    super.initState();
    _setPortrait(); // Keep this screen portrait
    fetchCategories(); // Just call fetchCategories directly
  }

  void _setPortrait() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  // Simplified loading function
  Future<void> fetchCategories() async {
    if (mounted) setState(() => _isLoading = true);

    List<Category> allCategories = [];

    // 1. ALWAYS try to get categories.
    // The service will return from cache if offline, or fetch if online.
    try {
      final fetched = await service.getAllCategories();
      allCategories.addAll(fetched); // No more filtering for "-1"
    } catch (e) {
      // This catch block will run if we're offline AND have no cache
      debugPrint("Firebase/Cache fetching error: $e");
      if (mounted) {
        // Inform the user, but we'll still load local words
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              "Couldn't load online categories. Showing offline words only.",
            ),
          ),
        );
      }
    }

    // 2. ALWAYS fetch local and custom words (from StorageService)
    try {
      await storage.getWordsFromLocalFile();
      final customWords = await storage.getCustomWords();

      // 3. Create "dummy" categories for them
      if (customWords.isNotEmpty) {
        allCategories.add(
          Category(
            id: "custom", // New ID
            name: "My Words",
            icon: "✏️",
            words: customWords,
          ),
        );
      }
    } catch (e) {
      debugPrint("Error loading offline words: $e");
    }

    // 4. Update state with all found categories
    if (mounted) {
      setState(() {
        categories = allCategories;
        _isLoading = false; // Set loading to false here
      });
    }
  }

  bool isAllSelected() {
    if (categories.isEmpty) return false;
    return selectedCategories.length == categories.length;
  }

  void toggleCategory(Category category) {
    setState(() {
      if (selectedCategories.contains(category)) {
        selectedCategories.remove(category);
      } else {
        selectedCategories.add(category);
      }
    });
  }

  void toggleAllCategories(bool? selectAll) {
    setState(() {
      if (selectAll == true) {
        selectedCategories = List.from(categories);
      } else {
        selectedCategories.clear();
      }
    });
  }

  void handleStartGame() {
    if (selectedCategories.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Select at least one category")),
      );
      return;
    }

    Navigator.of(context).push(
      CupertinoPageRoute(
        builder:
            (context) => GameScreen(
              time: selectedTimer,
              selectedCategories: selectedCategories,
            ),
        fullscreenDialog: true,
      ),
    );
  }

  @override
  Widget build(BuildContext buildContext) {
    final theme = Theme.of(buildContext);
    bool _isAllSelected = isAllSelected();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Configure Game"),
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, size: 36),
          onPressed: () => Navigator.of(buildContext).pop(),
        ),
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                onRefresh:
                    fetchCategories, // Pull to refresh now just calls fetchCategories
                child:
                    categories.isEmpty
                        ? _buildEmptyState(theme) // Show a specific empty state
                        : Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: ListView(
                            physics: const BouncingScrollPhysics(
                              parent: AlwaysScrollableScrollPhysics(),
                            ),
                            children: [
                              // --- Categories Section ---
                              Text(
                                "Categories",
                                style: theme.textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              // We don't need the _hasInternet check here anymore
                              const SizedBox(height: 8),
                              Card(
                                clipBehavior: Clip.antiAlias,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 2,
                                child: Padding(
                                  padding: const EdgeInsets.all(12.0),
                                  child: Column(
                                    children: [
                                      // "Select All" Switch
                                      Padding(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8.0,
                                          vertical: 4.0,
                                        ),
                                        child: Row(
                                          children: [
                                            Checkbox(
                                              value: _isAllSelected,
                                              onChanged: toggleAllCategories,
                                              activeColor:
                                                  theme.colorScheme.primary,
                                              visualDensity:
                                                  VisualDensity.compact,
                                              materialTapTargetSize:
                                                  MaterialTapTargetSize
                                                      .shrinkWrap,
                                            ),
                                            GestureDetector(
                                              onTap:
                                                  () => toggleAllCategories(
                                                    !_isAllSelected,
                                                  ),
                                              child: Text(
                                                "Select All Categories",
                                                style: theme
                                                    .textTheme
                                                    .titleMedium
                                                    ?.copyWith(
                                                      fontWeight:
                                                          FontWeight.w600,
                                                    ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      // Category Grid
                                      GridView.builder(
                                        shrinkWrap: true,
                                        physics:
                                            const NeverScrollableScrollPhysics(),
                                        gridDelegate:
                                            const SliverGridDelegateWithFixedCrossAxisCount(
                                              crossAxisCount: 3,
                                              crossAxisSpacing: 10,
                                              mainAxisSpacing: 10,
                                              childAspectRatio: 1,
                                            ),
                                        itemCount: categories.length,
                                        itemBuilder: (context, index) {
                                          final category = categories[index];
                                          final isSelected = selectedCategories
                                              .contains(category);
                                          return _buildAnimatedCategoryCard(
                                            category,
                                            isSelected,
                                            theme,
                                          );
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(
                                height: 24,
                              ), // Space between sections
                              // --- Timer Section ---
                              Text(
                                "Select Time",
                                style: theme.textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Card(
                                clipBehavior: Clip.antiAlias,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation: 2,
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 16.0,
                                    horizontal: 12.0,
                                  ),
                                  child: Wrap(
                                    spacing: 10,
                                    runSpacing: 10,
                                    alignment: WrapAlignment.center,
                                    children:
                                        timerOptions.map((time) {
                                          final isSelected =
                                              selectedTimer == time;
                                          return AnimatedScale(
                                            scale: isSelected ? 1.1 : 1.0,
                                            duration: const Duration(
                                              milliseconds: 200,
                                            ),
                                            curve: Curves.easeInOut,
                                            child: ChoiceChip(
                                              label: Padding(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 12,
                                                      vertical: 8,
                                                    ),
                                                child: Text("$time sec"),
                                              ),
                                              selected: isSelected,
                                              onSelected: (_) {
                                                setState(() {
                                                  selectedTimer = time;
                                                });
                                              },
                                            ),
                                          );
                                        }).toList(),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 32),
                              // --- Start Button ---
                              ElevatedButton.icon(
                                onPressed: handleStartGame,
                                icon: const Icon(
                                  Icons.play_arrow_rounded,
                                  size: 28,
                                ),
                                label: const Text(
                                  "Start Guessing!",
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],
                          ),
                        ),
              ),
    );
  }

  // Helper widget for empty state
  Widget _buildEmptyState(ThemeData theme) {
    // This state now means "We're offline AND have no cache AND no local words"
    String title = "No Categories Found";
    String message =
        "Please connect to the internet and pull to refresh, or add your own custom words in Settings.";

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.cloud_off_outlined, size: 60, color: theme.hintColor),
            const SizedBox(height: 16),
            Text(
              title,
              style: theme.textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: theme.textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              icon: const Icon(Icons.refresh),
              label: const Text("Retry"),
              onPressed: fetchCategories, // Just call fetchCategories
            ),
          ],
        ),
      ),
    );
  }

  // Category Card builder (no changes needed)
  Widget _buildAnimatedCategoryCard(
    Category category,
    bool isSelected,
    ThemeData theme,
  ) {
    return GestureDetector(
      onTap: () => toggleCategory(category),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        transform:
            Matrix4.identity()..scaleByDouble(
              isSelected ? 1.03 : 1.0, // Use 1.03, not 1.02
              isSelected ? 1.03 : 1.0, // Use 1.03, not 1.02
              1.0,
              1.0,
            ),
        decoration: BoxDecoration(
          color:
              isSelected
                  ? theme.colorScheme.primary.withAlpha(50)
                  : theme.cardColor.withAlpha(100),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color:
                isSelected
                    ? theme.colorScheme.primary
                    : theme.dividerColor.withAlpha(100),
            width: isSelected ? 2.5 : 1.5,
          ),
          boxShadow:
              isSelected
                  ? [
                    BoxShadow(
                      color: theme.colorScheme.primary.withAlpha(50),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                  : [],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(category.icon, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4.0),
              child: Text(
                category.name,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  // Changed from bodyLarge
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
