import 'dart:async'; // Import for Future
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/storage_service.dart'; // Import StorageService

class ConfigScreen extends StatefulWidget {
  const ConfigScreen({super.key});

  @override
  State<ConfigScreen> createState() => _ConfigScreenState();
}

class _ConfigScreenState extends State<ConfigScreen> {
  final CategoryService service = CategoryService();
  final StorageService storage = StorageService();

  List<Category> categories = [];
  List<Category> selectedCategories = [];

  // [REMOVED] timerOptions and selectedTimer variables are gone.

  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _setPortrait();
    fetchCategories();
  }

  void _setPortrait() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  Future<void> fetchCategories() async {
    if (mounted) setState(() => _isLoading = true);

    List<Category> allCategories = [];
    bool usingOfflineFallback = false;

    // 1. Try to fetch ONLINE categories (or from Service Cache)
    try {
      final fetched = await service.getAllCategories();
      if (fetched.isEmpty) throw Exception("No online categories returned");
      allCategories.addAll(fetched);
    } catch (e) {
      debugPrint("⚠️ Network/Cache error: $e. Switching to Offline Mode.");
      usingOfflineFallback = true;
    }

    // 2. If Online failed, load the "Classic Party" deck from Storage
    if (usingOfflineFallback) {
      try {
        final List<String> localWords = await storage.getWordsFromLocalFile();
        if (localWords.isNotEmpty) {
          allCategories.add(
            Category(
              id: "offline_classic",
              name: "Classic Party",
              icon: "🎉",
              words: localWords,
            ),
          );
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text("You are offline. Loaded 'Classic Party' deck!"),
                duration: Duration(seconds: 3),
                backgroundColor: Colors.orangeAccent,
              ),
            );
          }
        }
      } catch (assetError) {
        debugPrint("Error loading offline words: $assetError");
      }
    }

    // 3. ALWAYS load local "My Words"
    try {
      final customWords = storage.getCustomWords();
      if (customWords.isNotEmpty) {
        allCategories.add(
          Category(
            id: "custom",
            name: "My Words",
            icon: "✏️",
            words: customWords,
          ),
        );
      }
    } catch (e) {
      debugPrint("Error loading custom words: $e");
    }

    if (mounted) {
      setState(() {
        categories = allCategories;
        _isLoading = false;
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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("Select at least one deck")));
      return;
    }

    // [NEW] Get the time from storage directly
    final int gameTime = StorageService().gameDuration;

    Navigator.of(context).push(
      CupertinoPageRoute(
        builder:
            (context) => GameScreen(
              time: gameTime, // Use saved time
              selectedCategories: selectedCategories,
            ),
        fullscreenDialog: true,
      ),
    );
  }

  @override
  Widget build(BuildContext buildContext) {
    final theme = Theme.of(buildContext);
    bool isAllCategoriesSelected = isAllSelected();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Choose Decks"),
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, size: 36),
          onPressed: () => Navigator.of(buildContext).pop(),
        ),
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                onRefresh: fetchCategories,
                child:
                    categories.isEmpty
                        ? _buildEmptyState(theme)
                        : Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            children: [
                              Expanded(
                                child: ListView(
                                  physics: const BouncingScrollPhysics(
                                    parent: AlwaysScrollableScrollPhysics(),
                                  ),
                                  children: [
                                    // Text(
                                    //   "Decks",
                                    //   style: theme.textTheme.headlineMedium
                                    //       ?.copyWith(
                                    //         fontWeight: FontWeight.bold,
                                    //       ),
                                    // ),
                                    const SizedBox(height: 8),
                                    Padding(
                                      padding: const EdgeInsets.all(12.0),
                                      child: Column(
                                        children: [
                                          Padding(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 8.0,
                                              vertical: 4.0,
                                            ),
                                            child: Row(
                                              children: [
                                                Checkbox(
                                                  value:
                                                      isAllCategoriesSelected,
                                                  onChanged:
                                                      toggleAllCategories,
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
                                                        !isAllCategoriesSelected,
                                                      ),
                                                  child: Text(
                                                    "Select All Decks",
                                                    style: theme
                                                        .textTheme
                                                        .titleMedium
                                                        ?.copyWith(
                                                          fontWeight:
                                                              FontWeight.w600,
                                                        ),
                                                  ),
                                                ),
                                                const Spacer(),
                                                if (categories.length > 1)
                                                  Text(
                                                    "Mix & Match!",
                                                    style: theme
                                                        .textTheme
                                                        .bodySmall
                                                        ?.copyWith(
                                                          color:
                                                              theme.hintColor,
                                                          fontStyle:
                                                              FontStyle.italic,
                                                        ),
                                                  ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(height: 12),
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
                                              final category =
                                                  categories[index];
                                              final isSelected =
                                                  selectedCategories.contains(
                                                    category,
                                                  );
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
                                  ],
                                ),
                              ),
                              // [UPDATED] Start Button is anchored at the bottom
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                height: 60,
                                child: ElevatedButton.icon(
                                  onPressed: handleStartGame,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: theme.colorScheme.primary,
                                    foregroundColor:
                                        theme.colorScheme.onPrimary,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    elevation: 4,
                                  ),
                                  icon: const Icon(
                                    Icons.play_arrow_rounded,
                                    size: 32,
                                  ),
                                  label: const Text(
                                    "Start Guessing!",
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
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

  Widget _buildEmptyState(ThemeData theme) {
    String title = "No Decks Found";
    String message =
        "Please connect to the internet to load decks, or add your own custom words in Settings.";
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
              onPressed: fetchCategories,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnimatedCategoryCard(
    Category category,
    bool isSelected,
    ThemeData theme,
  ) {
    final isDark = theme.brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => toggleCategory(category),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        transform:
            Matrix4.identity()..scaleByDouble(
              isSelected ? 1.05 : 1.0,
              isSelected ? 1.05 : 1.0,
              1.0,
              1.0,
            ),
        decoration: BoxDecoration(
          color:
              isSelected
                  // Selected:
                  // Light Mode: Yellow needs higher opacity (85) to be seen on white
                  // Dark Mode: Amber looks great at (85) too
                  ? theme.colorScheme.primary.withAlpha(85)
                  // Unselected:
                  // Light Mode: Needs to be nearly opaque (245) to stand out from background
                  // Dark Mode: Can handle the slight transparency
                  : theme.cardColor.withAlpha(isDark ? 230 : 250),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color:
                isSelected
                    ? theme.colorScheme.primary
                    : theme.dividerColor.withAlpha(50),
            width: isSelected ? 3 : 1,
          ),
          boxShadow:
              isSelected
                  ? [
                    BoxShadow(
                      color: theme.colorScheme.primary.withAlpha(
                        60,
                      ), // Glow effect
                      blurRadius: 5,
                      offset: const Offset(0, 4),
                    ),
                  ]
                  : [
                    BoxShadow(
                      color: Colors.black.withAlpha(
                        isDark ? 30 : 10,
                      ), // Subtle shadow
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(category.icon, style: const TextStyle(fontSize: 32)),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Text(
                category.name,
                textAlign: TextAlign.center,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
