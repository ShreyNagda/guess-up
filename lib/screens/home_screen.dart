import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/onboarding_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:guess_up/widgets/quick_settings_modal.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final CategoryService _categoryService = CategoryService();
  final StorageService _storageService = StorageService();
  final AudioService _audioService = AudioService();

  late PageController _pageController;
  double _currentPage = 0.0;
  int _focusedIndex = 0;

  List<Category> _decks = [];
  Set<String> _selectedDeckIds = {};
  bool _isLoading = true;
  StreamSubscription<List<Category>>? _decksSubscription;

  // HUD Config States
  late bool _isTeamMode;
  late int _gameDuration;
  late int _teamRounds;
  bool _isPlayPressed = false;

  final List<int> _timeOptions = [30, 45, 60, 90, 120, 180];
  final List<int> _roundOptions = [3, 5, 7, 10];

  @override
  void initState() {
    super.initState();
    _setPortraitOnly();
    _audioService.playBackgroundMusic();

    // 1. Load persisted game preferences
    _isTeamMode = _storageService.isTeamMode;
    _gameDuration = _storageService.gameDuration;
    if (!_timeOptions.contains(_gameDuration)) {
      _gameDuration = 60;
    }
    _teamRounds = _storageService.teamRounds;
    if (!_roundOptions.contains(_teamRounds)) {
      _teamRounds = 3;
    }

    // 2. Initialize PageController
    _pageController = PageController(viewportFraction: 0.70, initialPage: 0)
      ..addListener(_handlePageScroll);

    // 3. Load Decks & Listen to real-time decks stream from Firestore
    _subscribeToDecks();
  }

  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  void _handlePageScroll() {
    if (_pageController.hasClients) {
      setState(() {
        _currentPage =
            _pageController.page ?? _pageController.initialPage.toDouble();
      });
    }
  }

  Future<void> _subscribeToDecks() async {
    final customDecks = _storageService.getCustomDecks();
    final initialDecks = await _categoryService.getAllCategories();

    final combined = _mergeDecks(customDecks, initialDecks);
    if (!mounted) return;

    final persistedCategoryIds = _storageService.getLastCategoryIds();
    final Set<String> initialSelected = {};

    if (persistedCategoryIds.isNotEmpty) {
      for (final id in persistedCategoryIds) {
        if (combined.any((d) => d.id == id)) {
          initialSelected.add(id);
        }
      }
    }

    if (initialSelected.isEmpty && combined.isNotEmpty) {
      initialSelected.add(combined.first.id);
    }

    if (_isTeamMode && initialSelected.length > 1) {
      final first = initialSelected.first;
      initialSelected.clear();
      initialSelected.add(first);
    }

    int targetIndex = 0;
    if (initialSelected.isNotEmpty) {
      final idx = combined.indexWhere((d) => d.id == initialSelected.first);
      if (idx >= 0) targetIndex = idx;
    }

    setState(() {
      _decks = combined;
      _selectedDeckIds = initialSelected;
      _focusedIndex = targetIndex;
      _isLoading = false;
    });

    if (targetIndex > 0 && _pageController.hasClients) {
      _pageController.jumpToPage(targetIndex);
    }

    _decksSubscription = _categoryService.streamDecks().listen((
      firestoreDecks,
    ) {
      if (!mounted) return;
      final currentCustom = _storageService.getCustomDecks();
      final updated = _mergeDecks(currentCustom, firestoreDecks);
      setState(() {
        _decks = updated;
        _selectedDeckIds.removeWhere((id) => !updated.any((d) => d.id == id));
        if (_selectedDeckIds.isEmpty && updated.isNotEmpty) {
          _selectedDeckIds.add(updated.first.id);
        }
        if (_focusedIndex >= _decks.length) {
          _focusedIndex = (_decks.length - 1).clamp(0, _decks.length);
        }
      });
    });
  }

  List<Category> _mergeDecks(List<Category> custom, List<Category> remote) {
    final list = <Category>[...custom];
    for (final r in remote) {
      if (!list.any((d) => d.id == r.id)) {
        list.add(r);
      }
    }
    list.sort((a, b) {
      if (a.isTrending != b.isTrending) return a.isTrending ? -1 : 1;
      if (a.sortOrder != b.sortOrder) return a.sortOrder.compareTo(b.sortOrder);
      return a.title.compareTo(b.title);
    });
    return list;
  }

  @override
  void dispose() {
    _decksSubscription?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  Category get _activeDeck {
    if (_decks.isEmpty) {
      return Category(
        id: "fallback",
        name: "Party Charades",
        icon: "👑",
        colorHex: "#E50914",
        gradientEnd: "#8B0000",
        words: ["Guess Up", "Charades", "Party Time"],
      );
    }
    final index = _focusedIndex.clamp(0, _decks.length - 1);
    return _decks[index];
  }

  List<Category> get _selectedDecks {
    return _decks.where((d) => _selectedDeckIds.contains(d.id)).toList();
  }

  void _onDeckSnapped(int index) {
    if (_focusedIndex != index) {
      _audioService.extraLightImpact();
      HapticFeedback.lightImpact();
      setState(() {
        _focusedIndex = index;
      });
      if (index < _decks.length) {
        _storageService.setLastDeckId(_decks[index].id);
      }
    }
  }

  void _toggleDeckSelection(Category deck, int cardIndex) {
    if (_focusedIndex != cardIndex && _pageController.hasClients) {
      _pageController.animateToPage(
        cardIndex,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
      );
    }

    setState(() {
      if (_isTeamMode) {
        // Team Mode: strictly single-deck radio lock
        _selectedDeckIds = {deck.id};
      } else {
        // Solo Mode: multi-deck mix & match toggle
        if (_selectedDeckIds.contains(deck.id)) {
          _selectedDeckIds.remove(deck.id);
        } else {
          _selectedDeckIds.add(deck.id);
        }
      }
    });

    _storageService.setLastCategoryIds(_selectedDeckIds.toList());
  }

  void _removeDeckFromSelection(String deckId) {
    _audioService.extraLightImpact();
    HapticFeedback.lightImpact();
    setState(() {
      _selectedDeckIds.remove(deckId);
    });
    _storageService.setLastCategoryIds(_selectedDeckIds.toList());
  }

  void _showDeckDescriptionModal(Category deck) {
    _audioService.lightImpact();
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (modalCtx) {
        final theme = Theme.of(modalCtx);
        final isDark = theme.brightness == Brightness.dark;
        final deckColor = deck.themeColor;

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 24.0,
              vertical: 24.0,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: theme.dividerColor.withAlpha(100),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: deckColor.withAlpha(isDark ? 50 : 35),
                        shape: BoxShape.circle,
                        border: Border.all(color: deckColor, width: 2),
                      ),
                      child: Center(
                        child: Text(
                          deck.icon,
                          style: const TextStyle(fontSize: 28),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            deck.title.toUpperCase(),
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w900,
                              fontSize: 18,
                              letterSpacing: 1.0,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: deckColor.withAlpha(40),
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: theme.scaffoldBackgroundColor,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: theme.dividerColor.withAlpha(50)),
                  ),
                  child: Text(
                    deck.categoryDescription,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      height: 1.4,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(modalCtx).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: deckColor,
                      foregroundColor: Colors.black87,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      "GOT IT",
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _switchGameMode(bool isTeam) {
    _audioService.extraLightImpact();
    HapticFeedback.lightImpact();
    setState(() {
      _isTeamMode = isTeam;
      if (isTeam) {
        if (_selectedDeckIds.length > 1) {
          final firstId = _selectedDeckIds.first;
          _selectedDeckIds = {firstId};
        } else if (_selectedDeckIds.isEmpty && _decks.isNotEmpty) {
          _selectedDeckIds = {_activeDeck.id};
        }
      }
    });
    _storageService.setTeamMode(isTeam);
    _storageService.setLastCategoryIds(_selectedDeckIds.toList());
  }

  void _handleStartGame() {
    final selected = _selectedDecks;
    if (selected.isEmpty) return;

    _audioService.extraLightImpact();

    _storageService.setLastCategoryIds(_selectedDeckIds.toList());
    _storageService.setLastDeckId(selected.first.id);
    _storageService.setGameDuration(_gameDuration);
    _storageService.setTeamMode(_isTeamMode);
    _storageService.setTeamRounds(_teamRounds);

    final teamState =
        _isTeamMode
            ? TeamMatchState(isTeamMode: true, maxRounds: _teamRounds)
            : null;

    if (_storageService.dontShowHowToPlay) {
      Navigator.of(context).push(
        CupertinoPageRoute(
          builder:
              (_) => GameScreen(
                time: _gameDuration,
                selectedCategories: selected,
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
                selectedCategories: selected,
                gameTime: _gameDuration,
                teamMatchState: teamState,
              ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeDeck = _activeDeck;
    final activeColor = activeDeck.themeColor;
    final selectedDecks = _selectedDecks;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? const Color(0xFF121212) : const Color(0xFFF6F7FA),
      body: AmbientBackground(
        ambientColor: activeColor,
        child: SafeArea(
          child: Column(
            children: [
              // 1. TOP BAR
              _buildTopBar(isDark),
              const SizedBox(height: 6),
              // 2. CAROUSEL REEL
              Expanded(
                flex: 5,
                child:
                    _isLoading
                        ? Center(
                          child: CircularProgressIndicator(
                            color:
                                isDark
                                    ? AppTheme.darkPrimaryColor
                                    : AppTheme.lightPrimaryColor,
                            strokeWidth: 3,
                          ),
                        )
                        : _buildCarousel(isDark),
              ),

              const SizedBox(height: 8),

              // 3. DYNAMIC SELECTED DECKS CHIP TRAY WITH MODE GUIDANCE
              _buildSelectedDecksChipTray(selectedDecks, isDark),
              const SizedBox(height: 10),

              // 4. STICKY ACTION HUD WITH DROPDOWNS
              _buildStickyActionHUD(selectedDecks, isDark),

              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(bool isDark) {
    final iconColor = isDark ? Colors.white : Colors.black87;
    final titleColor = isDark ? Colors.white : Colors.black;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: Icon(Icons.settings_outlined, size: 28, color: iconColor),
            tooltip: "Settings",
            onPressed: () => QuickSettingsModal.show(context),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                "GUESS UP",
                style: TextStyle(
                  fontFamily: 'Manrope',
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 3,
                  color: titleColor,
                  shadows: [
                    Shadow(
                      color: (isDark
                              ? AppTheme.darkPrimaryColor
                              : AppTheme.lightPrimaryColor)
                          .withAlpha(140),
                      blurRadius: 12,
                      offset: const Offset(0, 0),
                    ),
                  ],
                ),
              ),
            ],
          ),
          IconButton(
            icon: Icon(Icons.help_outline_rounded, size: 26, color: iconColor),
            tooltip: "How to Play",
            onPressed: () {
              _audioService.extraLightImpact();
              Navigator.of(context).push(
                CupertinoPageRoute(
                  builder: (_) => const OnboardingScreen(isRevisiting: true),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCarousel(bool isDark) {
    return PageView.builder(
      controller: _pageController,
      physics: const BouncingScrollPhysics(),
      onPageChanged: _onDeckSnapped,
      itemCount: _decks.length,
      itemBuilder: (context, index) {
        final deck = _decks[index];
        final double pageOffset = (_currentPage - index);

        final double dist = pageOffset.abs().clamp(0.0, 1.0);
        final double scale = 1.10 - (dist * (1.10 - 0.85));
        final bool isSelected = _selectedDeckIds.contains(deck.id);

        final double effectiveOpacity = (1.0 - (dist * 0.30)).clamp(0.70, 1.0);

        return Center(
          child: AnimatedScale(
            scale: scale,
            duration: const Duration(milliseconds: 100),
            curve: Curves.easeOut,
            child: Opacity(
              opacity: effectiveOpacity,
              child: GestureDetector(
                onTap: () => _toggleDeckSelection(deck, index),
                child: _buildDeckCard(deck, isSelected, dist < 0.35, isDark),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDeckCard(
    Category deck,
    bool isSelected,
    bool isFocused,
    bool isDark,
  ) {
    final deckColor = deck.themeColor;
    final gradientEnd = deck.gradientEndColor;

    return AspectRatio(
      aspectRatio: 3 / 4,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(26),
          gradient: LinearGradient(
            colors: [deckColor, gradientEnd],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border:
              isSelected
                  ? Border.all(color: Colors.white, width: 3.5)
                  : Border.all(color: Colors.white.withAlpha(60), width: 1.5),
          boxShadow:
              isSelected
                  ? [
                    BoxShadow(
                      color: deckColor.withAlpha(200),
                      blurRadius: 28,
                      spreadRadius: 3,
                      offset: const Offset(0, 8),
                    ),
                  ]
                  : [
                    BoxShadow(
                      color: Colors.black.withAlpha(isDark ? 80 : 35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(23),
          child: Stack(
            children: [
              Positioned(
                top: -30,
                right: -30,
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withAlpha(20),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color:
                        isSelected
                            ? Colors.black.withAlpha(160)
                            : Colors.black.withAlpha(100),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color:
                          isSelected
                              ? Colors.white.withAlpha(180)
                              : Colors.white.withAlpha(40),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _isTeamMode
                            ? (isSelected
                                ? Icons.military_tech_rounded
                                : Icons.add_rounded)
                            : (isSelected
                                ? Icons.check_circle_rounded
                                : Icons.add_rounded),
                        size: 14,
                        color: isSelected ? Colors.white : Colors.white70,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _isTeamMode
                            ? (isSelected ? "ACTIVE BATTLE" : "SELECT")
                            : (isSelected ? "ACTIVE" : "SELECT"),
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.white70,
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                      if (deck.isTrending) ...[
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.local_fire_department_rounded,
                          size: 14,
                          color: Colors.orangeAccent,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              Positioned(
                top: 10,
                right: 10,
                child: GestureDetector(
                  onTap: () => _showDeckDescriptionModal(deck),
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: Colors.black.withAlpha(120),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white.withAlpha(80),
                        width: 1,
                      ),
                    ),
                    child: const Icon(
                      Icons.info_outline_rounded,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
              ),
              Center(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16.0, 42.0, 16.0, 16.0),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(deck.icon, style: const TextStyle(fontSize: 52)),
                        const SizedBox(height: 8),
                        Text(
                          deck.title.toUpperCase(),
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.1,
                            shadows: [
                              Shadow(
                                color: Colors.black54,
                                blurRadius: 6,
                                offset: Offset(0, 2),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "${deck.count} WORDS",
                          style: TextStyle(
                            color: Colors.white.withAlpha(200),
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSelectedDecksChipTray(
    List<Category> selectedDecks,
    bool isDark,
  ) {
    final titleColor = isDark ? Colors.white70 : Colors.black87;
    final chipBg = isDark ? const Color(0xFF222222) : Colors.white;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with Guidance Cue
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _isTeamMode
                        ? "ACTIVE BATTLE DECK"
                        : "SELECTED DECKS (${selectedDecks.length})",
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                      color: titleColor,
                    ),
                  ),
                  Row(
                    children: [
                      Icon(
                        _isTeamMode
                            ? Icons.shield_rounded
                            : Icons.stars_rounded,
                        size: 14,
                        color:
                            _isTeamMode
                                ? (isDark
                                    ? Colors.amberAccent
                                    : Colors.deepOrange)
                                : (isDark
                                    ? AppTheme.darkPrimaryColor
                                    : const Color(0xFFD97706)),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _isTeamMode
                            ? "1 Deck Locked for Fair Play (Team A vs Team B)"
                            : "Mix & Match any decks for a custom party!",
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color:
                              _isTeamMode
                                  ? (isDark
                                      ? Colors.amberAccent
                                      : Colors.deepOrange)
                                  : (isDark
                                      ? AppTheme.darkPrimaryColor
                                      : const Color(0xFFD97706)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              // if (!_isTeamMode && selectedDecks.isNotEmpty)
              //   Text(
              //     "$_totalSelectedWords Words",
              //     style: TextStyle(
              //       fontSize: 11,
              //       fontWeight: FontWeight.w800,
              //       color: isDark ? Colors.white60 : Colors.black54,
              //     ),
              //   ),
            ],
          ),
          const SizedBox(height: 6),

          // Horizontal Chips List
          SizedBox(
            height: 38,
            child:
                selectedDecks.isEmpty
                    ? Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red.withAlpha(isDark ? 30 : 20),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.withAlpha(100)),
                        ),
                        child: const Text(
                          "⚠️ Tap a deck above to select",
                          style: TextStyle(
                            color: Colors.redAccent,
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                    )
                    : ListView.separated(
                      scrollDirection: Axis.horizontal,
                      physics: const BouncingScrollPhysics(),
                      itemCount: selectedDecks.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 8),
                      itemBuilder: (context, index) {
                        final deck = selectedDecks[index];
                        final deckColor = deck.themeColor;

                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: chipBg,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: deckColor.withAlpha(160),
                              width: 1.2,
                            ),
                            boxShadow:
                                isDark
                                    ? []
                                    : [
                                      BoxShadow(
                                        color: Colors.black.withAlpha(15),
                                        blurRadius: 4,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                deck.icon,
                                style: const TextStyle(fontSize: 14),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                "${deck.title} (${deck.count})",
                                style: TextStyle(
                                  color: isDark ? Colors.white : Colors.black87,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              if (!_isTeamMode) ...[
                                const SizedBox(width: 6),
                                GestureDetector(
                                  onTap:
                                      () => _removeDeckFromSelection(deck.id),
                                  child: Container(
                                    padding: const EdgeInsets.all(2),
                                    decoration: BoxDecoration(
                                      color:
                                          isDark
                                              ? Colors.white.withAlpha(30)
                                              : Colors.black.withAlpha(15),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      Icons.close_rounded,
                                      size: 14,
                                      color:
                                          isDark
                                              ? Colors.white70
                                              : Colors.black54,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        );
                      },
                    ),
          ),
        ],
      ),
    );
  }

  Widget _buildStickyActionHUD(List<Category> selectedDecks, bool isDark) {
    final bool hasSelection = selectedDecks.isNotEmpty;
    final int totalDecks = selectedDecks.length;
    final hudSurface = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final primaryGlowColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 1. Mode Selector Toggle: [ ⚡ Solo (Mix & Match) ] vs [ ⚔️ Team Battle ]
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: hudSurface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color:
                    isDark
                        ? Colors.white.withAlpha(20)
                        : Colors.black.withAlpha(15),
              ),
              boxShadow:
                  isDark
                      ? []
                      : [
                        BoxShadow(
                          color: Colors.black.withAlpha(10),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => _switchGameMode(false),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color:
                            !_isTeamMode
                                ? primaryGlowColor
                                : Colors.transparent,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.bolt_rounded,
                              size: 16,
                              color:
                                  !_isTeamMode
                                      ? (isDark ? Colors.black : Colors.black)
                                      : (isDark
                                          ? Colors.white60
                                          : Colors.black54),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              "Solo (Mix & Match)",
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 12,
                                color:
                                    !_isTeamMode
                                        ? (isDark ? Colors.black : Colors.black)
                                        : (isDark
                                            ? Colors.white60
                                            : Colors.black54),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => _switchGameMode(true),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color:
                            _isTeamMode ? primaryGlowColor : Colors.transparent,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.groups_rounded,
                              size: 16,
                              color:
                                  _isTeamMode
                                      ? (isDark ? Colors.black : Colors.black)
                                      : (isDark
                                          ? Colors.white60
                                          : Colors.black54),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              "Team Battle",
                              style: TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 12,
                                color:
                                    _isTeamMode
                                        ? (isDark ? Colors.black : Colors.black)
                                        : (isDark
                                            ? Colors.white60
                                            : Colors.black54),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // 2. Dropdowns Row: Timer Selector + Team Rounds Selector
          Row(
            children: [
              // Timer Dropdown Pill
              Expanded(
                child: _buildDropdownPill<int>(
                  icon: Icons.timer_outlined,
                  value: _gameDuration,
                  label: "$_gameDuration s Timer",
                  items:
                      _timeOptions.map((t) {
                        return DropdownMenuItem<int>(
                          value: t,
                          child: Text(
                            "$t Seconds",
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                              color: isDark ? Colors.white : Colors.black87,
                            ),
                          ),
                        );
                      }).toList(),
                  onChanged: (newTime) {
                    if (newTime != null) {
                      _audioService.extraLightImpact();
                      setState(() => _gameDuration = newTime);
                      _storageService.setGameDuration(newTime);
                    }
                  },
                  isDark: isDark,
                ),
              ),

              // Conditional Team Rounds Dropdown Pill
              if (_isTeamMode) ...[
                const SizedBox(width: 10),
                Expanded(
                  child: _buildDropdownPill<int>(
                    icon: Icons.military_tech_outlined,
                    value: _teamRounds,
                    label: "$_teamRounds Rounds",
                    items:
                        _roundOptions.map((r) {
                          return DropdownMenuItem<int>(
                            value: r,
                            child: Text(
                              "$r Rounds",
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                          );
                        }).toList(),
                    onChanged: (newRounds) {
                      if (newRounds != null) {
                        _audioService.extraLightImpact();
                        setState(() => _teamRounds = newRounds);
                        _storageService.setTeamRounds(newRounds);
                      }
                    },
                    isDark: isDark,
                  ),
                ),
              ],
            ],
          ),

          const SizedBox(height: 12),

          // 3. Primary Play CTA Button
          GestureDetector(
            onTapDown:
                hasSelection
                    ? (_) => setState(() => _isPlayPressed = true)
                    : null,
            onTapUp:
                hasSelection
                    ? (_) {
                      setState(() => _isPlayPressed = false);
                      _handleStartGame();
                    }
                    : null,
            onTapCancel: () => setState(() => _isPlayPressed = false),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 100),
              height: 56,
              width: double.infinity,
              transform: Matrix4.translationValues(
                0,
                _isPlayPressed ? 4 : 0,
                0,
              ),
              decoration: BoxDecoration(
                color:
                    !hasSelection
                        ? (isDark
                            ? const Color(0xFF333333)
                            : const Color(0xFFD1D5DB))
                        : primaryGlowColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow:
                    _isPlayPressed || !hasSelection
                        ? []
                        : [
                          BoxShadow(
                            color: primaryGlowColor.withAlpha(160),
                            blurRadius: 18,
                            offset: const Offset(0, 6),
                          ),
                        ],
              ),
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Text(
                            !hasSelection
                                ? "Select at least 1 deck"
                                : _isTeamMode
                                ? "TEAM BATTLE (${selectedDecks.first.title.toUpperCase()} • ${_gameDuration}s)"
                                : "PLAY SOLO ($totalDecks DECKS • ${_gameDuration}s)",
                            style: TextStyle(
                              color:
                                  !hasSelection
                                      ? (isDark
                                          ? Colors.white38
                                          : Colors.black38)
                                      : Colors.black,
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.1,
                            ),
                          ),
                        ),
                      ),
                      if (hasSelection) ...[
                        const SizedBox(width: 8),
                        const Icon(
                          Icons.play_arrow_rounded,
                          color: Colors.black,
                          size: 28,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Dropdown Pill Widget ---
  Widget _buildDropdownPill<T>({
    required IconData icon,
    required T value,
    required String label,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
    required bool isDark,
  }) {
    final hudSurface = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final borderColor =
        isDark ? Colors.white.withAlpha(25) : Colors.black.withAlpha(20);
    final textColor = isDark ? Colors.white : Colors.black87;

    return Container(
      height: 42,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: hudSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        boxShadow:
            isDark
                ? []
                : [
                  BoxShadow(
                    color: Colors.black.withAlpha(10),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          icon: Icon(
            Icons.keyboard_arrow_down_rounded,
            color: textColor.withAlpha(180),
            size: 20,
          ),
          dropdownColor: isDark ? const Color(0xFF242424) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          isExpanded: true,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w900,
            color: textColor,
          ),
          items: items,
          onChanged: onChanged,
        ),
      ),
    );
  }
}
