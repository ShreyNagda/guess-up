import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:guess_up/widgets/bouncy_game_button.dart';

class CreateCustomDeckScreen extends StatefulWidget {
  final Category? existingDeck;
  const CreateCustomDeckScreen({super.key, this.existingDeck});

  @override
  State<CreateCustomDeckScreen> createState() => _CreateCustomDeckScreenState();
}

class _CreateCustomDeckScreenState extends State<CreateCustomDeckScreen> {
  final GameStorageService _storageService = GameStorageService();
  final GameAudioEngine _audioEngine = GameAudioEngine();

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _wordsInputController = TextEditingController();
  final TextEditingController _customEmojiController = TextEditingController();

  String _selectedIcon = '✏️';
  String _startColorHex = '#FFC107';
  String _endColorHex = '#FF8F00';
  List<String> _words = [];

  final List<Map<String, String>> _gradientPresets = [
    {'name': 'Gold Arcade', 'start': '#FFEA00', 'end': '#FF9100'},
    {'name': 'Emerald Neon', 'start': '#00E676', 'end': '#00897B'},
    {'name': 'Cyber Cyan', 'start': '#00E5FF', 'end': '#00838F'},
    {'name': 'Cosmic Violet', 'start': '#E040FB', 'end': '#4A148C'},
    {'name': 'Crimson Blaze', 'start': '#FF1744', 'end': '#880E4F'},
    {'name': 'Sunset Orange', 'start': '#FF6D00', 'end': '#DD2C00'},
    {'name': 'Electric Indigo', 'start': '#536DFE', 'end': '#1A237E'},
    {'name': 'Midnight Dark', 'start': '#3F51B5', 'end': '#121212'},
  ];

