import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';

class CreateCustomDeckScreen extends StatefulWidget {
  final Category? existingDeck;
  const CreateCustomDeckScreen({super.key, this.existingDeck});

  @override
  State<CreateCustomDeckScreen> createState() => _CreateCustomDeckScreenState();
}

class _CreateCustomDeckScreenState extends State<CreateCustomDeckScreen> {
  final StorageService _storageService = StorageService();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _wordsInputController = TextEditingController();
  final TextEditingController _customEmojiController = TextEditingController();

  String _selectedIcon = '✏️';
  String _selectedColorHex = '#FFC107';
  List<String> _words = [];

  final List<String> _emojiIcons = [
    '✏️',
    '🎉',
    '🎬',
    '🚀',
    '👑',
    '🔥',
    '💡',
    '🎵',
    '🍔',
    '⚽',
    '🐶',
    '🎮',
    '✈️',
    '🍕',
    '🍿',
    '🏆',
  ];

  final List<Map<String, String>> _colorPalettes = [
    {'name': 'Amber', 'hex': '#FFC107'},
    {'name': 'Emerald', 'hex': '#4CAF50'},
    {'name': 'Cyan', 'hex': '#00BCD4'},
    {'name': 'Purple', 'hex': '#9C27B0'},
    {'name': 'Crimson', 'hex': '#E91E63'},
    {'name': 'Orange', 'hex': '#FF5722'},
    {'name': 'Indigo', 'hex': '#3F51B5'},
    {'name': 'Teal', 'hex': '#009688'},
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
    if (widget.existingDeck != null) {
      _titleController.text = widget.existingDeck!.name;
      _selectedIcon = widget.existingDeck!.icon;
      _selectedColorHex = widget.existingDeck!.colorHex ?? '#FFC107';
      _words = List.from(widget.existingDeck!.words);
    }
    _customEmojiController.text = _selectedIcon;
  }

  @override
  void deactivate() {
    _scaffoldMessenger?.clearSnackBars();
    super.deactivate();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _wordsInputController.dispose();
    _customEmojiController.dispose();
    super.dispose();
  }

  void _addWordsFromInput() {
    final text = _wordsInputController.text.trim();
    if (text.isEmpty) return;

    final newWords =
        text
            .split(RegExp(r'[,\n]'))
            .map((w) => w.trim())
            .where((w) => w.isNotEmpty)
            .toList();

    setState(() {
      for (final word in newWords) {
        if (!_words.contains(word)) {
          _words.add(word);
        }
      }
      _wordsInputController.clear();
    });
    AudioService().extraLightImpact();
  }

  void _removeWord(String word) {
    setState(() => _words.remove(word));
    AudioService().extraLightImpact();
  }

