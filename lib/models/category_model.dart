import 'package:freezed_annotation/freezed_annotation.dart';

part 'category_model.freezed.dart';
part 'category_model.g.dart';

@freezed
class CategoryModel with _$CategoryModel {
  const factory CategoryModel({
    required String id,
    required String name,
    required String icon,
    @Default([]) List<String> words,
    String? description,
    @Default('#FFC107') String colorHex,
    String? gradientEnd,
    @Default(false) bool isTrending,
    @Default(0) int sortOrder,
    int? wordsCount,
    String? imageUrl,
    @Default(true) bool isAvailable,
    @Default(false) bool isLocked,
    String? lockReason,
    Map<String, dynamic>? theme,
    DateTime? createdAt,
    DateTime? updatedAt,
    @Default(false) bool isCustom,
  }) = _CategoryModel;

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);
}
