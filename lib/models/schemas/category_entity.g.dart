// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_entity.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class CategoryEntityAdapter extends TypeAdapter<CategoryEntity> {
  @override
  final int typeId = 1;

  @override
  CategoryEntity read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CategoryEntity(
      id: fields[0] as String,
      name: fields[1] as String,
      icon: fields[2] as String,
      words: (fields[3] as List).cast<String>(),
      description: fields[4] as String?,
      color: fields[5] as String?,
      gradientEnd: fields[6] as String?,
      isTrending: fields[7] as bool,
      sortOrder: fields[8] as int,
      isAvailable: fields[9] as bool,
      isCustom: fields[10] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, CategoryEntity obj) {
    writer
      ..writeByte(11)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.icon)
      ..writeByte(3)
      ..write(obj.words)
      ..writeByte(4)
      ..write(obj.description)
      ..writeByte(5)
      ..write(obj.color)
      ..writeByte(6)
      ..write(obj.gradientEnd)
      ..writeByte(7)
      ..write(obj.isTrending)
      ..writeByte(8)
      ..write(obj.sortOrder)
      ..writeByte(9)
      ..write(obj.isAvailable)
      ..writeByte(10)
      ..write(obj.isCustom);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CategoryEntityAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