  void _showHowToAddDecksHelpModal(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "How to Create Custom Decks 💡",
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w900,
                      color: AppTheme.darkPrimaryColor,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _buildHelpStep(
                "1. Pick a Unique Title & Icon",
                "Choose a fun emoji icon and deck title (e.g., 'Inside Jokes 👨‍👩‍👧' or 'Company Lore 💼').",
                Icons.style_rounded,
                theme,
              ),
              const SizedBox(height: 12),
              _buildHelpStep(
                "2. Add 10-30 Fun Words",
                "Type or paste words separated by commas or new lines. Keep words short (1 to 3 terms).",
                Icons.add_circle_outline_rounded,
                theme,
              ),
              const SizedBox(height: 12),
              _buildHelpStep(
                "3. Mix & Match in Game",
                "Save your deck and select it alongside official decks to play custom rounds!",
                Icons.shuffle_rounded,
                theme,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.darkPrimaryColor,
                    foregroundColor: AppTheme.darkAccentColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: const Text(
                    "GOT IT!",
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHelpStep(
    String title,
    String desc,
    IconData icon,
    ThemeData theme,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppTheme.darkPrimaryColor.withAlpha(40),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppTheme.darkPrimaryColor, size: 22),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.hintColor,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
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
          DateTime.now().millisecondsSinceEpoch.toString(),
      name: title,
      icon: _selectedIcon,
      colorHex: _selectedColorHex,
      words: _words,
    );

    await _storageService.saveCustomDeck(deck);
    if (!mounted) return;
    Navigator.of(context).pop(true);
  }

  Color _parseColor(String hex) {
    try {
      String clean = hex.replaceAll('#', '');
      if (clean.length == 6) clean = 'FF$clean';
      return Color(int.parse(clean, radix: 16));
    } catch (_) {
      return AppTheme.darkPrimaryColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primaryColor = _parseColor(_selectedColorHex);
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          widget.existingDeck == null ? "CREATE CUSTOM DECK" : "EDIT DECK",
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w900,
            letterSpacing: 1.5,
            color: primaryColor,
          ),
        ),
        actions: [
          if (widget.existingDeck != null)
            IconButton(
              icon: const Icon(
                Icons.delete_outline_rounded,
                color: Colors.redAccent,
              ),
              tooltip: "Delete Deck",
              onPressed: () async {
                final nav = Navigator.of(context);
                final bool? confirm = await showDialog<bool>(
                  context: context,
                  builder:
                      (ctx) => AlertDialog(
                        title: Text("Delete '${widget.existingDeck!.name}'?"),
                        content: const Text(
                          "Are you sure you want to delete this custom deck from your device?",
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(ctx).pop(false),
                            child: const Text("Cancel"),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.redAccent,
                            ),
                            onPressed: () => Navigator.of(ctx).pop(true),
                            child: const Text(
                              "Delete",
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                );
                if (confirm == true) {
                  await _storageService.deleteCustomDeck(
                    widget.existingDeck!.id,
                  );
                  if (!mounted) return;
                  nav.pop(true);
                }
              },
            ),
          IconButton(
            icon: const Icon(Icons.help_outline_rounded),
            tooltip: "How to Create Decks",
            onPressed: () => _showHowToAddDecksHelpModal(context),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
          child: Column(
            children: [
              Expanded(
                child: ListView(
                  physics: const BouncingScrollPhysics(),
                  children: [
                    // Deck Title Input
                    Text(
                      "DECK TITLE",
                      style: theme.textTheme.labelSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                        color: theme.hintColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _titleController,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: textColor,
                      ),
                      decoration: InputDecoration(
                        hintText: "e.g., Family Jokes, Movie Trivia...",
                        filled: true,
                        fillColor:
                            isDark ? AppTheme.darkSurfaceColor : Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(color: primaryColor),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(
                            color: primaryColor.withAlpha(100),
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Deck Icon Picker (Custom input + Presets)
                    Text(
                      "CHOOSE OR TYPE EMOJI ICON",
                      style: theme.textTheme.labelSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                        color: theme.hintColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        // Custom Emoji Direct Text Field
                        Container(
                          width: 60,
                          height: 54,
                          margin: const EdgeInsets.only(right: 12),
                          decoration: BoxDecoration(
                            color:
                                isDark
                                    ? AppTheme.darkSurfaceColor
                                    : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: primaryColor, width: 2),
                          ),
                          child: TextField(
                            controller: _customEmojiController,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 24),
                            maxLength: 2,
                            decoration: const InputDecoration(
                              counterText: "",
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.symmetric(
                                vertical: 10,
                              ),
                            ),
                            onChanged: (val) {
                              if (val.trim().isNotEmpty) {
                                setState(() {
                                  _selectedIcon = val.trim();
                                });
                              }
                            },
                          ),
                        ),

                        // Preset Emojis List
                        Expanded(
                          child: SizedBox(
                            height: 54,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: _emojiIcons.length,
                              itemBuilder: (context, index) {
                                final emoji = _emojiIcons[index];
                                final isSelected = emoji == _selectedIcon;
                                return GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _selectedIcon = emoji;
                                      _customEmojiController.text = emoji;
                                    });
                                    AudioService().extraLightImpact();
                                  },
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 150),
                                    margin: const EdgeInsets.only(right: 10),
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color:
                                          isSelected
                                              ? primaryColor.withAlpha(60)
                                              : (isDark
                                                  ? AppTheme.darkSurfaceColor
                                                  : Colors.white),
                                      borderRadius: BorderRadius.circular(14),
                                      border: Border.all(
                                        color:
                                            isSelected
                                                ? primaryColor
                                                : Colors.transparent,
                                        width: 2,
                                      ),
                                    ),
                                    child: Text(
                                      emoji,
                                      style: const TextStyle(fontSize: 24),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Color Accent Picker
                    Text(
                      "CHOOSE DECK COLOR",
                      style: theme.textTheme.labelSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                        color: theme.hintColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      height: 44,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: _colorPalettes.length,
                        itemBuilder: (context, index) {
                          final colorObj = _colorPalettes[index];
                          final hex = colorObj['hex']!;
                          final isSelected = hex == _selectedColorHex;
                          final color = _parseColor(hex);
                          return GestureDetector(
                            onTap: () {
                              setState(() => _selectedColorHex = hex);
                              AudioService().extraLightImpact();
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              margin: const EdgeInsets.only(right: 12),
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: color,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color:
                                      isSelected
                                          ? Colors.white
                                          : Colors.transparent,
                                  width: 3,
                                ),
                                boxShadow:
                                    isSelected
                                        ? [
                                          BoxShadow(
                                            color: color.withAlpha(150),
                                            blurRadius: 10,
                                            spreadRadius: 2,
                                          ),
                                        ]
                                        : [],
                              ),
                              child:
                                  isSelected
                                      ? const Icon(
                                        Icons.check,
                                        color: Colors.black,
                                        size: 20,
                                      )
                                      : null,
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Words Section Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "ADD WORDS (${_words.length})",
                          style: theme.textTheme.labelSmall?.copyWith(
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                            color: theme.hintColor,
                          ),
                        ),
                        InkWell(
                          onTap: () => _showHowToAddDecksHelpModal(context),
                          child: Text(
                            "Need Help?",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: primaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _wordsInputController,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: textColor,
                            ),
                            decoration: InputDecoration(
                              hintText: "Enter words (comma separated)...",
                              filled: true,
                              fillColor:
                                  isDark
                                      ? AppTheme.darkSurfaceColor
                                      : Colors.white,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide.none,
                              ),
                            ),
                            onSubmitted: (_) => _addWordsFromInput(),
                          ),
                        ),
                        const SizedBox(width: 10),
                        ElevatedButton(
                          onPressed: _addWordsFromInput,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            foregroundColor: AppTheme.darkAccentColor,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 16,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: const Text(
                            "ADD",
                            style: TextStyle(fontWeight: FontWeight.w900),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Word Chips List
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children:
                          _words.map((word) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: primaryColor.withAlpha(40),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: primaryColor.withAlpha(80),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    word,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: textColor,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  GestureDetector(
                                    onTap: () => _removeWord(word),
                                    child: const Icon(
                                      Icons.close,
                                      size: 16,
                                      color: Colors.redAccent,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),

              // Bottom Save CTA
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: _saveDeck,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: AppTheme.darkAccentColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    elevation: 6,
                  ),
                  child: Text(
                    widget.existingDeck == null
                        ? "SAVE CUSTOM DECK"
                        : "UPDATE DECK",
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
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
}