  final List<Color> _swatchColors = const [
    Color(0xFFFFEA00),
    Color(0xFFFF9100),
    Color(0xFFFF1744),
    Color(0xFFE040FB),
    Color(0xFF7C4DFF),
    Color(0xFF536DFE),
    Color(0xFF00E5FF),
    Color(0xFF00E676),
    Color(0xFF76FF03),
    Color(0xFFFFC107),
    Color(0xFFFF5722),
    Color(0xFFE91E63),
    Color(0xFF9C27B0),
    Color(0xFF673AB7),
    Color(0xFF3F51B5),
    Color(0xFF2196F3),
    Color(0xFF03A9F4),
    Color(0xFF00BCD4),
    Color(0xFF009688),
    Color(0xFF4CAF50),
    Color(0xFF8BC34A),
    Color(0xFFCDDC39),
    Color(0xFFFFEB3B),
    Color(0xFFFF9800),
    Color(0xFF795548),
    Color(0xFF607D8B),
    Color(0xFF121212),
    Color(0xFFFFFFFF),
  ];

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    if (widget.existingDeck != null) {
      _titleController.text = widget.existingDeck!.name;
      _selectedIcon = widget.existingDeck!.icon;
      _startColorHex = widget.existingDeck!.colorHex ?? '#FFC107';
      _endColorHex =
          widget.existingDeck!.gradientEnd != null
              ? widget.existingDeck!.gradientEnd!
              : _toHex(widget.existingDeck!.gradientEndColor);
      _words = List.from(widget.existingDeck!.words);
      _wordsInputController.text = _words.join('\n');
    }
    _customEmojiController.text = _selectedIcon;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _wordsInputController.dispose();
    _customEmojiController.dispose();
    super.dispose();
  }

  String _toHex(Color color) {
    return '#${color.toARGB32().toRadixString(16).substring(2).toUpperCase()}';
  }

  Color _parseColor(String hex, Color fallback) {
    try {
      String clean = hex.replaceAll('#', '').replaceAll('0x', '');
      if (clean.length == 6) clean = 'FF$clean';
      return Color(int.parse(clean, radix: 16));
    } catch (_) {
      return fallback;
    }
  }

  void _syncWordsFromInput(String text) {
    final parsed =
        text
            .split(RegExp(r'[,\n]'))
            .map((w) => w.trim())
            .where((w) => w.isNotEmpty)
            .toList();

    setState(() {
      _words = parsed;
    });
  }

  Future<void> _saveDeck() async {
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter a deck title.")),
      );
      return;
    }

    if (_words.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please add at least 3 words to your deck."),
        ),
      );
      return;
    }

    final deck = Category(
      id:
          widget.existingDeck?.id ??
          'custom_${DateTime.now().millisecondsSinceEpoch}',
      name: title,
      icon: _selectedIcon.trim().isNotEmpty ? _selectedIcon.trim() : "🎴",
      color: _startColorHex,
      gradientEnd: _endColorHex,
      words: _words,
      isCustom: true,
    );

    await _storageService.saveCustomDeck(deck);
    if (!mounted) return;
    Navigator.of(context).pop(true);
  }

  void _openColorPickerDialog(bool isStartColor) {
    _audioEngine.lightImpact();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xFF1E1938),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          title: Text(
            isStartColor
                ? "Select Gradient Start Color"
                : "Select Gradient End Color",
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 16,
            ),
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: GridView.builder(
              shrinkWrap: true,
              itemCount: _swatchColors.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 5,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemBuilder: (context, index) {
                final color = _swatchColors[index];
                final hex = _toHex(color);
                final isSelected =
                    isStartColor
                        ? _startColorHex.toUpperCase() == hex.toUpperCase()
                        : _endColorHex.toUpperCase() == hex.toUpperCase();

                return GestureDetector(
                  onTap: () {
                    _audioEngine.extraLightImpact();
                    setState(() {
                      if (isStartColor) {
                        _startColorHex = hex;
                      } else {
                        _endColorHex = hex;
                      }
                    });
                    Navigator.of(ctx).pop();
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? Colors.white : Colors.black26,
                        width: isSelected ? 3 : 1,
                      ),
                      boxShadow: [
                        if (isSelected)
                          BoxShadow(
                            color: color.withAlpha(180),
                            blurRadius: 10,
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text(
                "CANCEL",
                style: TextStyle(color: Colors.white70),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final startColor = _parseColor(_startColorHex, const Color(0xFFFFC107));
    final endColor = _parseColor(_endColorHex, const Color(0xFFFF8F00));
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: BouncyGameButton(
          onTap: () => Navigator.of(context).pop(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF261F47) : Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: isDark ? Colors.white24 : Colors.black12,
              ),
            ),
            child: Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 18,
              color: textColor,
            ),
          ),
        ),
        title: Text(
          widget.existingDeck != null ? "EDIT DECK" : "CREATE DECK",
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w900,
            letterSpacing: 2.0,
            color: textColor,
          ),
        ),
        centerTitle: true,
      ),
      body: AmbientBackground(
        ambientColor: const Color(0xFFFFEA00),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 20.0,
              vertical: 8.0,
            ),
            child: Column(
              children: [
                Expanded(
                  child: ListView(
                    physics: const BouncingScrollPhysics(),
                    children: [
                      // 1. LIVE 3D DECK CARD PREVIEW BANNER
                      Center(
                        child: Container(
                          width: 170,
                          height: 190,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(24),
                            gradient: LinearGradient(
                              colors: [startColor, endColor],
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                            ),
                            border: Border.all(
                              color: Colors.amberAccent,
                              width: 3,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color:
                                    isDark
                                        ? const Color(0xFF0C091A)
                                        : Colors.black45,
                                offset: const Offset(0, 6),
                              ),
                              BoxShadow(
                                color: startColor.withAlpha(120),
                                blurRadius: 20,
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(21),
                            child: Stack(
                              children: [
                                Positioned(
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: 36,
                                  child: Container(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          Colors.white.withAlpha(50),
                                          Colors.white.withAlpha(0),
                                        ],
                                        begin: Alignment.topCenter,
                                        end: Alignment.bottomCenter,
                                      ),
                                    ),
                                  ),
                                ),
                                Center(
                                  child: Padding(
                                    padding: const EdgeInsets.all(12.0),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          _selectedIcon.isNotEmpty
                                              ? _selectedIcon
                                              : "🎴",
                                          style: const TextStyle(fontSize: 42),
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          _titleController.text.isNotEmpty
                                              ? _titleController.text
                                                  .toUpperCase()
                                              : "NEW DECK",
                                          textAlign: TextAlign.center,
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w900,
                                            color: Colors.white,
                                            shadows: [
                                              Shadow(
                                                color: Colors.black45,
                                                blurRadius: 4,
                                              ),
                                            ],
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
                      ),

                      const SizedBox(height: 20),

                      // 2. DECK TITLE INPUT
                      _buildInputLabel("DECK TITLE", isDark),
                      const SizedBox(height: 6),
                      _buildTextFieldContainer(
                        isDark: isDark,
                        child: TextField(
                          controller: _titleController,
                          onChanged: (_) => setState(() {}),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                          decoration: InputDecoration(
                            hintText: "e.g., Family Jokes, Movie Trivia...",
                            hintStyle: TextStyle(
                              color: textColor.withAlpha(120),
                            ),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 14,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // 3. KEYBOARD EMOJI INPUT
                      _buildInputLabel(
                        "DECK EMOJI ICON (SINGLE EMOJI)",
                        isDark,
                      ),
                      const SizedBox(height: 6),
                      _buildTextFieldContainer(
                        isDark: isDark,
                        child: Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _customEmojiController,
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: textColor,
                                ),
                                decoration: InputDecoration(
                                  hintText: "Type any emoji from keyboard...",
                                  hintStyle: TextStyle(
                                    fontSize: 13,
                                    color: textColor.withAlpha(120),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 14,
                                  ),
                                  border: InputBorder.none,
                                  counterText: "",
                                ),
                                maxLength: 1,
                                maxLengthEnforcement:
                                    MaxLengthEnforcement.enforced,
                                onChanged: (val) {
                                  if (val.trim().isNotEmpty) {
                                    setState(() {
                                      _selectedIcon = val.trim();
                                    });
                                  }
                                },
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 18),

                      // 4. GRADIENT COLOR PICKER & PRESETS
                      _buildInputLabel("DECK GRADIENT COLORS", isDark),
                      const SizedBox(height: 6),

                      // Start & End Custom Pickers Row
                      Row(
                        children: [
                          Expanded(
                            child: BouncyGameButton(
                              onTap: () => _openColorPickerDialog(true),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color:
                                      isDark
                                          ? const Color(0xFF1E1938)
                                          : Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color:
                                        isDark
                                            ? Colors.white24
                                            : Colors.black12,
                                    width: 1.5,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 24,
                                      height: 24,
                                      decoration: BoxDecoration(
                                        color: startColor,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            "START COLOR",
                                            style: TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.w900,
                                              color: textColor.withAlpha(140),
                                            ),
                                          ),
                                          Text(
                                            _startColorHex,
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w900,
                                              color: textColor,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: BouncyGameButton(
                              onTap: () => _openColorPickerDialog(false),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color:
                                      isDark
                                          ? const Color(0xFF1E1938)
                                          : Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color:
                                        isDark
                                            ? Colors.white24
                                            : Colors.black12,
                                    width: 1.5,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 24,
                                      height: 24,
                                      decoration: BoxDecoration(
                                        color: endColor,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            "END COLOR",
                                            style: TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.w900,
                                              color: textColor.withAlpha(140),
                                            ),
                                          ),
                                          Text(
                                            _endColorHex,
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w900,
                                              color: textColor,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 10),

                      // Curated Gradient Presets Swatches
                      SizedBox(
                        height: 48,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          itemCount: _gradientPresets.length,
                          itemBuilder: (context, index) {
                            final preset = _gradientPresets[index];
                            final pStart = _parseColor(
                              preset['start']!,
                              Colors.amber,
                            );
                            final pEnd = _parseColor(
                              preset['end']!,
                              Colors.orange,
                            );
                            final isSelected =
                                _startColorHex == preset['start'] &&
                                _endColorHex == preset['end'];

                            return GestureDetector(
                              onTap: () {
                                _audioEngine.extraLightImpact();
                                setState(() {
                                  _startColorHex = preset['start']!;
                                  _endColorHex = preset['end']!;
                                });
                              },
                              child: Container(
                                margin: const EdgeInsets.only(right: 8),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [pStart, pEnd],
                                  ),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color:
                                        isSelected
                                            ? Colors.white
                                            : Colors.transparent,
                                    width: isSelected ? 2.5 : 0,
                                  ),
                                  boxShadow: [
                                    if (isSelected)
                                      BoxShadow(
                                        color: pStart.withAlpha(180),
                                        blurRadius: 10,
                                      ),
                                  ],
                                ),
                                child: Center(
                                  child: Text(
                                    preset['name']!,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.white,
                                      shadows: [
                                        Shadow(
                                          color: Colors.black45,
                                          blurRadius: 4,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                      const SizedBox(height: 18),

                      // 5. WORDS LIST INPUT (MULTI-LINE TEXT BOX)
                      _buildInputLabel(
                        "DECK WORDS (ENTER WORDS SEPARATED BY NEWLINE OR COMMA)",
                        isDark,
                      ),
                      const SizedBox(height: 6),
                      _buildTextFieldContainer(
                        isDark: isDark,
                        child: TextField(
                          controller: _wordsInputController,
                          minLines: 5,
                          maxLines: 10,
                          keyboardType: TextInputType.multiline,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: textColor,
                            fontSize: 14,
                          ),
                          decoration: InputDecoration(
                            hintText:
                                "Type or paste words here...\n\ne.g.,\nBatman\nSuperman\nIronman",
                            hintStyle: TextStyle(
                              fontSize: 13,
                              color: textColor.withAlpha(120),
                            ),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.all(16),
                          ),
                          onChanged: _syncWordsFromInput,
                        ),
                      ),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),

                // Save Action Button
                BouncyGameButton(
                  onTap: _saveDeck,
                  child: Container(
                    height: 54,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFFEA00), Color(0xFFFF9100)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white, width: 2.5),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0xFF8E4800),
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        "SAVE DECK",
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInputLabel(String label, bool isDark) {
    return Text(
      label,
      style: TextStyle(
        fontWeight: FontWeight.w900,
        fontSize: 10,
        letterSpacing: 1.2,
        color: isDark ? Colors.white60 : Colors.black54,
      ),
    );
  }

  Widget _buildTextFieldContainer({
    required bool isDark,
    required Widget child,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1938) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark ? Colors.white24 : Colors.black12,
          width: 1.5,
        ),
      ),
      child: child,
    );
  }
}
