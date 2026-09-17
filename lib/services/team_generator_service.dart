import 'dart:math';

class TeamData {
  final String name;
  final String emoji;

  const TeamData({required this.name, required this.emoji});
}

class TeamPair {
  final TeamData teamCyan;
  final TeamData teamMagenta;

  const TeamPair({required this.teamCyan, required this.teamMagenta});
}

class TeamGeneratorService {
  static final Random _random = Random();

  // Highlighted Hilarious Presets (including requested ones like "The Drunk Uncles")
  static const List<TeamData> _presetTeams = [
    TeamData(name: 'The Drunk Uncles', emoji: '🍻'),
    TeamData(name: 'Spicy Samosas', emoji: '🥟'),
    TeamData(name: 'Bollywood Baddies', emoji: '💃'),
    TeamData(name: 'Desi Dynamos', emoji: '🏏'),
    TeamData(name: 'Chai Chugging Champions', emoji: '☕'),
    TeamData(name: 'The Panicked Pandas', emoji: '🐼'),
    TeamData(name: 'Chaos Crew', emoji: '🌀'),
    TeamData(name: 'Trivia Titans', emoji: '👑'),
    TeamData(name: 'Brainy Badgers', emoji: '🦡'),
    TeamData(name: 'Turbo Turtles', emoji: '🐢'),
    TeamData(name: 'Salty Sloths', emoji: '🦥'),
    TeamData(name: 'Disco Ducks', emoji: '🦆'),
    TeamData(name: 'Sneaky Snails', emoji: '🐌'),
    TeamData(name: 'Mystic Monkeys', emoji: '🐒'),
    TeamData(name: 'Glitch Goats', emoji: '🐐'),
    TeamData(name: 'Poptart Pumas', emoji: '🐆'),
    TeamData(name: 'Wobbly Wombats', emoji: '🦦'),
    TeamData(name: 'Cosmic Crisps', emoji: '🪐'),
    TeamData(name: 'Neon Ninjas', emoji: '🥷'),
    TeamData(name: 'Thunder Ducks', emoji: '⚡'),
    TeamData(name: 'Cyber Sharks', emoji: '🦈'),
    TeamData(name: 'Viking Vampires', emoji: '🦇'),
    TeamData(name: 'Wild Wolves', emoji: '🐺'),
    TeamData(name: 'Pixel Pirates', emoji: '🏴‍☠️'),
    TeamData(name: 'Furious Foxes', emoji: '🦊'),
    TeamData(name: 'Chunky Chipmunks', emoji: '🐿️'),
    TeamData(name: 'Psycho Penguins', emoji: '🐧'),
    TeamData(name: 'Office Gossip Queens', emoji: '☕'),
    TeamData(name: 'Family Roasters', emoji: '🔥'),
  ];

  static const List<String> _adjectives = [
    'Panicked',
    'Chaos',
    'Trivia',
    'Brainy',
    'Turbo',
    'Salty',
    'Disco',
    'Sneaky',
    'Mystic',
    'Glitch',
    'Cosmic',
    'Neon',
    'Thunder',
    'Cyber',
    'Wild',
    'Pixel',
    'Chunky',
    'Furious',
    'Sleepy',
    'Rowdy',
    'Spicy',
    'Mega',
    'Velociraptor',
    'Bollywood',
    'Desi',
    'Drunk',
    'Masala',
    'Karisma',
    'Crazy',
  ];

  static const List<String> _nouns = [
    'Pandas',
    'Crew',
    'Titans',
    'Badgers',
    'Turtles',
    'Sloths',
    'Ducks',
    'Snails',
    'Monkeys',
    'Goats',
    'Pumas',
    'Wombats',
    'Crisps',
    'Ninjas',
    'Sharks',
    'Vampires',
    'Wolves',
    'Pirates',
    'Foxes',
    'Penguins',
    'Otters',
    'Llamas',
    'Uncles',
    'Samosas',
    'Dynamos',
    'Baddies',
    'Legends',
    'Bosses',
  ];

  static const List<String> _teamEmojis = [
    '⚡',
    '🐺',
    '🦅',
    '🦈',
    '🛡️',
    '⚔️',
    '🥊',
    '🎯',
    '🔥',
    '🐉',
    '🦁',
    '🥷',
    '👾',
    '🛸',
    '🚀',
    '💣',
    '🐼',
    '🌀',
    '👑',
    '🦡',
    '🐢',
    '🦥',
    '🦆',
    '🐌',
    '🐒',
    '🐐',
    '🐆',
    '🦦',
    '🪐',
    '🦇',
    '🏴‍☠️',
    '🦊',
    '🐿️',
    '🐧',
    '🍻',
    '🥟',
    '☕',
    '💃',
    '🏏',
  ];

  /// Generate a random team name and emoji combo
  static TeamData getRandomTeam({String? excludeName, String? excludeEmoji}) {
    // 50% chance to pick a curated preset, 50% chance to dynamically generate
    if (_random.nextBool()) {
      final availablePresets =
          _presetTeams
              .where((t) => t.name != excludeName && t.emoji != excludeEmoji)
              .toList();
      if (availablePresets.isNotEmpty) {
        return availablePresets[_random.nextInt(availablePresets.length)];
      }
    }

    String name;
    String emoji;
    int attempts = 0;
    do {
      final adj = _adjectives[_random.nextInt(_adjectives.length)];
      final noun = _nouns[_random.nextInt(_nouns.length)];
      name = '$adj $noun';
      emoji = _teamEmojis[_random.nextInt(_teamEmojis.length)];
      attempts++;
    } while ((name == excludeName || emoji == excludeEmoji) && attempts < 20);

    return TeamData(name: name, emoji: emoji);
  }

  /// Generate a pair of distinct teams for Cyan and Magenta
  static TeamPair getRandomPair() {
    final cyan = getRandomTeam();
    final magenta = getRandomTeam(
      excludeName: cyan.name,
      excludeEmoji: cyan.emoji,
    );
    return TeamPair(teamCyan: cyan, teamMagenta: magenta);
  }
}

