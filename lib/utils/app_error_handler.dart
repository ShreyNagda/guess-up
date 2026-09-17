import 'package:flutter/foundation.dart';

/// Centralized application error logger and handler
class AppErrorHandler {
  static void log(Object error, [StackTrace? stackTrace, String? context]) {
    final prefix = context != null ? '[$context] ' : '';
    debugPrint('⚠️ ${prefix}Error: $error');
    if (stackTrace != null && kDebugMode) {
      debugPrint('Stack trace:\n$stackTrace');
    }
  }

  static void handle(Object error, [String? context]) {
    log(error, null, context);
  }
}
