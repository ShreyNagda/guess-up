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
    fetchCategories();
    _setPortrait();
  }

  @override
  void dispose() {
    super.dispose();
    _setPortrait();
  }

  void _setPortrait() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  Future<void> fetchCategories() async {
    final fetched = await service.getAllCategories();
    setState(() {
      categories = fetched;
    });
  }

  bool isAllSelected() => selectedCategories.length == categories.length;

  void toggleCategory(Category category) {
    setState(() {
      if (selectedCategories.contains(category)) {
        selectedCategories.remove(category);
      } else {
        selectedCategories.add(category);
      }
    });
  }

  void toggleAllCategories() {
    setState(() {
      if (isAllSelected()) {
        selectedCategories.clear();
      } else {
        selectedCategories = List.from(categories);
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
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Configure Game"),
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
        ),
        leading: IconButton(
          icon: const Icon(Icons.chevron_left, size: 36),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body:
          categories.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : Padding(
                padding: const EdgeInsets.all(16.0),
                child: ListView(
                  physics: const BouncingScrollPhysics(),
                  children: [
                    // Categories Section
                    Text("Categories", style: theme.textTheme.headlineMedium),
                    const SizedBox(height: 12),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 1,
                          ),
                      itemCount: categories.length + 1,
                      itemBuilder: (context, index) {
                        if (index == categories.length) {
                          return _buildAnimatedAllCard(theme);
                        }
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
                    const SizedBox(height: 32),

                    // Timer Section
                    Text("Select Time", style: theme.textTheme.headlineMedium),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      alignment: WrapAlignment.center,
                      children:
                          timerOptions.map((time) {
                            final isSelected = selectedTimer == time;
                            return AnimatedScale(
                              scale: isSelected ? 1.1 : 1.0,
                              duration: const Duration(milliseconds: 200),
                              curve: Curves.easeInOut,
                              child: ChoiceChip(
                                label: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  child: Text("$time sec"),
                                ),
                                selected: isSelected,
                                selectedColor: theme.colorScheme.primary
                                    .withOpacity(0.3),
                                labelStyle: TextStyle(
                                  color:
                                      isSelected
                                          ? theme.colorScheme.primary
                                          : theme.textTheme.bodyMedium!.color,
                                  fontWeight: FontWeight.w600,
                                ),
                                onSelected: (_) {
                                  setState(() {
                                    selectedTimer = time;
                                  });
                                },
                              ),
                            );
                          }).toList(),
                    ),
                    const SizedBox(height: 120),
                  ],
                ),
              ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: ElevatedButton.icon(
        onPressed: handleStartGame,
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(50),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          elevation: 10,
        ),
        icon: const Icon(Icons.play_arrow_rounded, size: 28),
        label: const Text("Start Guessing!"),
      ),
    );
  }

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
        transform: Matrix4.identity()..scale(isSelected ? 1.05 : 1.0),
        decoration: BoxDecoration(
          color:
              isSelected
                  ? theme.colorScheme.primary.withOpacity(0.2)
                  : theme.cardColor,
          borderRadius: BorderRadius.circular(50),
          border: Border.all(
            color: isSelected ? theme.colorScheme.primary : Colors.transparent,
            width: 2.5,
          ),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(category.icon, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 8),
            Text(
              category.name,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnimatedAllCard(ThemeData theme) {
    final selected = isAllSelected();
    return GestureDetector(
      onTap: toggleAllCategories,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        transform: Matrix4.identity()..scale(selected ? 1.05 : 1.0),
        decoration: BoxDecoration(
          color:
              selected
                  ? theme.colorScheme.primary.withOpacity(0.2)
                  : theme.cardColor,
          borderRadius: BorderRadius.circular(50),
          border: Border.all(
            color: selected ? theme.colorScheme.primary : Colors.transparent,
            width: 2.5,
          ),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4),
          ],
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("🎯", style: TextStyle(fontSize: 30)),
              SizedBox(height: 6),
              Text("All", style: TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}
