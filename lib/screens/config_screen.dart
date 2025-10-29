import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/services/category_service.dart';

class ConfigScreen extends StatefulWidget {
  const ConfigScreen({super.key});

  @override
  State<ConfigScreen> createState() => _ConfigScreenState();
}

class _ConfigScreenState extends State<ConfigScreen> {
  final CategoryService service = CategoryService();

  List<Category> categories = [];
  List<Category> selectedCategories = [];

  final List<int> timerOptions = [45, 60, 90, 120];
  int selectedTimer = 60;

  @override
  void initState() {
    super.initState();
    _setPortrait(); // Keep this screen portrait
    fetchCategories();
  }

  // Removed dispose method resetting orientation, assuming we want portrait here.
  // Add it back if navigating away needs to allow landscape immediately.

  void _setPortrait() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  Future<void> fetchCategories() async {
    final fetched = await service.getAllCategories();
    // Exclude the offline category if it exists (assuming ID "-1")
    // If you fetch it from Firebase, it likely won't have ID "-1" anyway.
    // If you manually add an offline option later, filter it here if needed.
    setState(() {
      categories = fetched.where((cat) => cat.id != "-1").toList();
    });
  }

  bool isAllSelected() {
    // Check against the available categories fetched (excluding potential offline ones)
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

  // Updated toggleAll function for the SwitchListTile
  void toggleAllCategories(bool? selectAll) {
    setState(() {
      if (selectAll == true) {
        selectedCategories = List.from(categories); // Select all available
      } else {
        selectedCategories.clear(); // Deselect all
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
        fullscreenDialog: true, // Keep as fullscreenDialog for modal feel
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    bool _isAllSelected = isAllSelected(); // Cache the value for the switch

    return Scaffold(
      appBar: AppBar(
        title: const Text("Configure Game"),
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, size: 36),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body:
          categories.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : Padding(
                // Use Padding instead of ListView padding for overall spacing
                padding: const EdgeInsets.all(16.0),
                child: ListView(
                  // Keep ListView for scrollability
                  physics: const BouncingScrollPhysics(),
                  children: [
                    // --- Categories Section ---
                    Text(
                      "Categories",
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Card(
                      // Wrap category selection in a Card
                      clipBehavior:
                          Clip.antiAlias, // Ensures content respects shape
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 2, // Subtle elevation for the card
                      child: Padding(
                        padding: const EdgeInsets.all(
                          12.0,
                        ), // Padding inside the card
                        child: Column(
                          children: [
                            // "Select All" Switch
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8.0,
                                vertical: 4.0,
                              ), // Adjust padding
                              child: Row(
                                children: [
                                  Checkbox(
                                    value: _isAllSelected,
                                    onChanged:
                                        toggleAllCategories, // Use the updated method
                                    activeColor: theme.colorScheme.primary,
                                    visualDensity: VisualDensity.compact,
                                    materialTapTargetSize:
                                        MaterialTapTargetSize.shrinkWrap,
                                  ),
                                  // Add GestureDetector to make the text tappable too
                                  GestureDetector(
                                    onTap:
                                        () => toggleAllCategories(
                                          !_isAllSelected,
                                        ), // Toggle the current state
                                    child: Text(
                                      "Select All Categories",
                                      style: theme.textTheme.titleMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                  ),
                                  // Optional Spacer to push checkbox/text left if needed
                                  // const Spacer(),
                                ],
                              ),
                            ),
                            const Divider(height: 1), // Separator
                            const SizedBox(height: 12),
                            // Category Grid
                            GridView.builder(
                              shrinkWrap:
                                  true, // Keep shrinkWrap for ListView context
                              physics:
                                  const NeverScrollableScrollPhysics(), // Keep this
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 3,
                                    crossAxisSpacing:
                                        10, // Adjusted spacing slightly
                                    mainAxisSpacing: 10,
                                    childAspectRatio:
                                        1, // Keep square aspect ratio
                                  ),
                              itemCount:
                                  categories
                                      .length, // Only loop through actual categories
                              itemBuilder: (context, index) {
                                final category = categories[index];
                                final isSelected = selectedCategories.contains(
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
                    ),
                    const SizedBox(height: 24), // Space between sections
                    // --- Timer Section ---
                    Text(
                      "Select Time",
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Card(
                      // Wrap timer selection in a Card
                      clipBehavior: Clip.antiAlias,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 2,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          vertical: 16.0,
                          horizontal: 12.0,
                        ), // Padding inside card
                        child: Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          alignment: WrapAlignment.center,
                          children:
                              timerOptions.map((time) {
                                final isSelected = selectedTimer == time;
                                // Keep AnimatedScale for timer selection feedback
                                return AnimatedScale(
                                  scale: isSelected ? 1.1 : 1.0,
                                  duration: const Duration(milliseconds: 200),
                                  curve: Curves.easeInOut,
                                  child: ChoiceChip(
                                    label: Padding(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 8, // Adjusted padding
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
                      icon: const Icon(Icons.play_arrow_rounded, size: 28),
                      label: const Text(
                        "Start Guessing!",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16), // Padding at the very bottom
                  ],
                ),
              ),
      // Removed floatingActionButton and location
    );
  }

  // Updated Category Card builder
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
        // Keep scale effect for selection feedback
        transform:
            Matrix4.identity()..scaleByDouble(
              isSelected ? 1.03 : 1.0,
              isSelected ? 1.0 : 1.0,
              1.0,
              1.0,
            ),
        decoration: BoxDecoration(
          color:
              isSelected
                  ? theme.colorScheme.primary.withAlpha(50)
                  : theme.cardColor.withAlpha(
                    100,
                  ), // Slightly transparent unselected cards
          // Use standard rounded rectangle
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color:
                isSelected
                    ? theme.colorScheme.primary
                    : theme.dividerColor.withAlpha(
                      100,
                    ), // Subtle border when not selected
            width: isSelected ? 2.5 : 1.5, // Thicker border when selected
          ),
          boxShadow:
              isSelected
                  ? [
                    // Only add shadow when selected for more pop
                    BoxShadow(
                      color: theme.colorScheme.primary.withAlpha(50),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                  : [], // No shadow when not selected
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(category.icon, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 8),
            Padding(
              // Add padding for text to avoid touching edges
              padding: const EdgeInsets.symmetric(horizontal: 4.0),
              child: Text(
                category.name,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
                maxLines: 2, // Allow text wrapping
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
