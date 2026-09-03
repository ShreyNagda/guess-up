// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'category_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

CategoryModel _$CategoryModelFromJson(Map<String, dynamic> json) {
  return _CategoryModel.fromJson(json);
}

/// @nodoc
mixin _$CategoryModel {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get icon => throw _privateConstructorUsedError;
  List<String> get words => throw _privateConstructorUsedError;
  String? get description => throw _privateConstructorUsedError;
  String get colorHex => throw _privateConstructorUsedError;
  String? get gradientEnd => throw _privateConstructorUsedError;
  bool get isTrending => throw _privateConstructorUsedError;
  int get sortOrder => throw _privateConstructorUsedError;
  int? get wordsCount => throw _privateConstructorUsedError;
  String? get imageUrl => throw _privateConstructorUsedError;
  bool get isAvailable => throw _privateConstructorUsedError;
  bool get isLocked => throw _privateConstructorUsedError;
  String? get lockReason => throw _privateConstructorUsedError;
  Map<String, dynamic>? get theme => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;
  bool get isCustom => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $CategoryModelCopyWith<CategoryModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CategoryModelCopyWith<$Res> {
  factory $CategoryModelCopyWith(
          CategoryModel value, $Res Function(CategoryModel) then) =
      _$CategoryModelCopyWithImpl<$Res, CategoryModel>;
  @useResult
  $Res call(
      {String id,
      String name,
      String icon,
      List<String> words,
      String? description,
      String colorHex,
      String? gradientEnd,
      bool isTrending,
      int sortOrder,
      int? wordsCount,
      String? imageUrl,
      bool isAvailable,
      bool isLocked,
      String? lockReason,
      Map<String, dynamic>? theme,
      DateTime? createdAt,
      DateTime? updatedAt,
      bool isCustom});
}

/// @nodoc
class _$CategoryModelCopyWithImpl<$Res, $Val extends CategoryModel>
    implements $CategoryModelCopyWith<$Res> {
  _$CategoryModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? icon = null,
    Object? words = null,
    Object? description = freezed,
    Object? colorHex = null,
    Object? gradientEnd = freezed,
    Object? isTrending = null,
    Object? sortOrder = null,
    Object? wordsCount = freezed,
    Object? imageUrl = freezed,
    Object? isAvailable = null,
    Object? isLocked = null,
    Object? lockReason = freezed,
    Object? theme = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? isCustom = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      icon: null == icon
          ? _value.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String,
      words: null == words
          ? _value.words
          : words // ignore: cast_nullable_to_non_nullable
              as List<String>,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      colorHex: null == colorHex
          ? _value.colorHex
          : colorHex // ignore: cast_nullable_to_non_nullable
              as String,
      gradientEnd: freezed == gradientEnd
          ? _value.gradientEnd
          : gradientEnd // ignore: cast_nullable_to_non_nullable
              as String?,
      isTrending: null == isTrending
          ? _value.isTrending
          : isTrending // ignore: cast_nullable_to_non_nullable
              as bool,
      sortOrder: null == sortOrder
          ? _value.sortOrder
          : sortOrder // ignore: cast_nullable_to_non_nullable
              as int,
      wordsCount: freezed == wordsCount
          ? _value.wordsCount
          : wordsCount // ignore: cast_nullable_to_non_nullable
              as int?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      isAvailable: null == isAvailable
          ? _value.isAvailable
          : isAvailable // ignore: cast_nullable_to_non_nullable
              as bool,
      isLocked: null == isLocked
          ? _value.isLocked
          : isLocked // ignore: cast_nullable_to_non_nullable
              as bool,
      lockReason: freezed == lockReason
          ? _value.lockReason
          : lockReason // ignore: cast_nullable_to_non_nullable
              as String?,
      theme: freezed == theme
          ? _value.theme
          : theme // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      isCustom: null == isCustom
          ? _value.isCustom
          : isCustom // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CategoryModelImplCopyWith<$Res>
    implements $CategoryModelCopyWith<$Res> {
  factory _$$CategoryModelImplCopyWith(
          _$CategoryModelImpl value, $Res Function(_$CategoryModelImpl) then) =
      __$$CategoryModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String icon,
      List<String> words,
      String? description,
      String colorHex,
      String? gradientEnd,
      bool isTrending,
      int sortOrder,
      int? wordsCount,
      String? imageUrl,
      bool isAvailable,
      bool isLocked,
      String? lockReason,
      Map<String, dynamic>? theme,
      DateTime? createdAt,
      DateTime? updatedAt,
      bool isCustom});
}

