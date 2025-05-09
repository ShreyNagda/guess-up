import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/category.dart'; // Adjust the path based on your file structure
import 'dart:math';

class CategoryService {
  final _categoryRef = FirebaseFirestore.instance.collection('categories');

  /// 🔹 Create a new category
  Future<void> addCategory(Category category) async {
    await _categoryRef.doc(category.id).set(category.toMap());
  }

  /// 🔹 Read all categories
  Future<List<Category>> getAllCategories() async {
    final snapshot = await _categoryRef.get();
    return snapshot.docs.map((doc) => Category.fromDocument(doc)).toList();
  }

  /// 🔹 Read a specific category by ID
  Future<Category?> getCategoryById(String id) async {
    final doc = await _categoryRef.doc(id).get();
    if (doc.exists) {
      return Category.fromDocument(doc);
    }
    return null;
  }

  /// 🔹 Update an existing category
  Future<void> updateCategory(Category category) async {
    await _categoryRef.doc(category.id).update(category.toMap());
  }

  /// 🔹 Delete a category and its words subcollection
  Future<void> deleteCategory(String id) async {
    // Delete all words in the subcollection
    final wordsRef = _categoryRef.doc(id).collection('words');
    final wordDocs = await wordsRef.get();
    for (var doc in wordDocs.docs) {
      await doc.reference.delete();
    }

    // Delete the category itself
    await _categoryRef.doc(id).delete();
  }

  /// 🔹 Add a word to a category
  Future<void> addWordToCategory(String categoryId, String word) async {
    final wordRef = _categoryRef.doc(categoryId).collection('words').doc();
    await wordRef.set({'text': word});
  }

  /// 🔹 Delete a word from a category
  Future<void> deleteWordFromCategory(String categoryId, String wordId) async {
    await _categoryRef.doc(categoryId).collection('words').doc(wordId).delete();
  }

  /// 🔹 Get all words from a category
  Future<List<String>> getWordsFromCategory(String categoryId) async {
    final snapshot =
        await _categoryRef.doc(categoryId).collection('words').get();
    return snapshot.docs.map((doc) => (doc.data())['text'] as String).toList();
  }

  /// 🔹 Get n random words from a category
  Future<List<String>> getRandomWords(String categoryId, int n) async {
    final allWords = await getWordsFromCategory(categoryId);
    allWords.shuffle();
    return allWords.take(n).toList();
  }

  List<String> getWordsFromSelectedCategories(
    List<Category> selectedCategories,
  ) {
    final random = Random();
    List<String> allWords = [];

    if (selectedCategories.length > 5) {
      // Combine all words from all categories
      allWords =
          selectedCategories
              .expand((category) => List<String>.from(category.words))
              .toList();
      allWords.shuffle(random);

      return allWords.take(30).toList(); // Pick any 5 words
    } else {
      for (var category in selectedCategories) {
        final words = List<String>.from(category.words);
        words.shuffle(random);
        allWords.addAll(words.take(10)); // Pick up to 10 from each
      }
      allWords.shuffle(random);

      return allWords;
    }
  }
}
