import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guess_up/blocs/deck/deck_cubit.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/create_custom_deck_screen.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/onboarding_screen.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:guess_up/widgets/arcade_page_route.dart';
import 'package:guess_up/widgets/bouncy_game_button.dart';
import 'package:guess_up/widgets/quick_settings_modal.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final CategoryService _categoryService = CategoryService();
  final GameStorageService _storageService = GameStorageService();
  final GameAudioEngine _audioEngine = GameAudioEngine();

  List<Category> _decks = [];
  Set<String> _selectedDeckIds = {};
  bool _isLoading = true;
  StreamSubscription<List<Category>>? _decksSubscription;

  // HUD Config States
  late bool _isTeamMode;
  late int _gameDuration;
  late int _teamRounds;

  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<int> _timeOptions = [30, 45, 60, 90, 120, 180];
  final List<int> _roundOptions = [3, 5, 7, 10];

  List<Category> get _filteredDecks {
    if (_searchQuery.trim().isEmpty) return _decks;
    final q = _searchQuery.trim().toLowerCase();
    return _decks.where((deck) {
      final nameMatch = deck.name.toLowerCase().contains(q);
      final descMatch = deck.categoryDescription.toLowerCase().contains(q);
      return nameMatch || descMatch;
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _setPortraitOnly();
    _audioEngine.startBgm();

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

    // 2. Load Decks & Listen to real-time decks stream
    _subscribeToDecks();
  }

  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  Future<void> _subscribeToDecks() async {
    final customDecks = _storageService.getCustomDecks();
    final initialDecks = await _categoryService.getAllCategories();

    final combined = _mergeDecks(customDecks, initialDecks);
    if (!mounted) return;

    final persistedCategoryIds = _storageService.getLastCategoryIds();
    String targetId = combined.isNotEmpty ? combined.first.id : "";

    if (persistedCategoryIds.isNotEmpty) {
      for (final id in persistedCategoryIds) {
        if (combined.any((d) => d.id == id)) {
          targetId = id;
          break;
        }
      }
    }

    setState(() {
      _decks = combined;
      _selectedDeckIds = {targetId};
      _isLoading = false;
    });

    _decksSubscription = _categoryService.streamDecks().listen((
      firestoreDecks,
    ) {
      if (!mounted) return;
      final currentCustom = _storageService.getCustomDecks();
      final updated = _mergeDecks(currentCustom, firestoreDecks);
      setState(() {
        _decks = updated;
        if (!_selectedDeckIds.any((id) => updated.any((d) => d.id == id))) {
          if (updated.isNotEmpty) {
            _selectedDeckIds = {updated.first.id};
          }
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
      return a.name.compareTo(b.name);
    });
    return list;
  }

  @override
  void dispose() {
    _searchController.dispose();
    _decksSubscription?.cancel();
    super.dispose();
  }

  Category get _activeDeck {
    if (_decks.isEmpty) {
      return Category(
        id: "fallback",
        name: "Party Charades",
        icon: "👑",
        color: "#E50914",
        gradientEnd: "#8B0000",
        words: ["Guess Up", "Charades", "Party Time"],
      );
    }
    final selected =
        _decks.where((d) => _selectedDeckIds.contains(d.id)).toList();
    if (selected.isNotEmpty) return selected.first;
    return _decks.first;
  }

  List<Category> get _selectedDecks {
    return [_activeDeck];
  }

  void _selectDeck(Category deck) {
    _audioEngine.extraLightImpact();
    HapticFeedback.lightImpact();
    setState(() {
      _selectedDeckIds = {deck.id};
    });
    _storageService.setLastDeckId(deck.id);
    _storageService.setLastCategoryIds([deck.id]);
  }

  void _showDeckDescriptionModal(Category deck) {
    _audioEngine.lightImpact();
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
                            deck.name.toUpperCase(),
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w900,
                              fontSize: 20,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            "${deck.words.length} Cards • Single Deck Mode",
                            style: TextStyle(
                              fontSize: 12,
                              color: theme.hintColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (deck.description != null && deck.description!.isNotEmpty)
                  Text(
                    deck.description!,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      height: 1.4,
                      color: theme.textTheme.bodyMedium?.color?.withAlpha(210),
                    ),
                  ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(modalCtx).pop();
                      _selectDeck(deck);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: deckColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      "SELECT THIS DECK",
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1,
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
    _audioEngine.extraLightImpact();
    HapticFeedback.lightImpact();
    setState(() {
      _isTeamMode = isTeam;
    });
    _storageService.setTeamMode(isTeam);
  }

  void _handleStartGame() {
    final selected = _selectedDecks;
    if (selected.isEmpty) return;

    _audioEngine.extraLightImpact();

    _storageService.setLastCategoryIds([selected.first.id]);
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
        ArcadePageRoute(
          page: GameScreen(
            time: _gameDuration,
            selectedCategories: selected,
            teamMatchState: teamState,
          ),
        ),
      );
    } else {
      Navigator.of(context).push(
        ArcadePageRoute(
          page: OnboardingScreen(
            selectedCategories: selected,
            gameTime: _gameDuration,
            teamMatchState: teamState,
          ),
        ),
      );
    }
  }

  Future<void> _showExitConfirmationDialog() async {
    _audioEngine.lightImpact();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;

    final bool? shouldExit = await showDialog<bool>(
      context: context,
      barrierDismissible: true,
      builder: (dialogCtx) {
        return AlertDialog(
          backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: BorderSide(color: primaryColor.withAlpha(80), width: 2),
          ),
          title: Row(
            children: [
              Icon(Icons.exit_to_app_rounded, color: primaryColor, size: 28),
              const SizedBox(width: 10),
              Text(
                "EXIT GUESS UP?",
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                  letterSpacing: 1,
                  color: isDark ? Colors.white : Colors.black,
                ),
              ),
            ],
          ),
          content: Text(
            "Are you sure you want to close the game?",
            style: TextStyle(
              color: isDark ? Colors.white70 : Colors.black87,
              fontSize: 14,
            ),
          ),
          actions: [
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {
                      _audioEngine.lightImpact();
                      Navigator.of(dialogCtx).pop(false);
                    },
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(
                        color: primaryColor.withAlpha(100),
                        width: 1.5,
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      "CANCEL",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: isDark ? Colors.white : Colors.black,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      _audioEngine.mediumImpact();
                      Navigator.of(dialogCtx).pop(true);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: const Text(
                      "EXIT",
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 12,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );

    if (shouldExit == true) {
      SystemNavigator.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeDeck = _activeDeck;
    final activeColor = activeDeck.themeColor;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        _showExitConfirmationDialog();
      },
      child: Scaffold(
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

                // 2. SEARCH BAR (SEARCH BY TITLE OR DESCRIPTION)
                if (!_isLoading) _buildSearchBar(isDark),
                const SizedBox(height: 8),

                // 3. 2-COLUMN ARCADE CARD MATRIX SHOWCASE
                Expanded(
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
                          : _buildGridView(isDark),
                ),

                const SizedBox(height: 6),

                // 4. STICKY ACTION HUD WITH DROPDOWNS & HERO PLAY BUTTON
                _buildStickyActionHUD(isDark),

                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(bool isDark) {
    final iconColor = isDark ? Colors.amberAccent : Colors.black;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16.0, 12.0, 16.0, 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          BouncyGameButton(
            onTap: () => QuickSettingsModal.show(context),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF261F47) : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color:
                      isDark
                          ? Colors.amberAccent.withAlpha(120)
                          : Colors.black12,
                  width: 2,
                ),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black26,
                    blurRadius: 6,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: Icon(Icons.settings_outlined, size: 22, color: iconColor),
            ),
          ),

          // 3D Arcade Title Text Header
          _buildArcadeTitleText(isDark),

          // Symmetric balancing spacer
          const SizedBox(width: 44, height: 44),
        ],
      ),
    );
  }

  Widget _buildArcadeTitleText(bool isDark) {
    final glowColor =
        isDark ? Colors.amber.withAlpha(160) : Colors.amber.withAlpha(80);
    final strokeShadowColor = isDark ? const Color(0xFF0C091A) : Colors.black26;

    return Stack(
      alignment: Alignment.center,
      children: [
        // 3D Shadow Layer (Bottom Bevel Offset)
        Text(
          "GUESS UP",
          style: TextStyle(
            fontFamily: 'Manrope',
            fontSize: 28,
            fontWeight: FontWeight.w900,
            letterSpacing: 3.0,
            color: strokeShadowColor,
            shadows: [
              Shadow(
                color: strokeShadowColor,
                offset: const Offset(0, 4),
                blurRadius: 0,
              ),
              Shadow(
                color: glowColor,
                offset: const Offset(0, 2),
                blurRadius: 14,
              ),
            ],
          ),
        ),

        // Gradient Main Text Layer
        ShaderMask(
          blendMode: BlendMode.srcIn,
          shaderCallback: (bounds) {
            return LinearGradient(
              colors:
                  isDark
                      ? const [Color(0xFFFFF59D), Color(0xFFFFB300)]
                      : const [Color(0xFF0F0C1C), Color(0xFF2A2359)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ).createShader(bounds);
          },
          child: const Text(
            "GUESS UP",
            style: TextStyle(
              fontFamily: 'Manrope',
              fontSize: 28,
              fontWeight: FontWeight.w900,
              letterSpacing: 3.0,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSearchBar(bool isDark) {
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Container(
        height: 48,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1938) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color:
                isDark
                    ? Colors.white.withAlpha(30)
                    : Colors.black.withAlpha(25),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(isDark ? 60 : 15),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              Icons.search_rounded,
              color: isDark ? Colors.amberAccent : AppTheme.lightPrimaryColor,
              size: 22,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: _searchController,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
                decoration: InputDecoration(
                  hintText: "Search decks by title or description...",
                  hintStyle: TextStyle(
                    fontSize: 13,
                    color: textColor.withAlpha(120),
                  ),
                  border: InputBorder.none,
                  isDense: true,
                ),
                onChanged: (query) {
                  setState(() {
                    _searchQuery = query;
                  });
                },
              ),
            ),
            if (_searchQuery.isNotEmpty)
              GestureDetector(
                onTap: () {
                  _audioEngine.extraLightImpact();
                  _searchController.clear();
                  setState(() {
                    _searchQuery = "";
                  });
                },
                child: Icon(
                  Icons.cancel_rounded,
                  color: textColor.withAlpha(140),
                  size: 20,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCreateCustomDeckCard(bool isDark) {
    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;

    return BouncyGameButton(
      onTap: () async {
        _audioEngine.mediumImpact();
        final created = await Navigator.of(
          context,
        ).push<bool>(ArcadePageRoute(page: const CreateCustomDeckScreen()));
        if (created == true && mounted) {
          context.read<DeckCubit>().loadDecks();
        }
      },
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          gradient: LinearGradient(
            colors:
                isDark
                    ? [const Color(0xFF261F47), const Color(0xFF191430)]
                    : [Colors.white, const Color(0xFFF3F4F6)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
          border: Border.all(color: primaryColor.withAlpha(160), width: 2.5),
          boxShadow: [
            BoxShadow(
              color: isDark ? const Color(0xFF0C091A) : Colors.black45,
              offset: const Offset(0, 6),
              blurRadius: 0,
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(21),
          child: Stack(
            children: [
              // Top Gloss Highlight Strip
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: 36,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.white.withAlpha(40),
                        Colors.white.withAlpha(0),
                      ],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),

              // Center Content
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: primaryColor.withAlpha(40),
                          shape: BoxShape.circle,
                          border: Border.all(color: primaryColor, width: 2),
                        ),
                        child: Icon(
                          Icons.add_rounded,
                          size: 32,
                          color: primaryColor,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        "CREATE DECK",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          color: isDark ? Colors.white : Colors.black,
                          letterSpacing: 1.0,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "+ Custom Deck",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                          color: primaryColor,
                          letterSpacing: 0.5,
                        ),
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

  Widget _buildGridView(bool isDark) {
    final filtered = _filteredDecks;
    if (filtered.isEmpty) {
      return Center(
        child: Text(
          "No decks found",
          style: TextStyle(
            color: isDark ? Colors.white60 : Colors.black54,
            fontWeight: FontWeight.bold,
          ),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      physics: const BouncingScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.88,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: filtered.length + 1,
      itemBuilder: (context, index) {
        if (index == filtered.length) {
          return _buildCreateCustomDeckCard(isDark);
        }

        final deck = filtered[index];
        final isSelected = _selectedDeckIds.contains(deck.id);
        final deckColor = deck.themeColor;
        final gradientEnd = deck.gradientEndColor;

        return BouncyGameButton(
          onTap: () => _selectDeck(deck),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: LinearGradient(
                colors: [deckColor, gradientEnd],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              border:
                  isSelected
                      ? Border.all(color: Colors.amberAccent, width: 3.5)
                      : Border.all(
                        color: Colors.white.withAlpha(90),
                        width: 2.0,
                      ),
              boxShadow: [
                // 3D Dark Bottom Bevel Offset (Supercell Style)
                BoxShadow(
                  color: isDark ? const Color(0xFF0C091A) : Colors.black45,
                  offset: const Offset(0, 6),
                  blurRadius: 0,
                ),
                if (isSelected)
                  BoxShadow(
                    color: Colors.amberAccent.withAlpha(160),
                    blurRadius: 18,
                    spreadRadius: 1,
                  ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(21),
              child: Stack(
                children: [
                  // Top High-Gloss Highlight Reflection Strip
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 36,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.white.withAlpha(55),
                            Colors.white.withAlpha(0),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ),

                  // Top Left Selection Status Badge
                  if (isSelected)
                    Positioned(
                      top: 10,
                      left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 9,
                          vertical: 9,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withAlpha(200),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black38,
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.check_circle_rounded,
                          size: 14,
                          color: Colors.amberAccent,
                        ),
                      ),
                    ),

                  // Top Right Info Modal Button
                  Positioned(
                    top: 10,
                    right: 10,
                    child: GestureDetector(
                      onTap: () => _showDeckDescriptionModal(deck),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.black.withAlpha(130),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withAlpha(90)),
                        ),
                        child: const Icon(
                          Icons.info_outline_rounded,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  ),

                  // Center Content: Emoji, Name & Word Count
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(
                        12.0,
                        24.0,
                        12.0,
                        12.0,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            deck.icon.isNotEmpty ? deck.icon : "🎴",
                            style: const TextStyle(fontSize: 42),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            deck.name.toUpperCase(),
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 14,
                              color: Colors.white,
                              letterSpacing: 0.8,
                              shadows: [
                                Shadow(
                                  color: Colors.black87,
                                  blurRadius: 6,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.black.withAlpha(110),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: Colors.white.withAlpha(30),
                              ),
                            ),
                            child: Text(
                              "${deck.words.length} CARDS",
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 10,
                                color: Colors.white70,
                                letterSpacing: 0.5,
                              ),
                            ),
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
      },
    );
  }

  // --- STICKY ACTION HUD ---
  Widget _buildStickyActionHUD(bool isDark) {
    final primaryGlowColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final hudSurface = isDark ? const Color(0xFF1A1A1E) : Colors.white;
    final borderColor =
        isDark ? Colors.white.withAlpha(25) : Colors.black.withAlpha(20);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: hudSurface,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: borderColor, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 90 : 30),
            blurRadius: 18,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Mode Toggle + Dropdowns Row
          Row(
            children: [
              // Solo vs Team Segment Switch - Fixed flex allocation so size remains identical in both modes
              Expanded(
                flex: 4,
                child: Container(
                  height: 42,
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color:
                        isDark
                            ? const Color(0xFF26262B)
                            : const Color(0xFFEFEFEF),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: BouncyGameButton(
                          onTap: () => _switchGameMode(false),
                          child: Container(
                            decoration: BoxDecoration(
                              color:
                                  !_isTeamMode
                                      ? primaryGlowColor
                                      : Colors.transparent,
                              borderRadius: BorderRadius.circular(13),
                            ),
                            child: Center(
                              child: Text(
                                "SOLO",
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  color:
                                      !_isTeamMode
                                          ? Colors.black
                                          : (isDark
                                              ? Colors.white60
                                              : Colors.black54),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: BouncyGameButton(
                          onTap: () => _switchGameMode(true),
                          child: Container(
                            decoration: BoxDecoration(
                              color:
                                  _isTeamMode
                                      ? Colors.amber
                                      : Colors.transparent,
                              borderRadius: BorderRadius.circular(13),
                            ),
                            child: Center(
                              child: Text(
                                "TEAM",
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  color:
                                      _isTeamMode
                                          ? Colors.black
                                          : (isDark
                                              ? Colors.white60
                                              : Colors.black54),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(width: 8),

              // Other Settings (Timer & Rounds) - Takes the rest of the available space
              Expanded(
                flex: 6,
                child: Row(
                  children: [
                    // Timer Dropdown Pill
                    Expanded(
                      child: _buildDropdownPill<int>(
                        icon: Icons.timer_outlined,
                        value: _gameDuration,
                        label: "${_gameDuration}s",
                        items:
                            _timeOptions.map((sec) {
                              return DropdownMenuItem<int>(
                                value: sec,
                                child: Text("${sec}s"),
                              );
                            }).toList(),
                        onChanged: (newTime) {
                          if (newTime != null) {
                            _audioEngine.extraLightImpact();
                            setState(() => _gameDuration = newTime);
                            _storageService.setGameDuration(newTime);
                          }
                        },
                        isDark: isDark,
                      ),
                    ),

                    // Round Dropdown Pill (Team Mode Only)
                    if (_isTeamMode) ...[
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildDropdownPill<int>(
                          icon: Icons.flag_outlined,
                          value: _teamRounds,
                          label: "$_teamRounds Rds",
                          items:
                              _roundOptions.map((rounds) {
                                return DropdownMenuItem<int>(
                                  value: rounds,
                                  child: Text("$rounds Rds"),
                                );
                              }).toList(),
                          onChanged: (newRounds) {
                            if (newRounds != null) {
                              _audioEngine.extraLightImpact();
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
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Primary Hero Play CTA Button
          BouncyGameButton(
            onTap: _handleStartGame,
            child: Container(
              height: 58,
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFEA00), Color(0xFFFF9100)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: Colors.white, width: 2.5),
                boxShadow: const [
                  // Solid 3D Dark Bottom Push Bevel
                  BoxShadow(color: Color(0xFF8E4800), offset: Offset(0, 5)),
                  BoxShadow(
                    color: Colors.amberAccent,
                    blurRadius: 16,
                    spreadRadius: -2,
                    offset: Offset(0, 2),
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
                            _isTeamMode ? "PLAY TEAM BATTLE" : "PLAY SOLO",
                            style: const TextStyle(
                              color: Colors.black,
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.2,
                              shadows: [
                                Shadow(
                                  color: Colors.white70,
                                  offset: Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.all(4),
                        // decoration: const BoxDecoration(
                        //   color: Colors.black,
                        //   shape: BoxShape.circle,
                        // ),
                        child: const Icon(
                          Icons.play_arrow_rounded,
                          color: Colors.black,
                          size: 22,
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
    final textColor = isDark ? Colors.white : Colors.black;

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
            color: textColor.withAlpha(220),
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