/// @nodoc
class __$$CategoryModelImplCopyWithImpl<$Res>
    extends _$CategoryModelCopyWithImpl<$Res, _$CategoryModelImpl>
    implements _$$CategoryModelImplCopyWith<$Res> {
  __$$CategoryModelImplCopyWithImpl(
      _$CategoryModelImpl _value, $Res Function(_$CategoryModelImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? icon = null,
    Object? words = null,
    Object? description = freezed,
    Object? colorHex = null,
    Object? gradientEnd = freezed,
    Object? isTrending = null,
    Object? sortOrder = null,
    Object? wordsCount = freezed,
    Object? imageUrl = freezed,
    Object? isAvailable = null,
    Object? isLocked = null,
    Object? lockReason = freezed,
    Object? theme = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
    Object? isCustom = null,
  }) {
    return _then(_$CategoryModelImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      icon: null == icon
          ? _value.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String,
      words: null == words
          ? _value._words
          : words // ignore: cast_nullable_to_non_nullable
              as List<String>,
      description: freezed == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      colorHex: null == colorHex
          ? _value.colorHex
          : colorHex // ignore: cast_nullable_to_non_nullable
              as String,
      gradientEnd: freezed == gradientEnd
          ? _value.gradientEnd
          : gradientEnd // ignore: cast_nullable_to_non_nullable
              as String?,
      isTrending: null == isTrending
          ? _value.isTrending
          : isTrending // ignore: cast_nullable_to_non_nullable
              as bool,
      sortOrder: null == sortOrder
          ? _value.sortOrder
          : sortOrder // ignore: cast_nullable_to_non_nullable
              as int,
      wordsCount: freezed == wordsCount
          ? _value.wordsCount
          : wordsCount // ignore: cast_nullable_to_non_nullable
              as int?,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      isAvailable: null == isAvailable
          ? _value.isAvailable
          : isAvailable // ignore: cast_nullable_to_non_nullable
              as bool,
      isLocked: null == isLocked
          ? _value.isLocked
          : isLocked // ignore: cast_nullable_to_non_nullable
              as bool,
      lockReason: freezed == lockReason
          ? _value.lockReason
          : lockReason // ignore: cast_nullable_to_non_nullable
              as String?,
      theme: freezed == theme
          ? _value._theme
          : theme // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      isCustom: null == isCustom
          ? _value.isCustom
          : isCustom // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CategoryModelImpl implements _CategoryModel {
  const _$CategoryModelImpl(
      {required this.id,
      required this.name,
      required this.icon,
      final List<String> words = const [],
      this.description,
      this.colorHex = '#FFC107',
      this.gradientEnd,
      this.isTrending = false,
      this.sortOrder = 0,
      this.wordsCount,
      this.imageUrl,
      this.isAvailable = true,
      this.isLocked = false,
      this.lockReason,
      final Map<String, dynamic>? theme,
      this.createdAt,
      this.updatedAt,
      this.isCustom = false})
      : _words = words,
        _theme = theme;

  factory _$CategoryModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$CategoryModelImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String icon;
  final List<String> _words;
  @override
  @JsonKey()
  List<String> get words {
    if (_words is EqualUnmodifiableListView) return _words;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_words);
  }

  @override
  final String? description;
  @override
  @JsonKey()
  final String colorHex;
  @override
  final String? gradientEnd;
  @override
  @JsonKey()
  final bool isTrending;
  @override
  @JsonKey()
  final int sortOrder;
  @override
  final int? wordsCount;
  @override
  final String? imageUrl;
  @override
  @JsonKey()
  final bool isAvailable;
  @override
  @JsonKey()
  final bool isLocked;
  @override
  final String? lockReason;
  final Map<String, dynamic>? _theme;
  @override
  Map<String, dynamic>? get theme {
    final value = _theme;
    if (value == null) return null;
    if (_theme is EqualUnmodifiableMapView) return _theme;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;
  @override
  @JsonKey()
  final bool isCustom;

  @override
  String toString() {
    return 'CategoryModel(id: $id, name: $name, icon: $icon, words: $words, description: $description, colorHex: $colorHex, gradientEnd: $gradientEnd, isTrending: $isTrending, sortOrder: $sortOrder, wordsCount: $wordsCount, imageUrl: $imageUrl, isAvailable: $isAvailable, isLocked: $isLocked, lockReason: $lockReason, theme: $theme, createdAt: $createdAt, updatedAt: $updatedAt, isCustom: $isCustom)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CategoryModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            const DeepCollectionEquality().equals(other._words, _words) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.colorHex, colorHex) ||
                other.colorHex == colorHex) &&
            (identical(other.gradientEnd, gradientEnd) ||
                other.gradientEnd == gradientEnd) &&
            (identical(other.isTrending, isTrending) ||
                other.isTrending == isTrending) &&
            (identical(other.sortOrder, sortOrder) ||
                other.sortOrder == sortOrder) &&
            (identical(other.wordsCount, wordsCount) ||
                other.wordsCount == wordsCount) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.isAvailable, isAvailable) ||
                other.isAvailable == isAvailable) &&
            (identical(other.isLocked, isLocked) ||
                other.isLocked == isLocked) &&
            (identical(other.lockReason, lockReason) ||
                other.lockReason == lockReason) &&
            const DeepCollectionEquality().equals(other._theme, _theme) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.isCustom, isCustom) ||
                other.isCustom == isCustom));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      icon,
      const DeepCollectionEquality().hash(_words),
      description,
      colorHex,
      gradientEnd,
      isTrending,
      sortOrder,
      wordsCount,
      imageUrl,
      isAvailable,
      isLocked,
      lockReason,
      const DeepCollectionEquality().hash(_theme),
      createdAt,
      updatedAt,
      isCustom);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$CategoryModelImplCopyWith<_$CategoryModelImpl> get copyWith =>
      __$$CategoryModelImplCopyWithImpl<_$CategoryModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CategoryModelImplToJson(
      this,
    );
  }
}

