import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/create_custom_deck_screen.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/onboarding_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';

class ConfigScreen extends StatefulWidget {
  const ConfigScreen({super.key});

  @override
  State<ConfigScreen> createState() => _ConfigScreenState();
}

class _ConfigScreenState extends State<ConfigScreen> {
  final CategoryService _categoryService = CategoryService();
  final StorageService _storageService = StorageService();

  List<Category> allCategories = [];
  List<Category> displayedCategories = [];
  List<Category> selectedCategories = [];
  List<Category> customDecks = [];

  bool _isLoading = true;
  bool _isTeamMode = false;
  int _gameDuration = 60;
  int _teamRounds = 3;
  String _selectedTab = 'All'; // 'All', 'Built-in', 'Custom'

  final List<String> _presetColors = [
    '#FFC107',
    '#4CAF50',
    '#00BCD4',
    '#9C27B0',
    '#E91E63',
    '#FF5722',
    '#3F51B5',
    '#009688',
  ];

  ScaffoldMessengerState? _scaffoldMessenger;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _scaffoldMessenger = ScaffoldMessenger.maybeOf(context);
  }

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    _gameDuration = _storageService.gameDuration;
    _teamRounds = _storageService.teamRounds;
    _loadDecksAndCategories();
  }

  Future<void> _loadDecksAndCategories({bool forceRefresh = false}) async {
    if (!mounted) return;
    // Load persisted preferences
    _isTeamMode = _storageService.isTeamMode;
    _gameDuration = _storageService.gameDuration;
    _teamRounds = _storageService.teamRounds;

    // 1. Fetch custom decks from StorageService
    customDecks = _storageService.getCustomDecks();

    // Custom decks are already Category objects
    final customCategories = customDecks;

    // 2. Fetch remote/built-in categories from CategoryService
    List<Category> remoteCategories = [];
    try {
      remoteCategories = await _categoryService.getAllCategories(
        forceRefresh: forceRefresh,
      );
    } catch (_) {}

    // Combine custom and remote categories (showing available categories)
    final combined = <Category>[...customCategories];
    for (final cat in remoteCategories) {
      if (!combined.any((c) => c.id == cat.id)) {
        combined.add(cat);
      }
    }

    if (!mounted) return;
    setState(() {
      allCategories = combined;
      _filterCategories();
      _isLoading = false;

      // Retain user selections if they still exist in the updated categories list
      if (selectedCategories.isNotEmpty) {
        selectedCategories =
            selectedCategories
                .where((sc) => allCategories.any((c) => c.id == sc.id))
                .toList();
      } else if (!forceRefresh && allCategories.isNotEmpty) {
        final lastIds = _storageService.getLastCategoryIds();
        if (lastIds.isNotEmpty) {
          selectedCategories =
              allCategories.where((c) => lastIds.contains(c.id)).toList();
        }
      }
    });
  }

  void _filterCategories() {
    List<Category> baseList = allCategories;
    if (_selectedTab == 'Custom') {
      baseList =
          allCategories
              .where(
                (c) =>
                    c.id.startsWith('custom') ||
                    customDecks.any((cd) => cd.id == c.id),
              )
              .toList();
    } else if (_selectedTab == 'Built-in') {
      baseList =
          allCategories
              .where(
                (c) =>
                    !c.id.startsWith('custom') &&
                    !customDecks.any((cd) => cd.id == c.id),
              )
              .toList();
    }

    displayedCategories = baseList;
  }

  void toggleCategory(Category category) {
    AudioService().extraLightImpact();
    setState(() {
      if (selectedCategories.contains(category)) {
        selectedCategories.remove(category);
      } else {
        selectedCategories.add(category);
      }
    });
  }

  void toggleAllCategories(bool? selectAll) {
    AudioService().extraLightImpact();
    setState(() {
      if (selectAll == true) {
        for (final cat in displayedCategories) {
          if (!selectedCategories.contains(cat)) {
            selectedCategories.add(cat);
          }
        }
      } else {
        selectedCategories.removeWhere((c) => displayedCategories.contains(c));
      }
    });
  }

  void _showDeckPreviewSheet(Category category) {
    AudioService().extraLightImpact();
    final cardColor = category.themeColor;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            final theme = Theme.of(context);
            final isDark = theme.brightness == Brightness.dark;
            final isSelected = selectedCategories.contains(category);
            final isCustom =
                category.id.startsWith('custom') ||
                customDecks.any((cd) => cd.id == category.id);

            return Container(
              height: MediaQuery.of(context).size.height * 0.65,
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(28),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(100),
                    blurRadius: 20,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: theme.dividerColor.withAlpha(60),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: cardColor.withAlpha(50),
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            category.icon,
                            style: const TextStyle(fontSize: 28),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                category.name,
                                style: theme.textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "${category.words.length} Words • ${isCustom ? "Custom Deck" : "Built-in Deck"}",
                                style: TextStyle(
                                  color: theme.hintColor,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (isCustom) ...[
                          IconButton(
                            icon: const Icon(Icons.edit_rounded),
                            tooltip: "Edit Deck",
                            onPressed: () {
                              Navigator.of(context).pop();
                              final match = customDecks.firstWhere(
                                (cd) => cd.id == category.id,
                              );
                              _openCreateCustomDeckScreen(existing: match);
                            },
                          ),
                          IconButton(
                            icon: const Icon(
                              Icons.delete_outline_rounded,
                              color: Colors.redAccent,
                            ),
                            tooltip: "Delete Deck",
                            onPressed: () {
                              Navigator.of(context).pop();
                              _confirmDeleteCustomDeck(category);
                            },
                          ),
                        ],
                        IconButton(
                          icon: const Icon(Icons.tune_rounded),
                          tooltip: "Admin Controls",
                          onPressed: () {
                            Navigator.of(context).pop();
                            _showAdminDeckDialog(category);
                          },
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 24),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        "DECK OVERVIEW",
                        style: theme.textTheme.labelSmall?.copyWith(
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                          color: cardColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Description Card
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              color:
                                  isDark
                                      ? cardColor.withAlpha(25)
                                      : cardColor.withAlpha(15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: cardColor.withAlpha(80),
                                width: 1.5,
                              ),
                            ),
                            child: Text(
                              category.categoryDescription,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                fontSize: 15,
                                height: 1.45,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Quick Deck Stats
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color:
                                  isDark
                                      ? Colors.white.withAlpha(10)
                                      : Colors.black.withAlpha(5),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: theme.dividerColor.withAlpha(40),
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: [
                                Column(
                                  children: [
                                    Text(
                                      "${category.words.length}",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 20,
                                        color: cardColor,
                                      ),
                                    ),
                                    const Text(
                                      "Cards in Deck",
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  height: 24,
                                  width: 1,
                                  color: theme.dividerColor.withAlpha(60),
                                ),
                                Column(
                                  children: [
                                    Text(
                                      isCustom ? "Custom" : "Built-in",
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 16,
                                      ),
                                    ),
                                    const Text(
                                      "Deck Source",
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        onPressed: () {
                          setSheetState(() {
                            toggleCategory(category);
                          });
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              isSelected ? Colors.redAccent : cardColor,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: Text(
                          isSelected
                              ? "REMOVE FROM SELECTION"
                              : "ADD TO SELECTION",
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _openCreateCustomDeckScreen({Category? existing}) async {
    final result = await Navigator.of(context).push<bool>(
      CupertinoPageRoute(
        builder: (_) => CreateCustomDeckScreen(existingDeck: existing),
      ),
    );
    if (result == true) {
      _loadDecksAndCategories();
    }
  }

  void _showAdminDeckDialog(Category category) {
    final isCustom =
        category.id.startsWith('custom') ||
        customDecks.any((cd) => cd.id == category.id);
    bool currentStatus = category.isAvailable;
    String selectedHex = category.colorHex ?? '#FFC107';

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              title: Row(
                children: [
                  Text(category.icon, style: const TextStyle(fontSize: 28)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      "Admin Deck Controls",
                      style: const TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                      ),
                    ),
                  ),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Deck: ${category.name}",
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),

                  // Toggle Status (Active / Inactive)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Deck Status:",
                        style: TextStyle(fontWeight: FontWeight.w700),
                      ),
                      Switch(
                        value: currentStatus,
                        activeTrackColor: AppTheme.darkPrimaryColor,
                        onChanged: (val) {
                          setDialogState(() => currentStatus = val);
                        },
                      ),
                    ],
                  ),
                  Text(
                    currentStatus
                        ? "Active (Visible to players)"
                        : "Inactive (Hidden from players)",
                    style: TextStyle(
                      fontSize: 12,
                      color: currentStatus ? Colors.green : Colors.redAccent,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Color Picker Presets
                  const Text(
                    "Deck Theme Color:",
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children:
                        _presetColors.map((hex) {
                          final isSelected = hex == selectedHex;
                          return GestureDetector(
                            onTap: () {
                              setDialogState(() => selectedHex = hex);
                            },
                            child: Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: Color(
                                  int.parse(
                                    hex.replaceAll('#', 'FF'),
                                    radix: 16,
                                  ),
                                ),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color:
                                      isSelected
                                          ? Colors.white
                                          : Colors.transparent,
                                  width: 2.5,
                                ),
                              ),
                              child:
                                  isSelected
                                      ? const Icon(
                                        Icons.check,
                                        size: 16,
                                        color: Colors.black,
                                      )
                                      : null,
                            ),
                          );
                        }).toList(),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text("CANCEL"),
                ),
                ElevatedButton(
                  onPressed: () async {
                    final nav = Navigator.of(context);
                    if (isCustom) {
                      final match = customDecks.firstWhere(
                        (cd) => cd.id == category.id,
                      );
                      final updated = Category(
                        id: match.id,
                        name: match.name,
                        icon: match.icon,
                        colorHex: selectedHex,
                        words: match.words,
                      );
                      await _storageService.saveCustomDeck(updated);
                    } else {
                      await _categoryService.updateCategoryStatusAndColor(
                        category.id,
                        isAvailable: currentStatus,
                        colorHex: selectedHex,
                      );
                    }
                    if (!mounted) return;
                    nav.pop();
                    _loadDecksAndCategories(forceRefresh: true);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.darkPrimaryColor,
                    foregroundColor: AppTheme.darkAccentColor,
                  ),
                  child: const Text(
                    "SAVE CHANGES",
                    style: TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _confirmDeleteCustomDeck(Category category) async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text("Delete '${category.name}'?"),
          content: const Text(
            "Are you sure you want to delete this custom deck from your device? This cannot be undone.",
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent,
              ),
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text(
                "Delete",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );

    if (confirm == true) {
      await _storageService.deleteCustomDeck(category.id);
      selectedCategories.removeWhere((c) => c.id == category.id);
      await _loadDecksAndCategories();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("Deleted '${category.name}' custom deck"),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  void deactivate() {
    _scaffoldMessenger?.clearSnackBars();
    super.deactivate();
  }

  void _showDurationPickerSheet(ThemeData theme) {
    final isDark = theme.brightness == Brightness.dark;
    final durations = [45, 60, 90, 120];

    showModalBottomSheet(
      context: context,
      backgroundColor: theme.scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.dividerColor.withAlpha(80),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.timer_outlined,
                      size: 20,
                      color: AppTheme.darkPrimaryColor,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "SELECT ROUND DURATION",
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children:
                      durations.map((sec) {
                        final isSelected = _gameDuration == sec;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() => _gameDuration = sec);
                              _storageService.setGameDuration(sec);
                              AudioService().lightImpact();
                              Navigator.of(ctx).pop();
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                color:
                                    isSelected
                                        ? AppTheme.darkPrimaryColor
                                        : (isDark
                                            ? AppTheme.darkSurfaceColor
                                            : Colors.white),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color:
                                      isSelected
                                          ? AppTheme.darkPrimaryColor
                                          : theme.dividerColor.withAlpha(40),
                                  width: isSelected ? 2 : 1,
                                ),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    "$sec",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 20,
                                      color:
                                          isSelected
                                              ? AppTheme.darkAccentColor
                                              : (isDark
                                                  ? AppTheme.darkTextColor
                                                  : AppTheme.lightTextColor),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    "SEC",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 10,
                                      letterSpacing: 1,
                                      color:
                                          isSelected
                                              ? AppTheme.darkAccentColor
                                                  .withAlpha(200)
                                              : theme.hintColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showRoundsPickerSheet(ThemeData theme) {
    final isDark = theme.brightness == Brightness.dark;
    final roundOptions = [1, 2, 3, 5];

    showModalBottomSheet(
      context: context,
      backgroundColor: theme.scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.dividerColor.withAlpha(80),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.repeat_rounded,
                      size: 20,
                      color: AppTheme.teamAColor,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "SELECT TEAM ROUNDS",
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children:
                      roundOptions.map((rounds) {
                        final isSelected = _teamRounds == rounds;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() => _teamRounds = rounds);
                              _storageService.setTeamRounds(rounds);
                              AudioService().lightImpact();
                              Navigator.of(ctx).pop();
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              decoration: BoxDecoration(
                                color:
                                    isSelected
                                        ? AppTheme.teamAColor
                                        : (isDark
                                            ? AppTheme.darkSurfaceColor
                                            : Colors.white),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color:
                                      isSelected
                                          ? AppTheme.teamAColor
                                          : theme.dividerColor.withAlpha(40),
                                  width: isSelected ? 2 : 1,
                                ),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    "$rounds",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 20,
                                      color:
                                          isSelected
                                              ? Colors.black
                                              : (isDark
                                                  ? AppTheme.darkTextColor
                                                  : AppTheme.lightTextColor),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    rounds == 1 ? "ROUND" : "ROUNDS",
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 10,
                                      letterSpacing: 1,
                                      color:
                                          isSelected
                                              ? Colors.black.withAlpha(180)
                                              : theme.hintColor,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        );
      },
    );
  }

  void handleStartGame() {
    ScaffoldMessenger.of(context).clearSnackBars();
    if (selectedCategories.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select at least 1 deck to play!")),
      );
      return;
    }

    _storageService.setLastCategoryIds(
      selectedCategories.map((c) => c.id).toList(),
    );
    final gameTime = _gameDuration;
    final teamState =
        _isTeamMode
            ? TeamMatchState(isTeamMode: true, maxRounds: _teamRounds)
            : null;

    if (_storageService.dontShowHowToPlay) {
      Navigator.of(context).pushReplacement(
        CupertinoPageRoute(
          builder:
              (_) => GameScreen(
                time: gameTime,
                selectedCategories: selectedCategories,
                teamMatchState: teamState,
              ),
        ),
      );
    } else {
      Navigator.of(context).push(
        CupertinoPageRoute(
          builder:
              (_) => OnboardingScreen(
                isRevisiting: false,
                selectedCategories: selectedCategories,
                gameTime: gameTime,
                teamMatchState: teamState,
              ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text("CHOOSE DECKS"),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline_rounded, size: 28),
            tooltip: "Create Custom Deck",
            onPressed: () => _openCreateCustomDeckScreen(),
          ),
        ],
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 8.0,
                ),
                child: Column(
                  children: [
                    // --- 1. Category Filter Tabs ---
                    Row(
                      children:
                          ['All', 'Built-in', 'Custom'].map((tab) {
                            final isSelected = _selectedTab == tab;
                            return Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _selectedTab = tab;
                                    _filterCategories();
                                  });
                                  AudioService().extraLightImpact();
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  margin: const EdgeInsets.symmetric(
                                    horizontal: 4,
                                  ),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 10,
                                  ),
                                  decoration: BoxDecoration(
                                    color:
                                        isSelected
                                            ? AppTheme.darkPrimaryColor
                                            : (isDark
                                                ? AppTheme.darkSurfaceColor
                                                : Colors.white),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color:
                                          isSelected
                                              ? AppTheme.darkPrimaryColor
                                              : theme.dividerColor.withAlpha(
                                                40,
                                              ),
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      tab,
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 13,
                                        color:
                                            isSelected
                                                ? AppTheme.darkAccentColor
                                                : theme
                                                    .textTheme
                                                    .bodyMedium
                                                    ?.color,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                    ),

                    const SizedBox(height: 10),

                    // --- 4. Select All & Selection Pill Header ---
                    Row(
                      children: [
                        Checkbox(
                          value:
                              displayedCategories.isNotEmpty &&
                              displayedCategories.every(
                                (c) => selectedCategories.contains(c),
                              ),
                          onChanged: toggleAllCategories,
                          activeColor: AppTheme.darkPrimaryColor,
                          checkColor: AppTheme.darkAccentColor,
                        ),
                        GestureDetector(
                          onTap:
                              () => toggleAllCategories(
                                !displayedCategories.every(
                                  (c) => selectedCategories.contains(c),
                                ),
                              ),
                          child: const Text(
                            "Select All",
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.darkPrimaryColor.withAlpha(35),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            "${selectedCategories.length} Selected",
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 12,
                              color: AppTheme.darkPrimaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 6), // --- 5. Decks Grid ---
                    Expanded(
                      child: RefreshIndicator(
                        color: AppTheme.darkPrimaryColor,
                        onRefresh: () async {
                          AudioService().lightImpact();
                          final messenger = ScaffoldMessenger.of(context);
                          await _loadDecksAndCategories(forceRefresh: true);
                          if (!mounted) return;
                          messenger.showSnackBar(
                            const SnackBar(
                              content: Text(
                                "Refreshed decks & cards from server!",
                              ),
                              duration: Duration(seconds: 1),
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        child:
                            displayedCategories.isEmpty
                                ? Center(
                                  child: Padding(
                                    padding: const EdgeInsets.all(24.0),
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          _selectedTab == 'Custom'
                                              ? "No Custom Decks Yet"
                                              : "No Decks Available",
                                          style: theme.textTheme.titleMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                        const SizedBox(height: 12),
                                        if (_selectedTab == 'Custom')
                                          ElevatedButton.icon(
                                            onPressed:
                                                () =>
                                                    _openCreateCustomDeckScreen(),
                                            icon: const Icon(Icons.add_rounded),
                                            label: const Text(
                                              "Create Custom Deck",
                                            ),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  AppTheme.darkPrimaryColor,
                                              foregroundColor:
                                                  AppTheme.darkAccentColor,
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(16),
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                )
                                : GridView.builder(
                                  physics: const AlwaysScrollableScrollPhysics(
                                    parent: BouncingScrollPhysics(),
                                  ),
                                  gridDelegate:
                                      const SliverGridDelegateWithFixedCrossAxisCount(
                                        crossAxisCount: 3,
                                        crossAxisSpacing: 10,
                                        mainAxisSpacing: 10,
                                        childAspectRatio: 0.85,
                                      ),
                                  itemCount: displayedCategories.length,
                                  itemBuilder: (context, index) {
                                    final category = displayedCategories[index];
                                    final isSelected = selectedCategories
                                        .contains(category);
                                    return _buildDeckCard(
                                      category,
                                      isSelected,
                                      theme,
                                    );
                                  },
                                ),
                      ),
                    ),
                  ],
                ),
              ),
      bottomNavigationBar:
          _isLoading
              ? null
              : Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: theme.scaffoldBackgroundColor,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(isDark ? 40 : 15),
                      blurRadius: 8,
                      offset: const Offset(0, -3),
                    ),
                  ],
                ),
                child: SafeArea(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Mode Switcher: Solo vs Team Battle
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color:
                              isDark ? AppTheme.darkSurfaceColor : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: theme.dividerColor.withAlpha(40),
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  setState(() => _isTeamMode = false);
                                  _storageService.setTeamMode(false);
                                  AudioService().extraLightImpact();
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color:
                                        !_isTeamMode
                                            ? AppTheme.darkPrimaryColor
                                            : Colors.transparent,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "⚡ Solo / Quick Match",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 12,
                                        color:
                                            !_isTeamMode
                                                ? AppTheme.darkAccentColor
                                                : theme.hintColor,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: GestureDetector(
                                onTap: () {
                                  setState(() => _isTeamMode = true);
                                  _storageService.setTeamMode(true);
                                  AudioService().extraLightImpact();
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 8,
                                  ),
                                  decoration: BoxDecoration(
                                    color:
                                        _isTeamMode
                                            ? AppTheme.darkPrimaryColor
                                            : Colors.transparent,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "Team Battle 🩵🩷",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 12,
                                        color:
                                            _isTeamMode
                                                ? AppTheme.darkAccentColor
                                                : theme.hintColor,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 6),

                      // Quick-Pills Row: Time & Rounds
                      Row(
                        children: [
                          // Duration Quick Pill
                          Expanded(
                            child: GestureDetector(
                              onTap: () => _showDurationPickerSheet(theme),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 7,
                                ),
                                decoration: BoxDecoration(
                                  color:
                                      isDark
                                          ? AppTheme.darkSurfaceColor
                                          : Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: theme.dividerColor.withAlpha(40),
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    const Icon(
                                      Icons.timer_outlined,
                                      size: 14,
                                      color: AppTheme.darkPrimaryColor,
                                    ),
                                    const SizedBox(width: 5),
                                    Text(
                                      "$_gameDuration sec",
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w800,
                                        fontSize: 12,
                                      ),
                                    ),
                                    const SizedBox(width: 2),
                                    Icon(
                                      Icons.arrow_drop_down_rounded,
                                      size: 16,
                                      color: theme.hintColor,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          if (_isTeamMode) ...[
                            const SizedBox(width: 8),
                            // Rounds Quick Pill
                            Expanded(
                              child: GestureDetector(
                                onTap: () => _showRoundsPickerSheet(theme),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 7,
                                  ),
                                  decoration: BoxDecoration(
                                    color:
                                        isDark
                                            ? AppTheme.darkSurfaceColor
                                            : Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: AppTheme.teamAColor.withAlpha(80),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Icon(
                                        Icons.repeat_rounded,
                                        size: 14,
                                        color: AppTheme.teamAColor,
                                      ),
                                      const SizedBox(width: 5),
                                      Text(
                                        "$_teamRounds ${_teamRounds == 1 ? 'Round' : 'Rounds'}",
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 12,
                                        ),
                                      ),
                                      const SizedBox(width: 2),
                                      Icon(
                                        Icons.arrow_drop_down_rounded,
                                        size: 16,
                                        color: theme.hintColor,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),

                      const SizedBox(height: 8),

                      // Anchored Start Button
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          onPressed: handleStartGame,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.darkPrimaryColor,
                            foregroundColor: AppTheme.darkAccentColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                            elevation: 4,
                            shadowColor: AppTheme.darkPrimaryColor.withAlpha(
                              120,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Flexible(
                                child: FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Text(
                                    selectedCategories.isEmpty
                                        ? "SELECT A DECK"
                                        : (_isTeamMode
                                            ? "START TEAM BATTLE (${AppTheme.teamAName.toUpperCase()}) ${AppTheme.teamAEmoji}"
                                            : "START GUESSING!"),
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 1.1,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(Icons.play_arrow_rounded, size: 28),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
    );
  }

  Widget _buildDeckCard(Category category, bool isSelected, ThemeData theme) {
    final isDark = theme.brightness == Brightness.dark;
    final cardColor = category.themeColor;
    final isCustom =
        category.id.startsWith('custom') ||
        customDecks.any((cd) => cd.id == category.id);

    return GestureDetector(
      onTap: () => toggleCategory(category),
      onLongPress: () => _showAdminDeckDialog(category),
      child: AnimatedScale(
        scale: isSelected ? 1.03 : 1.0,
        duration: const Duration(milliseconds: 180),
        curve: Curves.easeOutBack,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color:
                isSelected
                    ? cardColor.withAlpha(isDark ? 25 : 18)
                    : (isDark ? AppTheme.darkSurfaceColor : Colors.white),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: isSelected ? cardColor : theme.dividerColor.withAlpha(40),
              width: isSelected ? 2.5 : 1.2,
            ),
            boxShadow:
                isSelected
                    ? [
                      BoxShadow(
                        color: cardColor.withAlpha(45),
                        blurRadius: 8,
                        spreadRadius: 0,
                        offset: const Offset(0, 2),
                      ),
                    ]
                    : [
                      BoxShadow(
                        color: Colors.black.withAlpha(isDark ? 30 : 10),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
          ),
          child: Stack(
            children: [
              // Top Right Selection Badge
              if (isSelected)
                Positioned(
                  top: 6,
                  right: 6,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: cardColor,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_rounded,
                      size: 14,
                      color: Colors.black,
                    ),
                  ),
                ),

              // Top Left Info Trigger Button
              Positioned(
                top: 4,
                left: 4,
                child: IconButton(
                  icon: const Icon(Icons.info_outline_rounded, size: 18),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: () => _showDeckPreviewSheet(category),
                ),
              ),

              // Top Right Action Buttons (Delete icon for custom)
              if (isCustom)
                Positioned(
                  top: 4,
                  right: isSelected ? 26 : 4,
                  child: IconButton(
                    icon: const Icon(
                      Icons.delete_outline_rounded,
                      size: 18,
                      color: Colors.redAccent,
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    tooltip: "Delete Custom Deck",
                    onPressed: () => _confirmDeleteCustomDeck(category),
                  ),
                ),

              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6.0,
                    vertical: 8.0,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color:
                              isSelected
                                  ? cardColor.withAlpha(35)
                                  : (isDark
                                      ? Colors.black26
                                      : Colors.black.withAlpha(10)),
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          category.icon,
                          style: const TextStyle(fontSize: 24),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        category.name,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                          height: 1.15,
                          color:
                              isDark
                                  ? AppTheme.darkTextColor
                                  : AppTheme.lightTextColor,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
