import 'package:flutter/material.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/bouncy_game_button.dart';

class TeamCustomizationModal extends StatefulWidget {
  final String currentCyanName;
  final String currentCyanEmoji;
  final String currentMagentaName;
  final String currentMagentaEmoji;
  final Function(
    String cyanName,
    String cyanEmoji,
    String magentaName,
    String magentaEmoji,
  )
  onSave;

  const TeamCustomizationModal({
    super.key,
    required this.currentCyanName,
    required this.currentCyanEmoji,
    required this.currentMagentaName,
    required this.currentMagentaEmoji,
    required this.onSave,
  });

  static Future<void> show(
    BuildContext context, {
    required String currentCyanName,
    required String currentCyanEmoji,
    required String currentMagentaName,
    required String currentMagentaEmoji,
    required Function(
      String cyanName,
      String cyanEmoji,
      String magentaName,
      String magentaEmoji,
    )
    onSave,
  }) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder:
          (context) => Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: TeamCustomizationModal(
              currentCyanName: currentCyanName,
              currentCyanEmoji: currentCyanEmoji,
              currentMagentaName: currentMagentaName,
              currentMagentaEmoji: currentMagentaEmoji,
              onSave: onSave,
            ),
          ),
    );
  }

  @override
  State<TeamCustomizationModal> createState() => _TeamCustomizationModalState();
}

class _TeamCustomizationModalState extends State<TeamCustomizationModal> {
  late TextEditingController _cyanNameController;
  late TextEditingController _magentaNameController;

  late String _selectedCyanEmoji;
  late String _selectedMagentaEmoji;

  // Unique Team Avatar Emojis reserved specifically for Team Avatars
  static const List<String> _cyanEmojiOptions = [
    '⚡',
    '🐺',
    '🦅',
    '🦈',
    '🛡️',
    '⚔️',
    '🥊',
    '🎯',
  ];
  static const List<String> _magentaEmojiOptions = [
    '🔥',
    '🐉',
    '🦁',
    '🥷',
    '👾',
    '🛸',
    '🚀',
    '💣',
  ];

  @override
  void initState() {
    super.initState();
    _cyanNameController = TextEditingController(text: widget.currentCyanName);
    _magentaNameController = TextEditingController(
      text: widget.currentMagentaName,
    );
    _selectedCyanEmoji = widget.currentCyanEmoji;
    _selectedMagentaEmoji = widget.currentMagentaEmoji;
  }

  @override
  void dispose() {
    _cyanNameController.dispose();
    _magentaNameController.dispose();
    super.dispose();
  }

  void _handleSave() {
    final cyanName =
        _cyanNameController.text.trim().isEmpty
            ? 'Team Cyan'
            : _cyanNameController.text.trim();
    final magentaName =
        _magentaNameController.text.trim().isEmpty
            ? 'Team Magenta'
            : _magentaNameController.text.trim();

    final storage = GameStorageService();
    storage.setTeamCyanName(cyanName);
    storage.setTeamCyanEmoji(_selectedCyanEmoji);
    storage.setTeamMagentaName(magentaName);
    storage.setTeamMagentaEmoji(_selectedMagentaEmoji);

    widget.onSave(
      cyanName,
      _selectedCyanEmoji,
      magentaName,
      _selectedMagentaEmoji,
    );
    GameAudioEngine().lightImpact();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF141927) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 150 : 50),
            blurRadius: 30,
            spreadRadius: 5,
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handle indicator
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.withAlpha(100),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.darkPrimaryColor.withAlpha(40),
                    shape: BoxShape.circle,
                  ),
                  child: const Text('⚔️', style: TextStyle(fontSize: 24)),
                ),
                const SizedBox(width: 12),
                Text(
                  'Customize Teams',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : AppTheme.lightTextColor,
                    fontFamily: 'Manrope',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // --- Team 1 (Cyan Team) Section ---
            _buildTeamSection(
              title: 'Team 1 (Cyan)',
              color: AppTheme.teamAColor,
              nameController: _cyanNameController,
              selectedEmoji: _selectedCyanEmoji,
              emojiOptions: _cyanEmojiOptions,
              onEmojiSelected: (emoji) {
                setState(() => _selectedCyanEmoji = emoji);
                GameAudioEngine().extraLightImpact();
              },
              isDark: isDark,
            ),

            const SizedBox(height: 20),

            // --- Team 2 (Magenta Team) Section ---
            _buildTeamSection(
              title: 'Team 2 (Magenta)',
              color: AppTheme.teamBColor,
              nameController: _magentaNameController,
              selectedEmoji: _selectedMagentaEmoji,
              emojiOptions: _magentaEmojiOptions,
              onEmojiSelected: (emoji) {
                setState(() => _selectedMagentaEmoji = emoji);
                GameAudioEngine().extraLightImpact();
              },
              isDark: isDark,
            ),

            const SizedBox(height: 28),

            // Save Button
            BouncyGameButton(
              onTap: _handleSave,
              child: Container(
                height: 56,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppTheme.darkPrimaryColor,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0xFFCCAC00),
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: const Text(
                  'SAVE TEAM NAMES ⚡',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: Colors.black,
                    letterSpacing: 0.5,
                    fontFamily: 'Manrope',
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildTeamSection({
    required String title,
    required Color color,
    required TextEditingController nameController,
    required String selectedEmoji,
    required List<String> emojiOptions,
    required Function(String) onEmojiSelected,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withAlpha(isDark ? 25 : 15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(100), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: color,
                  fontFamily: 'Manrope',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Team Name Input
          TextField(
            controller: nameController,
            style: TextStyle(
              color: isDark ? Colors.white : AppTheme.lightTextColor,
              fontWeight: FontWeight.w700,
              fontSize: 16,
            ),
            decoration: InputDecoration(
              hintText: 'Enter Team Name',
              hintStyle: TextStyle(
                color: isDark ? Colors.grey[500] : Colors.grey[400],
              ),
              prefixIcon: Padding(
                padding: const EdgeInsets.all(12),
                child: Text(selectedEmoji, style: const TextStyle(fontSize: 20)),
              ),
              filled: true,
              fillColor:
                  isDark ? const Color(0xFF1E2538) : Colors.grey.shade100,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 14,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: color, width: 2),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Emoji Avatar Grid
          const Text(
            'SELECT TEAM AVATAR EMOJI',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Colors.grey,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children:
                emojiOptions.map((emoji) {
                  final isSelected = emoji == selectedEmoji;
                  return GestureDetector(
                    onTap: () => onEmojiSelected(emoji),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color:
                            isSelected
                                ? color.withAlpha(60)
                                : (isDark
                                    ? const Color(0xFF1E2538)
                                    : Colors.white),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? color : Colors.transparent,
                          width: 2,
                        ),
                        boxShadow:
                            isSelected
                                ? [
                                  BoxShadow(
                                    color: color.withAlpha(100),
                                    blurRadius: 8,
                                  ),
                                ]
                                : [],
                      ),
                      child: Text(emoji, style: const TextStyle(fontSize: 22)),
                    ),
                  );
                }).toList(),
          ),
        ],
      ),
    );
  }
}