abstract class _CategoryModel implements CategoryModel {
  const factory _CategoryModel(
      {required final String id,
      required final String name,
      required final String icon,
      final List<String> words,
      final String? description,
      final String colorHex,
      final String? gradientEnd,
      final bool isTrending,
      final int sortOrder,
      final int? wordsCount,
      final String? imageUrl,
      final bool isAvailable,
      final bool isLocked,
      final String? lockReason,
      final Map<String, dynamic>? theme,
      final DateTime? createdAt,
      final DateTime? updatedAt,
      final bool isCustom}) = _$CategoryModelImpl;

  factory _CategoryModel.fromJson(Map<String, dynamic> json) =
      _$CategoryModelImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get icon;
  @override
  List<String> get words;
  @override
  String? get description;
  @override
  String get colorHex;
  @override
  String? get gradientEnd;
  @override
  bool get isTrending;
  @override
  int get sortOrder;
  @override
  int? get wordsCount;
  @override
  String? get imageUrl;
  @override
  bool get isAvailable;
  @override
  bool get isLocked;
  @override
  String? get lockReason;
  @override
  Map<String, dynamic>? get theme;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;
  @override
  bool get isCustom;
  @override
  @JsonKey(ignore: true)
  _$$CategoryModelImplCopyWith<_$CategoryModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
