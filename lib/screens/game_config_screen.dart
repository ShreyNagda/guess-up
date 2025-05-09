import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/services/category_service.dart';

class GameConfigScreen extends StatefulWidget {
  const GameConfigScreen({super.key});

  @override
  State<GameConfigScreen> createState() => _GameConfigScreenState();
}

class _GameConfigScreenState extends State<GameConfigScreen> {
  final CategoryService service = CategoryService();

  List<Category> categories = [];
  List<Category> selectedCategories = [];

  final List<int> timerOptions = [45, 60, 90, 120]; // seconds
  int selectedTimer = 60; // default

  @override
  void initState() {
    super.initState();
    fetchCategories();
    _setPortrait();
  }

  void _setPortrait() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final isCurrent = ModalRoute.of(context)?.isCurrent ?? false;
    if (isCurrent) {
      _setPortrait();
    }
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
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text("Select atleast 1 category")));
      return;
    }
    List<String> words = service.getWordsFromSelectedCategories(
      selectedCategories,
    );
    Navigator.of(context).push(
      CupertinoPageRoute(
        builder: (context) => GameScreen(time: selectedTimer, words: words),
        fullscreenDialog: true,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          toolbarHeight: 100,
          title: const Text("Game Settings"),
          backgroundColor: Colors.transparent,
        ),
        body: Padding(
          padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 10),
          child:
              categories.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : SingleChildScrollView(
                    child: Column(
                      children: [
                        Text(
                          "Select Categories",
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                        GridView.count(
                          padding: EdgeInsets.all(10),
                          crossAxisCount: 3,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                          // childAspectRatio: 1.1,
                          shrinkWrap: true,
                          children: [
                            ...List.generate(categories.length, (index) {
                              final category = categories[index];
                              final isSelected = selectedCategories.contains(
                                category,
                              );
                              return GestureDetector(
                                onTap: () => toggleCategory(category),
                                child: Card(
                                  elevation: 8,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                    side: BorderSide(
                                      width: 3,
                                      color:
                                          isSelected
                                              ? Colors.deepPurpleAccent.shade100
                                              : Colors.transparent,
                                    ),
                                  ),
                                  child: Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          category.icon,
                                          textAlign: TextAlign.center,
                                          style:
                                              Theme.of(
                                                context,
                                              ).textTheme.headlineSmall,
                                        ),
                                        Text(
                                          category.name,
                                          textAlign: TextAlign.center,
                                          style:
                                              Theme.of(
                                                context,
                                              ).textTheme.bodyMedium,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            }),
                            // "All" chip
                            GestureDetector(
                              onTap: () => toggleAllCategories(),
                              child: Card(
                                elevation: 8,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  side: BorderSide(
                                    width: 3,
                                    color:
                                        isAllSelected()
                                            ? Colors.deepPurpleAccent.shade100
                                            : Colors.transparent,
                                  ),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        "🎯",
                                        textAlign: TextAlign.center,
                                        style:
                                            Theme.of(
                                              context,
                                            ).textTheme.headlineLarge,
                                      ),
                                      Text("All", textAlign: TextAlign.center),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 20),
                        Text(
                          "Select Time",
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          alignment: WrapAlignment.center,
                          children: List.generate(timerOptions.length, (index) {
                            final time = timerOptions[index];
                            return ChoiceChip(
                              label: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12.0,
                                  vertical: 8,
                                ),
                                child: Text("$time sec"),
                              ),
                              selected: selectedTimer == time,
                              selectedColor: const Color(0xFFBB86FC),
                              backgroundColor: Theme.of(context).cardColor,
                              showCheckmark: false,
                              onSelected: (_) {
                                setState(() {
                                  selectedTimer = time;
                                });
                              },
                              labelPadding: const EdgeInsets.symmetric(
                                horizontal: 4,
                                vertical: 2,
                              ),
                            );
                          }),
                        ),
                        Align(
                          alignment: Alignment.bottomCenter,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              handleStartGame();
                            },
                            label: Text("Start Guessing"),
                            icon: Icon(Icons.play_arrow_rounded),
                          ),
                        ),
                      ],
                    ),
                  ),
        ),
      ),
    );
  }
}
