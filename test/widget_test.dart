import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:guess_up/screens/home_screen.dart';

void main() {
  testWidgets('Home screen smoke test', (WidgetTester tester) async {
    // Build our HomeScreen and trigger a frame.
    await tester.pumpWidget(
      const MaterialApp(
        home: HomeScreen(),
      ),
    );

    // Verify that the title text is found.
    expect(find.text("GUESS\nUP"), findsOneWidget);
    expect(find.text("PLAY NOW"), findsOneWidget);
  });
}
