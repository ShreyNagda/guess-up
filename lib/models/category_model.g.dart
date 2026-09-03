// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CategoryModelImpl _$$CategoryModelImplFromJson(Map<String, dynamic> json) =>
    _$CategoryModelImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      icon: json['icon'] as String,
      words:
          (json['words'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      description: json['description'] as String?,
      colorHex: json['colorHex'] as String? ?? '#FFC107',
      gradientEnd: json['gradientEnd'] as String?,
      isTrending: json['isTrending'] as bool? ?? false,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      wordsCount: (json['wordsCount'] as num?)?.toInt(),
      imageUrl: json['imageUrl'] as String?,
      isAvailable: json['isAvailable'] as bool? ?? true,
      isLocked: json['isLocked'] as bool? ?? false,
      lockReason: json['lockReason'] as String?,
      theme: json['theme'] as Map<String, dynamic>?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
      isCustom: json['isCustom'] as bool? ?? false,
    );

Map<String, dynamic> _$$CategoryModelImplToJson(_$CategoryModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'icon': instance.icon,
      'words': instance.words,
      'description': instance.description,
      'colorHex': instance.colorHex,
      'gradientEnd': instance.gradientEnd,
      'isTrending': instance.isTrending,
      'sortOrder': instance.sortOrder,
      'wordsCount': instance.wordsCount,
      'imageUrl': instance.imageUrl,
      'isAvailable': instance.isAvailable,
      'isLocked': instance.isLocked,
      'lockReason': instance.lockReason,
      'theme': instance.theme,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
      'isCustom': instance.isCustom,
    };
