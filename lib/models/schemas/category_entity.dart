import 'package:hive/hive.dart';
import 'package:guess_up/models/category.dart';

part 'category_entity.g.dart';

@HiveType(typeId: 1)
class CategoryEntity extends HiveObject {
  @HiveField(0)
  late String id;

  @HiveField(1)
  late String name;

  @HiveField(2)
  late String icon;

  @HiveField(3)
  late List<String> words;

  @HiveField(4)
  late String? description;

  @HiveField(5)
  late String? color;

  @HiveField(6)
  late String? gradientEnd;

  @HiveField(7)
  late bool isTrending;

  @HiveField(8)
  late int sortOrder;

  @HiveField(9)
  late bool isAvailable;

  @HiveField(10)
  late bool isCustom;

  @HiveField(11)
  late List<String>? gradient;

  CategoryEntity({
    required this.id,
    required this.name,
    required this.icon,
    required this.words,
    this.description,
    this.color = '#FFC107',
    this.gradientEnd,
    this.gradient,
    this.isTrending = false,
    this.sortOrder = 0,
    this.isAvailable = true,
    this.isCustom = false,
  });

  Category toCategory() {
    return Category(
      id: id,
      name: name,
      icon: icon,
      words: words,
      description: description,
      gradient: gradient ??
          [
            if (color != null && color!.isNotEmpty) color!,
            if (gradientEnd != null && gradientEnd!.isNotEmpty) gradientEnd!,
          ],
      isTrending: isTrending,
      sortOrder: sortOrder,
      isAvailable: isAvailable,
    );
  }

  factory CategoryEntity.fromCategory(Category category) {
    return CategoryEntity(
      id: category.id,
      name: category.name,
      icon: category.icon,
      words: category.words,
      description: category.description,
      gradient: category.gradient,
      color: category.mainColorHex,
      gradientEnd: category.gradientEndColorHex,
      isTrending: category.isTrending,
      sortOrder: category.sortOrder,
      isAvailable: category.isAvailable,
      isCustom: category.isCustom,
    );
  }
}
