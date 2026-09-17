import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/widgets/bouncy_game_button.dart';

class TrendingDeckScreen extends StatefulWidget {
  final List<Category> trendingDecks;
  final Category? initialDeck;
  final int gameDuration;
  final bool isTeamMode;
  final int teamRounds;
  final Function(Category selectedDeck) onPlay;
  final VoidCallback? onDismiss;

  const TrendingDeckScreen({
    super.key,
    required this.trendingDecks,
    this.initialDeck,
    required this.gameDuration,
    required this.isTeamMode,
    required this.teamRounds,
    required this.onPlay,
    this.onDismiss,
  });

  static Future<void> show(
    BuildContext context, {
    required List<Category> trendingDecks,
    Category? initialDeck,
    required int gameDuration,
    required bool isTeamMode,
    required int teamRounds,
    required Function(Category selectedDeck) onPlay,
    VoidCallback? onDismiss,
  }) async {
    await Navigator.of(context).push(
      CupertinoPageRoute(
        builder:
            (_) => TrendingDeckScreen(
              trendingDecks: trendingDecks,
              initialDeck: initialDeck,
              gameDuration: gameDuration,
              isTeamMode: isTeamMode,
              teamRounds: teamRounds,
              onPlay: onPlay,
              onDismiss: onDismiss,
            ),
      ),
    );
  }

  @override
  State<TrendingDeckScreen> createState() => _TrendingDeckScreenState();
}

// Backwards-compatibility typedef alias
typedef TrendingDeckModal = TrendingDeckScreen;

class _TrendingDeckScreenState extends State<TrendingDeckScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  Category? _currentDeck;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _selectAndRotateDeck();
  }

  void _selectAndRotateDeck() {
    final storage = GameStorageService();
    List<Category> decks =
        widget.trendingDecks.isNotEmpty ? widget.trendingDecks : [];
    if (decks.isEmpty && widget.initialDeck != null) {
      decks = [widget.initialDeck!];
    }

    if (widget.initialDeck != null && decks.contains(widget.initialDeck)) {
      _currentDeck = widget.initialDeck;
    } else if (decks.isNotEmpty) {
      final savedIndex = storage.trendingRotationIndex;
      final selectedIndex = savedIndex % decks.length;
      _currentDeck = decks[selectedIndex];
      // Save next index so the next time app or screen is opened, it rotates to the next deck
      storage.setTrendingRotationIndex((selectedIndex + 1) % decks.length);
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_currentDeck == null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: IconButton(
            icon: const Icon(CupertinoIcons.xmark_circle_fill, color: Colors.white),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
      );
    }

    final deck = _currentDeck!;
    final primaryColor = deck.themeColor;
    final gradientEnd = deck.gradientEndColor;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors:
                deck.gradientColors.length >= 2
                    ? deck.gradientColors
                    : [primaryColor, gradientEnd, const Color(0xFF0F0B21)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Stack(
          children: [
            // Top Gloss Reflection Strip
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 160,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.white.withAlpha(60),
                      Colors.white.withAlpha(0),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),

            // Main Content Layout
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24.0,
                  vertical: 16.0,
                ),
                child: Column(
                  children: [
                    // Top Header Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withAlpha(140),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.amberAccent.withAlpha(180),
                              width: 1.5,
                            ),
                          ),
                          child: const Row(
                            children: [
                              Text("🔥 ", style: TextStyle(fontSize: 13)),
                              Text(
                                "TRENDING DECK",
                                style: TextStyle(
                                  color: Colors.amberAccent,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 11,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Close Button
                        IconButton(
                          onPressed: () {
                            GameAudioEngine().lightImpact();
                            if (widget.onDismiss != null) {
                              widget.onDismiss!();
                            }
                            Navigator.of(context).pop();
                          },
                          icon: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.black.withAlpha(120),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white.withAlpha(90),
                              ),
                            ),
                            child: const Icon(
                              CupertinoIcons.xmark_circle_fill,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        ),
                      ],
                    ),

                    const Spacer(),

                    // Animated Pulsing Deck Emoji Icon
                    AnimatedBuilder(
                      animation: _pulseController,
                      builder: (context, child) {
                        final scale = 1.0 + (_pulseController.value * 0.09);
                        return Transform.scale(scale: scale, child: child);
                      },
                      child: Container(
                        width: 140,
                        height: 140,
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(45),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 4),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(80),
                              blurRadius: 24,
                              offset: const Offset(0, 8),
                            ),
                            BoxShadow(
                              color: primaryColor.withAlpha(160),
                              blurRadius: 40,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            deck.icon.isNotEmpty ? deck.icon : "👑",
                            style: const TextStyle(fontSize: 72),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Deck Name Title
                    Text(
                      deck.name.toUpperCase(),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1.5,
                        shadows: [
                          Shadow(
                            color: Colors.black87,
                            blurRadius: 12,
                            offset: Offset(0, 4),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Words Count Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(140),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Colors.white.withAlpha(100),
                        ),
                      ),
                      child: Text(
                        "${deck.words.length} WORDS",
                        style: const TextStyle(
                          color: Colors.amberAccent,
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Deck Description Text
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                      child: Text(
                        deck.categoryDescription,
                        textAlign: TextAlign.center,
                        maxLines: 4,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withAlpha(230),
                          height: 1.4,
                          shadows: const [
                            Shadow(
                              color: Colors.black54,
                              blurRadius: 4,
                              offset: Offset(0, 1),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Mode & Settings Summary Chips
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(130),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withAlpha(50)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            widget.isTeamMode
                                ? CupertinoIcons.person_3_fill
                                : CupertinoIcons.person_fill,
                            size: 18,
                            color: Colors.amberAccent,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            widget.isTeamMode
                                ? "TEAM MODE (${widget.teamRounds} ROUNDS)"
                                : "SOLO MODE",
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(width: 16),
                          const Icon(
                            CupertinoIcons.timer_fill,
                            size: 18,
                            color: Colors.amberAccent,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            "${widget.gameDuration}s TIMER",
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const Spacer(),

                    // Primary CTA Play Button
                    BouncyGameButton(
                      onTap: () {
                        GameAudioEngine().mediumImpact();
                        Navigator.of(context).pop();
                        widget.onPlay(deck);
                      },
                      child: Container(
                        height: 60,
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
                            BoxShadow(
                              color: Color(0xFF8E4800),
                              offset: Offset(0, 6),
                            ),
                            BoxShadow(
                              color: Colors.amberAccent,
                              blurRadius: 18,
                              spreadRadius: -2,
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "PLAY THIS DECK NOW",
                              style: TextStyle(
                                color: Colors.black,
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                              ),
                            ),
                            SizedBox(width: 8),
                            Icon(
                              CupertinoIcons.play_fill,
                              color: Colors.black,
                              size: 24,
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Secondary Dismiss Button
                    TextButton(
                      onPressed: () {
                        GameAudioEngine().lightImpact();
                        if (widget.onDismiss != null) {
                          widget.onDismiss!();
                        }
                        Navigator.of(context).pop();
                      },
                      child: Text(
                        "Explore All Decks",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white.withAlpha(210),
                          decoration: TextDecoration.underline,
                          decorationColor: Colors.white.withAlpha(140),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
